<script lang="ts">
    import { selectedNode, addHistory } from "../Store";
    import { Move, RotateCw, Spline, Ruler } from "lucide-svelte";

    // Helper to format floats
    function fmt(val: number | undefined): string {
        if (val === undefined) return "0";
        return parseFloat(val.toFixed(4)).toString();
    }

    // Update Store (Live)
    function update(prop: string, value: any) {
        selectedNode.update((node) => {
            if (!node) return null;
            (node as any)[prop] = parseFloat(value);
            return node;
        });
    }

    // Commit to History (on Change/Blur)
    function commit(prop: string, oldVal: number, newVal: string) {
        const val = parseFloat(newVal);
        if (val === oldVal) return;

        const node = $selectedNode;
        if (!node) return;

        // Map prop to user friendly name
        let actionName = `Set ${prop}`;
        if (prop === "rotation") actionName = `Rotate`;
        else if (prop.startsWith("scale"))
            actionName = `Scale ${prop.slice(-1)}`;
        else if (prop.startsWith("shear"))
            actionName = `Shear ${prop.slice(-1)}`;
        else if (prop === "x" || prop === "y")
            actionName = `Translate ${prop.toUpperCase()}`;

        addHistory({
            name: `${actionName} of ${node.name}`,
            undo: () => {
                (node as any)[prop] = oldVal;
                selectedNode.set(node);
            },
            redo: () => {
                (node as any)[prop] = val;
                selectedNode.set(node);
            },
        });
    }
</script>

<div class="prop-panel">
    <div class="panel-header">Properties</div>

    {#if $selectedNode}
        <div class="panel-content">
            <!-- Node Header -->
            <div class="node-info">
                <span class="node-name">{$selectedNode.name}</span>
                <span class="node-type">Bone</span>
            </div>

            {#if "x" in $selectedNode}
                <div class="section-title">Transform</div>

                <!-- Translate -->
                <div class="prop-row">
                    <div class="label"><Move size={12} /> Translate</div>
                    <div class="inputs">
                        <div class="input-group">
                            <label for="cx">X</label>
                            <input
                                id="cx"
                                type="number"
                                value={fmt($selectedNode.x)}
                                on:input={(e) =>
                                    update("x", e.currentTarget.value)}
                                on:change={(e) =>
                                    commit(
                                        "x",
                                        $selectedNode?.x,
                                        e.currentTarget.value,
                                    )}
                            />
                        </div>
                        <div class="input-group">
                            <label for="cy">Y</label>
                            <input
                                id="cy"
                                type="number"
                                value={fmt($selectedNode.y)}
                                on:input={(e) =>
                                    update("y", e.currentTarget.value)}
                                on:change={(e) =>
                                    commit(
                                        "y",
                                        $selectedNode?.y,
                                        e.currentTarget.value,
                                    )}
                            />
                        </div>
                    </div>
                </div>

                <!-- Rotate -->
                <div class="prop-row">
                    <div class="label"><RotateCw size={12} /> Rotate</div>
                    <div class="inputs">
                        <div class="input-group">
                            <label for="cr">°</label>
                            <input
                                id="cr"
                                type="number"
                                value={fmt($selectedNode.rotation)}
                                on:input={(e) =>
                                    update("rotation", e.currentTarget.value)}
                                on:change={(e) =>
                                    commit(
                                        "rotation",
                                        $selectedNode?.rotation,
                                        e.currentTarget.value,
                                    )}
                            />
                        </div>
                    </div>
                </div>

                <!-- Scale -->
                <div class="prop-row">
                    <div class="label"><Ruler size={12} /> Scale</div>
                    <div class="inputs">
                        <div class="input-group">
                            <label for="sx">X</label>
                            <input
                                id="sx"
                                type="number"
                                value={fmt($selectedNode.scaleX ?? 1)}
                                step="0.1"
                                on:input={(e) =>
                                    update("scaleX", e.currentTarget.value)}
                                on:change={(e) =>
                                    commit(
                                        "scaleX",
                                        $selectedNode?.scaleX ?? 1,
                                        e.currentTarget.value,
                                    )}
                            />
                        </div>
                        <div class="input-group">
                            <label for="sy">Y</label>
                            <input
                                id="sy"
                                type="number"
                                value={fmt($selectedNode.scaleY ?? 1)}
                                step="0.1"
                                on:input={(e) =>
                                    update("scaleY", e.currentTarget.value)}
                                on:change={(e) =>
                                    commit(
                                        "scaleY",
                                        $selectedNode?.scaleY ?? 1,
                                        e.currentTarget.value,
                                    )}
                            />
                        </div>
                    </div>
                </div>

                <!-- Shear -->
                <div class="prop-row">
                    <div class="label"><Spline size={12} /> Shear</div>
                    <div class="inputs">
                        <div class="input-group">
                            <label for="shx">X</label>
                            <input
                                id="shx"
                                type="number"
                                value={fmt($selectedNode.shearX ?? 0)}
                                on:input={(e) =>
                                    update("shearX", e.currentTarget.value)}
                                on:change={(e) =>
                                    commit(
                                        "shearX",
                                        $selectedNode?.shearX ?? 0,
                                        e.currentTarget.value,
                                    )}
                            />
                        </div>
                        <div class="input-group">
                            <label for="shy">Y</label>
                            <input
                                id="shy"
                                type="number"
                                value={fmt($selectedNode.shearY ?? 0)}
                                on:input={(e) =>
                                    update("shearY", e.currentTarget.value)}
                                on:change={(e) =>
                                    commit(
                                        "shearY",
                                        $selectedNode?.shearY ?? 0,
                                        e.currentTarget.value,
                                    )}
                            />
                        </div>
                    </div>
                </div>
            {/if}
        </div>
    {:else}
        <div class="empty-state">No selection</div>
    {/if}
</div>

<style>
    .prop-panel {
        background-color: var(--bg-panel);
        height: 100%;
        display: flex;
        flex-direction: column;
        border-left: 1px solid var(--border-dark);
        font-size: 12px;
    }

    .panel-header {
        height: 32px;
        display: flex;
        align-items: center;
        padding-left: 12px;
        font-weight: 600;
        color: var(--text-muted);
        background-color: var(--bg-header);
        border-bottom: 1px solid var(--border-light);
        text-transform: uppercase;
        letter-spacing: 0.5px;
        font-size: 11px;
    }

    .panel-content {
        padding: 16px;
        color: var(--text-main);
    }

    .node-info {
        margin-bottom: 24px;
        display: flex;
        flex-direction: column;
        gap: 4px;
    }
    .node-name {
        font-size: 16px;
        font-weight: bold;
        color: var(--text-accent);
    }
    .node-type {
        color: var(--text-muted);
        font-size: 11px;
        text-transform: uppercase;
    }

    .section-title {
        font-weight: 600;
        margin-bottom: 8px;
        color: var(--text-muted);
        border-bottom: 1px solid var(--border-light);
        padding-bottom: 4px;
    }

    .prop-row {
        margin-bottom: 12px;
    }

    .label {
        display: flex;
        align-items: center;
        gap: 6px;
        margin-bottom: 4px;
        color: var(--text-muted);
    }

    .inputs {
        display: flex;
        gap: 8px;
    }

    .input-group {
        display: flex;
        align-items: center;
        background-color: var(--bg-input);
        border-radius: 3px;
        padding-left: 6px;
        flex: 1;
        border: 1px solid var(--border-light);
    }

    .input-group label {
        color: var(--text-muted);
        font-size: 11px;
        width: 12px;
    }

    .input-group input {
        background: transparent;
        border: none;
        color: var(--text-main);
        width: 100%;
        padding: 4px;
        outline: none;
        font-family: inherit;
    }

    .input-group input:focus {
        color: var(--text-accent);
    }

    .input-group:focus-within {
        border-color: var(--accent-blue);
    }

    .empty-state {
        padding: 24px;
        text-align: center;
        color: var(--text-muted);
        font-style: italic;
    }
</style>
