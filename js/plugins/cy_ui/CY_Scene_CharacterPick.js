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
// CY_Window_CharPickActions
//-----------------------------------------------------------------------------

function CY_Window_CharPickActions() {
    this.initialize.apply(this, arguments);
}

CY_Window_CharPickActions.prototype = Object.create(CY_Window_Selectable.prototype);
CY_Window_CharPickActions.prototype.constructor = CY_Window_CharPickActions;

CY_Window_CharPickActions.prototype.initialize = function (x, y, width, height) {
    this._commands = ['PREV', 'SELECT', 'NEXT'];
    CY_Window_Selectable.prototype.initialize.call(this, x, y, width, height);
    this.refresh();
    this.select(1); // Default to SELECT (middle)
    this.activate();
    this.setBackgroundType(2);
};

CY_Window_CharPickActions.prototype.maxCols = function () {
    return 3;
};

CY_Window_CharPickActions.prototype.maxItems = function () {
    return this._commands.length;
};

CY_Window_CharPickActions.prototype.itemHeight = function () {
    return this.height - this.standardPadding() * 2;
};

// Robust Navigation Handlers
CY_Window_CharPickActions.prototype.cursorRight = function (wrap) {
    if (this.maxItems() <= 1) return;
    this.select((this.index() + 1) % this.maxItems());
    SoundManager.playCursor();
};

CY_Window_CharPickActions.prototype.cursorLeft = function (wrap) {
    if (this.maxItems() <= 1) return;
    this.select((this.index() - 1 + this.maxItems()) % this.maxItems());
    SoundManager.playCursor();
};

CY_Window_CharPickActions.prototype.drawItem = function (index) {
    var rect = this.itemRect(index);
    var isSelected = (index === this.index());

    this.contents.fontSize = 22; // Slightly smaller to fit 3

    if (isSelected) {
        this.changeTextColor(CY_System.Colors.cyan || '#00FFFF');
    } else {
        this.changeTextColor(CY_System.Colors.white || '#FFFFFF');
    }

    // Vertically center
    var yOffset = (rect.height - this.contents.fontSize - 4) / 2;
    this.drawText(this._commands[index], rect.x, rect.y + yOffset, rect.width, 'center');

    this.resetFontSettings();
};

//-----------------------------------------------------------------------------
// Spriteset_CharPick
//-----------------------------------------------------------------------------

function Spriteset_CharPick() {
    this.initialize.apply(this, arguments);
}

Spriteset_CharPick.prototype = Object.create(Spriteset_Base.prototype);
Spriteset_CharPick.prototype.constructor = Spriteset_CharPick;

Spriteset_CharPick.prototype.createLowerLayer = function () {
    Spriteset_Base.prototype.createLowerLayer.call(this);
    this.createPictures();
};

Spriteset_CharPick.prototype.createPictures = function () {
    var width = Graphics.boxWidth;
    var height = Graphics.boxHeight;
    var x = (Graphics.width - width) / 2;
    var y = (Graphics.height - height) / 2;
    this._pictureContainer = new Sprite();
    this._pictureContainer.setFrame(x, y, width, height);
    for (var i = 1; i <= $gameScreen.maxPictures(); i++) {
        this._pictureContainer.addChild(new Sprite_Picture(i));
    }
    this.addChild(this._pictureContainer);
};

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

    // --- Layout Scaling ---
    var w = Graphics.width;
    var h = Graphics.height;

    // Default reference resolution: 1920x1080
    // Trigger scaling if width < 1600 OR height < 800
    this._uiScale = 1.0;

    if (w < 1600 || h < 800) {
        // Calculate ratio
        // We want to scale down fairly aggressively if it's small (e.g. 1280x720)
        // 1280 / 1920 = 0.66
        var scaleW = w / 1920;
        var scaleH = h / 1080;
        this._uiScale = Math.min(scaleW, scaleH);

        // Ensure it doesn't get too tiny or weird
        this._uiScale = Math.max(0.6, this._uiScale);
    }
};

CY_Scene_CharacterPick.prototype.getCharacterData = function () {
    return [
        {
            name: "Chaos Cros", image: "FCroc Right", classes: "Program / Robotic / Tank",
            stats: { HP: 600, EN: 150, ATK: 5, DEF: 3, HEAL: 2, SDEF: 4, ENA: 3, LUCK: 3 }
        },
        {
            name: "Spine Boy", image: "spineboy-pro", spine: "spineboy-pro", anim: "idle",
            classes: "Mascot / Test / Hero",
            stats: { HP: 400, EN: 120, ATK: 2, DEF: 1, HEAL: 4, SDEF: 2, ENA: 3, LUCK: 2 }
        },
        {
            name: "Seele", image: "seele", spine: "seele", anim: "animation",
            classes: "Alter / Dark / Evil",
            stats: { HP: 600, EN: 250, ATK: 6, DEF: 4, HEAL: 2, SDEF: 4, ENA: 2, LUCK: 2 }
        },
        {
            name: "kapara", image: "kapara", spine: "kapara", anim: "OP_iya",
            classes: "Alter / Dark / Evil",
            stats: { HP: 600, EN: 250, ATK: 6, DEF: 4, HEAL: 2, SDEF: 4, ENA: 2, LUCK: 2 }
        },
        {
            name: "Tails-Ko", image: "Tails Right", classes: "Tools / Organic / Support",
            stats: { HP: 500, EN: 50, ATK: 2, DEF: 2, HEAL: 4, SDEF: 5, ENA: 7, LUCK: 10 }
        },
        {
            name: "Crisis", image: "Crisis Right", classes: "Program / Robotic / Burst",
            stats: { HP: 450, EN: 100, ATK: 6, DEF: 3, HEAL: 3, SDEF: 4, ENA: 5, LUCK: 6 }
        },
        {
            name: "Q-Bee", image: "Bee Right", classes: "Magic / Organic / Burst",
            stats: { HP: 500, EN: 100, ATK: 3, DEF: 3, HEAL: 3, SDEF: 2, ENA: 6, LUCK: 4 }
        },
        {
            name: "Makato", image: "Makoto Right", classes: "Magic / Organic / Burst",
            stats: { HP: 500, EN: 100, ATK: 5, DEF: 1, HEAL: 1, SDEF: 2, ENA: 4, LUCK: 2 }
        },
        {
            name: "Shantae", image: "Shantae Right", classes: "Magic / Organic / Support",
            stats: { HP: 550, EN: 150, ATK: 2, DEF: 2, HEAL: 6, SDEF: 5, ENA: 5, LUCK: 7 }
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
            name: "R.D.", image: "Dash Right", classes: "Magic / Organic / Burst",
            stats: { HP: 350, EN: 50, ATK: 3, DEF: 4, HEAL: 5, SDEF: 5, ENA: 7, LUCK: 2 }
        },
        {
            name: "D.D.", image: "DD Right", classes: "Magic / Organic / Support",
            stats: { HP: 600, EN: 100, ATK: 2, DEF: 3, HEAL: 10, SDEF: 5, ENA: 7, LUCK: 7 }
        }
    ];
};

//-----------------------------------------------------------------------------
// Scene Creation
//-----------------------------------------------------------------------------

CY_Scene_CharacterPick.prototype.create = function () {
    CY_Scene_MenuBase.prototype.create.call(this);
    this.createSpriteset();
    this.createTitleBar();
    this.createDecorations(); // New Bottom Left Gizmo
    this.createTeamList();
    this.createCharacterSprite();
    this.createRightPanel();
    this.createCommandWindow();

    this.refreshInfo();
};

CY_Scene_CharacterPick.prototype.createDecorations = function () {
    this._decorationContainer = new PIXI.Container();
    this._decorationContainer.scale.set(this._uiScale);

    this._decorationContainer.x = 40 * this._uiScale;
    this._decorationContainer.y = Graphics.height - (100 * this._uiScale); // Scale margin too

    this.addChild(this._decorationContainer);

    // --- Logo (M shape) ---
    var logo = new PIXI.Graphics();
    logo.lineStyle(2, 0x882222); // Reddish

    // Draw M-like shape with lines
    // Left Triangle
    logo.moveTo(0, 80);
    logo.lineTo(30, 20);
    logo.lineTo(60, 80);
    logo.lineTo(0, 80);

    // Right Triangle (Intersecting)
    logo.moveTo(30, 80);
    logo.lineTo(60, 20);
    logo.lineTo(90, 80);
    logo.lineTo(30, 80);

    // Inner lines (Decoration)
    logo.moveTo(15, 50); logo.lineTo(45, 50);
    logo.moveTo(45, 50); logo.lineTo(75, 50);

    this._decorationContainer.addChild(logo);

    // --- Text ---
    var style = {
        fontFamily: "GameFont",
        fontSize: 14,
        fill: 0x882222,
        align: "left",
        lineHeight: 18
    };

    var text = new PIXI.Text("Project Egg\nBattlers\nDatabase", style);
    text.x = 100;
    text.y = 20;
    this._decorationContainer.addChild(text);
};

CY_Scene_CharacterPick.prototype.createSpriteset = function () {
    this._spriteset = new Spriteset_Base();
    // Manually add picture container since Spriteset_Base doesn't have it by default in all versions
    this._spriteset.createPictures = function () {
        var width = Graphics.boxWidth;
        var height = Graphics.boxHeight;
        var x = (Graphics.width - width) / 2;
        var y = (Graphics.height - height) / 2;
        this._pictureContainer = new Sprite();
        this._pictureContainer.setFrame(x, y, width, height);
        for (var i = 1; i <= $gameScreen.maxPictures(); i++) {
            this._pictureContainer.addChild(new Sprite_Picture(i));
        }
        this.addChild(this._pictureContainer);
    };
    this._spriteset.createPictures();

    // Z-index: Behind UI
    this.addChildAt(this._spriteset, 0);
};

//-----------------------------------------------------------------------------
// Title Bar (from CY_Scene_File)
//-----------------------------------------------------------------------------

CY_Scene_CharacterPick.prototype.update = function () {
    CY_Scene_MenuBase.prototype.update.call(this);

    // Update Spine Avatar
    if (this._spineAvatar) {
        this._spineAvatar.update();
    }

    // Update Game Screen (Pictures, Shake, Flash, etc)
    $gameScreen.update();
    if (this._spriteset) {
        this._spriteset.update();
    }
};

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
    bmp.fontSize = 24 * this._uiScale;
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

    // Base position
    var baseX = 40;
    var baseY = titleH + 20;

    this._teamListContainer.x = baseX * this._uiScale;
    this._teamListContainer.y = baseY; // Keep Y relative to top bar mostly

    // Scale the entire container
    // But wait, if we scale the container, the text inside scales too, which is what we want.
    this._teamListContainer.scale.set(this._uiScale);

    this.addChild(this._teamListContainer);

    this.refreshTeamList();
};

CY_Scene_CharacterPick.prototype.refreshTeamList = function () {
    this._teamListContainer.removeChildren();

    // "TEAM" Header
    var headerStyle = {
        fontFamily: "GameFont",
        fontSize: 24 * this._uiScale,
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

//-----------------------------------------------------------------------------
// CY_SpineAvatar
//-----------------------------------------------------------------------------

function CY_SpineAvatar() {
    this.initialize.apply(this, arguments);
}

CY_SpineAvatar.prototype = Object.create(PIXI.Container.prototype);
CY_SpineAvatar.prototype.constructor = CY_SpineAvatar;

CY_SpineAvatar.prototype.initialize = function () {
    PIXI.Container.call(this);
    this._spine = null;
};

CY_SpineAvatar.prototype.setSpine = function (key, anim, maxWidth, maxHeight) {
    // 1. cleanup
    if (this._spine) {
        this.removeChild(this._spine);
        this._spine = null;
    }

    // 2. validate data
    if (!window.Makonet || !Makonet.MpiShowSpine || !Makonet.MpiShowSpine.spineData) {
        return false;
    }

    var data = Makonet.MpiShowSpine.spineData[key];
    if (!data) return false;

    try {
        // 3. Raw Create
        this._spine = new PIXI.spine.Spine(data);
        this.addChild(this._spine);

        // 4. Skin Logic (Force a refresh of slots)
        if (this._spine.spineData.skins.length > 1) {
            // Often 'default' is 0. Try 1 if exists, or just use what we have.
            // MpiShowSpine uses skins[1] if > 1.
            var skin = this._spine.spineData.skins[1];
            this._spine.skeleton.setSkin(skin);
            this._spine.skeleton.setSlotsToSetupPose();
        }

        // 5. Animation
        if (anim) {
            // Basic existence check
            var hasAnim = this._spine.spineData.animations.some(function (a) { return a.name === anim; });
            if (hasAnim) {
                this._spine.state.setAnimation(0, anim, true);
            } else {
                // Fallback
                console.warn("Anim " + anim + " not found in " + key);
                // try 'idle'
                this._spine.state.setAnimation(0, 'idle', true);
            }
        }

        // 6. Scale / Fit
        if (maxWidth && maxHeight) {
            // We need local bounds. PIXI Spine bounds can be empty if not updated.
            // Force a small update to calc bounds?
            this._spine.update(0);
            var b = this._spine.getLocalBounds();
            var w = b.width;
            var h = b.height;

            // Fallbacks if bounds failed
            if (w === 0 || h === 0) {
                w = data.width || 400;
                h = data.height || 400;
            }

            // Calculate scale
            var sX = maxWidth / w;
            var sY = maxHeight / h;
            var scale = Math.min(sX, sY); // Contain

            if (scale > 1.5) scale = 1.5; // Cap
            this._spine.scale.set(scale);
        }

        return true;

    } catch (e) {
        console.error("CY_SpineAvatar Error:", e);
        return false;
    }
};

CY_SpineAvatar.prototype.update = function () {
    if (this._spine) {
        // Reduced delta to 0.008 (approx 1/120) to slow down animation as requested.
        this._spine.update(0.008);
    }
};


CY_Scene_CharacterPick.prototype.createCharacterSprite = function () {
    // 1. Calculate Available Area
    var topBarBottom = CY_Scene_MenuBase.TOP_BAR_HEIGHT + 20;

    var margin = 40 * this._uiScale;
    var teamListW = 100 * this._uiScale; // approximate width of the list visual
    var teamListRight = margin + teamListW + margin;

    var panelW = 450 * this._uiScale;
    var rightPanelX = Graphics.width - panelW - margin;

    this._charArea = {
        x: teamListRight,
        y: topBarBottom,
        w: rightPanelX - teamListRight,
        h: Graphics.height - topBarBottom
    };

    // 2. Static Image Sprite
    this._characterSprite = new Sprite();
    this._characterSprite.anchor.x = 0.5;
    this._characterSprite.anchor.y = 1.0;
    this._characterSprite.x = this._charArea.x + (this._charArea.w / 2);
    this._characterSprite.y = Graphics.height;
    this.addChild(this._characterSprite);

    // 3. Spine Avatar Container
    this._spineAvatar = new CY_SpineAvatar();
    this._spineAvatar.x = this._charArea.x + (this._charArea.w / 2);
    this._spineAvatar.y = Graphics.height;
    this.addChild(this._spineAvatar);
};

//-----------------------------------------------------------------------------
// Right Info Panel
//-----------------------------------------------------------------------------

CY_Scene_CharacterPick.prototype.createRightPanel = function () {
    // Base dimensions
    var basePanelW = 450;
    var panelW = basePanelW * this._uiScale;

    var panelH = Graphics.height * 0.7; // Height relative to screen is fine
    // x = Width - panelW - margin
    var margin = 40 * this._uiScale;

    var x = Graphics.width - panelW - margin;
    var y = (Graphics.height - panelH) / 2 + 20;

    this._infoContainer = new PIXI.Container();
    this._infoContainer.x = x;
    this._infoContainer.y = y;

    // Scale internal contents? 
    // If we just scale the container, we might distort borders if not careful, 
    // but here we are drawing logical sizes.
    // Let's draw using the 'panelW' we calculated, but scale the text?
    // Actually, simpler to just set .scale on container for content, 
    // BUT we want the panel to fill the calculated W.

    // Strategy: Pass the scaled width to drawing logic.
    // Text scale: The text sizes are hardcoded (size 14, 40, etc).
    // We should probably scale the container to keep text proportional.

    // Let's create content as if it is 450px wide, and scale the container down.
    this._infoContainer.scale.set(this._uiScale);

    // Re-calculate X/Y because of scale
    // If container is scaled, its visual width is internalWidth * scale.
    // We want visual width to be panelW.
    // So internalWidth should be basePanelW (450).
    // so x position should be:
    // x = Graphics.width - (basePanelW * scale) - (40 * scale)

    this._infoContainer.x = Graphics.width - (basePanelW * this._uiScale) - (40 * this._uiScale);
    // Y needs to center based on scaled height?
    // Visual Height = panelH_logical * scale
    // panelH_logical = (Graphics.height * 0.7) / scale ? 
    // No, simpler: Let's determine the visual height we want (70% of screen).
    // So internal height must be screenHeight * 0.7 / scale.

    var visualH = Graphics.height * 0.7;
    var internalH = visualH / this._uiScale;

    this._infoContainer.y = (Graphics.height - visualH) / 2 + 20;

    this.addChild(this._infoContainer);

    // Pass these to drawing (internal coordinates)
    this.drawRightPanelBg(basePanelW, internalH); // Refactored drawing
};

CY_Scene_CharacterPick.prototype.drawRightPanelBg = function (w, h) {
    // 1. Panel Background
    this._panelBg = new PIXI.Graphics();

    var bgColor = parseInt("0E0E18", 16);
    var redBorder = parseInt("441618", 16);

    this._panelBg.beginFill(bgColor, 0.95);
    this._panelBg.lineStyle(1, 0xFF0000, 0.3);

    this._panelBg.drawPolygon([
        0, 0,
        w, 0,
        w, h - 12,
        w - 12, h,
        0, h,
        0, 0
    ]);
    this._panelBg.endFill();

    // Draw Thick Left Stripe (24px)
    this._panelBg.lineStyle(0);
    this._panelBg.beginFill(redBorder);
    this._panelBg.drawRect(0, 0, 24, h);
    this._panelBg.endFill();

    this._infoContainer.addChild(this._panelBg);

    // 2. Text Elements Container
    this._textContainer = new PIXI.Container();
    this._textContainer.x = 34;
    this._infoContainer.addChild(this._textContainer);
};

//-----------------------------------------------------------------------------
// Command Window
//-----------------------------------------------------------------------------

CY_Scene_CharacterPick.prototype.createCommandWindow = function () {
    var baseW = 460;
    var baseH = 80;

    // Scale size
    var w = Math.max(350, baseW * this._uiScale);
    var h = Math.max(60, baseH * this._uiScale);

    var margin = 40; // * this._uiScale;
    var x = Graphics.width - w - margin;
    var y = Graphics.height - h - 20; // 20 fixed margin or scaled?

    // Create window
    this._commandWindow = new CY_Window_CharPickActions(x, y, w, h);

    this._commandWindow.setHandler('ok', this.onCommandOk.bind(this));
    this._commandWindow.setHandler('cancel', this.popScene.bind(this));

    this._commandWindow.activate();
    this.addWindow(this._commandWindow);
};

CY_Scene_CharacterPick.prototype.onCommandOk = function () {
    var index = this._commandWindow.index();
    if (index === 0) {
        // PREV
        this.onPrev();
    } else if (index === 1) {
        // SELECT
        this.onSelect();
    } else {
        // NEXT
        this.onNext();
    }
};

CY_Scene_CharacterPick.prototype.onPrev = function () {
    this._currentIndex = (this._currentIndex - 1 + this._characters.length) % this._characters.length;
    this.refreshInfo();
    this._commandWindow.activate();
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
        DataManager.setupNewGame();
        SceneManager.goto(Scene_Map);
    } else {
        this.onNext();
    }
};

//-----------------------------------------------------------------------------
// Content Refresh
//-----------------------------------------------------------------------------

// Helper methods to find Spine Data
CY_Scene_CharacterPick.prototype.checkSpineData = function (char) {
    // Deprecated / Unused wrapper for safety
    return null;
};

CY_Scene_CharacterPick.prototype.setSpine = function (spineData, preferredAnim) {
    // Deprecated / Unused wrapper
};

CY_Scene_CharacterPick.prototype.refreshInfo = function () {
    var char = this._characters[this._currentIndex];

    // 0. Update Debug Border (Ensure it exists for visibility check)
    // if (!this._debugRect) {
    //     this._debugRect = new PIXI.Graphics();
    //     this.addChild(this._debugRect);
    // }
    // this._debugRect.clear();
    // this._debugRect.lineStyle(2, 0x00FF00, 1);
    // this._debugRect.drawRect(this._charArea.x, this._charArea.y, this._charArea.w, this._charArea.h);


    // --- SPINE INTEGRATION ---
    var spineKey = char.spine;

    // Auto-map if not explicit? (Optional, based on user request for "raw use")
    if (!spineKey && char.image === "spineboy-pro") spineKey = "spineboy-pro";

    var spineSuccess = false;

    if (spineKey) {
        console.log("Attempting Spine: " + spineKey + " anim: " + char.anim);
        spineSuccess = this._spineAvatar.setSpine(spineKey, char.anim || 'idle', this._charArea.w, this._charArea.h);
    } else {
        // Clear if no spine requested
        this._spineAvatar.setSpine(null);
    }

    if (spineSuccess) {
        this._characterSprite.visible = false;
        this._spineAvatar.visible = true;
    } else {
        this._spineAvatar.visible = false;
        this._characterSprite.visible = true;

        // 1. Update Image & Scale (Original Logic)
        this._characterSprite.bitmap = ImageManager.loadPicture(char.image);

        this._characterSprite.bitmap.addLoadListener(() => {
            var w = this._characterSprite.bitmap.width;
            var h = this._characterSprite.bitmap.height;
            var maxW = this._charArea.w;
            var maxH = this._charArea.h;
            var scale = Math.min(maxW / w, maxH / h);
            this._characterSprite.scale.set(scale, scale);
        });
    }

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

    // Backstory Section
    y += 10;

    // Separator
    var divY2 = y;
    var gfx2 = new PIXI.Graphics();
    gfx2.lineStyle(1, 0x441618);
    gfx2.moveTo(0, divY2);
    gfx2.lineTo(panelW - 20, divY2);
    this._textContainer.addChild(gfx2);

    y += 20;

    // Backstory Title
    this.addText("BACKSTORY", 0, y, 14, 0x882222);
    y += 24;

    // Backstory Text
    var backstory = "A former corporate netrunner who went rogue after the Silicon V crash. Specializes in rapid ICE breaking and combat support protocols.";

    var styleDesc = {
        fontFamily: "GameFont",
        fontSize: 16,
        fill: 0x55CCFF,
        align: "left",
        wordWrap: true,
        wordWrapWidth: panelW - 40
    };
    var desc = new PIXI.Text(backstory, styleDesc);
    desc.x = 0;
    desc.y = y;
    this._textContainer.addChild(desc);
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
