import { json } from '@sveltejs/kit';
import { env } from '$env/dynamic/private';
import type { RequestHandler } from './$types';

const COOLDOWN_MINUTES = 5;
const QUIZ_DURATION_MINUTES = 15;
const PASSING_SCORE = 70;
const NUM_QUESTIONS = 10;

export const POST: RequestHandler = async ({ request, platform, locals }) => {
  const userId = locals.user?.id;
  if (!userId) return json({ error: 'Unauthorized' }, { status: 401 });

  const { moduleId } = await request.json();
  if (!moduleId) return json({ error: 'moduleId is required' }, { status: 400 });

  const db = platform!.env.DB;
  const apiKey = env.Deepseek_Evaluator;
  if (!apiKey) return json({ error: 'DeepSeek API key not configured' }, { status: 500 });

  // 1. Check cooldown: any failed attempt within cooldown period
  const recentFailed = await db.prepare(
    `SELECT failed_at FROM quiz_attempts 
     WHERE user_id = ? AND module_id = ? AND status = 'failed'
     ORDER BY failed_at DESC LIMIT 1`
  ).bind(userId, moduleId).first();

  if (recentFailed) {
    const cooldownEnd = new Date((recentFailed as any).failed_at);
    cooldownEnd.setMinutes(cooldownEnd.getMinutes() + COOLDOWN_MINUTES);
    if (new Date() < cooldownEnd) {
      const remaining = Math.ceil((cooldownEnd.getTime() - Date.now()) / 1000);
      return json({ error: 'Cooldown aktif', cooldown_remaining: remaining }, { status: 429 });
    }
  }

  // 2. Check for ready (pre-generated) attempt
  const readyAttempt = await db.prepare(
    `SELECT id, questions_data, attempt_number FROM quiz_attempts 
     WHERE user_id = ? AND module_id = ? AND status = 'ready'
     ORDER BY created_at DESC LIMIT 1`
  ).bind(userId, moduleId).first();

  if (readyAttempt) {
    const expiresAt = new Date(Date.now() + QUIZ_DURATION_MINUTES * 60 * 1000).toISOString();
    await db.prepare(
      `UPDATE quiz_attempts SET status = 'active', expires_at = ? WHERE id = ?`
    ).bind(expiresAt, (readyAttempt as any).id).run();

    const questions = JSON.parse((readyAttempt as any).questions_data);
    const safeQuestions = questions.map((q: any) => ({
      question: q.question,
      options: q.options
    }));
    return json({
      attemptId: (readyAttempt as any).id,
      questions: safeQuestions,
      expiresAt,
      attemptNumber: (readyAttempt as any).attempt_number
    });
  }

  // 3. Check for active (unexpired) attempt - reuse if exists
  const activeAttempt = await db.prepare(
    `SELECT id, questions_data, expires_at FROM quiz_attempts 
     WHERE user_id = ? AND module_id = ? AND status = 'active' AND datetime(expires_at) > datetime('now')
     ORDER BY created_at DESC LIMIT 1`
  ).bind(userId, moduleId).first();

  if (activeAttempt) {
    const questions = JSON.parse((activeAttempt as any).questions_data);
    const safeQuestions = questions.map((q: any) => ({
      question: q.question,
      options: q.options
    }));
    return json({
      attemptId: (activeAttempt as any).id,
      questions: safeQuestions,
      expiresAt: (activeAttempt as any).expires_at,
      reused: true
    });
  }

  // 3. Get module name and materials for context
  const module = await db.prepare('SELECT module_name FROM modules WHERE id = ?').bind(moduleId).first();
  if (!module) return json({ error: 'Module not found' }, { status: 404 });

  const { results: materials } = await db.prepare(
    'SELECT content_text FROM materials WHERE module_id = ? ORDER BY material_order'
  ).bind(moduleId).all();

  const materialText = (materials as any[]).map(m => m.content_text || '').join('\n\n');

  // 4. Get history of previous questions to avoid repeats
  const { results: prevAttempts } = await db.prepare(
    `SELECT questions_data FROM quiz_attempts 
     WHERE user_id = ? AND module_id = ? 
     ORDER BY attempt_number DESC LIMIT 3`
  ).bind(userId, moduleId).all();

  let previousQuestions = '';
  if (prevAttempts && prevAttempts.length > 0) {
    const prevQs = (prevAttempts as any[]).flatMap(a => {
      try { return JSON.parse(a.questions_data).map((q: any) => q.question); } catch { return []; }
    });
    previousQuestions = `\nSoal-soal dari attempt sebelumnya (JANGAN diulang):\n${prevQs.join('\n')}`;
  }

  // 5. Get attempt number
  const lastAttempt = await db.prepare(
    'SELECT MAX(attempt_number) as max_attempt FROM quiz_attempts WHERE user_id = ? AND module_id = ?'
  ).bind(userId, moduleId).first();
  const attemptNumber = ((lastAttempt as any)?.max_attempt || 0) + 1;

  // 6. Generate questions via AI with retry for valid JSON
  const moduleName = (module as any).module_name;
  const prompt = `Anda adalah pembuat soal ujian profesional untuk materi "${moduleName}".

Berdasarkan materi berikut:
${materialText.substring(0, 6000)}
${previousQuestions}

Buatlah ${NUM_QUESTIONS} soal pilihan ganda yang MENGUJI PEMAHAMAN (bukan hafalan).
Setiap soal harus memiliki 4 opsi (A, B, C, D) dan 1 jawaban benar.
Soal harus berbeda dari soal-soal sebelumnya yang tercantum di atas.
Gunakan Bahasa Indonesia.

Format output HARUS JSON valid dengan struktur persis:
{
  "questions": [
    {
      "question": "teks pertanyaan",
      "options": ["A. opsi1", "B. opsi2", "C. opsi3", "D. opsi4"],
      "correct_index": 0
    }
  ]
}`;

  let questionsData: any = null;
  let retryCount = 0;
  const maxRetries = 2;

  while (retryCount <= maxRetries) {
    try {
      const response = await fetch('https://api.deepseek.com/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: 'deepseek-v4-flash',
          messages: [{ role: 'user', content: prompt }],
          response_format: { type: 'json_object' },
          temperature: 0.8
        })
      });

      const data = await response.json();
      const parsed = JSON.parse(data.choices[0].message.content);

      if (!parsed.questions || !Array.isArray(parsed.questions)) {
        throw new Error('Invalid questions structure');
      }

      if (parsed.questions.length !== NUM_QUESTIONS) {
        throw new Error(`Expected ${NUM_QUESTIONS} questions, got ${parsed.questions.length}`);
      }

      const valid = parsed.questions.every((q: any) =>
        q.question && Array.isArray(q.options) && q.options.length === 4 &&
        typeof q.correct_index === 'number' && q.correct_index >= 0 && q.correct_index <= 3
      );

      if (!valid) throw new Error('Question validation failed');

      questionsData = parsed.questions;
      break;
    } catch (err: any) {
      retryCount++;
      if (retryCount > maxRetries) {
        return json({ error: 'Gagal generate soal. Silakan coba lagi.', details: err.message }, { status: 500 });
      }
    }
  }

  // 7. Create attempt in DB
  const attemptId = crypto.randomUUID();
  const expiresAt = new Date(Date.now() + QUIZ_DURATION_MINUTES * 60 * 1000).toISOString();

  await db.prepare(
    `INSERT INTO quiz_attempts (id, user_id, module_id, attempt_number, questions_data, status, expires_at)
     VALUES (?, ?, ?, ?, ?, 'active', ?)`
  ).bind(attemptId, userId, moduleId, attemptNumber, JSON.stringify(questionsData), expiresAt).run();

  // 8. Return questions WITHOUT correct_index
  const safeQuestions = questionsData.map((q: any) => ({
    question: q.question,
    options: q.options
  }));

  return json({
    attemptId,
    questions: safeQuestions,
    expiresAt,
    attemptNumber
  });
};
