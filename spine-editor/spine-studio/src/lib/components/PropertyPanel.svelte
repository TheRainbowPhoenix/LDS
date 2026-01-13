<script lang="ts">
    import { selectedNode } from "../Store";
    import { Move, RotateCw, Spline, Ruler } from "lucide-svelte";
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

            <div class="section-title">Transform</div>

            <!-- Translate -->
            <div class="prop-row">
                <div class="label"><Move size={12} /> Translate</div>
                <div class="inputs">
                    <div class="input-group">
                        <label>X</label>
                        <input type="number" value={$selectedNode.x} />
                    </div>
                    <div class="input-group">
                        <label>Y</label>
                        <input type="number" value={$selectedNode.y} />
                    </div>
                </div>
            </div>

            <!-- Rotate -->
            <div class="prop-row">
                <div class="label"><RotateCw size={12} /> Rotate</div>
                <div class="inputs">
                    <div class="input-group">
                        <label>°</label>
                        <input type="number" value={$selectedNode.rotation} />
                    </div>
                </div>
            </div>

            <!-- Scale -->
            <div class="prop-row">
                <div class="label"><Ruler size={12} /> Scale</div>
                <div class="inputs">
                    <div class="input-group">
                        <label>X</label>
                        <input
                            type="number"
                            value={$selectedNode.scaleX ?? 1}
                            step="0.1"
                        />
                    </div>
                    <div class="input-group">
                        <label>Y</label>
                        <input
                            type="number"
                            value={$selectedNode.scaleY ?? 1}
                            step="0.1"
                        />
                    </div>
                </div>
            </div>

            <!-- Shear -->
            <div class="prop-row">
                <div class="label"><Spline size={12} /> Shear</div>
                <div class="inputs">
                    <div class="input-group">
                        <label>X</label>
                        <input
                            type="number"
                            value={$selectedNode.shearX ?? 0}
                        />
                    </div>
                    <div class="input-group">
                        <label>Y</label>
                        <input
                            type="number"
                            value={$selectedNode.shearY ?? 0}
                        />
                    </div>
                </div>
            </div>
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
