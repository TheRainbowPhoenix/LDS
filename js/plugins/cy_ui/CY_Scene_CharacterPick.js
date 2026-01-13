//=============================================================================
// CY_Scene_CharacterPick.js
//=============================================================================

/*:
 * @plugindesc Cyberpunk UI Mod - Character Selection Scene
 * @author Cyberpunk UI Mod
 *
 * @help
 * CY_Scene_CharacterPick - Scene for selecting a team of 3 characters.
 * Extends CY_Scene_MenuBase.
 *
 * Features:
 * - Left side character portrait
 * - Floating right panel with info (Stats/Class)
 * - Cyberpunk styling
 * - Bottom Action Window for selection
 */

//-----------------------------------------------------------------------------
// CY_Window_CharActions
//-----------------------------------------------------------------------------

function CY_Window_CharActions() {
    this.initialize.apply(this, arguments);
}

CY_Window_CharActions.prototype = Object.create(Window_HorzCommand.prototype);
CY_Window_CharActions.prototype.constructor = CY_Window_CharActions;

CY_Window_CharActions.prototype.initialize = function (x, y) {
    Window_HorzCommand.prototype.initialize.call(this, x, y);
    this._cyBackSprite = null;
    this.setBackgroundType(2); // Transparent
};

CY_Window_CharActions.prototype.windowWidth = function () {
    return 360; // Wider
};

CY_Window_CharActions.prototype.maxCols = function () {
    return 2;
};

CY_Window_CharActions.prototype.makeCommandList = function () {
    this.addCommand('NEXT', 'next');
    this.addCommand('SELECT', 'select');
};

CY_Window_CharActions.prototype.itemHeight = function () {
    return 60; // Taller
};

CY_Window_CharActions.prototype.drawItem = function (index) {
    var rect = this.itemRectForText(index);
    var align = this.itemTextAlign();
    this.resetTextColor();
    this.changePaintOpacity(this.isCommandEnabled(index));

    // Custom drawing for visibility
    this.contents.fontSize = 24; // Larger Text

    if (index === this.index()) {
        this.changeTextColor(CY_System.Colors.cyan || '#00FFFF');
    } else {
        this.changeTextColor(CY_System.Colors.white || '#FFFFFF');
    }

    // Vertically center text in the larger item height
    var yOffset = (rect.height - this.contents.fontSize - 4) / 2;
    this.drawText(this.commandName(index), rect.x, rect.y + yOffset, rect.width, align);
};

// Use standard drawItem but maybe customize colors? 
// Default is fine for now, will inherit CY_Window_Selectable styling if mixin is applied?
// Window_HorzCommand inherits from Window_Command -> Window_Selectable. 
// CY system usually patches Window_Selectable.

//-----------------------------------------------------------------------------
// CY_Scene_CharacterPick
//-----------------------------------------------------------------------------

function CY_Scene_CharacterPick() {
    this.initialize.apply(this, arguments);
}

CY_Scene_CharacterPick.prototype = Object.create(CY_Scene_MenuBase.prototype);
CY_Scene_CharacterPick.prototype.constructor = CY_Scene_CharacterPick;

CY_Scene_CharacterPick.prototype.ui_margin = 0;

//-----------------------------------------------------------------------------
// Initialization
//-----------------------------------------------------------------------------

CY_Scene_CharacterPick.prototype.initialize = function () {
    CY_Scene_MenuBase.prototype.initialize.call(this);
    this._characters = this.getCharacterData();
    this._currentIndex = 0;
    this._selectedRecruits = [];
};

CY_Scene_CharacterPick.prototype.getCharacterData = function () {
    return [
        {
            name: "Crisis", image: "Crisis Right", classes: "Program / Robotic / Burst",
            stats: { HP: 450, EN: 100, ATK: 6, DEF: 3, HEAL: 3, SDEF: 4, ENA: 5, LUCK: 6 }
        },
        {
            name: "Chaos Cros", image: "FCroc Right", classes: "Program / Robotic / Tank",
            stats: { HP: 600, EN: 150, ATK: 5, DEF: 3, HEAL: 2, SDEF: 4, ENA: 3, LUCK: 3 }
        },
        {
            name: "R.D.", image: "Dash Right", classes: "Magic / Organic / Burst",
            stats: { HP: 350, EN: 50, ATK: 3, DEF: 4, HEAL: 5, SDEF: 5, ENA: 7, LUCK: 2 }
        },
        {
            name: "D.D.", image: "DD Right", classes: "Magic / Organic / Support",
            stats: { HP: 600, EN: 100, ATK: 2, DEF: 3, HEAL: 10, SDEF: 5, ENA: 7, LUCK: 7 }
        },
        {
            name: "Makato", image: "Makoto Right", classes: "Magic / Organic / Burst",
            stats: { HP: 500, EN: 100, ATK: 5, DEF: 1, HEAL: 1, SDEF: 2, ENA: 4, LUCK: 2 }
        },
        {
            name: "Q-Bee", image: "Bee Right", classes: "Magic / Organic / Burst",
            stats: { HP: 500, EN: 100, ATK: 3, DEF: 3, HEAL: 3, SDEF: 2, ENA: 6, LUCK: 4 }
        },
        {
            name: "Zetta Zepto", image: "Zetta Right", classes: "Tools / Organic / Support",
            stats: { HP: 550, EN: 100, ATK: 2, DEF: 2, HEAL: 1, SDEF: 5, ENA: 8, LUCK: 8 }
        },
        {
            name: "Roxi", image: "Roxi Right", classes: "Magic / Organic / Support",
            stats: { HP: 650, EN: 50, ATK: 3, DEF: 3, HEAL: 3, SDEF: 1, ENA: 8, LUCK: 4 }
        },
        {
            name: "Shantae", image: "Shantae Right", classes: "Magic / Organic / Support",
            stats: { HP: 550, EN: 150, ATK: 2, DEF: 2, HEAL: 6, SDEF: 5, ENA: 5, LUCK: 7 }
        },
        {
            name: "Tails-Ko", image: "Tails Right", classes: "Tools / Organic / Support",
            stats: { HP: 500, EN: 50, ATK: 2, DEF: 2, HEAL: 4, SDEF: 5, ENA: 7, LUCK: 10 }
        }
    ];
};

//-----------------------------------------------------------------------------
// Scene Creation
//-----------------------------------------------------------------------------

CY_Scene_CharacterPick.prototype.create = function () {
    CY_Scene_MenuBase.prototype.create.call(this);
    this.createTitleBar();
    this.createTeamList();
    this.createCharacterSprite();
    this.createRightPanel();
    this.createCommandWindow();

    this.refreshInfo();
};

//-----------------------------------------------------------------------------
// Title Bar (from CY_Scene_File)
//-----------------------------------------------------------------------------

CY_Scene_CharacterPick.prototype.createTitleBar = function () {
    var offsets = this.getScreenOffsets();
    var lensPadding = this.getLensPadding();

    // Title bar sprite - needs negative offset to reach screen edge (scene is positioned at box area)
    this._titleBarSprite = new Sprite();
    this._titleBarSprite.bitmap = new Bitmap(Graphics.width, CY_Scene_MenuBase.TOP_BAR_HEIGHT);
    this._titleBarSprite.x = 0; // offsets.x; // Negative offset to reach left screen edge
    this._titleBarSprite.y = offsets.y + this.ui_margin + lensPadding; // Negative offset + lens padding

    this.drawTitleBar();
    this.addChild(this._titleBarSprite);
};

CY_Scene_CharacterPick.prototype.drawTitleBar = function () {
    var bmp = this._titleBarSprite.bitmap;
    var w = bmp.width;
    var h = bmp.height;

    bmp.clear();

    // Draw title text centered
    bmp.fontFace = 'GameFont';
    bmp.fontSize = 24;
    bmp.textColor = CY_System.Colors.white;
    bmp.drawText("RECRUIT TEAM", 0, 8, w, h - 10, 'center');

    // Draw bottom border (2px, red #CC413C)
    bmp.fillRect(0, h - 2, w, 2, '#CC413C');
};


//-----------------------------------------------------------------------------
// Team List (Left Side)
//-----------------------------------------------------------------------------

CY_Scene_CharacterPick.prototype.createTeamList = function () {
    var titleH = CY_Scene_MenuBase.TOP_BAR_HEIGHT;
    this._teamListContainer = new PIXI.Container();
    this._teamListContainer.x = 40;
    this._teamListContainer.y = titleH + 20;
    this.addChild(this._teamListContainer);

    this.refreshTeamList();
};

CY_Scene_CharacterPick.prototype.refreshTeamList = function () {
    this._teamListContainer.removeChildren();

    // "TEAM" Header
    var headerStyle = {
        fontFamily: "GameFont",
        fontSize: 24,
        fill: 0xFF5555, // Light red
        align: "center"
    };
    var header = new PIXI.Text("TEAM", headerStyle);
    header.x = 0;
    header.y = 0;
    this._teamListContainer.addChild(header);

    // Slots
    var startY = 40;
    var slotHeight = 140; // Total height per slot including footer

    for (let i = 0; i < 3; i++) {
        var char = this._selectedRecruits[i];
        var y = startY + (i * (slotHeight + 10));

        // --- Dimensions ---
        var boxW = 100;
        var boxH = 100;
        var footerH = 24;
        var cutSize = 16;

        // --- Group ---
        var slotGroup = new PIXI.Container();
        slotGroup.y = y;
        this._teamListContainer.addChild(slotGroup);

        // --- 1. Main Frame (Image Area) ---
        var frame = new PIXI.Graphics();
        frame.lineStyle(2, 0x842624); // Red Border
        // If empty, just border. If full, transparent or bg?
        frame.beginFill(0x000000, 0.3); // Dark background
        frame.drawRect(0, 0, boxW, boxH);
        frame.endFill();
        slotGroup.addChild(frame);

        // --- 2. Thumbnail ---
        if (char) {
            var thumb = new Sprite();
            thumb.bitmap = ImageManager.loadPicture(char.image);

            // Mask
            var mask = new PIXI.Graphics();
            mask.beginFill(0xFFFFFF);
            mask.drawRect(0, 0, boxW, boxH);
            mask.endFill();

            // Important: Add mask to container
            slotGroup.addChild(mask);
            thumb.mask = mask;

            // Scale thumb to fill box
            thumb.scale.set(0.4, 0.4);
            // Center crop simulation
            thumb.anchor.set(0.5, 0);
            thumb.x = boxW / 2;

            slotGroup.addChild(thumb);
        }

        // --- 3. Footer (Name Tag) ---
        var footerY = boxH + 4; // Small gap or attached? User said "bottom padding... that's about 24px" implies attached.
        // Looking at ref image, it looks like a separate block below the image.
        // "Add a small padding under each batter card... line border on both the rectangle and the bottom padding"

        var footer = new PIXI.Graphics();
        footer.lineStyle(2, 0x842624); // Red Border
        footer.beginFill(0x842624, 0.2); // Semi-transparent red fill

        // Draw polygon with cut corner
        // Top-Left -> Top-Right -> Bottom-Right(Cut start) -> Bottom-Right(Cut end) -> Bottom-Left
        footer.drawPolygon([
            0, boxH,
            boxW, boxH,
            boxW, boxH + footerH - cutSize,
            boxW - cutSize, boxH + footerH,
            0, boxH + footerH
        ]);
        footer.endFill();
        slotGroup.addChild(footer);

        // --- 4. Frame Re-draw (to ensure border is on top) ---
        // Actually the footer is attached visually.

        // --- 5. Name Text ---
        if (char) {
            var nameStyle = {
                fontFamily: "GameFont",
                fontSize: 12,
                fill: 0xFFFFFF,
                align: "center"
            };
            var nameTxt = new PIXI.Text(char.name.toUpperCase(), nameStyle);
            nameTxt.anchor.set(0, 0.5); // Left align
            nameTxt.x = 4;
            nameTxt.y = boxH + (footerH / 2);
            slotGroup.addChild(nameTxt);

            // "CC+" or icon on right? (Optional based on ref, but Name is critical)
        } else {
            // Empty slot text? "EMPTY"?
            var emptyStyle = { fontFamily: "GameFont", fontSize: 10, fill: 0x666666 };
            var emptyTxt = new PIXI.Text("VACANT", emptyStyle);
            emptyTxt.anchor.set(0.5, 0.5);
            emptyTxt.x = boxW / 2;
            emptyTxt.y = boxH / 2;
            slotGroup.addChild(emptyTxt);
        }
    }
};

//-----------------------------------------------------------------------------
// Character Sprite (Left Center)
//-----------------------------------------------------------------------------

CY_Scene_CharacterPick.prototype.createCharacterSprite = function () {
    // 1. Calculate Available Area
    var topBarBottom = CY_Scene_MenuBase.TOP_BAR_HEIGHT + 20; // y-start
    var teamListRight = 40 + 100 + 40; // x-start (Team list at x=40 + width 100 + margin)

    var panelW = 450;
    var rightPanelX = Graphics.width - panelW - 40; // x-end

    this._charArea = {
        x: teamListRight,
        y: topBarBottom,
        w: rightPanelX - teamListRight,
        h: Graphics.height - topBarBottom
    };

    // 2. Debug Green Border
    var debug = new PIXI.Graphics();
    debug.lineStyle(2, 0x00FF00, 0.5);
    debug.drawRect(this._charArea.x, this._charArea.y, this._charArea.w, this._charArea.h);
    this.addChild(debug);

    // 3. Sprite
    this._characterSprite = new Sprite();
    this._characterSprite.anchor.x = 0.5;
    this._characterSprite.anchor.y = 1.0;

    // Position at horizontal center of area, and bottom of screen
    this._characterSprite.x = this._charArea.x + (this._charArea.w / 2);
    this._characterSprite.y = Graphics.height;

    this.addChild(this._characterSprite);
};

//-----------------------------------------------------------------------------
// Right Info Panel
//-----------------------------------------------------------------------------

CY_Scene_CharacterPick.prototype.createRightPanel = function () {
    var panelW = 450;
    var panelH = Graphics.height * 0.7; // 70% height
    var x = Graphics.width - panelW - 40;
    var y = (Graphics.height - panelH) / 2 + 20;

    this._infoContainer = new PIXI.Container();
    this._infoContainer.x = x;
    this._infoContainer.y = y;
    this.addChild(this._infoContainer);

    // 1. Panel Background
    // Color: #0E0E18, Left Border: #441618 (4px) or user requested 24px left padding styling?

    this._panelBg = new PIXI.Graphics();

    var bgColor = parseInt("0E0E18", 16);
    var redBorder = parseInt("441618", 16); // This is the "Left Red Padding" color or just border? 
    // Usually "Left Red Padding" means a thick stripe on the left.
    // Let's assume the user wants a thick left border of 24px.

    // Draw Main Background
    this._panelBg.beginFill(bgColor, 0.95);
    this._panelBg.lineStyle(1, 0xFF0000, 0.3); // "very thin 0.5px red border" ~ 1px with alpha or 0.5 width
    // PIXI line style 0.5 might be invisible on some renderers, using 1 with alpha
    this._panelBg.drawPolygon([
        0, 0,
        panelW, 0,
        panelW, panelH - 12, // Cut corner
        panelW - 12, panelH,
        0, panelH,
        0, 0
    ]);
    this._panelBg.endFill();

    // Draw Thick Left Stripe (24px)
    this._panelBg.lineStyle(0);
    this._panelBg.beginFill(redBorder);
    this._panelBg.drawRect(0, 0, 24, panelH);
    this._panelBg.endFill();

    this._infoContainer.addChild(this._panelBg);

    // 2. Text Elements Container
    this._textContainer = new PIXI.Container();
    this._textContainer.x = 34; // Offset text to right of the 24px red bar + padding
    this._infoContainer.addChild(this._textContainer);
};

//-----------------------------------------------------------------------------
// Command Window
//-----------------------------------------------------------------------------

CY_Scene_CharacterPick.prototype.createCommandWindow = function () {
    var w = 360;
    var h = 80; // fitting height for 1 row is small, but let's give it space
    var x = Graphics.width - w - 40;
    var y = Graphics.height - h - 20;

    this._commandWindow = new CY_Window_CharActions(x, y);
    this._commandWindow.setHandler('next', this.onNext.bind(this));
    this._commandWindow.setHandler('select', this.onSelect.bind(this));
    this._commandWindow.setHandler('cancel', this.popScene.bind(this));

    this.addWindow(this._commandWindow);
};

CY_Scene_CharacterPick.prototype.onNext = function () {
    this._currentIndex = (this._currentIndex + 1) % this._characters.length;
    this.refreshInfo();
    this._commandWindow.activate();
};

CY_Scene_CharacterPick.prototype.onSelect = function () {
    var char = this._characters[this._currentIndex];

    // Check if already selected?
    if (this._selectedRecruits.indexOf(char) >= 0) {
        SoundManager.playBuzzer();
        this._commandWindow.activate();
        return;
    }

    SoundManager.playOk();
    this._selectedRecruits.push(char);
    this.refreshTeamList();

    if (this._selectedRecruits.length >= 3) {
        // Done
        // Proceed to game?
        // For now, pop scene or show completion
        // Maybe start new game?
        DataManager.setupNewGame();
        SceneManager.goto(Scene_Map);
    } else {
        this.onNext();
    }
};

//-----------------------------------------------------------------------------
// Content Refresh
//-----------------------------------------------------------------------------

CY_Scene_CharacterPick.prototype.refreshInfo = function () {
    var char = this._characters[this._currentIndex];

    // 1. Update Image & Scale
    this._characterSprite.bitmap = ImageManager.loadPicture(char.image);

    this._characterSprite.bitmap.addLoadListener(() => {
        var w = this._characterSprite.bitmap.width;
        var h = this._characterSprite.bitmap.height;

        // Fit Logic: Scale to fit inside _charArea
        // We want to fill as much as possible but containment preferred to avoid clipping heads?
        // User request: "scale the image of each battler to fit that max space without clip"

        var maxW = this._charArea.w;
        var maxH = this._charArea.h;

        var scaleX = maxW / w;
        var scaleY = maxH / h;

        // Use the smaller scale to fit entirely (contain)
        // Or if we want to fill height primarily? User said "fit that max space without clip"
        var scale = Math.min(scaleX, scaleY);

        // Optional: Cap scale if it's too pixelated? Or allow growing?
        // Let's assume growing is fine.

        this._characterSprite.scale.set(scale, scale);
    });

    // 2. Clear Old Text
    this._textContainer.removeChildren();

    var panelW = 450 - 34; // adjusted width
    var y = 30;

    // Header
    this.addText("ALIAS", 0, y, 14, 0x882222);
    y += 20;
    this.addText(char.name.toUpperCase(), 0, y, 40, 0xFFE600); // Yellow
    y += 50;

    this.addText("CLASS_DATA", 0, y, 14, 0x882222);
    y += 20;
    this.addText(char.classes, 0, y, 20, 0x55CCFF); // Cyan
    y += 40;

    // Attributes Divider
    var divY = y;
    var gfx = new PIXI.Graphics();
    gfx.lineStyle(1, 0x441618);
    gfx.moveTo(0, divY);
    gfx.lineTo(panelW - 20, divY);
    this._textContainer.addChild(gfx);
    y += 20;

    // Stats List
    var stats = char.stats;
    var statOrder = ["HP", "EN", "ATK", "DEF", "HEAL", "SDEF", "ENA", "LUCK"];

    statOrder.forEach((key) => {
        var val = stats[key];
        var isBar = (key !== "HP" && key !== "EN");
        this.addStatRow(key, val, 0, y, isBar);
        y += 32;
    });
};

CY_Scene_CharacterPick.prototype.addText = function (text, x, y, size, color) {
    var style = {
        fontFamily: "GameFont",
        fontSize: size,
        fill: color,
        align: "left"
    };
    var sprite = new PIXI.Text(text, style);
    sprite.x = x;
    sprite.y = y;
    this._textContainer.addChild(sprite);
};

CY_Scene_CharacterPick.prototype.addStatRow = function (label, value, x, y, isBar) {
    // Label
    var styleLab = { fontFamily: "GameFont", fontSize: 20, fill: 0xFFE600 }; // Yellow labels
    var txtLab = new PIXI.Text(label, styleLab);
    txtLab.x = x;
    txtLab.y = y;
    this._textContainer.addChild(txtLab);

    var valX = x + 100;

    if (isBar) {
        // Draw Step Bar (0-10)
        var maxSteps = 10;
        var stepW = 18;
        var stepH = 12;
        var gap = 4;

        var g = new PIXI.Graphics();

        for (var i = 0; i < maxSteps; i++) {
            var bx = valX + (i * (stepW + gap));
            // Color logic
            // 0-3: Red, 4-6: Orange/Yellow, 7-10: Green
            var color = 0x555555; // Empty
            var alpha = 0.3;

            if (i < value) {
                alpha = 1.0;
                if (i < 3) color = 0xFF4444;       // Low
                else if (i < 6) color = 0xFFAA00; // Med
                else color = 0x44FF44;            // High
            }

            // Draw Oval/Skewed Rect
            g.beginFill(color, alpha);
            // Skewed rect effect
            g.drawPolygon([
                bx + 3, y + 6,
                bx + stepW + 3, y + 6,
                bx + stepW, y + 6 + stepH,
                bx, y + 6 + stepH
            ]);
            g.endFill();

            // Outline
            g.lineStyle(1, color, 0.8);
            g.drawPolygon([
                bx + 3, y + 6,
                bx + stepW + 3, y + 6,
                bx + stepW, y + 6 + stepH,
                bx, y + 6 + stepH
            ]);
            g.lineStyle(0);
        }

        this._textContainer.addChild(g);

    } else {
        // Number Value (HP/EN)
        // Style like image: Outline text? Or just styled number
        var styleVal = {
            fontFamily: "GameFont",
            fontSize: 22,
            fill: (label === "HP" ? 0x44FF44 : 0x55CCFF), // Green for HP, Cyan for EN
            stroke: '#000000',
            strokeThickness: 3
        };
        var txtVal = new PIXI.Text(value, styleVal);
        txtVal.x = valX;
        txtVal.y = y;
        this._textContainer.addChild(txtVal);
    }
};
