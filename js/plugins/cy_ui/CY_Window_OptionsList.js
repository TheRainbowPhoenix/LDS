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
 * OFF button has cut corner on bottom-LEFT, ON button has cut corner on bottom-RIGHT.
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
    
    // Draw OFF button (cut corner on bottom-LEFT)
    var offColor = !value ? CY_System.Colors.darkRed : 'rgba(50,50,50,0.5)';
    CY_System.drawCutCornerRectLeft(this.contents, controlX, btnY, btnWidth, btnHeight, offColor, 6);
    this.changeTextColor(!value ? CY_System.Colors.white : CY_System.Colors.inactiveText);
    this.drawText('OFF', controlX, rect.y, btnWidth, 'center');
    
    // Draw ON button (cut corner on bottom-RIGHT)
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

//-----------------------------------------------------------------------------
// Subtle Highlight Override for Settings
//-----------------------------------------------------------------------------

/**
 * Override refreshHighlight for subtle corner hints instead of full highlight.
 * Settings menu uses L-shaped corner hints for a more subtle selection indication.
 * @param {number} w - Width of the highlight area
 * @param {number} h - Height of the highlight area
 */
CY_Window_OptionsList.prototype.refreshHighlight = function(w, h) {
    var bmp = this._highlightSprite.bitmap;
    
    // Resize bitmap if dimensions changed
    if (bmp.width !== w || bmp.height !== h) {
        bmp.resize(w, h);
    }
    
    bmp.clear();
    
    // Draw very subtle background (0.1 opacity)
    CY_System.drawCutCornerRect(
        bmp, 
        0, 
        0, 
        w, 
        h, 
        'rgba(92, 245, 250, 0.08)', // Very subtle cyan
        6
    );
    
    // Draw L-shaped corner hints instead of full border
    CY_System.drawCornerHints(
        bmp,
        0,
        0,
        w,
        h,
        'rgba(92, 245, 250, 0.5)', // Cyan with some opacity
        10, // Corner size
        2   // Line width
    );
};

//-----------------------------------------------------------------------------
// Mouse/Touch Click Handling for Controls
//-----------------------------------------------------------------------------

/**
 * Override processTouch to handle clicks on toggle buttons and sliders.
 */
CY_Window_OptionsList.prototype.processTouch = function() {
    if (this.isOpenAndActive()) {
        if (TouchInput.isTriggered() && this.isTouchedInsideFrame()) {
            this._touching = true;
            this.onTouch(true);
        } else if (TouchInput.isCancelled()) {
            if (this.isCancelEnabled()) {
                this.processCancel();
            }
        }
        if (this._touching) {
            if (TouchInput.isPressed()) {
                this.onTouch(false);
            } else {
                this._touching = false;
            }
        }
    } else {
        this._touching = false;
    }
};

/**
 * Handle touch/click on the options list.
 * Detects clicks on toggle buttons (OFF/ON) and slider tracks.
 * @param {boolean} triggered - Whether this is a new touch
 */
CY_Window_OptionsList.prototype.onTouch = function(triggered) {
    var lastIndex = this.index();
    var x = this.canvasToLocalX(TouchInput.x);
    var y = this.canvasToLocalY(TouchInput.y);
    var hitIndex = this.hitTest(x, y);
    
    if (hitIndex >= 0) {
        if (hitIndex !== this.index()) {
            // Skip headers when clicking
            var opt = this.option(hitIndex);
            if (opt && opt.type !== CY_Window_OptionsList.TYPE_HEADER) {
                this.select(hitIndex);
            }
        }
        
        if (triggered) {
            // Check if we clicked on a control element
            this.processControlClick(hitIndex, x, y);
        }
    }
};

/**
 * Process a click on a control element (toggle button or slider).
 * @param {number} index - The option index that was clicked
 * @param {number} x - Local X coordinate of the click
 * @param {number} y - Local Y coordinate of the click
 */
CY_Window_OptionsList.prototype.processControlClick = function(index, x, y) {
    var opt = this.option(index);
    if (!opt) return;
    
    var rect = this.itemRectForText(index);
    
    switch (opt.type) {
        case CY_Window_OptionsList.TYPE_TOGGLE:
            this.processToggleClick(opt, rect, x);
            break;
        case CY_Window_OptionsList.TYPE_SLIDER:
            this.processSliderClick(opt, rect, x);
            break;
        case CY_Window_OptionsList.TYPE_SPINNER:
            this.processSpinnerClick(opt, rect, x);
            break;
        case CY_Window_OptionsList.TYPE_BUTTON:
            this.processOk();
            break;
    }
};

/**
 * Process a click on a toggle control.
 * Clicking OFF button sets value to false, clicking ON button sets value to true.
 * @param {Object} opt - The option object
 * @param {Object} rect - The item rectangle
 * @param {number} x - Local X coordinate of the click
 */
CY_Window_OptionsList.prototype.processToggleClick = function(opt, rect, x) {
    var labelWidth = rect.width * 0.5;
    var controlX = rect.x + labelWidth;
    var controlWidth = rect.width * 0.5;
    var btnWidth = controlWidth / 2 - 4;
    
    // Check if click is in the control area (right half)
    if (x >= controlX) {
        var relativeX = x - controlX;
        var currentValue = this.getConfigValue(opt.symbol);
        
        // OFF button area (left side of control)
        if (relativeX < btnWidth) {
            if (currentValue !== false) {
                this.setConfigValue(opt.symbol, false);
                SoundManager.playCursor();
                this.redrawItem(this.index());
            }
        }
        // ON button area (right side of control, after gap)
        else if (relativeX >= btnWidth + 8 && relativeX < btnWidth * 2 + 8) {
            if (currentValue !== true) {
                this.setConfigValue(opt.symbol, true);
                SoundManager.playCursor();
                this.redrawItem(this.index());
            }
        }
    }
};

/**
 * Process a click on a slider control.
 * Clicking on the slider track sets the value based on click position,
 * or cycles through step values if step is defined.
 * @param {Object} opt - The option object
 * @param {Object} rect - The item rectangle
 * @param {number} x - Local X coordinate of the click
 */
CY_Window_OptionsList.prototype.processSliderClick = function(opt, rect, x) {
    var labelWidth = rect.width * 0.4;
    var controlX = rect.x + labelWidth;
    var trackWidth = (rect.width * 0.6) - 60;
    
    // Check if click is in the slider track area
    if (x >= controlX && x < controlX + trackWidth) {
        var step = opt.step || 20;
        var currentValue = this.getConfigValue(opt.symbol);
        
        // Cycle to next step value
        var newValue = currentValue + step;
        if (newValue > 100) {
            newValue = 0;
        }
        
        this.setConfigValue(opt.symbol, newValue);
        SoundManager.playCursor();
        this.redrawItem(this.index());
    }
};

/**
 * Process a click on a spinner control.
 * Clicking left arrow decreases, clicking right arrow increases.
 * @param {Object} opt - The option object
 * @param {Object} rect - The item rectangle
 * @param {number} x - Local X coordinate of the click
 */
CY_Window_OptionsList.prototype.processSpinnerClick = function(opt, rect, x) {
    var labelWidth = rect.width * 0.4;
    var controlX = rect.x + labelWidth;
    var controlWidth = rect.width * 0.6;
    
    // Check if click is in the control area
    if (x >= controlX) {
        var relativeX = x - controlX;
        
        // Left arrow area (first 30px)
        if (relativeX < 30) {
            this.changeOptionValue(-1);
        }
        // Right arrow area (last 30px)
        else if (relativeX >= controlWidth - 30) {
            this.changeOptionValue(1);
        }
    }
};

