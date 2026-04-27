import { json } from '@sveltejs/kit';
import { env } from '$env/dynamic/private';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ request, platform, locals }) => {
  const userId = locals.user?.id;
  if (!userId) return json({ error: 'Unauthorized' }, { status: 401 });

  const { action, roleId, roleName, completedModules, caseStudy, question, answer } = await request.json();

  const apiKey = env.Deepseek_Evaluator;
  if (!apiKey) return json({ error: 'DeepSeek API key not configured' }, { status: 500 });

  try {
    if (action === 'generate') {
      const prompt = `Anda adalah evaluator profesional untuk posisi ${roleName}.
Kandidat telah mempelajari modul-modul berikut: ${completedModules || 'Fondasi dasar'}.
Buatlah 1 skenario mini case / use case realistis yang relevan dengan posisi tersebut.
Skenario harus cukup detail untuk menguji pemahaman kandidat secara praktis.
Di akhir skenario, berikan 1 pertanyaan esai spesifik yang meminta kandidat menjelaskan solusi atau pendekatannya.
Format output HARUS berupa JSON valid dengan struktur: { "caseStudy": "...", "question": "..." }`;

      const response = await fetch('https://api.deepseek.com/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: 'deepseek-chat',
          messages: [{ role: 'user', content: prompt }],
          response_format: { type: 'json_object' }
        })
      });

      const data = await response.json();
      return json(JSON.parse(data.choices[0].message.content));

    } else if (action === 'evaluate') {
      const prompt = `Anda adalah evaluator profesional untuk posisi ${roleName}.
Skenario Case Study: ${caseStudy}
Pertanyaan: ${question}
Jawaban Kandidat: ${answer}

Evaluasi jawaban tersebut secara mendalam. Berikan skor angka (0-100), keputusan (PASS/FAIL), feedback umum, poin-poin kekuatan, dan area perbaikan.
Kriteria PASS jika skor >= 70.
Format output HARUS berupa JSON valid dengan struktur:
{
  "score": 85,
  "decision": "PASS",
  "feedback": "...",
  "strengths": "...",
  "improvements": "..."
}`;

      const response = await fetch('https://api.deepseek.com/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: 'deepseek-chat',
          messages: [{ role: 'user', content: prompt }],
          response_format: { type: 'json_object' }
        })
      });

      const data = await response.json();
      const evaluation = JSON.parse(data.choices[0].message.content);

      // 1. Get user_roadmap_id
      const userRoadmap = await platform!.env.DB.prepare(
        "SELECT id FROM user_roadmaps WHERE user_id = ? AND status = 'active' LIMIT 1"
      )
        .bind(userId)
        .first();

      if (!userRoadmap) throw new Error("Roadmap aktif tidak ditemukan");

      // 2. Get first module_id for this roadmap to associate the evaluation
      const firstModule = await platform!.env.DB.prepare(
        "SELECT id FROM modules WHERE roadmap_id = ? ORDER BY module_order LIMIT 1"
      )
        .bind(roleId)
        .first();

      if (!firstModule) throw new Error("Modul tidak ditemukan");

      // 3. Save to D1
      await platform!.env.DB.prepare(
        `INSERT INTO evaluations (id, user_roadmap_id, module_id, user_answer, ai_score, ai_decision, ai_feedback, transcript_data, created_at) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
      )
        .bind(
          crypto.randomUUID(),
          userRoadmap.id,
          firstModule.id,
          answer,
          evaluation.score,
          evaluation.decision,
          JSON.stringify({ 
            feedback: evaluation.feedback, 
            strengths: evaluation.strengths, 
            improvements: evaluation.improvements 
          }),
          JSON.stringify({ 
            caseStudy, 
            question 
          }),
          new Date().toISOString()
        )
        .run();

      return json(evaluation);
    }

    return json({ error: 'Invalid action' }, { status: 400 });
  } catch (err: any) {
    console.error('DeepSeek API Error:', err);
    return json({ error: 'Failed to process evaluation', details: err.message }, { status: 500 });
  }
};
