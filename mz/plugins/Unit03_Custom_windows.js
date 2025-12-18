//=============================================================================
// PB_windows.js v1.0
//=============================================================================

//-----------------------------------------------------------------------------
// Window_Base
//
// The superclass of all windows within the game.
/*:
 * @target MZ
 * @plugindesc バトルメッセージ背景透過
 * @author PB
 *
 * @help バトルメッセージを透過する
 * 
 */

(() => {
  "use strict";

Window_BattleLog.prototype.backPaintOpacity = function() {
    return 0;
};

//動作コード

})();