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

    const leftW = Graphics.boxWidth * 0.05;
    const spacing = leftW / (count + 1);
    const yPos = Graphics.boxHeight - 48;

    for (let i = 0; i < $gameParty.maxBattleMembers(); i++) {
        // Even if member is null initially, we create sprite?
        // CorruptBattleLine: loops maxBattleMembers, but uses members[i].
        // If members[i] is undefined, Sprite_PlayerBattler might crash if not handled.
        // But members array is usually filtered active members.
        if (i >= members.length) break;

        const battler = members[i];
        const sprite = new CY_Sprite_PlayerBattler();
        sprite.setBattler(battler);

        // Position: CorruptBattleLine layout
        // It says: spacing * (i + 1) for X.
        // Wait, leftW is 5% of width. Spacing is tiny?
        // CorruptBattleLine line 447: leftW = boxWidth * 0.05
        // line 448: spacing = leftW / (count + 1)
        // sprite.x = spacing * (i+1)
        // This puts them extremely close to the left edge (within 5% margin).
        // Seems correct based on request "actors on the left".

        sprite.x = spacing * (i + 1) + 100; // Adding offset to be visible? The ref code didn't have +100.
        // Ref code: sprite.x = spacing * (i + 1);
        // I will trust the ref code.
        sprite.x = spacing * (i + 1);
        sprite.y = yPos;

        // InfoBar
        const hp = new CY_Sprite_InfoBar();
        hp.anchor.set(0.5, 1);
        hp.setup(battler);
        hp.y = -340;
        hp.x = -40; // Relative to sprite
        sprite.addChild(hp);

        this._actorSprites.push(sprite);
        this._battleField.addChild(sprite);
    }
};

CY_Spriteset_Battle.prototype.createEnemies = function () {
    const enemies = $gameTroop.members();
    const sprites = [];
    for (const enemy of enemies) {
        sprites.push(new Sprite_Enemy(enemy));
    }
    sprites.sort(this.compareEnemySprite.bind(this));
    for (const sprite of sprites) {
        this._battleField.addChild(sprite);
    }
    this._enemySprites = sprites;
};

CY_Spriteset_Battle.prototype.updateActors = function () {
    const members = $gameParty.battleMembers();
    Spriteset_Battle.prototype.updateActors.call(this);
    // Custom update logic if needed
};
