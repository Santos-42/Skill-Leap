<script lang="ts">
  import { ArrowLeft, Clock, CheckCircle, XCircle, AlertTriangle, Loader2 } from "lucide-svelte";
  import { fade, fly } from "svelte/transition";

  let { data } = $props();

  interface QuizQuestion {
    question: string;
    options: string[];
  }

  let questions = $state<QuizQuestion[]>([]);
  let answers = $state<Record<number, number>>({});
  let loading = $state(true);
  let submitting = $state(false);
  let error = $state<string | null>(null);
  let cooldown = $state(0);
  let result = $state<any>(null);
  let expiresAt = $state<string | null>(null);
  let timeLeft = $state(0);
  let attemptId = $state<string | null>(null);
  let attemptNumber = $state(1);

  let cooldownInterval: ReturnType<typeof setInterval>;
  let timerInterval: ReturnType<typeof setInterval>;

  // Check status first, then generate if needed
  async function initQuiz() {
    loading = true;
    error = null;
    result = null;

    try {
      // Check status
      const statusRes = await fetch(`/api/quiz/status?moduleId=${data.moduleId}`);
      const status = await statusRes.json();

      if (status.passed) {
        result = { status: 'passed', score: status.score, alreadyCompleted: true };
        loading = false;
        return;
      }

      if (status.cooldownRemaining > 0) {
        cooldown = status.cooldownRemaining;
        startCooldown();
        loading = false;
        return;
      }

      if (status.hasActiveAttempt && status.activeAttempt) {
        attemptId = status.activeAttempt.id;
        expiresAt = status.activeAttempt.expiresAt;
        attemptNumber = status.activeAttempt.attemptNumber;
      }

      // Generate quiz
      const res = await fetch('/api/quiz/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ moduleId: data.moduleId })
      });

      if (!res.ok) {
        const err = await res.json();
        if (res.status === 429) {
          cooldown = err.cooldown_remaining || 300;
          startCooldown();
          loading = false;
          return;
        }
        error = err.error || 'Gagal memuat quiz';
        loading = false;
        return;
      }

      const quiz = await res.json();
      questions = quiz.questions;
      attemptId = quiz.attemptId;
      expiresAt = quiz.expiresAt;
      attemptNumber = quiz.attemptNumber || 1;
      answers = {};

      // Start timer
      calculateTimeLeft();
      timerInterval = setInterval(() => {
        calculateTimeLeft();
        if (timeLeft <= 0) {
          clearInterval(timerInterval);
          if (!result && !submitting) {
            submitQuiz(true);
          }
        }
      }, 1000);

      loading = false;
    } catch (err: any) {
      error = 'Gagal menghubungkan server';
      loading = false;
    }
  }

  function calculateTimeLeft() {
    if (!expiresAt) return;
    const diff = new Date(expiresAt).getTime() - Date.now();
    timeLeft = Math.max(0, Math.floor(diff / 1000));
  }

  function startCooldown() {
    cooldownInterval = setInterval(() => {
      cooldown--;
      if (cooldown <= 0) {
        clearInterval(cooldownInterval);
        cooldown = 0;
        initQuiz();
      }
    }, 1000);
  }

  function formatTime(seconds: number) {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }

  function selectAnswer(questionIndex: number, optionIndex: number) {
    if (submitting || result) return;
    answers = { ...answers, [questionIndex]: optionIndex };
  }

  async function submitQuiz(isTimeout = false) {
    if (!attemptId) return;
    if (!isTimeout && Object.keys(answers).length < questions.length) {
      error = 'Silakan jawab semua pertanyaan terlebih dahulu';
      return;
    }

    submitting = true;
    error = null;

    try {
      const res = await fetch('/api/quiz/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ attemptId, answers })
      });

      const data = await res.json();

      if (!res.ok) {
        error = data.error || 'Gagal submit quiz';
        submitting = false;
        return;
      }

      result = data;
      if (timerInterval) clearInterval(timerInterval);

      if (!data.passed) {
        cooldown = 300; // 5 minutes
        startCooldown();
      }

      submitting = false;
    } catch (err: any) {
      error = 'Gagal menghubungkan server';
      submitting = false;
    }
  }

  $effect(() => {
    initQuiz();

    return () => {
      if (timerInterval) clearInterval(timerInterval);
      if (cooldownInterval) clearInterval(cooldownInterval);
    };
  });
</script>

<div class="max-w-3xl mx-auto space-y-8 pb-20">
  <!-- Header -->
  <div class="flex items-center justify-between">
    <a
      href="/roadmap"
      class="flex items-center space-x-2 text-gray-500 hover:text-blue-600 font-bold transition-colors group"
    >
      <ArrowLeft size={20} class="group-hover:-translate-x-1 transition-transform" />
      <span>Kembali ke Roadmap</span>
    </a>
    <div class="px-4 py-1.5 bg-blue-50 text-blue-600 rounded-full text-xs font-black uppercase tracking-wider">
      Quiz Akhir Modul
    </div>
  </div>

  {#if loading}
    <div class="bg-white rounded-[2.5rem] p-12 border border-gray-100 shadow-xl shadow-blue-50/50 flex flex-col items-center space-y-6" in:fade>
      <Loader2 size={48} class="text-blue-500 animate-spin" />
      <p class="text-gray-500 font-bold">Mempersiapkan Quiz...</p>
      <p class="text-gray-400 text-sm">AI sedang menyusun soal untuk Anda</p>
    </div>
  {:else if error}
    <div class="bg-white rounded-[2.5rem] p-12 border border-gray-100 shadow-xl shadow-blue-50/50 flex flex-col items-center space-y-6" in:fade>
      <AlertTriangle size={48} class="text-red-400" />
      <p class="text-red-600 font-bold">{error}</p>
      {#if cooldown > 0}
        <p class="text-gray-500">Silakan tunggu <span class="text-red-600 font-bold">{formatTime(cooldown)}</span></p>
      {:else}
        <button onclick={initQuiz} class="bg-blue-600 text-white px-6 py-3 rounded-2xl font-bold hover:bg-blue-700 transition-all">
          Coba Lagi
        </button>
      {/if}
    </div>
  {:else if result}
    <!-- Result View -->
    <div class="bg-white rounded-[2.5rem] p-8 border border-gray-100 shadow-xl shadow-blue-50/50 space-y-8" in:fade>
      {#if result.alreadyCompleted}
        <div class="flex flex-col items-center space-y-6 py-8">
          <div class="w-24 h-24 bg-green-50 rounded-full flex items-center justify-center">
            <CheckCircle size={48} class="text-green-500" />
          </div>
          <h2 class="text-3xl font-black text-gray-800">Quiz Sudah Lulus!</h2>
          <p class="text-gray-500 text-lg">Anda telah menyelesaikan quiz modul ini sebelumnya.</p>
          <div class="bg-gray-50 rounded-2xl p-6 text-center">
            <p class="text-sm text-gray-400">Skor Akhir</p>
            <p class="text-5xl font-black text-blue-600">{result.score}/100</p>
          </div>
          <div class="flex flex-col items-center space-y-3">
            <div class="flex items-center gap-4">
              <a href="/roadmap" class="bg-blue-600 text-white px-8 py-4 rounded-2xl font-bold hover:bg-blue-700 transition-all shadow-xl shadow-blue-200">
                Kembali ke Roadmap
              </a>
              {#if data.nextModuleFirstMaterialId}
                <a href="/roadmap/{data.nextModuleFirstMaterialId}" class="bg-green-600 text-white px-8 py-4 rounded-2xl font-bold hover:bg-green-700 transition-all shadow-xl shadow-green-200">
                  Lanjut ke Materi Selanjutnya
                </a>
              {/if}
            </div>
            {#if attemptId}
              <a href="/roadmap/{data.moduleId}/quiz/review/{attemptId}" class="text-blue-600 font-bold hover:underline text-sm">
                Lihat Review Jawaban
              </a>
            {/if}
          </div>
        </div>
      {:else if result.passed}
        <div class="flex flex-col items-center space-y-6 py-8">
          <div class="w-24 h-24 bg-green-50 rounded-full flex items-center justify-center">
            <CheckCircle size={48} class="text-green-500" />
          </div>
          <h2 class="text-3xl font-black text-green-600">Selamat! Anda Lulus!</h2>
          <div class="bg-gray-50 rounded-2xl p-6 text-center">
            <p class="text-sm text-gray-400">Skor Anda</p>
            <p class="text-5xl font-black text-blue-600">{result.score}/100</p>
            <p class="text-sm text-gray-500 mt-2">{result.correctCount} dari {result.totalQuestions} benar</p>
          </div>
          <div class="flex flex-col items-center space-y-3">
            <div class="flex items-center gap-4">
              <a href="/roadmap" class="bg-blue-600 text-white px-8 py-4 rounded-2xl font-bold hover:bg-blue-700 transition-all shadow-xl shadow-blue-200">
                Kembali ke Roadmap
              </a>
              {#if data.nextModuleFirstMaterialId}
                <a href="/roadmap/{data.nextModuleFirstMaterialId}" class="bg-green-600 text-white px-8 py-4 rounded-2xl font-bold hover:bg-green-700 transition-all shadow-xl shadow-green-200">
                  Lanjut ke Materi Selanjutnya
                </a>
              {/if}
            </div>
            {#if attemptId}
              <a href="/roadmap/{data.moduleId}/quiz/review/{attemptId}" class="text-blue-600 font-bold hover:underline text-sm">
                Lihat Review Jawaban
              </a>
            {/if}
          </div>
        </div>
      {:else}
        <div class="flex flex-col items-center space-y-6 py-8">
          <div class="w-24 h-24 bg-red-50 rounded-full flex items-center justify-center">
            <XCircle size={48} class="text-red-500" />
          </div>
          <h2 class="text-3xl font-black text-red-600">Belum Lulus</h2>
          <p class="text-gray-500 text-lg">Skor minimum untuk lulus adalah 70</p>
          <div class="bg-gray-50 rounded-2xl p-6 text-center">
            <p class="text-sm text-gray-400">Skor Anda</p>
            <p class="text-5xl font-black text-red-500">{result.score}/100</p>
            <p class="text-sm text-gray-500 mt-2">{result.correctCount} dari {result.totalQuestions} benar</p>
          </div>
          <div class="bg-amber-50 rounded-2xl p-4 border border-amber-200">
            <p class="text-amber-700 font-bold">Cooldown: <span class="font-black">{formatTime(cooldown)}</span></p>
            <p class="text-amber-600 text-sm mt-1">Silakan pelajari ulang materi sebelum mencoba lagi</p>
          </div>
          {#if cooldown <= 0}
            <div class="flex items-center gap-4">
              <button onclick={initQuiz} class="bg-blue-600 text-white px-8 py-4 rounded-2xl font-bold hover:bg-blue-700 transition-all shadow-xl shadow-blue-200">
                Coba Lagi
              </button>
              {#if data.lastMaterialId}
                <a href="/roadmap/{data.lastMaterialId}" class="bg-white border-2 border-gray-200 text-gray-700 px-8 py-4 rounded-2xl font-bold hover:border-blue-500 hover:text-blue-600 transition-all">
                  Kembali ke Materi
                </a>
              {/if}
            </div>
          {:else}
            <div class="flex items-center gap-4">
              <a href="/roadmap" class="bg-blue-600 text-white px-8 py-4 rounded-2xl font-bold hover:bg-blue-700 transition-all shadow-xl shadow-blue-200">
                Kembali ke Roadmap
              </a>
              {#if data.lastMaterialId}
                <a href="/roadmap/{data.lastMaterialId}" class="bg-white border-2 border-gray-200 text-gray-700 px-8 py-4 rounded-2xl font-bold hover:border-blue-500 hover:text-blue-600 transition-all">
                  Kembali ke Materi
                </a>
              {/if}
            </div>
          {/if}
          {#if attemptId}
            <a href="/roadmap/{data.moduleId}/quiz/review/{attemptId}" class="text-blue-600 font-bold hover:underline text-sm mt-2">
              Lihat Review Jawaban
            </a>
          {/if}
        </div>
      {/if}
    </div>
  {:else if cooldown > 0}
    <div class="bg-white rounded-[2.5rem] p-12 border border-gray-100 shadow-xl shadow-blue-50/50 flex flex-col items-center space-y-6" in:fade>
      <Clock size={48} class="text-amber-500" />
      <div class="text-center">
        <p class="text-2xl font-black text-gray-800">Quiz Sedang Cooldown</p>
        <p class="text-gray-500 mt-2">Silakan tunggu sebelum bisa mengambil quiz lagi</p>
        <p class="text-5xl font-black text-amber-600 mt-4">{formatTime(cooldown)}</p>
      </div>
      <div class="flex flex-col items-center space-y-3">
        <div class="flex items-center gap-4">
          <a href="/roadmap" class="bg-blue-600 text-white px-8 py-4 rounded-2xl font-bold hover:bg-blue-700 transition-all shadow-xl shadow-blue-200">
            Kembali ke Roadmap
          </a>
          {#if data.lastMaterialId}
            <a href="/roadmap/{data.lastMaterialId}" class="bg-white border-2 border-gray-200 text-gray-700 px-8 py-4 rounded-2xl font-bold hover:border-blue-500 hover:text-blue-600 transition-all">
              Kembali ke Materi
            </a>
          {/if}
        </div>
        {#if data.latestAttemptId}
          <a href="/roadmap/{data.moduleId}/quiz/review/{data.latestAttemptId}" class="text-blue-600 font-bold hover:underline text-sm mt-4">
            Lihat Review Jawaban
          </a>
        {/if}
      </div>
    </div>
  {:else}
    <!-- Quiz View -->
    <div class="space-y-6" in:fade>
      <!-- Progress Bar (sticky with timer) -->
      <div class="bg-white/90 backdrop-blur-md rounded-[2.5rem] p-6 border border-gray-100 shadow-md sticky top-[10px] z-50">
        <div class="flex justify-between items-center mb-3">
          <div>
            <h2 class="text-xl font-black text-gray-800">{data.moduleName}</h2>
            <span class="text-sm text-gray-400 font-bold">Attempt #{attemptNumber}</span>
          </div>
          {#if timeLeft > 0}
            <div class="flex items-center space-x-2 px-4 py-2 bg-amber-50 text-amber-700 rounded-full text-sm font-bold">
              <Clock size={16} />
              <span>{formatTime(timeLeft)}</span>
            </div>
          {/if}
        </div>
        <div class="flex justify-between text-xs text-gray-400 mb-2">
          <span>Progress</span>
          <span>{Object.keys(answers).length}/{questions.length} terjawab</span>
        </div>
        <div class="h-2 bg-gray-100 rounded-full overflow-hidden">
          <div
            class="h-full bg-blue-600 rounded-full transition-all duration-500"
            style="width: {(Object.keys(answers).length / questions.length) * 100}%"
          ></div>
        </div>
      </div>

      <!-- Questions -->
      {#each questions as q, i}
        <div class="bg-white rounded-[2.5rem] p-8 border border-gray-100 shadow-xl shadow-blue-50/50 space-y-6" transition:fly={{ y: 20, delay: i * 100 }}>
          <div class="flex items-start space-x-3">
            <div
              class="w-10 h-10 rounded-full flex items-center justify-center font-black text-sm shrink-0 {answers[i] !== undefined ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-500'}"
            >
              {i + 1}
            </div>
            <h3 class="text-lg font-bold text-gray-800 leading-relaxed pt-1">{q.question}</h3>
          </div>

          <div class="space-y-3 pl-13">
            {#each q.options as opt, j}
              <button
                onclick={() => selectAnswer(i, j)}
                disabled={submitting || !!result}
                class="w-full text-left p-4 rounded-2xl border-2 transition-all font-bold text-sm
                  {answers[i] === j
                    ? 'border-blue-500 bg-blue-50 text-blue-700 shadow-md'
                    : 'border-gray-100 bg-gray-50 text-gray-600 hover:border-blue-300 hover:bg-blue-50/50'
                  }"
              >
                {opt}
              </button>
            {/each}
          </div>
        </div>
      {/each}

      <!-- Submit Button -->
      <div class="flex justify-center pt-4">
        <button
          onclick={submitQuiz}
          disabled={submitting || Object.keys(answers).length < questions.length}
          class="px-12 py-5 bg-blue-600 text-white rounded-[2rem] font-black text-lg transition-all shadow-xl shadow-blue-200
            hover:bg-blue-700 hover:shadow-2xl hover:shadow-blue-300
            disabled:bg-gray-300 disabled:shadow-none disabled:cursor-not-allowed"
        >
          {#if submitting}
            <span class="flex items-center space-x-2">
              <Loader2 size={20} class="animate-spin" />
              <span>Memeriksa...</span>
            </span>
          {:else}
            Submit Quiz
          {/if}
        </button>
      </div>
    </div>
  {/if}
</div>
