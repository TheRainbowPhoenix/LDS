<script lang="ts">
    import { createToolbar, melt } from "@melt-ui/svelte";
    import { currentTool, undo, redo, meshTool, selectedNode } from "../Store";
    import {
        MousePointer2,
        Move,
        RotateCw,
        Scale,
        Type,
        Bone,
        Image as ImageIcon,
        FileText,
        Save,
        FolderOpen,
        Undo,
        Redo,
        Eraser,
        PenTool,
        Pointer,
    } from "lucide-svelte";

    const {
        elements: { root, button, link, separator },
        builders: { createToolbarGroup },
    } = createToolbar();

    const {
        elements: { group: toolGroup, item: toolItem },
        states: { value: toolValue },
    } = createToolbarGroup({
        type: "single",
        defaultValue: "select",
    });

    const {
        elements: { group: meshGroup, item: meshItem },
        states: { value: meshValue },
    } = createToolbarGroup({
        type: "single",
        defaultValue: "move",
    });

    // Sync store
    $: if ($toolValue) {
        currentTool.set($toolValue as any);
    }

    $: if ($meshValue) {
        meshTool.set($meshValue as any);
    }

    // Check if slot is selected (has 'bone' property usually, or is Slot type)
    $: isSlotSelected =
        $selectedNode &&
        (($selectedNode as any).bone || ($selectedNode as any).attachment);

    export let mode: "design" | "animate" = "design";
</script>

<div use:melt={$root} class="toolbar-root">
    <div class="group">
        <button
            class="tool-btn"
            use:melt={$button}
            aria-label="Open"
            title="Open Project"
        >
            <FolderOpen size={18} />
        </button>
        <button
            class="tool-btn"
            use:melt={$button}
            aria-label="Save"
            title="Save Project"
        >
            <Save size={18} />
        </button>
    </div>

    <div class="separator" use:melt={$separator} />

    <div class="group">
        <button
            class="tool-btn"
            use:melt={$button}
            title="Undo"
            on:click={undo}
        >
            <Undo size={18} />
        </button>
        <button
            class="tool-btn"
            use:melt={$button}
            title="Redo"
            on:click={redo}
        >
            <Redo size={18} />
        </button>
    </div>

    <div class="separator" use:melt={$separator} />

    <div class="group" use:melt={$toolGroup}>
        <button
            class="tool-btn toggle"
            use:melt={$toolItem("select")}
            aria-label="Select"
            title="Select"
        >
            <MousePointer2 size={18} />
        </button>
        <button
            class="tool-btn toggle"
            use:melt={$toolItem("translate")}
            aria-label="Translate"
            title="Translate"
        >
            <Move size={18} />
        </button>
        <button
            class="tool-btn toggle"
            use:melt={$toolItem("rotate")}
            aria-label="Rotate"
            title="Rotate"
        >
            <RotateCw size={18} />
        </button>
        <button
            class="tool-btn toggle"
            use:melt={$toolItem("scale")}
            aria-label="Scale"
            title="Scale"
        >
            <Scale size={18} />
        </button>
        <button
            class="tool-btn toggle"
            use:melt={$toolItem("shear")}
            aria-label="Shear"
            title="Shear"
        >
            <Type size={18} class="italic" />
        </button>
    </div>

    {#if isSlotSelected}
        <div class="separator" use:melt={$separator} />
        <div class="group-label">MESH</div>
        <div class="group" use:melt={$meshGroup}>
            <button
                class="tool-btn toggle"
                use:melt={$meshItem("move")}
                title="Move Vertex"
            >
                <Pointer size={18} />
            </button>
            <button
                class="tool-btn toggle"
                use:melt={$meshItem("add")}
                title="Add Vertex"
            >
                <PenTool size={18} />
            </button>
            <button
                class="tool-btn toggle"
                use:melt={$meshItem("remove")}
                title="Remove Vertex"
            >
                <Eraser size={18} />
            </button>
        </div>
    {/if}

    <div class="separator" use:melt={$separator} />

    <!-- Creation Tools -->
    <div class="group">
        <button class="tool-btn" use:melt={$button} aria-label="Create Bone">
            <Bone size={18} />
        </button>
        <button class="tool-btn" use:melt={$button} aria-label="Create Image">
            <ImageIcon size={18} />
        </button>
    </div>

    <div class="spacer" />

    <!-- Mode Switcher -->
    <div class="mode-switch">
        <button
            class="mode-btn"
            class:active={mode === "design"}
            on:click={() => (mode = "design")}
        >
            Design
        </button>
        <button
            class="mode-btn"
            class:active={mode === "animate"}
            on:click={() => (mode = "animate")}
        >
            Animate
        </button>
    </div>
</div>

<style>
    .toolbar-root {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 0 16px;
        height: 100%; /* Parent controls height (e.g. 48px header) */
        background-color: var(--bg-header);
        border-bottom: 1px solid var(--border-dark);
        color: var(--text-main);
    }

    .group {
        display: flex;
        align-items: center;
        gap: 2px;
    }

    .group-label {
        font-size: 10px;
        font-weight: 700;
        color: var(--text-muted);
        margin-right: 4px;
        text-transform: uppercase;
    }

    .tool-btn {
        display: flex;
        justify-content: center;
        align-items: center;
        width: 32px;
        height: 32px;
        border-radius: 4px;
        border: none;
        background: transparent;
        color: var(--text-main);
        cursor: pointer;
        transition: background 0.1s;
    }

    .tool-btn:hover {
        background-color: var(--bg-hover);
        color: white;
    }

    .tool-btn[data-state="on"],
    .tool-btn.active {
        background-color: var(--bg-selected);
        color: white;
    }

    .separator {
        width: 1px;
        height: 20px;
        background-color: var(--border-light);
        margin: 0 4px;
    }

    .spacer {
        flex: 1;
    }

    /* Mode Switcher */
    .mode-switch {
        display: flex;
        background-color: var(--bg-input);
        border-radius: 4px;
        padding: 2px;
    }

    .mode-btn {
        padding: 4px 12px;
        border: none;
        background: transparent;
        color: var(--text-muted);
        font-size: 12px;
        font-weight: 600;
        cursor: pointer;
        border-radius: 3px;
    }

    .mode-btn.active {
        background-color: var(--bg-hover); /* Or a specific toggle color */
        color: var(--text-accent);
        box-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
    }

    .mode-btn:hover:not(.active) {
        color: var(--text-main);
    }
</style>
