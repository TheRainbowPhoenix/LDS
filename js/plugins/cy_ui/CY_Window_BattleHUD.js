/*:
 * @plugindesc Battle HUD Visuals for CY_Scene_Battle
 */

function CY_Window_BattleHUD() {
    this.initialize.apply(this, arguments);
}

CY_Window_BattleHUD.prototype = Object.create(Window_Base.prototype);
CY_Window_BattleHUD.prototype.constructor = CY_Window_BattleHUD;

CY_Window_BattleHUD.prototype.initialize = function (x, y, width, height) {
    Window_Base.prototype.initialize.call(this, x, y, width, height);
    this.opacity = 0; // Transparent window background
    this.contentsOpacity = 255;

    // Load Assets if needed (or assume they are cached/available)
    // this._bgBitmap = ImageManager.loadSystem('BattleHUD_BG'); 

    this.refresh();
};

CY_Window_BattleHUD.prototype.standardPadding = function () {
    return 0;
};

CY_Window_BattleHUD.prototype.update = function () {
    Window_Base.prototype.update.call(this);
    // Add updates if we need animated parts (e.g. rotating cursor)
};

CY_Window_BattleHUD.prototype.refresh = function () {
    this.contents.clear();
    this.drawBackground();
    this.drawTimeline();
    this.drawAssistsButton();
    this.drawCommandPlaceholders();
};

CY_Window_BattleHUD.prototype.drawBackground = function () {
    // Fill bottom area if users wants a background
    // this.contents.fillRect(0, 0, this.contentsWidth(), this.contentsHeight(), 'rgba(0, 0, 0, 0.5)');
};

CY_Window_BattleHUD.prototype.drawTimeline = function () {
    // "Bottom Center ... just draw a red line to show it's here"
    const w = this.contentsWidth();
    const h = this.contentsHeight();

    // Approx area: Center 50%?
    const startX = w * 0.2;
    const endX = w * 0.7;
    const y = h * 0.8; // Near bottom

    this.contents.fillRect(startX, y, endX - startX, 2, '#ff0000');
    this.contents.drawText("Timeline Placeholder", startX, y - 30, endX - startX, 30, 'center');
};

CY_Window_BattleHUD.prototype.drawAssistsButton = function () {
    // "Far bottom left there's this circle button"
    const radius = 48;
    const x = 64;
    const y = this.contentsHeight() - 64;

    this.contents.drawCircle(x, y, radius, '#ffffff'); // Simple white circle
    this.contents.drawText("Assist", x - radius, y - 18, radius * 2, 36, 'center');
};

CY_Window_BattleHUD.prototype.drawCommandPlaceholders = function () {
    // "Bottom Right... Grid 3 icons wide on two rows"
    // Draw gray placeholders
    const btnSz = 96; // Standard
    const padding = 8;
    const cols = 3;
    const rows = 2; // Supports up to 6 commands placeholder

    // We want to mirror logic of CY_Window_ActorCommand itemRect, but static.
    // Logic: Bottom-Right is Slot 0. 
    // Grid:
    // [3] [4] [5]
    // [2] [1] [0] 

    // Anchor: Bottom Right of HUD
    const startX = this.contentsWidth() - padding;
    const startY = this.contentsHeight() - padding;

    // Commands usually are: Attack(0), Skill(1), Guard(2), Item(3)
    // 0: Bottom-Right
    // 1: Center-Right
    // 2: Left-Right (Bottom Row Left)
    // 3: Top-Right (Above 0?) "When over 3 you move to the above range"

    // Let's iterate 0 to 5
    for (let i = 0; i < 6; i++) {
        const col = i % cols; // 0, 1, 2
        const row = Math.floor(i / cols); // 0, 1

        // Coords relative to Bottom Right Corner
        // i=0 (col=0, row=0) -> x = right - (0+1)*sz, y = bottom - (0+1)*sz
        // Wait, "first in order is attack... bottom right".
        // So Slot 0 is at (Cols-1, Rows-1)? Or is it filled backwards?

        // "bottom right (first in order... is attack)" -> Slot 0
        // "second one is program" -> Left of 0?
        // "over 3 move to above range"

        // So:
        // Slot 0: col=0 (relative to right), row=0 (relative to bottom)
        // Slot 1: col=1, row=0
        // Slot 2: col=2, row=0 (End of bottom row)
        // Slot 3: col=0, row=1

        const xOffset = (col + 1) * (btnSz + padding);
        const yOffset = (row + 1) * (btnSz + padding);

        const x = this.contentsWidth() - xOffset;
        const y = this.contentsHeight() - yOffset;

        // Draw Placeholder Box
        this.contents.fillRect(x, y, btnSz, btnSz, 'rgba(100, 100, 100, 0.5)');
        this.contents.drawText("" + i, x, y, btnSz, btnSz, 'center');
    }
};

// Start of Helper for drawing Circle
if (!Bitmap.prototype.drawCircle) {
    Bitmap.prototype.drawCircle = function (x, y, radius, color) {
        const context = this._context;
        context.save();
        context.fillStyle = color;
        context.beginPath();
        context.arc(x, y, radius, 0, Math.PI * 2, false);
        context.fill();
        context.restore();
        this._setDirty();
    };
}
