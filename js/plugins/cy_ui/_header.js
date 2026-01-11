//==============================================================================

"use strict";

/*:
 * @plugindesc Cyberpunk UI Mod - Main Plugin Entry Point
 * @author Cyberpunk UI Mod
 *
 * @param enableCyberpunkTitle
 * @text Enable Cyberpunk Title
 * @type boolean
 * @default true
 * @desc Replace the default title screen with the Cyberpunk-styled title.
 *
 * @param enableCyberpunkOptions
 * @text Enable Cyberpunk Options
 * @type boolean
 * @default true
 * @desc Replace the default options menu with the Cyberpunk-styled options.
 *
 * @param titleLogoX
 * @text Title Logo X Position
 * @type number
 * @default 80
 * @desc X position of the game logo on the title screen.
 *
 * @param titleLogoY
 * @text Title Logo Y Offset
 * @type number
 * @default -150
 * @desc Y offset from center for the game logo on the title screen.
 *
 * @param commandWindowX
 * @text Command Window X Position
 * @type number
 * @default 80
 * @desc X position of the command window on the title screen.
 *
 * @help
 * ============================================================================
 * Cyberpunk UI Mod - Main Plugin
 * ============================================================================
 *
 * This is the main entry point for the Cyberpunk UI Mod. It overrides the
 * default RPG Maker title screen and options menu with Cyberpunk 2077-inspired
 * versions.
 *
 * FEATURES:
 * - Replaces Scene_Title with CY_Scene_Title
 * - Replaces Scene_Options with CY_Scene_Options
 * - Configurable via plugin parameters
 * - Does not modify any core RPG Maker files directly
 *
 * ============================================================================
 */
(function () {
  "use strict";

  // ============================================
  // Plugin Parameters
  // ============================================

  var pluginName = "cy_ui";
  var parameters = PluginManager.parameters(pluginName);
