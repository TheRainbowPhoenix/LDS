//=============================================================================
// CY_System.js
//=============================================================================

/*:
 * @plugindesc Cyberpunk UI Mod - Core System Module
 * @author Cyberpunk UI Mod
 *
 * @help
 * CY_System - Core module containing shared color palette, constants,
 * and utility functions for the Cyberpunk UI mod.
 *
 * This plugin must be loaded before all other CY_ plugins.
 */

var CY_System = CY_System || {};

//-----------------------------------------------------------------------------
// Color Palette
//-----------------------------------------------------------------------------

/**
 * Global color palette for the Cyberpunk UI theme.
 * All CY_ prefixed classes reference these colors for visual consistency.
 */
CY_System.Colors = {
    cyan: '#5CF5FA',                    // Primary highlight (updated)
    cyanDark: '#1B0E18',                // Dark cyan for selected backgrounds
    darkRed: '#842624',                 // Accent/background (updated)
    lightRed: '#FF6158',                // Text accent / borders (updated)
    backgroundBlack: 'rgba(0, 0, 0, 0.7)',    // Semi-transparent bg
    backgroundSolid: 'rgba(10, 10, 12, 0.9)', // More opaque bg
    inactiveText: '#8a8a8a',            // Disabled/unselected text
    white: '#ffffff',                   // Primary text
    yellow: '#f0f000'                   // Warning/special
};

//-----------------------------------------------------------------------------
// Constants
//-----------------------------------------------------------------------------

/**
 * Corner cut size in pixels for the signature Cyberpunk angled corners.
 */
CY_System.CORNER_CUT = 12;

/**
 * Animation speed constants (in frames).
 */
CY_System.FADE_SPEED = 8;
CY_System.HIGHLIGHT_SPEED = 4;


//-----------------------------------------------------------------------------
// Utility Functions
//-----------------------------------------------------------------------------

/**
 * Draw a filled rectangle with a cut (angled) bottom-right corner.
 * This is the signature visual element of the Cyberpunk UI style.
 *
 * @param {Bitmap} bitmap - The bitmap to draw on
 * @param {number} x - X position
 * @param {number} y - Y position
 * @param {number} w - Width of the rectangle
 * @param {number} h - Height of the rectangle
 * @param {string} color - Fill color (CSS color string)
 * @param {number} [cutSize] - Size of the corner cut in pixels (default: CORNER_CUT)
 */
CY_System.drawCutCornerRect = function(bitmap, x, y, w, h, color, cutSize) {
    cutSize = cutSize || CY_System.CORNER_CUT;
    
    // Ensure cutSize doesn't exceed rectangle dimensions
    cutSize = Math.min(cutSize, w, h);
    
    var ctx = bitmap._context;
    ctx.save();
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + w, y);
    ctx.lineTo(x + w, y + h - cutSize);
    ctx.lineTo(x + w - cutSize, y + h);
    ctx.lineTo(x, y + h);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
    bitmap._baseTexture.update();
};

/**
 * Draw only the border of a rectangle with a cut (angled) bottom-right corner.
 * Used for outline effects and selection highlights.
 *
 * @param {Bitmap} bitmap - The bitmap to draw on
 * @param {number} x - X position
 * @param {number} y - Y position
 * @param {number} w - Width of the rectangle
 * @param {number} h - Height of the rectangle
 * @param {string} color - Stroke color (CSS color string)
 * @param {number} [lineWidth] - Width of the border line (default: 2)
 * @param {number} [cutSize] - Size of the corner cut in pixels (default: CORNER_CUT)
 */
CY_System.drawCutCornerBorder = function(bitmap, x, y, w, h, color, lineWidth, cutSize) {
    cutSize = cutSize || CY_System.CORNER_CUT;
    lineWidth = lineWidth || 2;
    
    // Ensure cutSize doesn't exceed rectangle dimensions
    cutSize = Math.min(cutSize, w, h);
    
    var ctx = bitmap._context;
    ctx.save();
    ctx.strokeStyle = color;
    ctx.lineWidth = lineWidth;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + w, y);
    ctx.lineTo(x + w, y + h - cutSize);
    ctx.lineTo(x + w - cutSize, y + h);
    ctx.lineTo(x, y + h);
    ctx.closePath();
    ctx.stroke();
    ctx.restore();
    bitmap._baseTexture.update();
};

/**
 * Draw a filled rectangle with a cut (angled) bottom-LEFT corner.
 * Mirror of drawCutCornerRect for left-side buttons (like OFF toggles).
 *
 * @param {Bitmap} bitmap - The bitmap to draw on
 * @param {number} x - X position
 * @param {number} y - Y position
 * @param {number} w - Width of the rectangle
 * @param {number} h - Height of the rectangle
 * @param {string} color - Fill color (CSS color string)
 * @param {number} [cutSize] - Size of the corner cut in pixels (default: CORNER_CUT)
 */
CY_System.drawCutCornerRectLeft = function(bitmap, x, y, w, h, color, cutSize) {
    cutSize = cutSize || CY_System.CORNER_CUT;
    
    // Ensure cutSize doesn't exceed rectangle dimensions
    cutSize = Math.min(cutSize, w, h);
    
    var ctx = bitmap._context;
    ctx.save();
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + w, y);
    ctx.lineTo(x + w, y + h);
    ctx.lineTo(x + cutSize, y + h);
    ctx.lineTo(x, y + h - cutSize);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
    bitmap._baseTexture.update();
};

/**
 * Draw L-shaped corner hints for subtle selection indication.
 * Used in settings menus for a more subtle highlight.
 *
 * @param {Bitmap} bitmap - The bitmap to draw on
 * @param {number} x - X position
 * @param {number} y - Y position
 * @param {number} w - Width of the area
 * @param {number} h - Height of the area
 * @param {string} color - Color for the corner hints
 * @param {number} [cornerSize] - Size of the L corner (default: 8)
 * @param {number} [lineWidth] - Width of the lines (default: 2)
 */
CY_System.drawCornerHints = function(bitmap, x, y, w, h, color, cornerSize, lineWidth) {
    cornerSize = cornerSize || 8;
    lineWidth = lineWidth || 2;
    
    var ctx = bitmap._context;
    ctx.save();
    ctx.strokeStyle = color;
    ctx.lineWidth = lineWidth;
    
    // Top-right corner (L rotated)
    ctx.beginPath();
    ctx.moveTo(x + w - cornerSize, y);
    ctx.lineTo(x + w, y);
    ctx.lineTo(x + w, y + cornerSize);
    ctx.stroke();
    
    // Bottom-left corner (L shape)
    ctx.beginPath();
    ctx.moveTo(x, y + h - cornerSize);
    ctx.lineTo(x, y + h);
    ctx.lineTo(x + cornerSize, y + h);
    ctx.stroke();
    
    ctx.restore();
    bitmap._baseTexture.update();
};
