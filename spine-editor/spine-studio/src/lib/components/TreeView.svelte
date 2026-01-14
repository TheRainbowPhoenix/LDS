<script context="module" lang="ts">
    export type TreeItemData = {
        id: string;
        title: string;
        type:
            | "folder"
            | "bone"
            | "slot"
            | "skin"
            | "constraint"
            | "event"
            | "animation"
            | "image"
            | "audio"
            | "root"
            | "attachment";
        children?: TreeItemData[];
    };
</script>

<script lang="ts">
    import { createTreeView } from "@melt-ui/svelte";
    import { getContext, setContext } from "svelte";
    import TreeNode from "./TreeNode.svelte";

    export let items: TreeItemData[] = [];
    export let selectedId: string | null = null;

    // -- Context for recursive components --
    const ctx = createTreeView({
        defaultExpanded: ["root-skeleton", "bones", "draw-order"], // Expand common folders
    });
    setContext("tree", ctx);

    const {
        elements: { tree },
        states: { selected, expanded },
    } = ctx;

    // 1. Sync Internal Selection -> Parent Prop
    // 'selected' is a Writable<string[]> usually
    $: if ($selected && $selected.length > 0) {
        const id = $selected[0];
        if (id !== selectedId) {
            selectedId = id;
        }
    }

    // 2. Sync Parent Prop -> Internal Selection
    $: if (selectedId) {
        // Check if we need to update MeltUI state
        // We use an array for 'selected' store
        if (!$selected.includes(selectedId)) {
            selected.set([selectedId]);

            // Note: Auto-expanding to the item requires knowing the hierarchy path.
            // Since we only have the ID here, we can't easily expand parents without traversing 'items'.
            // For this MVP, we select the item. If it's in a collapsed folder, it might be hidden.
        }
    }
</script>

<div class="tree-container">
    <ul {...$tree} class="tree-root">
        <TreeNode {items} level={1} />
    </ul>
</div>

<style>
    .tree-container {
        height: 100%;
        overflow-y: auto;
        padding: 0.5rem;
        box-sizing: border-box;
    }
    .tree-root {
        list-style: none;
        padding: 0;
        margin: 0;
    }
</style>
