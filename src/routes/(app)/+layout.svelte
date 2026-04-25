<script>
  import Sidebar from "$lib/components/Sidebar.svelte";
  import "../../app.css";
</script>

<div class="flex min-h-screen bg-[#F4F7FA] font-sans">
  <Sidebar />

  <main class="flex-1 p-10 overflow-y-auto">
    <slot />
  </main>
</div>
