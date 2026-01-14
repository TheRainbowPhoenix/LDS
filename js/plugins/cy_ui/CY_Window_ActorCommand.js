/*:
 * @plugindesc Custom Actor Command Window for CY_Scene_Battle
 */

function CY_Window_ActorCommand() {
    this.initialize.apply(this, arguments);
}

CY_Window_ActorCommand.prototype = Object.create(Window_ActorCommand.prototype);
CY_Window_ActorCommand.prototype.constructor = CY_Window_ActorCommand;

CY_Window_ActorCommand.prototype.initialize = function () {
    Window_ActorCommand.prototype.initialize.call(this);
    this._atkIcons = ImageManager.loadBitmap("img/ui/battle/", "atkIcons");
};

CY_Window_ActorCommand.prototype.standardPadding = function () {
    return 0;
};

CY_Window_ActorCommand.prototype.standardBackOpacity = function () {
    return 0;
};

CY_Window_ActorCommand.prototype.maxCols = function () {
    return 5;
};

CY_Window_ActorCommand.prototype.numVisibleRows = function () {
    return 1;
};

// Fixed size to match a 120x120 icon (tweakable via globalThis._UI.ATK_BTN_SZ)
CY_Window_ActorCommand.prototype.windowWidth = function () {
    const btnSz = (globalThis._UI && globalThis._UI.ATK_BTN_SZ) || 96;
    return btnSz * this.maxCols();
};

CY_Window_ActorCommand.prototype.windowHeight = function () {
    const btnSz = (globalThis._UI && globalThis._UI.ATK_BTN_SZ) || 96;
    return btnSz * this.numVisibleRows();
};

CY_Window_ActorCommand.prototype.itemWidth = function () {
    return (globalThis._UI && globalThis._UI.ATK_BTN_SZ) || 96;
};

CY_Window_ActorCommand.prototype.itemHeight = function () {
    return (globalThis._UI && globalThis._UI.ATK_BTN_SZ) || 96;
};

CY_Window_ActorCommand.prototype.makeCommandList = function () {
    if (this._actor) {
        this.addAttackCommand();
        this.addSkillCommands();
        this.addGuardCommand();
        this.addItemCommand();
    }
};

CY_Window_ActorCommand.prototype.itemActRect = function (index) {
    const maxCols = this.maxCols();
    const itemWidth = this.itemWidth();
    const itemHeight = this.itemHeight();
    const colSpacing = this.colSpacing();
    const rowSpacing = this.rowSpacing();
    const col = index % maxCols;
    const row = Math.floor(index / maxCols);
    const x = col * itemWidth + colSpacing / 2 - this.scrollBaseX();
    const y = row * itemHeight + rowSpacing / 2 - this.scrollBaseY();
    const width = itemWidth + colSpacing;
    const height = itemHeight + rowSpacing;

    return new Rectangle(x, y, width, height);
};

CY_Window_ActorCommand.prototype.drawItem = function (index) {
    const rect = this.itemActRect(index);
    this.resetTextColor();
    this.changePaintOpacity(this.isCommandEnabled(index));

    const symbol = this.commandSymbol(index);
    const pw = (globalThis._UI && globalThis._UI.ATK_BTN_SZ) || 96;
    const ph = (globalThis._UI && globalThis._UI.ATK_BTN_SZ) || 96;

    let idx = this.iconIndexForSymbol(symbol);
    const ax = 0 + pw * (idx % this.maxCols());
    const ay = 0 + ph * ((idx / this.maxCols()) | 0);

    if (this._atkIcons) {
        this.contents.blt(this._atkIcons, ax, ay, pw, ph, rect.x, rect.y);
    }

    // Draw text overlay if needed, or just rely on icon
    this.drawText(this.commandName(index), rect.x, rect.y, rect.width, 'center');
};

CY_Window_ActorCommand.prototype.iconIndexForSymbol = function (symbol) {
    switch (symbol) {
        case "attack": return 0;
        case "skill": return 1;
        case "guard": return 2;
        case "item": return 3;
        case "assist": return 4;
        case "cancel": return 5;
    }
    return 0;
};
