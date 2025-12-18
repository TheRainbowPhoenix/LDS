//=============================================================================
// MPP_EncounterEffect_Op1.js
//=============================================================================
// Copyright (c) 2020 Mokusei Penguin
// Released under the MIT license
// http://opensource.org/licenses/mit-license.php
//=============================================================================

/*:
 * @target MV MZ
 * @plugindesc You can set detailed parameters for MPP_EncounterEffect.js.
 * @author Mokusei Penguin
 * @url 
 * 
 * @base MPP_EncounterEffect
 * @orderAfter MPP_EncounterEffect
 *
 * @help [version 1.2.0]
 * This plugin is for RPG Maker MV and MZ.
 * 
 * ================================
 * Mail : wood_penguin＠yahoo.co.jp (＠ is half-width)
 * Blog : http://woodpenguin.blog.fc2.com/
 * License : MIT license
 * 
 *  @param Type 1 Params
 *      @desc 
 *      @type struct<type1>
 *      @default
 * 
 *  @param Type 2 Params
 *      @desc 
 *      @type struct<type2>
 *      @default
 * 
 *  @param Type 3 Params
 *      @desc 
 *      @type struct<type3>
 *      @default
 * 
 *  @param Type 4 Params
 *      @desc MZ only
 *      @type struct<type4>
 *      @default
 * 
 *  @param Type 5 Params
 *      @desc MZ only
 *      @type struct<type5>
 *      @default
 * 
 *  @param Line Width
 *      @desc Debris edging width
 *      @type number
 *          @min 0
 *          @max 99
 *      @default 4
 * 
 *  @param Flash Opacity
 *      @desc 
 *      @type number
 *          @min 0
 *          @max 255
 *      @default 255
 * 
 *  @param Break Rate
 *      @desc Movement rate when the screen breaks(%)
 *      @type number
 *          @min 0
 *          @max 9999
 *      @default 100
 * 
 *  @param Slide Rate
 *      @desc Screen misalignment rate when the screen cracks(%)
 *      @type number
 *          @min 0
 *          @max 9999
 *      @default 100
 * 
 *  @param Rotation Rate
 *      @desc 
 *      @type number
 *          @min 0
 *          @max 9999
 *      @default 100
 * 
 */

/*~struct~type1:
 *  @param Shape Type
 *      @desc 
 *      @type select
 *          @option square
 *          @option triangle
 *      @default square
 * 
 *  @param Break Duration
 *      @desc 
 *      @type number
 *          @min 1
 *          @max 999
 *      @default 45
 * 
 *  @param Interval Duration
 *      @desc 
 *      @type number
 *          @min 1
 *          @max 999
 *      @default 45
 * 
 *  @param Scatter Duration
 *      @desc 
 *      @type number
 *      @default 0
 * 
 *  @param Move Duration
 *      @desc 
 *      @type number
 *          @min 15
 *          @max 999
 *      @default 60
 * 
 *  @param Split Radial
 *      @desc Number to divide radially
 *      @type number
 *          @min 4
 *          @max 99
 *      @default 10
 * 
 *  @param Radial Random Rate
 *      @desc Random number when dividing radially(%)
 *      @type number
 *          @min 0
 *          @max 100
 *      @default 90
 *      @parent Split Radial
 * 
 *  @param Circle Radius
 *      @desc Basic radius when dividing into a circle
 *      @type number
 *          @min 32
 *          @max 9999
 *      @default 96
 * 
 *  @param Circle Increase Rate
 *      @desc Rate of increase when dividing into circles(%)
 *      @type number
 *          @min 50
 *          @max 9999
 *      @default 150
 *      @parent Circle Radius
 * 
 *  @param Circle Random Rate
 *      @desc Random number when dividing into a circle(%)
 *      @type number
 *          @min 0
 *          @max 100
 *      @default 40
 *      @parent Circle Radius
 * 
 */

/*~struct~type2:
 *  @param Shape Type
 *      @desc 
 *      @type select
 *          @option square
 *          @option triangle
 *          @option random
 *      @default random
 * 
 *  @param Break Direction
 *      @desc 
 *      @type select
 *          @option left
 *          @option center
 *          @option right
 *          @option inside
 *          @option outside
 *      @default left
 * 
 *  @param Scatter Direction
 *      @desc 
 *      @type select
 *          @option left
 *          @option right
 *          @option outside
 *      @default left
 * 
 *  @param Break Duration
 *      @desc 
 *      @type number
 *          @min 1
 *          @max 999
 *      @default 30
 * 
 *  @param Interval Duration
 *      @desc 
 *      @type number
 *          @min 1
 *          @max 999
 *      @default 45
 * 
 *  @param Scatter Duration
 *      @desc 
 *      @type number
 *          @min 0
 *          @max 999
 *      @default 25
 * 
 *  @param Move Duration
 *      @desc 
 *      @type number
 *          @min 15
 *          @max 999
 *      @default 60
 * 
 *  @param Split X
 *      @desc 
 *      @type number
 *          @min 1
 *          @max 99
 *      @default 7
 * 
 *  @param X Random Rate
 *      @desc 
 *      @type number
 *          @min 0
 *          @max 100
 *      @default 80
 *      @parent Split X
 * 
 *  @param Split Y
 *      @desc 
 *      @type number
 *          @min 1
 *          @max 99
 *      @default 5
 * 
 *  @param Y Random Rate
 *      @desc 
 *      @type number
 *          @min 0
 *          @max 100
 *      @default 80
 *      @parent Split Y
 * 
 */

/*~struct~type3:
 *  @param Shape Type
 *      @desc 
 *      @type select
 *          @option square
 *          @option triangle
 *          @option random
 *      @default triangle
 * 
 *  @param Break Direction
 *      @desc 
 *      @type select
 *          @option left
 *          @option center
 *          @option right
 *          @option inside
 *          @option outside
 *      @default inside
 * 
 *  @param Break Duration
 *      @desc 
 *      @type number
 *          @min 1
 *          @max 999
 *      @default 35
 * 
 *  @param Interval Duration
 *      @desc 
 *      @type number
 *          @min 1
 *          @max 999
 *      @default 40
 * 
 *  @param Scatter Duration
 *      @desc 
 *      @type number
 *          @min 0
 *          @max 999
 *      @default 16
 * 
 *  @param Move Duration
 *      @desc 
 *      @type number
 *          @min 15
 *          @max 999
 *      @default 100
 * 
 *  @param Split X
 *      @desc 
 *      @type number
 *          @min 1
 *          @max 99
 *      @default 8
 * 
 *  @param X Random Rate
 *      @desc 
 *      @type number
 *          @min 0
 *          @max 100
 *      @default 80
 *      @parent Split X
 * 
 *  @param Split Y
 *      @desc 
 *      @type number
 *          @min 1
 *          @max 99
 *      @default 6
 * 
 *  @param Y Random Rate
 *      @desc 
 *      @type number
 *          @min 0
 *          @max 100
 *      @default 80
 *      @parent Split Y
 * 
 */

/*~struct~type4:
 *  @param Shape Type
 *      @desc 
 *      @type select
 *          @option square
 *          @option triangle
 *          @option random
 *      @default random
 * 
 *  @param Break Direction
 *      @desc 
 *      @type select
 *          @option left
 *          @option center
 *          @option right
 *          @option inside
 *          @option outside
 *      @default left
 * 
 *  @param Scatter Direction
 *      @desc 
 *      @type select
 *          @option left
 *          @option right
 *          @option outside
 *      @default left
 * 
 *  @param Break Duration
 *      @desc 
 *      @type number
 *          @min 1
 *          @max 999
 *      @default 30
 * 
 *  @param Interval Duration
 *      @desc 
 *      @type number
 *          @min 1
 *          @max 999
 *      @default 45
 * 
 *  @param Scatter Duration
 *      @desc 
 *      @type number
 *          @min 0
 *          @max 999
 *      @default 6
 * 
 *  @param Move Duration
 *      @desc 
 *      @type number
 *          @min 15
 *          @max 999
 *      @default 45
 * 
 *  @param Split X
 *      @desc 
 *      @type number
 *          @min 1
 *          @max 99
 *      @default 9
 * 
 *  @param X Random Rate
 *      @desc 
 *      @type number
 *          @min 0
 *          @max 100
 *      @default 70
 *      @parent Split X
 * 
 *  @param Split Y
 *      @desc 
 *      @type number
 *          @min 1
 *          @max 99
 *      @default 7
 * 
 *  @param Y Random Rate
 *      @desc 
 *      @type number
 *          @min 0
 *          @max 100
 *      @default 70
 *      @parent Split Y
 * 
 */

/*~struct~type5:
 *  @param Shape Type
 *      @desc 
 *      @type select
 *          @option square
 *          @option triangle
 *          @option random
 *      @default square
 * 
 *  @param Break Direction
 *      @desc 
 *      @type select
 *          @option left
 *          @option center
 *          @option right
 *          @option inside
 *          @option outside
 *      @default outside
 * 
 *  @param Scatter Direction
 *      @desc 
 *      @type select
 *          @option left
 *          @option right
 *          @option outside
 *      @default left
 * 
 *  @param Break Duration
 *      @desc 
 *      @type number
 *          @min 1
 *          @max 999
 *      @default 30
 * 
 *  @param Interval Duration
 *      @desc 
 *      @type number
 *          @min 1
 *          @max 999
 *      @default 45
 * 
 *  @param Scatter Duration
 *      @desc 
 *      @type number
 *          @min 0
 *          @max 999
 *      @default 50
 * 
 *  @param Move Duration
 *      @desc 
 *      @type number
 *          @min 15
 *          @max 999
 *      @default 80
 * 
 *  @param Split X
 *      @desc 
 *      @type number
 *          @min 1
 *          @max 99
 *      @default 15
 * 
 *  @param X Random Rate
 *      @desc 
 *      @type number
 *          @min 0
 *          @max 100
 *      @default 0
 *      @parent Split X
 * 
 *  @param Split Y
 *      @desc 
 *      @type number
 *          @min 1
 *          @max 99
 *      @default 11
 * 
 *  @param Y Random Rate
 *      @desc 
 *      @type number
 *          @min 0
 *          @max 100
 *      @default 0
 *      @parent Split Y
 * 
 */

/*:ja
 * @target MV MZ
 * @plugindesc MPP_EncounterEffect.js の細かなパラメータを設定できます。
 * @author 木星ペンギン
 * @url 
 * 
 * @base MPP_EncounterEffect
 * @orderAfter MPP_EncounterEffect
 *
 * @help [version 1.1.2]
 * このプラグインはRPGツクールMVおよびMZ用です。
 * 
 * ================================
 * Mail : wood_penguin＠yahoo.co.jp (＠は半角)
 * Blog : http://woodpenguin.blog.fc2.com/
 * License : MIT license
 * 
 *  @param Type 1 Params
 *      @text タイプ1 設定
 *      @desc 
 *      @type struct<type1>
 *      @default
 * 
 *  @param Type 2 Params
 *      @text タイプ2 設定
 *      @desc 
 *      @type struct<type2>
 *      @default
 * 
 *  @param Type 3 Params
 *      @text タイプ3 設定
 *      @desc 
 *      @type struct<type3>
 *      @default
 * 
 *  @param Type 4 Params
 *      @text タイプ4 設定
 *      @desc MZのみ
 *      @type struct<type4>
 *      @default
 * 
 *  @param Type 5 Params
 *      @text タイプ5 設定
 *      @desc MZのみ
 *      @type struct<type5>
 *      @default
 * 
 *  @param Line Width
 *      @text 線の幅
 *      @desc 破片の縁取りの幅
 *      @type number
 *          @min 0
 *          @max 99
 *      @default 4
 * 
 *  @param Flash Opacity
 *      @text フラッシュの強さ
 *      @desc 
 *      @type number
 *          @min 0
 *          @max 255
 *      @default 255
 * 
 *  @param Break Rate
 *      @text 画面割れ移動率
 *      @desc 画面が割れる際の移動率(%)
 *      @type number
 *          @min 0
 *          @max 9999
 *      @default 100
 * 
 *  @param Slide Rate
 *      @text 画面ズレ率
 *      @desc 画面が割れる際の画面ズレ率(%)
 *      @type number
 *          @min 0
 *          @max 9999
 *      @default 100
 * 
 *  @param Rotation Rate
 *      @text 破片回転率
 *      @desc 
 *      @type number
 *          @min 0
 *          @max 9999
 *      @default 100
 * 
 */

/*~struct~type1:ja
 *  @param Shape Type
 *      @text 破片の形状
 *      @desc 
 *      @type select
 *          @option 四角形
 *              @value square
 *          @option 三角形
 *              @value triangle
 *      @default square
 * 
 *  @param Break Duration
 *      @text 画面割れ時間
 *      @desc 画面割れのエフェクト時間
 *      @type number
 *          @min 1
 *          @max 999
 *      @default 45
 * 
 *  @param Interval Duration
 *      @text 待機時間
 *      @desc 画面割れ後の待機時間
 *      @type number
 *          @min 1
 *          @max 999
 *      @default 45
 * 
 *  @param Scatter Duration
 *      @text 飛び散る時間
 *      @desc 全ての破片が移動を開始するまでの時間
 *      @type number
 *          @min 0
 *          @max 999
 *      @default 0
 * 
 *  @param Move Duration
 *      @text 移動時間
 *      @desc 戦闘開始時のエフェクト時間
 *      @type number
 *          @min 15
 *          @max 999
 *      @default 60
 * 
 *  @param Split Radial
 *      @text 分割数
 *      @desc 放射状に分割する数
 *      @type number
 *          @min 4
 *          @max 99
 *      @default 10
 * 
 *  @param Radial Random Rate
 *      @text 乱数
 *      @desc 放射状に分割する際の乱数(%)
 *      @type number
 *          @min 0
 *          @max 100
 *      @default 90
 *      @parent Split Radial
 * 
 *  @param Circle Radius
 *      @text 基本半径
 *      @desc 円状に分割する際の基本半径
 *      @type number
 *          @min 32
 *          @max 9999
 *      @default 96
 * 
 *  @param Circle Increase Rate
 *      @text 増加率
 *      @desc 円状に分割する際の増加率(%)
 *      @type number
 *          @min 0
 *          @max 9999
 *      @default 150
 *      @parent Circle Radius
 * 
 *  @param Circle Random Rate
 *      @text 乱数
 *      @desc 円状に分割する際の乱数(%)
 *      @type number
 *          @min 0
 *          @max 100
 *      @default 40
 *      @parent Circle Radius
 * 
 */

/*~struct~type2:ja
 *  @param Shape Type
 *      @text 破片の形状
 *      @desc 
 *      @type select
 *          @option 四角形
 *              @value square
 *          @option 三角形
 *              @value triangle
 *          @option ランダム
 *              @value random
 *      @default random
 * 
 *  @param Break Direction
 *      @text 割れる方向
 *      @desc 画面が割れる方向
 *      @type select
 *          @option left
 *          @option center
 *          @option right
 *          @option inside
 *          @option outside
 *      @default left
 * 
 *  @param Scatter Direction
 *      @text 散っていく方向
 *      @desc 画面が散っていく方向
 *      @type select
 *          @option left
 *          @option right
 *          @option outside
 *      @default left
 * 
 *  @param Break Duration
 *      @text 画面割れ時間
 *      @desc 画面割れのエフェクト時間
 *      @type number
 *          @min 1
 *          @max 999
 *      @default 30
 * 
 *  @param Interval Duration
 *      @text 待機時間
 *      @desc 画面割れ後の待機時間
 *      @type number
 *          @min 1
 *          @max 999
 *      @default 45
 * 
 *  @param Scatter Duration
 *      @text 飛び散る時間
 *      @desc 全ての破片が移動を開始するまでの時間
 *      @type number
 *          @min 0
 *          @max 999
 *      @default 25
 * 
 *  @param Move Duration
 *      @text 移動時間
 *      @desc 戦闘開始時のエフェクト時間
 *      @type number
 *          @min 15
 *          @max 999
 *      @default 60
 * 
 *  @param Split X
 *      @text 横分割数
 *      @desc 横に分割する数
 *      @type number
 *          @min 1
 *          @max 99
 *      @default 7
 * 
 *  @param X Random Rate
 *      @text 乱数
 *      @desc 横に分割する際の乱数(%)
 *      @type number
 *          @min 0
 *          @max 100
 *      @default 80
 *      @parent Split X
 * 
 *  @param Split Y
 *      @text 縦分割数
 *      @desc 縦に分割する数
 *      @type number
 *          @min 1
 *          @max 99
 *      @default 5
 * 
 *  @param Y Random Rate
 *      @text 乱数
 *      @desc 横に分割する際の乱数(%)
 *      @type number
 *          @min 0
 *          @max 100
 *      @default 80
 *      @parent Split Y
 * 
 */

/*~struct~type3:ja
 *  @param Shape Type
 *      @text 破片の形状
 *      @desc 
 *      @type select
 *          @option 四角形
 *              @value square
 *          @option 三角形
 *              @value triangle
 *          @option ランダム
 *              @value random
 *      @default triangle
 * 
 *  @param Break Direction
 *      @text 画面割れ方向
 *      @desc 画面が割れる方向
 *      @type select
 *          @option left
 *          @option center
 *          @option right
 *          @option inside
 *          @option outside
 *      @default inside
 * 
 *  @param Break Duration
 *      @text 画面割れ時間
 *      @desc 画面割れのエフェクト時間
 *      @type number
 *          @min 1
 *          @max 999
 *      @default 35
 * 
 *  @param Interval Duration
 *      @text 待機時間
 *      @desc 画面割れ後の待機時間
 *      @type number
 *          @min 1
 *          @max 999
 *      @default 40
 * 
 *  @param Scatter Duration
 *      @text 飛び散る時間
 *      @desc 全ての破片が移動を開始するまでの時間
 *      @type number
 *          @min 0
 *          @max 999
 *      @default 16
 * 
 *  @param Move Duration
 *      @text 移動時間
 *      @desc 戦闘開始時のエフェクト時間
 *      @type number
 *          @min 15
 *          @max 999
 *      @default 100
 * 
 *  @param Split X
 *      @text 横分割数
 *      @desc 横に分割する数
 *      @type number
 *          @min 1
 *          @max 99
 *      @default 8
 * 
 *  @param X Random Rate
 *      @text 乱数
 *      @desc 横に分割する際の乱数(%)
 *      @type number
 *          @min 0
 *          @max 100
 *      @default 80
 *      @parent Split X
 * 
 *  @param Split Y
 *      @text 縦分割数
 *      @desc 縦に分割する数
 *      @type number
 *          @min 1
 *          @max 99
 *      @default 6
 * 
 *  @param Y Random Rate
 *      @text 乱数
 *      @desc 横に分割する際の乱数(%)
 *      @type number
 *          @min 0
 *          @max 100
 *      @default 80
 *      @parent Split Y
 * 
 */

/*~struct~type4:ja
 *  @param Shape Type
 *      @text 破片の形状
 *      @desc 
 *      @type select
 *          @option 四角形
 *              @value square
 *          @option 三角形
 *              @value triangle
 *          @option ランダム
 *              @value random
 *      @default random
 * 
 *  @param Break Direction
 *      @text 割れる方向
 *      @desc 画面が割れる方向
 *      @type select
 *          @option left
 *          @option center
 *          @option right
 *          @option inside
 *          @option outside
 *      @default left
 * 
 *  @param Scatter Direction
 *      @text 散っていく方向
 *      @desc 画面が散っていく方向
 *      @type select
 *          @option left
 *          @option right
 *          @option outside
 *      @default left
 * 
 *  @param Break Duration
 *      @text 画面割れ時間
 *      @desc 画面割れのエフェクト時間
 *      @type number
 *          @min 1
 *          @max 999
 *      @default 30
 * 
 *  @param Interval Duration
 *      @text 待機時間
 *      @desc 画面割れ後の待機時間
 *      @type number
 *          @min 1
 *          @max 999
 *      @default 45
 * 
 *  @param Scatter Duration
 *      @text 飛び散る時間
 *      @desc 全ての破片が移動を開始するまでの時間
 *      @type number
 *          @min 0
 *          @max 999
 *      @default 6
 * 
 *  @param Move Duration
 *      @text 移動時間
 *      @desc 戦闘開始時のエフェクト時間
 *      @type number
 *          @min 15
 *          @max 999
 *      @default 45
 * 
 *  @param Split X
 *      @text 横分割数
 *      @desc 横に分割する数
 *      @type number
 *          @min 1
 *          @max 99
 *      @default 9
 * 
 *  @param X Random Rate
 *      @text 乱数
 *      @desc 横に分割する際の乱数(%)
 *      @type number
 *          @min 0
 *          @max 100
 *      @default 70
 *      @parent Split X
 * 
 *  @param Split Y
 *      @text 縦分割数
 *      @desc 縦に分割する数
 *      @type number
 *          @min 1
 *          @max 99
 *      @default 7
 * 
 *  @param Y Random Rate
 *      @text 乱数
 *      @desc 横に分割する際の乱数(%)
 *      @type number
 *          @min 0
 *          @max 100
 *      @default 70
 *      @parent Split Y
 * 
 */

/*~struct~type5:ja
 *  @param Shape Type
 *      @text 破片の形状
 *      @desc 
 *      @type select
 *          @option 四角形
 *              @value square
 *          @option 三角形
 *              @value triangle
 *          @option ランダム
 *              @value random
 *      @default square
 * 
 *  @param Break Direction
 *      @text 割れる方向
 *      @desc 画面が割れる方向
 *      @type select
 *          @option left
 *          @option center
 *          @option right
 *          @option inside
 *          @option outside
 *      @default outside
 * 
 *  @param Scatter Direction
 *      @text 散っていく方向
 *      @desc 画面が散っていく方向
 *      @type select
 *          @option left
 *          @option right
 *          @option outside
 *      @default left
 * 
 *  @param Break Duration
 *      @text 画面割れ時間
 *      @desc 画面割れのエフェクト時間
 *      @type number
 *          @min 1
 *          @max 999
 *      @default 30
 * 
 *  @param Interval Duration
 *      @text 待機時間
 *      @desc 画面割れ後の待機時間
 *      @type number
 *          @min 1
 *          @max 999
 *      @default 45
 * 
 *  @param Scatter Duration
 *      @text 飛び散る時間
 *      @desc 全ての破片が移動を開始するまでの時間
 *      @type number
 *          @min 0
 *          @max 999
 *      @default 50
 * 
 *  @param Move Duration
 *      @text 移動時間
 *      @desc 戦闘開始時のエフェクト時間
 *      @type number
 *          @min 15
 *          @max 999
 *      @default 80
 * 
 *  @param Split X
 *      @text 横分割数
 *      @desc 横に分割する数
 *      @type number
 *          @min 1
 *          @max 99
 *      @default 15
 * 
 *  @param X Random Rate
 *      @text 乱数
 *      @desc 横に分割する際の乱数(%)
 *      @type number
 *          @min 0
 *          @max 100
 *      @default 0
 *      @parent Split X
 * 
 *  @param Split Y
 *      @text 縦分割数
 *      @desc 縦に分割する数
 *      @type number
 *          @min 1
 *          @max 99
 *      @default 11
 * 
 *  @param Y Random Rate
 *      @text 乱数
 *      @desc 横に分割する際の乱数(%)
 *      @type number
 *          @min 0
 *          @max 100
 *      @default 0
 *      @parent Split Y
 * 
 */

(() => {
    'use strict';
    
    const pluginName = 'MPP_EncounterEffect_Op1';
    
    // Plugin Parameters
    const parameters = PluginManager.parameters(pluginName);
    const reviver = (key, value) => {
        try {
            return JSON.parse(value, reviver);
        } catch (e) {
            return value;
        }
    };
    
    const param_CustomParams = [];
    for (let i = 1; i <= 5; i++) {
        param_CustomParams[i] = JSON.parse(parameters[`Type ${i} Params`] || '{}', reviver);
    }
    const param_LineWidth = Number(parameters['Line Width'] || 4);
    const param_FlashOpacity = Number(parameters['Flash Opacity'] || 255);
    const param_BreakRate = Number(parameters['Break Rate'] || 100);
    const param_SlideRate = Number(parameters['Slide Rate'] || 100);
    const param_RotationRate = Number(parameters['Rotation Rate'] || 100);
    
    //-------------------------------------------------------------------------
    // EncounterEffect
    
    const _EncounterEffect_params = EncounterEffect.params;
    EncounterEffect.params = function() {
        const params = _EncounterEffect_params.call(this);
        if (params && param_CustomParams[this._type]) {
            return { ...params, ...param_CustomParams[this._type] };
        }
        return params;
    };
    
    //-------------------------------------------------------------------------
    // Encounter_Fragment
    
    Encounter_Fragment.prototype.lineWidth = function() {
        return param_LineWidth;
    };

    Encounter_Fragment.prototype.flashOpacity = function() {
        return param_FlashOpacity;
    };

    Encounter_Fragment.prototype.breakRate = function() {
        return param_BreakRate / 100;
    };

    Encounter_Fragment.prototype.slideRate = function() {
        return param_SlideRate / 100;
    };
    
    Encounter_Fragment.prototype.rotationRate = function() {
        return param_RotationRate / 100;
    };

})();
