//=============================================================================
// CY_Scene_File.js
//=============================================================================

/*:
 * @plugindesc Cyberpunk UI Mod - Save/Load Scene
 * @author Cyberpunk UI Mod
 *
 * @help
 * CY_Scene_File - Cyberpunk-styled save/load scene.
 * Extends CY_Scene_MenuBase with:
 * - Title bar with "Load Game" or "Save Game" text
 * - Save slot list with cut corner styling
 * - Action bar with Select, Delete, Close
 *
 * This plugin requires:
 * - CY_System.js
 * - CY_Scene_MenuBase.js
 * - CY_Window_ActionBar.js
 */

//-----------------------------------------------------------------------------
// CY_Scene_File
//
// Base scene for save/load functionality.
//-----------------------------------------------------------------------------

function CY_Scene_File() {
    this.initialize.apply(this, arguments);
}

CY_Scene_File.prototype = Object.create(CY_Scene_MenuBase.prototype);
CY_Scene_File.prototype.constructor = CY_Scene_File;

//-----------------------------------------------------------------------------
// Constants
//-----------------------------------------------------------------------------

CY_Scene_File.SAVE_SLOT_HEIGHT = 80;
CY_Scene_File.MAX_SAVE_FILES = 20;

//-----------------------------------------------------------------------------
// Initialization
//-----------------------------------------------------------------------------

CY_Scene_File.prototype.initialize = function() {
    CY_Scene_MenuBase.prototype.initialize.call(this);
};

//-----------------------------------------------------------------------------
// Scene Lifecycle
//-----------------------------------------------------------------------------

CY_Scene_File.prototype.create = function() {
    CY_Scene_MenuBase.prototype.create.call(this);
    this.createTitleBar();
    this.createSaveListWindow();
    this.createActionBar();
};

CY_Scene_File.prototype.start = function() {
    CY_Scene_MenuBase.prototype.start.call(this);
    this._saveListWindow.activate();
    this._saveListWindow.select(0);
};

//-----------------------------------------------------------------------------
// Mode (Override in subclasses)
//-----------------------------------------------------------------------------

CY_Scene_File.prototype.mode = function() {
    return 'load'; // Override: 'save' or 'load'
};

CY_Scene_File.prototype.titleText = function() {
    return this.mode() === 'save' ? 'Save Game' : 'Load Game';
};

//-----------------------------------------------------------------------------
// Title Bar
//-----------------------------------------------------------------------------

CY_Scene_File.prototype.createTitleBar = function() {
    var lensPadding = this.getLensPadding();
    
    // Title bar sprite - positioned at screen coordinates (no offset needed for sprites)
    this._titleBarSprite = new Sprite();
    this._titleBarSprite.bitmap = new Bitmap(Graphics.width, CY_Scene_MenuBase.TOP_BAR_HEIGHT);
    this._titleBarSprite.x = 0;
    this._titleBarSprite.y = lensPadding;
    
    this.drawTitleBar();
    this.addChild(this._titleBarSprite);
};

CY_Scene_File.prototype.drawTitleBar = function() {
    var bmp = this._titleBarSprite.bitmap;
    var w = bmp.width;
    var h = bmp.height;
    
    bmp.clear();
    
    // Draw title text centered
    bmp.fontFace = 'GameFont';
    bmp.fontSize = 24;
    bmp.textColor = CY_System.Colors.white;
    bmp.drawText(this.titleText(), 0, 8, w, h - 10, 'center');
    
    // Draw bottom border (2px, red #CC413C)
    bmp.fillRect(0, h - 2, w, 2, '#CC413C');
};

//-----------------------------------------------------------------------------
// Save List Window
//-----------------------------------------------------------------------------

CY_Scene_File.prototype.createSaveListWindow = function() {
    var offsets = this.getScreenOffsets();
    var lensPadding = this.getLensPadding();
    
    var width = 600;
    var x = Math.floor((Graphics.boxWidth - width) / 2);
    // Position below title bar with lens padding (only once)
    var y = offsets.y + lensPadding + CY_Scene_MenuBase.TOP_BAR_HEIGHT + 10;
    // Height: full height minus top bar, action bar, and lens padding (top only, bottom handled by action bar position)
    var height = offsets.fullHeight - CY_Scene_MenuBase.TOP_BAR_HEIGHT - CY_Scene_MenuBase.ACTION_BAR_HEIGHT - lensPadding - 30;
    
    this._saveListWindow = new CY_Window_SaveList(x, y, width, height);
    this._saveListWindow.setHandler('ok', this.onSaveSlotOk.bind(this));
    this._saveListWindow.setHandler('cancel', this.popScene.bind(this));
    this.makeWindowTransparent(this._saveListWindow);
    this.addWindow(this._saveListWindow);
};

//-----------------------------------------------------------------------------
// Action Bar
//-----------------------------------------------------------------------------

CY_Scene_File.prototype.createActionBar = function() {
    var offsets = this.getScreenOffsets();
    var lensPadding = this.getLensPadding();
    var width = offsets.fullWidth;
    var height = CY_Scene_MenuBase.ACTION_BAR_HEIGHT;
    // Position from bottom with lens padding (offsets.y already accounts for box offset)
    var y = Graphics.boxHeight - height - lensPadding + offsets.y;
    
    this._actionBar = new CY_Window_ActionBar();
    this._actionBar.move(offsets.x, y, width, height);
    this.makeWindowTransparent(this._actionBar);
    this.updateActionBar();
    this.addWindow(this._actionBar);
};

CY_Scene_File.prototype.updateActionBar = function() {
    if (!this._actionBar) return;
    
    var actions = [
        { button: 'B', label: 'Close' },
        { button: 'X', label: 'Delete' },
        { button: 'A', label: 'Select' }
    ];
    
    this._actionBar.setActions(actions);
};

//-----------------------------------------------------------------------------
// Handlers
//-----------------------------------------------------------------------------

CY_Scene_File.prototype.onSaveSlotOk = function() {
    // Override in subclasses
    var saveId = this._saveListWindow.index() + 1;
    console.log('Selected save slot:', saveId);
    this._saveListWindow.activate();
};

CY_Scene_File.prototype.update = function() {
    CY_Scene_MenuBase.prototype.update.call(this);
    
    // Handle delete key
    if (Input.isTriggered('menu') && this._saveListWindow.active) {
        this.onDeleteSave();
    }
};

CY_Scene_File.prototype.onDeleteSave = function() {
    var saveId = this._saveListWindow.index() + 1;
    if (DataManager.isThisGameFile(saveId)) {
        SoundManager.playOk();
        DataManager.deleteGame(saveId);
        this._saveListWindow.refresh();
    } else {
        SoundManager.playBuzzer();
    }
};


//=============================================================================
// CY_Scene_Save
//=============================================================================

function CY_Scene_Save() {
    this.initialize.apply(this, arguments);
}

CY_Scene_Save.prototype = Object.create(CY_Scene_File.prototype);
CY_Scene_Save.prototype.constructor = CY_Scene_Save;

CY_Scene_Save.prototype.mode = function() {
    return 'save';
};

CY_Scene_Save.prototype.onSaveSlotOk = function() {
    var saveId = this._saveListWindow.index() + 1;
    $gameSystem.onBeforeSave();
    if (DataManager.saveGame(saveId)) {
        SoundManager.playSave();
        this.popScene();
    } else {
        SoundManager.playBuzzer();
    }
    this._saveListWindow.activate();
};


//=============================================================================
// CY_Scene_Load
//=============================================================================

function CY_Scene_Load() {
    this.initialize.apply(this, arguments);
}

CY_Scene_Load.prototype = Object.create(CY_Scene_File.prototype);
CY_Scene_Load.prototype.constructor = CY_Scene_Load;

CY_Scene_Load.prototype.mode = function() {
    return 'load';
};

CY_Scene_Load.prototype.onSaveSlotOk = function() {
    var saveId = this._saveListWindow.index() + 1;
    if (DataManager.isThisGameFile(saveId)) {
        if (DataManager.loadGame(saveId)) {
            SoundManager.playLoad();
            this.fadeOutAll();
            if ($gameSystem.versionId() !== $dataSystem.versionId) {
                $gamePlayer.reserveTransfer($gameMap.mapId(), $gamePlayer.x, $gamePlayer.y);
                $gamePlayer.requestMapReload();
            }
            SceneManager.goto(Scene_Map);
        } else {
            SoundManager.playBuzzer();
        }
    } else {
        SoundManager.playBuzzer();
    }
    this._saveListWindow.activate();
};
