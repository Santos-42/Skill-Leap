<script lang="ts">
  import { sidebar } from "$lib/state/sidebar.svelte";
  import {
    InterviewManager,
  } from "$lib/features/interview/interview.svelte";
  import {
    Play,
    Square,
    Download,
    Bot,
    User,
    Mic,
    MicOff,
  } from "lucide-svelte";
  import { fade, slide } from "svelte/transition";
  import { tick } from "svelte";

  let { data } = $props();

  const manager = new InterviewManager();
  let transcriptContainer: HTMLDivElement | undefined = $state();

  $effect(() => {
    if (data.activeRole) {
      manager.availableModules = data.modules;
      manager.userProgress = data.userProgress;
      manager.selectedRoleId = data.activeRole.id;
    }
  });

  $effect(() => {
    if (manager.transcript.length > 0 && transcriptContainer) {
      tick().then(() => {
        if (transcriptContainer) {
          transcriptContainer.scrollTop = transcriptContainer.scrollHeight;
        }
      });
    }
  });

  // Fungsi untuk menyimpan transkrip ke file text
  function saveTranscript() {
    if (manager.transcript.length === 0) return;

    const transcriptText = manager.transcript
      .map((entry) => {
        const time = entry.timestamp.toLocaleTimeString();
        return `[${time}] ${entry.speaker.toUpperCase()}: ${entry.text}`;
      })
      .join("\n\n");

    const blob = new Blob([transcriptText], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `interview-transcript-${new Date().toISOString().slice(0, 10)}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  // Animasi spektrum
  let isAnimating = $derived(manager.isSpeaking);
</script>

<div class="flex flex-col h-[calc(100vh-5rem)]">
  <div class="flex justify-between items-center mb-8">
    <div>
      <h2 class="text-4xl font-bold text-blue-600">AI Interview Simulator</h2>
      <p class="text-gray-500 mt-1">Latih kemampuan interview Anda dengan AI profesional</p>
    </div>
    <div
      class="px-4 py-2 bg-blue-50 text-blue-600 rounded-full text-sm font-medium {manager.connectionState === 'ready' ? 'animate-pulse' : ''}"
    >
      {manager.statusText}
    </div>
  </div>

  <div
    class="flex flex-1 gap-6 transition-all duration-500 {sidebar.isCollapsed
      ? 'flex-row'
      : 'flex-col'} overflow-hidden pb-4"
  >
    <!-- Audio Section Wrapper -->
    <div
      class="flex flex-col transition-all duration-500 {sidebar.isCollapsed
        ? 'w-[60%]'
        : 'w-full'}"
    >
      <div
        class="bg-white rounded-[2.5rem] p-6 border border-gray-100 shadow-sm flex flex-col items-center justify-center space-y-6 h-full"
      >
        <div class="flex items-center justify-center space-x-1 h-16 w-full">
          {#each Array(20) as _, i}
            <div
              class="w-2 bg-blue-500 rounded-full {isAnimating
                ? 'animate-wave'
                : ''}"
              style="height: 10%; animation-delay: {i * 0.05}s;"
            ></div>
          {/each}
        </div>

        {#if data.activeRole}
          <div class="w-full max-w-sm mb-4 text-center">
            <p class="text-lg font-bold text-gray-700">
              Role Interview:
              <span class="text-blue-600 font-black">{data.activeRole.role_name}</span>
            </p>
          </div>
        {:else}
          <div class="w-full max-w-sm mb-4 text-center">
            <p class="text-lg font-bold text-red-500">
              Anda belum memilih roadmap aktif.
            </p>
          </div>
        {/if}

        <div class="flex space-x-4">
          <button
            onclick={() => manager.connect()}
            disabled={!data.activeRole || (manager.connectionState !== "idle" &&
              manager.connectionState !== "error")}
            class="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white px-6 py-3 rounded-2xl font-bold transition-all shadow-lg shadow-blue-100"
          >
            <Play size={20} fill="currentColor" />
            <span>Start</span>
          </button>

          <button
            onclick={() => manager.disconnect()}
            disabled={manager.connectionState === "idle" ||
              manager.connectionState === "error"}
            class="flex items-center space-x-2 bg-white border-2 border-red-100 hover:border-red-500 text-red-500 disabled:text-gray-300 disabled:border-gray-100 px-6 py-3 rounded-2xl font-bold transition-all"
          >
            <Square size={20} fill="currentColor" />
            <span>Stop</span>
          </button>

          <button
            onclick={() => manager.toggleMic()}
            disabled={manager.connectionState !== "ready"}
            class="flex items-center space-x-2 bg-white border-2 {manager.isRecording
              ? 'border-red-500 text-red-500 bg-red-50'
              : 'border-gray-200 hover:border-blue-500 text-gray-700'} disabled:text-gray-300 disabled:border-gray-100 px-6 py-3 rounded-2xl font-bold transition-all"
          >
            {#if manager.isRecording}
              <Mic size={20} />
              <span>Mic On</span>
            {:else}
              <MicOff size={20} />
              <span>Mic Off</span>
            {/if}
          </button>
        </div>
      </div>
    </div>

    <!-- Transcript Section Wrapper -->
    <div
      class="flex flex-col transition-all duration-500 {sidebar.isCollapsed
        ? 'w-[40%]'
        : 'flex-1'} overflow-hidden"
    >
      <div
        class="flex-1 bg-white rounded-[2.5rem] border border-gray-100 shadow-sm flex flex-col overflow-hidden"
      >
        <div
          class="p-4 border-b border-gray-50 flex justify-between items-center bg-gray-50/50"
        >
          <div class="flex items-center space-x-2 text-gray-500">
            <Bot size={20} />
            <span class="font-bold">Conversation Transcript</span>
          </div>

          {#if manager.connectionState === "idle" && manager.transcript.length > 0}
            <button
              in:fade
              onclick={saveTranscript}
              class="flex items-center space-x-2 bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-xl text-sm font-bold shadow-sm transition-all"
            >
              <Download size={16} />
              <span>Simpan Transcript</span>
            </button>
          {/if}
        </div>

        <div
          class="flex-1 p-8 overflow-y-auto flex flex-col space-y-6"
          bind:this={transcriptContainer}
        >
          {#if manager.transcript.length === 0}
            <div
              class="flex flex-col items-center justify-center h-full text-gray-400 space-y-2"
            >
              <Mic size={48} class="opacity-20" />
              <p>Belum ada percakapan. Tekan "Start" untuk memulai.</p>
            </div>
          {:else}
            {#each manager.transcript as entry (entry.id)}
              <div
                class="flex flex-col {entry.speaker === 'user'
                  ? 'items-end'
                  : 'items-start'} w-full"
                transition:slide
              >
                <div
                  class="flex items-center space-x-2 mb-1 px-2 {entry.speaker ===
                  'user'
                    ? 'flex-row-reverse space-x-reverse'
                    : ''}"
                >
                  <div
                    class="p-1 rounded-lg {entry.speaker === 'ai'
                      ? 'bg-blue-100 text-blue-600'
                      : 'bg-gray-100 text-gray-600'}"
                  >
                    {#if entry.speaker === "ai"}
                      <Bot size={14} />
                    {:else}
                      <User size={14} />
                    {/if}
                  </div>
                  <span
                    class="text-[10px] font-bold uppercase tracking-wider text-gray-400"
                  >
                    {entry.speaker === "ai" ? "AI Interviewer" : "Candidate"}
                  </span>
                </div>

                <div
                  class="max-w-[80%] p-4 rounded-[1.5rem] text-sm leading-relaxed shadow-sm
                    {entry.speaker === 'user'
                    ? 'bg-gray-100 text-black rounded-tr-none text-right'
                    : 'bg-blue-600 text-white rounded-tl-none text-left'}"
                >
                  {entry.text}
                </div>
              </div>
            {/each}
          {/if}
        </div>
      </div>
    </div>
  </div>
</div>

<style>
  /* Menambahkan sedikit variasi pada spektrum untuk visualisasi sederhana */
  .animate-wave {
    animation: wave 1s ease-in-out infinite;
  }
  @keyframes wave {
    0%,
    100% {
      height: 10%;
    }
    50% {
      height: 100%;
    }
  }
</style>
