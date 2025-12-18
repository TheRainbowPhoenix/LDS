//=============================================================================
// MPP_EquipStatusEX_Op1.js
//=============================================================================
// Copyright (c) 2017-2023 Mokusei Penguin
// Released under the MIT license
// http://opensource.org/licenses/mit-license.php
//=============================================================================

/*:
 * @target MZ
 * @plugindesc The extended display will also be reflected in the shop status.
 * @author Mokusei Penguin
 * @url 
 *
 * @base MPP_EquipStatusEX
 * @orderAfter MPP_EquipStatusEX
 *
 * @help [version 2.0.1]
 * - This plugin is for RPG Maker MZ.
 * - The extended display will also be reflected in the shop status.
 * 
 * ▼ Plugin parameter details
 *  〇 Members Size
 *   - The more people displayed on one page, the fewer status lines displayed.
 *   - The default screen size has a total of 8 lines.
 *   - For 2 people, 4 lines per person, and for 3 to 4 people, 2 lines per person.
 * 
 *  〇 Status
 *   [Fixed Status]    : Status always displayed while selecting an equippable item.
 *   [Included Status] : Status displayed when an equippable item is selected
 *                       and included in equipment.
 *   [Changed Status]  : Status displayed when there is a change while selecting
 *                       an equippable item.
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
 *  @param -----Status
 * 
 *  @param Weapon Fixed Status
 *      @desc 
 *      @default 2
 *      @parent -----Status
 * 
 *  @param Armor Fixed Status
 *      @desc 
 *      @default 3
 *      @parent -----Status
 * 
 *  @param Included Status
 *      @desc 
 *      @default 2-7
 *      @parent -----Status
 * 
 *  @param Changed Status
 *      @desc 
 *      @default 0-7,10-19,20-29
 *      @parent -----Status
 * 
 *  @param -----Trait
 * 
 *  @param Element Rate Type
 *      @desc 
 *      @type select
 *          @option Hidden
 *              @value Hidden
 *          @option Fixed
 *              @value Fixed
 *          @option Included
 *              @value Included
 *          @option Changed
 *              @value Changed
 *          @option Included or Changed
 *              @value Included or Changed
 *      @default Included or Changed
 *      @parent -----Trait
 * 
 *  @param Debuff Rate Type
 *      @desc 
 *      @type select
 *          @option Hidden
 *              @value Hidden
 *          @option Fixed
 *              @value Fixed
 *          @option Included
 *              @value Included
 *          @option Changed
 *              @value Changed
 *          @option Included or Changed
 *              @value Included or Changed
 *      @default Included or Changed
 *      @parent -----Trait
 * 
 *  @param State Rate Type
 *      @desc 
 *      @type select
 *          @option Hidden
 *              @value Hidden
 *          @option Fixed
 *              @value Fixed
 *          @option Included
 *              @value Included
 *          @option Changed
 *              @value Changed
 *          @option Included or Changed
 *              @value Included or Changed
 *      @default Included or Changed
 *      @parent -----Trait
 * 
 *  @param State Resist Type
 *      @desc 
 *      @type select
 *          @option Hidden
 *              @value Hidden
 *          @option Fixed
 *              @value Fixed
 *          @option Included
 *              @value Included
 *          @option Changed
 *              @value Changed
 *          @option Included or Changed
 *              @value Included or Changed
 *      @default Changed
 *      @parent -----Trait
 * 
 *  @param Original Trait Type
 *      @desc 
 *      @type select
 *          @option Hidden
 *              @value Hidden
 *          @option Fixed
 *              @value Fixed
 *          @option Included
 *              @value Included
 *          @option Changed
 *              @value Changed
 *          @option Included or Changed
 *              @value Included or Changed
 *      @default Changed
 *      @parent -----Trait
 * 
 *  @param -----Shop Window
 * 
 *  @param Members Size
 *      @desc Number of people displayed on one page
 *      @type number
 *          @min 1
 *          @max 9
 *      @default 4
 *      @parent -----Shop Window
 * 
 *  @param Show Actor Name?
 *      @desc 
 *      @type boolean
 *      @default true
 *      @parent -----Shop Window
 * 
 *  @param Show Character?
 *      @desc When enabled, the display is shifted to the right by the width of the graphic.
 *      @type boolean
 *      @default false
 *      @parent -----Shop Window
 * 
 *  @param Draw Current Item?
 *      @desc 
 *      @type boolean
 *      @default false
 *      @parent -----Shop Window
 * 
 *  @param Equipping Position
 *      @desc Displayed when equipped with the same item as the selected item.
 *      @type select
 *          @option hidden
 *              @value hidden
 *          @option right of name
 *              @value right of name
 *          @option Overlap on the character
 *              @value Overlap on the character
 *      @default right of name
 *      @parent -----Shop Window
 * 
 *  @param Equipping Text
 *      @desc 
 *      @default Ｅ
 *      @parent Equipping Position
 * 
 *  @param Equipping Font Size
 *      @desc 
 *      @type number
 *      @default 24
 *      @parent Equipping Position
 * 
 */

/*:ja
 * @target MZ
 * @plugindesc 拡張表示をショップのステータスにも反映させます。
 * @author 木星ペンギン
 * @url 
 *
 * @base MPP_EquipStatusEX
 * @orderAfter MPP_EquipStatusEX
 *
 * @help [version 2.0.1]
 * - このプラグインはRPGツクールMZ用です。
 * - 拡張表示をショップのステータスにも反映させます。
 * 
 * ▼ プラグインパラメータ 詳細
 *  〇 表示人数
 *   - 1ページ内に表示される人数が多いほど、表示されるステータスの行数が
 *     減ります。
 *   - デフォルトの画面サイズでは全部で8行です。
 *   - 2人の場合は一人4行、3～4人の場合は一人2行となります。
 * 
 *  〇 Status (能力値)
 *   [固定ステータス] : 装備可能なアイテムを選択中、常に表示されるステータス
 *   [装備ステータス] : 装備可能なアイテムを選択中、
 *                      装備品に含まれる場合に表示されるステータス
 *   [変動ステータス] : 装備可能なアイテムを選択中、
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
 *  @param -----Status
 *      @text -----能力値
 * 
 *  @param Weapon Fixed Status
 *      @text 固定ステータス(武器)
 *      @desc 装備可能な武器を選択中、常に表示されるステータス
 *      @default 2
 *      @parent -----Status
 * 
 *  @param Armor Fixed Status
 *      @text 固定ステータス(防具)
 *      @desc 装備可能な防具を選択中、常に表示されるステータス
 *      @default 3
 *      @parent -----Status
 * 
 *  @param Included Status
 *      @text 装備ステータス
 *      @desc 装備可能なアイテムを選択中、装備品に含まれる場合に表示されるステータス
 *      @default 2-7
 *      @parent -----Status
 * 
 *  @param Changed Status
 *      @text 変動ステータス
 *      @desc 装備可能なアイテムを選択中、ステータスに変更がある場合に表示されるステータス
 *      @default 0-7,10-19,20-29
 *      @parent -----Status
 * 
 *  @param -----Trait
 *      @text -----特徴
 * 
 *  @param Element Rate Type
 *      @text 属性有効度:表示タイプ
 *      @desc 
 *      @type select
 *          @option 非表示
 *              @value Hidden
 *          @option 固定
 *              @value Fixed
 *          @option 装備
 *              @value Included
 *          @option 変動
 *              @value Changed
 *          @option 装備or変動
 *              @value Included or Changed
 *      @default Included or Changed
 *      @parent -----Trait
 * 
 *  @param Debuff Rate Type
 *      @text 弱体有効度:表示タイプ
 *      @desc 
 *      @type select
 *          @option 非表示
 *              @value Hidden
 *          @option 固定
 *              @value Fixed
 *          @option 装備
 *              @value Included
 *          @option 変動
 *              @value Changed
 *          @option 装備or変動
 *              @value Included or Changed
 *      @default Included or Changed
 *      @parent -----Trait
 * 
 *  @param State Rate Type
 *      @text ステート有効度:表示タイプ
 *      @desc 
 *      @type select
 *          @option 非表示
 *              @value Hidden
 *          @option 固定
 *              @value Fixed
 *          @option 装備
 *              @value Included
 *          @option 変動
 *              @value Changed
 *          @option 装備or変動
 *              @value Included or Changed
 *      @default Included or Changed
 *      @parent -----Trait
 * 
 *  @param State Resist Type
 *      @text ステート無効化:表示タイプ
 *      @desc 
 *      @type select
 *          @option 非表示
 *              @value Hidden
 *          @option 固定
 *              @value Fixed
 *          @option 装備
 *              @value Included
 *          @option 変動
 *              @value Changed
 *          @option 装備or変動
 *              @value Included or Changed
 *      @default Changed
 *      @parent -----Trait
 * 
 *  @param Original Trait Type
 *      @text オリジナル特徴:表示タイプ
 *      @desc 
 *      @type select
 *          @option 非表示
 *              @value Hidden
 *          @option 固定
 *              @value Fixed
 *          @option 装備
 *              @value Included
 *          @option 変動
 *              @value Changed
 *          @option 装備or変動
 *              @value Included or Changed
 *      @default Changed
 *      @parent -----Trait
 * 
 *  @param -----Shop Window
 *      @text -----ショップウィンドウ
 * 
 *  @param Members Size
 *      @text 表示人数
 *      @desc １ページに表示する人数
 *      @type number
 *          @min 1
 *          @max 9
 *      @default 4
 *      @parent -----Shop Window
 * 
 *  @param Show Actor Name?
 *      @text 名前を表示するかどうか
 *      @desc 
 *      @type boolean
 *      @default true
 *      @parent -----Shop Window
 * 
 *  @param Show Character?
 *      @text 歩行グラを表示するかどうか
 *      @desc 有効にした場合、グラフィックの幅だけ表示が右にずれます。
 *      @type boolean
 *      @default false
 *      @parent -----Shop Window
 * 
 *  @param Draw Current Item?
 *      @text 装備中のアイテム名を表示するかどうか
 *      @desc 
 *      @type boolean
 *      @default false
 *      @parent -----Shop Window
 * 
 *  @param Equipping Position
 *      @text [装備中表示]の位置
 *      @desc 選択中のアイテムと同じアイテムを装備している場合に表示されます。
 *      @type select
 *          @option 非表示
 *              @value hidden
 *          @option 名前の右
 *              @value right of name
 *          @option 歩行グラに重ねる
 *              @value Overlap on the character
 *      @default right of name
 *      @parent -----Shop Window
 * 
 *  @param Equipping Text
 *      @text [装備中表示]の文字列
 *      @desc 
 *      @default Ｅ
 *      @parent Equipping Position
 * 
 *  @param Equipping Font Size
 *      @text [装備中表示]の文字サイズ
 *      @desc 
 *      @type number
 *      @default 24
 *      @parent Equipping Position
 * 
 */

(() => {
    'use strict';

    const pluginName = 'MPP_EquipStatusEX_Op1';

    // Plugin Parameters
    const parameters = PluginManager.parameters(pluginName);
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
    const param_WeaponFixedStatus = convertToArray(parameters['Weapon Fixed Status']);
    const param_ArmorFixedStatus = convertToArray(parameters['Armor Fixed Status']);
    const param_IncludedStatus = convertToArray(parameters['Included Status']);
    const param_ChangedStatus = convertToArray(parameters['Changed Status']);

    const param_ElementRateType = parameters['Element Rate Type'] || 'Included or Changed';
    const param_DebuffRateType = parameters['Debuff Rate Type'] || 'Included or Changed';
    const param_StateRateType = parameters['State Rate Type'] || 'Included or Changed';
    const param_StateResistType = parameters['State Resist Type'] || 'Changed';
    const param_OriginalTraitType = parameters['Original Trait Type'] || 'Changed';

    const param_MembersSize = Number(parameters['Members Size'] || 4);
    const param_ShowActorName = parameters['Show Actor Name?'] === 'true';
    const param_ShowCharacter = parameters['Show Character?'] === 'true';
    const param_DrawCurrentItem = parameters['Draw Current Item?'] === 'true';
    const param_EquippingPosition = parameters['Equipping Position'] || 'right of name';
    const param_EquippingText = parameters['Equipping Text'] || '';
    const param_EquippingFontSize = Number(parameters['Equipping Font Size'] || 24);

    //-----------------------------------------------------------------------------
    // Window_ShopStatus

    Window_ShopStatus.directionPattern = [2, 4, 8, 6];

    const _Window_ShopStatus_initialize = Window_ShopStatus.prototype.initialize;
    Window_ShopStatus.prototype.initialize = function(rect) {
        this._animeCount = 0;
        this._animeIndex = 0;
        this._characterSprites = new Set();
        _Window_ShopStatus_initialize.apply(this, arguments);
    };

    const _Window_ShopStatus_refresh = Window_ShopStatus.prototype.refresh;
    Window_ShopStatus.prototype.refresh = function() {
        this.hideAdditionalSprites();
        this._characterSprites.clear();
        _Window_ShopStatus_refresh.apply(this, arguments);
        if (param_ShowCharacter && this.isEquipItem()) {
            this.updateCharacters();
        }
    };

    const _Window_ShopStatus_setItem = Window_ShopStatus.prototype.setItem;
    Window_ShopStatus.prototype.setItem = function(item) {
        if (this._item !== item) {
            _Window_ShopStatus_setItem.apply(this, arguments);
        }
    };
    
    Window_ShopStatus.prototype.currentSlotId = function(actor, etypeId, item) {
        const equips = actor.equips();
        const slots = actor.equipSlots();
        return slots.findIndex((eId, i) => eId === etypeId && equips[i] === item);
    };

    // overwrite
    Window_ShopStatus.prototype.drawEquipInfo = function(x, y) {
        const rowSpacing = this.rowSpacing();
        const itemHeight = this.itemHeight();
        for (const [i, actor] of this.statusMembers().entries()) {
            const actorY = y + (itemHeight + rowSpacing) * i;
            this.drawActorEquipInfo(x, actorY, actor);
        }
    };

    // overwrite
    Window_ShopStatus.prototype.pageSize = function() {
        return param_MembersSize;
    };

    Window_ShopStatus.prototype.rowSpacing = function() {
        return 10;
    };

    Window_ShopStatus.prototype.itemHeight = function() {
        const rowSpacing = this.rowSpacing();
        const paramsHeight = Math.floor(this.innerHeight - this.lineHeight() * 1.5);
        return (paramsHeight + rowSpacing) / this.pageSize() - rowSpacing;
    };

    // overwrite
    Window_ShopStatus.prototype.drawActorEquipInfo = function(x, y, actor) {
        const canEquip = actor.canEquip(this._item);
        let x2 = x;
        this._actor = actor;
        this._tempActor = JsonEx.makeDeepCopy(actor);
        this._equippedItem = this.currentEquippedItem(actor, this._item.etypeId);
        if (this._equippedItem !== this._item) {
            const slotId = this.currentSlotId(actor, this._item.etypeId, this._equippedItem);
            if (slotId >= 0) {
                this._tempActor.forceChangeEquip(slotId, this._item);
            }
        }
        if (param_ShowCharacter) {
            this.drawActorCharacter(this._tempActor, x + 24, y + 48, canEquip);
            x2 += 48;
        }
        this.resetFontSettings();
        this.changePaintOpacity(canEquip);
        this.drawParameters(x2, y, this.itemHeight());
        this.changePaintOpacity(true);
    };

    Window_ShopStatus.prototype.drawEquipping = function(x, y, width) {
        const text = param_EquippingText;
        if (text) {
            const fontSize = this.contents.fontSize;
            const dy = y + fontSize - param_EquippingFontSize;
            this.changeTextColor(this.systemColor());
            this.contents.fontSize = param_EquippingFontSize;
            this.drawText(text, x, dy, width, 'right');
            this.contents.fontSize = fontSize;
        }
    };

    Window_ShopStatus.prototype.drawActorCharacter = function(actor, x, y, canEquip) {
        const p = this.padding;
        const opacity = canEquip ? 255 : this.translucentOpacity();
        this.placeActorCharacter(actor, x + p, y + p, opacity, canEquip);
        if (
            this._equippedItem === this._item &&
            param_EquippingPosition === 'Overlap on the character'
        ) {
            this.drawEquipping(x - 24, y + 8 - this.lineHeight(), 48);
        }
    };

    Window_ShopStatus.prototype.placeActorCharacter = function(actor, x, y, opacity, stepAnime) {
        const key = `character${x}-${y}`;
        const sprite = this.createBackSprite(key, Sprite_MenuCharacter);
        sprite.setup(actor, opacity, stepAnime);
        sprite.move(x, y);
        sprite.show();
        this._characterSprites.add(sprite);
    };

    const _Window_ShopStatus_update = Window_ShopStatus.prototype.update;
    Window_ShopStatus.prototype.update = function() {
        _Window_ShopStatus_update.apply(this, arguments);
        if (param_ShowCharacter && this.isEquipItem()) {
            this.updateAnimation();
        }
    };

    Window_ShopStatus.prototype.updateAnimation = function() {
        const size = Window_ShopStatus.directionPattern.length;
        this._animeCount++;
        if (this._animeCount % (24 * size * 2) === 0) {
            this._animeIndex = (this._animeIndex + 1) % size;
            this._animeCount = 0;
            this.updateCharacters();
        }
    };

    Window_ShopStatus.prototype.updateCharacters = function() {
        const direction = Window_ShopStatus.directionPattern[this._animeIndex];
        for (const sprite of this._characterSprites) {
            sprite.setDirection(direction);
        }
    };

    Window_ShopStatus.prototype.makeStatusList = function() {
        const list = [];
        if (param_ShowActorName) {
            list.push(this.convertList([0], 'name')[0]);
        }
        if (this._actor.canEquip(this._item)) {
            if (param_DrawCurrentItem) {
                list.push(this.convertList([this._equippedItem], 'equip')[0]);
            }
            list.push(...Window_EquipStatus.prototype.makeStatusList.call(this));
        }
        return list;
    };

    Window_ShopStatus.prototype.convertList = function(list, type) {
        return list.map(
            value => ({ type, value, actor: this._actor, tempActor: this._tempActor })
        );
    };

    Window_ShopStatus.prototype.fixParamList = function() {
        return DataManager.isWeapon(this._item)
            ? param_WeaponFixedStatus
            : param_ArmorFixedStatus;
    };

    Window_ShopStatus.prototype.includeParamList = function() {
        return param_IncludedStatus;
    };

    Window_ShopStatus.prototype.changeParamList = function() {
        return param_ChangedStatus;
    };

    Window_ShopStatus.prototype.elementRateType = function() {
        return param_ElementRateType;
    };

    Window_ShopStatus.prototype.debuffRateType = function() {
        return param_DebuffRateType;
    };

    Window_ShopStatus.prototype.stateRateType = function() {
        return param_StateRateType;
    };

    Window_ShopStatus.prototype.stateResistType = function() {
        return param_StateResistType;
    };

    Window_ShopStatus.prototype.originalTraitType = function() {
        return param_OriginalTraitType;
    };

    Window_ShopStatus.prototype.drawItem = function(x, y, data) {
        this._actor = data.actor;
        this._tempActor = data.tempActor;
        switch (data.type) {
            case 'name': {
                const width = this.innerWidth - x - this.itemPadding();
                this.drawActorName(this._actor, x, y, width);
                if (
                    this._equippedItem === this._item &&
                    param_EquippingPosition === 'right of name'
                ) {
                    this.drawEquipping(x, y, width);
                }
                break;
            }
            case 'equip': {
                const x2 = x + (!param_ShowCharacter && param_ShowActorName ? 16 : 0);
                this.drawItemName(data.value, x2, y);
                break;
            }
            default: {
                const x2 = x + (!param_ShowCharacter && param_ShowActorName ? 16 : 0);
                Window_EquipStatus.prototype.drawItem.call(this, x2, y, data);
                break;
            }
        }
    };

    {
        const _methodNames = [
            'drawRightArrow',
            'drawParamName',
            'drawCurrentParam',
            'drawNewParam',
            'rightArrowWidth',
            'paramWidth',
            'paramX',
            // 'paramY',
            
            'drawParameters',
            'equipParamsList',
            'elementRateList',
            'debuffRateList',
            'stateRateList',
            'stateResistList',
            'originalTraitList',
            'defaultParamsList',
            'includeItemParam',
            'includeItemTrait',
            'isChangedParam',
            'actorParam',
            'isChangedRate',
            'includeRate',
            'drawParam',
            'drawElement',
            'drawDebuff',
            'drawState',
            'drawRate',
            'drawResist',
            'drawOriginal',
            'placeEquipGauge',
            'createBackSprite',
            'paramMax',
            'drawTraitText'
        ];
        const _shopObj = Window_ShopStatus.prototype;
        const _equipObj = Window_EquipStatus.prototype;
        for (const name of _methodNames) {
            _shopObj[name] = _equipObj[name];
        }
    }

    //-----------------------------------------------------------------------------
    // Sprite_MenuCharacter

    class Sprite_MenuCharacter extends Sprite_Character {
        constructor() {
            super(null);
            this._actor = null;
            this._animationCount = 0;
            this._pattern = 1;
            this._direction = 0;
            this._stepAnime = true;
        }

        initMembers() {
            super.initMembers();
        }

        setup(actor, opacity, stepAnime) {
            this._actor = actor;
            this.opacity = opacity;
            this._stepAnime = stepAnime;
        }

        setDirection(direction) {
            if (this._direction !== direction) {
                this._direction = direction;
                this._animationCount = 0;
                this._pattern = 1;
            }
        }

        updateVisibility() {
            Sprite.prototype.updateVisibility.call(this);
        }
        
        updateBitmap() {
            if (this.isImageChanged()) {
                this._tileId = 0;
                this._characterName = this._actor.characterName();
                this._characterIndex = this._actor.characterIndex();
                this.setCharacterBitmap();
            }
        }
        
        isImageChanged() {
            return (
                this._characterName !== this._actor.characterName() ||
                this._characterIndex !== this._actor.characterIndex()
            );
        }
        
        updateFrame() {
            this.updateAnimation();
            super.updateFrame();
        }
        
        updateAnimation() {
            if (this._stepAnime && ++this._animationCount >= this.animationWait()) {
                this._pattern = (this._pattern + 1) % 4;
                this._animationCount = 0;
            }
        }

        animationWait() {
            return 24;
        }
        
        characterBlockX() {
            const index = this._characterIndex;
            return (index % 4) * 3;
        }
        
        characterBlockY() {
            const index = this._characterIndex;
            return Math.floor(index / 4) * 4;
        }
        
        characterPatternX() {
            return this._pattern < 3 ? this._pattern : 1;
        }
        
        characterPatternY() {
            return (this._direction - 2) / 2;
        }
        
        updatePosition() {}

        updateOther() {}

    }


})();
