<script lang="ts">
  import { onMount } from "svelte";
  import { SpineRenderer } from "./lib/SpineRenderer";
  import { SpineParser } from "./lib/SpineParser";
  import { skeletonData, selectedNode } from "./lib/Store";

  let canvas: HTMLCanvasElement;
  let renderer: SpineRenderer;

  onMount(async () => {
    // 1. Init Renderer
    if (canvas) {
      renderer = new SpineRenderer(canvas);
    }

    // 2. Load Data (MVP Hardcoded)
    try {
      const response = await fetch("/spines/spineboy-pro.json");
      const json = await response.json();
      const data = SpineParser.parseSkeleton(json);
      skeletonData.set(data);

      // 3. Render
      renderer.loadSkeleton(data);
      console.log("Spine loaded", data);
    } catch (e) {
      console.error("Failed to load spine:", e);
    }
  });

  $: treeData = $skeletonData ? $skeletonData.bones : [];
</script>

<main
  class="flex h-screen w-screen bg-[#111] text-[#eee] font-sans overflow-hidden"
>
  <!-- Left Sidebar / Tree View -->
  <aside class="w-64 bg-[#252526] border-r border-[#333] flex flex-col">
    <div class="p-2 bg-[#333] font-bold text-xs uppercase tracking-wider">
      Hierarchy
    </div>
    <div class="flex-1 overflow-y-auto p-2 text-sm">
      {#if $skeletonData}
        <ul class="space-y-1">
          {#each $skeletonData.bones as bone}
            <li
              class="cursor-pointer hover:bg-[#37373d] px-2 py-1 rounded flex items-center gap-2"
              class:bg-[#007acc]={$selectedNode?.name === bone.name}
              on:click={() => selectedNode.set(bone)}
              on:keydown={(e) => e.key === "Enter" && selectedNode.set(bone)}
            >
              <span class="opacity-50 text-xs">🦴</span>
              {bone.name}
            </li>
          {/each}
        </ul>
      {:else}
        <div class="text-gray-500 p-4 text-center">Loading Spineboy...</div>
      {/if}
    </div>
  </aside>

  <!-- Main Canvas Area -->
  <div class="flex-1 relative bg-[#1e1e1e] flex flex-col">
    <div
      class="h-10 bg-[#2d2d2d] border-b border-[#333] flex items-center px-4 gap-4"
    >
      <span class="font-bold text-sm text-gray-400">Spine Editor MVP</span>
      <button
        class="px-3 py-1 bg-[#444] rounded text-xs hover:bg-[#555] active:bg-[#666]"
        >Open</button
      >
    </div>

    <div class="flex-1 relative overflow-hidden">
      <canvas bind:this={canvas} class="block w-full h-full outline-none"
      ></canvas>
    </div>
  </div>
</main>

<style>
  :global(body) {
    margin: 0;
    padding: 0;
    background: #111;
  }
</style>
