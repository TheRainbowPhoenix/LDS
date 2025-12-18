//=============================================================================
// menu_windows_override.js v1.0
//=============================================================================

//-----------------------------------------------------------------------------
// Window_Base
//
// The superclass of all windows within the game.
/*:
 * @target MZ
 * @plugindesc メニュー幅の変更、ショップダミーウインドウの隠ぺい処理、ショップヘルプ消去
 * @author PB
 *
 * @help
 * 
 */

(() => {
  "use strict";

//アイテムメニュー幅変更
Scene_Item.prototype.categoryWindowRect = function() {
    const wx = 0;
    const wy = this.mainAreaTop();
    const ww = Graphics.boxWidth * 0.67;
    const wh = this.calcWindowHeight(1, true);
    return new Rectangle(wx, wy, ww, wh);
};

Scene_Item.prototype.itemWindowRect = function() {
    const wx = 0;
    const wy = this._categoryWindow.y + this._categoryWindow.height;
    const ww = Graphics.boxWidth * 0.67;
    const wh = this.mainAreaBottom() - wy;
    return new Rectangle(wx, wy, ww, wh);
};

//スキルメニュー幅変更
Scene_Skill.prototype.statusWindowRect = function() {
    const ww = Graphics.boxWidth * 0.67 - this.mainCommandWidth();
    const wh = this._skillTypeWindow.height;
    const wx = this.isRightInputMode() ? 0 : Graphics.boxWidth - ww;
    const wy = this.mainAreaTop();
    return new Rectangle(wx, wy, ww, wh);
};

Scene_Skill.prototype.skillTypeWindowRect = function() {
    const ww = this.mainCommandWidth();
    const wh = this.calcWindowHeight(3, true);
//  const wx = this.isRightInputMode() ? Graphics.boxWidth - ww : 0;
    const wx = 610
    const wy = this.mainAreaTop();
    return new Rectangle(wx, wy, ww, wh);
};

Scene_Skill.prototype.itemWindowRect = function() {
    const wx = 0;
    const wy = this._statusWindow.y + this._statusWindow.height;
    const ww = Graphics.boxWidth * 0.67;
    const wh = this.mainAreaHeight() - this._statusWindow.height;
    return new Rectangle(wx, wy, ww, wh);
};

//装備メニュー幅変更
Scene_Equip.prototype.commandWindowRect = function() {
    const wx = this.statusWidth();
    const wy = this.mainAreaTop();
    const ww = Graphics.boxWidth *0.67 - this.statusWidth();
    const wh = this.calcWindowHeight(1, true);
    return new Rectangle(wx, wy, ww, wh);
};

Scene_Equip.prototype.slotWindowRect = function() {
    const commandWindowRect = this.commandWindowRect();
    const wx = this.statusWidth();
    const wy = commandWindowRect.y + commandWindowRect.height;
    const ww = Graphics.boxWidth *0.67 - this.statusWidth();
    const wh = this.mainAreaHeight() - commandWindowRect.height;
    return new Rectangle(wx, wy, ww, wh);
};

//ショップメニュー幅変更


Scene_Shop.prototype.goldWindowRect = function() {
    const ww = this.mainCommandWidth();
    const wh = this.calcWindowHeight(1, true);
    const wx = Graphics.boxWidth* 0.67 - ww;
    const wy = this.mainAreaTop();
    return new Rectangle(wx, wy, ww, wh);
};

Scene_Shop.prototype.dummyWindowRect = function() {
    const wx = 0;
    const wy = this._commandWindow.y + this._commandWindow.height;
    const ww = Graphics.boxWidth * 0.67;
    const wh = this.mainAreaHeight() - this._commandWindow.height;
    return new Rectangle(wx, wy, ww, wh);
};

Scene_Shop.prototype.numberWindowRect = function() {
    const wx = 0;
    const wy = this._dummyWindow.y;
    const ww = Graphics.boxWidth *0.67 - this.statusWidth();
    const wh = this._dummyWindow.height;
    return new Rectangle(wx, wy, ww, wh);
};

Scene_Shop.prototype.statusWindowRect = function() {
    const ww = this.statusWidth();
    const wh = this._dummyWindow.height;
    const wx = Graphics.boxWidth *0.67 - ww;
    const wy = this._dummyWindow.y;
    return new Rectangle(wx, wy, ww, wh);
};

Scene_Shop.prototype.buyWindowRect = function() {
    const wx = 0;
    const wy = this._dummyWindow.y;
    const ww = Graphics.boxWidth * 0.67 - this.statusWidth();
    const wh = this._dummyWindow.height;
    return new Rectangle(wx, wy, ww, wh);
};

Scene_Shop.prototype.categoryWindowRect = function() {
    const wx = 0;
    const wy = this._dummyWindow.y;
    const ww = Graphics.boxWidth * 0.67;
    const wh = this.calcWindowHeight(1, true);
    return new Rectangle(wx, wy, ww, wh);
};

Scene_Shop.prototype.sellWindowRect = function() {
    const wx = 0;
    const wy = this._categoryWindow.y + this._categoryWindow.height;
    const ww = Graphics.boxWidth * 0.67;
    const wh =
        this.mainAreaHeight() -
        this._commandWindow.height -
        this._categoryWindow.height;
    return new Rectangle(wx, wy, ww, wh);
};

Scene_Shop.prototype.createDummyWindow = function() {
    const rect = this.dummyWindowRect();
    this._dummyWindow = new Window_Base(rect);
    this.addWindow(this._dummyWindow);
    this._dummyWindow.hide();
};

Scene_Shop.prototype.onBuyCancel = function() {
    this._commandWindow.activate();
//    this._dummyWindow.show();
    this._buyWindow.hide();
    this._statusWindow.hide();
    this._statusWindow.setItem(null);
    this._helpWindow.clear();
};

Scene_Shop.prototype.onCategoryCancel = function() {
    this._commandWindow.activate();
//    this._dummyWindow.show();
    this._categoryWindow.hide();
    this._sellWindow.hide();
};

//ヘルプ幅変更

Scene_MenuBase.prototype.helpWindowRect = function() {
    const wx = 0;
    const wy = this.helpAreaTop();
    const ww = Graphics.boxWidth * 0.67;
    const wh = this.helpAreaHeight();
    return new Rectangle(wx, wy, ww, wh);
};


//セーブ幅変更

Scene_File.prototype.helpWindowRect = function() {
    const wx = 0;
    const wy = this.mainAreaTop();
    const ww = Graphics.boxWidth * 0.67;
    const wh = this.calcWindowHeight(1, false);
    return new Rectangle(wx, wy, ww, wh);
};

Scene_File.prototype.listWindowRect = function() {
    const wx = 0;
    const wy = this.mainAreaTop() + this._helpWindow.height;
    const ww = Graphics.boxWidth * 0.67;
    const wh = this.mainAreaHeight() - this._helpWindow.height;
    return new Rectangle(wx, wy, ww, wh);
};

//ブラー消去
Scene_Shop.prototype.createBackground = function() {
        // 通常背景を作成
        Scene_MenuBase.prototype.createBackground.call(this);

        // ブラー削除
        if (this._backgroundSprite) {
            this._backgroundSprite.filters = [];
        }

        // 暗さ(不透明度)調整
        if (this._backgroundSprite) {
            this._backgroundSprite.opacity = 255;
        }
    };

//Scene_Battle.prototype.skillWindowRect = function() {
//    const ww = Graphics.boxWidth * 0.65;
//    const wh = this.windowAreaHeight();
//    const wx = 0;
//    const wy = Graphics.boxHeight - wh -15;
//    return new Rectangle(wx, wy, ww, wh);
//};

//Scene_Battle.prototype.enemyWindowRect = function() {
//    const wx = 0;
//    const ww = this._statusWindow.width * 0.65;
//    const wh = 68;
//    const wy = 103;
//    return new Rectangle(wx, wy, ww, wh);
//};


})();