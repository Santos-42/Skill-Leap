<script lang="ts">
  import { sidebar } from "$lib/state/sidebar.svelte";
  import AIChat from "$lib/components/AIChat.svelte";
  import { ChevronRight, BarChart, Award, Search, Plus } from "lucide-svelte";
  import { fade, slide } from "svelte/transition";

  let { data } = $props();

  let showAllEvaluations = $state(false);

  const hasRoadmaps = $derived(
    data.roadmapProgress && data.roadmapProgress.length > 0,
  );
  const mainEvaluations = $derived(
    showAllEvaluations ? data.evaluations : data.evaluations.slice(0, 1),
  );

  function parseFeedback(raw: string): string {
    try {
      const parsed = JSON.parse(raw);
      return parsed.feedback || parsed.strengths || Object.values(parsed).join(', ');
    } catch {
      return raw;
    }
  }
</script>

<div class="space-y-10">
  <!-- Welcome Header -->
  <div class="flex justify-between items-end">
    <div>
      <h2 class="text-4xl font-bold text-blue-600">Dashboard</h2>
      <p class="text-gray-500 mt-2">
        Selamat datang kembali, <span class="text-blue-600 font-semibold"
          >{data.user?.name}</span
        >. Mari lanjutkan Skill Leap Anda!
      </p>
    </div>
  </div>

  {#if !hasRoadmaps}
    <!-- Empty State (No Roadmap) -->
    <div
      transition:fade
      class="bg-white rounded-[2.5rem] border-2 border-dashed border-gray-200 min-h-[400px] flex flex-col items-center justify-center p-10 text-center"
    >
      <div
        class="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mb-6"
      >
        <Search class="text-blue-600" size={32} />
      </div>
      <h3 class="text-2xl font-bold text-gray-800 mb-3">
        Your Skill Leap is Quiet...
      </h3>
      <p class="text-gray-500 max-w-md mb-8">
        Anda belum memiliki roadmap aktif. Mulailah perjalanan belajar Anda
        dengan membuat roadmap pertama bersama AI Mentor kami.
      </p>

      <a
        href="/roadmap"
        class="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-2xl font-bold transition-all shadow-lg shadow-blue-100 flex items-center space-x-2"
      >
        <Plus size={20} />
        <span>Create First Course</span>
      </a>
    </div>
  {:else}
    <!-- Content State (Has Roadmap) -->
    <div
      class="flex flex-col gap-8"
    >
      <!-- Roadmap Progress Section -->
      <section
        class="bg-white rounded-[2.5rem] p-8 border border-gray-100 shadow-sm flex flex-col h-full"
      >
        <div class="flex items-center justify-between mb-8">
          <div class="flex items-center space-x-3">
            <div class="p-2 bg-blue-50 text-blue-600 rounded-xl">
              <BarChart size={24} />
            </div>
            <h3 class="text-xl font-bold text-gray-800">Roadmap Progress</h3>
          </div>
          <span
            class="text-[10px] font-bold text-gray-400 uppercase tracking-widest bg-gray-50 px-3 py-1 rounded-full"
            >{data.roadmapProgress.length} Roadmap Aktif</span
          >
        </div>

        <div class="space-y-6 flex-1">
          {#each data.roadmapProgress as roadmap}
            {@const total = roadmap.total_materials + roadmap.total_quizzes}
            {@const completed =
              (roadmap.completed_checkpoints || 0) +
              (roadmap.completed_quizzes || 0)}
            {@const pct =
              total > 0
                ? Math.min(100, Math.round((completed / total) * 100))
                : 0}
            <div
              class="group bg-gray-50/50 hover:bg-blue-50/30 p-6 rounded-[2rem] border border-transparent hover:border-blue-100 transition-all duration-300"
            >
              <div class="flex justify-between items-start mb-4">
                <div>
                  <h4
                    class="font-bold text-gray-800 group-hover:text-blue-600 transition-colors"
                  >
                    {roadmap.role_name}
                  </h4>
                  <p class="text-xs text-gray-500 mt-1">
                    Sedang di: <span class="font-semibold text-gray-700"
                      >{roadmap.current_module || "Memulai..."}</span
                    >
                  </p>
                </div>
                <a
                  href="/roadmap"
                  class="p-2 bg-white rounded-full text-gray-400 group-hover:text-blue-600 group-hover:shadow-md transition-all"
                >
                  <ChevronRight size={20} />
                </a>
              </div>

              <div class="space-y-2">
                <div
                  class="flex justify-between text-[10px] font-bold uppercase tracking-wider text-gray-400"
                >
                  <span>Progress</span>
                  <span>{pct}%</span>
                </div>
                <div class="h-3 bg-gray-100 rounded-full overflow-hidden p-0.5">
                  <div
                    class="h-full bg-blue-600 rounded-full transition-all duration-1000 ease-out shadow-[0_0_8px_rgba(37,99,235,0.4)]"
                    style="width: {pct}%"
                  ></div>
                </div>
                <div class="flex justify-between text-[10px] text-gray-400">
                  <span>{completed} dari {total} selesai (materi + kuis)</span>
                  <span
                    class="font-bold {roadmap.status === 'active'
                      ? 'text-blue-600'
                      : 'text-green-600'}">{roadmap.status.toUpperCase()}</span
                  >
                </div>
              </div>
            </div>
          {/each}
        </div>
      </section>

      <!-- Evaluation Score Section -->
      <section
        class="bg-white rounded-[2.5rem] p-8 border border-gray-100 shadow-sm flex flex-col h-full"
      >
        <div class="flex items-center justify-between mb-8">
          <div class="flex items-center space-x-3">
            <div class="p-2 bg-orange-50 text-orange-600 rounded-xl">
              <Award size={24} />
            </div>
            <h3 class="text-xl font-bold text-gray-800">Evaluation Score</h3>
          </div>
        </div>

        {#if data.evaluations.length === 0}
          <div
            class="flex-1 flex flex-col items-center justify-center text-center p-10 bg-gray-50/50 rounded-[2rem] border border-dashed border-gray-200"
          >
            <div
              class="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mb-4 shadow-sm opacity-50"
            >
              <Award class="text-gray-300" size={32} />
            </div>
            <div class="text-2xl font-bold text-gray-300 mb-2">N/A</div>
            <p class="text-gray-400 text-sm">
              Belum ada evaluasi yang dilakukan.
            </p>
          </div>
        {:else}
          <div class="space-y-6 flex-1">
            {#each mainEvaluations as evaluation}
              <div
                transition:slide
                class="bg-white border border-gray-100 p-6 rounded-[2rem] shadow-sm relative overflow-hidden group"
              >
                <div
                  class="absolute top-0 right-0 w-24 h-24 bg-blue-50 rounded-full -mr-12 -mt-12 opacity-50 group-hover:scale-110 transition-transform"
                ></div>

                <div
                  class="flex justify-between items-center mb-4 relative z-10"
                >
                  <div>
                    <h4 class="font-bold text-gray-800">
                      {evaluation.module_name}
                    </h4>
                    <p class="text-xs text-gray-500 font-medium">
                      {evaluation.role_name}
                    </p>
                  </div>
                  <div class="flex flex-col items-end">
                    <div class="text-3xl font-black text-blue-600 leading-none">
                      {evaluation.ai_score}
                    </div>
                    <div
                      class="mt-1 text-[10px] font-black px-3 py-1 rounded-full {evaluation.ai_decision ===
                      'PASS'
                        ? 'bg-green-100 text-green-700'
                        : 'bg-red-100 text-red-700'}"
                    >
                      {evaluation.ai_decision}
                    </div>
                  </div>
                </div>

                <div
                  class="bg-gray-50 rounded-2xl p-4 text-xs italic text-gray-600 leading-relaxed relative z-10 border border-gray-100"
                >
                  "{parseFeedback(evaluation.ai_feedback)}"
                </div>

                <div
                  class="mt-4 text-[9px] text-gray-400 font-bold uppercase tracking-widest flex justify-end"
                >
                  Divalidasi pada {new Date(
                    evaluation.created_at,
                  ).toLocaleDateString()}
                </div>
              </div>
            {/each}

            {#if data.evaluations.length > 1}
              <button
                class="w-full py-4 text-xs font-black uppercase tracking-widest text-blue-600 hover:bg-blue-50 rounded-[2rem] transition-all border-2 border-blue-100 border-dashed"
                onclick={() => (showAllEvaluations = !showAllEvaluations)}
              >
                {showAllEvaluations
                  ? "Tampilkan Lebih Sedikit"
                  : `Lihat Semua (${data.evaluations.length})`}
              </button>
            {/if}
          </div>
        {/if}
      </section>
    </div>
  {/if}
</div>

<AIChat hasActiveRoadmap={hasRoadmaps} />
