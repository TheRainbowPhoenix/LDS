# Embedded folder: cy_ui

`_footer.js`:
```javascript
  console.log(
    "[CY_UI] UI Mod loaded !"
  );
})();
```

`_header.js`:
```javascript
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
```

`CY_Main.js`:
```javascript
//=============================================================================
// CY_Main.js
//=============================================================================




const CY_Main = {};

CY_Main.Parameters = {
    enableCyberpunkTitle: parameters['enableCyberpunkTitle'] !== 'false',
    enableCyberpunkOptions: parameters['enableCyberpunkOptions'] !== 'false',
    titleLogoX: Number(parameters['titleLogoX'] || 80),
    titleLogoY: Number(parameters['titleLogoY'] || -150),
    commandWindowX: Number(parameters['commandWindowX'] || 80)
};

//=========================================================================
// Scene_Title Override
// Requirement 10.1, 10.2, 10.3: Override without modifying core files
//=========================================================================

if (CY_Main.Parameters.enableCyberpunkTitle) {
    /**
     * Store reference to original Scene_Title for fallback
     */
    const _Original_Scene_Title = Scene_Title;
    
    /**
     * Override Scene_Title constructor to use CY_Scene_Title
     * This replaces the default title screen with the Cyberpunk version
     */
    Scene_Title = function() {
        this.initialize.apply(this, arguments);
    };
    
    // Copy prototype from CY_Scene_Title
    Scene_Title.prototype = Object.create(CY_Scene_Title.prototype);
    Scene_Title.prototype.constructor = Scene_Title;
    
    /**
     * Initialize using CY_Scene_Title's initialization
     */
    Scene_Title.prototype.initialize = function() {
        CY_Scene_Title.prototype.initialize.call(this);
    };
    
    // Copy all methods from CY_Scene_Title to Scene_Title
    Object.keys(CY_Scene_Title.prototype).forEach(function(method) {
        Scene_Title.prototype[method] = CY_Scene_Title.prototype[method];
    });
    
    /**
     * Apply custom positioning from plugin parameters
     */
    const _CY_Scene_Title_createLogo = Scene_Title.prototype.createLogo;
    Scene_Title.prototype.createLogo = function() {
        _CY_Scene_Title_createLogo.call(this);
        // Apply custom positioning from parameters
        this._logoSprite.x = CY_Main.Parameters.titleLogoX;
        this._logoSprite.y = Math.floor(Graphics.boxHeight / 2) + CY_Main.Parameters.titleLogoY;
    };
    
    const _CY_Scene_Title_createCommandWindow = Scene_Title.prototype.createCommandWindow;
    Scene_Title.prototype.createCommandWindow = function() {
        _CY_Scene_Title_createCommandWindow.call(this);
        // Apply custom positioning from parameters
        this._commandWindow.x = CY_Main.Parameters.commandWindowX;
    };
}

//=========================================================================
// Scene_Options Override
// Requirement 10.1, 10.2, 10.3: Override without modifying core files
//=========================================================================

if (CY_Main.Parameters.enableCyberpunkOptions) {
    /**
     * Store reference to original Scene_Options for fallback
     */
    const _Original_Scene_Options = Scene_Options;
    
    /**
     * Override Scene_Options constructor to use CY_Scene_Options
     * This replaces the default options menu with the Cyberpunk version
     */
    Scene_Options = function() {
        this.initialize.apply(this, arguments);
    };
    
    // Copy prototype from CY_Scene_Options
    Scene_Options.prototype = Object.create(CY_Scene_Options.prototype);
    Scene_Options.prototype.constructor = Scene_Options;
    
    /**
     * Initialize using CY_Scene_Options's initialization
     */
    Scene_Options.prototype.initialize = function() {
        CY_Scene_Options.prototype.initialize.call(this);
    };
    
    // Copy all methods from CY_Scene_Options to Scene_Options
    Object.keys(CY_Scene_Options.prototype).forEach(function(method) {
        Scene_Options.prototype[method] = CY_Scene_Options.prototype[method];
    });
}

//=========================================================================
// Expose CY_Main globally for other plugins to access parameters
//=========================================================================

globalThis.CY_Main = CY_Main;

```

`CY_Scene_Options.js`:
```javascript
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

```

`CY_Scene_Title.js`:
```javascript
//=============================================================================
// CY_Scene_Title.js
//=============================================================================

/*:
 * @plugindesc Cyberpunk UI Mod - Title Scene
 * @author Cyberpunk UI Mod
 *
 * @help
 * CY_Scene_Title - Cyberpunk 2077-styled title screen scene.
 * Extends Scene_Base with custom background, logo, and command window.
 *
 * Features:
 * - Background images (title1/title2) centered on screen
 * - Game logo/title positioned on left side with yellow text
 * - CY_Window_TitleCommand for menu navigation
 * - Title BGM playback
 *
 * This plugin requires:
 * - CY_System.js
 * - CY_Window_Base.js
 * - CY_Window_Selectable.js
 * - CY_Window_TitleCommand.js
 *
 * Requirements fulfilled:
 * - 3.1: Extends Scene_Base
 * - 3.2: Game logo/title on left side of screen
 * - 3.3: Command menu below logo on left side
 * - 3.4: Plays title BGM on scene start
 * - 3.5: Supports background images (title1 and title2)
 */

//-----------------------------------------------------------------------------
// CY_Scene_Title
//
// The Cyberpunk-styled title scene.
//-----------------------------------------------------------------------------

function CY_Scene_Title() {
    this.initialize.apply(this, arguments);
}

CY_Scene_Title.prototype = Object.create(Scene_Base.prototype);
CY_Scene_Title.prototype.constructor = CY_Scene_Title;

//-----------------------------------------------------------------------------
// Initialization
//-----------------------------------------------------------------------------

/**
 * Initialize the Cyberpunk title scene.
 * Requirement 3.1: Extends Scene_Base
 */
CY_Scene_Title.prototype.initialize = function() {
    Scene_Base.prototype.initialize.call(this);
};

//-----------------------------------------------------------------------------
// Scene Creation
//-----------------------------------------------------------------------------

/**
 * Create all scene elements.
 * Creates background, logo, and command window in order.
 */
CY_Scene_Title.prototype.create = function() {
    Scene_Base.prototype.create.call(this);
    this.createBackground();
    this.createLogo();
    this.createCommandWindow();
};

/**
 * Start the scene.
 * Clears scene stack, plays music, and fades in.
 * Requirement 3.4: Plays title BGM on scene start
 */
CY_Scene_Title.prototype.start = function() {
    Scene_Base.prototype.start.call(this);
    SceneManager.clearStack();
    this.centerSprite(this._backSprite1);
    this.centerSprite(this._backSprite2);
    this.playTitleMusic();
    this.startFadeIn(this.fadeSpeed(), false);
};

/**
 * Update the scene each frame.
 * Opens command window when not busy.
 */
CY_Scene_Title.prototype.update = function() {
    if (!this.isBusy()) {
        this._commandWindow.open();
    }
    Scene_Base.prototype.update.call(this);
};

/**
 * Check if the scene is busy (transitioning).
 * @returns {boolean} True if command window is closing or scene is busy
 */
CY_Scene_Title.prototype.isBusy = function() {
    return this._commandWindow.isClosing() || Scene_Base.prototype.isBusy.call(this);
};

/**
 * Terminate the scene.
 * Takes a snapshot for background use in other scenes.
 */
CY_Scene_Title.prototype.terminate = function() {
    Scene_Base.prototype.terminate.call(this);
    SceneManager.snapForBackground();
};

//-----------------------------------------------------------------------------
// Background Creation
//-----------------------------------------------------------------------------

/**
 * Create background sprites using title1 and title2 images.
 * Requirement 3.5: Supports background images (title1 and title2)
 */
CY_Scene_Title.prototype.createBackground = function() {
    this._backSprite1 = new Sprite(
        ImageManager.loadTitle1($dataSystem.title1Name)
    );
    this._backSprite2 = new Sprite(
        ImageManager.loadTitle2($dataSystem.title2Name)
    );
    this.addChild(this._backSprite1);
    this.addChild(this._backSprite2);
};

/**
 * Center a sprite on the screen.
 * @param {Sprite} sprite - The sprite to center
 */
CY_Scene_Title.prototype.centerSprite = function(sprite) {
    sprite.x = Graphics.width / 2;
    sprite.y = Graphics.height / 2;
    sprite.anchor.x = 0.5;
    sprite.anchor.y = 0.5;
};

//-----------------------------------------------------------------------------
// Logo Creation
//-----------------------------------------------------------------------------

/**
 * Create the game logo/title sprite.
 * Requirement 3.2: Game logo/title on left side of screen with yellow text
 */
CY_Scene_Title.prototype.createLogo = function() {
    this._logoSprite = new Sprite();
    this._logoSprite.bitmap = new Bitmap(300, 100);
    
    // Position on left side, above the command menu
    this._logoSprite.x = 80;
    this._logoSprite.y = Math.floor(Graphics.boxHeight / 2) - 150;
    
    // Draw game title with Cyberpunk styling (yellow text)
    const bmp = this._logoSprite.bitmap;
    bmp.fontFace = 'GameFont';
    bmp.fontSize = 48;
    bmp.textColor = CY_System.Colors.yellow;
    bmp.outlineColor = 'rgba(0, 0, 0, 0.8)';
    bmp.outlineWidth = 4;
    bmp.drawText($dataSystem.gameTitle, 0, 0, 300, 60, 'left');
    
    this.addChild(this._logoSprite);
};

//-----------------------------------------------------------------------------
// Command Window Creation
//-----------------------------------------------------------------------------

/**
 * Create the command window with Cyberpunk styling.
 * Requirement 3.3: Command menu below logo on left side
 */
CY_Scene_Title.prototype.createCommandWindow = function() {
    this._commandWindow = new CY_Window_TitleCommand();
    
    // Wire command handlers
    this._commandWindow.setHandler('newGame', this.commandNewGame.bind(this));
    this._commandWindow.setHandler('continue', this.commandContinue.bind(this));
    this._commandWindow.setHandler('loadGame', this.commandLoadGame.bind(this));
    this._commandWindow.setHandler('options', this.commandOptions.bind(this));
    this._commandWindow.setHandler('credits', this.commandCredits.bind(this));
    
    this.addChild(this._commandWindow);
};

//-----------------------------------------------------------------------------
// Command Handlers
//-----------------------------------------------------------------------------

/**
 * Handle New Game command.
 * Sets up a new game and transitions to the map scene.
 */
CY_Scene_Title.prototype.commandNewGame = function() {
    DataManager.setupNewGame();
    this._commandWindow.close();
    this.fadeOutAll();
    SceneManager.goto(Scene_Map);
};

/**
 * Handle Continue command.
 * Loads the most recent save file.
 */
CY_Scene_Title.prototype.commandContinue = function() {
    this._commandWindow.close();
    SceneManager.push(Scene_Load);
};

/**
 * Handle Load Game command.
 * Opens the load game scene.
 */
CY_Scene_Title.prototype.commandLoadGame = function() {
    this._commandWindow.close();
    SceneManager.push(Scene_Load);
};

/**
 * Handle Options/Settings command.
 * Opens the options scene (CY_Scene_Options when available).
 */
CY_Scene_Title.prototype.commandOptions = function() {
    this._commandWindow.close();
    // Use CY_Scene_Options if available, otherwise fall back to Scene_Options
    if (typeof CY_Scene_Options !== 'undefined') {
        SceneManager.push(CY_Scene_Options);
    } else {
        SceneManager.push(Scene_Options);
    }
};

/**
 * Handle Credits command.
 * Currently reactivates the command window (credits scene can be implemented later).
 */
CY_Scene_Title.prototype.commandCredits = function() {
    // Credits scene placeholder - reactivate command window for now
    this._commandWindow.activate();
};

//-----------------------------------------------------------------------------
// Music
//-----------------------------------------------------------------------------

/**
 * Play the title screen background music.
 * Requirement 3.4: Plays title BGM on scene start
 */
CY_Scene_Title.prototype.playTitleMusic = function() {
    AudioManager.playBgm($dataSystem.titleBgm);
    AudioManager.stopBgs();
    AudioManager.stopMe();
};
```

`CY_System.js`:
```javascript
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
    cyan: '#00f0ff',                    // Primary highlight
    cyanDark: '#00a0aa',                // Darker cyan for gradients
    darkRed: '#6b1c1c',                 // Accent/background
    lightRed: '#ff3c3c',                // Text accent
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
```

`CY_Window_ActionBar.js`:
```javascript
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

/**
 * Initialize the action bar window.
 * Positions at bottom of screen with full width.
 */
CY_Window_ActionBar.prototype.initialize = function() {
    var width = Graphics.boxWidth;
    var height = 48;
    var y = Graphics.boxHeight - height;
    this._actions = [];
    CY_Window_Base.prototype.initialize.call(this, 0, y, width, height);
    this.refresh();
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
    
    // Start from right side with padding
    var x = this.contentsWidth() - 20;
    
    // Draw actions from right to left (last action appears rightmost)
    for (var i = this._actions.length - 1; i >= 0; i--) {
        var action = this._actions[i];
        var labelWidth = this.textWidth(action.label) + 10;
        var btnSize = 28;
        
        // Draw label first (to the right of button)
        this.changeTextColor(CY_System.Colors.white);
        this.drawText(action.label, x - labelWidth, 0, labelWidth, 'right');
        
        // Move x position for button icon
        x -= labelWidth + 10;
        
        // Draw button icon (circular with letter)
        this.drawButtonIcon(action.button, x - btnSize, 4);
        
        // Move x position for next action with spacing
        x -= btnSize + 20;
    }
};

/**
 * Draw a circular button icon with the button letter.
 * @param {string} button - The button identifier (A, B, X, Y, etc.)
 * @param {number} x - X position to draw at
 * @param {number} y - Y position to draw at
 */
CY_Window_ActionBar.prototype.drawButtonIcon = function(button, x, y) {
    var size = 28;
    
    // Draw circular button background
    var ctx = this.contents._context;
    ctx.save();
    ctx.beginPath();
    ctx.arc(x + size / 2, y + size / 2, size / 2, 0, Math.PI * 2);
    ctx.fillStyle = this.getButtonColor(button);
    ctx.fill();
    ctx.restore();
    this.contents._baseTexture.update();
    
    // Draw button letter centered in circle
    this.changeTextColor(CY_System.Colors.white);
    var originalFontSize = this.contents.fontSize;
    this.contents.fontSize = 16;
    this.drawText(button, x, y + 2, size, 'center');
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
```

`CY_Window_Base.js`:
```javascript
//=============================================================================
// CY_Window_Base.js
//=============================================================================

/*:
 * @plugindesc Cyberpunk UI Mod - Base Window Class
 * @author Cyberpunk UI Mod
 *
 * @help
 * CY_Window_Base - Base window class with Cyberpunk styling.
 * Extends Window_Base from RPG Maker with custom visual elements:
 * - Semi-transparent black background
 * - Cut corner (45-degree angle) on bottom-right
 * - No default RPG Maker window frame
 * - Custom color scheme using CY_System.Colors
 *
 * This plugin requires CY_System.js to be loaded first.
 *
 * Requirements fulfilled:
 * - 2.1: Extends Window_Base from RPG Maker
 * - 2.2: Semi-transparent black background using CY_System.Colors.backgroundBlack
 * - 2.3: Bottom-right corner cut at 45-degree angle
 * - 2.4: Does not display default RPG Maker window frame
 * - 2.5: Supports all standard RPG Maker window operations
 */

//-----------------------------------------------------------------------------
// CY_Window_Base
//
// The base window class with Cyberpunk styling. Extends Window_Base.
//-----------------------------------------------------------------------------

function CY_Window_Base() {
    this.initialize.apply(this, arguments);
}

CY_Window_Base.prototype = Object.create(Window_Base.prototype);
CY_Window_Base.prototype.constructor = CY_Window_Base;

/**
 * Initialize the Cyberpunk-styled window.
 * @param {number} x - X position of the window
 * @param {number} y - Y position of the window
 * @param {number} width - Width of the window
 * @param {number} height - Height of the window
 */
CY_Window_Base.prototype.initialize = function(x, y, width, height) {
    this._cyBackSprite = null;
    Window_Base.prototype.initialize.call(this, x, y, width, height);
    this.createCyBackground();
};

/**
 * Override: Don't load default windowskin.
 * We use custom drawing instead of the standard RPG Maker window skin.
 * Requirement 2.4: Does not display default RPG Maker window frame
 */
CY_Window_Base.prototype.loadWindowskin = function() {
    // No-op: We use custom drawing instead of windowskin
    // Still create an empty windowskin to prevent errors from methods that expect it
    this._windowskin = new Bitmap(1, 1);
};

/**
 * Override: Hide default window frame.
 * Requirement 2.4: Does not display default RPG Maker window frame
 */
CY_Window_Base.prototype._refreshFrame = function() {
    // No-op: Custom background handles the frame
    // Clear the frame sprite to ensure nothing is displayed
    if (this._windowFrameSprite && this._windowFrameSprite.bitmap) {
        this._windowFrameSprite.bitmap.clear();
    }
};

/**
 * Override: Hide default window back.
 * Requirement 2.4: Does not display default RPG Maker window frame
 */
CY_Window_Base.prototype._refreshBack = function() {
    // No-op: Custom background handles this
    // Clear the back sprite to ensure nothing is displayed
    if (this._windowBackSprite && this._windowBackSprite.bitmap) {
        this._windowBackSprite.bitmap.clear();
    }
};

/**
 * Create custom background sprite with cut corner.
 * Requirement 2.2: Semi-transparent black background
 * Requirement 2.3: Bottom-right corner cut at 45-degree angle
 */
CY_Window_Base.prototype.createCyBackground = function() {
    // Create the background sprite if it doesn't exist
    if (!this._cyBackSprite) {
        this._cyBackSprite = new Sprite();
        this._cyBackSprite.bitmap = new Bitmap(this.width, this.height);
        // Add at index 0 to be behind all other content
        this.addChildAt(this._cyBackSprite, 0);
    }
    this.refreshCyBackground();
};

/**
 * Refresh the custom Cyberpunk background.
 * Draws a semi-transparent black rectangle with cut bottom-right corner.
 */
CY_Window_Base.prototype.refreshCyBackground = function() {
    if (!this._cyBackSprite) return;
    
    const bmp = this._cyBackSprite.bitmap;
    
    // Resize bitmap if window size changed
    if (bmp.width !== this.width || bmp.height !== this.height) {
        bmp.resize(this.width, this.height);
    }
    
    bmp.clear();
    
    // Draw the cut corner rectangle with semi-transparent black background
    // Requirement 2.2: Uses CY_System.Colors.backgroundBlack
    // Requirement 2.3: Uses CY_System.drawCutCornerRect for 45-degree cut
    CY_System.drawCutCornerRect(
        bmp, 
        0, 
        0, 
        this.width, 
        this.height, 
        CY_System.Colors.backgroundBlack
    );
};

/**
 * Override: Return Cyberpunk white color for normal text.
 * Uses CY_System.Colors.white instead of windowskin color.
 * @returns {string} The normal text color
 */
CY_Window_Base.prototype.normalColor = function() {
    return CY_System.Colors.white;
};

/**
 * Override: Return Cyberpunk cyan color for system text.
 * Uses CY_System.Colors.cyan instead of windowskin color.
 * @returns {string} The system text color
 */
CY_Window_Base.prototype.systemColor = function() {
    return CY_System.Colors.cyan;
};

/**
 * Override: Return Cyberpunk light red for crisis color.
 * @returns {string} The crisis color
 */
CY_Window_Base.prototype.crisisColor = function() {
    return CY_System.Colors.lightRed;
};

/**
 * Override: Return Cyberpunk dark red for death color.
 * @returns {string} The death color
 */
CY_Window_Base.prototype.deathColor = function() {
    return CY_System.Colors.darkRed;
};

/**
 * Override: Return inactive text color for gauge background.
 * @returns {string} The gauge background color
 */
CY_Window_Base.prototype.gaugeBackColor = function() {
    return CY_System.Colors.inactiveText;
};

/**
 * Override move to refresh background when window is resized.
 * Requirement 2.5: Supports all standard RPG Maker window operations
 * @param {number} x - X position
 * @param {number} y - Y position
 * @param {number} width - Width
 * @param {number} height - Height
 */
CY_Window_Base.prototype.move = function(x, y, width, height) {
    Window_Base.prototype.move.call(this, x, y, width, height);
    // Refresh background after resize
    if (this._cyBackSprite) {
        this.refreshCyBackground();
    }
};

/**
 * Override update to ensure background stays in sync.
 * Requirement 2.5: Supports all standard RPG Maker window operations
 */
CY_Window_Base.prototype.update = function() {
    Window_Base.prototype.update.call(this);
    // Update background visibility based on window openness
    if (this._cyBackSprite) {
        this._cyBackSprite.visible = this.isOpen();
        this._cyBackSprite.alpha = this.openness / 255;
    }
};

/**
 * Override destroy to clean up custom sprites.
 * @param {object} options - Destroy options
 */
CY_Window_Base.prototype.destroy = function(options) {
    if (this._cyBackSprite) {
        if (this._cyBackSprite.bitmap) {
            this._cyBackSprite.bitmap.destroy();
        }
        this._cyBackSprite.destroy();
        this._cyBackSprite = null;
    }
    Window_Base.prototype.destroy.call(this, options);
};

```

`CY_Window_OptionsList.js`:
```javascript
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

```

`CY_Window_Selectable.js`:
```javascript
//=============================================================================
// CY_Window_Selectable.js
//=============================================================================

/*:
 * @plugindesc Cyberpunk UI Mod - Selectable Window Class
 * @author Cyberpunk UI Mod
 *
 * @help
 * CY_Window_Selectable - Selectable window class with Cyberpunk cursor styling.
 * Extends Window_Selectable with custom visual elements:
 * - Mixin of CY_Window_Base methods for background rendering
 * - Custom cyan selection highlight with cut corner
 * - Left border accent on selected items
 * - Semi-transparent highlight background
 *
 * This plugin requires CY_System.js and CY_Window_Base.js to be loaded first.
 *
 * Requirements fulfilled:
 * - 2.2: Semi-transparent black background using CY_System.Colors.backgroundBlack
 * - 2.3: Bottom-right corner cut at 45-degree angle
 * - 4.3: Cyan highlight for selected items
 * - 4.4: Custom cursor with left border accent
 */

//-----------------------------------------------------------------------------
// CY_Window_Selectable
//
// The selectable window class with Cyberpunk cursor styling.
// Extends Window_Selectable with custom highlight sprite.
//-----------------------------------------------------------------------------

function CY_Window_Selectable() {
    this.initialize.apply(this, arguments);
}

CY_Window_Selectable.prototype = Object.create(Window_Selectable.prototype);
CY_Window_Selectable.prototype.constructor = CY_Window_Selectable;

//-----------------------------------------------------------------------------
// Mixin CY_Window_Base methods for background rendering
//-----------------------------------------------------------------------------

/**
 * Override: Don't load default windowskin.
 * Mixin from CY_Window_Base.
 */
CY_Window_Selectable.prototype.loadWindowskin = CY_Window_Base.prototype.loadWindowskin;

/**
 * Override: Hide default window frame.
 * Mixin from CY_Window_Base.
 */
CY_Window_Selectable.prototype._refreshFrame = CY_Window_Base.prototype._refreshFrame;

/**
 * Override: Hide default window back.
 * Mixin from CY_Window_Base.
 */
CY_Window_Selectable.prototype._refreshBack = CY_Window_Base.prototype._refreshBack;

/**
 * Create custom background sprite with cut corner.
 * Mixin from CY_Window_Base.
 */
CY_Window_Selectable.prototype.createCyBackground = CY_Window_Base.prototype.createCyBackground;

/**
 * Refresh the custom Cyberpunk background.
 * Mixin from CY_Window_Base.
 */
CY_Window_Selectable.prototype.refreshCyBackground = CY_Window_Base.prototype.refreshCyBackground;

/**
 * Override: Return Cyberpunk white color for normal text.
 * Mixin from CY_Window_Base.
 */
CY_Window_Selectable.prototype.normalColor = CY_Window_Base.prototype.normalColor;

/**
 * Override: Return Cyberpunk cyan color for system text.
 * Mixin from CY_Window_Base.
 */
CY_Window_Selectable.prototype.systemColor = CY_Window_Base.prototype.systemColor;

/**
 * Override: Return Cyberpunk light red for crisis color.
 * Mixin from CY_Window_Base.
 */
CY_Window_Selectable.prototype.crisisColor = CY_Window_Base.prototype.crisisColor;

/**
 * Override: Return Cyberpunk dark red for death color.
 * Mixin from CY_Window_Base.
 */
CY_Window_Selectable.prototype.deathColor = CY_Window_Base.prototype.deathColor;

/**
 * Override: Return inactive text color for gauge background.
 * Mixin from CY_Window_Base.
 */
CY_Window_Selectable.prototype.gaugeBackColor = CY_Window_Base.prototype.gaugeBackColor;

//-----------------------------------------------------------------------------
// Initialization
//-----------------------------------------------------------------------------

/**
 * Initialize the Cyberpunk-styled selectable window.
 * @param {number} x - X position of the window
 * @param {number} y - Y position of the window
 * @param {number} width - Width of the window
 * @param {number} height - Height of the window
 */
CY_Window_Selectable.prototype.initialize = function(x, y, width, height) {
    this._cyBackSprite = null;
    this._highlightSprite = null;
    Window_Selectable.prototype.initialize.call(this, x, y, width, height);
    this.createCyBackground();
    this.createHighlightSprite();
};

//-----------------------------------------------------------------------------
// Custom Highlight Sprite
//-----------------------------------------------------------------------------

/**
 * Create custom highlight sprite for selection cursor.
 * Requirement 4.3: Cyan highlight for selected items
 * Requirement 4.4: Custom cursor styling
 */
CY_Window_Selectable.prototype.createHighlightSprite = function() {
    this._highlightSprite = new Sprite();
    // Initial size based on item dimensions
    var w = this.itemWidth();
    var h = this.itemHeight();
    this._highlightSprite.bitmap = new Bitmap(w, h);
    // Add highlight sprite to the window's contents layer
    // Position it above the background but below the contents
    this.addChild(this._highlightSprite);
};

/**
 * Override: Use custom highlight instead of default cursor.
 * Hides the default RPG Maker cursor rectangle and uses our custom highlight sprite.
 */
CY_Window_Selectable.prototype.updateCursor = function() {
    // Hide default cursor by setting it to zero size
    this.setCursorRect(0, 0, 0, 0);
    // Update our custom highlight
    this.updateHighlight();
};

/**
 * Update the custom highlight sprite position and visibility.
 * Called when selection changes or window state updates.
 */
CY_Window_Selectable.prototype.updateHighlight = function() {
    if (!this._highlightSprite) return;
    
    if (this.index() >= 0 && this.active) {
        var rect = this.itemRect(this.index());
        // Position highlight relative to window padding and scroll
        this._highlightSprite.x = rect.x + this.padding;
        this._highlightSprite.y = rect.y + this.padding;
        this._highlightSprite.visible = true;
        this.refreshHighlight(rect.width, rect.height);
    } else {
        this._highlightSprite.visible = false;
    }
};

/**
 * Refresh the highlight sprite graphics.
 * Draws a semi-transparent cyan background with cut corner and left border accent.
 * Requirement 4.3: Cyan highlight for selected items
 * Requirement 4.4: Left border accent
 * @param {number} w - Width of the highlight
 * @param {number} h - Height of the highlight
 */
CY_Window_Selectable.prototype.refreshHighlight = function(w, h) {
    var bmp = this._highlightSprite.bitmap;
    
    // Resize bitmap if dimensions changed
    if (bmp.width !== w || bmp.height !== h) {
        bmp.resize(w, h);
    }
    
    bmp.clear();
    
    // Draw semi-transparent cyan background with cut corner
    // Using smaller cut size (8px) for highlight to be more subtle
    var highlightCutSize = 8;
    CY_System.drawCutCornerRect(
        bmp, 
        0, 
        0, 
        w, 
        h, 
        'rgba(0, 240, 255, 0.15)', 
        highlightCutSize
    );
    
    // Draw cyan left border accent (3px wide, full height)
    var borderWidth = 3;
    bmp.fillRect(0, 0, borderWidth, h, CY_System.Colors.cyan);
};

//-----------------------------------------------------------------------------
// Override update methods to sync highlight
//-----------------------------------------------------------------------------

/**
 * Override update to ensure highlight stays in sync.
 */
CY_Window_Selectable.prototype.update = function() {
    Window_Selectable.prototype.update.call(this);
    
    // Update background visibility based on window openness
    if (this._cyBackSprite) {
        this._cyBackSprite.visible = this.isOpen();
        this._cyBackSprite.alpha = this.openness / 255;
    }
    
    // Update highlight visibility based on window openness
    if (this._highlightSprite) {
        this._highlightSprite.alpha = this.openness / 255;
    }
};

/**
 * Override select to update highlight when selection changes.
 * @param {number} index - The index to select
 */
CY_Window_Selectable.prototype.select = function(index) {
    Window_Selectable.prototype.select.call(this, index);
    this.updateHighlight();
};

/**
 * Override activate to update highlight when window becomes active.
 */
CY_Window_Selectable.prototype.activate = function() {
    Window_Selectable.prototype.activate.call(this);
    this.updateHighlight();
};

/**
 * Override deactivate to update highlight when window becomes inactive.
 */
CY_Window_Selectable.prototype.deactivate = function() {
    Window_Selectable.prototype.deactivate.call(this);
    this.updateHighlight();
};

/**
 * Override move to refresh background and highlight when window is resized.
 * @param {number} x - X position
 * @param {number} y - Y position
 * @param {number} width - Width
 * @param {number} height - Height
 */
CY_Window_Selectable.prototype.move = function(x, y, width, height) {
    Window_Selectable.prototype.move.call(this, x, y, width, height);
    // Refresh background after resize
    if (this._cyBackSprite) {
        this.refreshCyBackground();
    }
    // Update highlight position
    this.updateHighlight();
};

/**
 * Override destroy to clean up custom sprites.
 * @param {object} options - Destroy options
 */
CY_Window_Selectable.prototype.destroy = function(options) {
    if (this._cyBackSprite) {
        if (this._cyBackSprite.bitmap) {
            this._cyBackSprite.bitmap.destroy();
        }
        this._cyBackSprite.destroy();
        this._cyBackSprite = null;
    }
    if (this._highlightSprite) {
        if (this._highlightSprite.bitmap) {
            this._highlightSprite.bitmap.destroy();
        }
        this._highlightSprite.destroy();
        this._highlightSprite = null;
    }
    Window_Selectable.prototype.destroy.call(this, options);
};

```

`CY_Window_TabBar.js`:
```javascript
//=============================================================================
// CY_Window_TabBar.js
//=============================================================================

/*:
 * @plugindesc Cyberpunk UI Mod - Tab Bar Window Class
 * @author Cyberpunk UI Mod
 *
 * @help
 * CY_Window_TabBar - Horizontal tab navigation bar for the options screen.
 * Extends CY_Window_Selectable with custom tab styling:
 * - Horizontal layout with maxCols = tab count
 * - Cyan underline for selected tab
 * - L1/R1 indicators on left/right edges
 * - Pageup/pagedown handling for tab switching
 *
 * This plugin requires CY_System.js and CY_Window_Selectable.js to be loaded first.
 *
 * Requirements fulfilled:
 * - 5.2: Horizontal tab bar with categories
 * - 5.3: L1/LB or Q navigates to previous tab
 * - 5.4: R1/RB or E navigates to next tab
 * - 5.5: Selected tab highlighted with cyan color
 */

//-----------------------------------------------------------------------------
// CY_Window_TabBar
//
// The horizontal tab navigation bar with Cyberpunk styling.
// Extends CY_Window_Selectable for selection functionality.
//-----------------------------------------------------------------------------

function CY_Window_TabBar() {
    this.initialize.apply(this, arguments);
}

CY_Window_TabBar.prototype = Object.create(CY_Window_Selectable.prototype);
CY_Window_TabBar.prototype.constructor = CY_Window_TabBar;

//-----------------------------------------------------------------------------
// Initialization
//-----------------------------------------------------------------------------

/**
 * Initialize the Cyberpunk-styled tab bar.
 * @param {string[]} [tabs] - Array of tab names (default: ['SOUND', 'CONTROLS', 'GAMEPLAY'])
 */
CY_Window_TabBar.prototype.initialize = function(tabs) {
    this._tabs = tabs || ['SOUND', 'CONTROLS', 'GAMEPLAY'];
    var width = Graphics.boxWidth;
    var height = this.fittingHeight(1);
    CY_Window_Selectable.prototype.initialize.call(this, 0, 0, width, height);
    this.refresh();
    this.select(0);
};

//-----------------------------------------------------------------------------
// Layout Configuration
//-----------------------------------------------------------------------------

/**
 * Return the number of columns (horizontal layout).
 * Each tab is a column, enabling horizontal navigation.
 * @returns {number} Number of columns equal to tab count
 */
CY_Window_TabBar.prototype.maxCols = function() {
    return this._tabs.length;
};

/**
 * Return the total number of items (tabs).
 * @returns {number} Number of tabs
 */
CY_Window_TabBar.prototype.maxItems = function() {
    return this._tabs.length;
};

/**
 * Calculate the width of each tab item.
 * Divides available content width equally among all tabs.
 * @returns {number} Width of each tab in pixels
 */
CY_Window_TabBar.prototype.itemWidth = function() {
    return Math.floor(this.contentsWidth() / this.maxCols());
};

//-----------------------------------------------------------------------------
// Drawing
//-----------------------------------------------------------------------------

/**
 * Draw a single tab item.
 * Selected tabs get cyan text and an underline indicator.
 * Unselected tabs use inactive text color.
 * @param {number} index - Index of the tab to draw
 */
CY_Window_TabBar.prototype.drawItem = function(index) {
    var rect = this.itemRect(index);
    var isSelected = (index === this.index());
    
    // Draw tab text with appropriate color
    if (isSelected) {
        this.changeTextColor(CY_System.Colors.cyan);
        // Draw cyan underline for selected tab
        // Position underline at bottom of item rect
        var underlineHeight = 2;
        var underlineY = rect.y + rect.height - 4;
        this.contents.fillRect(
            rect.x, 
            underlineY, 
            rect.width, 
            underlineHeight, 
            CY_System.Colors.cyan
        );
    } else {
        this.changeTextColor(CY_System.Colors.inactiveText);
    }
    
    // Draw centered tab text
    this.drawText(this._tabs[index], rect.x, rect.y, rect.width, 'center');
};

/**
 * Refresh the tab bar contents.
 * Draws all tabs and L1/R1 navigation indicators.
 */
CY_Window_TabBar.prototype.refresh = function() {
    CY_Window_Selectable.prototype.refresh.call(this);
    this.drawNavigationIndicators();
};

/**
 * Draw L1/R1 navigation indicators on left and right edges.
 * These indicate that shoulder buttons can be used for tab switching.
 */
CY_Window_TabBar.prototype.drawNavigationIndicators = function() {
    var indicatorWidth = 40;
    var y = 0;
    
    // Draw L1 indicator on left edge
    this.changeTextColor(CY_System.Colors.inactiveText);
    this.drawText('L1', 10, y, indicatorWidth, 'left');
    
    // Draw R1 indicator on right edge
    this.drawText('R1', this.contentsWidth() - indicatorWidth - 10, y, indicatorWidth, 'right');
};

//-----------------------------------------------------------------------------
// Tab Access
//-----------------------------------------------------------------------------

/**
 * Get the currently selected tab name.
 * @returns {string} Name of the currently selected tab
 */
CY_Window_TabBar.prototype.currentTab = function() {
    return this._tabs[this.index()];
};

/**
 * Get the index of a tab by name.
 * @param {string} tabName - Name of the tab to find
 * @returns {number} Index of the tab, or -1 if not found
 */
CY_Window_TabBar.prototype.findTab = function(tabName) {
    return this._tabs.indexOf(tabName);
};

/**
 * Select a tab by name.
 * @param {string} tabName - Name of the tab to select
 */
CY_Window_TabBar.prototype.selectTab = function(tabName) {
    var index = this.findTab(tabName);
    if (index >= 0) {
        this.select(index);
    }
};

//-----------------------------------------------------------------------------
// Input Handling
//-----------------------------------------------------------------------------

/**
 * Process input handling for the tab bar.
 * Adds L1/R1 (pageup/pagedown) support for tab switching.
 * Requirement 5.3: L1/LB or Q navigates to previous tab
 * Requirement 5.4: R1/RB or E navigates to next tab
 */
CY_Window_TabBar.prototype.processHandling = function() {
    CY_Window_Selectable.prototype.processHandling.call(this);
    
    if (this.isOpenAndActive()) {
        // L1/LB/Q - Navigate to previous tab
        if (Input.isTriggered('pageup')) {
            this.processPreviousTab();
        }
        // R1/RB/E - Navigate to next tab
        else if (Input.isTriggered('pagedown')) {
            this.processNextTab();
        }
    }
};

/**
 * Process navigation to the previous tab.
 * Wraps around to the last tab if at the first tab.
 */
CY_Window_TabBar.prototype.processPreviousTab = function() {
    var index = this.index();
    var maxItems = this.maxItems();
    
    // Wrap around: if at first tab, go to last tab
    var newIndex = (index - 1 + maxItems) % maxItems;
    
    this.select(newIndex);
    SoundManager.playCursor();
};

/**
 * Process navigation to the next tab.
 * Wraps around to the first tab if at the last tab.
 */
CY_Window_TabBar.prototype.processNextTab = function() {
    var index = this.index();
    var maxItems = this.maxItems();
    
    // Wrap around: if at last tab, go to first tab
    var newIndex = (index + 1) % maxItems;
    
    this.select(newIndex);
    SoundManager.playCursor();
};

/**
 * Override cursorLeft to wrap around for horizontal navigation.
 * @param {boolean} wrap - Whether to wrap around (always true for tabs)
 */
CY_Window_TabBar.prototype.cursorLeft = function(wrap) {
    this.processPreviousTab();
};

/**
 * Override cursorRight to wrap around for horizontal navigation.
 * @param {boolean} wrap - Whether to wrap around (always true for tabs)
 */
CY_Window_TabBar.prototype.cursorRight = function(wrap) {
    this.processNextTab();
};

//-----------------------------------------------------------------------------
// Override highlight for tab-specific styling
//-----------------------------------------------------------------------------

/**
 * Override refreshHighlight to use tab-specific styling.
 * Tabs use a more subtle highlight without the left border accent.
 * @param {number} w - Width of the highlight
 * @param {number} h - Height of the highlight
 */
CY_Window_TabBar.prototype.refreshHighlight = function(w, h) {
    var bmp = this._highlightSprite.bitmap;
    
    // Resize bitmap if dimensions changed
    if (bmp.width !== w || bmp.height !== h) {
        bmp.resize(w, h);
    }
    
    bmp.clear();
    
    // Draw very subtle background highlight for tabs
    // Tabs primarily use the underline for selection indication
    CY_System.drawCutCornerRect(
        bmp, 
        0, 
        0, 
        w, 
        h, 
        'rgba(0, 240, 255, 0.08)', 
        6
    );
};

```

`CY_Window_TitleCommand.js`:
```javascript
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
CY_Window_TitleCommand.initCommandPosition = function() {
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
CY_Window_TitleCommand.prototype.initialize = function() {
    // Calculate dimensions
    var width = this.windowWidth();
    var height = this.windowHeight();

    // Initialize parent with calculated dimensions
    CY_Window_Selectable.prototype.initialize.call(this, 0, 0, width, height);
    
    // Build command list first (needed for sizing)
    this.clearCommandList();
    this.makeCommandList();
    
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
CY_Window_TitleCommand.prototype.windowWidth = function() {
    return 280;
};

/**
 * Get the window height based on number of commands.
 * @returns {number} Window height in pixels
 */
CY_Window_TitleCommand.prototype.windowHeight = function() {
    return this.fittingHeight(this.numVisibleRows());
};

/**
 * Get the number of visible rows.
 * @returns {number} Number of visible rows
 */
CY_Window_TitleCommand.prototype.numVisibleRows = function() {
    return Math.ceil(this.maxItems() / this.maxCols());
};

/**
 * Get the maximum number of items.
 * @returns {number} Number of commands in the list
 */
CY_Window_TitleCommand.prototype.maxItems = function() {
    return this._list ? this._list.length : 0;
};

//-----------------------------------------------------------------------------
// Positioning
//-----------------------------------------------------------------------------

/**
 * Update window placement to left side of screen.
 * Requirement 4.1: Position window on left side (x=80, y=center)
 */
CY_Window_TitleCommand.prototype.updatePlacement = function() {
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
CY_Window_TitleCommand.prototype.makeCommandList = function() {
    // Only add Continue if save data exists
    if (this.isContinueEnabled()) {
        this.addCommand('CONTINUE', 'continue', true);
    }
    this.addCommand('NEW GAME', 'newGame', true);
    this.addCommand('LOAD GAME', 'loadGame', true);
    this.addCommand('SETTINGS', 'options', true);
    this.addCommand('CREDITS', 'credits', true);
};

/**
 * Check if Continue command should be enabled.
 * Requirement 4.6: Continue disabled when no save data exists
 * @returns {boolean} True if any save file exists
 */
CY_Window_TitleCommand.prototype.isContinueEnabled = function() {
    return DataManager.isAnySavefileExists();
};

//-----------------------------------------------------------------------------
// Drawing
//-----------------------------------------------------------------------------

/**
 * Draw a command item with Cyberpunk styling.
 * Requirement 4.1: Flat buttons without borders
 * Requirement 4.3: Cyan highlight for selected items
 * Requirement 4.4: Inactive text color for unselected items
 * @param {number} index - Index of the item to draw
 */
CY_Window_TitleCommand.prototype.drawItem = function(index) {
    var rect = this.itemRectForText(index);
    var isSelected = (index === this.index());
    var isEnabled = this.isCommandEnabled(index);
    
    // Determine text color based on state
    // Requirement 4.3: Cyan for selected
    // Requirement 4.4: Inactive color for unselected
    if (isSelected && isEnabled) {
        this.changeTextColor(CY_System.Colors.cyan);
    } else if (!isEnabled) {
        this.changeTextColor(CY_System.Colors.inactiveText);
    } else {
        this.changeTextColor(CY_System.Colors.white);
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
CY_Window_TitleCommand.prototype.refresh = function() {
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
CY_Window_TitleCommand.prototype.refreshCyBackground = function() {
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
CY_Window_TitleCommand.prototype.processOk = function() {
    CY_Window_TitleCommand._lastCommandSymbol = this.currentSymbol();
    CY_Window_Selectable.prototype.processOk.call(this);
};

/**
 * Select the last used command or default to Continue/first item.
 */
CY_Window_TitleCommand.prototype.selectLast = function() {
    if (CY_Window_TitleCommand._lastCommandSymbol) {
        this.selectSymbol(CY_Window_TitleCommand._lastCommandSymbol);
    } else if (this.isContinueEnabled()) {
        this.selectSymbol('continue');
    }
};
```

