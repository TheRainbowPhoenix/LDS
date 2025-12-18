//=============================================================================
// menu_windows_override.js v1.0
//=============================================================================

//-----------------------------------------------------------------------------
// Window_Base
//
// The superclass of all windows within the game.
/*:
 * @target MZ
 * @plugindesc 商品の売却価額を1/5に変更
 * @author Unit03
 *
 * @help
 * 
 */

(() => {
  "use strict";



Scene_Shop.prototype.sellingPrice = function() {
return Math.floor(this._item.price / 5);
};


//動作コード

})();