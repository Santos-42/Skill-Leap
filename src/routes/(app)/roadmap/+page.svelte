<script lang="ts">
  import AIChat from "$lib/components/AIChat.svelte";
  import { onMount } from "svelte";
  import { Sparkles, ArrowRight, BookOpen, Compass, Play, Lock } from "lucide-svelte";
  import { fade, slide, scale } from "svelte/transition";

  let { data } = $props();
  let chatOpen = $state(false);
  let expandedModuleId = $state<string | null>(null);

  onMount(() => {
    if (!data.hasRole) {
      // Auto open chat if user has no role
      setTimeout(() => {
        chatOpen = true;
      }, 1000);
    }
  });
</script>

<div class="space-y-8">
  <h2 class="text-4xl font-bold text-blue-600">Roadmap</h2>

  {#if !data.hasRole}
    <!-- Invitation State -->
    <div
      transition:fade
      class="bg-white rounded-[2.5rem] p-8 border border-gray-100 shadow-xl shadow-blue-50/50 flex flex-col items-center justify-center text-center w-full min-h-[calc(100vh-12rem)] mt-2 relative overflow-hidden"
    >
      <!-- Decorative Background Elements -->
      <div
        class="absolute -top-10 -right-10 w-24 h-24 bg-blue-50 rounded-full blur-3xl opacity-50"
      ></div>
      <div
        class="absolute -bottom-10 -left-10 w-24 h-24 bg-blue-50 rounded-full blur-3xl opacity-50"
      ></div>

      <div
        class="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-700 rounded-2xl flex items-center justify-center mb-4 shadow-lg shadow-blue-200 rotate-3"
      >
        <Compass class="text-white" size={32} />
      </div>

      <h3 class="text-2xl font-bold text-gray-800 mb-3 leading-tight">
        Mulai Perjalanan <span class="text-blue-600">Skill Leap</span> Anda!
      </h3>

      <p class="text-gray-500 text-base max-w-md mb-6 leading-relaxed">
        Pilih skill yang ingin kamu pelajari. Diskusikan dengan AI Assistant
        kami untuk menemukan roadmap yang tepat dan terpersonalisasi untukmu.
      </p>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-4 w-full mb-8">
        <div
          class="p-4 bg-gray-50 rounded-[1.5rem] border border-gray-100 flex flex-col items-center"
        >
          <div
            class="w-10 h-10 bg-white rounded-xl flex items-center justify-center mb-2 shadow-sm"
          >
            <Sparkles class="text-blue-500" size={30} />
          </div>
          <span class="font-bold text-gray-800 text-s">AI Powered</span>
        </div>
        <div
          class="p-4 bg-gray-50 rounded-[1.5rem] border border-gray-100 flex flex-col items-center"
        >
          <div
            class="w-10 h-10 bg-white rounded-xl flex items-center justify-center mb-2 shadow-sm"
          >
            <BookOpen class="text-blue-500" size={30} />
          </div>
          <span class="font-bold text-gray-800 text-s">Structured</span>
        </div>
        <div
          class="p-4 bg-gray-50 rounded-[1.5rem] border border-gray-100 flex flex-col items-center"
        >
          <div
            class="w-10 h-10 bg-white rounded-xl flex items-center justify-center mb-2 shadow-sm"
          >
            <ArrowRight class="text-blue-500" size={30} />
          </div>
          <span class="font-bold text-gray-800 text-s">Fast Growth</span>
        </div>
      </div>

      <button
        class="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-[1.5rem] font-black text-base transition-all shadow-xl shadow-blue-200 flex items-center space-x-2 transform hover:scale-105 active:scale-95"
        onclick={() => (chatOpen = true)}
      >
        <Sparkles size={20} />
        <span>Diskusi dengan AI Mentor</span>
      </button>

      <p
        class="mt-4 text-gray-400 text-[10px] font-bold uppercase tracking-widest"
      >
        AI Mentor akan membantu menentukan kurikulum terbaik untukmu
      </p>
    </div>
  {:else}
    <!-- Roadmap Timeline -->
    <div class="space-y-6">
      <div class="flex items-center space-x-4 mb-6">
        <div class="p-3 bg-blue-100 text-blue-600 rounded-2xl">
          <BookOpen size={24} />
        </div>
        <div>
          <h3 class="text-2xl font-black text-gray-800">
            Roadmap: <span class="text-blue-600">{data.roleName}</span>
          </h3>
          <p class="text-gray-500 text-sm">Ikuti langkah-langkah di bawah untuk menguasai skill ini</p>
        </div>
      </div>

      <div class="relative pl-8 space-y-8">
        <!-- Vertical Spine -->
        <div class="absolute left-[1.625rem] top-2 bottom-2 w-0.5 bg-gray-100"></div>

        {#each data.modules as module, i}
          {@const isExpanded = expandedModuleId === module.id}
          <div class="relative">
            <!-- Module Node -->
            <button 
              onclick={() => expandedModuleId = isExpanded ? null : module.id}
              class="absolute -left-8 top-0 w-8 h-8 rounded-full border-4 border-white shadow-md flex items-center justify-center text-xs font-black transition-all z-10
                {module.is_unlocked ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-500'}"
            >
              {i + 1}
            </button>

            <!-- Module Header -->
            <div class="flex flex-col">
              <button 
                onclick={() => expandedModuleId = isExpanded ? null : module.id}
                class="flex items-center justify-between text-left group"
              >
                <h4 class="text-lg font-bold transition-all group-hover:text-blue-600 
                  {module.is_unlocked ? 'text-gray-800' : 'text-gray-400'}">
                  {module.module_name}
                </h4>
                <div class="text-gray-400 group-hover:text-blue-600 transition-transform {isExpanded ? 'rotate-180' : ''}">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-chevron-down"><path d="m6 9 6 6 6-6"/></svg>
                </div>
              </button>

              <!-- Materials List -->
              {#if isExpanded}
                <div transition:slide class="mt-4 space-y-3 overflow-hidden">
                  {#each module.materials as material}
                    {#if material.is_locked}
                      <div 
                        class="flex items-center space-x-3 p-3 rounded-2xl bg-gray-100/50 border border-transparent grayscale opacity-50 cursor-not-allowed"
                      >
                        <div class="w-8 h-8 bg-white rounded-lg flex items-center justify-center shadow-sm text-gray-400">
                          <Lock size={14} />
                        </div>
                        <span class="text-sm font-bold text-gray-400">{material.title}</span>
                      </div>
                    {:else}
                      <a 
                        href="/roadmap/{material.id}"
                        class="flex items-center space-x-3 p-3 rounded-2xl bg-gray-50 hover:bg-blue-50 border border-transparent hover:border-blue-100 transition-all group"
                      >
                        <div class="w-8 h-8 bg-white rounded-lg flex items-center justify-center shadow-sm text-blue-500 group-hover:scale-110 transition-transform">
                          <Play size={14} fill="currentColor" />
                        </div>
                        <span class="text-sm font-bold text-gray-700 group-hover:text-blue-600">{material.title}</span>
                      </a>
                    {/if}
                  {/each}
                  {#if module.materials.length === 0}
                    <p class="text-xs text-gray-400 italic ml-4">Belum ada materi di modul ini.</p>
                  {/if}
                </div>
              {/if}
            </div>
          </div>
        {/each}
      </div>
    </div>
  {/if}
</div>

<AIChat bind:isOpen={chatOpen} />
