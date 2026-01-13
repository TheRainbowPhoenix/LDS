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
            | "root";
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
        defaultExpanded: ["root", "bones"],
    });
    setContext("tree", ctx);

    const {
        elements: { tree },
        states: { selectedItem },
    } = ctx;

    // Sync selection to parent prop
    $: if ($selectedItem) selectedId = $selectedItem.getAttribute("data-id");
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
