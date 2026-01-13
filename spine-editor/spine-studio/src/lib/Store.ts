import { writable } from 'svelte/store';
import type { SpineData, BoneData, SlotData } from './SpineParser';

export const skeletonData = writable<SpineData | null>(null);
export const selectedNode = writable<BoneData | SlotData | null>(null);
export const renderingScale = writable<number>(1.0);
