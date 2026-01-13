import {preprocessMeltUI, sequence} from "@melt-ui/pp";
import {vitePreprocess} from '@sveltejs/vite-plugin-svelte';
/** @type {import("@sveltejs/vite-plugin-svelte").SvelteConfig}*/
export default {
  // Consult https://svelte.dev/docs#compile-time-svelte-preprocess
  // for more information about preprocessors
  preprocess: sequence([vitePreprocess(), preprocessMeltUI()])
};
