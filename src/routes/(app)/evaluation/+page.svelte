<script lang="ts">
  import { fade, slide } from "svelte/transition";
  import { ClipboardList, Sparkles, Send, RotateCcw, CheckCircle2, XCircle, AlertCircle, Loader2 } from "lucide-svelte";
  import { invalidateAll } from "$app/navigation";

  let { data } = $props();

  type State = "idle" | "loading" | "active" | "evaluating" | "result";
  let currentState = $state<State>("idle");

  // State data
  let currentCase = $state({ caseStudy: "", question: "" });
  let userAnswer = $state("");
  let evaluationResult = $state<any>(null);
  let errorMsg = $state("");
  let evaluationCooldown = $state(0);

  let cooldownInterval: ReturnType<typeof setInterval>;

  function startCooldown(seconds: number) {
    evaluationCooldown = seconds;
    if (cooldownInterval) clearInterval(cooldownInterval);
    cooldownInterval = setInterval(() => {
      evaluationCooldown--;
      if (evaluationCooldown <= 0) {
        clearInterval(cooldownInterval);
        evaluationCooldown = 0;
      }
    }, 1000);
  }

  function formatTime(seconds: number) {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }

  async function startEvaluation() {
    if (!data.activeRole) return;
    
    currentState = "loading";
    errorMsg = "";
    
    try {
      const res = await fetch("/api/evaluation", {
        method: "POST",
        body: JSON.stringify({
          action: "generate",
          roleName: data.activeRole.role_name,
          completedModules: data.completedModules
        })
      });
      
      if (res.status === 429) {
        const errData = await res.json();
        errorMsg = "Evaluasi sedang cooldown";
        startCooldown(errData.cooldown_remaining || 300);
        currentState = "idle";
        return;
      }

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || errData.details || "Gagal mengambil soal dari AI");
      }
      
      currentCase = await res.json();
      currentState = "active";
    } catch (err: any) {
      errorMsg = err.message;
      currentState = "idle";
    }
  }

  async function submitEvaluation() {
    if (!userAnswer.trim()) return;
    
    currentState = "evaluating";
    errorMsg = "";
    
    try {
      const res = await fetch("/api/evaluation", {
        method: "POST",
        body: JSON.stringify({
          action: "evaluate",
          roleId: data.activeRole?.id,
          roleName: data.activeRole?.role_name,
          caseStudy: currentCase.caseStudy,
          question: currentCase.question,
          answer: userAnswer
        })
      });
      
      if (!res.ok) throw new Error("Gagal melakukan evaluasi");
      
      evaluationResult = await res.json();
      currentState = "result";
      // Auto-refresh past evaluations list
      await invalidateAll();
    } catch (err: any) {
      errorMsg = err.message;
      currentState = "active";
    }
  }

  function reset() {
    currentState = "idle";
    userAnswer = "";
    currentCase = { caseStudy: "", question: "" };
    evaluationResult = null;
    evaluationCooldown = 0;
    if (cooldownInterval) clearInterval(cooldownInterval);
  }
</script>

<div class="space-y-8 pb-20">
  <div class="flex justify-between items-center">
    <div>
      <h2 class="text-base font-black text-blue-600">Evaluation</h2>
      <p class="text-gray-500 text-sm mt-1">Uji pemahaman Anda dengan studi kasus nyata berbasis AI</p>
    </div>
  </div>

  {#if currentState === "idle"}
    <!-- Idle State -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
      <div class="md:col-span-2 space-y-6">
        <div class="bg-white rounded-[2.5rem] p-8 border border-gray-100 shadow-xl shadow-blue-50/50 relative overflow-hidden" in:fade>
          <div class="absolute -top-10 -right-10 w-40 h-40 bg-blue-50 rounded-full blur-3xl opacity-50"></div>
          
          <div class="relative space-y-6">
            <div class="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-200">
              <ClipboardList class="text-white" size={32} />
            </div>
            
            <div>
              <h3 class="text-base font-black text-gray-800 mb-2">Siap untuk diuji?</h3>
              <p class="text-gray-500 text-sm leading-relaxed">
                Kami akan menyiapkan sebuah <strong>Mini Case Study</strong> yang dirancang khusus untuk posisi 
                <span class="text-blue-600 font-bold">{data.activeRole?.role_name || "???"}</span> 
                berdasarkan materi yang telah Anda pelajari.
              </p>
            </div>

            {#if data.activeRole}
              {#if evaluationCooldown > 0}
                <div class="w-full bg-amber-50 border border-amber-200 rounded-[1.5rem] p-4 text-center">
                  <p class="text-amber-700 font-bold">Cooldown: {formatTime(evaluationCooldown)}</p>
                  <p class="text-amber-600 text-sm mt-1">Silakan pelajari ulang materi sebelum mencoba lagi</p>
                </div>
              {:else}
                <button 
                  onclick={startEvaluation}
                  class="w-full bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-[1.5rem] font-black text-sm transition-all shadow-xl shadow-blue-100 flex items-center justify-center space-x-3 group"
                >
                  <Sparkles size={20} />
                  <span>Mulai Evaluasi Sekarang</span>
                </button>
              {/if}
            {:else}
              <div class="p-4 bg-red-50 border border-red-100 rounded-2xl flex items-center space-x-3 text-red-600">
                <AlertCircle size={20} />
                <p class="text-sm font-bold">Pilih roadmap aktif terlebih dahulu di halaman Roadmap.</p>
              </div>
            {/if}
            
            {#if errorMsg}
              <p class="text-red-500 text-sm font-bold text-center" transition:slide>{errorMsg}</p>
            {/if}
          </div>
        </div>

        <!-- History Section -->
        <div class="space-y-4">
          <h4 class="text-sm font-black text-gray-800 ml-2">Riwayat Evaluasi</h4>
          {#if data.pastEvaluations.length === 0}
            <div class="bg-gray-50 rounded-[2rem] p-10 text-center border border-dashed border-gray-200">
              <p class="text-gray-400 font-bold italic">Belum ada riwayat evaluasi.</p>
            </div>
          {:else}
            <div class="grid grid-cols-1 gap-4">
              {#each data.pastEvaluations as eval_item}
                <a href="/evaluation/review/{eval_item.id}" class="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm flex items-center justify-between group hover:border-blue-200 transition-all">
                  <div class="flex items-center space-x-4">
                    <div class="w-12 h-12 rounded-xl flex items-center justify-center font-black text-lg
                      {eval_item.score >= 70 ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}">
                      {eval_item.score}
                    </div>
                    <div>
                      <p class="font-bold text-gray-800">{eval_item.questions}</p>
                      <p class="text-[10px] text-gray-400 font-bold uppercase tracking-widest">
                        {new Date(eval_item.created_at).toLocaleDateString()} • {eval_item.feedback_json.decision}
                      </p>
                    </div>
                  </div>
                  <span class="text-blue-600 text-xs font-bold hover:underline shrink-0">Lihat Detail →</span>
                </a>
              {/each}
            </div>
          {/if}
        </div>
      </div>

      <div class="md:col-span-1">
        <div class="bg-gradient-to-br from-blue-600 to-blue-800 rounded-[2.5rem] p-8 text-white shadow-xl shadow-blue-200 sticky top-8">
          <h4 class="text-sm font-black mb-4">Tips Evaluasi</h4>
          <ul class="space-y-4 text-sm opacity-90">
            <li class="flex items-start space-x-3">
              <div class="mt-1"><CheckCircle2 size={16} /></div>
              <p>Bacalah skenario dengan teliti sebelum menjawab.</p>
            </li>
            <li class="flex items-start space-x-3">
              <div class="mt-1"><CheckCircle2 size={16} /></div>
              <p>Fokus pada solusi praktis dan efisien.</p>
            </li>
            <li class="flex items-start space-x-3">
              <div class="mt-1"><CheckCircle2 size={16} /></div>
              <p>Gunakan istilah teknis yang sesuai dengan role Anda.</p>
            </li>
          </ul>
        </div>
      </div>
    </div>

  {:else if currentState === "loading"}
    <!-- Loading State -->
    <div class="flex flex-col items-center justify-center py-32 space-y-6" in:fade>
      <div class="relative">
        <div class="w-24 h-24 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin"></div>
        <div class="absolute inset-0 flex items-center justify-center text-blue-600">
          <Sparkles size={32} class="animate-pulse" />
        </div>
      </div>
      <div class="text-center">
        <h3 class="text-2xl font-black text-gray-800">Menyiapkan Skenario</h3>
        <p class="text-gray-400 font-medium">AI sedang menyusun tantangan untuk Anda...</p>
      </div>
    </div>

  {:else if currentState === "active"}
    <!-- Active State -->
    <div class="max-w-4xl mx-auto space-y-8" in:fade>
      <!-- Case Study Card -->
      <div class="bg-blue-600 rounded-[2.5rem] p-8 text-white shadow-2xl shadow-blue-200 relative overflow-hidden">
        <div class="absolute top-4 right-4 opacity-10">
          <ClipboardList size={120} />
        </div>
        <div class="relative space-y-4">
          <div class="flex items-center space-x-2 text-blue-100 text-[10px] font-black uppercase tracking-widest">
            <ClipboardList size={14} />
            <span>Mini Case Study</span>
          </div>
          <h3 class="text-base font-black leading-relaxed whitespace-pre-wrap">{currentCase.caseStudy}</h3>
        </div>
      </div>

      <!-- Question & Answer -->
      <div class="bg-white rounded-[2.5rem] p-8 border border-gray-100 shadow-xl shadow-blue-50/50 space-y-6">
        <div>
          <label for="answer" class="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Pertanyaan</label>
          <p class="text-sm font-bold text-gray-800 leading-relaxed whitespace-pre-wrap">{currentCase.question}</p>
        </div>

        <div class="space-y-2">
          <label for="answer" class="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Jawaban Anda</label>
          <textarea
            id="answer"
            bind:value={userAnswer}
            placeholder="Tuliskan solusi atau penjelasan Anda di sini..."
            class="w-full h-64 bg-gray-50 border-2 border-gray-100 rounded-2xl p-6 text-gray-700 font-medium focus:border-blue-500 focus:ring-4 focus:ring-blue-50 outline-none transition-all resize-none"
          ></textarea>
          <div class="flex justify-end">
            <span class="text-xs font-bold text-gray-400">{userAnswer.length} karakter</span>
          </div>
        </div>

        <button 
          onclick={submitEvaluation}
          disabled={!userAnswer.trim()}
          class="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-200 text-white px-8 py-4 rounded-[1.5rem] font-black text-sm transition-all shadow-xl shadow-blue-100 flex items-center justify-center space-x-3 group"
        >
          <Send size={20} class="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
          <span>Submit Jawaban</span>
        </button>
        
        {#if errorMsg}
          <p class="text-red-500 text-sm font-bold text-center" transition:slide>{errorMsg}</p>
        {/if}
      </div>
    </div>

  {:else if currentState === "evaluating"}
    <!-- Evaluating State -->
    <div class="flex flex-col items-center justify-center py-32 space-y-6" in:fade>
      <div class="relative">
        <div class="w-24 h-24 border-4 border-gray-100 border-t-green-500 rounded-full animate-spin"></div>
        <div class="absolute inset-0 flex items-center justify-center text-green-500">
          <Loader2 size={32} class="animate-bounce" />
        </div>
      </div>
      <div class="text-center">
        <h3 class="text-2xl font-black text-gray-800">Mengevaluasi Jawaban</h3>
        <p class="text-gray-400 font-medium">AI sedang menganalisis solusi Anda...</p>
      </div>
    </div>

  {:else if currentState === "result"}
    <!-- Result State -->
    <div class="max-w-4xl mx-auto space-y-8" in:fade>
      <div class="bg-white rounded-[2.5rem] p-10 border border-gray-100 shadow-2xl shadow-blue-50/50 flex flex-col items-center text-center space-y-6">
        <div class="relative">
          <div class="w-24 h-24 rounded-full border-4 border-gray-50 flex items-center justify-center">
            <span class="text-3xl font-black text-blue-600">{evaluationResult.score}</span>
          </div>
          <div class="absolute -bottom-2 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest shadow-md
            {evaluationResult.decision === 'PASS' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'}">
            {evaluationResult.decision}
          </div>
        </div>

        <div class="space-y-2">
          <h3 class="text-base font-black text-gray-800">Evaluasi Selesai!</h3>
          <p class="text-sm text-gray-500 italic max-w-lg">"{evaluationResult.feedback}"</p>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
          <div class="bg-green-50 p-6 rounded-[2rem] border border-green-100 text-left">
            <div class="flex items-center space-x-2 text-green-600 mb-3">
              <CheckCircle2 size={18} />
              <span class="text-xs font-black uppercase tracking-widest">Kekuatan</span>
            </div>
            <p class="text-sm text-green-800 leading-relaxed font-medium">{evaluationResult.strengths}</p>
          </div>
          <div class="bg-red-50 p-6 rounded-[2rem] border border-red-100 text-left">
            <div class="flex items-center space-x-2 text-red-600 mb-3">
              <XCircle size={18} />
              <span class="text-xs font-black uppercase tracking-widest">Perbaikan</span>
            </div>
            <p class="text-sm text-red-800 leading-relaxed font-medium">{evaluationResult.improvements}</p>
          </div>
        </div>

        <button 
          onclick={reset}
          class="flex items-center space-x-2 text-gray-400 hover:text-blue-600 font-bold transition-colors"
        >
          <RotateCcw size={18} />
          <span>Kembali ke Halaman Utama</span>
        </button>
      </div>
    </div>
  {/if}
</div>
