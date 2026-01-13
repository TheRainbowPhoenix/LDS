//=============================================================================
// CY_Main.js
//=============================================================================


if (typeof globalThis === 'undefined') {
    var globalThis = window;
}

const CY_Main = {};
globalThis.CY_Main = CY_Main;

// let parameters = window.parameters || undefined;

CY_Main.Parameters = {
    enableCyberpunkTitle: parameters ? parameters['enableCyberpunkTitle'] !== 'false' : true,
    enableCyberpunkOptions: parameters ? parameters['enableCyberpunkOptions'] === 'true' : false,
    titleLogoX: parameters ?  Number(parameters['titleLogoX'] || 80) : 80,
    titleLogoY: parameters ? Number(parameters['titleLogoY'] || -150) : -150,
    commandWindowX: parameters ? Number(parameters['commandWindowX'] || 80) : 80
};

//=========================================================================
// Scene_Title Override
// Requirement 10.1, 10.2, 10.3: Override without modifying core files
//=========================================================================

if (CY_Main.Parameters.enableCyberpunkTitle) {
    /**
     * Store reference to original Scene_Title for fallback
     */
    const _Original_Scene_Title = Scene_Title;
    
    /**
     * Override Scene_Title constructor to use CY_Scene_Title
     * This replaces the default title screen with the Cyberpunk version
     */
    Scene_Title = function() {
        this.initialize.apply(this, arguments);
    };
    
    // Copy prototype from CY_Scene_Title
    Scene_Title.prototype = Object.create(CY_Scene_Title.prototype);
    Scene_Title.prototype.constructor = Scene_Title;
    
    /**
     * Initialize using CY_Scene_Title's initialization
     */
    Scene_Title.prototype.initialize = function() {
        CY_Scene_Title.prototype.initialize.call(this);
    };
    
    // Copy all methods from CY_Scene_Title to Scene_Title
    Object.keys(CY_Scene_Title.prototype).forEach(function(method) {
        Scene_Title.prototype[method] = CY_Scene_Title.prototype[method];
    });
    
    /**
     * Apply custom positioning from plugin parameters
     */
    const _CY_Scene_Title_createLogo = Scene_Title.prototype.createLogo;
    Scene_Title.prototype.createLogo = function() {
        _CY_Scene_Title_createLogo.call(this);
        // Apply custom positioning from parameters
        this._logoSprite.x = CY_Main.Parameters.titleLogoX;
        this._logoSprite.y = Math.floor(Graphics.boxHeight / 2) + CY_Main.Parameters.titleLogoY;
    };
    
    const _CY_Scene_Title_createCommandWindow = Scene_Title.prototype.createCommandWindow;
    Scene_Title.prototype.createCommandWindow = function() {
        _CY_Scene_Title_createCommandWindow.call(this);
        // Apply custom positioning from parameters
        this._commandWindow.x = CY_Main.Parameters.commandWindowX;
    };
}

//=========================================================================
// Scene_Options Override
// Requirement 10.1, 10.2, 10.3: Override without modifying core files
//=========================================================================

if (CY_Main.Parameters.enableCyberpunkOptions) {
    /**
     * Store reference to original Scene_Options for fallback
     */
    const _Original_Scene_Options = Scene_Options;
    
    /**
     * Override Scene_Options constructor to use CY_Scene_Options
     * This replaces the default options menu with the Cyberpunk version
     */
    Scene_Options = function() {
        this.initialize.apply(this, arguments);
    };
    
    // Copy prototype from CY_Scene_Options
    Scene_Options.prototype = Object.create(CY_Scene_Options.prototype);
    Scene_Options.prototype.constructor = Scene_Options;
    
    /**
     * Initialize using CY_Scene_Options's initialization
     */
    Scene_Options.prototype.initialize = function() {
        CY_Scene_Options.prototype.initialize.call(this);
    };
    
    // Copy all methods from CY_Scene_Options to Scene_Options
    Object.keys(CY_Scene_Options.prototype).forEach(function(method) {
        Scene_Options.prototype[method] = CY_Scene_Options.prototype[method];
    });
}

//=========================================================================
// Expose CY_Main globally for other plugins to access parameters
//=========================================================================

globalThis.CY_Main = CY_Main;

CY_Main.makeTextSprite = function(text, x, y, w, h, opt) {
  opt = opt || {};
  w = w || 200;
  h = h || 48;

  var spr = new Sprite(new Bitmap(w, h));
  spr.x = x || 0;
  spr.y = y || 0;

  var bmp = spr.bitmap;
  bmp.fontFace = opt.fontFace || 'GameFont';
  bmp.fontSize = opt.fontSize || 20;
  bmp.textColor = opt.textColor || '#ffffff';
  bmp.outlineColor = opt.outlineColor || 'rgba(0,0,0,0.6)';
  bmp.outlineWidth = opt.outlineWidth != null ? opt.outlineWidth : 4;

  bmp.clear();
  bmp.drawText(text, 0, 0, w, h, opt.align || 'left');

  // store a redraw method for later updates
  spr.setText = function(newText) {
    bmp.clear();
    bmp.drawText(newText, 0, 0, w, h, opt.align || 'left');
  };

  return spr;
}
