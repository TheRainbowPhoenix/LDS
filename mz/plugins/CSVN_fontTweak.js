/*:ja
 * @target MZ
 * @plugindesc 数字以外のフォントにも数字用フォントを適用
 * @author cursed_steven
 * @base PluginCommonBase
 * @orderAfter PluginCommonBase
 * @preserve
 *
 * @help
 * RPG Maker MZ - CSVN_fontTweak.ts (transpiled)
 * ----------------------------------------------------------------------------
 * (C)2023 cursed_steven
 * This software is released under the MIT License.
 * http://opensource.org/licenses/mit-license.php
 * ----------------------------------------------------------------------------
 * Version
 * 1.0.0  2023/07/09 初版 (based on CSVN_setMoreNumberFontFace.js)
 * 1.1.0  2024/05/12 公開用に一部修正
 * ----------------------------------------------------------------------------
 * [Twitter]: https://twitter.com/cursed_steven
 *
 * 戦闘中のダメージ表示だけでなく、戦闘以外のシーンの各ウィンドウ中の文字描画
 * 箇所のうち、英数字にすべて数字フォントを適用します。
 *
 * @param outlineWidth
 * @text アウトライン幅
 * @type number
 * @default 3
 */
(() => {
    // src/plugins/CSVN_fontTweak.ts
    var CSVN_fontTweak = {
        params: PluginManagerEx.createParameter(document.currentScript),
        ipcRenderer: null,
    };
    var _Bitmap_initialize_ftw = Bitmap.prototype.initialize;
    Bitmap.prototype.initialize = function (width, height) {
        _Bitmap_initialize_ftw.call(this, width, height);
        this.outlineColor = "rgba(0, 0, 0, 1)";
        this.outlineWidth = CSVN_fontTweak.params.outlineWidth;
    };
    var _Window_Base_drawText_ftw = Window_Base.prototype.drawText;
    Window_Base.prototype.drawText = function (text, x, y, maxWidth, align) {
        this.contents.fontFace = $gameSystem.numberFontFace();
        _Window_Base_drawText_ftw.call(this, text, x, y, maxWidth, align);
    };
    var _Window_Base_flushTextState_ftw = Window_Base.prototype.flushTextState;
    Window_Base.prototype.flushTextState = function (textState) {
        if (
            this.contents.fontFace !== $gameSystem.mainFontFace() &&
            this.contents.fontFace !== $gameSystem.numberFontFace()
        ) {
        } else {
            this.contents.fontFace = $gameSystem.numberFontFace();
        }
        _Window_Base_flushTextState_ftw.call(this, textState);
    };
})();
