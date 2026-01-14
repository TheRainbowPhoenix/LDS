//=============================================================================
// CY_Window_TitleCommand.js
//=============================================================================

/*:
 * @plugindesc Cyberpunk UI Mod - Title Command Window
 * @author Cyberpunk UI Mod
 *
 * @help
 * CY_Window_TitleCommand - Title screen command window with Cyberpunk styling.
 * Extends CY_Window_Selectable with Window_Command functionality mixed in.
 *
 * Features:
 * - Flat button styling without borders
 * - Cyan highlight for selected items
 * - Inactive text color for unselected items
 * - Left-side positioning (x=80, y=center)
 * - Commands: Continue (conditional), New Game, Load Game, Settings, Credits
 *
 * This plugin requires:
 * - CY_System.js
 * - CY_Window_Base.js
 * - CY_Window_Selectable.js
 *
 * Requirements fulfilled:
 * - 4.1: Flat buttons without borders
 * - 4.2: Continue, New Game, Load Game, Settings, Credits commands
 * - 4.3: Cyan highlight for selected items
 * - 4.4: Inactive text color for unselected items
 * - 4.5: Responds to keyboard, mouse, and gamepad input
 * - 4.6: Continue disabled/hidden when no save data exists
 */

//-----------------------------------------------------------------------------
// CY_Window_TitleCommand
//
// The title screen command window with Cyberpunk styling.
//-----------------------------------------------------------------------------

function CY_Window_TitleCommand() {
    this.initialize.apply(this, arguments);
}

CY_Window_TitleCommand.prototype = Object.create(CY_Window_Selectable.prototype);
CY_Window_TitleCommand.prototype.constructor = CY_Window_TitleCommand;

//-----------------------------------------------------------------------------
// Static Properties
//-----------------------------------------------------------------------------

/**
 * Stores the last selected command symbol for returning to the same position.
 */
CY_Window_TitleCommand._lastCommandSymbol = null;

/**
 * Reset the last command position.
 */
CY_Window_TitleCommand.initCommandPosition = function () {
    this._lastCommandSymbol = null;
};

//-----------------------------------------------------------------------------
// Mixin Window_Command methods for command list functionality
//-----------------------------------------------------------------------------

/**
 * Clear the command list.
 * Mixin from Window_Command.
 */
CY_Window_TitleCommand.prototype.clearCommandList = Window_Command.prototype.clearCommandList;

/**
 * Add a command to the list.
 * Mixin from Window_Command.
 */
CY_Window_TitleCommand.prototype.addCommand = Window_Command.prototype.addCommand;

/**
 * Get the name of a command at the specified index.
 * Mixin from Window_Command.
 */
CY_Window_TitleCommand.prototype.commandName = Window_Command.prototype.commandName;

/**
 * Get the symbol of a command at the specified index.
 * Mixin from Window_Command.
 */
CY_Window_TitleCommand.prototype.commandSymbol = Window_Command.prototype.commandSymbol;

/**
 * Check if a command at the specified index is enabled.
 * Mixin from Window_Command.
 */
CY_Window_TitleCommand.prototype.isCommandEnabled = Window_Command.prototype.isCommandEnabled;

/**
 * Get the current command data.
 * Mixin from Window_Command.
 */
CY_Window_TitleCommand.prototype.currentData = Window_Command.prototype.currentData;

/**
 * Check if the current item is enabled.
 * Mixin from Window_Command.
 */
CY_Window_TitleCommand.prototype.isCurrentItemEnabled = Window_Command.prototype.isCurrentItemEnabled;

/**
 * Get the current command symbol.
 * Mixin from Window_Command.
 */
CY_Window_TitleCommand.prototype.currentSymbol = Window_Command.prototype.currentSymbol;

/**
 * Get the current command extension data.
 * Mixin from Window_Command.
 */
CY_Window_TitleCommand.prototype.currentExt = Window_Command.prototype.currentExt;

/**
 * Find the index of a command by symbol.
 * Mixin from Window_Command.
 */
CY_Window_TitleCommand.prototype.findSymbol = Window_Command.prototype.findSymbol;

/**
 * Select a command by symbol.
 * Mixin from Window_Command.
 */
CY_Window_TitleCommand.prototype.selectSymbol = Window_Command.prototype.selectSymbol;

/**
 * Find the index of a command by extension data.
 * Mixin from Window_Command.
 */
CY_Window_TitleCommand.prototype.findExt = Window_Command.prototype.findExt;

/**
 * Select a command by extension data.
 * Mixin from Window_Command.
 */
CY_Window_TitleCommand.prototype.selectExt = Window_Command.prototype.selectExt;

/**
 * Get the text alignment for items.
 * Mixin from Window_Command.
 */
CY_Window_TitleCommand.prototype.itemTextAlign = Window_Command.prototype.itemTextAlign;

/**
 * Check if OK input is enabled.
 * Mixin from Window_Command.
 */
CY_Window_TitleCommand.prototype.isOkEnabled = Window_Command.prototype.isOkEnabled;

/**
 * Call the OK handler based on current command symbol.
 * Mixin from Window_Command.
 */
CY_Window_TitleCommand.prototype.callOkHandler = Window_Command.prototype.callOkHandler;

//-----------------------------------------------------------------------------
// Initialization
//-----------------------------------------------------------------------------

/**
 * Initialize the Cyberpunk-styled title command window.
 * Requirement 4.2: Creates command list with all required commands
 */
CY_Window_TitleCommand.prototype.initialize = function () {
    // Build command list first (needed for sizing)
    this.clearCommandList();
    this.makeCommandList();

    // Calculate dimensions
    var width = this.windowWidth();
    var height = this.windowHeight();

    // Initialize parent with calculated dimensions
    CY_Window_Selectable.prototype.initialize.call(this, 0, 0, width, height);

    // Refresh contents and select first item
    this.refresh();
    this.select(0);
    this.activate();

    // Position window on left side
    this.updatePlacement();

    // Select last used command if available
    this.selectLast();
};

//-----------------------------------------------------------------------------
// Window Dimensions
//-----------------------------------------------------------------------------

/**
 * Get the window width.
 * @returns {number} Window width in pixels
 */
CY_Window_TitleCommand.prototype.windowWidth = function () {
    return 280;
};

/**
 * Get the window height based on number of commands.
 * @returns {number} Window height in pixels
 */
CY_Window_TitleCommand.prototype.windowHeight = function () {
    return this.fittingHeight(this.numVisibleRows());
};

/**
 * Get the number of visible rows.
 * @returns {number} Number of visible rows
 */
CY_Window_TitleCommand.prototype.numVisibleRows = function () {
    return Math.ceil(this.maxItems() / this.maxCols());
};

/**
 * Get the maximum number of items.
 * @returns {number} Number of commands in the list
 */
CY_Window_TitleCommand.prototype.maxItems = function () {
    return this._list ? this._list.length : 0;
};

/**
 * Get the height of each item row.
 * Smaller than default for more compact menu.
 * @returns {number} Item height in pixels
 */
CY_Window_TitleCommand.prototype.itemHeight = function () {
    return 32;
};

/**
 * Get the standard font size.
 * Smaller text for title menu.
 * @returns {number} Font size in pixels
 */
CY_Window_TitleCommand.prototype.standardFontSize = function () {
    return 22;
};

/**
 * Get the standard padding.
 * More padding for cleaner look.
 * @returns {number} Padding in pixels
 */
CY_Window_TitleCommand.prototype.standardPadding = function () {
    return 12;
};

/**
 * Get the text padding.
 * @returns {number} Text padding in pixels
 */
CY_Window_TitleCommand.prototype.textPadding = function () {
    return 8;
};

//-----------------------------------------------------------------------------
// Positioning
//-----------------------------------------------------------------------------

/**
 * Update window placement to left side of screen.
 * Requirement 4.1: Position window on left side (x=80, y=center)
 */
CY_Window_TitleCommand.prototype.updatePlacement = function () {
    this.x = 80;
    this.y = Math.floor(Graphics.boxHeight / 2);
};

//-----------------------------------------------------------------------------
// Command List
//-----------------------------------------------------------------------------

/**
 * Create the command list.
 * Requirement 4.2: Continue, New Game, Load Game, Settings, Credits
 * Requirement 4.6: Continue only shown when save data exists
 */
CY_Window_TitleCommand.prototype.makeCommandList = function () {
    // Only add Continue if save data exists
    if (this.isContinueEnabled()) {
        this.addCommand('CONTINUE', 'continue', true);
    }
    this.addCommand('NEW GAME', 'newGame', true);
    this.addCommand('LOAD GAME', 'loadGame', true);
    this.addCommand('SETTINGS', 'options', true);
    this.addCommand('CREDITS', 'credits', true);
    this.addCommand('PHASER', 'phaser', true);
    this.addCommand('TEAM PICK', 'charPick', true);
    this.addCommand('SPINE', 'spine', true);
    this.addCommand('LOBBY', 'lobby', true);
};

/**
 * Check if Continue command should be enabled.
 * Requirement 4.6: Continue disabled when no save data exists
 * @returns {boolean} True if any save file exists
 */
CY_Window_TitleCommand.prototype.isContinueEnabled = function () {
    return DataManager.isAnySavefileExists();
};

//-----------------------------------------------------------------------------
// Drawing
//-----------------------------------------------------------------------------

/**
 * Draw a command item with Cyberpunk styling.
 * Requirement 4.1: Flat buttons without borders
 * Requirement 4.3: Cyan highlight for selected items
 * Requirement 4.4: Light red text color for unselected items
 * @param {number} index - Index of the item to draw
 */
CY_Window_TitleCommand.prototype.drawItem = function (index) {
    var rect = this.itemRectForText(index);
    var isSelected = (index === this.index());
    var isEnabled = this.isCommandEnabled(index);

    // Determine text color based on state
    // Requirement 4.3: Cyan for selected
    // Requirement 4.4: Light red for unselected, inactive for disabled
    if (!isEnabled) {
        this.changeTextColor(CY_System.Colors.inactiveText);
    } else if (isSelected) {
        this.changeTextColor(CY_System.Colors.cyan);
    } else {
        this.changeTextColor(CY_System.Colors.lightRed);
    }

    // Set paint opacity based on enabled state
    this.changePaintOpacity(isEnabled);

    // Draw command text (left-aligned, flat style without borders)
    this.drawText(this.commandName(index), rect.x, rect.y, rect.width, 'left');
};

/**
 * Refresh the window contents.
 * Rebuilds command list and redraws all items.
 */
CY_Window_TitleCommand.prototype.refresh = function () {
    this.clearCommandList();
    this.makeCommandList();
    this.createContents();
    CY_Window_Selectable.prototype.refresh.call(this);
};

//-----------------------------------------------------------------------------
// Background Override
//-----------------------------------------------------------------------------

/**
 * Override to use minimal/transparent background for title command.
 * Requirement 4.1: Flat buttons without borders
 */
CY_Window_TitleCommand.prototype.refreshCyBackground = function () {
    // Title command uses minimal/no background for flat button appearance
    if (this._cyBackSprite && this._cyBackSprite.bitmap) {
        this._cyBackSprite.bitmap.clear();
    }
};

//-----------------------------------------------------------------------------
// Selection Memory
//-----------------------------------------------------------------------------

/**
 * Process OK input and remember the selected command.
 */
CY_Window_TitleCommand.prototype.processOk = function () {
    CY_Window_TitleCommand._lastCommandSymbol = this.currentSymbol();
    CY_Window_Selectable.prototype.processOk.call(this);
};

/**
 * Select the last used command or default to Continue/first item.
 */
CY_Window_TitleCommand.prototype.selectLast = function () {
    if (CY_Window_TitleCommand._lastCommandSymbol) {
        this.selectSymbol(CY_Window_TitleCommand._lastCommandSymbol);
    } else if (this.isContinueEnabled()) {
        this.selectSymbol('continue');
    }
};
