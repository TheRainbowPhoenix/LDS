//=============================================================================
// Scene_Action - Main Action Scene
//=============================================================================

/**
 * The main action platformer scene.
 * Extends Scene_Base to integrate with RPG Maker's scene system.
 * Preserves window system and game data for seamless mode switching.
 * 
 * @class Scene_Action
 * @extends Scene_Base
 */
function Scene_Action() {
    this.initialize.apply(this, arguments);
}

Scene_Action.prototype = Object.create(Scene_Base.prototype);
Scene_Action.prototype.constructor = Scene_Action;

Scene_Action.prototype.initialize = function() {
    Scene_Base.prototype.initialize.call(this);
    
    /**
     * Game world
     * @type {ACT_World}
     */
    this._world = null;
    
    /**
     * Spriteset
     * @type {Spriteset_Action}
     */
    this._spriteset = null;
    
    /**
     * Is scene paused?
     */
    this._paused = false;
    
    /**
     * Pause menu window
     */
    this._pauseWindow = null;
    
    /**
     * Message window (for RPG Maker integration)
     */
    this._messageWindow = null;
    
    /**
     * Last delta time
     */
    this._lastDelta = 16.67;
};

/**
 * Create scene components
 */
Scene_Action.prototype.create = function() {
    Scene_Base.prototype.create.call(this);
    
    this.createWorld();
    this.createSpriteset();
    this.createWindowLayer();
    this.createWindows();
};

/**
 * Create game world
 */
Scene_Action.prototype.createWorld = function() {
    this._world = new ACT_World();
    
    // Load from current RPG Maker map
    if ($gameMap && $dataMap) {
        this._world.loadFromRPGMap($gameMap.mapId());
    }
};

/**
 * Create spriteset
 */
Scene_Action.prototype.createSpriteset = function() {
    this._spriteset = new Spriteset_Action();
    this._spriteset.setWorld(this._world);
    this.addChild(this._spriteset);
};

/**
 * Create windows
 */
Scene_Action.prototype.createWindows = function() {
    // Pause menu
    this.createPauseWindow();
    
    // Message window for events/dialogue
    this.createMessageWindow();
};

/**
 * Create pause menu window
 */
Scene_Action.prototype.createPauseWindow = function() {
    var rect = this.pauseWindowRect();
    this._pauseWindow = new Window_ActionPause(rect);
    this._pauseWindow.setHandler('resume', this.onPauseResume.bind(this));
    this._pauseWindow.setHandler('items', this.onPauseItems.bind(this));
    this._pauseWindow.setHandler('status', this.onPauseStatus.bind(this));
    this._pauseWindow.setHandler('options', this.onPauseOptions.bind(this));
    this._pauseWindow.setHandler('quit', this.onPauseQuit.bind(this));
    this._pauseWindow.setHandler('cancel', this.onPauseResume.bind(this));
    this._pauseWindow.hide();
    this._pauseWindow.deactivate();
    this.addWindow(this._pauseWindow);
};

Scene_Action.prototype.pauseWindowRect = function() {
    var width = 240;
    var height = this.calcWindowHeight(5, true);
    var x = (Graphics.boxWidth - width) / 2;
    var y = (Graphics.boxHeight - height) / 2;
    return new Rectangle(x, y, width, height);
};

/**
 * Create message window
 */
Scene_Action.prototype.createMessageWindow = function() {
    var rect = this.messageWindowRect();
    this._messageWindow = new Window_Message(rect);
    this.addWindow(this._messageWindow);
    
    // Also create sub-windows
    this._messageWindow.setGoldWindow(this.createGoldWindow());
    this._messageWindow.setNameBoxWindow(this.createNameBoxWindow());
    this._messageWindow.setChoiceListWindow(this.createChoiceListWindow());
    this._messageWindow.setNumberInputWindow(this.createNumberInputWindow());
    this._messageWindow.setEventItemWindow(this.createEventItemWindow());
};

Scene_Action.prototype.messageWindowRect = function() {
    var ww = Graphics.boxWidth;
    var wh = this.calcWindowHeight(4, false) + 8;
    var wx = (Graphics.boxWidth - ww) / 2;
    var wy = 0;
    return new Rectangle(wx, wy, ww, wh);
};

Scene_Action.prototype.createGoldWindow = function() {
    var rect = this.goldWindowRect();
    var window = new Window_Gold(rect);
    window.openness = 0;
    this.addWindow(window);
    return window;
};

Scene_Action.prototype.goldWindowRect = function() {
    var ww = this.mainCommandWidth();
    var wh = this.calcWindowHeight(1, true);
    var wx = Graphics.boxWidth - ww;
    var wy = 0;
    return new Rectangle(wx, wy, ww, wh);
};

Scene_Action.prototype.createNameBoxWindow = function() {
    var window = new Window_NameBox();
    this.addWindow(window);
    return window;
};

Scene_Action.prototype.createChoiceListWindow = function() {
    var window = new Window_ChoiceList();
    this.addWindow(window);
    return window;
};

Scene_Action.prototype.createNumberInputWindow = function() {
    var window = new Window_NumberInput();
    this.addWindow(window);
    return window;
};

Scene_Action.prototype.createEventItemWindow = function() {
    var rect = this.eventItemWindowRect();
    var window = new Window_EventItem(rect);
    this.addWindow(window);
    return window;
};

Scene_Action.prototype.eventItemWindowRect = function() {
    var wx = 0;
    var wy = 0;
    var ww = Graphics.boxWidth;
    var wh = this.calcWindowHeight(4, true);
    return new Rectangle(wx, wy, ww, wh);
};

/**
 * Start scene
 */
Scene_Action.prototype.start = function() {
    Scene_Base.prototype.start.call(this);
    
    // Play map BGM
    if ($gameMap) {
        $gameMap.autoplay();
    }
    
    this.startFadeIn(this.fadeSpeed(), false);
};

/**
 * Update scene
 */
Scene_Action.prototype.update = function() {
    Scene_Base.prototype.update.call(this);
    
    // Calculate delta time
    var delta = SceneManager._deltaTime * 1000.0; // Graphics.app ? Graphics.app.ticker.deltaMS : 16.67;
    this._lastDelta = delta;
    
    // Handle pause input
    if (this.isMenuCalled()) {
        this.togglePause();
    }
    
    // Update game world if not paused
    if (!this._paused && !$gameMessage.isBusy()) {
        this._world.update(delta);
    }
    
    // Update spriteset
    if (this._spriteset) {
        this._spriteset.update();
    }
    
    // Check for scene transitions
    this.updateSceneTransitions();
};

/**
 * Check if menu button pressed
 */
Scene_Action.prototype.isMenuCalled = function() {
    return Input.isTriggered('menu') || Input.isTriggered('escape');
};

/**
 * Toggle pause state
 */
Scene_Action.prototype.togglePause = function() {
    if (this._paused) {
        this.resumeGame();
    } else {
        this.pauseGame();
    }
};

/**
 * Pause the game
 */
Scene_Action.prototype.pauseGame = function() {
    this._paused = true;
    this._world.setPaused(true);
    this._pauseWindow.show();
    this._pauseWindow.activate();
    this._pauseWindow.select(0);
    
    // Play pause sound
    SoundManager.playOk();
};

/**
 * Resume the game
 */
Scene_Action.prototype.resumeGame = function() {
    this._paused = false;
    this._world.setPaused(false);
    this._pauseWindow.hide();
    this._pauseWindow.deactivate();
    
    // Play resume sound
    SoundManager.playCancel();
};

// Pause menu handlers
Scene_Action.prototype.onPauseResume = function() {
    this.resumeGame();
};

Scene_Action.prototype.onPauseItems = function() {
    SceneManager.push(Scene_Item);
};

Scene_Action.prototype.onPauseStatus = function() {
    SceneManager.push(Scene_Status);
};

Scene_Action.prototype.onPauseOptions = function() {
    SceneManager.push(Scene_Options);
};

Scene_Action.prototype.onPauseQuit = function() {
    // Return to map scene
    this.switchToMapScene();
};

/**
 * Update scene transitions
 */
Scene_Action.prototype.updateSceneTransitions = function() {
    // Check for player death
    if (this._world.player && !this._world.player.active) {
        this.onPlayerDeath();
    }
    
    // Check for level exit (could be triggered by events)
    if ($gameTemp.isCommonEventReserved()) {
        // Handle common events
    }
};

/**
 * Handle player death
 */
Scene_Action.prototype.onPlayerDeath = function() {
    // Could show game over or respawn
    if ($gameParty.isAllDead()) {
        SceneManager.goto(Scene_Gameover);
    } else {
        // Respawn player
        this.respawnPlayer();
    }
};

/**
 * Respawn player
 */
Scene_Action.prototype.respawnPlayer = function() {
    if (this._world.levelData && this._world.levelData.playerStart) {
        var start = this._world.levelData.playerStart;
        this._world.player.setPosition(start.x, start.y);
        this._world.player.hp = this._world.player.maxHp;
        this._world.player.active = true;
    }
};

/**
 * Switch to RPG Maker map scene
 */
Scene_Action.prototype.switchToMapScene = function() {
    // Sync player position back to $gamePlayer
    if (this._world.player) {
        var tileX = Math.floor(this._world.player.x / ACT.Config.TILE_WIDTH);
        var tileY = Math.floor(this._world.player.y / ACT.Config.TILE_HEIGHT);
        $gamePlayer.locate(tileX, tileY);
    }
    
    this.fadeOutAll();
    SceneManager.goto(Scene_Map);
};

/**
 * Terminate scene
 */
Scene_Action.prototype.terminate = function() {
    Scene_Base.prototype.terminate.call(this);
    
    // Cleanup
    if (this._world) {
        this._world.clear();
    }
};

/**
 * Check if scene is busy
 */
Scene_Action.prototype.isBusy = function() {
    return this._messageWindow.isOpening() ||
           this._messageWindow.isClosing() ||
           Scene_Base.prototype.isBusy.call(this);
};

//=============================================================================
// Window_ActionPause - Pause Menu Window
//=============================================================================

/**
 * Pause menu window for action scene.
 * 
 * @class Window_ActionPause
 * @extends Window_Command
 */
function Window_ActionPause() {
    this.initialize.apply(this, arguments);
}

Window_ActionPause.prototype = Object.create(Window_Command.prototype);
Window_ActionPause.prototype.constructor = Window_ActionPause;

Window_ActionPause.prototype.initialize = function(rect) {
    Window_Command.prototype.initialize.call(this, rect);
    this.openness = 255;
};

Window_ActionPause.prototype.makeCommandList = function() {
    this.addCommand('Resume', 'resume');
    this.addCommand('Items', 'items');
    this.addCommand('Status', 'status');
    this.addCommand('Options', 'options');
    this.addCommand('Quit to Map', 'quit');
};

//=============================================================================
// Scene Manager Integration
//=============================================================================

/**
 * Switch from Map to Action scene
 */
Scene_Map.prototype.switchToActionScene = function() {
    this.fadeOutAll();
    SceneManager.goto(Scene_Action);
};

/**
 * Plugin command to switch scenes
 */
if (typeof PluginManager !== 'undefined' && PluginManager.registerCommand) {
    PluginManager.registerCommand('ActionPlatformer', 'SwitchToAction', function() {
        if (SceneManager._scene instanceof Scene_Map) {
            SceneManager._scene.switchToActionScene();
        }
    });
    
    PluginManager.registerCommand('ActionPlatformer', 'SwitchToMap', function() {
        if (SceneManager._scene instanceof Scene_Action) {
            SceneManager._scene.switchToMapScene();
        }
    });
}

// Script call helpers
ACT.switchToAction = function() {
    if (SceneManager._scene instanceof Scene_Map) {
        SceneManager._scene.switchToActionScene();
    }
};

ACT.switchToMap = function() {
    if (SceneManager._scene instanceof Scene_Action) {
        SceneManager._scene.switchToMapScene();
    }
};
