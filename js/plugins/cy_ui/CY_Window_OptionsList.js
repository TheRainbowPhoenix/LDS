//=============================================================================
// CY_Window_OptionsList.js
//=============================================================================

/*:
 * @plugindesc Cyberpunk UI Mod - Options List Window Class
 * @author Cyberpunk UI Mod
 *
 * @help
 * CY_Window_OptionsList - Scrollable options list with various control types.
 * Extends CY_Window_Selectable with support for:
 * - Toggle controls (ON/OFF)
 * - Slider controls (0-100)
 * - Spinner controls (multi-choice with arrows)
 * - Button controls (action triggers)
 * - Header controls (section labels, non-interactive)
 *
 * This plugin requires CY_System.js and CY_Window_Selectable.js to be loaded first.
 *
 * Requirements fulfilled:
 * - 6.1: ON/OFF toggle controls
 * - 6.2: Slider controls for volume and similar values (0-100)
 * - 6.3: Multi-choice spinner controls with left/right arrows
 * - 6.4: Button controls that trigger actions
 * - 6.5: Slider adjustment with left/right input
 * - 6.6: Toggle switching with confirm or left/right input
 * - 6.7: Spinner cycling with left/right input
 * - 6.8: Section headers for grouping options
 * - 7.4: Toggle visual distinction (cyan ON, dark red OFF)
 */

//-----------------------------------------------------------------------------
// CY_Window_OptionsList
//
// The scrollable options list window with various control types.
//-----------------------------------------------------------------------------

function CY_Window_OptionsList() {
    this.initialize.apply(this, arguments);
}

CY_Window_OptionsList.prototype = Object.create(CY_Window_Selectable.prototype);
CY_Window_OptionsList.prototype.constructor = CY_Window_OptionsList;

//-----------------------------------------------------------------------------
// Option Type Constants
//-----------------------------------------------------------------------------

/**
 * Toggle control type - ON/OFF switch
 * Requirement 6.1
 */
CY_Window_OptionsList.TYPE_TOGGLE = 'toggle';

/**
 * Slider control type - 0-100 range
 * Requirement 6.2
 */
CY_Window_OptionsList.TYPE_SLIDER = 'slider';

/**
 * Spinner control type - multi-choice with arrows
 * Requirement 6.3
 */
CY_Window_OptionsList.TYPE_SPINNER = 'spinner';

/**
 * Button control type - action trigger
 * Requirement 6.4
 */
CY_Window_OptionsList.TYPE_BUTTON = 'button';

/**
 * Header control type - section label, non-interactive
 * Requirement 6.8
 */
CY_Window_OptionsList.TYPE_HEADER = 'header';

//-----------------------------------------------------------------------------
// Initialization
//-----------------------------------------------------------------------------

/**
 * Initialize the options list window.
 * @param {number} x - X position of the window
 * @param {number} y - Y position of the window
 * @param {number} width - Width of the window
 * @param {number} height - Height of the window
 */
CY_Window_OptionsList.prototype.initialize = function(x, y, width, height) {
    this._options = [];
    CY_Window_Selectable.prototype.initialize.call(this, x, y, width, height);
};

//-----------------------------------------------------------------------------
// Option Management
//-----------------------------------------------------------------------------

/**
 * Set the options to display in the list.
 * @param {Array} options - Array of option objects
 * Each option object should have:
 *   - type: One of TYPE_TOGGLE, TYPE_SLIDER, TYPE_SPINNER, TYPE_BUTTON, TYPE_HEADER
 *   - label: Display text for the option
 *   - symbol: ConfigManager property name (for value storage)
 *   - choices: Array of choice strings (for TYPE_SPINNER)
 *   - max: Maximum value (for TYPE_SPINNER without choices)
 */
CY_Window_OptionsList.prototype.setOptions = function(options) {
    this._options = options || [];
    this.refresh();
    this.select(this.findFirstSelectable());
};

/**
 * Find the first selectable (non-header) option index.
 * @returns {number} Index of first selectable option, or 0 if none found
 */
CY_Window_OptionsList.prototype.findFirstSelectable = function() {
    for (var i = 0; i < this._options.length; i++) {
        if (this._options[i].type !== CY_Window_OptionsList.TYPE_HEADER) {
            return i;
        }
    }
    return 0;
};

/**
 * Get the total number of options.
 * @returns {number} Number of options
 */
CY_Window_OptionsList.prototype.maxItems = function() {
    return this._options.length;
};

/**
 * Get an option by index.
 * @param {number} index - Option index
 * @returns {Object} Option object or null
 */
CY_Window_OptionsList.prototype.option = function(index) {
    return this._options[index] || null;
};

//-----------------------------------------------------------------------------
// Drawing - Main Dispatcher
//-----------------------------------------------------------------------------

/**
 * Draw an option item based on its type.
 * Dispatches to the appropriate draw method for each option type.
 * @param {number} index - Option index to draw
 */
CY_Window_OptionsList.prototype.drawItem = function(index) {
    var opt = this.option(index);
    if (!opt) return;
    
    var rect = this.itemRectForText(index);
    var isSelected = (index === this.index());
    
    switch (opt.type) {
        case CY_Window_OptionsList.TYPE_HEADER:
            this.drawHeader(opt, rect);
            break;
        case CY_Window_OptionsList.TYPE_TOGGLE:
            this.drawToggle(opt, rect, isSelected);
            break;
        case CY_Window_OptionsList.TYPE_SLIDER:
            this.drawSlider(opt, rect, isSelected);
            break;
        case CY_Window_OptionsList.TYPE_SPINNER:
            this.drawSpinner(opt, rect, isSelected);
            break;
        case CY_Window_OptionsList.TYPE_BUTTON:
            this.drawButton(opt, rect, isSelected);
            break;
    }
};


//-----------------------------------------------------------------------------
// Drawing - Header
// Requirement 6.8: Section headers for grouping options
//-----------------------------------------------------------------------------

/**
 * Draw a header option (section label).
 * Headers use smaller font and are non-interactive.
 * @param {Object} opt - Option object
 * @param {Object} rect - Drawing rectangle
 */
CY_Window_OptionsList.prototype.drawHeader = function(opt, rect) {
    this.changeTextColor(CY_System.Colors.white);
    this.contents.fontSize = 20;
    this.drawText(opt.label, rect.x, rect.y, rect.width, 'left');
    this.resetFontSettings();
};

//-----------------------------------------------------------------------------
// Drawing - Toggle Control
// Requirement 6.1: ON/OFF toggle controls
// Requirement 7.4: Toggle visual distinction (cyan ON, dark red OFF)
//-----------------------------------------------------------------------------

/**
 * Draw a toggle control with OFF/ON buttons.
 * OFF button uses darkRed when active, ON button uses cyan when active.
 * @param {Object} opt - Option object
 * @param {Object} rect - Drawing rectangle
 * @param {boolean} isSelected - Whether this option is currently selected
 */
CY_Window_OptionsList.prototype.drawToggle = function(opt, rect, isSelected) {
    var labelWidth = rect.width * 0.5;
    var controlWidth = rect.width * 0.5;
    var controlX = rect.x + labelWidth;
    
    // Draw label on left
    this.changeTextColor(isSelected ? CY_System.Colors.cyan : CY_System.Colors.lightRed);
    this.drawText(opt.label, rect.x, rect.y, labelWidth, 'left');
    
    // Get current value from ConfigManager
    var value = this.getConfigValue(opt.symbol);
    var btnWidth = controlWidth / 2 - 4;
    var btnHeight = rect.height - 8;
    var btnY = rect.y + 4;
    
    // Draw OFF button
    var offColor = !value ? CY_System.Colors.darkRed : 'rgba(50,50,50,0.5)';
    CY_System.drawCutCornerRect(this.contents, controlX, btnY, btnWidth, btnHeight, offColor, 6);
    this.changeTextColor(!value ? CY_System.Colors.white : CY_System.Colors.inactiveText);
    this.drawText('OFF', controlX, rect.y, btnWidth, 'center');
    
    // Draw ON button
    var onColor = value ? CY_System.Colors.cyan : 'rgba(50,50,50,0.5)';
    CY_System.drawCutCornerRect(this.contents, controlX + btnWidth + 8, btnY, btnWidth, btnHeight, onColor, 6);
    this.changeTextColor(value ? CY_System.Colors.white : CY_System.Colors.inactiveText);
    this.drawText('ON', controlX + btnWidth + 8, rect.y, btnWidth, 'center');
};

//-----------------------------------------------------------------------------
// Drawing - Slider Control
// Requirement 6.2: Slider controls for volume and similar values (0-100)
//-----------------------------------------------------------------------------

/**
 * Draw a slider control with track and fill.
 * @param {Object} opt - Option object
 * @param {Object} rect - Drawing rectangle
 * @param {boolean} isSelected - Whether this option is currently selected
 */
CY_Window_OptionsList.prototype.drawSlider = function(opt, rect, isSelected) {
    var labelWidth = rect.width * 0.4;
    var controlWidth = rect.width * 0.6;
    var controlX = rect.x + labelWidth;
    
    // Draw label on left
    this.changeTextColor(isSelected ? CY_System.Colors.cyan : CY_System.Colors.lightRed);
    this.drawText(opt.label, rect.x, rect.y, labelWidth, 'left');
    
    // Get current value from ConfigManager
    var value = this.getConfigValue(opt.symbol);
    var trackY = rect.y + rect.height / 2 - 4;
    var trackWidth = controlWidth - 60;
    var trackHeight = 8;
    
    // Draw background track
    this.contents.fillRect(controlX, trackY, trackWidth, trackHeight, 'rgba(50,50,50,0.8)');
    
    // Draw filled portion (cyan)
    var fillWidth = Math.floor(trackWidth * (value / 100));
    this.contents.fillRect(controlX, trackY, fillWidth, trackHeight, CY_System.Colors.cyan);
    
    // Draw value text
    this.changeTextColor(CY_System.Colors.white);
    this.drawText(value.toString(), controlX + trackWidth + 10, rect.y, 50, 'center');
};

//-----------------------------------------------------------------------------
// Drawing - Spinner Control
// Requirement 6.3: Multi-choice spinner controls with left/right arrows
//-----------------------------------------------------------------------------

/**
 * Draw a spinner control with left/right arrows.
 * @param {Object} opt - Option object
 * @param {Object} rect - Drawing rectangle
 * @param {boolean} isSelected - Whether this option is currently selected
 */
CY_Window_OptionsList.prototype.drawSpinner = function(opt, rect, isSelected) {
    var labelWidth = rect.width * 0.4;
    var controlWidth = rect.width * 0.6;
    var controlX = rect.x + labelWidth;
    
    // Draw label on left
    this.changeTextColor(isSelected ? CY_System.Colors.cyan : CY_System.Colors.lightRed);
    this.drawText(opt.label, rect.x, rect.y, labelWidth, 'left');
    
    // Get current value from ConfigManager
    var value = this.getConfigValue(opt.symbol);
    var choices = opt.choices || [];
    var displayText = choices[value] !== undefined ? choices[value] : value.toString();
    
    // Draw left arrow
    this.changeTextColor(CY_System.Colors.cyan);
    this.drawText('<', controlX, rect.y, 20, 'center');
    
    // Draw current value
    this.changeTextColor(CY_System.Colors.white);
    this.drawText(displayText, controlX + 20, rect.y, controlWidth - 40, 'center');
    
    // Draw right arrow
    this.changeTextColor(CY_System.Colors.cyan);
    this.drawText('>', controlX + controlWidth - 20, rect.y, 20, 'center');
};

//-----------------------------------------------------------------------------
// Drawing - Button Control
// Requirement 6.4: Button controls that trigger actions
//-----------------------------------------------------------------------------

/**
 * Draw a button control with cut corner background.
 * @param {Object} opt - Option object
 * @param {Object} rect - Drawing rectangle
 * @param {boolean} isSelected - Whether this option is currently selected
 */
CY_Window_OptionsList.prototype.drawButton = function(opt, rect, isSelected) {
    var btnWidth = rect.width / 2;
    var btnX = rect.x + rect.width / 4;
    var btnY = rect.y + 4;
    var btnHeight = rect.height - 8;
    
    // Draw button background with cut corner
    var btnColor = isSelected ? CY_System.Colors.cyan : 'rgba(50,50,50,0.8)';
    CY_System.drawCutCornerRect(this.contents, btnX, btnY, btnWidth, btnHeight, btnColor, 8);
    
    // Draw button label centered
    this.changeTextColor(CY_System.Colors.white);
    this.drawText(opt.label, rect.x, rect.y, rect.width, 'center');
};


//-----------------------------------------------------------------------------
// Navigation - Skip Headers
// Requirement 6.8: Headers are non-interactive
//-----------------------------------------------------------------------------

/**
 * Override cursorDown to skip header options.
 * @param {boolean} wrap - Whether to wrap around at the end
 */
CY_Window_OptionsList.prototype.cursorDown = function(wrap) {
    var index = this.index();
    var maxItems = this.maxItems();
    var startIndex = index;
    
    if (maxItems === 0) return;
    
    do {
        index = (index + 1) % maxItems;
        // Prevent infinite loop if all items are headers
        if (index === startIndex) break;
    } while (this.option(index) && this.option(index).type === CY_Window_OptionsList.TYPE_HEADER);
    
    this.select(index);
};

/**
 * Override cursorUp to skip header options.
 * @param {boolean} wrap - Whether to wrap around at the beginning
 */
CY_Window_OptionsList.prototype.cursorUp = function(wrap) {
    var index = this.index();
    var maxItems = this.maxItems();
    var startIndex = index;
    
    if (maxItems === 0) return;
    
    do {
        index = (index - 1 + maxItems) % maxItems;
        // Prevent infinite loop if all items are headers
        if (index === startIndex) break;
    } while (this.option(index) && this.option(index).type === CY_Window_OptionsList.TYPE_HEADER);
    
    this.select(index);
};

//-----------------------------------------------------------------------------
// Value Change Handling
// Requirement 6.5: Slider adjustment with left/right input
// Requirement 6.6: Toggle switching with confirm or left/right input
// Requirement 6.7: Spinner cycling with left/right input
//-----------------------------------------------------------------------------

/**
 * Override cursorRight to modify option values.
 * @param {boolean} wrap - Whether to wrap around
 */
CY_Window_OptionsList.prototype.cursorRight = function(wrap) {
    this.changeOptionValue(1);
};

/**
 * Override cursorLeft to modify option values.
 * @param {boolean} wrap - Whether to wrap around
 */
CY_Window_OptionsList.prototype.cursorLeft = function(wrap) {
    this.changeOptionValue(-1);
};

/**
 * Change the value of the currently selected option.
 * Handles type-specific value modification logic.
 * @param {number} direction - Direction of change (1 for increase, -1 for decrease)
 */
CY_Window_OptionsList.prototype.changeOptionValue = function(direction) {
    var opt = this.option(this.index());
    if (!opt) return;
    
    // Headers and buttons don't have values to change via left/right
    if (opt.type === CY_Window_OptionsList.TYPE_HEADER) return;
    if (opt.type === CY_Window_OptionsList.TYPE_BUTTON) return;
    
    var value = this.getConfigValue(opt.symbol);
    var changed = false;
    
    switch (opt.type) {
        case CY_Window_OptionsList.TYPE_TOGGLE:
            // Toggle: right = ON (true), left = OFF (false)
            var newValue = direction > 0;
            if (value !== newValue) {
                this.setConfigValue(opt.symbol, newValue);
                changed = true;
            }
            break;
            
        case CY_Window_OptionsList.TYPE_SLIDER:
            // Slider: adjust by 10, clamp to 0-100
            var step = opt.step || 10;
            value = (value + direction * step).clamp(0, 100);
            this.setConfigValue(opt.symbol, value);
            changed = true;
            break;
            
        case CY_Window_OptionsList.TYPE_SPINNER:
            // Spinner: cycle through choices
            var max = (opt.choices ? opt.choices.length : opt.max) || 1;
            value = (value + direction + max) % max;
            this.setConfigValue(opt.symbol, value);
            changed = true;
            break;
    }
    
    if (changed) {
        SoundManager.playCursor();
        this.redrawItem(this.index());
    }
};

/**
 * Override processOk to handle toggle and button activation.
 * Requirement 6.6: Toggle switching with confirm input
 */
CY_Window_OptionsList.prototype.processOk = function() {
    var opt = this.option(this.index());
    if (!opt) return;
    
    switch (opt.type) {
        case CY_Window_OptionsList.TYPE_TOGGLE:
            // Toggle: flip the value
            var value = this.getConfigValue(opt.symbol);
            this.setConfigValue(opt.symbol, !value);
            SoundManager.playCursor();
            this.redrawItem(this.index());
            break;
            
        case CY_Window_OptionsList.TYPE_BUTTON:
            // Button: call the ok handler
            SoundManager.playOk();
            this.updateInputData();
            this.deactivate();
            this.callOkHandler();
            break;
            
        case CY_Window_OptionsList.TYPE_HEADER:
            // Headers do nothing on OK
            break;
            
        default:
            // Other types: play cursor sound
            SoundManager.playCursor();
            break;
    }
};

//-----------------------------------------------------------------------------
// ConfigManager Integration
// Requirement 9.2: Read current values from ConfigManager
// Requirement 9.4: Use existing RPG Maker ConfigManager system
//-----------------------------------------------------------------------------

/**
 * Get a configuration value from ConfigManager.
 * @param {string} symbol - ConfigManager property name
 * @returns {*} The configuration value
 */
CY_Window_OptionsList.prototype.getConfigValue = function(symbol) {
    if (ConfigManager[symbol] !== undefined) {
        return ConfigManager[symbol];
    }
    return 0;
};

/**
 * Set a configuration value in ConfigManager.
 * @param {string} symbol - ConfigManager property name
 * @param {*} value - The value to set
 */
CY_Window_OptionsList.prototype.setConfigValue = function(symbol, value) {
    ConfigManager[symbol] = value;
};

//-----------------------------------------------------------------------------
// Utility Methods
//-----------------------------------------------------------------------------

/**
 * Get the current option object.
 * @returns {Object} Current option or null
 */
CY_Window_OptionsList.prototype.currentOption = function() {
    return this.option(this.index());
};

/**
 * Get the symbol of the current option.
 * @returns {string} Current option symbol or empty string
 */
CY_Window_OptionsList.prototype.currentSymbol = function() {
    var opt = this.currentOption();
    return opt ? opt.symbol : '';
};

/**
 * Check if the current option is a specific type.
 * @param {string} type - Option type to check
 * @returns {boolean} True if current option matches the type
 */
CY_Window_OptionsList.prototype.isCurrentType = function(type) {
    var opt = this.currentOption();
    return opt && opt.type === type;
};

