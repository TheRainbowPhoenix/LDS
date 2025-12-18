//=============================================================================
// pausesign.js v1.0
//=============================================================================

//-----------------------------------------------------------------------------
// Window_Base
//
// The superclass of all windows within the game.
/*:
 * @target MZ
 * @plugindesc テキスト送りサインの位置調整
 * @author Unit01
 *
 * @help テキスト送りサインの位置調整
 * 
 */


(() => {
  'use strict';


Window.prototype._refreshPauseSign = function() {
    const sx = 144;
    const sy = 96;
    const p = 24;
    this._pauseSignSprite.bitmap = this._windowskin;
    this._pauseSignSprite.anchor.x = 0.5;
    this._pauseSignSprite.anchor.y = 1;
    this._pauseSignSprite.move(380, this._height);
    this._pauseSignSprite.setFrame(sx, sy, p, p);
    this._pauseSignSprite.alpha = 0;
};




})();