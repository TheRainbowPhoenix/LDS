//===============================================================================
// MKR_ControlCharacterEx.js
//===============================================================================
// Copyright (c) 2016 マンカインド
// This software is released under the MIT License.
// http://opensource.org/licenses/mit-license.php
// ------------------------------------------------------------------------------
// Version
// 1.2.1 2018/10/18 制御文字「\n」「\p」の名前表示に
//                  名前となる文字列の途中まで表示できる機能を追加。
//
// 1.2.0 2017/07/19 制御文字「\im[n]」を追加、文中アイコンの余白を指定可能に。
//
// 1.1.4 2016/10/16 制御文字「\me[n]」を追加、文中でMEを再生可能に。
//
// 1.1.3 2016/08/24 ・制御文字「\$」で表示される
//                    所持金ウィンドウの位置を変更可能に。
//                  ・上記対応のためプラグインパラメーター追加。
//
// 1.1.2 2016/08/24 制御文字「\$[n]」を追加。
//
// 1.1.1 2016/08/17 制御文字「\n」「\p」の表示に「\c」の色を自動で付与可能に。
//
// 1.1.0 2016/07/27 制御文字「\.」「\|」のウェイト時間を指定可能に。
//
// 1.0.1 2016/07/22 一部制御文字が動作しなくなるバグを修正。
//
// 1.0.0 2016/07/21 初版公開。
// ------------------------------------------------------------------------------
// [Twitter] https://twitter.com/mankind_games/
//  [GitHub] https://github.com/mankindGames/
//    [Blog] http://mankind-games.blogspot.jp/
//===============================================================================

/*:
 * ==============================================================================
 * @target MZ
 * @plugindesc (v1.2.1) 制御文字拡張プラグイン
 * @author マンカインド
 *
 * @help = 制御文字拡張プラグイン =
 * MKR_ControlCharacterEx.js
 *
 * メッセージ内で利用可能な制御文字を追加/拡張します。
 *
 *
 *   \n[X] (\n[X,Y])
 *     ・メッセージ中に挿入すると、アクターID:Xの名前に置き換わる制御文字です。
 *       本プラグインでは、名前の部分に自動的に色をつけて表示します。
 *       (つまり、\c[2]\n[X]\c[0] のように制御文字\cで囲むのと同じ状態ですが、
 *        この制御文字の記述を\n[X]単体で済ますことができます)
 *
 *       つける色はプラグインパラメーターで指定できます。
 *
 *       この制御文字の直前に色変更の制御文字が記述されていた場合は、
 *       本プラグインによる色変更を行わず、直前に記述されている
 *       色変更の制御文字に従い色が変更されます。
 *
 *       [X,Y]と指定されている場合、アクターID:Xの名前を
 *       最初からY文字目まで切り取った文字列を表示します。
 *       例)
 *         \n[1] = ハロルド
 *         \n[1,2] = ハロ
 *
 *   \p[X] (\p[X,Y])
 *     ・メッセージ中に挿入すると、パーティーメンバーX番目の
 *       アクターの名前に置き換わる制御文字です。
 *       本プラグインでは、自動的に名前の部分に色をつけて表示します。
 *       (つまり、\c[2]\p[X]\c[0] のように制御文字\cで囲むのと同じ状態ですが、
 *        この制御文字の記述を\p[X]単体で済ますことができます)
 *
 *       つける色はプラグインパラメーターで指定できます。
 *
 *       この制御文字の直前に色変更の制御文字が記述されていた場合は、
 *       本プラグインによる色変更を行わず、直前に記述されている
 *       色変更の制御文字に従い色が変更されます。
 *
 *       [X,Y]と指定されている場合、パーティーメンバーX番目の名前を
 *       最初からY文字目まで切り取った文字列を表示します。
 *       例)
 *         \n[1] = マーシャ
 *         \n[1,2] = マー
 *
 *
 *
 * 補足：
 *   ・このプラグインに関するメモ欄の設定、プラグインコマンド、
 *     制御文字は大文字/小文字を区別していません。
 *     ですが、SEファイル名を指定する部分は念のため実際のファイル名と
 *     名前を合せておくことを推奨します。
 *
 *   ・プラグインパラメーターの説明に、[初期値]と書かれているものは
 *     一部の制御文字にて個別設定が可能です。
 *     設定した場合、[初期値]より制御文字の設定が
 *     優先されますのでご注意ください。
 *
 *   ・プラグインパラメーターの説明に、[変数可]と書かれているものは
 *     設定値に変数の制御文字である\v[n]を使用可能です。
 *     変数を設定した場合、そのパラメーターの利用時に変数の値を
 *     参照するため、パラメーターの設定をゲーム中に変更できます。
 *
 *
 * 利用規約:
 *    ・作者に無断で本プラグインの改変、再配布が可能です。
 *      (ただしヘッダーの著作権表示部分は残してください。)
 *
 *    ・利用形態(フリーゲーム、商用ゲーム、R-18作品等)に制限はありません。
 *      ご自由にお使いください。
 *
 *    ・本プラグインを使用したことにより発生した問題について作者は一切の責任を
 *      負いません。
 *
 *    ・要望などがある場合、本プラグインのバージョンアップを行う
 *      可能性がありますが、
 *      バージョンアップにより本プラグインの仕様が変更される可能性があります。
 *      ご了承ください。
 *
 * ==============================================================================
 * @param Default_Name_Color
 * @desc [変数可] 制御文字 \N[n] または \P[n] 使用時に名前部分につける色の番号です。番号でつく色は制御文字 \C[n] を参考にしてください。
 * @type string
 * @default 0
 *
 * ==============================================================================
*/

var Imported = Imported || {};
Imported.MKR_ControlCharacterEx = true;

(function () {
    'use strict';

    var PN = "MKR_ControlCharacterEx";

    var CheckParam = function(type, param, def, min, max) {
        var Parameters, regExp, value;
        Parameters = PluginManager.parameters(PN);

        if(arguments.length < 4) {
            min = -Infinity;
            max = Infinity;
        }
        if(arguments.length < 5) {
            max = Infinity;
        }
        if(param in Parameters) {
            value = String(Parameters[param]);
        } else {
            throw new Error("[CheckParam] プラグインパラメーターがありません: " + param);
        }

        value = value.replace(/\\/g, '\x1b');
        value = value.replace(/\x1b\x1b/g, '\\');

        regExp = /(\x1bV|\x1bN)\[\d+\]/i;
        if(!regExp.test(value)) {
            switch(type) {
                case "num":
                    if(value == "") {
                        value = (isFinite(def))? parseInt(def, 10) : 0;
                    } else {
                        value = (isFinite(value))? parseInt(value, 10) : (isFinite(def))? parseInt(def, 10) : 0;
                        value = value.clamp(min, max);
                    }
                    break;
                case "string":
                    value = value;
                    break;
                default:
                    throw new Error("[CheckParam] " + param + "のタイプが不正です: " + type);
                    break;
            }
        }

        return [value, type, def, min, max, param];
    };

    var CEC = function(params) {
        var text, value, type, def, min, max, param;
        type = params[1];
        text = String(params[0]);
        text = text.replace(/\\/g, '\x1b');
        text = text.replace(/\x1b\x1b/g, '\\');
        type = params[1];
        def = params[2];
        min = params[3];
        max = params[4];
        param = params[5];

        text = text.replace(/\x1bV\[\d+\]/i, function() {
            return String(ConvVb(text));
        }.bind(this));

        switch(type) {
            case "num":
                value = (isFinite(text))? parseInt(text, 10) : (isFinite(def))? parseInt(def, 10) : 0;
                value = value.clamp(min, max);
                break;
            case "string":
                if(text == "") {
                    value = (def != "")? def : value;
                } else {
                    value = text;
                }
                break;
            default:
                throw new Error("[CEC] " + param + "のタイプが不正です: " + type);
                break;
        }

        return value;
    };

    var ConvVb = function(text) {
        var num;

        if(typeof text == "string") {
            text = text.replace(/\x1bV\[(\d+)\]/i, function() {
                num = parseInt(arguments[1]);
                return $gameVariables.value(num);
            }.bind(this));
            text = text.replace(/\x1bV\[(\d+)\]/i, function() {
                num = parseInt(arguments[1]);
                return $gameVariables.value(num);
            }.bind(this));
        }

        return text;
    };

    var DefNameColor;
    DefNameColor = CheckParam("num", "Default_Name_Color", 0, 0);
    //=========================================================================
    // Window_Base
    //  制御文字を追加定義します。
    //
    //=========================================================================

    var _Window_Base_convertEscapeCharacters = Window_Base.prototype.convertEscapeCharacters;
    Window_Base.prototype.convertEscapeCharacters = function(text) {
        var name, nameColor;
        nameColor = CEC(DefNameColor);

        text = text.replace(/\\/g, '\x1b');
        text = text.replace(/\x1b\x1b/g, '\\');

        text = text.replace(/\x1bC\[(\d+)\]\x1bN\[([\d,]+)\]/gi, function() {
            name = this.sliceName(arguments[2], "Actor");
            return '\x1bC['+parseInt(arguments[1])+']'+name+'\x1bC[0]';
        }.bind(this));
        text = text.replace(/\x1bN\[([\d,]+)\]/gi, function() {
            name = this.sliceName(arguments[1], "Actor");
            if(nameColor != 0) {
                return '\x1bC['+nameColor+']'+name+'\x1bC[0]';
            }
            return name != "" ? name : arguments[0];
        }.bind(this));

        text = text.replace(/\x1bC\[(\d+)\]\x1bP\[([\d,]+)\]/gi, function() {
            name = this.sliceName(arguments[2], "Party");
            return '\x1bC['+parseInt(arguments[1])+']'+name+'\x1bC[0]';
        }.bind(this));
        text = text.replace(/\x1bP\[([\d,]+)\]/gi, function() {
            name = this.sliceName(arguments[1], "Party");
            if(nameColor != 0) {
                return '\x1bC['+nameColor+']'+name+'\x1bC[0]';
            }
            return name != "" ? name : arguments[0];
        }.bind(this));

        return _Window_Base_convertEscapeCharacters.call(this,text);
    };


    Window_Base.prototype.sliceName = function(param, type) {
        let arg, num, name, len;
        arg = param.split(",");
        num = 0;
        name = "";

        if(isFinite(arg[0])) {
            num = parseInt(arg[0]);
            name = type == "Actor" ? this.actorName(parseInt(num)) : this.partyMemberName(parseInt(num));
        }
        len = (arg.length > 1 && isFinite(arg[1])) ? parseInt(arg[1]) : name.length;
        if(name != "" && len > 0 && name.length >= len) {
            name = name.slice(0, len);
        }

        return name;
    };

})();