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

//-----------------------------------------------------------------------------
// Scene Lifecycle (Matches Standard Scene_Options Flow)
//-----------------------------------------------------------------------------

CY_Scene_Options.prototype.create = function() {
    Scene_MenuBase.prototype.create.call(this);
    this.createTabBar();        // Custom: Tabs logic
    this.createOptionsWindow(); // Standard: Main options window
    this.createActionBar();     // Custom: Bottom Legend
};

CY_Scene_Options.prototype.terminate = function() {
    Scene_MenuBase.prototype.terminate.call(this);
    ConfigManager.save();
};

/**
 * Start the scene.
 * Activates the tab bar by default (user selects category first).
 */
CY_Scene_Options.prototype.start = function() {
    Scene_MenuBase.prototype.start.call(this);
    this._tabBar.activate();
    this._lastFocus = 'tabBar';
    this.updateActionBar();
};

//-----------------------------------------------------------------------------
// Window Creation
// Requirement 5.2: Horizontal tab bar with categories (Sound, Controls, Gameplay)
// Requirement 5.6: Bottom action bar showing available controls
//-----------------------------------------------------------------------------

/**
 * Create the tab bar window.
 * Displays Sound, Controls, Gameplay tabs at the top.
 * Acts as category selector similar to YEP_OptionsCore.
 */
CY_Scene_Options.prototype.createTabBar = function() {
    this._tabBar = new CY_Window_TabBar(['SOUND', 'CONTROLS', 'GAMEPLAY']);
    this._tabBar.setHandler('ok', this.onTabOk.bind(this));
    this._tabBar.setHandler('cancel', this.popScene.bind(this));
    this.addWindow(this._tabBar);
};

/**
 * Create the options window.
 * Renamed from createOptionsList to match standard Scene_Options flow.
 */
CY_Scene_Options.prototype.createOptionsWindow = function() {
    // Calculate layout based on tab bar height
    var y = this._tabBar.height;
    var height = Graphics.boxHeight - y - 48; // Leave room for action bar

    // Instantiate the custom list window
    this._optionsWindow = new CY_Window_OptionsList(0, y, Graphics.boxWidth, height);
    
    // Set Handlers - cancel goes back to tab bar
    this._optionsWindow.setHandler('cancel', this.onOptionsCancel.bind(this));
    
    this.addWindow(this._optionsWindow);
    
    // Initial Load
    this.loadTabOptions(0);
};

/**
 * Create the action bar window.
 * Displays available controls at the bottom of the screen.
 * Updates based on current context.
 */
CY_Scene_Options.prototype.createActionBar = function() {
    this._actionBar = new CY_Window_ActionBar();
    this.updateActionBar();
    this.addWindow(this._actionBar);
};

/**
 * Update action bar based on current active window.
 */
CY_Scene_Options.prototype.updateActionBar = function() {
    if (!this._actionBar) return;
    
    var actions = [];
    
    if (this._tabBar && this._tabBar.active) {
        // Tab bar is active
        actions = [
            { button: 'B', label: 'Back' },
            { button: 'L1', label: 'Prev Tab' },
            { button: 'R1', label: 'Next Tab' },
            { button: 'A', label: 'Select' }
        ];
    } else if (this._optionsWindow && this._optionsWindow.active) {
        // Options list is active
        actions = [
            { button: 'B', label: 'Back' },
            { button: 'L1', label: 'Prev Tab' },
            { button: 'R1', label: 'Next Tab' },
            { button: 'A', label: 'Adjust' }
        ];
    } else {
        // Default
        actions = [
            { button: 'B', label: 'Close' },
            { button: 'A', label: 'Select' }
        ];
    }
    
    this._actionBar.setActions(actions);
};

//-----------------------------------------------------------------------------
// Data Logic
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
                // Added step: 20 to match your standard Window_Options volumeOffset
                { type: 'slider', label: 'Master Volume', symbol: 'bgmVolume', step: 20 },
                { type: 'slider', label: 'SFX Volume', symbol: 'seVolume', step: 20 },
                { type: 'slider', label: 'Music Volume', symbol: 'meVolume', step: 20 },
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
    
    this._optionsWindow.setOptions(options);
};

//-----------------------------------------------------------------------------
// Handler Methods
//-----------------------------------------------------------------------------

/**
 * Handle tab selection (OK pressed on tab bar).
 * Activates the options window for the selected tab.
 */
CY_Scene_Options.prototype.onTabOk = function() {
    this.loadTabOptions(this._tabBar.index());
    this._optionsWindow.activate();
    this._optionsWindow.select(0);
    this.updateActionBar();
};

/**
 * Handle cancel from options list.
 * Returns focus to the tab bar.
 */
CY_Scene_Options.prototype.onOptionsCancel = function() {
    this._optionsWindow.deselect();
    this._tabBar.activate();
    this.updateActionBar();
};


//-----------------------------------------------------------------------------
// Input & Update
//-----------------------------------------------------------------------------

/**
 * Update the scene.
 * Handles global L1/R1 tab switching from any active window.
 */
CY_Scene_Options.prototype.update = function() {
    Scene_MenuBase.prototype.update.call(this);
    
    // Global tab switching logic - works from any window
    if (Input.isTriggered('pageup')) {
        this.switchTab(-1);
    } else if (Input.isTriggered('pagedown')) {
        this.switchTab(1);
    }
    
    // Update action bar when window focus changes
    this.updateActionBarOnFocusChange();
};

/**
 * Track focus changes and update action bar accordingly.
 */
CY_Scene_Options.prototype.updateActionBarOnFocusChange = function() {
    var currentFocus = this._tabBar.active ? 'tabBar' : 
                       this._optionsWindow.active ? 'options' : 'none';
    
    if (this._lastFocus !== currentFocus) {
        this._lastFocus = currentFocus;
        this.updateActionBar();
    }
};

/**
 * Switch to a different tab.
 * Wraps around at the ends (last tab -> first tab, first tab -> last tab).
 * @param {number} direction - Direction to switch (-1 for previous, 1 for next)
 */
CY_Scene_Options.prototype.switchTab = function(direction) {
    var tabCount = 3;
    var currentIndex = this._tabBar.index();
    var newIndex = (currentIndex + direction + tabCount) % tabCount;
    
    this._tabBar.select(newIndex);
    this.loadTabOptions(newIndex);
    
    // If options window was active, keep it active with new content
    if (this._optionsWindow.active) {
        this._optionsWindow.select(0);
    }
    
    SoundManager.playCursor();
};

//-----------------------------------------------------------------------------
// Background
//-----------------------------------------------------------------------------

/**
 * Create the scene background.
 * Uses a semi-transparent black overlay for the Cyberpunk aesthetic.
 */
CY_Scene_Options.prototype.createBackground = function() {
    Scene_MenuBase.prototype.createBackground.call(this);
    // The default Scene_MenuBase background works well with our styling
};

