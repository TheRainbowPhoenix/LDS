/*:
 * @plugindesc Custom Dialog Scene for CY_UI
 * @author Antigravity
 */

(function () {
    //-----------------------------------------------------------------------------
    // CY_Scene_Dialog
    //-----------------------------------------------------------------------------

    function CY_Scene_Dialog() {
        this.initialize.apply(this, arguments);
    }

    CY_Scene_Dialog.prototype = Object.create(Scene_Map.prototype);
    CY_Scene_Dialog.prototype.constructor = CY_Scene_Dialog;

    // Attach to window so it's accessible
    window.CY_Scene_Dialog = CY_Scene_Dialog;

    CY_Scene_Dialog.prototype.initialize = function () {
        Scene_Map.prototype.initialize.call(this);
        this._dialogStarted = false;
        this._sceneEnded = false;
        this._waitTimer = 0;
    };

    CY_Scene_Dialog.prototype.create = function () {
        // Force Load Map 003 (Dialog Map)
        $gamePlayer.reserveTransfer(3, 8, 6, 2, 0);
        this._transfer = true;

        Scene_Map.prototype.create.call(this);
    };

    CY_Scene_Dialog.prototype.createMessageWindow = function () {
        this._messageWindow = new CY_Window_DialogMessage();
        this.addWindow(this._messageWindow);
        this._messageWindow.subWindows().forEach(function (window) {
            this.addWindow(window);
        }, this);
    };

    CY_Scene_Dialog.prototype.update = function () {
        Scene_Map.prototype.update.call(this);

        // Transition Logic
        if (this.isActive() && this._mapLoaded && !$gamePlayer.isTransferring()) {

            // Wait a bit before checking events to allow autorun to start
            if (this._waitTimer < 60) {
                this._waitTimer++;
                return;
            }

            if ($gameMap.isEventRunning()) {
                this._dialogStarted = true;
            } else {
                // If we started dialogs and now they are finished
                if (this._dialogStarted && !this._sceneEnded) {
                    this._sceneEnded = true;
                    // Provide a small delay before transition
                    this.startFadeOut(this.fadeSpeed(), false);
                    setTimeout(() => {
                        SceneManager.goto(CY_Scene_Lobby);
                    }, 500);
                }
                // Fallback: If no event started after considerable time (e.g. 2 sec), maybe map is empty?
                else if (!this._dialogStarted && this._waitTimer > 120) {
                    // Just go to lobby? Or wait indefinitely?
                    // I'll assume map 3 has autorun.
                }
            }
        }
    };

    //-----------------------------------------------------------------------------
    // CY_Window_DialogMessage
    //-----------------------------------------------------------------------------

    function CY_Window_DialogMessage() {
        this.initialize.apply(this, arguments);
    }

    window.CY_Window_DialogMessage = CY_Window_DialogMessage;

    CY_Window_DialogMessage.prototype = Object.create(Window_Message.prototype);
    CY_Window_DialogMessage.prototype.constructor = CY_Window_DialogMessage;

    CY_Window_DialogMessage.prototype.initialize = function () {
        Window_Message.prototype.initialize.call(this);
        this.opacity = 0; // Hide default window frame/bg
        this._isCustomBack = true; // Flag for debugging
        this.createCustomUI();
    };

    CY_Window_DialogMessage.prototype.windowWidth = function () {
        return Graphics.boxWidth;
    };

    CY_Window_DialogMessage.prototype.windowHeight = function () {
        return 220; // Taller for cinematic feel
    };

    CY_Window_DialogMessage.prototype.updatePlacement = function () {
        this.x = 0;
        this.y = Graphics.boxHeight - this.windowHeight();
        if (this._goldWindow) {
            this._goldWindow.y = this.y > 0 ? 0 : Graphics.boxHeight - this._goldWindow.height;
        }
    };

    CY_Window_DialogMessage.prototype.createCustomUI = function () {
        this._uiContainer = new PIXI.Container();
        // Insert behind text content (which is in this.contents/this._windowContentsSprite usually)
        // Window_Base adds children: _windowBackSprite, _windowFrameSprite, _windowContentsSprite...
        // We want this UI to be the background.
        this.addChildAt(this._uiContainer, 0);

        // 1. Sleek Background (Gradient-like)
        var bg = new PIXI.Graphics();
        var w = this.windowWidth();
        var h = this.windowHeight();

        // Main dark bar
        bg.beginFill(0x0a0a12, 0.95);
        bg.drawRect(0, 40, w, h - 40);
        bg.endFill();

        // Top Decor Line
        bg.lineStyle(2, 0x44CEF6, 1);
        bg.moveTo(0, 40);
        bg.lineTo(w, 40);

        // Left accent blocks
        bg.lineStyle(0);
        bg.beginFill(0x44CEF6, 0.8);
        bg.drawRect(0, 36, 100, 4);
        bg.drawRect(0, 40, 4, h - 40);
        bg.endFill();

        this._uiContainer.addChild(bg);

        // 2. Buttons (Visual Only)
        this.createButton("LOG", 40, 0);
        this.createButton("AUTO", 120, 0);
        this.createButton("SKIP", 200, 0);
    };

    // FORCE opacity to 0 regardless of what system tries to do
    CY_Window_DialogMessage.prototype._updateOpacity = function () {
        this.opacity = 0;
        this.backOpacity = 0;
    };

    // Override updateBackground to prevent it from resetting opacity based on game message settings
    CY_Window_DialogMessage.prototype.updateBackground = function () {
        this._background = $gameMessage.background();
        // Ignore the standard setBackgroundType which toggles opacity
        // We always want transparency for the main window frame
        this.opacity = 0;
        this.backOpacity = 0;
    };

    // Override standard update to ensure our opacity is forced every frame if needed (brute force safety)
    var _CY_WinMsg_update = CY_Window_DialogMessage.prototype.update;
    CY_Window_DialogMessage.prototype.update = function () {
        _CY_WinMsg_update.call(this);
        this.opacity = 0;
        this.backOpacity = 0;
    };

    CY_Window_DialogMessage.prototype.createButton = function (label, x, y) {
        var btn = new PIXI.Container();
        btn.x = x;
        btn.y = y;

        // Bg
        var g = new PIXI.Graphics();
        g.beginFill(0x000000, 0.5);
        g.lineStyle(1, 0xFFFFFF, 0.5);
        g.drawRect(0, 0, 70, 30);
        g.endFill();
        btn.addChild(g);

        // Text
        var style = { fontFamily: 'GameFont', fontSize: 14, fill: 0xFFFFFF, align: 'center' };
        var txt = new PIXI.Text(label, style);
        txt.anchor.set(0.5, 0.5);
        txt.x = 35;
        txt.y = 15;
        btn.addChild(txt);

        this._uiContainer.addChild(btn);
    };

    // Override standard padding to shift text
    CY_Window_DialogMessage.prototype.standardPadding = function () {
        return 20;
    };

    // Adjust text area rect
    CY_Window_DialogMessage.prototype.contentsHeight = function () {
        return this.windowHeight() - 40 - (this.standardPadding() * 2);
    };

    // Shift text down below buttons/decor
    CY_Window_DialogMessage.prototype.newLineX = function () {
        return $gameMessage.faceName() === '' ? 0 : 168; // default
    };

    // We need to account for the top margin (40px)
    // Window_Base draws contents at padding, padding.
    // If we want text to start lower, we can adjust origin or standardPadding.
    // BUT standardPadding affects all sides.
    // Simpler: Just override drawMessageFace and processNormalCharacter positioning?
    // Actually, Window_Message uses `newPage` to reset textState.y = 0.

    var _Window_Message_newPage = Window_Message.prototype.newPage;
    CY_Window_DialogMessage.prototype.newPage = function (textState) {
        _Window_Message_newPage.call(this, textState);
        textState.y += 30; // Push text down
    };

    // Also push face down
    CY_Window_DialogMessage.prototype.drawMessageFace = function () {
        this.drawFace($gameMessage.faceName(), $gameMessage.faceIndex(), 0, 30);
        ImageManager.releaseReservation(this._imageReservationId);
    };

})();
