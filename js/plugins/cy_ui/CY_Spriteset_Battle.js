/*:
 * @plugindesc Spriteset for CY Battle Scene
 */

function CY_Spriteset_Battle() {
    this.initialize.apply(this, arguments);
}

CY_Spriteset_Battle.prototype = Object.create(Spriteset_Battle.prototype);
CY_Spriteset_Battle.prototype.constructor = CY_Spriteset_Battle;

CY_Spriteset_Battle.prototype.initialize = function () {
    Spriteset_Battle.prototype.initialize.call(this);
};

CY_Spriteset_Battle.prototype.createActors = function () {
    this._actorSprites = [];

    const members = $gameParty.battleMembers();
    const count = members.length;
    if (count === 0) return;

    // Get scale from scene
    const scale = SceneManager._scene._uiScale || 1.0;

    for (let i = 0; i < $gameParty.maxBattleMembers(); i++) {
        if (i >= members.length) break;

        const battler = members[i];
        const sprite = new CY_Sprite_PlayerBattler();
        sprite.setBattler(battler);

        // Apply Scale
        sprite.scale.set(scale, scale);

        // Position with scaled spacing
        // Base X offset + (Index * Scaled Spacing)
        sprite.x = (Graphics.boxWidth * 0.05) + (i * 120 * scale);
        sprite.y = Graphics.boxHeight - (100 * scale);

        // InfoBar
        const hp = new CY_Sprite_InfoBar();
        hp.anchor.set(0.5, 1);
        hp.setup(battler);
        hp.y = -340; // Relative to sprite
        hp.x = -40;
        sprite.addChild(hp);

        this._actorSprites.push(sprite);
        this._battleField.addChild(sprite);
    }
};

CY_Spriteset_Battle.prototype.createEnemies = function () {
    const scale = SceneManager._scene._uiScale || 1.0;
    const enemies = $gameTroop.members();
    const sprites = [];

    // Layout Constants match CY_Game_Enemy.setupTroopFormatted
    const cols = 3;
    const startX = Graphics.boxWidth - (80 * scale);
    const startY = Graphics.boxHeight * 0.55;
    const hSpacing = 180 * scale;
    const vSpacing = 120 * scale;

    let i = 0;
    for (const enemy of enemies) {
        const sprite = new Sprite_Enemy(enemy);
        sprite.scale.set(scale, scale);

        // Position Logic
        if (enemy.enemyId() !== 5) {
            const col = i % cols;
            const row = Math.floor(i / cols);
            // Calculate X from Right edge
            const x = startX - (cols - col - 1) * hSpacing - ((i >= 3 && i < 6) ? hSpacing * 0.5 : 0);
            const y = startY + row * vSpacing;

            // Set sprite home
            sprite.setHome(x, y);
            // Update enemy object for consistency
            enemy._screenX = x;
            enemy._screenY = y;

            i++;
        } else {
            // Preserve existing position for special enemy
            sprite.setHome(enemy.screenX(), enemy.screenY());
        }

        // Add HP/Info Gauge (Same style as Party)
        const hp = new CY_Sprite_InfoBar();
        hp.anchor.set(0.5, 1);
        hp.setup(enemy);

        // Counter-scale the HP bar so it stays readable if the enemy is very small
        // This ensures the bar is effectively 1.0 scale relative to the screen
        const invScale = 1.0 / scale;
        hp.scale.set(invScale, invScale);

        // Position relative to enemy sprite.
        // Note: Enemy sprites vary in height. We can try a fixed offset or dynamic.
        // For now, mirroring the actor offset but checking if we can do better.
        // Since bitmap might not be loaded, fixed is safer for immediate setup. 
        hp.y = -startY - sprite.height * sprite.scale.y; // Default somewhat lower than actors who might be tall
        hp.x = 0;

        sprite.addChild(hp);

        sprites.push(sprite);
    }

    sprites.sort(this.compareEnemySprite.bind(this));
    for (const sprite of sprites) {
        this._battleField.addChild(sprite);
    }
    this._enemySprites = sprites;
};

CY_Spriteset_Battle.prototype.updateActors = function () {
    Spriteset_Battle.prototype.updateActors.call(this);
};

CY_Spriteset_Battle.prototype.refreshLayout = function (scale) {
    this.recreateForResize(scale);
};

// Force Battleback to Factory
CY_Spriteset_Battle.prototype.battleback1Name = function () {
    return 'Factory';
};

CY_Spriteset_Battle.prototype.battleback2Name = function () {
    return ''; // Usually Factory is just one image or they act together. Assuming Factory implies Factory for back1.
    // If back2 is needed, the user might have meant both. Let's try just back1 for now or check if back2 exists?
    // Safest is maybe set back1 to Factory and back2 to empty or Factory depending on file structure.
    // Given "Force battleback to Factory", I'll set back1='Factory'.
};

CY_Spriteset_Battle.prototype.createBattleField = function () {
    // Override to use full Graphics width/height so it resizes/fills properly
    var width = Graphics.width;
    var height = Graphics.height;
    var x = 0;
    var y = 0;
    this._battleField = new Sprite();
    this._battleField.setFrame(x, y, width, height);
    this._battleField.x = x;
    this._battleField.y = y;
    this._baseSprite.addChild(this._battleField);
};

CY_Spriteset_Battle.prototype.recreateForResize = function (scale) {
    if (!scale) scale = 1.0;

    console.log("recreateForResize: Full Refresh");

    this.setFrame(0, 0, Graphics.width, Graphics.height);
    this._tone = [0, 0, 0, 0];
    this.opaque = true;
    this.createLowerLayer();
    this.createToneChanger();
    this.createUpperLayer();


    // 4. Recreate Enemies (First, for depth)
    this.createEnemies();

    // 5. Recreate Actors
    this.createActors();

    this.update();


    // 1. Destroy old BattleField and all its children (Battlebacks, Enemies, Actors)
    if (this._battleField) {
        this._baseSprite.removeChild(this._battleField);
        // We don't strictly need to destroy children as they will be GC'd, 
        // but clearing references is good.
        this._battleField = null;
        this._back1Sprite = null;
        this._back2Sprite = null;
        this._actorSprites = [];
        this._enemySprites = [];
    }


};
