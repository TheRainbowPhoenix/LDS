<script lang="ts">
    import { createTabs, melt } from "@melt-ui/svelte";
    import { cubicInOut } from "svelte/easing";
    import { crossfade } from "svelte/transition";
    import TreeView, { type TreeItemData } from "./TreeView.svelte";
    import HistoryPanel from "./HistoryPanel.svelte";

    export let treeItems: TreeItemData[] = [];
    export let selectedId: string | null = null;

    const {
        elements: { root, list, content, trigger },
        states: { value },
    } = createTabs({
        defaultValue: "hierarchy",
    });

    const triggers = [
        { id: "hierarchy", title: "Hierarchy" },
        { id: "history", title: "History" },
        { id: "assets", title: "Assets" },
    ];

    const [send, receive] = crossfade({
        duration: 250,
        easing: cubicInOut,
    });
</script>

<div use:melt={$root} class="tabs-root">
    <div use:melt={$list} class="tabs-list">
        {#each triggers as triggerItem}
            <button use:melt={$trigger(triggerItem.id)} class="trigger">
                {triggerItem.title}
                {#if $value === triggerItem.id}
                    <div
                        in:send={{ key: "trigger" }}
                        out:receive={{ key: "trigger" }}
                        class="indicator"
                    />
                {/if}
            </button>
        {/each}
    </div>

    <div use:melt={$content("hierarchy")} class="tab-content">
        <TreeView items={treeItems} bind:selectedId />
    </div>

    <div use:melt={$content("history")} class="tab-content">
        <HistoryPanel />
    </div>

    <div use:melt={$content("assets")} class="tab-content empty">
        Assets Placeholder
    </div>
</div>

<style>
    .tabs-root {
        display: flex;
        flex-direction: column;
        height: 100%;
        overflow: hidden;
    }

    .tabs-list {
        display: flex;
        flex-shrink: 0;
        background-color: var(--bg-header);
        border-bottom: 1px solid var(--border-dark);
    }

    .trigger {
        position: relative;
        flex: 1;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        background: transparent;
        border: none;
        color: var(--text-muted);
        font-size: 11px;
        font-weight: 600;
        text-transform: uppercase;
        height: 32px;
        padding: 0 8px;
        transition: color 0.1s;
        outline: none;
    }

    .trigger:hover {
        color: var(--text-main);
    }

    .trigger[data-state="active"] {
        color: var(--text-accent);
    }

    .indicator {
        position: absolute;
        bottom: 0;
        left: 0;
        width: 100%;
        height: 2px;
        background-color: var(--accent-blue);
    }

    .tab-content {
        flex: 1;
        overflow: hidden;
        display: flex;
        flex-direction: column;
    }
    .tab-content[hidden] {
        display: none;
    }

    .empty {
        padding: 20px;
        color: var(--text-muted);
        text-align: center;
        font-style: italic;
    }
</style>
