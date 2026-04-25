<script>
  import { Sparkles, Plus } from "lucide-svelte";
  import AIChat from "$lib/components/AIChat.svelte";
</script>

<h2 class="text-4xl font-bold text-blue-600 mb-8">Dashboard</h2>

<div
    class="relative bg-white rounded-[2.5rem] border-2 border-dashed border-gray-200 min-h-[500px] flex flex-col items-center justify-center p-12 text-center"
  >
    <div class="mb-6 relative">
      <div
        class="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center"
      >
        <Sparkles size={40} class="text-blue-400" />
      </div>
    </div>

    <h3 class="text-3xl font-bold text-gray-800 mb-3">
      Your Skill Leap is Quiet...
    </h3>
    <p class="text-gray-500 max-w-md mx-auto mb-8 text-lg leading-relaxed">
      Every expert was once a beginner. Start your first course today and watch
      your skill grow!
    </p>

    <a
      href="/roadmap"
      class="flex items-center space-x-2 bg-blue-400 hover:bg-blue-500 text-white px-8 py-4 rounded-full font-semibold shadow-lg shadow-blue-100 transition-all transform hover:scale-105"
    >
      <div class="bg-white/20 rounded-full p-1">
        <Plus size={20} />
      </div>
      <span>Create First Course</span>
    </a>
</div>

<AIChat />
