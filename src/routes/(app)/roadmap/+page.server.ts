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

  // Enriched data: Nest materials into modules and extract titles
  const enrichedModules = (modules as any[]).map(mod => {
    const modProgress = (progress as any[]).find(p => p.module_id === mod.id);
    const isModuleUnlocked = modProgress?.is_unlocked || false;
    const currentMaterialId = modProgress?.current_material_id;

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

    return {
      ...mod,
      materials: moduleMaterials,
      is_unlocked: isModuleUnlocked
    };
  });

  return {
    hasRole: true,
    roleName: activeRoadmap.role_name as string,
    modules: enrichedModules,
    userId: userId
  };
};
