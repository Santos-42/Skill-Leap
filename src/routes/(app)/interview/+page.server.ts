import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals, platform }) => {
  const userId = locals.user?.id;

  // 1. Fetch user's active role from user_roadmaps
  const activeRole = await platform!.env.DB.prepare(
    `SELECT r.id, r.role_name 
     FROM user_roadmaps ur 
     JOIN roadmaps r ON ur.roadmap_id = r.id 
     WHERE ur.user_id = ? AND ur.status = 'active' 
     LIMIT 1`
  ).bind(userId).first();

  // 2. Fetch all modules for the active roadmap
  const { results: modules } = await platform!.env.DB.prepare(
    'SELECT id, module_name, module_order, roadmap_id FROM modules WHERE roadmap_id = ? ORDER BY module_order'
  ).bind(activeRole?.id).all();

  // 3. Fetch user progress
  const { results: userProgress } = await platform!.env.DB.prepare(
    'SELECT module_id, is_unlocked FROM user_module_progress WHERE user_id = ?'
  )
    .bind(userId)
    .all();

  return {
    activeRole: activeRole as { id: string; role_name: string } | null,
    modules: modules as Array<{ id: string; module_name: string; module_order: number; roadmap_id: string }>,
    userProgress: userProgress as Array<{ module_id: string; is_unlocked: boolean }>
  };
};
