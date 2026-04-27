<script lang="ts">
  import { Play, ArrowLeft, ArrowRight, ChevronLeft } from "lucide-svelte";
  import { fade } from "svelte/transition";

  let { data } = $props();

  // Parse YouTube video ID from URL
  function getYouTubeId(url: string) {
    if (!url) return null;
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return match && match[2].length === 11 ? match[2] : null;
  }

  // Clean content text from span artifacts and format for readability
  function cleanContent(text: string) {
    if (!text) return "";
    
    // 1. Remove [span_N](start_span) and [span_N](end_span)
    let cleaned = text.replace(/\[span_\d+\]\((?:start|end)_span\)/g, "");
    
    // 2. Add structural breaks for readability
    cleaned = cleaned
      // Add double newlines before numbered items (1-99 only to avoid years)
      .replace(/\s([1-9]\d?\.)\s/g, "\n\n$1 ")
      // Add double newlines before alphabetical items (e.g., " A. ", " B. ")
      .replace(/\s([A-Z]\.)\s/g, "\n\n$1 ")
      // Add double newlines before major sections
      .replace(/(Bagian \d+:|Video \d+:)/g, "\n\n$1")
      // Add double newlines before sub-headers (only if preceded by words/tags/lowercase, not single uppercase)
      .replace(/([a-zA-Z0-9>]{2,}|[a-z]|>)\.\s+([A-Z][a-zA-Z0-9\s\&\(\)-]{1,40}:)\s/g, "$1.\n\n$2 ")
      // Add double newlines before HTML tag sub-headers (only if preceded by words/tags/lowercase)
      .replace(/([a-zA-Z0-9>]{2,}|[a-z]|>)\.\s+(<[^>]+>:)\s/g, "$1.\n\n$2 ")
      // Format bullet points (e.g., " - HTML:")
      .replace(/\s-\s/g, "\n- ");
      
    return cleaned.trim();
  }

  const videoId = $derived(getYouTubeId(data.material.video_url));
  const cleanedContent = $derived(cleanContent(data.material.content_text));

  const prevMaterial = $derived(data.currentIndex > 0 ? data.allMaterials[data.currentIndex - 1] : null);
  const nextMaterial = $derived(data.currentIndex < data.totalMaterials - 1 ? data.allMaterials[data.currentIndex + 1] : null);
</script>

<div class="max-w-5xl mx-auto space-y-8 pb-20">
  <!-- Header / Breadcrumb -->
  <div class="flex items-center justify-between">
    <a 
      href="/roadmap" 
      class="flex items-center space-x-2 text-gray-500 hover:text-blue-600 font-bold transition-colors group"
    >
      <ChevronLeft size={20} class="group-hover:-translate-x-1 transition-transform" />
      <span>Kembali ke Roadmap</span>
    </a>
    <div class="px-4 py-1.5 bg-blue-50 text-blue-600 rounded-full text-xs font-black uppercase tracking-wider">
      {data.moduleName}
    </div>
  </div>

  <!-- Content Card -->
  <div class="bg-white rounded-[2.5rem] p-8 border border-gray-100 shadow-xl shadow-blue-50/50 space-y-8" in:fade>
    <h2 class="text-3xl font-black text-gray-800 leading-tight">
      {data.material.title}
    </h2>

    <!-- Video Player -->
    {#if videoId}
      <div class="aspect-video w-full rounded-[2rem] overflow-hidden shadow-2xl bg-black border-4 border-white">
        <iframe
          width="100%"
          height="100%"
          src="https://www.youtube.com/embed/{videoId}"
          title={data.material.title}
          frameborder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowfullscreen
        ></iframe>
      </div>
    {:else}
      <div class="aspect-video w-full rounded-[2rem] bg-gray-100 flex flex-col items-center justify-center space-y-4 border-2 border-dashed border-gray-200">
        <div class="w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-sm text-gray-300">
          <Play size={32} />
        </div>
        <p class="text-gray-400 font-bold">Video tidak tersedia</p>
      </div>
    {/if}

    <!-- Content Text -->
    <div class="prose prose-blue max-w-none">
      <div class="text-gray-600 leading-relaxed text-lg whitespace-pre-wrap">
        {cleanedContent}
      </div>
    </div>
  </div>

  <!-- Navigation -->
  <div class="flex items-center justify-between gap-4 pt-4">
    {#if prevMaterial}
      <a 
        href="/roadmap/{prevMaterial.id}"
        class="flex-1 flex items-center justify-center space-x-3 bg-white border-2 border-gray-100 hover:border-blue-500 hover:text-blue-600 text-gray-600 px-6 py-5 rounded-[2rem] font-black transition-all group"
      >
        <ArrowLeft size={20} class="group-hover:-translate-x-1 transition-transform" />
        <div class="text-left">
          <p class="text-[10px] uppercase tracking-widest opacity-50">Sebelumnya</p>
          <p class="truncate max-w-[200px]">{prevMaterial.title}</p>
        </div>
      </a>
    {:else}
      <div class="flex-1"></div>
    {/if}

    {#if nextMaterial}
      <form action="?/markComplete" method="POST" class="flex-1">
        <button 
          type="submit"
          class="w-full flex items-center justify-center space-x-3 bg-blue-600 hover:bg-blue-700 text-white px-6 py-5 rounded-[2rem] font-black transition-all shadow-xl shadow-blue-200 group"
        >
          <div class="text-right">
            <p class="text-[10px] uppercase tracking-widest opacity-70">Selanjutnya</p>
            <p class="truncate max-w-[200px]">{nextMaterial.title}</p>
          </div>
          <ArrowRight size={20} class="group-hover:translate-x-1 transition-transform" />
        </button>
      </form>
    {:else}
      <div class="flex-1"></div>
    {/if}
  </div>
</div>
