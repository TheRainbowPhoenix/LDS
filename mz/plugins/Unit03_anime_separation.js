//=============================================================================
// menu_animeseparation.js v1.0
//=============================================================================

//-----------------------------------------------------------------------------
// Window_Base
//
// The superclass of all windows within the game.
/*:
 * @target MZ
 * @plugindesc アニメーションの色調変化分離
 * @author unit01
 *
 * @help アニメーションの色調変化分離
 * 
 */


(() => {
  'use strict';
  const _createTilemap = Spriteset_Map.prototype.createTilemap;
  Spriteset_Map.prototype.createTilemap = function() {
    _createTilemap.call(this);
    this._effectsLayer = new Sprite();
    this._effectsLayer.z = 8;
    this.addChild(this._effectsLayer);
    this._effectsContainer = this._effectsLayer;
  };
})();