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

