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

    // Recreate Spriteset content (Full recreate as requested)
    if (this._spriteset) {
        this._spriteset.recreateForResize(this._uiScale);
        this._spriteset.width = Graphics.width;
        this._spriteset.height = Graphics.height;
    }

    // Recreate all windows to handle resizing properly ("keeping the data states")
    this.recreateAllWindows();
};

CY_Scene_Battle.prototype.recreateAllWindows = function () {
    // 1. Capture State
    const state = {
        actorCmd: {
            active: this._actorCommandWindow && this._actorCommandWindow.active,
            index: this._actorCommandWindow ? this._actorCommandWindow.index() : -1,
            visible: this._actorCommandWindow && this._actorCommandWindow.visible
        },
        enemyWnd: {
            active: this._enemyWindow && this._enemyWindow.active,
            index: this._enemyWindow ? this._enemyWindow.index() : -1,
            visible: this._enemyWindow && this._enemyWindow.visible
        },
        partyCmd: {
            active: this._partyCommandWindow && this._partyCommandWindow.active,
            visible: this._partyCommandWindow && this._partyCommandWindow.visible
        },
        // We can capture more if needed (skill window, item window, etc)
        // For battle test basic flow, these are most critical.
    };

    // 2. Destroy Old Windows
    if (this._windowLayer) {
        this._windowLayer.removeChildren();
    }
    // Also buttons are usually added to scene or window layer? 
    // In createButtons -> addWindow -> adds to _windowLayer.
    // So removing children of _windowLayer should clear them.
    // Re-null references to be safe
    this._actorCommandWindow = null;
    this._enemyWindow = null;
    this._statusWindow = null;
    this._partyCommandWindow = null;
    this._skillWindow = null;
    this._itemWindow = null;
    this._actorWindow = null;
    this._helpWindow = null;
    this._messageWindow = null;
    this._scrollTextWindow = null;
    this._cancelButton = null;
    this._menuButton = null;

    // 3. Create All Windows Again
    this.createAllWindows();

    // 4. Restore State & Relink
    if (state.actorCmd.active) {
        this._actorCommandWindow.activate();
        this._actorCommandWindow.select(state.actorCmd.index);
    } else {
        this._actorCommandWindow.deactivate();
    }
    this._actorCommandWindow.visible = state.actorCmd.visible;

    if (state.enemyWnd.active) {
        this._enemyWindow.activate();
        this._enemyWindow.select(state.enemyWnd.index);
    } else {
        this._enemyWindow.deactivate();
    }
    this._enemyWindow.visible = state.enemyWnd.visible;

    if (state.partyCmd.active) {
        this._partyCommandWindow.activate();
    } else {
        this._partyCommandWindow.deactivate();
    }
    this._partyCommandWindow.visible = state.partyCmd.visible;

    // Refresh status
    if (this._statusWindow) this._statusWindow.refresh();
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
    this._enemyWindow = new CY_Window_BattleEnemy(0, this._statusWindow.y);
    this._enemyWindow.x = Graphics.boxWidth - this._enemyWindow.width;
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
};

CY_Window_BattleEnemy.prototype.maxCols = function () {
    return 3;
};

CY_Window_BattleEnemy.prototype.drawBackgroundRect = function (rect) { };
CY_Window_BattleEnemy.prototype._refreshBack = function () { };
CY_Window_BattleEnemy.prototype._refreshFrame = function () { };
CY_Window_BattleEnemy.prototype.createCancelButton = function () { };
