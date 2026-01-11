//=============================================================================
// ACT_Physics - Core Physics World
//=============================================================================

/**
 * The physics world manages all physics bodies and handles collision detection.
 * Inspired by Phaser's Arcade Physics but simplified for platformer use.
 * 
 * @class ACT_Physics
 */
function ACT_Physics() {
    this.initialize.apply(this, arguments);
}

ACT_Physics.prototype.constructor = ACT_Physics;

ACT_Physics.prototype.initialize = function() {
    /**
     * World gravity
     * @type {ACT_Vector2}
     */
    this.gravity = new ACT_Vector2(0, ACT.Config.GRAVITY);
    
    /**
     * World bounds
     * @type {ACT_AABB}
     */
    this.bounds = new ACT_AABB(0, 0, 800, 600);
    
    /**
     * All active bodies
     * @type {ACT_Body[]}
     */
    this.bodies = [];
    
    /**
     * Static bodies (platforms, walls)
     * @type {ACT_Body[]}
     */
    this.staticBodies = [];
    
    /**
     * Tilemap collision data
     * @type {number[][]}
     */
    this.collisionMap = null;
    
    /**
     * Tile dimensions
     */
    this.tileWidth = ACT.Config.TILE_WIDTH;
    this.tileHeight = ACT.Config.TILE_HEIGHT;
    
    /**
     * Collision bias values
     */
    this.OVERLAP_BIAS = ACT.Config.OVERLAP_BIAS;
    this.TILE_BIAS = ACT.Config.TILE_BIAS;
    
    /**
     * Is physics paused?
     */
    this.isPaused = false;
};

/**
 * Set world bounds
 */
ACT_Physics.prototype.setBounds = function(x, y, width, height) {
    this.bounds.set(x, y, width, height);
};

/**
 * Set collision map from tilemap data
 * @param {number[][]} map - 2D array where non-zero = solid
 */
ACT_Physics.prototype.setCollisionMap = function(map) {
    this.collisionMap = map;
};

/**
 * Add a body to the physics world
 * @param {ACT_Body} body 
 */
ACT_Physics.prototype.addBody = function(body) {
    if (body.isStatic) {
        this.staticBodies.push(body);
    } else {
        this.bodies.push(body);
    }
    body.world = this;
};

/**
 * Remove a body from the physics world
 * @param {ACT_Body} body 
 */
ACT_Physics.prototype.removeBody = function(body) {
    var index = this.bodies.indexOf(body);
    if (index >= 0) {
        this.bodies.splice(index, 1);
    }
    index = this.staticBodies.indexOf(body);
    if (index >= 0) {
        this.staticBodies.splice(index, 1);
    }
    body.world = null;
};

/**
 * Clear all bodies
 */
ACT_Physics.prototype.clear = function() {
    this.bodies = [];
    this.staticBodies = [];
};

/**
 * Main update loop
 * @param {number} delta - Time since last frame in ms
 */
ACT_Physics.prototype.update = function(delta) {
    if (this.isPaused) return;
    
    var deltaSec = delta / 1000;
    
    // Update all dynamic bodies
    for (var i = 0; i < this.bodies.length; i++) {
        var body = this.bodies[i];
        if (body.enable) {
            this.updateBody(body, deltaSec);
        }
    }
};

/**
 * Update a single body
 */
ACT_Physics.prototype.updateBody = function(body, deltaSec) {
    // Store previous position
    body.prev.copy(body.position);
    
    // Reset collision flags
    body.resetCollisionFlags();
    
    // Apply gravity
    if (body.allowGravity) {
        body.velocity.x += (this.gravity.x + body.gravity.x) * deltaSec * 60;
        body.velocity.y += (this.gravity.y + body.gravity.y) * deltaSec * 60;
    }
    
    // Apply acceleration
    body.velocity.x += body.acceleration.x * deltaSec * 60;
    body.velocity.y += body.acceleration.y * deltaSec * 60;
    
    // Apply drag
    if (body.allowDrag) {
        this.applyDrag(body, deltaSec);
    }
    
    // Clamp to max velocity
    body.velocity.x = body.velocity.x.clamp(-body.maxVelocity.x, body.maxVelocity.x);
    body.velocity.y = body.velocity.y.clamp(-body.maxVelocity.y, body.maxVelocity.y);
    
    // Update position
    body.position.x += body.velocity.x * deltaSec * 60;
    body.position.y += body.velocity.y * deltaSec * 60;
    
    // Tilemap collision
    if (this.collisionMap && body.collidesWithTiles) {
        this.collideTilemap(body);
    }
    
    // World bounds collision
    if (body.collideWorldBounds) {
        this.collideWorldBounds(body);
    }
    
    // Update AABB
    body.updateBounds();
};

/**
 * Apply drag to body
 */
ACT_Physics.prototype.applyDrag = function(body, deltaSec) {
    var drag = body.onFloor ? body.drag.x : body.drag.x * 0.5;
    
    if (body.acceleration.x === 0) {
        if (body.velocity.x > 0) {
            body.velocity.x = Math.max(0, body.velocity.x - drag * deltaSec * 60);
        } else if (body.velocity.x < 0) {
            body.velocity.x = Math.min(0, body.velocity.x + drag * deltaSec * 60);
        }
    }
};

/**
 * Collide body with tilemap
 */
ACT_Physics.prototype.collideTilemap = function(body) {
    if (!this.collisionMap) return;
    
    var tileX1 = Math.floor(body.left / this.tileWidth);
    var tileX2 = Math.floor(body.right / this.tileWidth);
    var tileY1 = Math.floor(body.top / this.tileHeight);
    var tileY2 = Math.floor(body.bottom / this.tileHeight);
    
    for (var ty = tileY1; ty <= tileY2; ty++) {
        for (var tx = tileX1; tx <= tileX2; tx++) {
            if (this.isTileSolid(tx, ty)) {
                this.separateFromTile(body, tx, ty);
            }
        }
    }
};

/**
 * Check if tile is solid
 */
ACT_Physics.prototype.isTileSolid = function(tx, ty) {
    if (!this.collisionMap) return false;
    if (ty < 0 || ty >= this.collisionMap.length) return false;
    if (tx < 0 || tx >= this.collisionMap[ty].length) return false;
    return this.collisionMap[ty][tx] !== 0;
};

/**
 * Separate body from a solid tile
 */
ACT_Physics.prototype.separateFromTile = function(body, tx, ty) {
    var tileLeft = tx * this.tileWidth;
    var tileRight = tileLeft + this.tileWidth;
    var tileTop = ty * this.tileHeight;
    var tileBottom = tileTop + this.tileHeight;
    
    // Check if actually overlapping
    if (body.right <= tileLeft || body.left >= tileRight ||
        body.bottom <= tileTop || body.top >= tileBottom) {
        return;
    }
    
    // Calculate overlaps
    var overlapX = 0;
    var overlapY = 0;
    
    // Determine separation direction based on previous position
    var wasLeft = body.prev.x + body.halfWidth <= tileLeft;
    var wasRight = body.prev.x - body.halfWidth >= tileRight;
    var wasAbove = body.prev.y + body.halfHeight <= tileTop;
    var wasBelow = body.prev.y - body.halfHeight >= tileBottom;
    
    if (wasAbove && body.velocity.y > 0) {
        // Coming from above - land on top
        overlapY = body.bottom - tileTop;
        if (overlapY > 0 && overlapY < this.TILE_BIAS) {
            body.position.y -= overlapY;
            body.velocity.y = body.bounce.y > 0 ? -body.velocity.y * body.bounce.y : 0;
            body.blocked.down = true;
            body.onFloor = true;
        }
    } else if (wasBelow && body.velocity.y < 0) {
        // Coming from below - hit ceiling
        overlapY = tileBottom - body.top;
        if (overlapY > 0 && overlapY < this.TILE_BIAS) {
            body.position.y += overlapY;
            body.velocity.y = body.bounce.y > 0 ? -body.velocity.y * body.bounce.y : 0;
            body.blocked.up = true;
        }
    }
    
    if (wasLeft && body.velocity.x > 0) {
        // Coming from left - hit left wall
        overlapX = body.right - tileLeft;
        if (overlapX > 0 && overlapX < this.TILE_BIAS) {
            body.position.x -= overlapX;
            body.velocity.x = body.bounce.x > 0 ? -body.velocity.x * body.bounce.x : 0;
            body.blocked.right = true;
        }
    } else if (wasRight && body.velocity.x < 0) {
        // Coming from right - hit right wall
        overlapX = tileRight - body.left;
        if (overlapX > 0 && overlapX < this.TILE_BIAS) {
            body.position.x += overlapX;
            body.velocity.x = body.bounce.x > 0 ? -body.velocity.x * body.bounce.x : 0;
            body.blocked.left = true;
        }
    }
};

/**
 * Collide body with world bounds
 */
ACT_Physics.prototype.collideWorldBounds = function(body) {
    if (body.left < this.bounds.left) {
        body.position.x = this.bounds.left + body.halfWidth;
        body.velocity.x = body.bounce.x > 0 ? -body.velocity.x * body.bounce.x : 0;
        body.blocked.left = true;
    } else if (body.right > this.bounds.right) {
        body.position.x = this.bounds.right - body.halfWidth;
        body.velocity.x = body.bounce.x > 0 ? -body.velocity.x * body.bounce.x : 0;
        body.blocked.right = true;
    }
    
    if (body.top < this.bounds.top) {
        body.position.y = this.bounds.top + body.halfHeight;
        body.velocity.y = body.bounce.y > 0 ? -body.velocity.y * body.bounce.y : 0;
        body.blocked.up = true;
    } else if (body.bottom > this.bounds.bottom) {
        body.position.y = this.bounds.bottom - body.halfHeight;
        body.velocity.y = body.bounce.y > 0 ? -body.velocity.y * body.bounce.y : 0;
        body.blocked.down = true;
        body.onFloor = true;
    }
};

/**
 * Check collision between two bodies
 */
ACT_Physics.prototype.collide = function(body1, body2, callback, context) {
    if (!body1.enable || !body2.enable) return false;
    if (!body1.bounds.intersects(body2.bounds)) return false;
    
    var separated = this.separate(body1, body2);
    
    if (separated && callback) {
        callback.call(context, body1, body2);
    }
    
    return separated;
};

/**
 * Separate two overlapping bodies
 */
ACT_Physics.prototype.separate = function(body1, body2) {
    var overlap = body1.bounds.getOverlap(body2.bounds);
    
    if (Math.abs(overlap.x) < Math.abs(overlap.y)) {
        // Separate on X axis
        return this.separateX(body1, body2, overlap.x);
    } else {
        // Separate on Y axis
        return this.separateY(body1, body2, overlap.y);
    }
};

ACT_Physics.prototype.separateX = function(body1, body2, overlap) {
    if (body1.immovable && body2.immovable) return false;
    
    var v1 = body1.velocity.x;
    var v2 = body2.velocity.x;
    
    if (!body1.immovable && !body2.immovable) {
        overlap *= 0.5;
        body1.position.x -= overlap;
        body2.position.x += overlap;
        
        var avg = (v1 + v2) / 2;
        body1.velocity.x = avg;
        body2.velocity.x = avg;
    } else if (!body1.immovable) {
        body1.position.x -= overlap;
        body1.velocity.x = v2 - v1 * body1.bounce.x;
    } else {
        body2.position.x += overlap;
        body2.velocity.x = v1 - v2 * body2.bounce.x;
    }
    
    return true;
};

ACT_Physics.prototype.separateY = function(body1, body2, overlap) {
    if (body1.immovable && body2.immovable) return false;
    
    var v1 = body1.velocity.y;
    var v2 = body2.velocity.y;
    
    if (!body1.immovable && !body2.immovable) {
        overlap *= 0.5;
        body1.position.y -= overlap;
        body2.position.y += overlap;
        
        var avg = (v1 + v2) / 2;
        body1.velocity.y = avg;
        body2.velocity.y = avg;
    } else if (!body1.immovable) {
        body1.position.y -= overlap;
        body1.velocity.y = v2 - v1 * body1.bounce.y;
        if (overlap > 0) body1.onFloor = true;
    } else {
        body2.position.y += overlap;
        body2.velocity.y = v1 - v2 * body2.bounce.y;
        if (overlap < 0) body2.onFloor = true;
    }
    
    return true;
};

/**
 * Check overlap without separation
 */
ACT_Physics.prototype.overlap = function(body1, body2, callback, context) {
    if (!body1.enable || !body2.enable) return false;
    
    var overlaps = body1.bounds.intersects(body2.bounds);
    
    if (overlaps && callback) {
        callback.call(context, body1, body2);
    }
    
    return overlaps;
};
