//=============================================================================
// menu_windows_override.js v1.0
//=============================================================================

//-----------------------------------------------------------------------------
// Window_Base
//
// The superclass of all windows within the game.
/*:
 * @target MZ
 * @plugindesc カスタムメニューで上書き
 * @author PB
 *
 * @help
 * 
 */

(() => {
  "use strict";



Scene_Map.prototype.callMenu = function() {
   SoundManager.playOk();
     SceneManager.callCustomMenu( "Scene_ActorList" ); // オーバーライド
     $gameTemp.clearDestination();
     this._mapNameWindow.hide();
     this._waitCount = 2;
    };


//動作コード

})();