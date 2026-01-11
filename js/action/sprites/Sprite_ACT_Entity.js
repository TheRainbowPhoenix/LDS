//=============================================================================
// Sprite_ACT_Entity - Base Entity Sprite
//=============================================================================

/**
 * Base sprite class for action entities.
 * 
 * @class Sprite_ACT_Entity
 * @extends Sprite
 */
function Sprite_ACT_Entity() {
    this.initialize.apply(this, arguments);
}

Sprite_ACT_Entity.prototype = Object.create(Sprite.prototype);
Sprite_ACT_Entity.prototype.constructor = Sprite_ACT_Entity;

Sprite_ACT_Entity.prototype.initialize = function(entity) {
    Sprite.prototype.initialize.call(this);
    
    /**
     * Reference to entity
     * @type {ACT_Entity}
     */
    this.entity = entity;
    
    if (entity) {
        entity.sprite = this;
    }
    
    /**
     * Animation frame
     */
    this.animFrame = 0;
    this.animTimer = 0;
    this.animSpeed = 8; // Frames per animation frame
    
    /**
     * Flash effect
     */
    this.flashColor = [255, 255, 255, 0];
    this.flashDuration = 0;
    
    this.anchor.x = 0.5;
    this.anchor.y = 0.5;
    
    this.setupBitmap();
};

/**
 * Setup the sprite bitmap
 */
Sprite_ACT_Entity.prototype.setupBitmap = function() {
    // Override in subclasses
    this.bitmap = new Bitmap(32, 32);
    this.bitmap.fillRect(0, 0, 32, 32, '#ff00ff');
};

/**
 * Update sprite
 */
Sprite_ACT_Entity.prototype.update = function() {
    Sprite.prototype.update.call(this);
    
    if (!this.entity) return;
    
    this.updatePosition();
    this.updateVisibility();
    this.updateAnimation();
    this.updateFlash();
};

/**
 * Update position from entity
 */
Sprite_ACT_Entity.prototype.updatePosition = function() {
    // Position is set by spriteset based on camera
};

/**
 * Update visibility
 */
Sprite_ACT_Entity.prototype.updateVisibility = function() {
    this.visible = this.entity.visible && this.entity.active;
    
    // Invincibility flicker
    if (this.entity.isInvincible) {
        this.visible = this.entity.invincibleCounter % 4 < 2;
    }
};

/**
 * Update animation
 */
Sprite_ACT_Entity.prototype.updateAnimation = function() {
    this.animTimer++;
    
    if (this.animTimer >= this.animSpeed) {
        this.animTimer = 0;
        this.animFrame++;
        this.updateFrame();
    }
    
    // Update facing
    this.scale.x = this.entity.facing;
};

/**
 * Update sprite frame
 */
Sprite_ACT_Entity.prototype.updateFrame = function() {
    // Override in subclasses
};

/**
 * Update flash effect
 */
Sprite_ACT_Entity.prototype.updateFlash = function() {
    if (this.flashDuration > 0) {
        this.flashDuration--;
        this.flashColor[3] = Math.floor(this.flashColor[3] * 0.9);
        this.setBlendColor(this.flashColor);
    }
};

/**
 * Start flash effect
 */
Sprite_ACT_Entity.prototype.flash = function(color, duration) {
    this.flashColor = color || [255, 255, 255, 255];
    this.flashDuration = duration || 10;
    this.setBlendColor(this.flashColor);
};

//=============================================================================
// Sprite_ACT_Player - Player Sprite
//=============================================================================

/**
 * Sprite for player character.
 * Uses RPG Maker character sheets.
 * 
 * @class Sprite_ACT_Player
 * @extends Sprite_ACT_Entity
 */
function Sprite_ACT_Player() {
    this.initialize.apply(this, arguments);
}

Sprite_ACT_Player.prototype = Object.create(Sprite_ACT_Entity.prototype);
Sprite_ACT_Player.prototype.constructor = Sprite_ACT_Player;

Sprite_ACT_Player.prototype.initialize = function(entity) {
    Sprite_ACT_Entity.prototype.initialize.call(this, entity);
    
    this.characterName = '';
    this.characterIndex = 0;
    this.pattern = 0;
    this.direction = 2; // Down
    
    this.animSpeed = 6;
};

Sprite_ACT_Player.prototype.setupBitmap = function() {
    // Load from actor data
    if ($gameParty && $gameParty.leader()) {
        var actor = $gameParty.leader();
        this.characterName = actor.characterName();
        this.characterIndex = actor.characterIndex();
        this.loadCharacter();
    } else {
        // Fallback
        Sprite_ACT_Entity.prototype.setupBitmap.call(this);
    }
};

Sprite_ACT_Player.prototype.loadCharacter = function() {
    this.bitmap = ImageManager.loadCharacter(this.characterName);
};

Sprite_ACT_Player.prototype.updateFrame = function() {
    if (!this.bitmap || !this.bitmap.isReady()) return;
    
    // Determine pattern based on animation state
    var state = this.entity.animState;
    
    switch (state) {
        case 'idle':
            this.pattern = 1;
            this.direction = 2;
            break;
        case 'run':
            this.pattern = (this.animFrame % 4);
            if (this.pattern === 3) this.pattern = 1;
            this.direction = this.entity.facing > 0 ? 6 : 4;
            break;
        case 'jump':
        case 'fall':
            this.pattern = 0;
            this.direction = 8;
            break;
        case 'dash':
            this.pattern = 2;
            this.direction = this.entity.facing > 0 ? 6 : 4;
            break;
        case 'wallslide':
            this.pattern = 1;
            this.direction = 8;
            break;
    }
    
    this.setCharacterFrame();
};

Sprite_ACT_Player.prototype.setCharacterFrame = function() {
    var pw = this.patternWidth();
    var ph = this.patternHeight();
    var sx = (this.characterIndex % 4 * 3 + this.pattern) * pw;
    var sy = (Math.floor(this.characterIndex / 4) * 4 + (this.direction - 2) / 2) * ph;
    
    this.setFrame(sx, sy, pw, ph);
};

Sprite_ACT_Player.prototype.patternWidth = function() {
    if (this.bitmap) {
        if (this.isBigCharacter()) {
            return this.bitmap.width / 3;
        } else {
            return this.bitmap.width / 12;
        }
    }
    return 0;
};

Sprite_ACT_Player.prototype.patternHeight = function() {
    if (this.bitmap) {
        if (this.isBigCharacter()) {
            return this.bitmap.height / 4;
        } else {
            return this.bitmap.height / 8;
        }
    }
    return 0;
};

Sprite_ACT_Player.prototype.isBigCharacter = function() {
    return this.characterName.match(/^\!/);
};

//=============================================================================
// Sprite_ACT_Enemy - Enemy Sprite
//=============================================================================

/**
 * Sprite for enemy entities.
 * 
 * @class Sprite_ACT_Enemy
 * @extends Sprite_ACT_Entity
 */
function Sprite_ACT_Enemy() {
    this.initialize.apply(this, arguments);
}

Sprite_ACT_Enemy.prototype = Object.create(Sprite_ACT_Entity.prototype);
Sprite_ACT_Enemy.prototype.constructor = Sprite_ACT_Enemy;

Sprite_ACT_Enemy.prototype.initialize = function(entity) {
    Sprite_ACT_Entity.prototype.initialize.call(this, entity);
    
    this.enemyId = entity ? entity.enemyId : 1;
};

Sprite_ACT_Enemy.prototype.setupBitmap = function() {
    if (!this.entity) {
        Sprite_ACT_Entity.prototype.setupBitmap.call(this);
        return;
    }
    
    // Load from enemy data
    var enemyData = $dataEnemies[this.entity.enemyId];
    if (enemyData && enemyData.battlerName) {
        this.bitmap = ImageManager.loadEnemy(enemyData.battlerName);
    } else {
        // Fallback colored rectangle
        this.bitmap = new Bitmap(32, 32);
        this.bitmap.fillRect(0, 0, 32, 32, '#ff0000');
    }
};

Sprite_ACT_Enemy.prototype.updateFrame = function() {
    // Simple animation - could be expanded
    var state = this.entity.animState;
    
    // For now, just use full bitmap
    if (this.bitmap && this.bitmap.isReady()) {
        this.setFrame(0, 0, this.bitmap.width, this.bitmap.height);
    }
};

//=============================================================================
// Sprite_ACT_Bullet - Bullet Sprite
//=============================================================================

/**
 * Sprite for bullets/projectiles.
 * 
 * @class Sprite_ACT_Bullet
 * @extends Sprite_ACT_Entity
 */
function Sprite_ACT_Bullet() {
    this.initialize.apply(this, arguments);
}

Sprite_ACT_Bullet.prototype = Object.create(Sprite_ACT_Entity.prototype);
Sprite_ACT_Bullet.prototype.constructor = Sprite_ACT_Bullet;

Sprite_ACT_Bullet.prototype.initialize = function(entity) {
    Sprite_ACT_Entity.prototype.initialize.call(this, entity);
    
    this.blendMode = 1; // Additive blending
};

Sprite_ACT_Bullet.prototype.setupBitmap = function() {
    // Simple bullet graphic
    this.bitmap = new Bitmap(16, 16);
    
    var ctx = this.bitmap._context;
    var gradient = ctx.createRadialGradient(8, 8, 0, 8, 8, 8);
    gradient.addColorStop(0, '#ffffff');
    gradient.addColorStop(0.5, '#00ffff');
    gradient.addColorStop(1, 'rgba(0, 255, 255, 0)');
    
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(8, 8, 8, 0, Math.PI * 2);
    ctx.fill();
    
    this.bitmap._baseTexture.update();
};

Sprite_ACT_Bullet.prototype.updateAnimation = function() {
    // Rotate based on velocity
    if (this.entity && this.entity.body) {
        var vx = this.entity.body.velocity.x;
        var vy = this.entity.body.velocity.y;
        this.rotation = Math.atan2(vy, vx);
    }
};

//=============================================================================
// Sprite_ACT_HpGauge - HP Gauge Sprite
//=============================================================================

/**
 * HP gauge displayed above entities.
 * 
 * @class Sprite_ACT_HpGauge
 * @extends Sprite
 */
function Sprite_ACT_HpGauge() {
    this.initialize.apply(this, arguments);
}

Sprite_ACT_HpGauge.prototype = Object.create(Sprite.prototype);
Sprite_ACT_HpGauge.prototype.constructor = Sprite_ACT_HpGauge;

Sprite_ACT_HpGauge.prototype.initialize = function(entity) {
    Sprite.prototype.initialize.call(this);
    
    this.entity = entity;
    this.gaugeWidth = 40;
    this.gaugeHeight = 4;
    
    this.bitmap = new Bitmap(this.gaugeWidth, this.gaugeHeight);
    this.anchor.x = 0.5;
    this.anchor.y = 1;
    
    this._hp = 0;
    this._maxHp = 0;
};

Sprite_ACT_HpGauge.prototype.update = function() {
    Sprite.prototype.update.call(this);
    
    if (!this.entity) return;
    
    if (this._hp !== this.entity.hp || this._maxHp !== this.entity.maxHp) {
        this._hp = this.entity.hp;
        this._maxHp = this.entity.maxHp;
        this.refresh();
    }
};

Sprite_ACT_HpGauge.prototype.refresh = function() {
    this.bitmap.clear();
    
    if (this._maxHp <= 0) return;
    
    var rate = this._hp / this._maxHp;
    var fillWidth = Math.floor(this.gaugeWidth * rate);
    
    // Background
    this.bitmap.fillRect(0, 0, this.gaugeWidth, this.gaugeHeight, '#000000');
    
    // Fill
    var color = rate > 0.5 ? '#00ff00' : rate > 0.25 ? '#ffff00' : '#ff0000';
    this.bitmap.fillRect(1, 1, fillWidth - 2, this.gaugeHeight - 2, color);
};
