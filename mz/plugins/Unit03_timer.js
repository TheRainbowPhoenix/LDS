/*:
* @target MZ
* @plugindesc タイマー位置の変更
* @author PB
*
* @help
* 
* @param paraX
* @text x座標
* @type number
* @desc x座標
* @param paraY
* @text ｙ座標
* @type number
* @desc y座標
*/
(() => {
'use strict';
const pluginName = document.currentScript.src.split("/").pop().replace(/\.js$/, "");
const parameters = PluginManager.parameters(pluginName);
const newX = parameters['paraX'];
const newY = parameters['paraY'];
Sprite_Timer.prototype.updatePosition = function () {
this.x = newX;
this.y = newY;
};

})();