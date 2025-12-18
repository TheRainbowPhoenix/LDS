//=============================================================================
// MPP_EquipStatusEX.js
//=============================================================================
// Copyright (c) 2018-2023 Mokusei Penguin
// Released under the MIT license
// http://opensource.org/licenses/mit-license.php
//=============================================================================

/*:
 * @target MZ
 * @plugindesc Change the display of equipment status.
 * @author Mokusei Penguin
 * @url 
 *
 * @help [version 4.1.0]
 * - This plugin is for RPG Maker MZ.
 * - Change the display of equipment status.
 * 
 * ▼ Weapon/armor notes
 *  〇 <mppEqSt:name1, name2, ...>
 *   - Displays the original parameter name in the status window when
 *     changing equipment.
 *       example: If you equip an item with an 
 *                  <mppEqSt:half flame,half ice>
 *                [half fire] and [half ice] will be displayed.
 *  
 * ▼ Plugin parameter details
 *  〇 Status
 *   [default]  : Status displayed while selecting an equipment slot.
 *   [fixed]    : Status always displayed while selecting item after change.
 *   [included] : Status displayed when the changed item is selected and
 *                included in equipment.
 *   [changed]  : When selecting a modified item, the status displayed
 *                when there are changes.
 *  
 *   - The values to be set are as follows.
 *  
 *     0:Max HP,   1:Max MP,    2:Attack,  3:Defense,
 *     4:M.Attack, 5:M.Defense, 6:Agility, 7:Luck,
 *  
 *    10:Hit Rate,         11:Evasion Rate,    12:Critical Rate,
 *    13:Critical Evasion, 14:Magic Evasion,   15:Magic Reflection,
 *    16:Counter Attack,   17:HP Regeneration, 18:MP Regeneration,
 *    19:TP Regeneration,
 *  
 *    20:Target Rate,  21:Guard Effect,   22:Recovery Effect, 23:Pharmacology,
 *    24:MP Cost Rate, 25:TP Charge Rate, 26:Physical Damage, 27:Magic Damage,
 *    28:Floor Damage, 29:Experience
 * 
 *  〇 Rate
 *   - If [Reverse?] is enabled, the displayed number will be
 *       (1 - Rate) * 100
 *     (Example: 20 for Rate 80%, 70 for Rate 30%)
 *   - This is a function to display as [Resistance] instead of [Rate].
 *  
 *  〇 Array of plugin parameters
 *   - When setting numerical values in an array, you can specify numerical values
 *     from N to M by notating N-M.
 *         example: 1-4,8,10-12
 * 
 * ================================
 * Mail : wood_penguin＠yahoo.co.jp (＠ is half-width)
 * Blog : http://woodpenguin.blog.fc2.com/
 * License : MIT license
 *
 *  @param Gauge Height
 *      @desc 
 *      @type number
 *          @min 1
 *          @max 28
 *      @default 8
 * 
 *  @param Gauge Color
 *      @desc Current value gauge color
 *      @default 232,255,255
 * 
 *  @param Gauge Shadow Color
 *      @desc 
 *      @default 32,32,64
 * 
 *  @param Gauge Type
 *      @desc 
 *      @type select
 *          @option flat
 *              @value flat
 *          @option archarch
 *              @value arch
 *          @option 2-line
 *              @value 2-line
 *          @default flat
 * 
 *  @param Gauge Slope
 *      @desc Specify from -10 to 10 / 0 for no slope
 *      @type number
 *          @min -10
 *          @max 10
 *      @default -5
 * 
 *  @param Max Param Gauge
 *      @desc 
 *      @type struct<MaxParams>
 *      @default {"mhp":"10000","mmp":"2000","atk":"250","def":"250","mat":"250","mdf":"250","agi":"500","luk":"500","xparam":"2.5","sparam":"2.5","rate":"2.5"}
 * 
 *  @param -----Contents
 * 
 *  @param Params List
 *      @desc
 *      @type struct<ParamsList>
 *      @default {"default":"2-7","fixed":"","included":"0-7,10-19,20-29","changed":"0-7,10-19,20-29"}
 *      @parent -----Contents
 * 
 *  @param Rate Reverse?
 *      @desc Function to display as [resistance] instead of [rate]
 *      @type boolean
 *      @default false
 *      @parent -----Contents
 * 
 *  @param Element Rate:Ids
 *      @desc
 *      @default 1-9
 *      @parent -----Contents
 * 
 *  @param Element Rate:Type
 *      @desc 
 *      @type select
 *          @option Included
 *              @value Included
 *          @option Changed
 *              @value Changed
 *          @option Included or Changed
 *              @value Included or Changed
 *      @default Included or Changed
 *      @parent Element Rate:Ids
 * 
 *  @param Debuff Rate:Params
 *      @desc
 *      @default 0-7
 *      @parent -----Contents
 * 
 *  @param Debuff Rate:Type
 *      @desc
 *      @type select
 *          @option Included
 *              @value Included
 *          @option Changed
 *              @value Changed
 *          @option Included or Changed
 *              @value Included or Changed
 *      @default Included or Changed
 *      @parent Debuff Rate:Params
 * 
 *  @param State Rate:Ids
 *      @desc
 *      @default 1-13
 *      @parent -----Contents
 * 
 *  @param State Rate:Type
 *      @desc
 *      @type select
 *          @option Included
 *              @value Included
 *          @option Changed
 *              @value Changed
 *          @option Included or Changed
 *              @value Included or Changed
 *      @default Included or Changed
 *      @parent State Rate:Ids
 * 
 *  @param State Resist:Ids
 *      @desc
 *      @default 1-13
 *      @parent -----Contents
 * 
 *  @param State Resist:Type
 *      @desc
 *      @type select
 *          @option Included
 *              @value Included
 *          @option Changed
 *              @value Changed
 *          @option Included or Changed
 *              @value Included or Changed
 *      @default Changed
 *      @parent State Resist:Ids
 * 
 *  @param Original Trait Type
 *      @desc 
 *      @type select
 *          @option Included
 *              @value Included
 *          @option Changed
 *              @value Changed
 *          @option Included or Changed
 *              @value Included or Changed
 *      @default Included or Changed
 *      @parent -----Contents
 * 
 *  @param -----Terms
 * 
 *  @param Terms Xparams
 *      @desc 
 *      @type struct<xparams>
 *      @default {"hit":"Hit Rate","eva":"Evasion Rate","cri":"Critical Rate","cev":"Critical Evasion","mev":"Magic Evasion","mrf":"Magic Reflection","cnt":"Counter Attack","hrg":"HP Regeneration","mrg":"MP Regeneration","trg":"TP Regeneration"}
 *      @parent -----Terms
 * 
 *  @param Terms Sparams
 *      @desc
 *      @type struct<sparams>
 *      @default {"tgr":"Target Rate","grd":"Guard Effect","rec":"Recovery Effect","pha":"Pharmacology","mcr":"MP Cost Rate","tcr":"TP Charge Rate","pdr":"Physical Damage","mdr":"Magic Damage","fdr":"Floor Damage","exr":"Experience"}
 *      @parent -----Terms
 * 
 *  @param Terms Element Rate
 *      @desc %1:Element name
 *      @default %1 rate
 *      @parent -----Terms
 * 
 *  @param Terms Debuff Rate
 *      @desc %1:Parameter name
 *      @default %1 down rate
 *      @parent -----Terms
 * 
 *  @param Terms State Rate
 *      @desc %1:State name
 *      @default %1 rate
 *      @parent -----Terms
 * 
 *  @param Terms State Resist
 *      @desc %1:State name
 *      @default %1 resist
 *      @parent -----Terms
 * 
 */

/*~struct~MaxParams:
 *  @param mhp
 *      @text Max HP
 *      @desc
 *      @type number
 *          @min 1
 *          @max 20000
 *      @default 10000
 *
 *  @param mmp
 *      @text Max MP
 *      @desc
 *      @type number
 *          @min 1
 *          @max 20000
 *      @default 2000
 * 
 *  @param atk
 *      @text Attack
 *      @desc
 *      @type number
 *          @min 1
 *          @max 2000
 *      @default 250
 * 
 *  @param def
 *      @text Defense
 *      @desc
 *      @type number
 *          @min 1
 *          @max 2000
 *      @default 250
 * 
 *  @param mat
 *      @text M.Attack
 *      @desc
 *      @type number
 *          @min 1
 *          @max 2000
 *      @default 250
 * 
 *  @param mdf
 *      @text M.Defense
 *      @desc
 *      @type number
 *          @min 1
 *          @max 2000
 *      @default 250
 *
 *  @param agi
 *      @text Agility
 *      @desc
 *      @type number
 *          @min 1
 *          @max 2000
 *      @default 500
 * 
 *  @param luk
 *      @text Luck
 *      @desc
 *      @type number
 *          @min 1
 *          @max 2000
 *      @default 500
 *
 *  @param xparam
 *      @text Ex-Parameter
 *      @desc 
 *      @type number
 *          @min 1
 *          @max 10
 *          @decimals 1
 *      @default 2.5
 * 
 *  @param sparam
 *      @text Sp-Parameter
 *      @desc 
 *      @type number
 *          @min 1
 *          @max 10
 *          @decimals 1
 *      @default 2.5
 * 
 *  @param rate
 *      @text Rate
 *      @desc Element Rate & Debuff Rate & State Rate
 *      @type number
 *          @min 1
 *          @max 10
 *          @decimals 1
 *      @default 2.5
 * 
 */

/*~struct~ParamsList:
 *  @param default
 *      @desc Status displayed while selecting an equipment slot
 *      @default 2-7
 * 
 *  @param fixed
 *      @desc Status always displayed while selecting item after change
 *      @default 
 * 
 *  @param included
 *      @desc Status displayed when the changed item is selected and included in equipment
 *      @default 0-7,10-19,20-29
 * 
 *  @param changed
 *      @desc Status displayed when there is a change while selecting the changed item
 *      @default 0-7,10-19,20-29
 * 
 */

/*~struct~xparams:
 *  @param hit
 *      @desc
 *      @default Hit Rate
 *
 *  @param eva
 *      @desc
 *      @default Evasion Rate
 * 
 *  @param cri
 *      @desc
 *      @default Critical Rate
 * 
 *  @param cev
 *      @desc
 *      @default Critical Evasion
 * 
 *  @param mev
 *      @desc
 *      @default Magic Evasion
 * 
 *  @param mrf
 *      @desc
 *      @default Magic Reflection
 *
 *  @param cnt
 *      @desc
 *      @default Counter Attack
 * 
 *  @param hrg
 *      @desc
 *      @default HP Regeneration
 *
 *  @param mrg
 *      @desc
 *      @default MP Regeneration
 *
 *  @param trg
 *      @desc
 *      @default TP Regeneration
 *
 */

/*~struct~sparams:
 *  @param tgr
 *      @desc
 *      @default Target Rate
 *
 *  @param grd
 *      @desc
 *      @default Guard Effect
 * 
 *  @param rec
 *      @desc
 *      @default Recovery Effect
 * 
 *  @param pha
 *      @desc
 *      @default Pharmacology
 * 
 *  @param mcr
 *      @desc
 *      @default MP Cost Rate
 * 
 *  @param tcr
 *      @desc
 *      @default TP Charge Rate
 * 
 *  @param pdr
 *      @desc
 *      @default Physical Damage
 *
 *  @param mdr
 *      @desc
 *      @default Magic Damage
 * 
 *  @param fdr
 *      @desc
 *      @default Floor Damage
 *
 *  @param exr
 *      @desc
 *      @default Experience
 *
 */

/*:ja
 * @target MZ
 * @plugindesc 装備ステータスの表示内容を変更します。
 * @author 木星ペンギン
 * @url 
 *
 * @help [version 4.1.0]
 * - このプラグインはRPGツクールMZ用です。
 * - 装備ステータスの表示内容を変更します。
 * 
 * ▼ 武器・防具のメモ
 *  〇 <mppEqSt:name1, name2, ...>
 *   - 装備変更時のステータスウィンドウにオリジナルのパラメータ名を表示させます。
 *       例: <mppEqSt:炎半減,氷半減> と記述したアイテムを装備した場合、
 *           [炎半減]と[氷半減]が表示されます。
 *  
 * ▼ プラグインパラメータ詳細
 *  〇 Status (能力値)
 *   [通常ステータス] : 装備スロット選択中に表示されるステータス
 *   [固定ステータス] : 変更後のアイテムを選択中、常に表示されるステータス
 *   [装備ステータス] : 変更後のアイテムを選択中、
 *                      装備品に含まれる場合に表示されるステータス
 *   [変動ステータス] : 変更後のアイテムを選択中、
 *                      変更がある場合に表示されるステータス
 *  
 *   - 設定する数値は以下の通りです。
 *  
 *     0:最大ＨＰ, 1:最大ＭＰ, 2:攻撃力, 3:防御力,
 *     4:魔法力,   5:魔法防御, 6:敏捷性, 7:運,
 *  
 *    10:命中率,     11:回避率,     12:会心率, 13:会心回避率,
 *    14:魔法回避率, 15:魔法反射率, 16:反撃率, 17:ＨＰ再生率,
 *    18:ＭＰ再生率, 19:ＴＰ再生率,
 *  
 *    20:狙われ率,   21:防御効果率,     22:回復効果率,   23:薬の知識,
 *    24:ＭＰ消費率, 25:ＴＰチャージ率, 26:物理ダメージ, 27:魔法ダメージ,
 *    28:床ダメージ, 29:経験獲得率
 * 
 *  〇 Rate (耐性)
 *   - Reverse?(反転表示)を有効にした場合、表示される数値が
 *       (1 - 有効度)*100
 *     となります。
 *     (例：有効度80%の場合は20、有効度30%の場合は70)
 *   - これは[有効度]ではなく[耐性値]として表示するための機能です。
 *  
 *  〇 プラグインパラメータの配列
 *   - 数値を配列で設定する際、n-m と表記することでnからmまでの数値を
 *     指定できます。
 *         例 : 1-4,8,10-12
 * 
 * ================================
 * Mail : wood_penguin＠yahoo.co.jp (＠は半角)
 * Blog : http://woodpenguin.blog.fc2.com/
 * License : MIT license
 *
 *  @param Gauge Height
 *      @text ゲージの高さ
 *      @desc 
 *      @type number
 *          @min 1
 *          @max 28
 *      @default 8
 * 
 *  @param Gauge Color
 *      @text ゲージの色
 *      @desc 現在値のゲージ色
 *      @default 232,255,255
 * 
 *  @param Gauge Shadow Color
 *      @text ゲージの影の色
 *      @desc 
 *      @default 32,32,64
 * 
 *  @param Gauge Type
 *      @text ゲージタイプ
 *      @desc 
 *      @type select
 *          @option 通常
 *              @value flat
 *          @option 丸み
 *              @value arch
 *          @option 2ライン
 *              @value 2-line
 *          @default flat
 * 
 *  @param Gauge Slope
 *      @text ゲージの傾き
 *      @desc -10～10で指定 / 0で傾きなし
 *      @type number
 *          @min -10
 *          @max 10
 *      @default -5
 * 
 *  @param Max Param Gauge
 *      @text 通常能力値ゲージの最大値
 *      @desc 
 *      @type struct<MaxParams>
 *      @default {"mhp":"10000","mmp":"2000","atk":"250","def":"250","mat":"250","mdf":"250","agi":"500","luk":"500","xparam":"2.5","sparam":"2.5","rate":"2.5"}
 * 
 *  @param -----Contents
 *      @text -----描写内容
 * 
 *  @param Params List
 *      @text 基本パラメータ
 *      @desc
 *      @type struct<ParamsList>
 *      @default {"default":"2-7","fixed":"","included":"0-7,10-19,20-29","changed":"0-7,10-19,20-29"}
 *      @parent -----Contents
 * 
 *  @param Rate Reverse?
 *      @text 有効度の反転表示
 *      @desc [有効度]ではなく[耐性値]として表示するための機能
 * 例: 有効度80%の場合は耐性値20、有効度150%の場合は耐性値-50
 *      @type boolean
 *      @default false
 *      @parent -----Contents
 * 
 *  @param Element Rate:Ids
 *      @text 属性有効度:表示ID
 *      @desc
 *      @default 1-9
 *      @parent -----Contents
 * 
 *  @param Element Rate:Type
 *      @text 属性有効度:表示タイプ
 *      @desc 装備:装備品に含まれる場合に表示されるステータス
 * 変動:変化がある場合に表示されるステータス
 *      @type select
 *          @option 装備
 *              @value Included
 *          @option 変動
 *              @value Changed
 *          @option 装備or変動
 *              @value Included or Changed
 *      @default Included or Changed
 *      @parent Element Rate:Ids
 * 
 *  @param Debuff Rate:Params
 *      @text 弱体有効度:表示能力値
 *      @desc
 *      @default 0-7
 *      @parent -----Contents
 * 
 *  @param Debuff Rate:Type
 *      @text 弱体有効度:表示タイプ
 *      @desc 装備:装備品に含まれる場合に表示されるステータス
 * 変動:変化がある場合に表示されるステータス
 *      @type select
 *          @option 装備
 *              @value Included
 *          @option 変動
 *              @value Changed
 *          @option 装備or変動
 *              @value Included or Changed
 *      @default Included or Changed
 *      @parent Debuff Rate:Params
 * 
 *  @param State Rate:Ids
 *      @text ステート有効度:表示ID
 *      @desc
 *      @default 1-13
 *      @parent -----Contents
 * 
 *  @param State Rate:Type
 *      @text ステート有効度:表示タイプ
 *      @desc 装備:装備品に含まれる場合に表示されるステータス
 * 変動:変化がある場合に表示されるステータス
 *      @type select
 *          @option 装備
 *              @value Included
 *          @option 変動
 *              @value Changed
 *          @option 装備or変動
 *              @value Included or Changed
 *      @default Included or Changed
 *      @parent State Rate:Ids
 * 
 *  @param State Resist:Ids
 *      @text ステート無効化:表示ID
 *      @desc
 *      @default 1-13
 *      @parent -----Contents
 * 
 *  @param State Resist:Type
 *      @text ステート無効化:表示タイプ
 *      @desc 装備:装備品に含まれる場合に表示されるステータス
 * 変動:変化がある場合に表示されるステータス
 *      @type select
 *          @option 装備
 *              @value Included
 *          @option 変動
 *              @value Changed
 *          @option 装備or変動
 *              @value Included or Changed
 *      @default Changed
 *      @parent State Resist:Ids
 * 
 *  @param Original Trait Type
 *      @text オリジナル特徴:表示タイプ
 *      @desc 装備:装備品に含まれる場合に表示されるステータス
 * 変動:変化がある場合に表示されるステータス
 *      @type select
 *          @option 装備
 *              @value Included
 *          @option 変動
 *              @value Changed
 *          @option 装備or変動
 *              @value Included or Changed
 *      @default Included or Changed
 *      @parent -----Contents
 * 
 *  @param -----Terms
 *      @text -----用語
 * 
 *  @param Terms Xparams
 *      @text 追加能力値
 *      @desc 
 *      @type struct<xparams>
 *      @default {"hit":"命中率","eva":"回避率","cri":"会心率","cev":"会心回避率","mev":"魔法回避率","mrf":"魔法反射率","cnt":"反撃率","hrg":"ＨＰ再生率","mrg":"ＭＰ再生率","trg":"ＴＰ再生率"}
 *      @parent -----Terms
 * 
 *  @param Terms Sparams
 *      @text 特殊能力値
 *      @desc
 *      @type struct<sparams>
 *      @default {"tgr":"狙われ率","grd":"防御効果率","rec":"回復効果率","pha":"薬の知識","mcr":"ＭＰ消費率","tcr":"ＴＰチャージ率","pdr":"物理ダメージ率","mdr":"魔法ダメージ率","fdr":"床ダメージ率","exr":"経験獲得率"}
 *      @parent -----Terms
 * 
 *  @param Terms Element Rate
 *      @text 属性有効度
 *      @desc %1:属性名
 *      @default %1有効度
 *      @parent -----Terms
 * 
 *  @param Terms Debuff Rate
 *      @text 弱体有効度
 *      @desc %1:能力値名
 *      @default %1ダウン有効度
 *      @parent -----Terms
 * 
 *  @param Terms State Rate
 *      @text ステート有効度
 *      @desc %1:ステート名
 *      @default %1有効度
 *      @parent -----Terms
 * 
 *  @param Terms State Resist
 *      @text ステート無効化
 *      @desc %1:ステート名
 *      @default %1無効化
 *      @parent -----Terms
 * 
 */

/*~struct~MaxParams:ja
 *  @param mhp
 *      @text 最大ＨＰ
 *      @desc
 *      @type number
 *          @min 1
 *          @max 20000
 *      @default 10000
 *
 *  @param mmp
 *      @text 最大ＭＰ
 *      @desc
 *      @type number
 *          @min 1
 *          @max 20000
 *      @default 2000
 * 
 *  @param atk
 *      @text 攻撃力
 *      @desc
 *      @type number
 *          @min 1
 *          @max 2000
 *      @default 250
 * 
 *  @param def
 *      @text 防御力
 *      @desc
 *      @type number
 *          @min 1
 *          @max 2000
 *      @default 250
 * 
 *  @param mat
 *      @text 魔法力
 *      @desc
 *      @type number
 *          @min 1
 *          @max 2000
 *      @default 250
 * 
 *  @param mdf
 *      @text 魔法防御
 *      @desc
 *      @type number
 *          @min 1
 *          @max 2000
 *      @default 250
 *
 *  @param agi
 *      @text 敏捷性
 *      @desc
 *      @type number
 *          @min 1
 *          @max 2000
 *      @default 500
 * 
 *  @param luk
 *      @text 運
 *      @desc
 *      @type number
 *          @min 1
 *          @max 2000
 *      @default 500
 *
 *  @param xparam
 *      @text 追加能力値
 *      @desc 
 *      @type number
 *          @min 1
 *          @max 10
 *          @decimals 1
 *      @default 2.5
 * 
 *  @param sparam
 *      @text 特殊能力値
 *      @desc 
 *      @type number
 *          @min 1
 *          @max 10
 *          @decimals 1
 *      @default 2.5
 * 
 *  @param rate
 *      @text 有効度
 *      @desc 属性有効度、弱体有効度、ステート有効度
 *      @type number
 *          @min 1
 *          @max 10
 *          @decimals 1
 *      @default 2.5
 * 
 */

/*~struct~ParamsList:ja
 *  @param default
 *      @text 通常
 *      @desc 装備スロット選択中に表示されるステータス
 *      @default 2-7
 * 
 *  @param fixed
 *      @text 固定
 *      @desc 変更後のアイテムを選択中、常に表示されるステータス
 *      @default 
 * 
 *  @param included
 *      @text 装備
 *      @desc 変更後のアイテムを選択中、装備品に含まれる場合に表示されるステータス
 *      @default 0-7,10-19,20-29
 * 
 *  @param changed
 *      @text 変動
 *      @desc 変更後のアイテムを選択中、変化がある場合に表示されるステータス
 *      @default 0-7,10-19,20-29
 * 
 */

/*~struct~xparams:ja
 *  @param hit
 *      @text 命中率
 *      @desc
 *      @default 命中率
 *
 *  @param eva
 *      @text 回避率
 *      @desc
 *      @default 回避率
 * 
 *  @param cri
 *      @text 会心率
 *      @desc
 *      @default 会心率
 * 
 *  @param cev
 *      @text 会心回避率
 *      @desc
 *      @default 会心回避率
 * 
 *  @param mev
 *      @text 魔法回避率
 *      @desc
 *      @default 魔法回避率
 * 
 *  @param mrf
 *      @text 魔法反射率
 *      @desc
 *      @default 魔法反射率
 *
 *  @param cnt
 *      @text 反撃率
 *      @desc
 *      @default 反撃率
 * 
 *  @param hrg
 *      @text ＨＰ再生率
 *      @desc
 *      @default ＨＰ再生率
 *
 *  @param mrg
 *      @text ＭＰ再生率
 *      @desc
 *      @default ＭＰ再生率
 *
 *  @param trg
 *      @text ＴＰ再生率
 *      @desc
 *      @default ＴＰ再生率
 *
 */

/*~struct~sparams:ja
 *  @param tgr
 *      @text 狙われ率
 *      @desc
 *      @default 狙われ率
 *
 *  @param grd
 *      @text 防御効果率
 *      @desc
 *      @default 防御効果率
 * 
 *  @param rec
 *      @text 回復効果率
 *      @desc
 *      @default 回復効果率
 * 
 *  @param pha
 *      @text 薬の知識
 *      @desc
 *      @default 薬の知識
 * 
 *  @param mcr
 *      @text ＭＰ消費率
 *      @desc
 *      @default ＭＰ消費率
 * 
 *  @param tcr
 *      @text ＴＰチャージ率
 *      @desc
 *      @default ＴＰチャージ率
 * 
 *  @param pdr
 *      @text 物理ダメージ率
 *      @desc
 *      @default 物理ダメージ率
 *
 *  @param mdr
 *      @text 魔法ダメージ率
 *      @desc
 *      @default 魔法ダメージ率
 * 
 *  @param fdr
 *      @text 床ダメージ率
 *      @desc
 *      @default 床ダメージ率
 *
 *  @param exr
 *      @text 経験獲得率
 *      @desc
 *      @default 経験獲得率
 *
 */

(() => {
    'use strict';

    const pluginName = 'MPP_EquipStatusEX';

    // Plugin Parameters
    const parameters = PluginManager.parameters(pluginName);
    const paramReviver = (key, value) => {
        try {
            return JSON.parse(value, paramReviver);
        } catch (e) {
            return value;
        }
    };
    const range = function*(start, end) {
        for (let i = start; i < end; i++) {
            yield i;
        }
    };
    const convertToArray = (param) => {
        return param.split(',').reduce((r, item) => {
            if (item) {
                const match = /(\d+)-(\d+)/.exec(item);
                if (match) {
                    r.push(...range(+match[1], +match[2] + 1));
                } else {
                    r.push(+item);
                }
            }
            return r;
        }, []);
    };
    const param_GaugeHeight = Number(parameters['Gauge Height'] || 8);
    const param_GaugeColor = `rgb(${parameters['Gauge Color'] || '224,255,255'})`;
    const param_GaugeShadowColor = `rgb(${parameters['Gauge Shadow Color'] || '0,0,0'})`;
    const param_GaugeType = parameters['Gauge Type'] || 'flat';
    const param_GaugeSlope = Number(parameters['Gauge Slope'] || 0.5);
    const param_MaxParamGauge = JSON.parse(parameters['Max Param Gauge'] || '{}', paramReviver);

    const param_ParamsList = JSON.parse(parameters['Params List'] || '{}');
    for (const [key, value] of Object.entries(param_ParamsList)) {
        param_ParamsList[key] = convertToArray(value);
    }
    const param_RateReverse = parameters['Rate Reverse?'] === 'true';
    const param_ElementRateIds = convertToArray(parameters['Element Rate:Ids']);
    const param_ElementRateType = parameters['Element Rate:Type'];
    const param_DebuffRateParams = convertToArray(parameters['Debuff Rate:Params']);
    const param_DebuffRateType = parameters['Debuff Rate:Type'];
    const param_StateRateIds = convertToArray(parameters['State Rate:Ids']);
    const param_StateRateType = parameters['State Rate:Type'];
    const param_StateResistIds = convertToArray(parameters['State Resist:Ids']);
    const param_StateResistType = parameters['State Resist:Type'];
    const param_OriginalTraitType = parameters['Original Trait Type'];
    
    const param_TermsXparams = JSON.parse(parameters['Terms Xparams'] || '{}');
    const param_TermsSparams = JSON.parse(parameters['Terms Sparams'] || '{}');
    const param_TermsElementRate = parameters['Terms Element Rate'] || '';
    const param_TermsDebuffRate = parameters['Terms Debuff Rate'] || '';
    const param_TermsStateRate = parameters['Terms State Rate'] || '';
    const param_TermsStateResist = parameters['Terms State Resist'] || '';
    
    const downStrongParams = new Set([24, 26, 27, 28]);
    const paramNames = ['mhp', 'mmp', 'atk', 'def', 'mat', 'mdf', 'agi', 'luk'];
    const xparamNames = ['hit', 'eva', 'cri', 'cev', 'mev', 'mrf', 'cnt', 'hrg', 'mrg', 'trg'];
    const sparamNames = ['tgr', 'grd', 'rec', 'pha', 'mcr', 'tcr', 'pdr', 'mdr', 'fdr', 'exr'];
    
    const array_equals = (ary1, ary2) => {
        return JSON.stringify(ary1) === JSON.stringify(ary2);
    }

    //-------------------------------------------------------------------------
    // Game_BattlerBase

    Game_BattlerBase.prototype.allMetadata = function(name) {
        return this.traitObjects().map(obj => obj.meta[name]).filter(Boolean);
    };

    Game_BattlerBase.prototype.mppOriginalTraits = function() {
        return new Set(this.allMetadata('mppEqSt').map(
            metadata => metadata.split(',')
        ).flat());
    };

    //-------------------------------------------------------------------------
    // Window_EquipItem

    const _Window_EquipItem_updateHelp = Window_EquipItem.prototype.updateHelp;
    Window_EquipItem.prototype.updateHelp = function() {
        if (this._actor && this._statusWindow) {
            this._statusWindow.setNewItem(this.item());
        }
        _Window_EquipItem_updateHelp.apply(this, arguments);
    };

    //-------------------------------------------------------------------------
    // Window_EquipStatus

    const _Window_EquipStatus_setTempActor = Window_EquipStatus.prototype.setTempActor;
    Window_EquipStatus.prototype.setTempActor = function(tempActor) {
        if (
            !this._tempActor ||
            !tempActor ||
            !array_equals(this._tempActor.equips(), tempActor.equips())
        ) {
            _Window_EquipStatus_setTempActor.apply(this, arguments);
        }
    };
    
    Window_EquipStatus.prototype.setNewItem = function(item) {
        this._item = item;
    };

    // overwrite
    Window_EquipStatus.prototype.refresh = function() {
        this.hideAdditionalSprites();
        this.contents.clear();
        if (this._actor) {
            const nameRect = this.itemLineRect(0);
            const y = this.lineHeight();
            this.drawActorName(this._actor, nameRect.x, 0, nameRect.width);
            this.drawParameters(this.itemPadding(), y, this.innerHeight - y);
        }
    };

    Window_EquipStatus.prototype.drawParameters = function(x, y, height) {
        const lineHeight = this.lineHeight();
        const maxRow = Math.floor(height / lineHeight);
        const list = this.makeStatusList().slice(0, maxRow);
        for (let i = 0; i < list.length; i++) {
            this.drawItem(x, y + i * lineHeight, list[i]);
        }
    };

    Window_EquipStatus.prototype.makeStatusList = function() {
        if (this._tempActor) {
            return [
                ...this.equipParamsList(),
                ...this.elementRateList(),
                ...this.debuffRateList(),
                ...this.stateRateList(),
                ...this.stateResistList(),
                ...this.originalTraitList()
            ];
        } else {
            return this.defaultParamsList();
        }
    };

    Window_EquipStatus.prototype.convertList = function(list, type) {
        return list.map(value => ({ type, value }));
    };

    Window_EquipStatus.prototype.equipParamsList = function() {
        const paramSet = new Set([
            ...this.fixParamList(),
            ...this.includeParamList().filter(id => this.includeItemParam(id)),
            ...this.changeParamList().filter(id => this.isChangedParam(id))
        ]);
        const list = [...paramSet].sort((a, b) => a - b);
        return this.convertList(list, 'param');
    };

    Window_EquipStatus.prototype.includeItemParam = function(paramId) {
        if (paramId < 10) {
            if (this._item && this._item.params[paramId] !== 0) {
                return true
            };
            const code = Game_BattlerBase.TRAIT_PARAM;
            return this.includeItemTrait(code, paramId);
        } else if (paramId < 20) {
            const code = Game_BattlerBase.TRAIT_XPARAM;
            return this.includeItemTrait(code, paramId - 10);
        } else {
            const code = Game_BattlerBase.TRAIT_SPARAM;
            return this.includeItemTrait(code, paramId - 20);
        }
    };
    
    Window_EquipStatus.prototype.includeItemTrait = function(code, id) {
        return (
            this._item &&
            this._item.traits.some(t => t.code === code && t.dataId === id)
        );
    };
    
    Window_EquipStatus.prototype.isChangedParam = function(paramId) {
        return (
            this.actorParam(this._actor, paramId) !==
            this.actorParam(this._tempActor, paramId)
        );
    };

    Window_EquipStatus.prototype.actorParam = function(actor, paramId) {
        if (paramId < 10) {
            return actor.param(paramId);
        } else if (paramId < 20) {
            return actor.xparam(paramId - 10);
        } else {
            return actor.sparam(paramId - 20);
        }
    };
    
    Window_EquipStatus.prototype.isChangedRate = function(method, id) {
        return this._actor[method](id) !== this._tempActor[method](id);
    };

    Window_EquipStatus.prototype.elementRateList = function() {
        if (param_TermsElementRate) {
            const type = this.elementRateType();
            const code = Game_BattlerBase.TRAIT_ELEMENT_RATE;
            const list = param_ElementRateIds.filter(
                id => this.includeRate(type, code, 'elementRate', id)
            );
            return this.convertList(list, 'elementRate');
        }
        return [];
    };

    Window_EquipStatus.prototype.includeRate = function(type, code, method, id) {
        switch (type) {
            case 'Fixed':
                return true;
            case 'Included':
                return this.includeItemTrait(code, id);
            case 'Changed':
                return this.isChangedRate(method, id);
            case 'Included or Changed':
                return (
                    this.includeItemTrait(code, id) ||
                    this.isChangedRate(method, id)
                );
            default:
                return false;
        }
    };
    
    Window_EquipStatus.prototype.debuffRateList = function() {
        if (param_TermsDebuffRate) {
            const type = this.debuffRateType();
            const code = Game_BattlerBase.TRAIT_DEBUFF_RATE;
            const list = param_DebuffRateParams.filter(
                id => this.includeRate(type, code, 'debuffRate', id)
            );
            return this.convertList(list, 'debuffRate');
        }
        return [];
    };

    Window_EquipStatus.prototype.stateRateList = function() {
        if (param_TermsStateRate) {
            const type = this.stateRateType();
            const code = Game_BattlerBase.TRAIT_STATE_RATE;
            const list = param_StateRateIds.filter(
                id => this.includeRate(type, code, 'stateRate', id)
            );
            return this.convertList(list, 'stateRate');
        }
        return [];
    };

    Window_EquipStatus.prototype.stateResistList = function() {
        if (param_TermsStateResist) {
            const type = this.stateResistType();
            const code = Game_BattlerBase.TRAIT_STATE_RESIST;
            const list = param_StateResistIds.filter(
                id => this.includeRate(type, code, 'isStateResist', id)
            );
            return this.convertList(list, 'stateResist');
        }
        return [];
    };

    Window_EquipStatus.prototype.originalTraitList = function() {
        const traitSet = new Set();
        const type = this.originalTraitType();
        if (type === 'Included' || type === 'Included or Changed') {
            if (this._item && this._item.meta.mppEqSt) {
                for (const name of this._item.meta.mppEqSt.split(',')) {
                    traitSet.add(name);
                }
            }
        }
        if (type === 'Changed' || type === 'Included or Changed') {
            const changeTraits = this._actor.mppOriginalTraits();
            for (const name of this._tempActor.mppOriginalTraits()) {
                changeTraits.delete(name);
            }
            for (const name of changeTraits) {
                traitSet.add(name);
            }
        }
        return this.convertList([...traitSet], 'original');
    };

    Window_EquipStatus.prototype.defaultParamsList = function() {
        return this.convertList(this.defaultStatus(), 'param');
    };

    Window_EquipStatus.prototype.defaultStatus = function() {
        return param_ParamsList.default;
    };

    Window_EquipStatus.prototype.fixParamList = function() {
        return param_ParamsList.fixed;
    };

    Window_EquipStatus.prototype.includeParamList = function() {
        return param_ParamsList.included;
    };

    Window_EquipStatus.prototype.changeParamList = function() {
        return param_ParamsList.changed;
    };

    Window_EquipStatus.prototype.elementRateType = function() {
        return param_ElementRateType;
    };

    Window_EquipStatus.prototype.debuffRateType = function() {
        return param_DebuffRateType;
    };

    Window_EquipStatus.prototype.stateRateType = function() {
        return param_StateRateType;
    };

    Window_EquipStatus.prototype.stateResistType = function() {
        return param_StateResistType;
    };

    Window_EquipStatus.prototype.originalTraitType = function() {
        return param_OriginalTraitType;
    };

    // overwrite
    Window_EquipStatus.prototype.drawItem = function(x, y, data) {
        switch (data.type) {
            case 'param':
                this.drawParam(x, y, data.value);
                break;
            case 'elementRate':
                this.drawElement(x, y, data.value);
                break;
            case 'debuffRate':
                this.drawDebuff(x, y, data.value);
                break;
            case 'stateRate':
                this.drawState(x, y, data.value);
                break;
            case 'stateResist':
                this.drawResist(x, y, data.value);
                return;
            case 'original':
                this.drawOriginal(x, y, data.value);
                return;
        }
    };

    Window_EquipStatus.prototype.drawParam = function(x, y, paramId) {
        const value1 = this._actor ? this.actorParam(this._actor, paramId) : 0;
        const value2 = this._tempActor
            ? this.actorParam(this._tempActor, paramId)
            : value1;
        const max = this.paramMax(paramId);
        const reverse = downStrongParams.has(paramId);
        const paramX = this.paramX();
        const rightArrowWidth = this.rightArrowWidth();
        this.placeEquipGauge(value1, value2, max, reverse, paramX, y + 3);
        this.drawParamName(x, y, paramId);
        if (this._actor) {
            this.drawCurrentParam(paramX, y, paramId);
        }
        if (this._tempActor) {
            const paramX2 = paramX + this.paramWidth();
            this.drawRightArrow(paramX2, y);
            this.drawNewParam(paramX2 + rightArrowWidth, y, paramId, reverse);
        }
    };
    
    Window_StatusBase.prototype.placeEquipGauge = function(
        value1, value2, max, reverse, x, y
    ) {
        const key = `gauge${x}-${y}`;
        const sprite = this.createBackSprite(key, Sprite_EquipGauge);
        sprite.createBitmap(this.innerWidth, 32);
        sprite.setup(value1, value2, max, reverse, x);
        sprite.move(this.padding, y + this.padding);
        sprite.show();
    };
    
    Window_StatusBase.prototype.createBackSprite = function(key, spriteClass) {
        const dict = this._additionalSprites;
        if (key in dict) {
            return dict[key];
        } else {
            const sprite = new spriteClass();
            dict[key] = sprite;
            this.addChildToBack(sprite);
            return sprite;
        }
    };
    
    const _Window_EquipStatus_drawParamName = Window_EquipStatus.prototype.drawParamName;
    Window_EquipStatus.prototype.drawParamName = function(x, y, paramId) {
        if (paramId < 10) {
            _Window_EquipStatus_drawParamName.apply(this, arguments);
        } else if (paramId < 20) {
            const name = param_TermsXparams[xparamNames[paramId - 10]];
            const width = this.paramX() - x - this.itemPadding();
            this.changeTextColor(ColorManager.systemColor());
            this.drawText(name, x, y, width);
        } else {
            const name = param_TermsSparams[sparamNames[paramId - 20]];
            const width = this.paramX() - x - this.itemPadding();
            this.changeTextColor(ColorManager.systemColor());
            this.drawText(name, x, y, width);
        }
    };

    const _Window_EquipStatus_drawCurrentParam = Window_EquipStatus.prototype.drawCurrentParam;
    Window_EquipStatus.prototype.drawCurrentParam = function(x, y, paramId) {
        if (paramId < 10) {
            _Window_EquipStatus_drawCurrentParam.apply(this, arguments);
        } else {
            const p = Math.round(this.actorParam(this._actor, paramId) * 100);
            const paramWidth = this.paramWidth();
            this.resetTextColor();
            this.drawText(p, x, y, paramWidth, 'right');
        }
    };

    const _Window_EquipStatus_drawNewParam = Window_EquipStatus.prototype.drawNewParam;
    Window_EquipStatus.prototype.drawNewParam = function(x, y, paramId, reverse) {
        if (paramId < 10) {
            _Window_EquipStatus_drawNewParam.apply(this, arguments);
        } else {
            const value = this.actorParam(this._tempActor, paramId);
            const paramWidth = this.paramWidth();
            let diffvalue = value - this.actorParam(this._actor, paramId);
            if (reverse) diffvalue *= -1;
            this.changeTextColor(ColorManager.paramchangeTextColor(diffvalue));
            this.drawText(Math.round(value * 100), x, y, paramWidth, 'right');
        }
    };

    Window_EquipStatus.prototype.paramMax = function(paramId) {
        if (paramId < 10) {
            return param_MaxParamGauge[paramNames[paramId]];
        } else if (paramId < 20) {
            return param_MaxParamGauge.xparam;
        } else {
            return param_MaxParamGauge.sparam;
        }
    };

    Window_EquipStatus.prototype.drawElement = function(x, y, id) {
        const name = param_TermsElementRate.format($dataSystem.elements[id]);
        const value1 = this._actor.elementRate(id);
        const value2 = this._tempActor.elementRate(id);
        this.drawRate(x, y, name, value1, value2, param_RateReverse);
    };

    Window_EquipStatus.prototype.drawDebuff = function(x, y, id) {
        const name = param_TermsDebuffRate.format(TextManager.param(id));
        const value1 = this._actor.debuffRate(id);
        const value2 = this._tempActor.debuffRate(id);
        this.drawRate(x, y, name, value1, value2, param_RateReverse);
    };

    Window_EquipStatus.prototype.drawState = function(x, y, id) {
        const name = param_TermsStateRate.format($dataStates[id].name);
        const value1 = this._actor.stateRate(id);
        const value2 = this._tempActor.stateRate(id);
        this.drawRate(x, y, name, value1, value2, param_RateReverse);
    };

    Window_EquipStatus.prototype.drawRate = function(
        x, y, name, value1, value2, reverse
    ) {
        const realValue1 = reverse ? 1 - value1 : value1;
        const realValue2 = reverse ? 1 - value2 : value2;
        const roundValue1 = Math.round(realValue1 * 100);
        const roundValue2 = Math.round(realValue2 * 100);
        const max = param_MaxParamGauge.rate;
        const paramX = this.paramX();
        const paramWidth = this.paramWidth();
        const rightArrowWidth = this.rightArrowWidth();
        const newParamX = paramX + paramWidth + rightArrowWidth;
        this.changeTextColor(this.systemColor());
        this.drawText(name, x, y, 120);
        this.placeEquipGauge(realValue1, realValue2, max, !reverse, paramX, y + 3);
        this.resetTextColor();
        this.drawText(roundValue1, paramX, y, paramWidth, 'right');
        this.drawRightArrow(paramX + paramWidth, y);
        this.changeTextColor(ColorManager.paramchangeTextColor(value1 - value2));
        this.drawText(roundValue2, newParamX, y, paramWidth, 'right');
    };

    Window_EquipStatus.prototype.drawResist = function(x, y, id) {
        const name = param_TermsStateResist.format($dataStates[id].name);
        const flag1 = this._actor.isStateResist(id);
        const flag2 = this._tempActor.isStateResist(id);
        this.drawTraitText(x + 96, y, name, flag1, flag2);
    };

    Window_EquipStatus.prototype.drawOriginal = function(x, y, trait) {
        const flag1 = this._actor.mppOriginalTraits().has(trait);
        const flag2 = this._tempActor.mppOriginalTraits().has(trait);
        this.drawTraitText(x + 96, y, trait, flag1, flag2);
    };

    Window_EquipStatus.prototype.drawTraitText = function(
        x, y, name, flag1, flag2
    ) {
        const diffvalue = !flag1 ? 1 : !flag2 ? -1 : 0;
        const text = !flag1 ? '+' + name : !flag2 ? '-' + name : name;
        const width = this.innerWidth - x;
        this.changeTextColor(ColorManager.paramchangeTextColor(diffvalue));
        this.drawText(text, x, y, width);
    };

    //-------------------------------------------------------------------------
    // Sprite_EquipGauge

    class Sprite_EquipGauge extends Sprite {
        constructor() {
            super();
            this.initMembers();
        }

        destroy() {
            this.bitmap.destroy();
            super.destroy();
        }

        gaugeWidth() {
            return this.bitmap.width - this._zeroX - 8;
        }

        initMembers() {
            this._curentValue = NaN;
            this._newValue = NaN;
            this._targetNewValue = NaN;
            this._maxValue = NaN;
            this._reverse = false;
            this._zeroX = 0;
            this._easing = new Easing('Slow end');
        }

        createBitmap(width, height) {
            if (!this.bitmap) {
                this.bitmap = new Bitmap(width, height);
            } else if (this.bitmap.width !== width || this.bitmap.height !== height) {
                this.bitmap.destroy();
                this.bitmap = new Bitmap(width, height);
            }
        }

        setup(value1, value2, max, reverse, zeroX) {
            this._curentValue = value1;
            this._newValue = value1;
            this._targetNewValue = value2;
            this._maxValue = max;
            this._reverse = reverse;
            this._zeroX = zeroX;
            this._easing.setDuration(value1 === value2 ? 0 : 30);
            this.redraw();
        }

        update() {
            if (this._easing.isMoving()) {
                const easing = this._easing;
                this._newValue = easing.apply(this._newValue, this._targetNewValue);
                easing.update();
                this.redraw();
            }
        }

        redraw() {
            this.bitmap.clear();
            this.drawParamGauge();
        }

        drawParamGauge() {
            const width = this.gaugeWidth();
            const curWidth = width * this._curentValue / this._maxValue;
            const newWidth = width * this._newValue / this._maxValue;
            const color = this.gaugeColor();
            switch (param_GaugeType) {
                case 'flat':
                    this.drawFlatGauge(curWidth, newWidth, color);
                    break;
                case 'arch':
                    this.drawArcGauge(curWidth, newWidth, color);
                    break;
                case '2-line':
                    this.draw2LineGauge(curWidth, newWidth, color);
                    break;
            }
        }

        gaugeColor() {
            const diffvalue = (this._targetNewValue - this._curentValue) * (this._reverse ? -1 : 1);
            return diffvalue === 0
                ? param_GaugeColor
                : ColorManager.paramchangeTextColor(diffvalue);
        }

        drawFlatGauge(curWidth, newWidth, color) {
            let curW = curWidth;
            let newX = 0;
            let newW = newWidth;
            if (curWidth >= 0) {
                if (newWidth >= curWidth) {
                    newX = curWidth;
                } else if (newWidth >= 0) {
                    newX = newWidth;
                    newW = curWidth;
                    curW = newWidth;
                } else {
                    newX = curWidth;
                    curW = 0;
                }
            } else {
                if (newWidth <= curWidth) {
                    newX = curWidth;
                } else if (newWidth <= 0) {
                    newX = newWidth;
                    newW = curWidth;
                    curW = newWidth;
                } else {
                    newX = curWidth;
                    curW = 0;
                }
            }
            
            const context = this.bitmap.context;
            context.save();
            this.setupGaugeTransform();
            
            const sx = Math.min(curWidth, newWidth, 0);
            const sw = Math.max(curWidth, newWidth, 0) - sx;
            this.drawFlatShadow(sx, 0, sw);
            if (curWidth !== newWidth) {
                if (curWidth > newWidth) {
                    context.globalAlpha = 0.6;
                }
                this.drawFlatLine(newX, 0, newW - newX, color);
                context.globalAlpha = 1;
            }
            this.drawFlatLine(0, 0, curW, param_GaugeColor);
            
            context.restore();
            this.bitmap.baseTexture.update();
        }

        setupGaugeTransform() {
            const slope = param_GaugeSlope / 10;
            const context = this.bitmap.context;
            const gx = this._zeroX + slope * -param_GaugeHeight / 2;
            const gy = this.bitmap.height - param_GaugeHeight - 4;
            context.setTransform(1, 0, slope, 1, gx, gy);
        }

        setupGaugeShadow() {
            const context = this.bitmap.context;
            context.shadowColor = param_GaugeShadowColor;
            context.shadowOffsetX = 2;
            context.shadowOffsetY = 2;
            context.shadowBlur = 2;
        }

        clearGaugeShadow() {
            const context = this.bitmap.context;
            context.shadowColor = 'transparent';
        }

        drawFlatLine(x, y, width, color) {
            const gh = param_GaugeHeight;
            const context = this.bitmap.context;

            const grad = context.createLinearGradient(x, y + 2, x, y + gh * 2);
            grad.addColorStop(0, color);
            grad.addColorStop(1, 'black');
            context.beginPath();
            context.moveTo(x, y + gh / 2);
            context.lineTo(x + width, y + gh / 2);
            context.fillStyle = grad;
            context.fillRect(x, y, width, gh);
        }

        drawFlatShadow(x, y, width) {
            this.setupGaugeShadow();
            this.drawFlatLine(x, y, width, 'black');
            this.clearGaugeShadow();
        }

        drawArcGauge(curWidth, newWidth, color) {
            const gh = param_GaugeHeight;
            let curW = curWidth;
            let newX = 0;
            let newW = newWidth;
            if (curWidth >= 0) {
                if (newWidth >= curWidth) {
                    newX = Math.max(curWidth - gh, 0);
                } else if (newWidth >= 0) {
                    newX = Math.max(newWidth - gh, 0);
                    newW = curWidth;
                    curW = newWidth;
                } else {
                    newX = curWidth;
                    curW = 0;
                }
            } else {
                if (newWidth <= curWidth) {
                    newX = Math.min(curWidth + gh, 0);
                } else if (newWidth <= 0) {
                    newX = Math.min(newWidth + gh, 0);
                    newW = curWidth;
                    curW = newWidth;
                } else {
                    newX = curWidth;
                    curW = 0;
                }
            }
            
            const context = this.bitmap.context;
            const sx = Math.min(curWidth, newWidth, 0);
            const sw = Math.max(curWidth, newWidth, 0) - sx;
            context.save();
            this.setupGaugeTransform();
            this.drawArcShadow(sx, 0, sw);
            if (curWidth !== newWidth) {
                if (curWidth > newWidth) {
                    context.globalAlpha = 0.6;
                }
                this.drawArcLine(newX, 0, newW - newX, color);
                context.globalAlpha = 1;
            }
            this.drawArcLine(0, 0, curW, param_GaugeColor);
            
            context.restore();
            this.bitmap.baseTexture.update();
        }

        drawArcLine(x, y, width, color) {
            const minX = Math.min(x, x + width);
            const maxX = Math.max(x, x + width);
            const h = param_GaugeHeight;
            const gy = y + h / 2;
            const context = this.bitmap.context;
            
            const gradient = context.createLinearGradient(x, y + 2, x, y + h * 2);
            gradient.addColorStop(0, color);
            gradient.addColorStop(1, 'black');
            
            if (maxX - minX < h) {
                const r = h / 2;
                const angle = Math.acos((r - (maxX - minX)/2) / r);
                context.beginPath();
                context.arc(minX + r, gy, r, Math.PI-angle, Math.PI+angle);
                context.arc(maxX - r, gy, r, -angle, angle);
                context.fillStyle = gradient;
                context.fill();
            } else {
                context.lineWidth = h;
                context.lineCap = 'round';
                
                context.beginPath();
                context.moveTo(minX + h / 2, gy);
                context.lineTo(maxX - h / 2, gy);
                context.strokeStyle = gradient;
                context.stroke();
            }
        }

        drawArcShadow(x, y, width) {
            this.setupGaugeShadow();
            this.drawArcLine(x, y, width, 'black');
            this.clearGaugeShadow();
        }

        draw2LineGauge(curWidth, newWidth, color) {
            const context = this.bitmap.context;
            context.save();
            this.setupGaugeTransform();
            this.setupGaugeShadow();
            
            if (color === param_GaugeColor) {
                this.drawFlatLine(0, 0, curWidth, param_GaugeColor);
            } else {
                const gh = param_GaugeHeight;
                this.drawFlatLine(0, -gh, newWidth, color);
                this.drawFlatLine(0, 0, curWidth, param_GaugeColor);
            }
            
            context.restore();
            this.bitmap.baseTexture.update();
        }

    }

    //-------------------------------------------------------------------------
    // Easing

    class Easing {
        constructor(type = '', duration = 0) {
            this.start(type, duration);
        }

        start(type, duration) {
            this.setType(type);
            this.setDuration(duration);
        }

        setType(type) {
            this._type = type || 'Slow end';
        }

        setDuration(duration) {
            this._duration = duration;
            this._wholeDuration = duration;
        }

        clear() {
            this._duration = 0;
        }

        isMoving() {
            return this._duration > 0;
        }

        update() {
            if (this._duration > 0) {
                this._duration--;
            }
        }

        apply(current, target) {
            const d = this._duration;
            const wd = this._wholeDuration;
            const lt = this._calc((wd - d) / wd);
            const t = this._calc((wd - d + 1) / wd);
            const start = (current - target * lt) / (1 - lt);
            return start + (target - start) * t;
        }

        _calc(t) {
            switch (this._type) {
                case 'Slow start':
                    return this._easeIn(t);
                case 'Slow end':
                    return this._easeOut(t);
                case 'Slow start and end':
                    return this._easeInOut(t);
                default:
                    return t;
            }
        }

        _easeIn(t) {
            return Math.pow(t, 2);
        }

        _easeOut(t) {
            return 1 - Math.pow(1 - t, 2);
        }

        _easeInOut(t) {
            if (t < 0.5) {
                return this._easeIn(t * 2) / 2;
            } else {
                return this._easeOut(t * 2 - 1) / 2 + 0.5;
            }
        }

    }

})();
