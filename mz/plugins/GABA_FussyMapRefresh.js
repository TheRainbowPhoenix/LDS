//=============================================================================
// RPG Maker MZ - Fussy Map Refresh
//=============================================================================

/*:
 * @target MZ
 * @plugindesc Suppress unnecessary map refresh.
 * @author gabacho(Ichiro Meiken)
 * @url https://star-write-dream.com/
 * @base PluginCommonBase
 * @help GABA_FussyMapRefresh.js(ver1.0.1)
 *
 * Overwriting the process of setting variables and switches.
 * Place it at the top of the plugin list.
 *
 * - Main feature
 * When variables, switches, and self-switches are set,
 *  refreshing is skipped if the values ​​do not change.
 *
 * You can change the value without refresh
 * by using the plugin command.
 *
 * - Auxiliary feature: Refresh forced skip
 * Skip refresh while the parameter switch is ON.
 * For debugging.
 * Used to check if refreshing is the cause when the game gets heavy.
 * Refreshing when changing actors or items is also skipped.
 *
 * - [Advanced plugin command] Variable setting (script)
 * The same thing can be done with the event command "Script".
 *
 * ex) plugin command
 * const a = 1;
 * const b = 2;
 * return a + b;
 *
 * ex) event command "Script"
 * const a = 1;
 * const b = 2;
 * $gameVariables._data[X] = a + b;
 *
 * --------------------------
 * Copyright (c) 2022 Gabacho(Ichiro Meiken)
 * Released under the MIT license
 * https://opensource.org/licenses/mit-license.php
 * --------------------------
 *
 * @command calcVarNR
 * @text Set variable
 * @desc Sets a variable without refreshing.
 *
 * @arg variableId
 * @type variable
 * @text Variable
 * @desc Specify a variable id.
 * @default 0
 *
 * @arg mode
 * @type select
 * @text Operation
 * @desc Operation
 * @default =
 *
 * @option =
 * @option +
 * @option -
 * @option *
 * @option /
 * @option %
 *
 * @arg value
 * @type string
 * @text Value
 * @desc Specify a value. Can use \v[X].
 * @default 0
 *
 * @command setSwitchNR
 * @text Switch
 * @desc Sets a switch without refreshing.
 *
 * @arg switchId
 * @type switch
 * @text Switch
 * @desc Specify a switch id.
 * @default 0
 *
 * @arg enabled
 * @type boolean
 * @text Enabled
 * @desc
 * @default true
 *
 * @command setSelfSwitchNR
 * @text Set Self Switch
 * @desc Sets a self switch without refreshing.
 *
 * @arg switchId
 * @type select
 * @text Switch Id
 * @desc
 * @default A
 *
 * @option A
 * @value A
 * @option B
 * @value B
 * @option C
 * @value C
 * @option D
 * @value D
 *
 * @arg enabled
 * @type boolean
 * @text Value
 * @desc
 * @default true
 *
 * @command refresh
 * @text Execute refresh
 * @desc Force a refresh, ignoring skip states.
 *
 * @param skipSwitch
 * @text Forced skip switch
 * @type switch
 * @desc Forces refresh to be skipped while this switch is ON.
 * @default 0
 *
 * @command setVarNR
 * @text Variable setting (script)
 * @desc Set variable without refresh.
 *
 * @arg variableId
 * @type variable
 * @text Variable id
 * @desc Specifies a variable id.
 * @default 0
 *
 * @arg scriptString
 * @type multiline_string
 * @text Script
 * @desc Enter script. Please "return" the value you want to set to the variable.
 *
 * @command setSelfVarNR
 * @text Self Variable Manipulation
 * @desc Manipulate self variables without refresh. (Required: TemplateEvent.js)
 *
 * @arg index
 * @text Index
 * @desc The index of the self variable to be manipulated.
 * @default 1
 * @type number
 *
 * @arg type
 * @text Type of Operation
 * @desc Type of Operation.
 * @default 0
 * @type select
 * @option  0 : Set
 * @value 0
 * @option  1 : Add
 * @value 1
 * @option  2 : Subtract
 * @value 2
 * @option  3 : Multiply
 * @value 3
 * @option  4 : Division
 * @value 4
 * @option  5 : Modulo
 * @value 5
 *
 * @arg operand
 * @text Setting value
 * @desc The value to be set in the self variable.
 * @default 0
 *
 */

/*:ja
 * @target MZ
 * @plugindesc 不要なマップリフレッシュを抑制します。
 * @author ガバチョ（溟犬一六）
 * @url https://star-write-dream.com/
 * @base PluginCommonBase
 * @help GABA_FussyMapRefresh.js(ver1.0.1)
 *
 * ※変数やスイッチを設定する処理を上書きするので、
 *   プラグインリストの上のほうに配置してください。
 *
 * ■機能
 * 変数、スイッチ、セルフスイッチを設定した時、
 * 値が変わらなければリフレッシュ（※）をスキップします。
 *
 * プラグインコマンドを使用することで
 * リフレッシュをスキップしつつ値を変更できます。
 *
 * ※リフレッシュとは？
 *   次の動作を指します。
 *   ・マップイベントの出現条件をチェック
 *   ・コモンイベントの出現条件スイッチをチェック
 *   標準だとマップイベントの出現条件にある項目を設定した時には、
 *   値が変わらなくてもリフレッシュされます。
 *   神経質で負荷が気になる人向けのプラグインです。
 *
 * ■補助機能：リフレッシュ強制スキップ
 * ・パラメータスイッチがONの間、リフレッシュを強制スキップします。
 *   ・デバッグ用です。
 *     ゲームが重くなってしまった時に、
 *     リフレッシュが原因なのかチェックするために使います。
 *     アクターやアイテム変更時のリフレッシュもスキップされます。
 *
 * ■補足：変数設定（スクリプト）
 * ・上級者向け。
 * ・イベントコマンド「スクリプト」でも同じことができます。
 *
 * 例）プラグインコマンド
 * const a = 1;
 * const b = 2;
 * return a + b;
 *
 * 例）スクリプト
 * const a = 1;
 * const b = 2;
 * $gameVariables._data[X] = a + b;
 *
 * --------------------------
 * Copyright (c) 2022 Gabacho(Ichiro Meiken)
 * Released under the MIT license
 * https://opensource.org/licenses/mit-license.php
 * --------------------------
 *
 * @command calcVarNR
 * @text 変数設定
 * @desc リフレッシュなしで変数を設定します。
 *
 * @arg variableId
 * @type variable
 * @text 変数
 * @desc 保存先の変数を指定します。
 * @default 0
 *
 * @arg mode
 * @type select
 * @text 操作
 * @desc 操作を指定します。
 * @default =
 *
 * @option =
 * @option +
 * @option -
 * @option *
 * @option /
 * @option %
 *
 * @arg value
 * @type string
 * @text 数値
 * @desc 値を指定します。\v[X]可。
 * @default 0
 *
 * @command setSwitchNR
 * @text スイッチ設定
 * @desc リフレッシュなしでスイッチを設定します。
 *
 * @arg switchId
 * @type switch
 * @text スイッチ
 * @desc スイッチを指定します。
 * @default 0
 *
 * @arg enabled
 * @type boolean
 * @text 値
 * @desc 値を指定します。
 * @default true
 *
 * @command setSelfSwitchNR
 * @text セルフスイッチ設定
 * @desc リフレッシュなしでセルフスイッチを設定します。
 *
 * @arg switchId
 * @type select
 * @text Switch Id
 * @desc キーを指定します。
 * @default A
 *
 * @option A
 * @value A
 * @option B
 * @value B
 * @option C
 * @value C
 * @option D
 * @value D
 *
 * @arg enabled
 * @type boolean
 * @text 値
 * @desc 値を指定します。
 * @default true
 *
 * @command refresh
 * @text リフレッシュする
 * @desc スキップ状態を無視して、強制的にリフレッシュします。
 *
 * @param skipSwitch
 * @text 強制スキップスイッチ
 * @type switch
 * @desc 機能を有効にするスイッチを指定します。
 * @default 0
 *
 * @command setVarNR
 * @text 変数設定（スクリプト）
 * @desc リフレッシュなしで変数を設定します。
 *
 * @arg variableId
 * @type variable
 * @text 変数
 * @desc 変数を指定します。
 * @default 0
 *
 * @arg scriptString
 * @type multiline_string
 * @text スクリプト
 * @desc スクリプトを記入します。変数に設定したい値をreturnしてください。
 *
 * @command setSelfVarNR
 * @text セルフ変数の操作
 * @desc リフレッシュなしでセルフ変数を操作します。（必須：TemplateEvent.js）
 *
 * @arg index
 * @text キー
 * @desc 操作対象のセルフ変数のキーです。数値や文字列を指定できます。文字列を指定した場合、大文字小文字は区別されます。
 * @default 1
 *
 * @arg type
 * @text 操作種別
 * @desc 操作種別です。
 * @default 0
 * @type select
 * @option  0 : 代入
 * @value 0
 * @option  1 : 加算
 * @value 1
 * @option  2 : 減算
 * @value 2
 * @option  3 : 乗算
 * @value 3
 * @option  4 : 除算
 * @value 4
 * @option  5 : 剰余
 * @value 5
 *
 * @arg operand
 * @text 設定値
 * @desc セルフ変数に設定する値です。
 * @default 0
 *
 *
 */

(() => {
    "use strict";
    const pluginName = "GABA_FussyMapRefresh";

    const script = document.currentScript;
    const param = PluginManagerEx.createParameter(script);

    const skipSwitch = param.skipSwitch || 0;

    // -------------
    // プラグインコマンド

    // リフレッシュ実行
    PluginManagerEx.registerCommand(script, "refresh", function (args) {
        $gameMap._needsRefresh = true;
    });

    // スイッチ設定
    PluginManagerEx.registerCommand(script, "setSwitchNR", function (args) {
        const id = args.switchId;
        if (id === 0) return;

        $gameSwitches._data[id] = !!args.enabled;
    });

    // セルフスイッチ設定
    PluginManagerEx.registerCommand(script, "setSelfSwitchNR", function (args) {
        const character = this.character(0);
        if (!character) return;

        const key = [this._mapId, character._eventId, args.switchId];
        $gameSelfSwitches._data[key] = !!args.enabled;
    });

    //変数設定
    PluginManagerEx.registerCommand(script, "calcVarNR", function (args) {
        if (args.variableId === 0) return;
        const oldValue = $gameVariables._data[args.variableId] == null ? 0 : $gameVariables._data[args.variableId];

        switch (args.mode) {
            case "=":
                $gameVariables._data[args.variableId] = args.value;
                break;
            case "+":
                $gameVariables._data[args.variableId] = oldValue + args.value;
                break;
            case "-":
                $gameVariables._data[args.variableId] = oldValue - args.value;
                break;
            case "*":
                $gameVariables._data[args.variableId] = oldValue * args.value;
                break;
            case "/":
                $gameVariables._data[args.variableId] = oldValue / args.value;
                break;
            case "%":
                $gameVariables._data[args.variableId] = oldValue % args.value;
                break;
        }
    });

    //変数設定（スクリプト）
    PluginManagerEx.registerCommand(script, "setVarNR", function (args) {
        if (args.variableId === 0) return;

        try {
            const func = new Function("'use strict'; return (()=>{" + args.scriptString + "})()").bind(this);
            $gameVariables._data[args.variableId] = func();
        } catch (e) {
            console.log(`${pluginName}_SetVariable_Script ERROR.`);
            console.log(e);
        }
    });

    // 変数の設定処理を上書き
    const _Game_Variables_setValue = Game_Variables.prototype.setValue;
    Game_Variables.prototype.setValue = function (variableId, value) {
        if (this._data[variableId] === value) return;
        _Game_Variables_setValue.apply(this, arguments);
    };

    // スイッチ設定処理を上書き
    const _Game_Switches_setValue = Game_Switches.prototype.setValue;
    Game_Switches.prototype.setValue = function (switchId, value) {
        if (!!this._data[switchId] === value) return;
        _Game_Switches_setValue.apply(this, arguments);
    };

    // セルフスイッチ設定処理を上書き
    const _Game_SelfSwitches_setValue = Game_SelfSwitches.prototype.setValue;
    Game_SelfSwitches.prototype.setValue = function (key, value) {
        if (!!this._data[key] === value) return;
        _Game_SelfSwitches_setValue.apply(this, arguments);
    };

    // リクエスト処理の変更
    const _Game_Map_requestRefresh = Game_Map.prototype.requestRefresh;
    Game_Map.prototype.requestRefresh = function () {
        if ($gameSwitches.value(skipSwitch)) {
            return;
        }
        _Game_Map_requestRefresh.apply(this, arguments);
    };

    // ------------------------------
    // セルフ変数（TemplateEvent.js）

    PluginManagerEx.registerCommand(script, "setSelfVarNR", function (args) {
        const index = args.index;
        const type = args.type;
        const operand = args.operand;
        this.controlSelfVariableNR(index, type, operand, false);
    });

    Game_Interpreter.prototype.controlSelfVariableNR = function (index, type, operand, formulaFlg) {
        const character = this.character(0);
        if (!character) return;

        const key = character.getSelfVariableKey(index);
        if (!key) return;

        character.operateSelfVariableNR(key, type, formulaFlg ? eval(operand) : operand);
    };

    Game_Event.prototype.operateSelfVariableNR = function (key, operationType, value) {
        let oldValue = $gameSelfSwitches.getVariableValue(key);
        let newValue = 0;
        switch (operationType) {
            case 0: // Set
                newValue = oldValue;
                break;
            case 1: // Add
                newValue = oldValue + value;
                break;
            case 2: // Sub
                newValue = oldValue - value;
                break;
            case 3: // Mul
                newValue = oldValue * value;
                break;
            case 4: // Div
                newValue = oldValue / value;
                break;
            case 5: // Mod
                newValue = oldValue % value;
                break;
        }

        if (newValue !== undefined && newValue !== 0) {
            $gameSelfSwitches._variableData[key] = newValue;
        } else {
            delete gameSelfSwitches._variableData[key];
        }
    };
})();
