import { writable, get } from 'svelte/store';
import { type SkeletonData } from './spine-pixi/runtime-3.8/core/SkeletonData';
import { type Bone } from './spine-pixi/runtime-3.8/core/Bone';
import { type Slot } from './spine-pixi/runtime-3.8/core/Slot';
import { type BoneData } from './spine-pixi/runtime-3.8/core/BoneData';
import { type SlotData } from './spine-pixi/runtime-3.8/core/SlotData';

export const skeletonData = writable<SkeletonData | null>(null);
export const selectedNode = writable<Bone | Slot | BoneData | SlotData | null>(null);
export const renderingScale = writable<number>(1.0);
export const currentTool = writable<'select' | 'translate' | 'rotate' | 'scale'>('select');
export const meshTool = writable<'move' | 'add' | 'remove'>('move');

// --- History System ---
export interface HistoryAction {
    name: string;
    undo: () => void;
    redo: () => void;
    timestamp: number;
}

export const historyStack = writable<HistoryAction[]>([]);
export const redoStack = writable<HistoryAction[]>([]);

export function addHistory(action: Omit<HistoryAction, 'timestamp'>) {
    const fullAction = { ...action, timestamp: Date.now() };
    historyStack.update(stack => [...stack, fullAction]);
    redoStack.set([]); // Clear redo stack on new action
}

// Basic Undo
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

// Restore to specific index in history stack
// index -1 = initial state
export function restoreHistory(index: number) {
    const stack = get(historyStack);
    const currentLen = stack.length;

    if (index === currentLen - 1) return;

    if (index < currentLen - 1) {
        // Undo backwards
        const steps = (currentLen - 1) - index;
        for (let i = 0; i < steps; i++) {
            undo();
        }
    } else {
        // Redo forwards
        const steps = index - (currentLen - 1);
        for (let i = 0; i < steps; i++) {
            redo();
        }
    }
}
