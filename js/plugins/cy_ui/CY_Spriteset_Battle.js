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
    // Ensure enemies are positioned correctly before creating sprites
    if (CY_Game_Enemy && CY_Game_Enemy.setupTroopFormatted) {
        CY_Game_Enemy.setupTroopFormatted();
    }

    const scale = SceneManager._scene._uiScale || 1.0;

    const enemies = $gameTroop.members();
    const sprites = [];
    for (const enemy of enemies) {
        const sprite = new Sprite_Enemy(enemy);
        // Apply scale
        sprite.scale.set(scale, scale);
        // Position is set by setBattler -> setHome -> enemy.screenX/Y
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

CY_Spriteset_Battle.prototype.recreateForResize = function (scale) {
    if (!scale) scale = 1.0;

    console.log("recreateForResize")

    // 1. Remove Old Actor Sprites
    if (this._actorSprites) {
        for (const sprite of this._actorSprites) {
            this._battleField.removeChild(sprite);
        }
        this._actorSprites = [];
    }

    // 2. Remove Old Enemy Sprites
    if (this._enemySprites) {
        for (const sprite of this._enemySprites) {
            this._battleField.removeChild(sprite);
        }
        this._enemySprites = [];
    }

    // 3. Re-Create with new Scale
    this.createActors();
    this.createEnemies();
};
