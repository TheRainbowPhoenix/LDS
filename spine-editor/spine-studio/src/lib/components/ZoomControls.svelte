<script lang="ts">
    import { createPopover, melt } from "@melt-ui/svelte";
    import { renderingScale } from "../Store";
    import { ChevronDown, ZoomIn, ZoomOut, Maximize, X } from "lucide-svelte";
    import { fade } from "svelte/transition";

    const {
        elements: { trigger, content, arrow, close },
        states: { open },
    } = createPopover({
        positioning: {
            placement: "bottom-start",
        },
        forceVisible: true,
    });

    function setZoom(val: number) {
        renderingScale.set(val);
        $open = false;
    }

    function updateZoom(delta: number) {
        renderingScale.update((s) => Math.max(0.1, s + delta));
    }

    let inputValue = "100%";
    $: inputValue = Math.round($renderingScale * 100) + "%";

    function handleInput(e: Event) {
        const val = parseFloat((e.target as HTMLInputElement).value);
        if (!isNaN(val)) {
            renderingScale.set(val / 100);
        }
    }
</script>

<div class="zoom-controls">
    <button class="trigger" use:melt={$trigger}>
        Zoom <span class="val">{Math.round($renderingScale * 100)}%</span>
        <ChevronDown size={14} />
    </button>

    {#if $open}
        <div
            class="menu-content"
            use:melt={$content}
            transition:fade={{ duration: 100 }}
        >
            <div use:melt={$arrow} />

            <!-- Editable Input -->
            <div class="menu-item input-item">
                <label>Zoom</label>
                <input type="text" value={inputValue} on:change={handleInput} />
            </div>

            <div class="separator"></div>

            <button class="menu-item" on:click={() => updateZoom(0.1)}>
                <ZoomIn size={14} /> Zoom In <span>+</span>
            </button>
            <button class="menu-item" on:click={() => updateZoom(-0.1)}>
                <ZoomOut size={14} /> Zoom Out <span>-</span>
            </button>
            <button class="menu-item" on:click={() => setZoom(1.0)}>
                Zoom to 100% <span>Ctrl+0</span>
            </button>
            <button
                class="menu-item"
                on:click={() => console.log("Zoom fit todo")}
            >
                <Maximize size={14} /> Zoom to Fit <span>F</span>
            </button>
        </div>
    {/if}
</div>

<style>
    .zoom-controls {
        display: flex;
        align-items: center;
        margin-left: auto; /* Push to right */
    }

    .trigger {
        background: transparent;
        border: 1px solid transparent;
        color: var(--text-muted);
        font-size: 11px;
        display: flex;
        align-items: center;
        gap: 6px;
        padding: 4px 8px;
        border-radius: 4px;
        cursor: pointer;
    }
    .trigger:hover,
    .trigger[data-state="open"] {
        background-color: var(--bg-hover);
        color: var(--text-main);
    }
    .val {
        color: var(--text-accent);
        font-weight: 600;
    }

    .menu-content {
        background-color: var(--bg-panel);
        border: 1px solid var(--border-light);
        border-radius: 4px;
        padding: 4px;
        min-width: 180px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.5);
        color: var(--text-main);
        font-size: 12px;
        z-index: 100;
        display: flex;
        flex-direction: column;
    }

    .menu-item {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 6px 8px;
        cursor: pointer;
        border-radius: 3px;
        background: transparent;
        border: none;
        color: var(--text-main);
        text-align: left;
        width: 100%;
    }
    .menu-item:hover {
        background-color: var(--bg-hover);
    }

    .menu-item span:last-child {
        margin-left: auto;
        color: var(--text-muted);
        font-size: 10px;
    }

    .input-item {
        justify-content: space-between;
    }
    .input-item input {
        background: var(--bg-input);
        border: 1px solid var(--border-light);
        color: var(--text-main);
        padding: 2px 4px;
        border-radius: 2px;
        width: 60px;
        text-align: right;
        font-size: 11px;
    }

    .separator {
        height: 1px;
        background-color: var(--border-light);
        margin: 4px 0;
    }
</style>
