/*:
* @target MZ
* @plugindesc レオタードダメージのためのヒット確認
* @help
* レオタードダメージのためのヒット確認
*/
(() => {
  'use strict';

  const IS_HIT_SWITCH = 500;
  function Game_Action_IsHitMixIn(gameAction) {
    const _apply = gameAction.apply;
    gameAction.apply = function (target) {
      _apply.call(this, target);
      $gameSwitches.setValue(IS_HIT_SWITCH, target.result().isHit());
    }
  }

  Game_Action_IsHitMixIn(Game_Action.prototype);
})();