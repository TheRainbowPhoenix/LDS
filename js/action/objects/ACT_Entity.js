//=============================================================================
// ACT_Entity - Base Game Entity
//=============================================================================

/**
 * Base class for all action game entities (player, enemies, items, etc.)
 * Combines a physics body with game logic.
 * 
 * @class ACT_Entity
 */
function ACT_Entity() {
    this.initialize.apply(this, arguments);
}

ACT_Entity.prototype.constructor = ACT_Entity;

ACT_Entity.prototype.initialize = function(x, y, width, height) {
    /**
     * Unique ID
     */
    this.id = ACT_Entity._nextId++;
    
    /**
     * Entity type identifier
     */
    this.type = 'entity';
    
    /**
     * Is entity active?
     */
    this.active = true;
    
    /**
     * Is entity visible?
     */
    this.visible = true;
    
    /**
     * Physics body
     * @type {ACT_Body}
     */
    this.body = new ACT_Body(x, y, width, height);
    this.body.entity = this;
    
    /**
     * Facing direction (-1 = left, 1 = right)
     */
    this.facing = 1;
    
    /**
     * Animation state
     */
    this.animState = 'idle';
    
    /**
     * Sprite reference (set by sprite system)
     */
    this.sprite = null;
    
    /**
     * Tags for filtering
     * @type {Set}
     */
    this.tags = new Set();
    
    /**
     * Custom properties
     */
    this.properties = {};
};

ACT_Entity._nextId = 0;

// Position shortcuts
Object.defineProperties(ACT_Entity.prototype, {
    x: {
        get: function() { return this.body.x; },
        set: function(value) { this.body.x = value; }
    },
    y: {
        get: function() { return this.body.y; },
        set: function(value) { this.body.y = value; }
    },
    width: {
        get: function() { return this.body.width; }
    },
    height: {
        get: function() { return this.body.height; }
    }
});

/**
 * Update entity (called each frame)
 * @param {number} delta - Time since last frame
 */
ACT_Entity.prototype.update = function(delta) {
    if (!this.active) return;
    
    this.updateFacing();
    this.updateAnimation();
};

/**
 * Update facing direction based on velocity
 */
ACT_Entity.prototype.updateFacing = function() {
    if (this.body.velocity.x < 0) {
        this.facing = -1;
    } else if (this.body.velocity.x > 0) {
        this.facing = 1;
    }
};

/**
 * Update animation state
 */
ACT_Entity.prototype.updateAnimation = function() {
    // Override in subclasses
};

/**
 * Set position
 */
ACT_Entity.prototype.setPosition = function(x, y) {
    this.body.setPosition(x, y);
};

/**
 * Add a tag
 */
ACT_Entity.prototype.addTag = function(tag) {
    this.tags.add(tag);
};

/**
 * Remove a tag
 */
ACT_Entity.prototype.removeTag = function(tag) {
    this.tags.delete(tag);
};

/**
 * Check if has tag
 */
ACT_Entity.prototype.hasTag = function(tag) {
    return this.tags.has(tag);
};

/**
 * Called when colliding with another entity
 */
ACT_Entity.prototype.onCollide = function(other) {
    // Override in subclasses
};

/**
 * Called when overlapping another entity
 */
ACT_Entity.prototype.onOverlap = function(other) {
    // Override in subclasses
};

/**
 * Destroy this entity
 */
ACT_Entity.prototype.destroy = function() {
    this.active = false;
    this.visible = false;
    if (this.body) {
        this.body.destroy();
    }
    if (this.sprite) {
        this.sprite.visible = false;
    }
};

//=============================================================================
// ACT_Player - Player Character
//=============================================================================

/**
 * Player character with platformer controls.
 * 
 * @class ACT_Player
 * @extends ACT_Entity
 */
function ACT_Player() {
    this.initialize.apply(this, arguments);
}

ACT_Player.prototype = Object.create(ACT_Entity.prototype);
ACT_Player.prototype.constructor = ACT_Player;

ACT_Player.prototype.initialize = function(x, y) {
    ACT_Entity.prototype.initialize.call(this, x, y, 24, 40);
    
    this.type = 'player';
    this.addTag('player');
    
    // Movement parameters
    this.moveSpeed = 4;
    this.jumpForce = -10;
    this.dashSpeed = 12;
    this.wallJumpForce = new ACT_Vector2(6, -9);
    
    // Jump state
    this.canJump = true;
    this.jumpCount = 0;
    this.maxJumps = 1;
    this.coyoteTime = 6; // Frames of grace period after leaving ground
    this.coyoteCounter = 0;
    this.jumpBufferTime = 6; // Frames to buffer jump input
    this.jumpBufferCounter = 0;
    
    // Dash state
    this.canDash = true;
    this.isDashing = false;
    this.dashDuration = 8;
    this.dashCounter = 0;
    this.dashCooldown = 30;
    this.dashCooldownCounter = 0;
    
    // Wall slide/jump
    this.canWallJump = true;
    this.isWallSliding = false;
    this.wallSlideSpeed = 2;
    
    // Invincibility
    this.isInvincible = false;
    this.invincibleTime = 60;
    this.invincibleCounter = 0;
    
    // Stats (can link to RPG Maker actor)
    this.hp = 100;
    this.maxHp = 100;
    this.actorId = 1; // Link to $gameActors
    
    // Configure body
    this.body.setDrag(0.8, 0);
    this.body.setMaxVelocity(this.moveSpeed, 15);
    this.body.collideWorldBounds = true;
};

ACT_Player.prototype.update = function(delta) {
    if (!this.active) return;
    
    this.handleInput();
    this.updateJumpState();
    this.updateDashState();
    this.updateWallSlide();
    this.updateInvincibility();
    
    ACT_Entity.prototype.update.call(this, delta);
};

ACT_Player.prototype.handleInput = function() {
    if (this.isDashing) return;
    
    // Horizontal movement
    var moveX = 0;
    if (Input.isPressed('left')) moveX -= 1;
    if (Input.isPressed('right')) moveX += 1;
    
    this.body.velocity.x = moveX * this.moveSpeed;
    
    // Jump input buffering
    if (Input.isTriggered('ok') || Input.isTriggered('jump')) {
        this.jumpBufferCounter = this.jumpBufferTime;
    }
    
    // Try to jump
    if (this.jumpBufferCounter > 0) {
        if (this.tryJump()) {
            this.jumpBufferCounter = 0;
        }
    }
    
    // Dash
    if (Input.isTriggered('shift') || Input.isTriggered('dash')) {
        this.tryDash();
    }
};

ACT_Player.prototype.tryJump = function() {
    // Ground jump
    if (this.coyoteCounter > 0 || this.body.onFloor) {
        this.jump();
        return true;
    }
    
    // Wall jump
    if (this.canWallJump && this.body.onWall) {
        this.wallJump();
        return true;
    }
    
    // Double jump
    if (this.jumpCount < this.maxJumps) {
        this.jump();
        return true;
    }
    
    return false;
};

ACT_Player.prototype.jump = function() {
    this.body.velocity.y = this.jumpForce;
    this.jumpCount++;
    this.coyoteCounter = 0;
    this.animState = 'jump';
    
    // Play sound
    if (typeof AudioManager !== 'undefined') {
        AudioManager.playSe({ name: 'Jump1', volume: 80, pitch: 100 });
    }
};

ACT_Player.prototype.wallJump = function() {
    var dir = this.body.blocked.left ? 1 : -1;
    this.body.velocity.x = this.wallJumpForce.x * dir;
    this.body.velocity.y = this.wallJumpForce.y;
    this.jumpCount = 1;
    this.facing = dir;
    this.animState = 'jump';
};

ACT_Player.prototype.tryDash = function() {
    if (!this.canDash || this.dashCooldownCounter > 0) return;
    
    this.isDashing = true;
    this.dashCounter = this.dashDuration;
    this.dashCooldownCounter = this.dashCooldown;
    
    // Dash in facing direction
    this.body.velocity.x = this.dashSpeed * this.facing;
    this.body.velocity.y = 0;
    this.body.allowGravity = false;
    
    this.animState = 'dash';
};

ACT_Player.prototype.updateJumpState = function() {
    // Coyote time
    if (this.body.onFloor) {
        this.coyoteCounter = this.coyoteTime;
        this.jumpCount = 0;
    } else if (this.coyoteCounter > 0) {
        this.coyoteCounter--;
    }
    
    // Jump buffer
    if (this.jumpBufferCounter > 0) {
        this.jumpBufferCounter--;
    }
    
    // Variable jump height
    if (!Input.isPressed('ok') && !Input.isPressed('jump') && this.body.velocity.y < 0) {
        this.body.velocity.y *= 0.5;
    }
};

ACT_Player.prototype.updateDashState = function() {
    if (this.dashCooldownCounter > 0) {
        this.dashCooldownCounter--;
    }
    
    if (this.isDashing) {
        this.dashCounter--;
        if (this.dashCounter <= 0) {
            this.isDashing = false;
            this.body.allowGravity = true;
            this.body.velocity.x *= 0.5;
        }
    }
    
    // Reset dash on landing
    if (this.body.onFloor) {
        this.canDash = true;
    }
};

ACT_Player.prototype.updateWallSlide = function() {
    this.isWallSliding = false;
    
    if (!this.body.onFloor && this.body.onWall && this.body.velocity.y > 0) {
        var touchingWall = (Input.isPressed('left') && this.body.blocked.left) ||
                          (Input.isPressed('right') && this.body.blocked.right);
        
        if (touchingWall) {
            this.isWallSliding = true;
            this.body.velocity.y = Math.min(this.body.velocity.y, this.wallSlideSpeed);
            this.animState = 'wallslide';
        }
    }
};

ACT_Player.prototype.updateInvincibility = function() {
    if (this.isInvincible) {
        this.invincibleCounter--;
        if (this.invincibleCounter <= 0) {
            this.isInvincible = false;
        }
    }
};

ACT_Player.prototype.updateAnimation = function() {
    if (this.isDashing) {
        this.animState = 'dash';
    } else if (this.isWallSliding) {
        this.animState = 'wallslide';
    } else if (!this.body.onFloor) {
        this.animState = this.body.velocity.y < 0 ? 'jump' : 'fall';
    } else if (Math.abs(this.body.velocity.x) > 0.5) {
        this.animState = 'run';
    } else {
        this.animState = 'idle';
    }
};

ACT_Player.prototype.takeDamage = function(amount, knockback) {
    if (this.isInvincible) return;
    
    this.hp -= amount;
    this.isInvincible = true;
    this.invincibleCounter = this.invincibleTime;
    
    if (knockback) {
        this.body.velocity.x = knockback.x;
        this.body.velocity.y = knockback.y;
    }
    
    if (this.hp <= 0) {
        this.die();
    }
};

ACT_Player.prototype.die = function() {
    this.active = false;
    this.animState = 'death';
    // Trigger game over or respawn
};

//=============================================================================
// ACT_Enemy - Base Enemy
//=============================================================================

/**
 * Base enemy class with simple AI.
 * 
 * @class ACT_Enemy
 * @extends ACT_Entity
 */
function ACT_Enemy() {
    this.initialize.apply(this, arguments);
}

ACT_Enemy.prototype = Object.create(ACT_Entity.prototype);
ACT_Enemy.prototype.constructor = ACT_Enemy;

ACT_Enemy.prototype.initialize = function(x, y, width, height) {
    ACT_Entity.prototype.initialize.call(this, x, y, width || 32, height || 32);
    
    this.type = 'enemy';
    this.addTag('enemy');
    
    // Stats
    this.hp = 10;
    this.maxHp = 10;
    this.damage = 10;
    this.enemyId = 1; // Link to $dataEnemies
    
    // AI
    this.aiState = 'patrol';
    this.patrolSpeed = 1;
    this.chaseSpeed = 2;
    this.detectionRange = 150;
    this.attackRange = 40;
    
    // Patrol
    this.patrolDistance = 100;
    this.patrolStart = x;
    
    // Target
    this.target = null;
};

ACT_Enemy.prototype.update = function(delta) {
    if (!this.active) return;
    
    this.updateAI();
    ACT_Entity.prototype.update.call(this, delta);
};

ACT_Enemy.prototype.updateAI = function() {
    switch (this.aiState) {
        case 'patrol':
            this.doPatrol();
            break;
        case 'chase':
            this.doChase();
            break;
        case 'attack':
            this.doAttack();
            break;
    }
};

ACT_Enemy.prototype.doPatrol = function() {
    // Simple back-and-forth patrol
    var distFromStart = this.x - this.patrolStart;
    
    if (distFromStart > this.patrolDistance) {
        this.facing = -1;
    } else if (distFromStart < -this.patrolDistance) {
        this.facing = 1;
    }
    
    this.body.velocity.x = this.patrolSpeed * this.facing;
    
    // Check for player
    if (this.target && this.distanceToTarget() < this.detectionRange) {
        this.aiState = 'chase';
    }
};

ACT_Enemy.prototype.doChase = function() {
    if (!this.target) {
        this.aiState = 'patrol';
        return;
    }
    
    var dist = this.distanceToTarget();
    
    if (dist > this.detectionRange * 1.5) {
        this.aiState = 'patrol';
        return;
    }
    
    if (dist < this.attackRange) {
        this.aiState = 'attack';
        return;
    }
    
    // Move toward target
    var dir = this.target.x > this.x ? 1 : -1;
    this.body.velocity.x = this.chaseSpeed * dir;
    this.facing = dir;
};

ACT_Enemy.prototype.doAttack = function() {
    // Override in subclasses
    this.body.velocity.x = 0;
    
    // Return to chase after attack
    this.aiState = 'chase';
};

ACT_Enemy.prototype.distanceToTarget = function() {
    if (!this.target) return Infinity;
    return Math.abs(this.target.x - this.x);
};

ACT_Enemy.prototype.takeDamage = function(amount) {
    this.hp -= amount;
    
    if (this.hp <= 0) {
        this.die();
    }
};

ACT_Enemy.prototype.die = function() {
    this.active = false;
    this.animState = 'death';
    // Drop items, give exp, etc.
};

ACT_Enemy.prototype.onCollide = function(other) {
    if (other.hasTag && other.hasTag('player')) {
        other.takeDamage(this.damage, {
            x: (other.x > this.x ? 5 : -5),
            y: -5
        });
    }
};
