import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals, platform }) => {
  const userId = locals.user?.id;
  
  if (!userId) return { hasRole: false };

  // 1. Fetch user's active roadmap
  const activeRoadmap = await platform!.env.DB.prepare(
    `SELECT ur.roadmap_id, r.role_name 
     FROM user_roadmaps ur 
     JOIN roadmaps r ON ur.roadmap_id = r.id 
     WHERE ur.user_id = ? AND ur.status = 'active' 
     LIMIT 1`
  )
    .bind(userId)
    .first();

  if (!activeRoadmap) return { hasRole: false };

  // 2. Fetch all modules for this roadmap
  const { results: modules } = await platform!.env.DB.prepare(
    'SELECT id, module_name, module_order FROM modules WHERE roadmap_id = ? ORDER BY module_order'
  )
    .bind(activeRoadmap.roadmap_id)
    .all();

  // 3. Fetch all materials for these modules
  const { results: allMaterials } = await platform!.env.DB.prepare(
    `SELECT m.id, m.content_text, m.module_id, m.material_order 
     FROM materials m 
     JOIN modules mod ON m.module_id = mod.id 
     WHERE mod.roadmap_id = ? 
     ORDER BY mod.module_order, m.material_order`
  )
    .bind(activeRoadmap.roadmap_id)
    .all();

  // 4. Fetch user progress
  const { results: progress } = await platform!.env.DB.prepare(
    'SELECT module_id, is_unlocked, current_material_id FROM user_module_progress WHERE user_id = ?'
  )
    .bind(userId)
    .all();

  // 5. Fetch quiz results for all modules
  const { results: quizResults } = await platform!.env.DB.prepare(
    'SELECT module_id, passed, score FROM quiz_results WHERE user_id = ?'
  )
    .bind(userId)
    .all();

  // 5c. Fetch latest passed quiz attempt IDs for review links
  const { results: latestQuizAttempts } = await platform!.env.DB.prepare(
    `SELECT qa.module_id, qa.id as attempt_id
     FROM quiz_attempts qa
     WHERE qa.user_id = ? AND qa.status = 'passed'
     AND qa.id = (
       SELECT qa2.id FROM quiz_attempts qa2 
       WHERE qa2.user_id = qa.user_id AND qa2.module_id = qa.module_id 
       ORDER BY qa2.submitted_at DESC LIMIT 1
     )`
  ).bind(userId).all();

  const quizAttemptMap = new Map<string, string>();
  (latestQuizAttempts as any[]).forEach(qa => quizAttemptMap.set(qa.module_id, qa.attempt_id));

  // 5b. Fetch all passed checkpoints
  const { results: allCheckpoints } = await platform!.env.DB.prepare(
    `SELECT DISTINCT material_id, module_id FROM checkpoint_attempts 
     WHERE user_id = ? AND status = 'passed'`
  ).bind(userId).all();

  const checkpointPassedMap = new Map<string, Set<string>>();
  (allCheckpoints as any[]).forEach(cp => {
    if (!checkpointPassedMap.has(cp.module_id)) {
      checkpointPassedMap.set(cp.module_id, new Set());
    }
    checkpointPassedMap.get(cp.module_id)!.add(cp.material_id);
  });

  // Enriched data: Nest materials into modules and extract titles
  // Build lookup for quiz results of PREVIOUS module
  const quizPassedMap = new Map<string, boolean>();
  (quizResults as any[]).forEach(qr => quizPassedMap.set(qr.module_id, qr.passed));

  const enrichedModules = (modules as any[]).map((mod, idx) => {
    const modProgress = (progress as any[]).find(p => p.module_id === mod.id);
    const isModuleUnlocked = modProgress?.is_unlocked || false;
    const currentMaterialId = modProgress?.current_material_id;

    // Determine lock reason: if not unlocked and previous module exists, check quiz
    let lockReason = '';
    if (!isModuleUnlocked && idx > 0) {
      const prevModule = (modules as any[])[idx - 1];
      const prevQuizPassed = quizPassedMap.get(prevModule.id) || false;
      if (!prevQuizPassed) {
        lockReason = 'Lulus kuis Modul sebelumnya untuk membuka';
      }
    }

    const moduleMaterials = (allMaterials as any[])
      .filter(mat => mat.module_id === mod.id)
      .map(mat => {
        // Extract first line or first sentence as title
        const firstLine = mat.content_text?.split('\n')[0] || 'Untitled Material';
        const title = firstLine.split('. ')[0].replace(/[\[\]]/g, '').trim();
        
        // Material is unlocked if:
        // 1. Module is unlocked AND
        // 2. Either no specific material progress yet (default to first material) OR its order <= current material's order
        let is_locked = true;
        if (isModuleUnlocked) {
          if (!currentMaterialId) {
            // If module is unlocked but no current_material_id set, only the first material (order 1) is unlocked
            is_locked = mat.material_order !== 1;
          } else {
            // Find current material to get its order
            const currentMat = (allMaterials as any[]).find(m => m.id === currentMaterialId);
            is_locked = mat.material_order > (currentMat?.material_order || 0);
          }
        }

        return { ...mat, title, is_locked };
      });

    // Determine if all materials in this module are unlocked (none locked)
    const allUnlocked = moduleMaterials.every(m => !m.is_locked);
    const quizResult = (quizResults as any[])?.find(qr => qr.module_id === mod.id);

    // Checkpoint status: all materials must have a passed checkpoint
    const passedCheckpointCount = checkpointPassedMap.get(mod.id)?.size || 0;
    const totalMaterialsInModule = moduleMaterials.length;
    const allCheckpointsPassed = passedCheckpointCount >= totalMaterialsInModule;

    return {
      ...mod,
      materials: moduleMaterials,
      is_unlocked: isModuleUnlocked,
      allMaterialsUnlocked: allUnlocked,
      quizPassed: quizResult?.passed || false,
      quizScore: quizResult?.score || null,
      lockReason,
      allCheckpointsPassed,
      quizAttemptId: quizAttemptMap.get(mod.id) || null
    };
  });

  return {
    hasRole: true,
    roleName: activeRoadmap.role_name as string,
    modules: enrichedModules,
    userId: userId
  };
};
