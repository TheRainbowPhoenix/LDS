//=============================================================================
// CY_Window_Base.js
//=============================================================================

/*:
 * @plugindesc Cyberpunk UI Mod - Base Window Class
 * @author Cyberpunk UI Mod
 *
 * @help
 * CY_Window_Base - Base window class with Cyberpunk styling.
 * Extends Window_Base from RPG Maker with custom visual elements:
 * - Semi-transparent black background
 * - Cut corner (45-degree angle) on bottom-right
 * - No default RPG Maker window frame
 * - Custom color scheme using CY_System.Colors
 *
 * This plugin requires CY_System.js to be loaded first.
 *
 * Requirements fulfilled:
 * - 2.1: Extends Window_Base from RPG Maker
 * - 2.2: Semi-transparent black background using CY_System.Colors.backgroundBlack
 * - 2.3: Bottom-right corner cut at 45-degree angle
 * - 2.4: Does not display default RPG Maker window frame
 * - 2.5: Supports all standard RPG Maker window operations
 */

//-----------------------------------------------------------------------------
// CY_Window_Base
//
// The base window class with Cyberpunk styling. Extends Window_Base.
//-----------------------------------------------------------------------------

function CY_Window_Base() {
    this.initialize.apply(this, arguments);
}

CY_Window_Base.prototype = Object.create(Window_Base.prototype);
CY_Window_Base.prototype.constructor = CY_Window_Base;

/**
 * Initialize the Cyberpunk-styled window.
 * @param {number} x - X position of the window
 * @param {number} y - Y position of the window
 * @param {number} width - Width of the window
 * @param {number} height - Height of the window
 */
CY_Window_Base.prototype.initialize = function(x, y, width, height) {
    this._cyBackSprite = null;
    Window_Base.prototype.initialize.call(this, x, y, width, height);
    this.createCyBackground();
};

/**
 * Override: Don't load default windowskin.
 * We use custom drawing instead of the standard RPG Maker window skin.
 * Requirement 2.4: Does not display default RPG Maker window frame
 */
CY_Window_Base.prototype.loadWindowskin = function() {
    // No-op: We use custom drawing instead of windowskin
    // Still create an empty windowskin to prevent errors from methods that expect it
    this._windowskin = new Bitmap(1, 1);
};

/**
 * Override: Hide default window frame.
 * Requirement 2.4: Does not display default RPG Maker window frame
 */
CY_Window_Base.prototype._refreshFrame = function() {
    // No-op: Custom background handles the frame
    // Clear the frame sprite to ensure nothing is displayed
    if (this._windowFrameSprite && this._windowFrameSprite.bitmap) {
        this._windowFrameSprite.bitmap.clear();
    }
};

/**
 * Override: Hide default window back.
 * Requirement 2.4: Does not display default RPG Maker window frame
 */
CY_Window_Base.prototype._refreshBack = function() {
    // No-op: Custom background handles this
    // Clear the back sprite to ensure nothing is displayed
    if (this._windowBackSprite && this._windowBackSprite.bitmap) {
        this._windowBackSprite.bitmap.clear();
    }
};

/**
 * Create custom background sprite with cut corner.
 * Requirement 2.2: Semi-transparent black background
 * Requirement 2.3: Bottom-right corner cut at 45-degree angle
 */
CY_Window_Base.prototype.createCyBackground = function() {
    // Create the background sprite if it doesn't exist
    if (!this._cyBackSprite) {
        this._cyBackSprite = new Sprite();
        this._cyBackSprite.bitmap = new Bitmap(this.width, this.height);
        // Add at index 0 to be behind all other content
        this.addChildAt(this._cyBackSprite, 0);
    }
    this.refreshCyBackground();
};

/**
 * Refresh the custom Cyberpunk background.
 * Draws a semi-transparent black rectangle with cut bottom-right corner.
 */
CY_Window_Base.prototype.refreshCyBackground = function() {
    if (!this._cyBackSprite) return;
    
    const bmp = this._cyBackSprite.bitmap;
    
    // Resize bitmap if window size changed
    if (bmp.width !== this.width || bmp.height !== this.height) {
        bmp.resize(this.width, this.height);
    }
    
    bmp.clear();
    
    // Draw the cut corner rectangle with semi-transparent black background
    // Requirement 2.2: Uses CY_System.Colors.backgroundBlack
    // Requirement 2.3: Uses CY_System.drawCutCornerRect for 45-degree cut
    CY_System.drawCutCornerRect(
        bmp, 
        0, 
        0, 
        this.width, 
        this.height, 
        CY_System.Colors.backgroundBlack
    );
};

/**
 * Override: Return Cyberpunk white color for normal text.
 * Uses CY_System.Colors.white instead of windowskin color.
 * @returns {string} The normal text color
 */
CY_Window_Base.prototype.normalColor = function() {
    return CY_System.Colors.white;
};

/**
 * Override: Return Cyberpunk cyan color for system text.
 * Uses CY_System.Colors.cyan instead of windowskin color.
 * @returns {string} The system text color
 */
CY_Window_Base.prototype.systemColor = function() {
    return CY_System.Colors.cyan;
};

/**
 * Override: Return Cyberpunk light red for crisis color.
 * @returns {string} The crisis color
 */
CY_Window_Base.prototype.crisisColor = function() {
    return CY_System.Colors.lightRed;
};

/**
 * Override: Return Cyberpunk dark red for death color.
 * @returns {string} The death color
 */
CY_Window_Base.prototype.deathColor = function() {
    return CY_System.Colors.darkRed;
};

/**
 * Override: Return inactive text color for gauge background.
 * @returns {string} The gauge background color
 */
CY_Window_Base.prototype.gaugeBackColor = function() {
    return CY_System.Colors.inactiveText;
};

/**
 * Override move to refresh background when window is resized.
 * Requirement 2.5: Supports all standard RPG Maker window operations
 * @param {number} x - X position
 * @param {number} y - Y position
 * @param {number} width - Width
 * @param {number} height - Height
 */
CY_Window_Base.prototype.move = function(x, y, width, height) {
    Window_Base.prototype.move.call(this, x, y, width, height);
    // Refresh background after resize
    if (this._cyBackSprite) {
        this.refreshCyBackground();
    }
};

/**
 * Override update to ensure background stays in sync.
 * Requirement 2.5: Supports all standard RPG Maker window operations
 */
CY_Window_Base.prototype.update = function() {
    Window_Base.prototype.update.call(this);
    // Update background visibility based on window openness
    if (this._cyBackSprite) {
        this._cyBackSprite.visible = this.isOpen();
        this._cyBackSprite.alpha = this.openness / 255;
    }
};

/**
 * Override destroy to clean up custom sprites.
 * @param {object} options - Destroy options
 */
CY_Window_Base.prototype.destroy = function(options) {
    if (this._cyBackSprite) {
        if (this._cyBackSprite.bitmap) {
            this._cyBackSprite.bitmap.destroy();
        }
        this._cyBackSprite.destroy();
        this._cyBackSprite = null;
    }
    Window_Base.prototype.destroy.call(this, options);
};

