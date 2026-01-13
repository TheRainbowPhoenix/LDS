<script lang="ts">
    import {
        historyStack,
        redoStack,
        undo,
        redo,
        restoreHistory,
    } from "../Store";
    import { History, RotateCcw, ChevronRight } from "lucide-svelte";

    // Auto-scroll to bottom when history changes
    let scrollContainer: HTMLDivElement;
    $: if ($historyStack && scrollContainer) {
        requestAnimationFrame(() => {
            scrollContainer.scrollTop = scrollContainer.scrollHeight;
        });
    }

    function timeAgo(ts: number): string {
        const diff = (Date.now() - ts) / 1000;
        if (diff < 60) return `${Math.floor(diff)}s ago`;
        if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
        return `${Math.floor(diff / 3600)}h ago`;
    }

    function jumpTo(index: number) {
        restoreHistory(index);
    }
</script>

<div class="history-panel">
    <div class="list" bind:this={scrollContainer}>
        {#if $historyStack.length === 0 && $redoStack.length === 0}
            <div class="empty">No History</div>
        {/if}

        <div class="stack-section">
            <div class="state initial" on:click={() => jumpTo(-1)}>
                <div class="dot active"></div>
                <span>Initial State</span>
            </div>

            {#each $historyStack as action, i}
                <div class="state done" on:click={() => jumpTo(i)}>
                    <div class="dot active"></div>
                    <div class="info">
                        <span class="name">{action.name}</span>
                        <span class="time">{timeAgo(action.timestamp)}</span>
                    </div>
                </div>
            {/each}

            {#each $redoStack.slice().reverse() as action, index}
                <div
                    class="state future"
                    on:click={() => jumpTo($historyStack.length + index)}
                >
                    <div class="dot"></div>
                    <div class="info">
                        <span class="name">{action.name}</span>
                        <span class="time">{timeAgo(action.timestamp)}</span>
                    </div>
                </div>
            {/each}
        </div>
    </div>
</div>

<style>
    .history-panel {
        height: 100%;
        display: flex;
        flex-direction: column;
        background: var(--bg-panel);
        color: var(--text-main);
        font-size: 12px;
    }

    .list {
        flex: 1;
        overflow-y: auto;
        padding: 8px;
    }

    .empty {
        padding: 16px;
        text-align: center;
        color: var(--text-muted);
        font-style: italic;
    }

    .state {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 6px 8px;
        cursor: pointer;
        border-radius: 4px;
        transition: background 0.1s;
    }

    .state:hover {
        background-color: var(--bg-hover);
    }

    .state.future {
        opacity: 0.5;
        cursor: default;
    }

    .dot {
        width: 8px;
        height: 8px;
        border-radius: 50%;
        background-color: var(--border-light);
    }

    .dot.active {
        background-color: var(--accent-blue);
    }

    .initial .dot {
        border: 1px solid var(--text-muted);
        background: transparent;
    }

    .initial .dot.active {
        background-color: transparent;
        border-color: var(--accent-blue);
    }
    .info {
        display: flex;
        flex-direction: column;
        line-height: 1.2;
    }

    .time {
        font-size: 9px;
        color: var(--text-muted);
    }

    .state.future {
        opacity: 0.5;
        cursor: pointer;
    }

    .state.future:hover {
        opacity: 0.8;
    }
</style>
