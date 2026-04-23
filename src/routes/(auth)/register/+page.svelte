<script lang="ts">
  import { MoveLeft, User, Mail, Lock, RefreshCw } from "lucide-svelte";
</script>

<svelte:head>
  <title>Register | Nama web kita</title>
</svelte:head>

<div
  class="grid grid-cols-1 md:grid-cols-[4fr_6fr] h-screen bg-white overflow-hidden relative font-sans"
>
  <!-- Back Button -->
  <a
    href="/"
    class="absolute top-6 left-6 md:top-8 md:left-8 p-2 text-gray-400 hover:text-gray-900 transition-all z-50 bg-white/50 backdrop-blur-sm rounded-full border border-gray-100 shadow-sm"
  >
    <MoveLeft size={20} />
  </a>

  <!-- Left Column: Form Area -->
  <div
    class="relative flex flex-col justify-center items-center bg-[#F6FAFE] px-6 py-4 md:px-12 lg:px-16 border-r border-gray-100 overflow-hidden"
  >
    <div class="w-full max-w-[400px]">
      <!-- Header -->
      <div class="mb-5">
        <h2 class="text-sm font-bold text-gray-900 mb-0.5">Skill Leap</h2>
        <h1
          class="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 leading-tight mb-1.5 tracking-tight"
        >
          Start Your<br />Architecture
        </h1>
        <p class="text-[#9CA3AF] text-sm font-medium">
          Create an account to begin your 30-day career acceleration protocol.
        </p>
      </div>

      <!-- Social Sign Up -->
      <div class="space-y-2 mb-5">
        <button
          type="button"
          class="w-full flex items-center justify-center py-2.5 px-4 border border-gray-200 bg-white rounded-full hover:bg-gray-50 transition-colors text-[13px] font-bold text-[#374151] shadow-sm"
        >
          Sign up with Google
        </button>
        <button
          type="button"
          class="w-full flex items-center justify-center py-2.5 px-4 border border-gray-200 bg-white rounded-full hover:bg-gray-50 transition-colors text-[13px] font-bold text-[#374151] shadow-sm"
        >
          Sign up with Facebook
        </button>
      </div>

      <!-- Divider -->
      <div class="relative flex items-center mb-5">
        <div class="flex-grow border-t border-[#F3F4F6]"></div>
        <span
          class="flex-shrink-0 px-4 text-[10px] font-bold text-[#9CA3AF] uppercase tracking-[0.1em]"
        >
          Or register with email
        </span>
        <div class="flex-grow border-t border-[#F3F4F6]"></div>
      </div>

      <!-- Form -->
      <form class="space-y-4" on:submit|preventDefault>
        <!-- Full Name -->
        <div class="space-y-1.5">
          <label
            for="name"
            class="block text-[13px] font-bold text-[#374151] ml-1"
            >Full Name</label
          >
          <div class="relative">
            <div
              class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-[#9CA3AF]"
            >
              <User size={18} strokeWidth={1.5} />
            </div>
            <input
              type="text"
              id="name"
              class="w-full pl-11 pr-4 py-2.5 bg-white border border-[#E5E7EB] rounded-2xl focus:outline-none focus:ring-4 focus:ring-[#3D5AFE]/5 focus:border-[#3D5AFE]/50 transition-all text-[14px] text-[#111827] placeholder:text-[#9CA3AF]"
              placeholder="XXX"
              required
            />
          </div>
        </div>

        <!-- Email Address -->
        <div class="space-y-1.5">
          <label
            for="email"
            class="block text-[13px] font-bold text-[#374151] ml-1"
            >Email Address</label
          >
          <div class="relative">
            <div
              class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-[#9CA3AF]"
            >
              <Mail size={18} strokeWidth={1.5} />
            </div>
            <input
              type="email"
              id="email"
              class="w-full pl-11 pr-4 py-2.5 bg-white border border-[#E5E7EB] rounded-2xl focus:outline-none focus:ring-4 focus:ring-[#3D5AFE]/5 focus:border-[#3D5AFE]/50 transition-all text-[14px] text-[#111827] placeholder:text-[#9CA3AF]"
              placeholder="XXX"
              required
            />
          </div>
        </div>

        <!-- Password Row (side by side) -->
        <div class="grid grid-cols-2 gap-3">
          <div class="space-y-1.5">
            <label
              for="password"
              class="block text-[13px] font-bold text-[#374151] ml-1"
              >Password</label
            >
            <div class="relative">
              <div
                class="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#9CA3AF]"
              >
                <Lock size={16} strokeWidth={1.5} />
              </div>
              <input
                type="password"
                id="password"
                class="w-full pl-10 pr-3 py-2.5 bg-white border border-[#E5E7EB] rounded-2xl focus:outline-none focus:ring-4 focus:ring-[#3D5AFE]/5 focus:border-[#3D5AFE]/50 transition-all text-[14px] text-[#111827] placeholder:text-[#9CA3AF]"
                placeholder="••••••••"
                required
              />
            </div>
          </div>
          <div class="space-y-1.5">
            <label
              for="confirm"
              class="block text-[13px] font-bold text-[#374151] ml-1"
              >Confirm</label
            >
            <div class="relative">
              <div
                class="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#9CA3AF]"
              >
                <RefreshCw size={14} strokeWidth={1.5} />
              </div>
              <input
                type="password"
                id="confirm"
                class="w-full pl-10 pr-3 py-2.5 bg-white border border-[#E5E7EB] rounded-2xl focus:outline-none focus:ring-4 focus:ring-[#3D5AFE]/5 focus:border-[#3D5AFE]/50 transition-all text-[14px] text-[#111827] placeholder:text-[#9CA3AF]"
                placeholder="••••••••"
                required
              />
            </div>
          </div>
        </div>

        <!-- Terms Checkbox -->
        <div class="flex items-start ml-1">
          <label class="flex items-start cursor-pointer">
            <input
              type="checkbox"
              class="mt-0.5 w-4 h-4 border border-[#D1D5DB] rounded-full bg-white transition-all appearance-none cursor-pointer relative checked:bg-[#3D5AFE] checked:border-[#3D5AFE]"
              required
            />
            <span
              class="ml-3 text-[12px] text-[#6B7280] font-medium leading-snug select-none"
            >
              I agree to the <a
                href="#"
                class="text-[#3D5AFE] font-bold hover:underline"
                >Terms & Conditions</a
              >
              and
              <a href="#" class="text-[#3D5AFE] font-bold hover:underline"
                >Privacy Policy</a
              >.
            </span>
          </label>
        </div>

        <!-- Submit Button -->
        <div class="pt-1">
          <button
            type="submit"
            class="w-full py-3.5 px-4 bg-[#3D5AFE] hover:bg-[#304FFE] text-white rounded-2xl font-bold text-[14px] transition-all shadow-lg shadow-[#3D5AFE]/10 active:scale-[0.98]"
          >
            Create Account
          </button>
        </div>
      </form>

      <!-- Footer -->
      <div class="mt-5 text-center text-[12px] font-medium text-[#6B7280]">
        Already have an account? <a
          href="/login"
          class="text-[#3D5AFE] hover:underline font-bold inline-flex items-center ml-1"
          >Log in here <span class="ml-1 text-sm">→</span></a
        >
      </div>
    </div>
  </div>

  <!-- Right Column: Visual -->
  <div
    class="hidden md:flex flex-col justify-center items-center bg-white border-l border-gray-50 relative overflow-hidden"
  >
    <!-- Subtle Background Elements -->
    <div
      class="absolute -bottom-20 -right-20 w-80 h-80 bg-blue-50 rounded-full blur-3xl opacity-50"
    ></div>
    <div
      class="absolute -top-20 -left-20 w-80 h-80 bg-blue-50 rounded-full blur-3xl opacity-50"
    ></div>
    <div class="relative z-10 text-center px-12">
      <h3 class="text-2xl font-bold text-gray-200">Visual Space</h3>
    </div>
  </div>
</div>
