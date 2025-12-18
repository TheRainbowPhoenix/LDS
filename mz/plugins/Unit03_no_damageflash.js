/*:
* @target MZ
* @plugindesc スリップダメージの画面フラッシュ除去、指定アニメーションの再生
* @author PB
*
* @help
*/

(() => {
  "use strict";

//実行コードを書き込む
Game_Actor.prototype.performMapDamage = function() {
    if (!$gameParty.inBattle()) {

      if($gameActors.actor(1).isStateAffected(8)){
     //   $gameScreen.startFlashForDamage();
          $gameTemp.requestAnimation([$gamePlayer], 193, false);
      }else {
     //   $gameScreen.startFlashForDamage();
          $gameTemp.requestAnimation([$gamePlayer], 192, false);
      }

    }
};


})();