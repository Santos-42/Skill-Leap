import { json } from '@sveltejs/kit';
import { env } from '$env/dynamic/private';
import type { RequestHandler } from './$types';
import { preGenerateEvaluation } from '$lib/server/pregenerate';

const EVALUATION_COOLDOWN_MINUTES = 5;

export const POST: RequestHandler = async ({ request, platform, locals }) => {
  const userId = locals.user?.id;
  if (!userId) return json({ error: 'Unauthorized' }, { status: 401 });

  const { action, roleId, roleName, completedModules, caseStudy, question, answer } = await request.json();

  const apiKey = env.Deepseek_Evaluator;
  if (!apiKey) return json({ error: 'DeepSeek API key not configured' }, { status: 500 });

  const db = platform!.env.DB;

  try {
    if (action === 'generate') {
      // Get user roadmap
      const userRoadmap = await db.prepare(
        "SELECT id, roadmap_id FROM user_roadmaps WHERE user_id = ? AND status = 'active' LIMIT 1"
      ).bind(userId).first();

      if (!userRoadmap) throw new Error("Roadmap aktif tidak ditemukan");

      // Check cooldown: last FAIL evaluation
      const recentFailed = await db.prepare(
        `SELECT evaluations.created_at FROM evaluations
         JOIN user_roadmaps ur ON evaluations.user_roadmap_id = ur.id
         WHERE ur.user_id = ? AND evaluations.ai_decision = 'FAIL'
         ORDER BY evaluations.created_at DESC LIMIT 1`
      ).bind(userId).first();

      if (recentFailed) {
        const cooldownEnd = new Date((recentFailed as any).created_at);
        cooldownEnd.setMinutes(cooldownEnd.getMinutes() + EVALUATION_COOLDOWN_MINUTES);
        if (new Date() < cooldownEnd) {
          const remaining = Math.ceil((cooldownEnd.getTime() - Date.now()) / 1000);
          return json({ error: 'Cooldown aktif', cooldown_remaining: remaining }, { status: 429 });
        }
      }

      // Check for pre-generated evaluation
      const preGen = await db.prepare(
        `SELECT id, case_study, question FROM evaluation_pregenerated 
         WHERE user_id = ? AND status = 'ready'
         ORDER BY created_at DESC LIMIT 1`
      ).bind(userId).first();

      if (preGen) {
        await db.prepare(
          `UPDATE evaluation_pregenerated SET status = 'used' WHERE id = ?`
        ).bind((preGen as any).id).run();

        return json({
          caseStudy: (preGen as any).case_study,
          question: (preGen as any).question
        });
      }

      // Fallback: generate on-demand with retry
      let parsed: any = null;
      let retryCount = 0;
      const maxRetries = 2;

      const prompt = `Anda adalah evaluator profesional untuk posisi ${roleName}.
Kandidat telah mempelajari modul-modul berikut: ${completedModules || 'Fondasi dasar'}.
Buatlah 1 skenario mini case / use case realistis yang relevan dengan posisi tersebut.
Skenario harus cukup detail untuk menguji pemahaman kandidat secara praktis.
Di akhir skenario, berikan 1 pertanyaan esai spesifik yang meminta kandidat menjelaskan solusi atau pendekatannya.
Format output HARUS berupa JSON valid dengan struktur: { "caseStudy": "...", "question": "..." }`;

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
              response_format: { type: 'json_object' }
            })
          });

          const data = await response.json();
          if (!data.choices?.[0]?.message?.content) {
            throw new Error('Respons AI tidak valid');
          }

          parsed = JSON.parse(data.choices[0].message.content);
          if (!parsed.caseStudy || !parsed.question) {
            throw new Error('Format respons tidak sesuai');
          }
          break;
        } catch (err: any) {
          retryCount++;
          if (retryCount > maxRetries) {
            console.error('DeepSeek generate evaluation failed after retries:', err.message);
            return json({ error: 'Gagal generate evaluasi: ' + (err.message || 'silakan coba lagi') }, { status: 502 });
          }
          await new Promise(r => setTimeout(r, 1000));
        }
      }

      return json(parsed);

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

      let evaluation: any = null;
      let retryCountEval = 0;
      const maxRetriesEval = 2;

      while (retryCountEval <= maxRetriesEval) {
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
              response_format: { type: 'json_object' }
            })
          });

          const data = await response.json();
          if (!data.choices?.[0]?.message?.content) {
            throw new Error('Respons AI tidak valid');
          }

          evaluation = JSON.parse(data.choices[0].message.content);
          if (typeof evaluation.score !== 'number' || !evaluation.decision) {
            throw new Error('Format respons tidak sesuai');
          }
          break;
        } catch (err: any) {
          retryCountEval++;
          if (retryCountEval > maxRetriesEval) {
            console.error('DeepSeek evaluate failed after retries:', err.message);
            return json({ error: 'Gagal evaluasi: ' + (err.message || 'silakan coba lagi') }, { status: 502 });
          }
          await new Promise(r => setTimeout(r, 1000));
        }
      }

      // 1. Get user_roadmap_id
      const userRoadmap = await db.prepare(
        "SELECT id, roadmap_id FROM user_roadmaps WHERE user_id = ? AND status = 'active' LIMIT 1"
      )
        .bind(userId)
        .first();

      if (!userRoadmap) throw new Error("Roadmap aktif tidak ditemukan");

      // 2. Get first module_id for this roadmap to associate the evaluation
      const firstModule = await db.prepare(
        "SELECT id FROM modules WHERE roadmap_id = ? ORDER BY module_order LIMIT 1"
      )
        .bind(roleId)
        .first();

      if (!firstModule) throw new Error("Modul tidak ditemukan");

      // 3. Save to D1
      await db.prepare(
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

      // 4. Pre-generate new case study if failed
      if (evaluation.decision !== 'PASS') {
        const completedMods = completedModules || 'Fondasi dasar';
        platform!.context.waitUntil(
          preGenerateEvaluation(db, apiKey, userId, (userRoadmap as any).roadmap_id, roleName, completedMods)
        );
      }

      return json({
        ...evaluation,
        cooldownRemaining: evaluation.decision !== 'PASS' ? EVALUATION_COOLDOWN_MINUTES * 60 : 0
      });
    }

    return json({ error: 'Invalid action' }, { status: 400 });
  } catch (err: any) {
    console.error('Evaluation API Error:', err.message, err.stack, {
      action,
      roleName,
      userId,
      hasCaseStudy: !!caseStudy,
      hasQuestion: !!question,
      answerLength: answer?.length
    });
    return json({ error: 'Gagal memproses evaluasi', details: err.message }, { status: 500 });
  }
};
