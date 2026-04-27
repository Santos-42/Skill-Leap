<script lang="ts">
  import {
    Menu,
    X as Close,
    ArrowRight,
    Cpu,
    Zap,
    Target,
    Plus,
    Mail,
    MapPin,
    Phone,
    Play,
  } from "lucide-svelte";
  import {
    SiFacebook as Facebook,
    SiInstagram as Instagram,
    SiX as X,
  } from "@icons-pack/svelte-simple-icons";

  let openFaqIndex = $state(-1);
  let mobileMenuOpen = $state(false);
  let scrolled = $state(false);

  function handleScroll() {
    // Trigger floating state once user scrolls past the navbar height
    scrolled = window.scrollY > 10;
  }

  const faqs = [
    {
      question: "Question 1",
      answer:
        "Lorem ipsum dolor sit amet consectetur. Eget accumsan id ut quisque morbi pellentesque nunc. Placerat non a aliquet posuere sit feugiat a consequat. Netus at pellentesque.",
    },
    {
      question: "Question 2",
      answer:
        "Lorem ipsum dolor sit amet consectetur. Eget accumsan id ut quisque morbi pellentesque nunc. Placerat non a aliquet posuere sit feugiat a consequat. Netus at pellentesque.",
    },
    {
      question: "Question 3",
      answer:
        "Lorem ipsum dolor sit amet consectetur. Eget accumsan id ut quisque morbi pellentesque nunc. Placerat non a aliquet posuere sit feugiat a consequat. Netus at pellentesque.",
    },
    {
      question: "Question 4",
      answer:
        "Lorem ipsum dolor sit amet consectetur. Eget accumsan id ut quisque morbi pellentesque nunc. Placerat non a aliquet posuere sit feugiat a consequat. Netus at pellentesque.",
    },
    {
      question: "Question 5",
      answer:
        "Lorem ipsum dolor sit amet consectetur. Eget accumsan id ut quisque morbi pellentesque nunc. Placerat non a aliquet posuere sit feugiat a consequat. Netus at pellentesque.",
    },
  ];

  function toggleFaq(index: number) {
    openFaqIndex = openFaqIndex === index ? -1 : index;
  }

  const steps = [
    { number: 1, title: "Login" },
    { number: 2, title: "Open Roadmap" },
    { number: 3, title: "Choose Topic" },
    { number: 4, title: "Practice" },
    { number: 5, title: "Mini Project" },
  ];
</script>

<svelte:window onscroll={handleScroll} />

<svelte:head>
  <title>Skill Leap</title>
  <meta
    name="description"
    content="Platform pembelajaran berbasis AI untuk memvalidasi skill dan simulasi wawancara."
  />
</svelte:head>

<div
  class="min-h-screen bg-white text-black font-sans selection:bg-blue-100 overflow-x-hidden"
>
  <!-- Navbar -->
  <!-- Docked at top when at page top (full-width), floating pill when scrolled -->
  <nav
    class="fixed top-0 left-0 right-0 z-50 transition-all duration-300 ease-in-out {scrolled
      ? 'pt-3 px-6 md:px-12'
      : ''}"
  >
    <div
      class="flex justify-between items-center px-6 md:px-12 py-4 transition-all duration-300 ease-in-out bg-white {scrolled
        ? 'max-w-[1400px] mx-auto rounded-[20px] shadow-xl shadow-black/[0.08] border border-gray-100'
        : 'border-b border-gray-100'}"
    >
      <a
        href="#home"
        class="text-brand-blue text-xl md:text-2xl font-bold font-inter tracking-tight hover:opacity-80 transition-opacity"
      >
        Skill Leap
      </a>

      <!-- Desktop Nav -->
      <div class="hidden lg:flex gap-8 items-center">
        <a
          href="#home"
          class="text-sm font-medium hover:text-brand-blue transition-colors"
          >Home</a
        >
        <a
          href="#features"
          class="text-sm font-medium hover:text-brand-blue transition-colors"
          >Features</a
        >
        <a
          href="#how-it-works"
          class="text-sm font-medium hover:text-brand-blue transition-colors"
          >How it Works</a
        >
        <a
          href="#faq"
          class="text-sm font-medium hover:text-brand-blue transition-colors"
          >FAQ</a
        >
      </div>

      <div class="hidden lg:flex gap-4 items-center">
        <a
          href="/login"
          class="text-brand-indigo font-bold text-sm hover:underline underline-offset-4 decoration-2"
          >Login</a
        >
        <a
          href="/register"
          class="bg-brand-indigo text-white px-5 py-2 rounded-xl font-bold text-sm hover:bg-brand-indigo/90 transition-all shadow-sm"
          >Sign Up</a
        >
      </div>

      <!-- Mobile Menu Toggle -->
      <button
        class="lg:hidden p-2"
        onclick={() => (mobileMenuOpen = !mobileMenuOpen)}
        aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
      >
        {#if mobileMenuOpen}
          <Close size={24} />
        {:else}
          <Menu size={24} />
        {/if}
      </button>
    </div>
  </nav>

  <!-- Mobile Menu -->
  {#if mobileMenuOpen}
    <div
      class="lg:hidden fixed inset-0 z-40 bg-white flex flex-col items-center justify-center gap-6 pt-20"
    >
      <a
        href="#home"
        onclick={() => (mobileMenuOpen = false)}
        class="text-lg font-medium">Home</a
      >
      <a
        href="#features"
        onclick={() => (mobileMenuOpen = false)}
        class="text-lg font-medium">Features</a
      >
      <a
        href="#how-it-works"
        onclick={() => (mobileMenuOpen = false)}
        class="text-lg font-medium">How it Works</a
      >
      <a
        href="#faq"
        onclick={() => (mobileMenuOpen = false)}
        class="text-lg font-medium">FAQ</a
      >
      <div class="flex flex-col gap-3 w-full px-10">
        <a
          href="/register"
          class="bg-brand-indigo text-white py-3 rounded-lg text-center font-bold"
          >Sign Up</a
        >
        <a href="/login" class="text-brand-indigo text-center font-bold py-2"
          >Login</a
        >
      </div>
    </div>
  {/if}

  <!-- Hero Section -->
  <section
    id="home"
    class="relative bg-slate-950 py-20 md:py-24 lg:py-32 flex items-center min-h-[80vh] pt-36 md:pt-40 lg:pt-44"
  >
    <!-- Tech Background -->
    <div class="absolute inset-0 opacity-10 pointer-events-none">
      <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern
            id="tech-grid"
            width="40"
            height="40"
            patternUnits="userSpaceOnUse"
          >
            <path
              d="M 40 0 L 0 0 0 40"
              fill="none"
              stroke="#3b82f6"
              stroke-width="0.3"
            />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#tech-grid)" />
      </svg>
    </div>
    <div
      class="absolute inset-0 bg-gradient-to-b from-slate-950 via-transparent to-slate-950 pointer-events-none"
    ></div>

    <div
      class="max-w-7xl mx-auto px-4 md:px-8 w-full relative z-10 text-center"
    >
      <h1
        class="text-white text-4xl md:text-5xl lg:text-6xl font-extrabold leading-tight tracking-tight"
      >
        Bangun <span class="text-blue-500">Karir Teknologi</span><br
          class="hidden md:block"
        />
        Dengan <span class="text-blue-500">Percaya Diri</span>
      </h1>
      <p
        class="text-gray-300 text-base md:text-lg max-w-2xl mx-auto mt-8 mb-12 leading-relaxed"
      >
        Platform pembelajaran berbasis AI yang dirancang untuk memvalidasi skill
        Anda, membangun roadmap personal, evaluasi portofolio, dan simulasi
        wawancara yang mirip kondisi perusahaan Anda.
      </p>

      <div class="flex flex-col sm:flex-row gap-4 justify-center items-center">
        <a
          href="/register"
          class="bg-brand-indigo text-white px-8 py-3.5 rounded-xl text-base font-bold hover:bg-brand-indigo/90 transition-all shadow-lg flex items-center gap-2"
        >
          Get Started <ArrowRight size={18} />
        </a>
        <a
          href="#features"
          class="bg-white/10 backdrop-blur-sm text-gray-200 border border-white/20 px-8 py-3.5 rounded-xl text-base font-bold hover:bg-white/20 transition-all flex items-center gap-2"
        >
          Pelajari Fitur
        </a>
      </div>
    </div>
  </section>

  <!-- Features Section -->
  <section id="features" class="py-16 md:py-24 bg-[#DBEDFF]">
    <div class="max-w-7xl mx-auto px-4 md:px-8 w-full text-center">
      <h2
        class="text-brand-purple text-3xl md:text-4xl lg:text-5xl font-bold mb-16"
      >
        Features
      </h2>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-10">
        <div
          class="bg-white rounded-3xl p-8 shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 border border-white/80 flex flex-col items-center"
        >
          <div
            class="w-full aspect-video bg-slate-50/50 rounded-2xl mb-8 flex items-center justify-center text-brand-light-purple"
          >
            <Cpu size={48} strokeWidth={1.5} />
          </div>
          <h3
            class="text-brand-light-purple text-xl md:text-2xl font-bold mb-4"
          >
            AI Roadmap
          </h3>
          <p
            class="text-gray-600 text-sm md:text-base leading-relaxed text-center font-sans"
          >
            Membangun roadmap personal yang dirancang khusus untuk memvalidasi
            skill Anda dan mempercepat karir teknologi.
          </p>
        </div>
        <div
          class="bg-white rounded-3xl p-8 shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 border border-white/80 flex flex-col items-center"
        >
          <div
            class="w-full aspect-video bg-slate-50/50 rounded-2xl mb-8 flex items-center justify-center text-brand-light-purple"
          >
            <Zap size={48} strokeWidth={1.5} />
          </div>
          <h3
            class="text-brand-light-purple text-xl md:text-2xl font-bold mb-4"
          >
            Real-time Feedback
          </h3>
          <p
            class="text-gray-600 text-sm md:text-base leading-relaxed text-center font-sans"
          >
            Dapatkan evaluasi portofolio dan feedback instan berbasis AI untuk
            meningkatkan kualitas pekerjaan Anda.
          </p>
        </div>
        <div
          class="bg-white rounded-3xl p-8 shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 border border-white/80 flex flex-col items-center"
        >
          <div
            class="w-full aspect-video bg-slate-50/50 rounded-2xl mb-8 flex items-center justify-center text-brand-light-purple"
          >
            <Target size={48} strokeWidth={1.5} />
          </div>
          <h3
            class="text-brand-light-purple text-xl md:text-2xl font-bold mb-4"
          >
            Interview Simulator
          </h3>
          <p
            class="text-gray-600 text-sm md:text-base leading-relaxed text-center font-sans"
          >
            Simulasi wawancara dengan kondisi yang mirip dengan perusahaan
            target Anda untuk meningkatkan rasa percaya diri.
          </p>
        </div>
      </div>
    </div>
  </section>

  <!-- How it Works Section -->
  <section
    id="how-it-works"
    class="py-24 md:py-32 bg-[#DBEDFF] overflow-hidden relative z-10"
  >
    <div class="max-w-7xl mx-auto px-4 md:px-8 w-full text-center">
      <h2
        class="text-brand-purple text-3xl md:text-4xl lg:text-5xl font-bold mb-32 md:mb-40"
      >
        How it Works
      </h2>

      <div
        class="flex flex-col md:flex-row items-center justify-between relative min-h-[400px] w-full"
      >
        {#each steps as step, i}
          <!-- Node Container -->
          <div class="relative z-10 flex flex-col items-center flex-shrink-0">
            <div
              class="w-32 h-32 lg:w-44 lg:h-44 rounded-full bg-blue-300 border-4 border-white shadow-xl flex flex-col items-center justify-center transition-transform duration-300 {i %
                2 !==
              0
                ? 'md:translate-y-20'
                : 'md:-translate-y-20'}"
            >
              <span
                class="text-white text-2xl lg:text-4xl font-bold leading-none"
                >{step.number}</span
              >
              <span
                class="text-white text-[11px] lg:text-sm font-bold uppercase tracking-wider text-center px-4 mt-2 leading-tight"
                >{step.title}</span
              >
            </div>
          </div>

          <!-- Connector Arrow (Desktop Only) -->
          {#if i < steps.length - 1}
            <div
              class="hidden md:flex flex-1 items-center justify-center px-0 z-0"
            >
              <svg
                class="w-full max-w-[80px] text-[#818CF8] {i % 2 === 0
                  ? 'rotate-[30deg]'
                  : '-rotate-[30deg]'}"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2.5"
                stroke-linecap="round"
                stroke-linejoin="round"
              >
                <path d="M5 12h14"></path>
                <path d="m12 5 7 7-7 7"></path>
              </svg>
            </div>
          {/if}
        {/each}
      </div>
    </div>
  </section>

  <!-- FAQ Section -->
  <section
    id="faq"
    class="py-20 md:py-32 bg-[#BCE1FF] relative z-10 shadow-[0_20px_40px_rgba(0,0,0,0.5)]"
  >
    <div class="max-w-7xl mx-auto px-4 md:px-8 w-full">
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-12 md:gap-20">
        <!-- Left Side -->
        <div>
          <h2
            class="text-brand-purple text-3xl md:text-4xl lg:text-5xl font-bold leading-tight mb-6"
          >
            Frequently <br class="hidden lg:block" />Asked Question
          </h2>

          <div
            class="bg-white/90 backdrop-blur-md rounded-3xl p-8 md:p-10 shadow-md border border-white/50"
          >
            <h3 class="text-slate-800 text-xl font-bold mb-6">
              Still Have Questions?
            </h3>
            <form class="space-y-6">
              <div>
                <label
                  for="email"
                  class="block text-slate-700 font-bold text-sm mb-2"
                  >Gmail:</label
                >
                <input
                  type="email"
                  id="email"
                  placeholder="Enter your email"
                  class="w-full bg-slate-50 border border-slate-200 px-4 py-3 rounded-xl outline-none text-sm focus:ring-2 focus:ring-brand-blue/20"
                />
              </div>
              <div>
                <label
                  for="question"
                  class="block text-slate-700 font-bold text-sm mb-2"
                  >Question:</label
                >
                <textarea
                  id="question"
                  rows="3"
                  placeholder="Enter your question"
                  class="w-full bg-slate-50 border border-slate-200 px-4 py-3 rounded-xl outline-none text-sm focus:ring-2 focus:ring-brand-blue/20 resize-none"
                ></textarea>
              </div>
              <button
                type="submit"
                class="w-full bg-[#FF5F5F] text-white py-3.5 rounded-xl text-sm font-bold hover:bg-red-600 transition-all shadow-md flex items-center justify-center gap-2"
              >
                Submit <ArrowRight size={16} />
              </button>
            </form>
          </div>
        </div>

        <!-- Right Side -->
        <div class="space-y-4">
          {#each faqs as faq, i}
            <div
              class="bg-white/60 backdrop-blur-md rounded-2xl border border-white/80 shadow-sm overflow-hidden text-brand-blue"
            >
              <button
                class="w-full text-left px-6 py-6 flex justify-between items-center transition-colors hover:bg-white/80"
                onclick={() => toggleFaq(i)}
                aria-expanded={openFaqIndex === i}
              >
                <span
                  class="text-slate-800 text-base md:text-lg font-semibold leading-tight"
                  >{faq.question}</span
                >
                <Plus
                  size={20}
                  class="transition-transform duration-300 {openFaqIndex === i
                    ? 'rotate-45'
                    : ''}"
                />
              </button>
              <div
                class="transition-all duration-300 ease-in-out px-6 overflow-hidden"
                style="max-height: {openFaqIndex === i ? '300px' : '0px'}"
              >
                <div
                  class="pb-6 text-gray-500 text-sm md:text-base leading-relaxed font-sans"
                >
                  {faq.answer}
                </div>
              </div>
            </div>
          {/each}
        </div>
      </div>
    </div>
  </section>

  <!-- Footer -->
  <footer
    class="bg-[#DBEDFF] border-t border-white/20 py-16 md:py-20 shadow-[0_-15px_40px_rgba(0,0,0,0.05)] relative z-10"
  >
    <div
      class="max-w-7xl mx-auto px-4 md:px-8 w-full grid grid-cols-1 md:grid-cols-3 gap-12 lg:gap-16"
    >
      <!-- Brand -->
      <div class="space-y-6">
        <h2
          class="text-brand-blue text-xl md:text-2xl font-bold font-inter tracking-tight"
        >
          Skill Leap
        </h2>
        <p class="text-gray-500 text-xs md:text-sm leading-relaxed max-w-sm">
          Platform pembelajaran berbasis AI yang dirancang untuk memvalidasi
          skill Anda, membangun roadmap personal, evaluasi portofolio, dan
          simulasi wawancara.
        </p>
        <div class="flex gap-3">
          <a
            href="#"
            aria-label="Facebook"
            class="w-8 h-8 bg-white rounded-full flex items-center justify-center text-brand-blue shadow-sm hover:scale-110 transition-transform"
          >
            <Facebook size={16} />
          </a>
          <a
            href="#"
            aria-label="X (Twitter)"
            class="w-8 h-8 bg-white rounded-full flex items-center justify-center text-brand-blue shadow-sm hover:scale-110 transition-transform"
          >
            <X size={16} />
          </a>
          <a
            href="#"
            aria-label="Instagram"
            class="w-8 h-8 bg-white rounded-full flex items-center justify-center text-brand-blue shadow-sm hover:scale-110 transition-transform"
          >
            <Instagram size={16} />
          </a>
        </div>
      </div>

      <!-- Contact -->
      <div class="space-y-6">
        <h2
          class="text-brand-blue text-lg font-bold font-inter flex items-center gap-2"
        >
          Contact Us
        </h2>
        <div class="space-y-4">
          <div class="flex items-start gap-3">
            <MapPin size={16} class="text-brand-blue shrink-0 mt-0.5" />
            <p class="text-gray-500 text-xs md:text-sm">
              Jl. Kebon Jeruk Raya No. 27, Jakarta
            </p>
          </div>
          <div class="flex items-center gap-3">
            <Mail size={16} class="text-brand-blue" />
            <p class="text-gray-500 text-xs md:text-sm">info@skillleap.com</p>
          </div>
          <div class="flex items-center gap-3">
            <Phone size={16} class="text-brand-blue" />
            <p class="text-gray-500 text-xs md:text-sm">(+62) 812 3456 7890</p>
          </div>
        </div>
      </div>

      <!-- Links -->
      <div class="space-y-6">
        <h2 class="text-brand-blue text-lg font-bold font-inter">Service</h2>
        <div class="grid grid-cols-2 gap-3">
          <a
            href="#home"
            class="text-gray-500 text-sm hover:text-brand-blue transition-colors"
            >Home</a
          >
          <a
            href="#features"
            class="text-gray-500 text-sm hover:text-brand-blue transition-colors"
            >Features</a
          >
          <a
            href="#how-it-works"
            class="text-gray-500 text-sm hover:text-brand-blue transition-colors"
            >How it Works</a
          >
          <a
            href="#faq"
            class="text-gray-500 text-sm hover:text-brand-blue transition-colors"
            >FAQ</a
          >
        </div>
      </div>
    </div>
  </footer>
</div>

<style>
  :global(html) {
    scroll-behavior: smooth;
  }
</style>
