//=============================================================================
// CY_Scene_Options.js
//=============================================================================

/*:
 * @plugindesc Cyberpunk UI Mod - Options Scene
 * @author Cyberpunk UI Mod
 *
 * @help
 * CY_Scene_Options - Tabbed options scene with Cyberpunk styling.
 * Extends Scene_MenuBase with:
 * - Horizontal tab bar (Sound, Controls, Gameplay)
 * - Scrollable options list with various control types
 * - Bottom action bar with context-sensitive controls
 * - Global L1/R1 tab switching from any active window
 * - Settings persistence via ConfigManager
 *
 * This plugin requires the following plugins to be loaded first:
 * - CY_System.js
 * - CY_Window_Base.js
 * - CY_Window_Selectable.js
 * - CY_Window_TabBar.js
 * - CY_Window_OptionsList.js
 * - CY_Window_ActionBar.js
 *
 * Requirements fulfilled:
 * - 5.1: Extend Scene_MenuBase
 * - 5.2: Horizontal tab bar with categories (Sound, Controls, Gameplay)
 * - 5.3: L1/LB or Q navigates to previous tab
 * - 5.4: R1/RB or E navigates to next tab
 * - 5.6: Bottom action bar showing available controls
 * - 6.8: Options grouped under section headers
 * - 8.5: Page navigation with shoulder buttons from any window
 * - 9.1: Save settings on exit via ConfigManager
 */

//-----------------------------------------------------------------------------
// CY_Scene_Options
//
// The tabbed options scene with Cyberpunk styling.
//-----------------------------------------------------------------------------

function CY_Scene_Options() {
    this.initialize.apply(this, arguments);
}

CY_Scene_Options.prototype = Object.create(Scene_MenuBase.prototype);
CY_Scene_Options.prototype.constructor = CY_Scene_Options;


//-----------------------------------------------------------------------------
// Initialization
//-----------------------------------------------------------------------------

/**
 * Initialize the options scene.
 */
CY_Scene_Options.prototype.initialize = function() {
    Scene_MenuBase.prototype.initialize.call(this);
};

/**
 * Create all scene elements.
 * Requirement 5.1: Extend Scene_MenuBase
 * Requirement 5.2: Horizontal tab bar with categories
 * Requirement 5.6: Bottom action bar
 */
CY_Scene_Options.prototype.create = function() {
    Scene_MenuBase.prototype.create.call(this);
    this.createTabBar();
    this.createOptionsList();
    this.createActionBar();
};

/**
 * Start the scene.
 * Activates the options list by default.
 */
CY_Scene_Options.prototype.start = function() {
    Scene_MenuBase.prototype.start.call(this);
    this._optionsList.activate();
};

//-----------------------------------------------------------------------------
// Window Creation
// Requirement 5.2: Horizontal tab bar with categories (Sound, Controls, Gameplay)
// Requirement 5.6: Bottom action bar showing available controls
//-----------------------------------------------------------------------------

/**
 * Create the tab bar window.
 * Displays Sound, Controls, Gameplay tabs at the top.
 */
CY_Scene_Options.prototype.createTabBar = function() {
    this._tabBar = new CY_Window_TabBar(['SOUND', 'CONTROLS', 'GAMEPLAY']);
    this._tabBar.setHandler('ok', this.onTabOk.bind(this));
    this._tabBar.setHandler('cancel', this.popScene.bind(this));
    this.addWindow(this._tabBar);
};

/**
 * Create the options list window.
 * Displays options for the currently selected tab.
 */
CY_Scene_Options.prototype.createOptionsList = function() {
    var y = this._tabBar.height;
    var height = Graphics.boxHeight - y - 48; // Leave room for action bar
    this._optionsList = new CY_Window_OptionsList(0, y, Graphics.boxWidth, height);
    this._optionsList.setHandler('cancel', this.onOptionsCancel.bind(this));
    this.addWindow(this._optionsList);
    // Load initial tab options (Sound tab)
    this.loadTabOptions(0);
};

/**
 * Create the action bar window.
 * Displays available controls at the bottom of the screen.
 */
CY_Scene_Options.prototype.createActionBar = function() {
    this._actionBar = new CY_Window_ActionBar();
    this._actionBar.setActions([
        { button: 'B', label: 'Close' },
        { button: 'Y', label: 'Restore Defaults' },
        { button: 'A', label: 'Select' }
    ]);
    this.addWindow(this._actionBar);
};


//-----------------------------------------------------------------------------
// Tab Content Loading
// Requirement 5.2: Tab bar with categories
// Requirement 6.8: Options grouped under section headers
//-----------------------------------------------------------------------------

/**
 * Load options for a specific tab.
 * Each tab has its own set of options with headers for grouping.
 * @param {number} tabIndex - Index of the tab (0=Sound, 1=Controls, 2=Gameplay)
 */
CY_Scene_Options.prototype.loadTabOptions = function(tabIndex) {
    var options = [];
    
    switch (tabIndex) {
        case 0: // SOUND
            options = [
                { type: 'header', label: 'Volume' },
                { type: 'slider', label: 'Master Volume', symbol: 'bgmVolume' },
                { type: 'slider', label: 'SFX Volume', symbol: 'seVolume' },
                { type: 'slider', label: 'Music Volume', symbol: 'meVolume' },
                { type: 'header', label: 'Misc' },
                { type: 'toggle', label: 'Mute Detection Sounds', symbol: 'muteDetection' }
            ];
            break;
            
        case 1: // CONTROLS
            options = [
                { type: 'header', label: 'Input' },
                { type: 'toggle', label: 'Always Dash', symbol: 'alwaysDash' },
                { type: 'toggle', label: 'Command Remember', symbol: 'commandRemember' }
            ];
            break;
            
        case 2: // GAMEPLAY
            options = [
                { type: 'header', label: 'Display' },
                { type: 'toggle', label: 'Show Damage Numbers', symbol: 'showDamage' },
                { type: 'header', label: 'Subtitles' },
                { type: 'toggle', label: 'Cinematic', symbol: 'subtitlesCinematic' },
                { type: 'toggle', label: 'Overhead', symbol: 'subtitlesOverhead' }
            ];
            break;
    }
    
    this._optionsList.setOptions(options);
};

//-----------------------------------------------------------------------------
// Handler Methods
//-----------------------------------------------------------------------------

/**
 * Handle tab selection (OK pressed on tab bar).
 * Reloads options for the selected tab and reactivates tab bar.
 */
CY_Scene_Options.prototype.onTabOk = function() {
    this.loadTabOptions(this._tabBar.index());
    this._tabBar.activate();
};

/**
 * Handle cancel from options list.
 * Returns focus to the tab bar.
 */
CY_Scene_Options.prototype.onOptionsCancel = function() {
    this._tabBar.activate();
    this._optionsList.deactivate();
};


//-----------------------------------------------------------------------------
// Global Tab Switching
// Requirement 5.3: L1/LB or Q navigates to previous tab
// Requirement 5.4: R1/RB or E navigates to next tab
// Requirement 8.5: Page navigation with shoulder buttons from any window
//-----------------------------------------------------------------------------

/**
 * Update the scene.
 * Handles global L1/R1 tab switching from any active window.
 */
CY_Scene_Options.prototype.update = function() {
    Scene_MenuBase.prototype.update.call(this);
    
    // Handle L1/R1 for tab switching from anywhere in the scene
    // This allows tab switching even when options list is active
    if (Input.isTriggered('pageup')) {
        this.switchTab(-1);
    } else if (Input.isTriggered('pagedown')) {
        this.switchTab(1);
    }
};

/**
 * Switch to a different tab.
 * Wraps around at the ends (last tab -> first tab, first tab -> last tab).
 * @param {number} direction - Direction to switch (-1 for previous, 1 for next)
 */
CY_Scene_Options.prototype.switchTab = function(direction) {
    var tabCount = 3; // Sound, Controls, Gameplay
    var currentIndex = this._tabBar.index();
    var newIndex = (currentIndex + direction + tabCount) % tabCount;
    
    this._tabBar.select(newIndex);
    this.loadTabOptions(newIndex);
    SoundManager.playCursor();
};

//-----------------------------------------------------------------------------
// Settings Persistence
// Requirement 9.1: Save settings on exit via ConfigManager
//-----------------------------------------------------------------------------

/**
 * Terminate the scene.
 * Saves all settings to ConfigManager before exiting.
 */
CY_Scene_Options.prototype.terminate = function() {
    Scene_MenuBase.prototype.terminate.call(this);
    ConfigManager.save();
};

//-----------------------------------------------------------------------------
// Background Override
//-----------------------------------------------------------------------------

/**
 * Create the scene background.
 * Uses a semi-transparent black overlay for the Cyberpunk aesthetic.
 */
CY_Scene_Options.prototype.createBackground = function() {
    Scene_MenuBase.prototype.createBackground.call(this);
    // The default Scene_MenuBase background works well with our styling
};

