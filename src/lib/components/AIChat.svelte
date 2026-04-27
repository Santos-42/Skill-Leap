<script lang="ts">
  import { Sparkles, X, Send, PlusCircle } from "lucide-svelte";
  import { fade, scale, slide } from "svelte/transition";
  import { onMount, tick } from "svelte";
  import { goto } from "$app/navigation";

  let { isOpen = $bindable(false) } = $props();

  let messages = $state<{ role: 'ai' | 'user'; text: string }[]>([
    { role: 'ai', text: "Hello! Saya AI Mentor Anda. Bagaimana saya bisa membantu perjalanan karir Anda hari ini?" }
  ]);
  let inputText = $state("");
  let isLoading = $state(false);
  let showRoadmapDropdown = $state(false);
  let availableRoadmaps = $state<{ id: string; role_name: string }[]>([]);
  let messageContainer: HTMLDivElement | undefined = $state();
  let pendingRoadmapAction = $state<string | null>(null);

  onMount(async () => {
    const res = await fetch('/api/roadmaps');
    if (res.ok) {
      availableRoadmaps = await res.json();
    }
  });

  $effect(() => {
    if (messages.length > 0 && messageContainer) {
      tick().then(() => {
        if (messageContainer) {
          messageContainer.scrollTop = messageContainer.scrollHeight;
        }
      });
    }
  });

  function toggleChat() {
    isOpen = !isOpen;
  }

  function formatMessage(text: string) {
    // Simple bold markdown **text** -> <strong>text</strong>
    let formatted = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    // Simple line breaks
    formatted = formatted.replace(/\n/g, '<br/>');
    return formatted;
  }

  async function sendMessage() {
    if (!inputText.trim() || isLoading) return;

    let userMessage = inputText;
    const displayMessage = inputText;

    // Check for confirmation
    const isConfirmation = pendingRoadmapAction && 
      (userMessage.toLowerCase() === 'ya' || 
       userMessage.toLowerCase() === 'y' || 
       userMessage.toLowerCase() === 'yes');

    if (isConfirmation) {
      userMessage = `Confirm create roadmap: ${pendingRoadmapAction}`;
      pendingRoadmapAction = null;
    } else {
      // If we had a pending action but user sent something else, reset it
      pendingRoadmapAction = null;
    }

    inputText = "";
    showRoadmapDropdown = false;
    messages = [...messages, { role: 'user', text: displayMessage }];
    
    isLoading = true;
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userMessage,
          chatHistory: messages.slice(0, -1).map(m => ({ role: m.role, text: m.text }))
        })
      });

      if (res.ok) {
        const data = await res.json();
        
        // Handle Actions
        if (data.action === 'confirm_roadmap') {
          pendingRoadmapAction = data.payload;
        } else if (data.action === 'redirect') {
          setTimeout(() => goto(data.url), 1500); // Small delay to let user see the "Success" message
        }

        const fullText = data.text;
        
        // Push empty AI message first
        const aiMsgIndex = messages.length;
        messages = [...messages, { role: 'ai', text: "" }];
        
        // Typewriter effect
        const words = fullText.split(' ');
        let currentWordIndex = 0;
        
        const typeInterval = setInterval(() => {
          if (currentWordIndex < words.length) {
            messages[aiMsgIndex].text += (currentWordIndex === 0 ? "" : " ") + words[currentWordIndex];
            currentWordIndex++;
            
            // Auto-scroll during typing
            if (messageContainer) {
              messageContainer.scrollTop = messageContainer.scrollHeight;
            }
          } else {
            clearInterval(typeInterval);
          }
        }, 40); // 40ms per word
      } else {
        messages = [...messages, { role: 'ai', text: "Maaf, saya sedang mengalami kendala teknis." }];
      }
    } catch (err) {
      messages = [...messages, { role: 'ai', text: "Gagal terhubung ke server AI." }];
    } finally {
      isLoading = false;
    }
  }

  function handleCreateRoadmap() {
    inputText = "Create roadmap: ";
    showRoadmapDropdown = true;
  }

  const roadmapPrefix = "Create roadmap: ";
  let filteredRoadmaps = $derived.by(() => {
    if (!inputText.startsWith(roadmapPrefix)) return [];
    const query = inputText.slice(roadmapPrefix.length).toLowerCase().trim();
    if (!query) return availableRoadmaps;
    return availableRoadmaps.filter(r => r.role_name.toLowerCase().includes(query));
  });

  $effect(() => {
    if (inputText.startsWith(roadmapPrefix) && filteredRoadmaps.length > 0) {
      showRoadmapDropdown = true;
    } else {
      showRoadmapDropdown = false;
    }
  });

  function selectRoadmap(roleName: string) {
    inputText = "Create roadmap: " + roleName;
    showRoadmapDropdown = false;
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

      <!-- Messages Area -->
      <div
        class="flex-1 p-4 overflow-y-auto bg-gray-50 flex flex-col space-y-4"
        bind:this={messageContainer}
      >
        {#each messages as msg}
          <div
            class="p-3 rounded-2xl text-sm leading-relaxed shadow-sm
            {msg.role === 'ai' 
               ? 'bg-blue-600 text-white rounded-tl-none self-start text-left' 
               : 'bg-white text-gray-800 rounded-tr-none self-end text-left border border-gray-100'}"
          >
            {#if msg.role === 'ai'}
              {@html formatMessage(msg.text)}
            {:else}
              {msg.text}
            {/if}
          </div>
        {/each}

        {#if isLoading}
          <div class="bg-blue-50 text-blue-600 p-3 rounded-2xl rounded-tl-none self-start text-sm animate-pulse">
            AI sedang berpikir...
          </div>
        {/if}
      </div>

      <!-- Action Area -->
      <div class="px-4 py-2 bg-gray-50 flex justify-start">
        <button 
          onclick={handleCreateRoadmap}
          class="flex items-center space-x-1 text-[10px] font-bold uppercase tracking-wider text-blue-600 hover:text-blue-700 transition-colors bg-blue-50 px-3 py-1 rounded-full"
        >
          <PlusCircle size={12} />
          <span>Create Roadmap</span>
        </button>
      </div>

      <!-- Input Area -->
      <div class="relative p-4 bg-white border-t border-gray-100">
        <!-- Roadmap Dropdown -->
        {#if filteredRoadmaps.length > 0 && showRoadmapDropdown}
          <div 
            transition:slide
            class="absolute bottom-full left-4 right-4 mb-2 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden z-10 max-h-40 overflow-y-auto"
          >
            {#each filteredRoadmaps as roadmap}
              <button
                onclick={() => selectRoadmap(roadmap.role_name)}
                class="w-full text-left px-4 py-2 text-sm hover:bg-blue-50 transition-colors text-gray-700 border-b border-gray-50 last:border-0"
              >
                {roadmap.role_name}
              </button>
            {/each}
          </div>
        {/if}

        <form class="flex items-center space-x-2" onsubmit={(e) => { e.preventDefault(); sendMessage(); }}>
          <input
            type="text"
            bind:value={inputText}
            placeholder="Ask me anything..."
            class="flex-1 bg-gray-100 border-none rounded-full px-4 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
            onfocus={() => { if (inputText.startsWith("Create roadmap: ")) showRoadmapDropdown = true; }}
          />
          <button
            type="submit"
            class="bg-blue-600 text-white p-2 rounded-full hover:bg-blue-700 transition-colors disabled:opacity-50"
            disabled={isLoading || !inputText.trim()}
          >
            <Send size={16} />
          </button>
        </form>
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
