<script lang="ts">
  import { onMount } from "svelte";
  import { SpineRenderer } from "./lib/SpineRenderer";
  // Import the loader side-effects so Pixi knows how to load Spine assets
  import "./lib/spine-pixi/loader-3.8";

  import { skeletonData, selectedNode } from "./lib/Store";
  import { undo, redo } from "./lib/Store";

  import Toolbar from "./lib/components/Toolbar.svelte";
  import LeftSidebar from "./lib/components/LeftSidebar.svelte";
  import PropertyPanel from "./lib/components/PropertyPanel.svelte";
  import ZoomControls from "./lib/components/ZoomControls.svelte";

  // Use 'any' for the data types to avoid strict type conflicts with the runtime for now
  // In a full implementation we would import the specific interfaces from spine-pixi
  type TreeItemData = {
    id: string;
    title: string;
    type: string;
    children?: TreeItemData[];
  };

  let canvas: HTMLCanvasElement;
  let renderer: SpineRenderer;
  let mode: "design" | "animate" = "design";
  let treeItems: TreeItemData[] = [];

  // Transform Helper for TreeView (Adapted for Runtime Data)
  function buildTreeData(data: any): TreeItemData[] {
    // data is pixi_spine.core.SkeletonData
    // bones is Array<BoneData>

    // 1. Find Root Bone (bone with no parent)
    const rootBoneData = data.bones.find((b: any) => !b.parent);

    // Recursive builder for bones
    function buildBoneTree(boneData: any): TreeItemData {
      // Find children bones: bones whose parent matches this bone
      const children = data.bones
        .filter((b: any) => b.parent === boneData)
        .map((b: any) => buildBoneTree(b));

      // Find Slots for this bone
      // slotData.boneData === boneData
      const slots = data.slots.filter((s: any) => s.boneData === boneData);

      const slotNodes = slots.map((slot: any) => {
        // Find active attachment (or all available in default skin)
        const childrenAtt: TreeItemData[] = [];

        // Look in default skin
        const slotIndex = slot.index;

        // Quick iteration to find attachments in default skin
        if (data.defaultSkin) {
          const attachments = data.defaultSkin.attachments[slotIndex];
          if (attachments) {
            // In 3.8 JS runtime, attachments might be a Map or Object key-value pairs
            for (const key in attachments) {
              childrenAtt.push({
                id: `${slot.name}:${attachments[key].name}`,
                title: attachments[key].name,
                type: "attachment",
              });
            }
          }
        }

        return {
          id: slot.name,
          title: slot.name,
          type: "slot",
          children: childrenAtt.length > 0 ? childrenAtt : undefined,
        };
      });

      // Combine Bone Children and Slots
      const combinedChildren = [...slotNodes, ...children];

      return {
        id: boneData.name,
        title: boneData.name,
        type: "bone",
        children: combinedChildren.length > 0 ? combinedChildren : undefined,
      };
    }

    const boneTree = rootBoneData ? [buildBoneTree(rootBoneData)] : [];

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
      {
        id: "animations",
        title: "Animations",
        type: "animation",
        children: [],
      },
    ];
  }

  // Reactive: Update tree when data changes
  $: if ($skeletonData) {
    treeItems = buildTreeData($skeletonData);
  }

  // Reactive: Selection handling
  let selectedId: string | null = null;
  $: if (selectedId) {
    if (renderer && renderer.spine) {
      // Try finding bone
      const bone = renderer.spine.skeleton.findBone(selectedId);
      if (bone) {
        selectedNode.set(bone); // Sets the Runtime Bone object
      } else {
        // Maybe it's a slot?
        // const slot = renderer.spine.skeleton.findSlot(selectedId);
        // if (slot) selectedNode.set(slot);
      }
    }
  }

  onMount(async () => {
    // 1. Init Renderer
    if (canvas) {
      renderer = new SpineRenderer(canvas);

      // Force loading the spineboy asset
      // Note: We use the paths relative to 'public' folder
      await renderer.loadSkeleton(
        "/spines/spineboy-pro.json",
        "/spines/spineboy-pro.atlas",
      );

      console.log("App Mounted and Skeleton Loaded");
    }
  });

  // Global Shortcuts
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
