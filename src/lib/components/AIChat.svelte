<script>
  import { Sparkles, X, Send } from "lucide-svelte";
  import { fade, scale } from "svelte/transition";

  let isOpen = $state(false);

  function toggleChat() {
    isOpen = !isOpen;
  }
</script>

<div class="fixed bottom-6 right-6 z-50 flex flex-col items-end">
  {#if isOpen}
    <div
      transition:scale={{ duration: 200, start: 0.8 }}
      class="bg-white w-80 h-[580px] rounded-[2rem] shadow-2xl border border-gray-100 flex flex-col mb-4 overflow-hidden"
      id="ai-chat"
    >
      <!-- Header -->
      <div
        class="bg-blue-600 p-4 text-white flex justify-between items-center shadow-md"
      >
        <div class="flex items-center space-x-2">
          <Sparkles size={18} />
          <span class="font-bold text-sm">AI Skill Assistant</span>
        </div>
        <button
          onclick={toggleChat}
          class="hover:bg-white/20 p-1 rounded-full transition-colors"
        >
          <X size={18} />
        </button>
      </div>

      <!-- Messages Area (Placeholder) -->
      <div
        class="flex-1 p-4 overflow-y-auto bg-gray-50 flex flex-col space-y-4"
      >
        <!-- AI Message -->
        <div
          class="bg-blue-600 text-white p-3 rounded-2xl rounded-tl-none self-start max-w-[80%] text-sm text-left"
        >
          Hello! I'm your AI Skill Assistant. How can I help you build your
          Skill Leap today?
        </div>
        
        <!-- User Message Placeholder -->
        <div
          class="bg-gray-200 text-black p-3 rounded-2xl rounded-tr-none self-end max-w-[80%] text-sm text-left"
        >
          I want to learn more about SvelteKit.
        </div>
      </div>

      <!-- Input Area -->
      <div
        class="p-4 bg-white border-t border-gray-100 flex items-center space-x-2"
      >
        <input
          type="text"
          placeholder="Ask me anything..."
          class="flex-1 bg-gray-100 border-none rounded-full px-4 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
        />
        <button
          class="bg-blue-600 text-white p-2 rounded-full hover:bg-blue-700 transition-colors"
        >
          <Send size={16} />
        </button>
      </div>
    </div>
  {/if}

  <!-- Floating Action Button -->
  <button
    onclick={toggleChat}
    class="w-16 h-16 bg-blue-600 hover:bg-blue-700 text-white rounded-full flex items-center justify-center shadow-xl shadow-blue-200 transition-all transform hover:scale-110 active:scale-95"
  >
    {#if isOpen}
      <X size={28} />
    {:else}
      <Sparkles size={28} />
    {/if}
  </button>
</div>
