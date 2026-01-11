//=============================================================================
// CY_Window_ActionBar.js
//=============================================================================

/*:
 * @plugindesc Cyberpunk UI Mod - Action Bar Window
 * @author Cyberpunk UI Mod
 *
 * @help
 * CY_Window_ActionBar - Bottom action bar showing context-sensitive controls.
 * Extends CY_Window_Base with Cyberpunk styling.
 *
 * Features:
 * - Positioned at bottom of screen
 * - Displays button/label pairs for available actions
 * - Right-aligned action display
 * - Colored circular button icons (B=red, A=blue, X=green, Y=yellow)
 * - Supports gamepad button icons and keyboard key labels
 *
 * This plugin requires CY_System.js and CY_Window_Base.js to be loaded first.
 *
 * Requirements fulfilled:
 * - 5.6: Display bottom action bar showing available controls
 * - 8.3: Display gamepad button icons when using gamepad
 * - 8.4: Display keyboard key labels when using keyboard/mouse
 */

//-----------------------------------------------------------------------------
// CY_Window_ActionBar
//
// Bottom action bar showing context-sensitive controls.
//-----------------------------------------------------------------------------

function CY_Window_ActionBar() {
    this.initialize.apply(this, arguments);
}

CY_Window_ActionBar.prototype = Object.create(CY_Window_Base.prototype);
CY_Window_ActionBar.prototype.constructor = CY_Window_ActionBar;

//-----------------------------------------------------------------------------
// Initialization
//-----------------------------------------------------------------------------

/**
 * Initialize the action bar window.
 * Positions at bottom of screen with full width.
 */
CY_Window_ActionBar.prototype.initialize = function() {
    var width = Graphics.width; // Full screen width
    var height = 48;
    var y = Graphics.height - height;
    this._actions = [];
    this._lastInputType = null;
    CY_Window_Base.prototype.initialize.call(this, 0, y, width, height);
    this.refresh();
};

//-----------------------------------------------------------------------------
// Input Detection
//-----------------------------------------------------------------------------

/**
 * Check if using gamepad input.
 * @returns {boolean} True if last input was from gamepad
 */
CY_Window_ActionBar.prototype.isGamepadInput = function() {
    // Check if gamepad is connected and was last used
    if (Input._gamepadStates && Input._gamepadStates.length > 0) {
        for (var i = 0; i < Input._gamepadStates.length; i++) {
            if (Input._gamepadStates[i]) return true;
        }
    }
    return false;
};

/**
 * Get keyboard key label for a button.
 * @param {string} button - Gamepad button identifier
 * @returns {string} Keyboard equivalent
 */
CY_Window_ActionBar.prototype.getKeyboardLabel = function(button) {
    switch (button) {
        case 'A': return 'Z';      // Confirm
        case 'B': return 'X';      // Cancel
        case 'X': return 'A';      // Menu
        case 'Y': return 'S';      // Special
        case 'L1': return 'Q';     // Page up
        case 'R1': return 'E';     // Page down
        default: return button;
    }
};

//-----------------------------------------------------------------------------
// Update
//-----------------------------------------------------------------------------

/**
 * Update the action bar.
 * Refreshes display if input type changes.
 */
CY_Window_ActionBar.prototype.update = function() {
    CY_Window_Base.prototype.update.call(this);
    
    // Check for input type change
    var currentInputType = this.isGamepadInput() ? 'gamepad' : 'keyboard';
    if (this._lastInputType !== currentInputType) {
        this._lastInputType = currentInputType;
        this.refresh();
    }
};

/**
 * Set the actions to display in the action bar.
 * @param {Array} actions - Array of action objects with button and label properties
 *                          Example: [{button: 'B', label: 'Close'}, {button: 'Y', label: 'Defaults'}]
 */
CY_Window_ActionBar.prototype.setActions = function(actions) {
    this._actions = actions || [];
    this.refresh();
};

/**
 * Refresh the action bar display.
 * Draws all actions right-aligned with button icons and labels.
 */
CY_Window_ActionBar.prototype.refresh = function() {
    if (!this.contents) return;
    this.contents.clear();
    
    var useGamepad = this.isGamepadInput();
    
    // Use smaller font for action bar
    this.contents.fontSize = 14;
    
    // Start from right side with padding
    var x = this.contentsWidth() - 16;
    
    // Draw actions from right to left (last action appears rightmost)
    for (var i = this._actions.length - 1; i >= 0; i--) {
        var action = this._actions[i];
        var displayButton = useGamepad ? action.button : this.getKeyboardLabel(action.button);
        var labelWidth = this.textWidth(action.label) + 8;
        var btnSize = 22;
        
        // Draw label first (to the right of button)
        this.changeTextColor(CY_System.Colors.white);
        this.drawText(action.label, x - labelWidth, 6, labelWidth, 'right');
        
        // Move x position for button icon
        x -= labelWidth + 6;
        
        // Draw button icon (circular with letter)
        this.drawButtonIcon(action.button, displayButton, x - btnSize, 5);
        
        // Move x position for next action with spacing
        x -= btnSize + 16;
    }
    
    // Reset font size
    this.resetFontSettings();
};

/**
 * Draw a circular button icon with the button letter.
 * All buttons use cyan (#5FFAFF) background.
 * @param {string} buttonType - The original button type (for reference)
 * @param {string} displayText - The text to display (gamepad or keyboard)
 * @param {number} x - X position to draw at
 * @param {number} y - Y position to draw at
 */
CY_Window_ActionBar.prototype.drawButtonIcon = function(buttonType, displayText, x, y) {
    var size = 22;
    
    // Draw circular button background - all cyan
    var ctx = this.contents._context;
    ctx.save();
    ctx.beginPath();
    ctx.arc(x + size / 2, y + size / 2, size / 2, 0, Math.PI * 2);
    ctx.fillStyle = '#5FFAFF'; // Cyan for all buttons
    ctx.fill();
    ctx.restore();
    this.contents._baseTexture.update();
    
    // Draw button letter centered in circle with dark text for contrast
    var originalFontSize = this.contents.fontSize;
    this.contents.fontSize = 11;
    this.changeTextColor('#000000'); // Dark text on cyan background
    // Center text vertically in the circle
    this.drawText(displayText, x, y + 4, size, 'center');
    this.contents.fontSize = originalFontSize;
};

/**
 * Get the color for a specific button.
 * Uses standard gamepad button colors:
 * - B (cancel): Red
 * - A (confirm): Blue
 * - X: Green
 * - Y (special): Yellow
 * @param {string} button - The button identifier
 * @returns {string} The color for the button
 */
CY_Window_ActionBar.prototype.getButtonColor = function(button) {
    switch (button) {
        case 'B': return '#e74c3c';  // Red (close/cancel)
        case 'A': return '#3498db';  // Blue (select/confirm)
        case 'X': return '#2ecc71';  // Green
        case 'Y': return '#f1c40f';  // Yellow (defaults/special)
        default: return CY_System.Colors.inactiveText;
    }
};

/**
 * Get the window height.
 * @returns {number} The height of the action bar
 */
CY_Window_ActionBar.prototype.windowHeight = function() {
    return 48;
};

/**
 * Standard padding for the action bar.
 * @returns {number} The padding value
 */
CY_Window_ActionBar.prototype.standardPadding = function() {
    return 8;
};

/**
 * Clear all actions from the action bar.
 */
CY_Window_ActionBar.prototype.clearActions = function() {
    this._actions = [];
    this.refresh();
};

/**
 * Add a single action to the action bar.
 * @param {string} button - The button identifier
 * @param {string} label - The label text for the action
 */
CY_Window_ActionBar.prototype.addAction = function(button, label) {
    this._actions.push({ button: button, label: label });
    this.refresh();
};
