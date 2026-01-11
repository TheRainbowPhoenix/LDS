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
    this.createSideStripe();
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
// Side Stripe Creation
//-----------------------------------------------------------------------------

/**
 * Create the vertical dark red stripe on the left side.
 * This is a decorative element that spans the full height of the screen.
 * Features: scanlines, left/right borders, inner box shadow effect.
 */
CY_Scene_Title.prototype.createSideStripe = function() {
    var stripeWidth = 320;
    var stripeX = 60;
    var stripeHeight = Graphics.height;
    
    this._sideStripeSprite = new Sprite();
    this._sideStripeSprite.bitmap = new Bitmap(stripeWidth, stripeHeight);
    
    var bmp = this._sideStripeSprite.bitmap;
    var ctx = bmp._context;
    
    // Base fill with semi-transparent dark red
    bmp.fillRect(0, 0, stripeWidth, stripeHeight, 'rgba(132, 38, 36, 0.37)');
    
    // Draw inner box shadow effect (darker at edges, lighter in center)
    this.drawInnerBoxShadow(ctx, stripeWidth, stripeHeight);
    
    // Draw scanlines effect
    this.drawScanlines(ctx, stripeWidth, stripeHeight);
    
    // Draw left and right borders
    var borderWidth = 2;
    var borderColor = 'rgba(255, 97, 88, 0.6)'; // #FF6158 with opacity
    bmp.fillRect(0, 0, borderWidth, stripeHeight, borderColor);
    bmp.fillRect(stripeWidth - borderWidth, 0, borderWidth, stripeHeight, borderColor);
    
    bmp._baseTexture.update();
    
    this._sideStripeSprite.x = stripeX;
    this._sideStripeSprite.y = 0;
    
    this.addChild(this._sideStripeSprite);
};

/**
 * Draw inner box shadow effect on the stripe.
 * Creates depth by darkening left and right edges only.
 * @param {CanvasRenderingContext2D} ctx - Canvas context
 * @param {number} width - Width of the stripe
 * @param {number} height - Height of the stripe
 */
CY_Scene_Title.prototype.drawInnerBoxShadow = function(ctx, width, height) {
    var shadowColor = 'rgba(132, 38, 36, 0.5)'; // #842624 with opacity
    var shadowSize = 40;
    
    // Extend beyond top and bottom to hide those shadows
    var extendY = -100;
    var extendedHeight = height + 200;
    
    ctx.save();
    
    // Left edge shadow (gradient from dark to transparent)
    var leftGradient = ctx.createLinearGradient(0, 0, shadowSize, 0);
    leftGradient.addColorStop(0, shadowColor);
    leftGradient.addColorStop(1, 'rgba(132, 38, 36, 0)');
    ctx.fillStyle = leftGradient;
    ctx.fillRect(0, extendY, shadowSize, extendedHeight);
    
    // Right edge shadow
    var rightGradient = ctx.createLinearGradient(width - shadowSize, 0, width, 0);
    rightGradient.addColorStop(0, 'rgba(132, 38, 36, 0)');
    rightGradient.addColorStop(1, shadowColor);
    ctx.fillStyle = rightGradient;
    ctx.fillRect(width - shadowSize, extendY, shadowSize, extendedHeight);
    
    ctx.restore();
};

/**
 * Draw scanlines effect on the stripe.
 * Creates horizontal lines with varying opacity for CRT/cyberpunk feel.
 * @param {CanvasRenderingContext2D} ctx - Canvas context
 * @param {number} width - Width of the stripe
 * @param {number} height - Height of the stripe
 */
CY_Scene_Title.prototype.drawScanlines = function(ctx, width, height) {
    ctx.save();
    
    var lineHeight = 2;
    var gap = 2;
    var baseColor = [132, 38, 36]; // #842624 RGB
    
    for (var y = 0; y < height; y += lineHeight + gap) {
        // Vary opacity for more organic look
        var opacityVariation = 0.08 + Math.random() * 0.12; // 0.08 to 0.20
        ctx.fillStyle = 'rgba(' + baseColor[0] + ',' + baseColor[1] + ',' + baseColor[2] + ',' + opacityVariation + ')';
        ctx.fillRect(0, y, width, lineHeight);
    }
    
    ctx.restore();
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
