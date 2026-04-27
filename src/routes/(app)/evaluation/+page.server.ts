import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals, platform }) => {
  const userId = locals.user?.id;
  if (!userId) return { activeRole: null, pastEvaluations: [] };

  // 1. Fetch user's active role
  const activeRole = await platform!.env.DB.prepare(
    `SELECT r.id, r.role_name, ur.roadmap_id 
     FROM user_roadmaps ur 
     JOIN roadmaps r ON ur.roadmap_id = r.id 
     WHERE ur.user_id = ? AND ur.status = 'active' 
     LIMIT 1`
  )
    .bind(userId)
    .first();

  // 2. Fetch completed modules for context
  let completedModules = '';
  if (activeRole) {
    const { results: modules } = await platform!.env.DB.prepare(
      `SELECT m.module_name 
       FROM user_module_progress ump
       JOIN modules m ON ump.module_id = m.id
       WHERE ump.user_id = ? AND ump.is_unlocked = 1 AND m.roadmap_id = ?`
    )
      .bind(userId, activeRole.roadmap_id)
      .all();
    
    completedModules = (modules as any[]).map(m => m.module_name).join(', ');
  }

  // 3. Fetch past evaluations
  const { results: pastEvaluations } = await platform!.env.DB.prepare(
    `SELECT e.* 
     FROM evaluations e
     JOIN user_roadmaps ur ON e.user_roadmap_id = ur.id
     WHERE ur.user_id = ? 
     ORDER BY e.created_at DESC`
  )
    .bind(userId)
    .all();

  return {
    activeRole: activeRole as { id: string; role_name: string; roadmap_id: string } | null,
    completedModules,
    pastEvaluations: pastEvaluations.map((e: any) => {
      const feedback = JSON.parse(e.ai_feedback || '{}');
      const transcript = JSON.parse(e.transcript_data || '{}');
      return {
        ...e,
        score: e.ai_score,
        questions: transcript.question || 'Evaluation',
        feedback_json: {
          decision: e.ai_decision,
          ...feedback
        }
      };
    })
  };
};
