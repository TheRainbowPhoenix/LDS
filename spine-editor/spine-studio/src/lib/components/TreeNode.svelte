<script lang="ts">
    import { melt } from "@melt-ui/svelte";
    import { getContext } from "svelte";
    import {
        ChevronRight,
        Folder,
        FolderOpen,
        Bone,
        Layers,
        Image as ImageIcon,
        Speaker,
        Ban,
        Paintbrush,
        Circle,
        Box,
    } from "lucide-svelte";

    // We need to receive the builders from context or props
    // To avoid circular dependency issues with types, we accept 'any' for builders in this MVP script
    // or strictly type them if we imported the types.

    export let items: any[];
    export let level = 0;

    const {
        elements: { item, group },
        helpers: { isExpanded, isSelected },
    } = getContext<any>("tree");

    function getIcon(type: string) {
        switch (type) {
            case "bone":
                return Bone;
            case "slot":
                return Circle; // Slot often represented by circle/target
            case "skin":
                return Paintbrush;
            case "constraint":
                return Box;
            case "image":
                return ImageIcon;
            case "audio":
                return Speaker;
            case "root":
                return Layers;
            default:
                return Folder;
        }
    }
</script>

{#each items as node}
    {@const itemId = node.id}
    {@const hasChildren = node.children && node.children.length > 0}
    {@const isSelectedNode = $isSelected(itemId)}
    {@const isExpandedNode = $isExpanded(itemId)}

    <li>
        <button
            use:melt={$item({ id: itemId, hasChildren })}
            class="tree-item-btn"
            class:selected={isSelectedNode}
            style="padding-left: {level * 16 + 8}px"
        >
            <!-- Arrow/Chevron for Folders -->
            <span
                class="chevron"
                class:expanded={isExpandedNode}
                class:invisible={!hasChildren}
            >
                <ChevronRight size={12} />
            </span>

            <!-- Icon -->
            <span class="icon">
                <svelte:component this={getIcon(node.type)} size={14} />
            </span>

            <!-- Label -->
            <span class="label">{node.title}</span>

            <!-- Visibility Eye (Mock) -->
            <span class="eye-icon">
                <!-- Eye icon could go here -->
            </span>
        </button>

        {#if hasChildren}
            <ul use:melt={$group({ id: itemId })} class="group-list">
                <svelte:self items={node.children} level={level + 1} />
            </ul>
        {/if}
    </li>
{/each}

<style>
    .tree-item-btn {
        display: flex;
        align-items: center;
        width: 100%;
        padding: 4px 8px;
        background: transparent;
        border: none;
        color: var(--text-muted);
        cursor: pointer;
        font-size: 13px;
        border-radius: 2px;
        text-align: left;
        outline: none;
    }

    .tree-item-btn:hover {
        background-color: var(--bg-hover);
        color: var(--text-main);
    }

    .tree-item-btn.selected {
        background-color: var(--bg-selected);
        color: white;
    }

    /* When selected, icon color should be white too */
    .tree-item-btn.selected .icon {
        color: white;
    }

    .chevron {
        display: flex;
        align-items: center;
        margin-right: 4px;
        transition: transform 0.2s;
        opacity: 0.7;
    }
    .chevron.expanded {
        transform: rotate(90deg);
    }
    .invisible {
        visibility: hidden;
    }

    .icon {
        margin-right: 6px;
        display: flex;
        align-items: center;
        opacity: 0.8;
    }

    .label {
        flex: 1;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
    }

    .group-list {
        margin: 0;
        padding: 0;
        list-style: none;
    }
</style>
