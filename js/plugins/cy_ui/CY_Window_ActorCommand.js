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

    // Position at Bottom Right
    this.updatePlacement();

    this.opacity = 0; // Transparent
    this.contentsOpacity = 255;
    this.openness = 0;
};

CY_Window_ActorCommand.prototype.updatePlacement = function () {
    this.width = this.windowWidth();
    this.height = this.windowHeight();
    const padding = 8;
    this.x = Graphics.boxWidth - this.width - padding;
    this.y = Graphics.boxHeight - this.height - padding;
};

CY_Window_ActorCommand.prototype.standardPadding = function () {
    return 0;
};

CY_Window_ActorCommand.prototype.maxCols = function () {
    return 3;
};

CY_Window_ActorCommand.prototype.numVisibleRows = function () {
    return 2;
};

// Fixed size to match a 96x96 icon + padding
CY_Window_ActorCommand.prototype.windowWidth = function () {
    const btnSz = (CY_System._UI && CY_System._UI.ATK_BTN_SZ) || 96;
    const padding = 8;
    return (btnSz + padding) * this.maxCols();
};

CY_Window_ActorCommand.prototype.windowHeight = function () {
    const btnSz = (CY_System._UI && CY_System._UI.ATK_BTN_SZ) || 96;
    const padding = 8;
    return (btnSz + padding) * this.numVisibleRows();
};

CY_Window_ActorCommand.prototype.itemWidth = function () {
    return (CY_System._UI && CY_System._UI.ATK_BTN_SZ) || 96;
};

CY_Window_ActorCommand.prototype.itemHeight = function () {
    return (CY_System._UI && CY_System._UI.ATK_BTN_SZ) || 96;
};

CY_Window_ActorCommand.prototype.makeCommandList = function () {
    if (this._actor) {
        this.addAttackCommand();
        this.addSkillCommands();
        this.addGuardCommand();
        this.addItemCommand();
    }
};

// Custom Grid Mapping
// 0: Attack -> Bottom Right (Col 2, Row 1)
// 1: Skill -> Bottom Mid (Col 1, Row 1)
// 2: Guard -> Bottom Left (Col 0, Row 1)
// 3: Item -> Top Right (Col 2, Row 0)
// 4: ... -> Top Mid (Col 1, Row 0)
// 5: ... -> Top Left (Col 0, Row 0)
CY_Window_ActorCommand.prototype.gridMapping = function (index) {
    const colMap = [2, 1, 0, 2, 1, 0];
    const rowMap = [1, 1, 1, 0, 0, 0];

    return {
        col: colMap[index] || 0,
        row: rowMap[index] || 0
    };
};

CY_Window_ActorCommand.prototype.itemRect = function (index) {
    const itemWidth = this.itemWidth();
    const itemHeight = this.itemHeight();
    const padding = 8;

    const grid = this.gridMapping(index);
    const col = grid.col;
    const row = grid.row;

    // Calculate x,y based on Col/Row
    const x = col * (itemWidth + padding);
    const y = row * (itemHeight + padding);

    return new Rectangle(x, y, itemWidth, itemHeight);
};

CY_Window_ActorCommand.prototype.drawItem = function (index) {
    const rect = this.itemRect(index);
    this.resetTextColor();
    this.changePaintOpacity(this.isCommandEnabled(index));

    const symbol = this.commandSymbol(index);
    const pw = (CY_System._UI && CY_System._UI.ATK_BTN_SZ) || 96;
    const ph = (CY_System._UI && CY_System._UI.ATK_BTN_SZ) || 96;

    let idx = this.iconIndexForSymbol(symbol);
    // Source rect from sprite sheet (assuming 3 cols in sheet? or 5 original?)
    // Original maxCols was 5. Let's assume sheet is formatted for 5.
    const sheetCols = 5;
    const ax = 0 + pw * (idx % sheetCols);
    const ay = 0 + ph * ((idx / sheetCols) | 0);

    if (this._atkIcons) {
        this.contents.blt(this._atkIcons, ax, ay, pw, ph, rect.x, rect.y);
    }

    // Draw text overlay if needed, or just rely on icon
    // this.drawText(this.commandName(index), rect.x, rect.y, rect.width, 'center');
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

// Override Cursor Movement to match reversed layout
// Override Cursor Movement to match reversed layout with Safe Cycling
CY_Window_ActorCommand.prototype.cursorRight = function (wrap) {
    // Visual Right -> Decrement Index
    var index = this.index();
    var max = this.maxItems();
    var next = index - 1;
    if (next < 0) {
        next = max - 1; // Cycle to end
    }
    this.select(next);
};

CY_Window_ActorCommand.prototype.cursorLeft = function (wrap) {
    // Visual Left -> Increment Index
    var index = this.index();
    var max = this.maxItems();
    var next = index + 1;
    if (next >= max) {
        next = 0; // Cycle to start
    }
    this.select(next);
};

CY_Window_ActorCommand.prototype.cursorUp = function (wrap) {
    // Visual Up -> Row 0 (Top) -> Index + 3
    var index = this.index();
    var max = this.maxItems();
    var next = index + 3;
    if (next < max) {
        this.select(next);
    } else {
        // If we can't go Up, usually checking if we can wrap to bottom?
        // But if we are already at bottom (index < 3), and next is invalid, it means no top row item exists.
        // If we are at Top (index >= 3), we wrap to Bottom (index - 3).
        if (index >= 3) {
            this.select(index - 3);
        }
    }
};

CY_Window_ActorCommand.prototype.cursorDown = function (wrap) {
    // Visual Down -> Row 1 (Bottom) -> Index - 3
    var index = this.index();
    var max = this.maxItems();
    var next = index - 3;
    if (next >= 0) {
        this.select(next);
    } else {
        // If we can't go Down, wrap to Top if it exists.
        if (index + 3 < max) {
            this.select(index + 3);
        }
    }
};

