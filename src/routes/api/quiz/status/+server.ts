import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

const COOLDOWN_MINUTES = 5;

export const GET: RequestHandler = async ({ url, platform, locals }) => {
  const userId = locals.user?.id;
  if (!userId) return json({ error: 'Unauthorized' }, { status: 401 });

  const moduleId = url.searchParams.get('moduleId');
  if (!moduleId) return json({ error: 'moduleId is required' }, { status: 400 });

  const db = platform!.env.DB;

  // Check if module has been passed (quiz result exists)
  const quizResult = await db.prepare(
    'SELECT passed, score FROM quiz_results WHERE user_id = ? AND module_id = ?'
  ).bind(userId, moduleId).first();

  // Check for active attempt
  const activeAttempt = await db.prepare(
    `SELECT id, expires_at, attempt_number FROM quiz_attempts 
     WHERE user_id = ? AND module_id = ? AND status = 'active' AND datetime(expires_at) > datetime('now')
     ORDER BY created_at DESC LIMIT 1`
  ).bind(userId, moduleId).first();

  // Check cooldown
  const recentFailed = await db.prepare(
    `SELECT failed_at FROM quiz_attempts 
     WHERE user_id = ? AND module_id = ? AND status = 'failed'
     ORDER BY failed_at DESC LIMIT 1`
  ).bind(userId, moduleId).first();

  let cooldownRemaining = 0;
  if (recentFailed) {
    const cooldownEnd = new Date((recentFailed as any).failed_at);
    cooldownEnd.setMinutes(cooldownEnd.getMinutes() + COOLDOWN_MINUTES);
    if (new Date() < cooldownEnd) {
      cooldownRemaining = Math.ceil((cooldownEnd.getTime() - Date.now()) / 1000);
    }
  }

  return json({
    passed: quizResult ? (quizResult as any).passed : false,
    score: quizResult ? (quizResult as any).score : null,
    hasActiveAttempt: !!activeAttempt,
    activeAttempt: activeAttempt ? {
      id: (activeAttempt as any).id,
      expiresAt: (activeAttempt as any).expires_at,
      attemptNumber: (activeAttempt as any).attempt_number
    } : null,
    cooldownRemaining
  });
};
