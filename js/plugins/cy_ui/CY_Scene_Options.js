//=============================================================================
// CY_Scene_Options.js
//=============================================================================

/*:
 * @plugindesc Cyberpunk UI Mod - Options Scene
 * @author Cyberpunk UI Mod
 *
 * @help
 * CY_Scene_Options - Full-screen tabbed options scene with Cyberpunk styling.
 * Extends Scene_MenuBase with:
 * - Full screen gradient background (dark red to black)
 * - Horizontal tab bar (Sound, Controls, Gameplay) - full width
 * - Centered options list with max dialog width
 * - Bottom action bar - full width
 * - Global L1/R1 tab switching from any active window
 * - Settings persistence via ConfigManager
 */

//-----------------------------------------------------------------------------
// CY_Scene_Options
//
// The full-screen tabbed options scene with Cyberpunk styling.
//-----------------------------------------------------------------------------

function CY_Scene_Options() {
    this.initialize.apply(this, arguments);
}

CY_Scene_Options.prototype = Object.create(Scene_MenuBase.prototype);
CY_Scene_Options.prototype.constructor = CY_Scene_Options;

//-----------------------------------------------------------------------------
// Constants
//-----------------------------------------------------------------------------

CY_Scene_Options.MAX_OPTIONS_WIDTH = 816; // Max width for options content
CY_Scene_Options.TAB_BAR_HEIGHT = 48;
CY_Scene_Options.ACTION_BAR_HEIGHT = 48;

//-----------------------------------------------------------------------------
// Initialization
//-----------------------------------------------------------------------------

CY_Scene_Options.prototype.initialize = function() {
    Scene_MenuBase.prototype.initialize.call(this);
};

//-----------------------------------------------------------------------------
// Scene Lifecycle
//-----------------------------------------------------------------------------

CY_Scene_Options.prototype.create = function() {
    Scene_MenuBase.prototype.create.call(this);
    this.createGradientBackground();
    this.createTabBar();
    this.createOptionsWindow();
    this.createActionBar();
};

CY_Scene_Options.prototype.terminate = function() {
    Scene_MenuBase.prototype.terminate.call(this);
    ConfigManager.save();
};

CY_Scene_Options.prototype.start = function() {
    Scene_MenuBase.prototype.start.call(this);
    this._tabBar.activate();
    this._lastFocus = 'tabBar';
    this.updateActionBar();
};

//-----------------------------------------------------------------------------
// Background - Full Screen Gradient
//-----------------------------------------------------------------------------

/**
 * Override createBackground to use custom gradient.
 */
CY_Scene_Options.prototype.createBackground = function() {
    // Don't call parent - we create our own background
    this._backgroundSprite = new Sprite();
    this._backgroundSprite.bitmap = new Bitmap(Graphics.width, Graphics.height);
    this.addChild(this._backgroundSprite);
};

/**
 * Create the gradient background.
 * Top: #39141B, Center: #06060E, Bottom: #08090E
 */
CY_Scene_Options.prototype.createGradientBackground = function() {
    if (!this._backgroundSprite) return;
    
    var bmp = this._backgroundSprite.bitmap;
    var ctx = bmp._context;
    var w = Graphics.width;
    var h = Graphics.height;
    
    // Create vertical gradient
    var gradient = ctx.createLinearGradient(0, 0, 0, h);
    gradient.addColorStop(0, '#39141B');    // Top - dark red
    gradient.addColorStop(0.5, '#06060E');  // Center - very dark
    gradient.addColorStop(1, '#08090E');    // Bottom - near black
    
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, w, h);
    
    bmp._baseTexture.update();
};


//-----------------------------------------------------------------------------
// Window Creation - Full Width Tab Bar and Action Bar, Centered Options
//-----------------------------------------------------------------------------

/**
 * Calculate the offset needed to go from boxWidth/boxHeight to full screen.
 */
CY_Scene_Options.prototype.getScreenOffsets = function() {
    return {
        x: -Math.floor((Graphics.width - Graphics.boxWidth) / 2),
        y: -Math.floor((Graphics.height - Graphics.boxHeight) / 2),
        fullWidth: Graphics.width,
        fullHeight: Graphics.height
    };
};

/**
 * Create the tab bar window - full width at top.
 */
CY_Scene_Options.prototype.createTabBar = function() {
    var offsets = this.getScreenOffsets();
    var width = offsets.fullWidth;
    var height = CY_Scene_Options.TAB_BAR_HEIGHT;
    
    this._tabBar = new CY_Window_TabBar(['SOUND', 'CONTROLS', 'GAMEPLAY']);
    this._tabBar.move(offsets.x, offsets.y, width, height);
    this._tabBar.setHandler('ok', this.onTabOk.bind(this));
    this._tabBar.setHandler('cancel', this.popScene.bind(this));
    this._tabBar.opacity = 0; // Transparent window chrome
    // Hide the custom CY background sprite so gradient shows through
    if (this._tabBar._cyBackSprite) {
        this._tabBar._cyBackSprite.visible = false;
    }
    this.addWindow(this._tabBar);
};

/**
 * Create the options window - centered with max width, transparent background.
 */
CY_Scene_Options.prototype.createOptionsWindow = function() {
    var offsets = this.getScreenOffsets();
    var maxWidth = CY_Scene_Options.MAX_OPTIONS_WIDTH;
    var width = Math.min(maxWidth, Graphics.boxWidth - 40);
    var x = Math.floor((Graphics.boxWidth - width) / 2); // Centered within boxWidth
    var y = CY_Scene_Options.TAB_BAR_HEIGHT + offsets.y;
    var height = offsets.fullHeight - CY_Scene_Options.TAB_BAR_HEIGHT - CY_Scene_Options.ACTION_BAR_HEIGHT;

    this._optionsWindow = new CY_Window_OptionsList(x, y, width, height);
    this._optionsWindow.setHandler('cancel', this.onOptionsCancel.bind(this));
    this._optionsWindow.opacity = 0; // Transparent window chrome
    // Hide the custom CY background sprite so gradient shows through
    if (this._optionsWindow._cyBackSprite) {
        this._optionsWindow._cyBackSprite.visible = false;
    }
    this.addWindow(this._optionsWindow);
    
    this.loadTabOptions(0);
};

/**
 * Create the action bar window - full width at bottom.
 */
CY_Scene_Options.prototype.createActionBar = function() {
    var offsets = this.getScreenOffsets();
    var width = offsets.fullWidth;
    var height = CY_Scene_Options.ACTION_BAR_HEIGHT;
    var y = offsets.fullHeight - height + offsets.y;
    
    this._actionBar = new CY_Window_ActionBar();
    this._actionBar.move(offsets.x, y, width, height);
    this._actionBar.opacity = 0; // Transparent window chrome
    // Hide the custom CY background sprite so gradient shows through
    if (this._actionBar._cyBackSprite) {
        this._actionBar._cyBackSprite.visible = false;
    }
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
        actions = [
            { button: 'B', label: 'Back' },
            { button: 'L1', label: 'Prev Tab' },
            { button: 'R1', label: 'Next Tab' },
            { button: 'A', label: 'Select' }
        ];
    } else if (this._optionsWindow && this._optionsWindow.active) {
        actions = [
            { button: 'B', label: 'Back' },
            { button: 'L1', label: 'Prev Tab' },
            { button: 'R1', label: 'Next Tab' },
            { button: 'A', label: 'Adjust' }
        ];
    } else {
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

CY_Scene_Options.prototype.loadTabOptions = function(tabIndex) {
    var options = [];
    
    switch (tabIndex) {
        case 0: // SOUND
            options = [
                { type: 'header', label: 'Volume' },
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

CY_Scene_Options.prototype.onTabOk = function() {
    this.loadTabOptions(this._tabBar.index());
    this._optionsWindow.activate();
    this._optionsWindow.select(0);
    this.updateActionBar();
};

CY_Scene_Options.prototype.onOptionsCancel = function() {
    this._optionsWindow.deselect();
    this._tabBar.activate();
    this.updateActionBar();
};

//-----------------------------------------------------------------------------
// Input & Update
//-----------------------------------------------------------------------------

CY_Scene_Options.prototype.update = function() {
    Scene_MenuBase.prototype.update.call(this);
    
    if (Input.isTriggered('pageup')) {
        this.switchTab(-1);
    } else if (Input.isTriggered('pagedown')) {
        this.switchTab(1);
    }
    
    this.updateActionBarOnFocusChange();
};

CY_Scene_Options.prototype.updateActionBarOnFocusChange = function() {
    var currentFocus = this._tabBar.active ? 'tabBar' : 
                       this._optionsWindow.active ? 'options' : 'none';
    
    if (this._lastFocus !== currentFocus) {
        this._lastFocus = currentFocus;
        this.updateActionBar();
    }
};

CY_Scene_Options.prototype.switchTab = function(direction) {
    var tabCount = 3;
    var currentIndex = this._tabBar.index();
    var newIndex = (currentIndex + direction + tabCount) % tabCount;
    
    this._tabBar.select(newIndex);
    this.loadTabOptions(newIndex);
    
    if (this._optionsWindow.active) {
        this._optionsWindow.select(0);
    }
    
    SoundManager.playCursor();
};
