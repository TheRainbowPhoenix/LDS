//=============================================================================
// menu_randomactor.js v1.0
//=============================================================================

//-----------------------------------------------------------------------------
// Window_Base
//
// The superclass of all windows within the game.
/*:
 * @target MZ
 * @plugindesc 味方ランダム行動化
 * @author PB
 *
 * @help
 * 
 */

(() => {
  "use strict";



Game_Action.prototype.evaluate = function() {
  return Math.random();
};




//動作コード

})();