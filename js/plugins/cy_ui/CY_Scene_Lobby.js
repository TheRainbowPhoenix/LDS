/*:
 * @plugindesc Lobby Scene for CY_UI
 * @author Antigravity
 */

(function () {
    //-----------------------------------------------------------------------------
    // CY_Scene_Lobby
    //-----------------------------------------------------------------------------

    function CY_Scene_Lobby() {
        this.initialize.apply(this, arguments);
    }

    window.CY_Scene_Lobby = CY_Scene_Lobby;

    // Inherit from CY_Scene_MenuBase to prevent Map Interpreter execution
    CY_Scene_Lobby.prototype = Object.create(CY_Scene_MenuBase.prototype);
    CY_Scene_Lobby.prototype.constructor = CY_Scene_Lobby;

    CY_Scene_Lobby.prototype.create = function () {
        CY_Scene_MenuBase.prototype.create.call(this);

        // Define colors if CY_Main is loaded, otherwise defaults
        this.Colors = (typeof CY_Main !== 'undefined' && CY_Main.Colors) ? CY_Main.Colors : {
            cyan: '#5CF5FA',
            cyanDark: '#1B0E18',
            darkRed: '#842624',
            lightRed: '#FF6158',
            backgroundBlack: 'rgba(0, 0, 0, 0.7)',
            inactiveText: '#8a8a8a',
            white: '#ffffff',
            yellow: '#f0f000'
        };

        this.createBackgroundPattern(); // New background pattern
        this.createPartyDisplay();
        this.createLobbyUI(); // Top bar
        this.createCommandWindow(); // Hexagon buttons
    };

    // New 45 degree pattern background
    CY_Scene_Lobby.prototype.createBackgroundPattern = function () {
        this._bgPatternContainer = new PIXI.Container();
        this.addChild(this._bgPatternContainer);

        var g = new PIXI.Graphics();

        // 1. Skewed stripes pattern
        // Draw many lines at 45 degrees
        g.lineStyle(2, 0x000000, 0.2);

        // Covering the screen with diagonal lines
        var step = 40;
        var w = Graphics.width;
        var h = Graphics.height;
        var max = w + h;

        for (var i = -h; i < w; i += step) {
            g.moveTo(i, 0);
            g.lineTo(i + h, h);
        }

        // 2. Bottom Triangle
        // A large dark triangle at the bottom right or bottom?
        // "alongside the bottom triangle" - likely a deco element.
        // Let's put a dark graphic at bottom right.
        g.beginFill(0x000000, 0.5);
        g.moveTo(0, h);
        g.lineTo(w, h);
        g.lineTo(w, h - 200);
        g.lineTo(0, h);
        g.endFill();

        this._bgPatternContainer.addChild(g);
    };

    CY_Scene_Lobby.prototype.createLobbyUI = function () {
        this._lobbyContainer = new PIXI.Container();
        this.addChild(this._lobbyContainer);
        this.createTopBar();
    };

    CY_Scene_Lobby.prototype.createCommandWindow = function () {
        // Create the interactive command window
        this._commandWindow = new CY_Window_LobbyCommand();
        this._commandWindow.setHandler('attack', this.onCommandAttack.bind(this));
        this._commandWindow.setHandler('valkyrja', this.onCommandValkyrja.bind(this));
        this._commandWindow.setHandler('equipment', this.onCommandEquipment.bind(this));
        this._commandWindow.setHandler('supply', this.onCommandSupply.bind(this));
        this._commandWindow.setHandler('cancel', this.popScene.bind(this)); // Back to Title/Map

        this.addWindow(this._commandWindow);
    };

    // Command Handlers (Placeholders for now)
    CY_Scene_Lobby.prototype.onCommandAttack = function () {
        console.log("Attack Selected");
        this._commandWindow.activate();
    };

    CY_Scene_Lobby.prototype.onCommandValkyrja = function () {
        console.log("Valkyrja Selected");
        this._commandWindow.activate();
    };

    CY_Scene_Lobby.prototype.onCommandEquipment = function () {
        console.log("Equipment Selected");
        this._commandWindow.activate();
    };

    CY_Scene_Lobby.prototype.onCommandSupply = function () {
        console.log("Supply Selected");
        this._commandWindow.activate();
    };

    CY_Scene_Lobby.prototype.createTopBar = function () {
        var bar = new PIXI.Graphics();
        bar.beginFill(0x000000, 0.6);
        bar.drawRect(0, 0, Graphics.width, 60);
        bar.endFill();
        this._lobbyContainer.addChild(bar);

        var style = { fontFamily: 'GameFont', fontSize: 20, fill: 0xFFFFFF };
        var txt = new PIXI.Text("PLAYER 202906517   LV.11", style);
        txt.x = 20;
        txt.y = 15;
        this._lobbyContainer.addChild(txt);

        // Currencies
        var curX = Graphics.width - 300;
        var txt2 = new PIXI.Text("💎 265   💰 98215", style);
        txt2.x = curX;
        txt2.y = 15;
        this._lobbyContainer.addChild(txt2);
    };

    CY_Scene_Lobby.prototype.createPartyDisplay = function () {
        // Fallback: If party is empty (testing from menu), add dummy actors
        if ($gameParty.members().length === 0) {
            // Add default IDs 1, 2, 3
            $gameParty.addActor(1);
            $gameParty.addActor(2);
            $gameParty.addActor(3);
        }

        // Display the 3 party members on the left
        this._partyContainer = new PIXI.Container();
        this.addChild(this._partyContainer);

        var members = $gameParty.members();

        // Define a "Box" area for characters on the left side
        var boxX = 300; // Center X of the group
        var boxY = Graphics.height + 20; // Bottom alignment point

        // Relative offsets from boxX, boxY
        // 0: Leader (Center, Front)
        // 1: Left Member (Left, Back)
        // 2: Right Member (Right, Back)

        var positions = [
            { x: 0, y: 0, scale: 1.0, z: 2 }, // Center
            { x: -150, y: -20, scale: 0.85, z: 1 }, // Left
            { x: 150, y: -20, scale: 0.85, z: 1 }  // Right
        ];

        // Sort members to draw back-most first (Painter's Algorithm)
        var visuals = [];

        members.forEach((actor, index) => {
            if (index >= 3) return;

            var charData = this.findCharData(actor.name());
            var imgName = charData ? charData.image : "";

            if (imgName) {
                var sprite = new Sprite();
                sprite.bitmap = ImageManager.loadPicture(imgName);
                sprite.anchor.set(0.5, 1.0);

                var pos = positions[index] || { x: 0, y: 0, scale: 1, z: 0 };

                sprite.x = boxX + pos.x;
                sprite.y = boxY + pos.y;
                sprite.scale.set(pos.scale);
                sprite.zIndex = pos.z;

                visuals.push(sprite);
            }
        });

        // Sort by zIndex (lowest first)
        visuals.sort((a, b) => a.zIndex - b.zIndex);

        visuals.forEach(sprite => {
            this._partyContainer.addChild(sprite);
        });
    };

    CY_Scene_Lobby.prototype.findCharData = function (name) {
        if (CY_Scene_CharacterPick && CY_Scene_CharacterPick.prototype.getCharacterData) {
            var data = CY_Scene_CharacterPick.prototype.getCharacterData();
            return data.find(c => c.name.toUpperCase() === name.toUpperCase());
        }
        return null;
    };


    //-----------------------------------------------------------------------------
    // CY_Window_LobbyCommand
    //-----------------------------------------------------------------------------

    function CY_Window_LobbyCommand() {
        this.initialize.apply(this, arguments);
    }

    CY_Window_LobbyCommand.prototype = Object.create(CY_Window_Selectable.prototype);
    CY_Window_LobbyCommand.prototype.constructor = CY_Window_LobbyCommand;

    CY_Window_LobbyCommand.prototype.initialize = function () {
        var w = 600; // Increased area for diamond layout
        var h = 500;
        var x = Graphics.width - w; // Align to right
        var y = (Graphics.height - h) / 2 + 50;

        this.hexWidth = 160;
        this.hexHeight = 140;

        this._list = [];
        this.clearCommandList();
        this.makeCommandList();

        CY_Window_Selectable.prototype.initialize.call(this, x, y, w, h);

        this.opacity = 0; // Transparent background
        this.refresh();
        this.select(0);
        this.activate();
    };

    // Override to hide default Cyberpunk background explicitly
    CY_Window_LobbyCommand.prototype.refreshCyBackground = function () {
        if (this._cyBackSprite) {
            this._cyBackSprite.visible = false;
        }
    };

    CY_Window_LobbyCommand.prototype.clearCommandList = Window_Command.prototype.clearCommandList;
    CY_Window_LobbyCommand.prototype.addCommand = Window_Command.prototype.addCommand;
    CY_Window_LobbyCommand.prototype.commandName = Window_Command.prototype.commandName;
    CY_Window_LobbyCommand.prototype.commandSymbol = Window_Command.prototype.commandSymbol;
    CY_Window_LobbyCommand.prototype.isCommandEnabled = Window_Command.prototype.isCommandEnabled;
    CY_Window_LobbyCommand.prototype.currentData = Window_Command.prototype.currentData;
    CY_Window_LobbyCommand.prototype.isCurrentItemEnabled = Window_Command.prototype.isCurrentItemEnabled;
    CY_Window_LobbyCommand.prototype.currentSymbol = Window_Command.prototype.currentSymbol;
    CY_Window_LobbyCommand.prototype.callOkHandler = Window_Command.prototype.callOkHandler;
    CY_Window_LobbyCommand.prototype.findSymbol = Window_Command.prototype.findSymbol;
    CY_Window_LobbyCommand.prototype.selectSymbol = Window_Command.prototype.selectSymbol;

    CY_Window_LobbyCommand.prototype.maxItems = function () {
        return this._list.length;
    };

    CY_Window_LobbyCommand.prototype.makeCommandList = function () {
        // Red color for borders as requested (accent)
        // We will use CY_System colors in drawItem.
        // We pass basic info here.
        this.addCommand("ATTACK", "attack", true);
        this.addCommand("VALKYRJA", "valkyrja", true);
        this.addCommand("EQUIPMENT", "equipment", true);
        this.addCommand("SUPPLY", "supply", true);
    };

    // Override itemRect to place items in Diamond layout
    CY_Window_LobbyCommand.prototype.itemRect = function (index) {
        var rect = new Rectangle();

        // Hexagon size parameters
        var hexWidth = this.hexWidth;
        var hexHeight = this.hexHeight;

        // Window Center relative to contents
        var cx = this.width / 2 - this.standardPadding();
        var cy = this.height / 2 - this.standardPadding();

        // Layout Offsets
        var yOffset = 110;
        var xOffset = 140;

        var x, y;

        switch (index) {
            case 0: // ATTACK (Top)
                x = cx;
                y = cy - yOffset;
                break;
            case 1: // VALKYRJA (Left)
                x = cx - xOffset;
                y = cy;
                break;
            case 2: // EQUIPMENT (Right)
                x = cx + xOffset;
                y = cy;
                break;
            case 3: // SUPPLY (Bottom)
                x = cx;
                y = cy + yOffset;
                break;
            default:
                x = 0; y = 0;
        }

        rect.width = hexWidth;
        rect.height = hexHeight;
        rect.x = x - (hexWidth / 2);
        rect.y = y - (hexHeight / 2);

        return rect;
    };

    CY_Window_LobbyCommand.prototype.drawItem = function (index) {
        var rect = this.itemRect(index);
        var data = this._list[index];
        var label = data.name;

        // Use CY_System colors or defaults
        var Colors = (typeof CY_Main !== 'undefined' && CY_Main.Colors) ? CY_Main.Colors : {
            cyan: '#5CF5FA',
            darkRed: '#842624',
            lightRed: '#FF6158',
            warning: '#f0f000',
            white: '#ffffff'
        };

        var ctx = this.contents.context;
        var x = rect.x;
        var y = rect.y;
        var w = rect.width;
        var h = rect.height;

        // Draw Regular Hexagon
        var cx = x + w / 2;
        var cy = y + h / 2;
        var r = w / 2;

        ctx.save();
        ctx.beginPath();
        for (var i = 0; i < 6; i++) {
            var angle_deg = 0 + (60 * i);
            var angle_rad = Math.PI / 180 * angle_deg;
            var vx = cx + r * Math.cos(angle_rad);
            var vy = cy + (r * 0.85) * Math.sin(angle_rad); // Squish height slightly

            if (i === 0) ctx.moveTo(vx, vy);
            else ctx.lineTo(vx, vy);
        }
        ctx.closePath();

        // Fill: Semi-transparent black/red blend
        // Using darkRed with low opacity for background
        ctx.fillStyle = 'rgba(20, 10, 10, 0.7)';
        ctx.fill();

        // Border: Light Red by default
        ctx.strokeStyle = Colors.lightRed;
        ctx.lineWidth = 2;
        ctx.stroke();

        ctx.restore();

        // 2. Draw Text (Using makeTextSprite logic but on existing bitmap contents)
        // Since we are inside a Window, we draw onto `this.contents`.
        // We want bold text.

        this.contents.fontFace = 'GameFont';
        this.contents.fontSize = 28; // Bolder/Larger
        this.contents.outlineColor = 'rgba(0,0,0,0.8)';
        this.contents.outlineWidth = 5;

        this.changeTextColor(Colors.white);

        // We can mimic bold by drawing slightly offset twice? 
        // Or just using larger font. 28 is decently bold.

        // Center text in rect
        this.drawText(label, x, y + (h - 28) / 2, w, 'center');

        // Add Sub-Label (Japanese/flavor text placeholder)
        this.contents.fontSize = 14;
        this.changeTextColor(Colors.cyan);
        var subText = (index === 0) ? "ACTION" : (index === 1) ? "UNIT" : (index === 2) ? "GEAR" : "SHOP";
        this.drawText(subText, x, y + (h - 28) / 2 + 25, w, 'center');
    };

    // Update Highlight Position
    CY_Window_LobbyCommand.prototype.updateHighlight = function () {
        if (!this._highlightSprite) return;

        var shouldShow = this.index() >= 0 && this.active;
        this._highlightTargetAlpha = shouldShow ? 1.0 : 0;

        if (shouldShow) {
            var rect = this.itemRect(this.index());
            var expansion = 10;
            var targetX = rect.x - expansion;
            var targetY = rect.y - expansion;

            if (!this._clientArea) {
                targetX += this.standardPadding();
                targetY += this.standardPadding();
            }

            this._highlightSprite.x = targetX;
            this._highlightSprite.y = targetY;
            this._highlightSprite.width = this.hexWidth + expansion * 2;
            this._highlightSprite.height = this.hexHeight + expansion * 2;

            this._highlightSprite.visible = true;

            this._expansion = expansion; // Store for refresh

            if (this._lastSelectedIndex !== this.index()) {
                // Refresh highlight geometry
                this.refreshHighlight(rect.width, rect.height);
                this._lastSelectedIndex = this.index();
                this._highlightCurrentAlpha = 1.0;
            }
        }
    };

    // Refresh Highlight (Cyan Hexagon)
    CY_Window_LobbyCommand.prototype.refreshHighlight = function (baseW, baseH) {
        var Colors = (typeof CY_Main !== 'undefined' && CY_Main.Colors) ? CY_Main.Colors : {
            cyan: '#5CF5FA'
        };

        // Calculated in updateHighlight, including expansion
        var expansion = this._expansion || 10;
        var w = baseW + (expansion * 2);
        var h = baseH + (expansion * 2);

        var bmp = this._highlightSprite.bitmap;
        if (bmp.width !== w || bmp.height !== h) {
            bmp.resize(w, h);
        }
        bmp.clear();

        var ctx = bmp.context;
        var cx = w / 2;
        var cy = h / 2;
        var r = w / 2;

        ctx.save();
        ctx.beginPath();
        for (var i = 0; i < 6; i++) {
            var angle_deg = 0 + (60 * i);
            var angle_rad = Math.PI / 180 * angle_deg;
            var vx = cx + r * Math.cos(angle_rad);
            var vy = cy + (r * 0.85) * Math.sin(angle_rad);

            if (i === 0) ctx.moveTo(vx, vy);
            else ctx.lineTo(vx, vy);
        }
        ctx.closePath();

        // Fill glow (Cyan)
        ctx.fillStyle = 'rgba(92, 245, 250, 0.2)';
        ctx.fill();

        // Border (Cyan)
        ctx.strokeStyle = Colors.cyan;
        ctx.lineWidth = 4;
        ctx.stroke();

        ctx.restore();

        bmp._baseTexture.update();
    };

})();
