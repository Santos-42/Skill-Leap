<script>
  import { page } from "$app/stores";
  import Sidebar from "$lib/components/Sidebar.svelte";
  import "../../app.css";

  let { data } = $props();

  let isMaterialPage = $derived(
    /^\/roadmap\/(?!checkpoint-review(?:\/|$))[^\/]+$/.test($page.url.pathname) ||
    /\/quiz/.test($page.url.pathname)
  );
</script>

<div class="flex min-h-screen bg-[#F4F7FA] font-sans">
  {#if !isMaterialPage}
    <Sidebar user={data.user} />
  {/if}

  <main class="flex-1 p-10">
    <slot />
  </main>
</div>
