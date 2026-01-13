<script lang="ts">
  import { onMount, tick } from "svelte";
  import { SpineRenderer } from "./lib/SpineRenderer";
  import { SpineParser, type SpineData } from "./lib/SpineParser";
  import { skeletonData, selectedNode } from "./lib/Store";

  import Toolbar from "./lib/components/Toolbar.svelte";
  import TreeView, {
    type TreeItemData,
  } from "./lib/components/TreeView.svelte";
  import LeftSidebar from "./lib/components/LeftSidebar.svelte";
  import PropertyPanel from "./lib/components/PropertyPanel.svelte";
  import ZoomControls from "./lib/components/ZoomControls.svelte";

  let canvas: HTMLCanvasElement;
  let renderer: SpineRenderer;
  let mode: "design" | "animate" = "design";
  let treeItems: TreeItemData[] = [];

  // Transform Helper for TreeView
  function buildTreeData(data: SpineData): TreeItemData[] {
    // 1. Find Root Bone
    const rootBone = data.bones.find((b) => !b.parent);

    // Recursive builder for bones
    function buildBoneTree(bone: any): TreeItemData {
      const children = data.bones
        .filter((b) => b.parent === bone.name)
        .map((b) => buildBoneTree(b));

      return {
        id: bone.name,
        title: bone.name,
        type: "bone",
        children: children.length > 0 ? children : undefined,
      };
    }

    const boneTree = rootBone ? [buildBoneTree(rootBone)] : [];

    // Top Level Hierarchy
    return [
      {
        id: "root-skeleton",
        title: "Skeleton",
        type: "root",
        children: boneTree,
      },
      {
        id: "constraints",
        title: "Constraints",
        type: "constraint",
        children: [],
      },
      { id: "draw-order", title: "Draw Order", type: "folder", children: [] },
      { id: "skins", title: "Skins", type: "skin", children: [] },
      { id: "events", title: "Events", type: "event", children: [] },
      {
        id: "animations",
        title: "Animations",
        type: "animation",
        children: [],
      },
      { id: "images", title: "Images", type: "image", children: [] },
      { id: "audio", title: "Audio", type: "audio", children: [] },
    ];
  }

  // Reactive: Update tree when data changes
  $: if ($skeletonData) {
    treeItems = buildTreeData($skeletonData);
  }

  // Reactive: Selection handling
  let selectedId: string | null = null;
  $: if (selectedId) {
    const bone = $skeletonData?.bones.find((b) => b.name === selectedId);
    if (bone) selectedNode.set(bone);
  }

  onMount(async () => {
    // 1. Init Renderer
    if (canvas) {
      renderer = new SpineRenderer(canvas);
      // Force resize once mounted and layout is stable
      setTimeout(
        () =>
          renderer.app.renderer.resize(canvas.offsetWidth, canvas.offsetHeight),
        100,
      );

      // Resize observer for the canvas container
      const resizeObserver = new ResizeObserver(() => {
        renderer.app.renderer.resize(canvas.offsetWidth, canvas.offsetHeight);
        renderer.rootContainer.position.set(
          canvas.offsetWidth / 2,
          canvas.offsetHeight * 0.8,
        );
      });
      resizeObserver.observe(canvas.parentElement!);
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

  // Global Shortcuts
  import { undo, redo } from "./lib/Store";
  function onKeyDown(e: KeyboardEvent) {
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "z") {
      e.preventDefault();
      undo();
    }
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "y") {
      e.preventDefault();
      redo();
    }
  }
</script>

<svelte:window on:keydown={onKeyDown} />

<div class="app-layout">
  <!-- Top Header / Toolbar -->
  <header class="header">
    <Toolbar bind:mode />
  </header>

  <!-- Main Workspace -->
  <div class="workspace">
    <!-- Left Sidebar: Hierarchy & History -->
    <aside class="sidebar left">
      <LeftSidebar {treeItems} bind:selectedId />
    </aside>

    <!-- Center: Stage -->
    <main class="stage">
      <div class="stage-header">
        Stage
        <ZoomControls />
      </div>
      <div class="canvas-wrapper">
        <canvas bind:this={canvas}></canvas>
      </div>
    </main>

    <!-- Right Sidebar: Properties -->
    <aside class="sidebar right">
      <PropertyPanel />
    </aside>
  </div>
</div>

<style>
  :global(body) {
    margin: 0;
    background-color: var(--bg-app);
    color: var(--text-main);
    overflow: hidden;
  }

  .app-layout {
    display: flex;
    flex-direction: column;
    height: 100vh;
    width: 100vw;
  }

  .header {
    height: var(--header-height);
    flex-shrink: 0;
    z-index: 10;
  }

  .workspace {
    flex: 1;
    display: flex;
    overflow: hidden;
  }

  .sidebar {
    background-color: var(--bg-panel);
    display: flex;
    flex-direction: column;
    border-right: 1px solid var(--border-dark);
  }

  .sidebar.left {
    width: var(--sidebar-width);
    flex-shrink: 0;
  }

  .sidebar.right {
    width: var(--prop-panel-width);
    flex-shrink: 0;
    border-left: 1px solid var(--border-dark);
    border-right: none;
  }

  .sidebar-header {
    height: 32px;
    padding: 0 12px;
    display: flex;
    align-items: center;
    background-color: var(--bg-header);
    border-bottom: 1px solid var(--border-light);
    font-size: 11px;
    text-transform: uppercase;
    font-weight: 600;
    color: var(--text-muted);
    letter-spacing: 0.5px;
  }

  .sidebar-content {
    flex: 1;
    overflow: hidden;
  }

  .stage {
    flex: 1;
    display: flex;
    flex-direction: column;
    background-color: #111; /* Dark area for canvas */
    position: relative;
  }

  .stage-header {
    height: 32px;
    display: flex;
    align-items: center;
    padding: 0 16px;
    background-color: var(--bg-header);
    border-bottom: 1px solid var(--border-dark);
    font-size: 12px;
    color: var(--text-main);
  }

  .canvas-wrapper {
    flex: 1;
    overflow: hidden;
    position: relative;
  }

  canvas {
    display: block;
    width: 100%;
    height: 100%;
    outline: none;
  }
</style>
