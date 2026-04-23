<script lang="ts">
  import { MoveLeft, Mail, Lock, Eye } from "lucide-svelte";
</script>

<svelte:head>
  <title>Log In | Nama web kita</title>
</svelte:head>

<div
  class="grid grid-cols-1 md:grid-cols-2 h-screen bg-white overflow-hidden relative"
>
  <!-- Back Button -->
  <a
    href="/"
    class="absolute top-6 left-6 md:top-8 md:left-8 p-2 text-gray-400 hover:text-gray-900 transition-all z-50 bg-white/50 backdrop-blur-sm rounded-full border border-gray-100 shadow-sm"
  >
    <MoveLeft size={20} />
  </a>

  <!-- Left Column: Visual Content -->
  <div
    class="hidden md:flex flex-col justify-center items-center relative z-20 bg-white border-r border-gray-50"
  >
    <h1
      class="text-[40px] font-bold text-[#111827] tracking-tight text-center px-12 leading-tight"
    >
      Visual Space
    </h1>

    <!-- Pagination Dots -->
    <div
      class="absolute bottom-12 left-1/2 -translate-x-1/2 flex items-center space-x-2"
    >
      <div class="w-10 h-[3px] bg-[#3D5AFE] rounded-full"></div>
      <div class="w-2.5 h-[3px] bg-[#E5E7EB] rounded-full"></div>
      <div class="w-2.5 h-[3px] bg-[#E5E7EB] rounded-full"></div>
    </div>
  </div>

  <!-- Right Column: Form Area with Shadow Overlay -->
  <div
    class="relative flex flex-col justify-center items-center bg-[#F4F7FA] p-4 md:p-8 lg:p-12 shadow-[inset_16px_0_32px_-16px_rgba(0,0,0,0.08)] overflow-y-auto"
  >
    <!-- Form Card -->
    <div
      class="w-full max-w-[440px] bg-white p-8 md:p-10 rounded-[2.5rem] shadow-[0_10px_40px_-10px_rgba(0,0,0,0.04)] border border-white my-auto"
    >
      <!-- Header -->
      <div class="text-center mb-8">
        <h2 class="text-[28px] font-bold text-[#111827] mb-1 tracking-tight">
          Welcome Back
        </h2>
        <p class="text-[#9CA3AF] text-sm font-medium">Isi apa ya</p>
      </div>

      <!-- Form -->
      <form class="space-y-5" on:submit|preventDefault>
        <!-- Email Field -->
        <div class="space-y-1.5">
          <label
            for="email"
            class="block text-[13px] font-bold text-[#374151] ml-1">Email</label
          >
          <div class="relative group">
            <div
              class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-[#9CA3AF]"
            >
              <Mail size={20} strokeWidth={1.5} />
            </div>
            <input
              type="email"
              id="email"
              class="w-full pl-12 pr-4 py-3 bg-white border border-[#E5E7EB] rounded-2xl focus:outline-none focus:ring-4 focus:ring-[#3D5AFE]/5 focus:border-[#3D5AFE]/50 transition-all text-[14px] text-[#111827] placeholder:text-[#9CA3AF]"
              placeholder="xxx@email.com"
              required
            />
          </div>
        </div>

        <!-- Password Field -->
        <div class="space-y-1.5">
          <div class="flex items-center justify-between ml-1">
            <label for="password" class="text-[13px] font-bold text-[#374151]"
              >Password</label
            >
            <a
              href="#"
              class="text-[11px] font-bold text-[#3D5AFE] hover:opacity-80 transition-opacity"
              >Forgot password?</a
            >
          </div>
          <div class="relative group">
            <div
              class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-[#9CA3AF]"
            >
              <Lock size={20} strokeWidth={1.5} />
            </div>
            <input
              type="password"
              id="password"
              class="w-full pl-12 pr-12 py-3 bg-white border border-[#E5E7EB] rounded-2xl focus:outline-none focus:ring-4 focus:ring-[#3D5AFE]/5 focus:border-[#3D5AFE]/50 transition-all text-[14px] text-[#111827] placeholder:text-[#9CA3AF]"
              placeholder="••••••••"
              required
            />
            <button
              type="button"
              class="absolute inset-y-0 right-0 pr-4 flex items-center text-[#9CA3AF] hover:text-[#6B7280] transition-colors"
            >
              <Eye size={20} strokeWidth={1.5} />
            </button>
          </div>
        </div>

        <!-- Remember Me Checkbox -->
        <div class="flex items-center pt-0.5 ml-1">
          <label class="flex items-center cursor-pointer group">
            <input
              type="checkbox"
              class="w-4 h-4 border border-[#D1D5DB] rounded-full bg-white transition-all appearance-none cursor-pointer relative checked:bg-[#3D5AFE] checked:border-[#3D5AFE]"
            />
            <span
              class="ml-3 text-[12px] text-[#6B7280] font-medium select-none"
            >
              Remember me for 30 days
            </span>
          </label>
        </div>

        <!-- Submit Button -->
        <div class="pt-2">
          <button
            type="submit"
            class="w-full py-3.5 px-4 bg-[#3D5AFE] hover:bg-[#304FFE] text-white rounded-2xl font-bold text-[14px] transition-all shadow-lg shadow-[#3D5AFE]/10"
          >
            Sign In
          </button>
        </div>
      </form>

      <!-- Divider -->
      <div class="relative flex items-center my-8">
        <div class="flex-grow border-t border-[#F3F4F6]"></div>
        <span
          class="flex-shrink-0 px-4 text-[10px] font-bold text-[#9CA3AF] uppercase tracking-[0.1em]"
        >
          Or continue with
        </span>
        <div class="flex-grow border-t border-[#F3F4F6]"></div>
      </div>

      <!-- Social Log In -->
      <div class="grid grid-cols-2 gap-4">
        <button
          type="button"
          class="flex items-center justify-center py-3 px-4 border border-[#E5E7EB] rounded-full hover:bg-gray-50 transition-colors text-[13px] font-bold text-[#374151]"
        >
          Google
        </button>
        <button
          type="button"
          class="flex items-center justify-center py-3 px-4 border border-[#E5E7EB] rounded-full hover:bg-gray-50 transition-colors text-[13px] font-bold text-[#374151]"
        >
          Facebook
        </button>
      </div>

      <!-- Footer -->
      <div class="mt-8 text-center text-[12px] font-medium text-[#6B7280]">
        Don't have an account? <a
          href="/register"
          class="text-[#3D5AFE] hover:underline font-bold inline-flex items-center ml-1"
          >Sign up here <span class="ml-1 text-sm">→</span></a
        >
      </div>
    </div>
  </div>
</div>
