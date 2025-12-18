//=============================================================================
// Plugin for RPG Maker MZ
// SkillTypeLib.js
//=============================================================================
// [Update History]
// 2020.Apr.10 Ver1.0.0 First Release
// 2022.Jan.26 Ver1.1.0 Fix bugs when number of skill types are >= 10
//   - add new display type: Whether MP is full or not

/*:
 * @target MZ
 * @plugindesc [Ver1.1.0]Make the skill type that displays under limited situation
 * @author Sasuke KANNAZUKI
 *
 * @param passiveSkills
 * @text Passive Skills
 * @desc Skill type IDs that displays on map menu, hides on battle command
 * @type number[]
 * @default []
 *
 * @param superSpecialSkills
 * @text Super Special Skills
 * @desc Skill type IDs that displays when one's TP is full on battle.
 * @type number[]
 * @default []
 *
 * @param doesDisplaySpecialOnMap
 * @parent superSpecialSkills
 * @text Display special on map?
 * @desc Does display special skills on map?
 * @type boolean
 * @default true
 *
 * @param fullMpSkills
 * @text Skill for Full MP
 * @desc Skill type IDs that displays when one's MP is full on battle.
 * @type number[]
 * @default []
 *
 * @param doesDisplayFullMpOnMap
 * @parent fullMpSkills
 * @text Display Full Mp on Map?
 * @desc (0:No, 1:Always Yes, 2:When MP is full)
 * @type select
 * @option No
 * @value 0
 * @option Always Yes
 * @value 1
 * @option When MP is full
 * @value 2
 * @default 1
 *
 * @help
 * This plugin runs under RPG Maker MZ.
 * This plugin set the skill type Id display under the specified situation.
 *
 * [Summary]
 * - Passive Skill
 *  Displays on map menu, hides on battle
 * - Super Special Skill
 *  Displays the actor's TP become max.
 *  At on map, you can select display or hide by option.
 * - Skill for Full MP
 *  Displays the actor's MP is max.
 *  At on map, you can select display or hide by option.
 *
 * [License]
 * this plugin is released under MIT license.
 * http://opensource.org/licenses/mit-license.php
 */

/*:ja
 * @target MZ
 * @plugindesc [Ver1.1.0]特定条件下でのみ表示されるスキルタイプを設定します。
 * @author 神無月サスケ
 *
 * @param passiveSkills
 * @text パッシブスキル
 * @desc メニュー画面では表示され、戦闘中は表示されないスキルタイプのID
 * @type number[]
 * @default []
 *
 * @param superSpecialSkills
 * @text 超必殺技
 * @desc 戦闘中はTPが満タン(100)の時だけ表示されるスキルタイプのID
 * @type number[]
 * @default []
 *
 * @param doesDisplaySpecialOnMap
 * @parent superSpecialSkills
 * @text 超必殺技マップ表示？
 * @desc 超必殺技をマップメニューで表示する？
 * @type boolean
 * @default true
 *
 * @param fullMpSkills
 * @text MP満タン専用スキル
 * @desc 戦闘中はMPが満タンの時だけ表示されるスキルタイプのID
 * @type number[]
 * @default []
 *
 * @param doesDisplayFullMpOnMap
 * @parent fullMpSkills
 * @text MP満タンマップ表示？
 * @desc MP満タン専用スキルをマップメニューで表示する？(0:しない, 1:常にする, 2:MP満タン時のみ)
 * @type select
 * @option しない
 * @value 0
 * @option 常に表示
 * @value 1
 * @option MP満タン時のみ
 * @value 2
 * @default 1
 *
 * @help
 * このプラグインは、RPGツクールMZに対応しています。
 * このプラグインは、特定条件下でのみ表示されるスキルタイプをIDで指定します。
 *
 * ■概要
 * - パッシブスキル
 *  移動中は表示されますが、戦闘では表示されません。
 *  パッシブスキル専用のカテゴリを設けたい時に便利です。
 * - 超必殺技
 *  戦闘中、TPが満タン(通常は100)の時にのみ表示されます。
 *  移動中の表示/非表示はオプションで設定可能です。
 * - MP満タン時スキル
 *  戦闘中、TPが満タンの時にのみ表示されます。
 *  移動中の表示/非表示はオプションで設定可能です。
 *
 * ■ライセンス表記
 * このプラグインは MIT ライセンスで配布されます。
 * ご自由にお使いください。
 * http://opensource.org/licenses/mit-license.php
 */

(() => {
  const pluginName = 'SkillTypeLib';
  //
  // process parameters
  //
  const parameters = PluginManager.parameters(pluginName);
  const passiveStypeIds = eval(parameters['passiveSkills']).map(id => +id);
  const specialStypeIds = eval(parameters['superSpecialSkills']).map(i => +i);
  const specialOnMap = eval(parameters['doesDisplaySpecialOnMap'] || 'true');
  const fullMpStypeIds = eval(parameters['fullMpSkills']).map(id => +id);
  const fullMpOnMap = Number(parameters['doesDisplayFullMpOnMap'] || '1');

  const _Window_ActorCommand_addCommand =
   Window_ActorCommand.prototype.addCommand;
  Window_ActorCommand.prototype.addCommand = function(name, symbol,
   enabled = true, ext = null) {
    if (symbol === 'skill') {
      if (passiveStypeIds.includes(ext)) {
        return;
      }
      const actor = this._actor;
      if (specialStypeIds.includes(ext) && actor.tp < actor.maxTp()) {
        return;
      }
      if (fullMpStypeIds.includes(ext) && actor.mp < actor.mmp) {
        return;
      }
    }
    _Window_ActorCommand_addCommand.call(this, name, symbol, enabled, ext);
  };

  const _Window_SkillType_addCommand = Window_SkillType.prototype.addCommand;
  Window_SkillType.prototype.addCommand = function(name, symbol,
   enabled = true, ext = null) {
    if (!specialOnMap && specialStypeIds.includes(ext)) {
      return;
    }
    if (fullMpStypeIds.includes(ext)) {
      const actor = this._actor;
      if (fullMpOnMap === 0 || (fullMpOnMap === 2 && actor.mp < actor.mmp)) {
        return;
      }
    }
    _Window_SkillType_addCommand.call(this, name, symbol, enabled, ext);
  };

})();
