import { error, redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params, locals, platform }) => {
  const userId = locals.user?.id;
  if (!userId) throw redirect(303, '/login');

  const { moduleId } = params;
  const db = platform!.env.DB;

  // 1. Fetch module info
  const module = await db.prepare(
    'SELECT id, module_name, roadmap_id, module_order FROM modules WHERE id = ?'
  ).bind(moduleId).first();

  if (!module) throw error(404, 'Modul tidak ditemukan');

  // 2. Check if user has access to this module
  const progress = await db.prepare(
    'SELECT is_unlocked, current_material_id FROM user_module_progress WHERE user_id = ? AND module_id = ?'
  ).bind(userId, moduleId).first();

  if (!progress || !(progress as any).is_unlocked) {
    throw redirect(303, '/roadmap');
  }

  // 3. Check quiz status
  const quizResult = await db.prepare(
    'SELECT passed, score, id FROM quiz_results WHERE user_id = ? AND module_id = ?'
  ).bind(userId, moduleId).first();

  // 4. Get total materials count for this module
  const { results: materials } = await db.prepare(
    'SELECT id, material_order FROM materials WHERE module_id = ? ORDER BY material_order'
  ).bind(moduleId).all();

  const allMaterials = materials as any[];
  const lastMaterial = allMaterials[allMaterials.length - 1];

  // 5. Guard: all checkpoints must be passed
  const { results: passedCheckpoints } = await db.prepare(
    `SELECT DISTINCT material_id FROM checkpoint_attempts 
     WHERE user_id = ? AND module_id = ? AND status = 'passed'`
  ).bind(userId, moduleId).all();

  if ((passedCheckpoints as any[]).length < allMaterials.length) {
    throw redirect(303, '/roadmap');
  }

  // 6. Find next module's first material for "Continue to Next Material" button
  let nextModuleFirstMaterialId: string | null = null;
  let nextModuleId: string | null = null;
  const mod = module as any;
  const nextModule = await db.prepare(
    'SELECT id FROM modules WHERE roadmap_id = ? AND module_order = ?'
  ).bind(mod.roadmap_id, mod.module_order + 1).first();

  if (nextModule) {
    nextModuleId = (nextModule as any).id;
    const firstMat = await db.prepare(
      'SELECT id FROM materials WHERE module_id = ? ORDER BY material_order LIMIT 1'
    ).bind(nextModuleId).first();
    if (firstMat) {
      nextModuleFirstMaterialId = (firstMat as any).id;
    }
  }

  // 7. Get most recent quiz attempt ID (any status) for review links
  const latestAttempt = await db.prepare(
    `SELECT id FROM quiz_attempts 
     WHERE user_id = ? AND module_id = ? AND status IN ('passed', 'failed')
     ORDER BY submitted_at DESC LIMIT 1`
  ).bind(userId, moduleId).first();

  return {
    moduleId,
    moduleName: (module as any).module_name,
    roadmapId: (module as any).roadmap_id,
    alreadyPassed: quizResult ? (quizResult as any).passed : false,
    score: quizResult ? (quizResult as any).score : null,
    lastMaterialId: lastMaterial?.id || null,
    totalMaterials: allMaterials.length,
    nextModuleFirstMaterialId,
    latestAttemptId: latestAttempt ? (latestAttempt as any).id : null
  };
};
