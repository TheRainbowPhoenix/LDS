/** @type {import('tailwindcss').Config} */


/**
 * @param name Complete CSS variable name of the color (e.g. `magnum-100`)
 * @returns The CSS string to use in a Tailwind config
 */
function getColorFromVariableName(name) {
  return `rgb(var(--color-${name}) / <alpha-value>)`;
}

/**
 * @param name CSS variable name of the colors (e.g. `magnum`)
 * @param variants Variants of the color. Default is `[50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950]`
 * @returns The structured colors object
 */
function getColorsFromName(
  name,
  variants = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950]
) {
  return Object.fromEntries(
    variants.map((n) => [`${n}`, getColorFromVariableName(`${name}-${n}`)])
  );
}


export default {
  content: ['./src/**/*.{html,js,svelte,ts}'],
  theme: {
    extend: {},
  },
  plugins: [],
}

