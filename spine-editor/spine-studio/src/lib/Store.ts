import { writable } from 'svelte/store';
import type { SpineData, BoneData, SlotData } from './SpineParser';

export const skeletonData = writable<SpineData | null>(null);
export const selectedNode = writable<BoneData | SlotData | null>(null);
export const renderingScale = writable<number>(1.0);
export const currentTool = writable<'select' | 'translate' | 'rotate' | 'scale'>('select');

// --- History System ---
export interface HistoryAction {
    name: string;
    undo: () => void;
    redo: () => void;
}

export const historyStack = writable<HistoryAction[]>([]);
export const redoStack = writable<HistoryAction[]>([]);

export function addHistory(action: HistoryAction) {
    historyStack.update(stack => [...stack, action]);
    redoStack.set([]); // Clear redo stack on new action
}

export function undo() {
    historyStack.update(stack => {
        const action = stack.pop();
        if (action) {
            action.undo();
            redoStack.update(r => [...r, action]);
        }
        return stack;
    });
}

export function redo() {
    redoStack.update(stack => {
        const action = stack.pop();
        if (action) {
            action.redo();
            historyStack.update(h => [...h, action]);
        }
        return stack;
    });
}
