/*:
 * @plugindesc Sprite classes for CY Battle System
 */

// -----------------------------------------------------------------------------
// CY_Sprite_HUDGauge
// -----------------------------------------------------------------------------
function CY_Sprite_HUDGauge() {
    this.initialize(...arguments);
}
CY_Sprite_HUDGauge.prototype = Object.create(Sprite_Gauge.prototype);
CY_Sprite_HUDGauge.prototype.constructor = CY_Sprite_HUDGauge;

CY_Sprite_HUDGauge.prototype.drawLabel = function () { };
CY_Sprite_HUDGauge.prototype.drawValue = function () { };
CY_Sprite_HUDGauge.prototype.gaugeX = function () { return 0; };
CY_Sprite_HUDGauge.prototype.gaugeHeight = function () {
    switch (this._statusType) {
        case "hp": return 10;
        case "mp": return 5;
        case "tp": return 5;
        default: return 12;
    }
};

// -----------------------------------------------------------------------------
// CY_Sprite_InfoBar
// -----------------------------------------------------------------------------
function CY_Sprite_InfoBar() {
    this.initialize(...arguments);
}
CY_Sprite_InfoBar.prototype = Object.create(Sprite.prototype);
CY_Sprite_InfoBar.prototype.constructor = CY_Sprite_InfoBar;

CY_Sprite_InfoBar.prototype.initialize = function () {
    Sprite.prototype.initialize.call(this);
    this._battler = null;
    this.anchor.x = 0.5;
    this.anchor.y = 0;
    this.bitmap = new Bitmap(64, 8);
};

CY_Sprite_InfoBar.prototype.setup = function (battler) {
    this._battler = battler;
    // Remove children if re-setup? For now assuming fresh setup
    this.removeChildren();
    this._infoGauges = [];

    const GAUGE_WIDTH = 64;
    const GAUGE_HEIGHT = 8;
    // const GAUGE_SPACING = GAUGE_HEIGHT + 2; 

    let gap = 4;
    const X = -GAUGE_WIDTH / 2;

    // HP gauge
    this._hpGauge = new CY_Sprite_HUDGauge();
    this._hpGauge.setup(battler, "hp");
    this._hpGauge.move(X, 0);
    this._hpGauge.show();
    this.addChild(this._hpGauge);
    this._infoGauges.push(this._hpGauge);

    gap += this._hpGauge.gaugeHeight() + 2;

    // MP gauge
    this._mpGauge = new CY_Sprite_HUDGauge();
    this._mpGauge.setup(battler, "mp");
    this._mpGauge.move(X, gap);
    this._mpGauge.show();
    this.addChild(this._mpGauge);
    this._infoGauges.push(this._mpGauge);

    gap += this._mpGauge.gaugeHeight() + 2;

    // TP gauge
    if ($dataSystem.optDisplayTp) {
        this._tpGauge = new CY_Sprite_HUDGauge();
        this._tpGauge.setup(battler, "tp");
        this._tpGauge.move(X, gap);
        this._tpGauge.show();
        this.addChild(this._tpGauge);
        this._infoGauges.push(this._tpGauge);
    }

    // State-icon row
    this._stateIcon = new Sprite_StateIcon();
    this._stateIcon.setup(battler);
    this._stateIcon.x = -12;
    this._stateIcon.y = 0;
    this.addChild(this._stateIcon);
};

CY_Sprite_InfoBar.prototype.update = function () {
    Sprite.prototype.update.call(this);
    if (!this._battler) return;
};

// -----------------------------------------------------------------------------
// CY_Sprite_PlayerBattler
// -----------------------------------------------------------------------------
function CY_Sprite_PlayerBattler() {
    this.initialize(...arguments);
}
CY_Sprite_PlayerBattler.prototype = Object.create(Sprite_Actor.prototype);
CY_Sprite_PlayerBattler.prototype.constructor = CY_Sprite_PlayerBattler;

CY_Sprite_PlayerBattler.prototype.initialize = function (battler) {
    Sprite_Actor.prototype.initialize.call(this, battler);
};

// Mapping for actor names to prefixes
CY_Sprite_PlayerBattler.actorPrefix = {
    "Q-Bee": "QB",
    "Makoto=Nanaya": "Makoto",
    "Shantae": "STE",
    "Chaos Croc": "FCroc",
    "Tails-Ko": "Tails"
};

CY_Sprite_PlayerBattler.prototype.loadBitmap = function () {
    this.updateBitmap();
};

CY_Sprite_PlayerBattler.prototype.updateBitmap = function () {
    const battler = this._battler;
    if (!battler) return;

    const prefix = CY_Sprite_PlayerBattler.actorPrefix[battler.name()] || battler.name();
    const suffix = battler.getCorruptState ? (battler.getCorruptState() || "1") : "1";
    const name = prefix + suffix;
    const hue = battler.battlerHue ? battler.battlerHue() : 0;

    if (this._bitmapName !== name || this._bitmapHue !== hue) {
        this._bitmapName = name;
        this._bitmapHue = hue;
        // Use loadSvEnemy to load as static PNG from img/enemies
        this._mainSprite.bitmap = ImageManager.loadSvEnemy(name, hue);
    }
};

CY_Sprite_PlayerBattler.prototype.updateFrame = function () {
    Sprite_Battler.prototype.updateFrame.call(this);
    const bitmap = this._mainSprite.bitmap;
    if (bitmap) {
        // Simple breathing effect when selected
        if (this._selectShadow && this._selectShadow.visible) {
            this._breathCount = (this._breathCount || 0) + 1;
            const cycle = 120;
            const theta = (2 * Math.PI * (this._breathCount % cycle)) / cycle;
            this._mainSprite.scale.y = 1 + 0.01 * Math.sin(theta);
        } else {
            this._breathCount = 0;
            this._mainSprite.scale.y = 1;
        }
    }
};

CY_Sprite_PlayerBattler.prototype.setActorHome = function (index) {
    this.setHome(120 + index * 180, Graphics.boxHeight * 0.75 + index * 20);
};

CY_Sprite_PlayerBattler.prototype.moveToStartPosition = function () {
    this.startMove(-200, 0, 0);
};

CY_Sprite_PlayerBattler.prototype.createShadowSprite = function () {
    Sprite_Actor.prototype.createShadowSprite.call(this);

    // Selection ring
    const ring = new PIXI.Graphics();
    const height = 24;
    const width = height * 6;
    const lineWidth = 2;
    ring.lineStyle(lineWidth, 0xffff00, 1.0);
    ring.drawEllipse(0, 0, width / 2, height / 2);
    ring.endFill();

    ring.x = 0;
    ring.y = this._shadowSprite.y;
    ring.zIndex = this._shadowSprite.zIndex - 1;
    ring.visible = false;

    this._selectShadow = ring;
    this.addChild(ring);
};

CY_Sprite_PlayerBattler.prototype.stepForward = function () {
    this.startMove(12, 0, 12);
    if (this._selectShadow) this._selectShadow.visible = true;
};

CY_Sprite_PlayerBattler.prototype.stepBack = function () {
    this.startMove(0, 0, 12);
    if (this._selectShadow) this._selectShadow.visible = false;
};

CY_Sprite_PlayerBattler.prototype.update = function () {
    Sprite_Actor.prototype.update.call(this);
    if (this._selectShadow && this._selectShadow.visible) {
        const t = performance.now() / 200;
        const scale = 1 + 0.05 * Math.sin(t);
        this._selectShadow.scale.set(scale, scale);
    }
};

CY_Sprite_PlayerBattler.prototype.setBattler = function (battler) {
    Sprite_Actor.prototype.setBattler.call(this, battler);
    this._battler = battler;
};

CY_Sprite_PlayerBattler.prototype.setupWeaponAnimation = function () {
    // Disabled
};
