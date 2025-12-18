/*:
* @target MZ
* @plugindesc オートセーブシステム
* @author PB
*
* @help
* 
*/
(() => {
'use strict';

Scene_Map.prototype.shouldAutosave = function() {
   //return !this._lastMapWasNull;
   return false;
};

})();