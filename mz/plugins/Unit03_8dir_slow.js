//=============================================================================
// menu_windows_override.js v1.0
//=============================================================================

//-----------------------------------------------------------------------------
// Window_Base
//
// The superclass of all windows within the game.
/*:
 * @target MZ
 * @plugindesc 斜め移動時の移動速度を低減させる、0.8倍速
 * @author Unit03
 *
 * @help
 * @param DiagonalSlow
 * @desc Custom
 * @default false
 * @type boolean
 */


(() => {
  "use strict";

    var paramDiagonalSlow  = true;

    Game_CharacterBase.prototype.isMovingDiagonal = function() {
        return this._realX !== this._x && this._realY !== this._y;
    };

    var _Game_CharacterBase_distancePerFrame      = Game_CharacterBase.prototype.distancePerFrame;
    Game_CharacterBase.prototype.distancePerFrame = function() {
        return _Game_CharacterBase_distancePerFrame.apply(this, arguments) *
            (paramDiagonalSlow && this.isMovingDiagonal() ? 0.8 : 1);


    };



//動作コード

})();