/*:
 * @plugindesc CY Scene Battle Main Class
 */

function CY_Scene_Battle() {
    this.initialize.apply(this, arguments);
}

CY_Scene_Battle.prototype = Object.create(Scene_Battle.prototype);
CY_Scene_Battle.prototype.constructor = CY_Scene_Battle;

CY_Scene_Battle.prototype.initialize = function () {
    Scene_Battle.prototype.initialize.call(this);
    this.updateUIScale();
};

CY_Scene_Battle.prototype.updateUIScale = function () {
    var w = Graphics.width;
    var h = Graphics.height;
    this._uiScale = 1.0;

    if (w < 1600 || h < 800) {
        // Calculate ratio
        // We want to scale down fairly aggressively if it's small (e.g. 1280x720)
        // 1280 / 1920 = 0.66
        var scaleW = w / 1600;
        var scaleH = h / 800;
        this._uiScale = Math.min(scaleW, scaleH);

        // Ensure it doesn't get too tiny or weird
        this._uiScale = Math.max(0.6, this._uiScale);
    }
};

CY_Scene_Battle.prototype.resize = function () {
    Scene_Battle.prototype.resize.call(this);
    this.updateUIScale();

    // "Nuclear" Resize: Recreate visible layer entirely
    console.log("CY_Scene_Battle: Nuclear Resize Triggered");

    // 1. Capture State
    const state = this.captureBattleState();

    // 2. Destroy Everything
    if (this._spriteset) {
        this.removeChild(this._spriteset);
        this._spriteset = null;
    }
    if (this._windowLayer) {
        this.removeChild(this._windowLayer);
        this._windowLayer = null;
    }

    // Clear Window References
    this._actorCommandWindow = null;
    this._partyCommandWindow = null;
    this._enemyWindow = null;
    this._skillWindow = null;
    this._itemWindow = null;
    this._actorWindow = null;
    this._helpWindow = null;
    this._messageWindow = null;
    this._statusWindow = null;
    this._logWindow = null;
    this._scrollTextWindow = null;
    this._cancelButton = null;
    this._menuButton = null;

    // 3. Rebuild Everything
    // This calls createSpriteset, createWindowLayer, createAllWindows
    this.createDisplayObjects();

    // 4. Restore State
    this.restoreBattleState(state);
};

CY_Scene_Battle.prototype.captureBattleState = function () {
    const state = {
        partyCmd: {
            active: this._partyCommandWindow && this._partyCommandWindow.active,
            visible: this._partyCommandWindow && this._partyCommandWindow.visible,
            index: this._partyCommandWindow ? this._partyCommandWindow.index() : 0
        },
        actorCmd: {
            active: this._actorCommandWindow && this._actorCommandWindow.active,
            visible: this._actorCommandWindow && this._actorCommandWindow.visible,
            index: this._actorCommandWindow ? this._actorCommandWindow.index() : 0,
            actor: BattleManager.actor() // Capture current actor context
        },
        enemyWnd: {
            active: this._enemyWindow && this._enemyWindow.active,
            visible: this._enemyWindow && this._enemyWindow.visible,
            index: this._enemyWindow ? this._enemyWindow.index() : 0
        },
        skillWnd: {
            active: this._skillWindow && this._skillWindow.active,
            visible: this._skillWindow && this._skillWindow.visible,
            index: this._skillWindow ? this._skillWindow.index() : 0
        },
        itemWnd: {
            active: this._itemWindow && this._itemWindow.active,
            visible: this._itemWindow && this._itemWindow.visible,
            index: this._itemWindow ? this._itemWindow.index() : 0
        },
        actorWnd: {
            active: this._actorWindow && this._actorWindow.active,
            visible: this._actorWindow && this._actorWindow.visible,
            index: this._actorWindow ? this._actorWindow.index() : 0
        },
        // Additional Windows requested
        statusWnd: {
            visible: this._statusWindow && this._statusWindow.visible
        },
        logWnd: {
            visible: this._logWindow && this._logWindow.visible
        },
        helpWnd: {
            visible: this._helpWindow && this._helpWindow.visible,
            text: this._helpWindow ? this._helpWindow._text : ""
        }
    };
    return state;
};

CY_Scene_Battle.prototype.restoreBattleState = function (state) {
    // Helper to Restore Selection
    const restore = (w, s) => {
        if (!w || !s) return;
        if (s.visible) w.show(); else w.hide();
        if (s.active) {
            w.activate();
            w.select(s.index);
        } else {
            w.deactivate();
        }
    };

    // 0. Log, Status, Help
    if (this._logWindow) {
        if (state.logWnd.visible) this._logWindow.show(); else this._logWindow.hide();
        // Log window might need specific methods to restore lines but that's complex. 
        // Usually it clears on creation. We might accept it being empty.
    }

    if (this._statusWindow) {
        if (state.statusWnd.visible) this._statusWindow.show(); else this._statusWindow.hide();
        this._statusWindow.refresh();
    }

    if (this._helpWindow) {
        if (state.helpWnd.visible) this._helpWindow.show(); else this._helpWindow.hide();
        if (state.helpWnd.text) this._helpWindow.setText(state.helpWnd.text);
    }

    // 1. Party Command
    // Explicitly setup if it was active? Window_PartyCommand doesn't have setup, just start/open.
    restore(this._partyCommandWindow, state.partyCmd);
    if (state.partyCmd.active) {
        // Just calling activate/select might be enough, but ensure it's open
        this._partyCommandWindow.open();
    }

    // 2. Actor Command
    // If we have an actor, we MUST setup the window so it knows who it's for.
    if (state.actorCmd.actor) {
        this._actorCommandWindow.setup(state.actorCmd.actor);
    }
    restore(this._actorCommandWindow, state.actorCmd);


    // 3. Enemy Window
    restore(this._enemyWindow, state.enemyWnd);

    // 4. Sub-Windows (Skill, Item, Actor)
    // Restore context for Skill Window
    if (state.skillWnd.active || state.skillWnd.visible) {
        if (state.actorCmd.actor) {
            this._skillWindow.setActor(state.actorCmd.actor);
            // We assume stypeId was set. Attempt to retrieve from actor or last command?
            // If actor command window is active/setup, currentExt() might suffice only if we selected 'Skill'.
            // If we are IN skill window, actor command is hidden/inactive but its index might still point to 'Skill'.
            if (this._actorCommandWindow) {
                this._skillWindow.setStypeId(this._actorCommandWindow.currentExt());
            }
            this._skillWindow.refresh();
        }
        restore(this._skillWindow, state.skillWnd);
    }

    if (state.itemWnd.active || state.itemWnd.visible) {
        this._itemWindow.refresh();
        restore(this._itemWindow, state.itemWnd);
    }

    if (state.actorWnd.active || state.actorWnd.visible) {
        this._actorWindow.refresh();
        restore(this._actorWindow, state.actorWnd);
    }
};

CY_Scene_Battle.prototype.create = function () {
    Scene_Battle.prototype.create.call(this);
};

CY_Scene_Battle.prototype.start = function () {
    Scene_Battle.prototype.start.call(this);
};

CY_Scene_Battle.prototype.createSpriteset = function () {
    this._spriteset = new CY_Spriteset_Battle();
    this.addChild(this._spriteset);
};

// Override Window Creation to use customized windows
CY_Scene_Battle.prototype.createAllWindows = function () {
    this.createLogWindow();
    this.createBattleHUD(); // New Static HUD
    this.createStatusWindow();
    this.createPartyCommandWindow();
    this.createActorCommandWindow();
    this.createHelpWindow();
    this.createSkillWindow();
    this.createItemWindow();
    this.createActorWindow();
    this.createEnemyWindow();
    this.createMessageWindow();
    this.createScrollTextWindow();
    this.createButtons(); // From CorruptBattleLine
};

CY_Scene_Battle.prototype.createBattleHUD = function () {
    // HUD takes up bottom 220px (placeholder size)
    const h = 220;
    const w = Graphics.boxWidth;
    const x = 0;
    const y = Graphics.boxHeight - h;

    this._battleHUDWindow = new CY_Window_BattleHUD(x, y, w, h);
    this.addWindow(this._battleHUDWindow);
};



CY_Scene_Battle.prototype.createActorCommandWindow = function () {
    this._actorCommandWindow = new CY_Window_ActorCommand();
    this._actorCommandWindow.setHandler('attack', this.commandAttack.bind(this));
    this._actorCommandWindow.setHandler('skill', this.commandSkill.bind(this));
    this._actorCommandWindow.setHandler('guard', this.commandGuard.bind(this));
    this._actorCommandWindow.setHandler('item', this.commandItem.bind(this));
    this._actorCommandWindow.setHandler('cancel', this.selectPreviousCommand.bind(this));
    this.addWindow(this._actorCommandWindow);
};

// Specific Layout overrides
CY_Scene_Battle.prototype.enemyWindowRect = function () {
    const ww = Graphics.boxWidth * 0.65;
    const wx = Graphics.boxWidth - ww - 96;
    const wh = this.windowAreaHeight();
    const wy = 0;
    return new Rectangle(wx, wy, ww, wh);
};

CY_Scene_Battle.prototype.actorCommandWindowRect = function () {
    // Relying on CY_Window_ActorCommand sizing
    const rows = 1;
    const ww = 96 * 5 + 32; // Approx
    const wh = 96 * rows + 32;
    const wx = 0;
    const wy = Graphics.boxHeight - wh;
    return new Rectangle(wx, wy, ww, wh);
};

CY_Scene_Battle.prototype.buttonY = function () {
    const offsetY = Math.floor((this.buttonAreaHeight() - 48) / 2);
    return offsetY;
};

CY_Scene_Battle.prototype.createButtons = function () {
    if (ConfigManager.touchUI) {
        this.createCancelButton();
        this.createPauseButton();
    }
};

CY_Scene_Battle.prototype.createCancelButton = function () {
    this._cancelButton = new Sprite_Button("cancel");
    this._cancelButton.x = Graphics.boxWidth - this._cancelButton.width - 4;
    this._cancelButton.y = this.buttonY();
    this.addWindow(this._cancelButton);
};

CY_Scene_Battle.prototype.createPauseButton = function () {
    this._menuButton = new Sprite_Button("menu");
    this._menuButton.x = this._cancelButton.x - this._cancelButton.width - this._menuButton.width - 8;
    this._menuButton.y = this.buttonY();
    this._menuButton.visible = true;
    this.addWindow(this._menuButton);
};

// Make default status window invisible as per CorruptBattleLine
// We need to patch Window_BattleStatus or just change it here?
// Reference line 323 in CorruptBattleLine: Window_BattleStatus.prototype.initialize overridden.
// Since this is a core class, and we are in a scene, we could subclass Window_BattleStatus as CY_Window_BattleStatus?
// But Scene_Battle.createStatusWindow uses Window_BattleStatus.
// I'll subclass it here locally or in separate file.
// Creating CY_Window_BattleStatus to keep it clean.

CY_Scene_Battle.prototype.createStatusWindow = function () {
    this._statusWindow = new CY_Window_BattleStatus();
    this.addWindow(this._statusWindow);
};

// -----------------------------------------------------------------------------
// CY_Window_BattleStatus
// -----------------------------------------------------------------------------
function CY_Window_BattleStatus() {
    this.initialize.apply(this, arguments);
}
CY_Window_BattleStatus.prototype = Object.create(Window_BattleStatus.prototype);
CY_Window_BattleStatus.prototype.constructor = CY_Window_BattleStatus;

CY_Window_BattleStatus.prototype.initialize = function () {
    Window_BattleStatus.prototype.initialize.call(this);
    this.hide();
    this.backOpacity = 0;
};
// Disable drawing
CY_Window_BattleStatus.prototype.drawRect = function () { };
CY_Window_BattleStatus.prototype.drawShape = function () { };
CY_Window_BattleStatus.prototype.drawItemBackground = function () { };
CY_Window_BattleStatus.prototype.drawBackgroundRect = function () { };
CY_Window_BattleStatus.prototype.drawItem = function () { };

CY_Scene_Battle.prototype.createEnemyWindow = function () {
    this._enemyWindow = new CY_Window_BattleEnemy(0, 0); // Position at Top (y=0)
    // Center it or Full Width? 
    // Default Window_BattleEnemy uses Graphics.boxWidth - 192.
    // Let's center it at the top.
    this._enemyWindow.x = (Graphics.boxWidth - this._enemyWindow.width) / 2;

    this._enemyWindow.setHandler('ok', this.onEnemyOk.bind(this));
    this._enemyWindow.setHandler('cancel', this.onEnemyCancel.bind(this));
    this.addWindow(this._enemyWindow);
};

// -----------------------------------------------------------------------------
// CY_Window_BattleEnemy
// -----------------------------------------------------------------------------
function CY_Window_BattleEnemy() {
    this.initialize.apply(this, arguments);
}
CY_Window_BattleEnemy.prototype = Object.create(Window_BattleEnemy.prototype);
CY_Window_BattleEnemy.prototype.constructor = CY_Window_BattleEnemy;

CY_Window_BattleEnemy.prototype.initialize = function (x, y) {
    Window_BattleEnemy.prototype.initialize.call(this, x, y);
    // Explicitly set frame/refresh if needed, but standard init handles it.
};

CY_Window_BattleEnemy.prototype.windowWidth = function () {
    // Make it wider if it's at the top?
    return Graphics.boxWidth;
};

CY_Window_BattleEnemy.prototype.maxCols = function () {
    return 3; // Keep 3 columns
};

CY_Window_BattleEnemy.prototype.numVisibleRows = function () {
    return 1; // Reduce height to 1 row
};

CY_Window_BattleEnemy.prototype.drawBackgroundRect = function (rect) {
    // Keep transparent or default?
    // User requested "size too large", maybe wants minimal look.
    // We previously had empty drawBackgroundRect, let's keep it empty for transparency
    // or call super if they want a window.
    // If "too large height", maybe simply reducing rows is enough.
    // Leaving it empty (transparent) as per previous snippet.
};
CY_Window_BattleEnemy.prototype._refreshBack = function () { };
CY_Window_BattleEnemy.prototype._refreshFrame = function () { };
CY_Window_BattleEnemy.prototype.createCancelButton = function () { };
