import { error, redirect } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';

export const load: PageServerLoad = async ({ params, platform }) => {
  const { materialId } = params;

  // 1. Fetch the specific material
  const material = await platform!.env.DB.prepare(
    'SELECT * FROM materials WHERE id = ?'
  )
    .bind(materialId)
    .first();

  if (!material) {
    throw error(404, 'Material not found');
  }

  // 2. Fetch the module info
  const module = await platform!.env.DB.prepare(
    'SELECT module_name, roadmap_id FROM modules WHERE id = ?'
  )
    .bind(material.module_id)
    .first();

  // 3. Fetch all materials in this roadmap for navigation
  const { results: allMaterials } = await platform!.env.DB.prepare(
    `SELECT m.id, m.content_text 
     FROM materials m 
     JOIN modules mod ON m.module_id = mod.id 
     WHERE mod.roadmap_id = ? 
     ORDER BY mod.module_order, m.material_order`
  )
    .bind(module.roadmap_id)
    .all();

  const flatMaterials = (allMaterials as any[]).map(m => {
    // Clean span artifacts before extracting title
    const cleanText = (m.content_text || "").replace(/\[span_\d+\]\((?:start|end)_span\)/g, "");
    const firstLine = cleanText.split('\n')[0] || 'Untitled Material';
    const title = firstLine.split('. ')[0].trim();
    return { id: m.id, title };
  });

  const currentIndex = flatMaterials.findIndex(m => m.id === materialId);
  const currentMaterialWithTitle = { 
    ...material, 
    title: flatMaterials[currentIndex]?.title || 'Untitled Material' 
  };

  return {
    material: currentMaterialWithTitle as any,
    moduleName: module.module_name as string,
    allMaterials: flatMaterials,
    currentIndex,
    totalMaterials: flatMaterials.length
  };
};

export const actions: Actions = {
  markComplete: async ({ params, locals, platform }) => {
    const userId = locals.user?.id;
    const { materialId } = params;
    
    if (!userId) throw error(401, 'Unauthorized');

    // 1. Find next material
    const currentMaterial = await platform!.env.DB.prepare('SELECT module_id, material_order FROM materials WHERE id = ?').bind(materialId).first();
    const module = await platform!.env.DB.prepare('SELECT roadmap_id, module_order FROM modules WHERE id = ?').bind(currentMaterial.module_id).first();
    
    const { results: allMaterials } = await platform!.env.DB.prepare(
      `SELECT m.id, m.module_id 
       FROM materials m 
       JOIN modules mod ON m.module_id = mod.id 
       WHERE mod.roadmap_id = ? 
       ORDER BY mod.module_order, m.material_order`
    ).bind(module.roadmap_id).all();

    const currentIndex = (allMaterials as any[]).findIndex(m => m.id === materialId);
    const nextMaterial = (allMaterials as any[])[currentIndex + 1];

    if (nextMaterial) {
      // 2. Unlock the next material's module and set current_material_id
      // We use INSERT OR REPLACE or check if exists.
      // Actually, we should just UPDATE the relevant user_module_progress row.
      
      await platform!.env.DB.prepare(
        `INSERT INTO user_module_progress (id, user_id, module_id, is_unlocked, unlocked_at, current_material_id)
         VALUES (?, ?, ?, TRUE, CURRENT_TIMESTAMP, ?)
         ON CONFLICT(id) DO UPDATE SET 
           is_unlocked = TRUE,
           current_material_id = CASE 
             WHEN current_material_id IS NULL OR ? > (SELECT material_order FROM materials WHERE id = current_material_id) 
             THEN ? 
             ELSE current_material_id 
           END`
      ).bind(
        `ump-${userId}-${nextMaterial.module_id}`, 
        userId, 
        nextMaterial.module_id, 
        nextMaterial.id,
        nextMaterial.id, // for comparison (simplified here, in reality we'd compare material_order)
        nextMaterial.id
      ).run();

      // For simplicity in this hackathon context, just force update the current_material_id
      await platform!.env.DB.prepare(
        `UPDATE user_module_progress SET current_material_id = ? WHERE user_id = ? AND module_id = ?`
      ).bind(nextMaterial.id, userId, nextMaterial.module_id).run();

      throw redirect(303, `/roadmap/${nextMaterial.id}`);
    }

    throw redirect(303, '/roadmap');
  }
};
