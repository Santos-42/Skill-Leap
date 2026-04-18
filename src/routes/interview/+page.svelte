<script lang="ts">
  import { InterviewManager, ROLES } from '$lib/features/interview/interview.svelte';

  let manager = new InterviewManager();
</script>

<style>
  :global(body) {
    background-color: #ffffff;
    color: #000000;
    font-family: 'Courier New', Courier, monospace;
    padding: 20px;
  }
  .container {
    max-width: 800px;
    margin: 0 auto;
    border: 2px solid #000000;
    padding: 20px;
  }
  .header {
    border-bottom: 2px solid #000000;
    padding-bottom: 10px;
    margin-bottom: 20px;
  }
  .controls {
    display: flex;
    flex-wrap: wrap;
    gap: 15px;
    margin-bottom: 20px;
    padding-bottom: 20px;
    border-bottom: 1px dashed #000000;
  }
  select, button {
    background-color: #ffffff;
    color: #000000;
    border: 2px solid #000000;
    padding: 8px 15px;
    font-family: inherit;
    font-weight: bold;
    cursor: pointer;
  }
  button:hover {
    background-color: #000000;
    color: #ffffff;
  }
  button:disabled {
    opacity: 0.3;
    cursor: not-allowed;
  }
  button:disabled:hover {
    background-color: #ffffff;
    color: #000000;
  }
  .status-box {
    border: 2px dashed #000000;
    padding: 15px;
    margin-bottom: 20px;
  }
  .box {
    border: 2px solid #000000;
    height: 300px;
    overflow-y: auto;
    padding: 10px;
    margin-bottom: 20px;
  }
  .transcript-item {
    margin-bottom: 12px;
    line-height: 1.5;
  }
  .transcript-item.ai {
    color: #000000;
  }
  .transcript-item.user {
    color: #444444;
  }
  .speaker-label {
    font-weight: bold;
    margin-right: 6px;
  }
</style>

<div class="container">
  <div class="header">
    <h1>Interview Tester</h1>
    <p>Interview</p>
  </div>

  <div class="controls">
    <div>
      <label for="role">Role:</label>
      <select id="role" bind:value={manager.selectedRole}>
        {#each ROLES as role}
          <option value={role}>{role}</option>
        {/each}
      </select>
    </div>

    {#if manager.connectionState === 'idle' || manager.connectionState === 'error'}
      <button onclick={() => manager.connect()}>[ CONNECT API ]</button>
    {:else}
      <button onclick={() => manager.disconnect()}>[ DISCONNECT ]</button>
    {/if}

    <button
      onclick={() => manager.toggleMic()}
      disabled={manager.connectionState !== 'ready'}
    >
      {manager.isRecording ? '[ STOP RECORDING ]' : '[ START RECORDING ]'}
    </button>
  </div>

  <div class="status-box">
    <div><strong>STATUS:</strong> {manager.statusText}</div>
    <div><strong>CONNECTION:</strong> {manager.connectionState.toUpperCase()}</div>
    <div><strong>AI SPEAKING:</strong> {manager.isSpeaking ? 'YES' : 'NO'}</div>
    <div><strong>USER RECORDING:</strong> {manager.isRecording ? 'YES' : 'NO'}</div>
  </div>

  <h3>TRANSCRIPT</h3>
  <div class="box transcript">
    {#each manager.transcript as entry}
      <div class="transcript-item {entry.speaker}">
        <span class="speaker-label">{entry.speaker === 'ai' ? 'AI:' : 'User:'}</span>"{entry.text}"
      </div>
    {/each}
  </div>
</div>
