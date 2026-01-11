//=============================================================================
// ACT_World - Action Game World
//=============================================================================

/**
 * The game world manages all entities, physics, and level data.
 * Acts as the main container for action gameplay.
 * 
 * @class ACT_World
 */
function ACT_World() {
    this.initialize.apply(this, arguments);
}

ACT_World.prototype.constructor = ACT_World;

ACT_World.prototype.initialize = function() {
    /**
     * Physics engine
     * @type {ACT_Physics}
     */
    this.physics = new ACT_Physics();
    
    /**
     * All entities
     * @type {ACT_Entity[]}
     */
    this.entities = [];
    
    /**
     * Player reference
     * @type {ACT_Player}
     */
    this.player = null;
    
    /**
     * Bullet pool
     * @type {ACT_BulletPool}
     */
    this.bullets = new ACT_BulletPool(200);
    
    /**
     * Level data
     */
    this.levelData = null;
    this.mapWidth = 0;
    this.mapHeight = 0;
    
    /**
     * Camera position
     */
    this.cameraX = 0;
    this.cameraY = 0;
    
    /**
     * Is world paused?
     */
    this.isPaused = false;
    
    /**
     * Collision groups
     */
    this.groups = {
        players: [],
        enemies: [],
        items: [],
        triggers: []
    };
};

/**
 * Load a level from data
 * @param {Object} levelData - Level configuration
 */
ACT_World.prototype.loadLevel = function(levelData) {
    this.clear();
    
    this.levelData = levelData;
    this.mapWidth = levelData.width * ACT.Config.TILE_WIDTH;
    this.mapHeight = levelData.height * ACT.Config.TILE_HEIGHT;
    
    // Set physics bounds
    this.physics.setBounds(0, 0, this.mapWidth, this.mapHeight);
    
    // Load collision map
    if (levelData.collision) {
        this.physics.setCollisionMap(levelData.collision);
    }
    
    // Spawn entities from level data
    if (levelData.entities) {
        for (var i = 0; i < levelData.entities.length; i++) {
            this.spawnEntity(levelData.entities[i]);
        }
    }
    
    // Spawn player
    if (levelData.playerStart) {
        this.spawnPlayer(levelData.playerStart.x, levelData.playerStart.y);
    }
};

/**
 * Load level from RPG Maker map
 * @param {number} mapId - Map ID to load
 */
ACT_World.prototype.loadFromRPGMap = function(mapId) {
    var mapData = $dataMap; // Assumes map is already loaded
    
    if (!mapData) {
        console.error('Map data not loaded');
        return;
    }
    
    this.clear();
    
    this.mapWidth = mapData.width * ACT.Config.TILE_WIDTH;
    this.mapHeight = mapData.height * ACT.Config.TILE_HEIGHT;
    
    this.physics.setBounds(0, 0, this.mapWidth, this.mapHeight);
    
    // Build collision map from tileset
    var collision = this.buildCollisionFromTilemap(mapData);
    this.physics.setCollisionMap(collision);
    
    // Spawn player at transfer position or map start
    var startX = ($gamePlayer._newX || $gamePlayer.x) * ACT.Config.TILE_WIDTH + ACT.Config.TILE_WIDTH / 2;
    var startY = ($gamePlayer._newY || $gamePlayer.y) * ACT.Config.TILE_HEIGHT + ACT.Config.TILE_HEIGHT / 2;
    this.spawnPlayer(startX, startY);
    
    // Convert events to entities
    this.loadEventsAsEntities(mapData.events);
};

/**
 * Build collision map from RPG Maker tilemap
 */
ACT_World.prototype.buildCollisionFromTilemap = function(mapData) {
    var collision = [];
    var width = mapData.width;
    var height = mapData.height;
    
    for (var y = 0; y < height; y++) {
        collision[y] = [];
        for (var x = 0; x < width; x++) {
            // Check if tile is passable (simplified - check all layers)
            var passable = this.isTilePassable(mapData, x, y);
            collision[y][x] = passable ? 0 : 1;
        }
    }
    
    return collision;
};

/**
 * Check if a tile is passable
 */
ACT_World.prototype.isTilePassable = function(mapData, x, y) {
    // Simplified passability check
    // In full implementation, would check tileset flags
    var flags = $gameMap.tilesetFlags();
    var tiles = [];
    
    // Get tile IDs at position
    for (var i = 0; i < 4; i++) {
        var tileId = mapData.data[(i * mapData.height + y) * mapData.width + x];
        if (tileId > 0) {
            tiles.push(tileId);
        }
    }
    
    // Check flags
    for (var j = 0; j < tiles.length; j++) {
        var flag = flags[tiles[j]];
        if ((flag & 0x10) !== 0) continue; // Star passability
        if ((flag & 0x0f) === 0x0f) return false; // Impassable
    }
    
    return true;
};

/**
 * Load RPG Maker events as entities
 */
ACT_World.prototype.loadEventsAsEntities = function(events) {
    if (!events) return;
    
    for (var i = 0; i < events.length; i++) {
        var event = events[i];
        if (!event) continue;
        
        // Check for action-specific meta tags
        var meta = this.parseEventMeta(event);
        
        if (meta.enemy) {
            this.spawnEnemy(
                event.x * ACT.Config.TILE_WIDTH + ACT.Config.TILE_WIDTH / 2,
                event.y * ACT.Config.TILE_HEIGHT + ACT.Config.TILE_HEIGHT / 2,
                meta
            );
        } else if (meta.item) {
            // Spawn collectible item
        } else if (meta.trigger) {
            // Spawn trigger zone
        }
    }
};

/**
 * Parse event note/comment for meta tags
 */
ACT_World.prototype.parseEventMeta = function(event) {
    var meta = {};
    
    if (event.note) {
        // Parse <tag:value> format
        var matches = event.note.match(/<([^:>]+):?([^>]*)>/g);
        if (matches) {
            for (var i = 0; i < matches.length; i++) {
                var match = matches[i].match(/<([^:>]+):?([^>]*)>/);
                if (match) {
                    meta[match[1]] = match[2] || true;
                }
            }
        }
    }
    
    return meta;
};

/**
 * Spawn player
 */
ACT_World.prototype.spawnPlayer = function(x, y) {
    this.player = new ACT_Player(x, y);
    this.addEntity(this.player);
    this.groups.players.push(this.player);
    
    // Link to RPG Maker actor
    if ($gameParty && $gameParty.leader()) {
        this.player.actorId = $gameParty.leader().actorId();
    }
    
    return this.player;
};

/**
 * Spawn enemy
 */
ACT_World.prototype.spawnEnemy = function(x, y, config) {
    var enemy = new ACT_Enemy(x, y, config.width || 32, config.height || 32);
    
    if (config.enemyId) {
        enemy.enemyId = parseInt(config.enemyId);
        // Load stats from $dataEnemies
        var enemyData = $dataEnemies[enemy.enemyId];
        if (enemyData) {
            enemy.hp = enemyData.params[0];
            enemy.maxHp = enemyData.params[0];
            enemy.damage = enemyData.params[2];
        }
    }
    
    enemy.target = this.player;
    
    this.addEntity(enemy);
    this.groups.enemies.push(enemy);
    
    return enemy;
};

/**
 * Spawn entity from config
 */
ACT_World.prototype.spawnEntity = function(config) {
    var entity = null;
    
    switch (config.type) {
        case 'player':
            entity = this.spawnPlayer(config.x, config.y);
            break;
        case 'enemy':
            entity = this.spawnEnemy(config.x, config.y, config);
            break;
        default:
            entity = new ACT_Entity(config.x, config.y, config.width, config.height);
            this.addEntity(entity);
    }
    
    return entity;
};

/**
 * Add entity to world
 */
ACT_World.prototype.addEntity = function(entity) {
    this.entities.push(entity);
    this.physics.addBody(entity.body);
};

/**
 * Remove entity from world
 */
ACT_World.prototype.removeEntity = function(entity) {
    var index = this.entities.indexOf(entity);
    if (index >= 0) {
        this.entities.splice(index, 1);
    }
    
    this.physics.removeBody(entity.body);
    
    // Remove from groups
    for (var key in this.groups) {
        var groupIndex = this.groups[key].indexOf(entity);
        if (groupIndex >= 0) {
            this.groups[key].splice(groupIndex, 1);
        }
    }
};

/**
 * Fire a bullet
 */
ACT_World.prototype.fireBullet = function(x, y, angle, speed, owner, config) {
    var bullet = this.bullets.get(x, y, angle, speed, owner);
    
    if (bullet && config) {
        if (config.damage) bullet.damage = config.damage;
        if (config.lifetime) bullet.lifetime = config.lifetime;
        if (config.piercing) bullet.piercing = config.piercing;
        if (config.bounces) bullet.bounces = config.bounces;
        if (config.homing) {
            bullet.isHoming = true;
            bullet.homingTarget = config.homingTarget || this.player;
        }
    }
    
    if (bullet) {
        this.physics.addBody(bullet.body);
    }
    
    return bullet;
};

/**
 * Main update loop
 */
ACT_World.prototype.update = function(delta) {
    if (this.isPaused) return;
    
    // Update physics
    this.physics.update(delta);
    
    // Update entities
    for (var i = this.entities.length - 1; i >= 0; i--) {
        var entity = this.entities[i];
        
        if (!entity.active) {
            this.removeEntity(entity);
            continue;
        }
        
        entity.update(delta);
    }
    
    // Update bullets
    this.bullets.update(delta);
    
    // Check collisions
    this.checkCollisions();
    
    // Update camera
    this.updateCamera();
};

/**
 * Check entity collisions
 */
ACT_World.prototype.checkCollisions = function() {
    // Player vs enemies
    for (var i = 0; i < this.groups.enemies.length; i++) {
        var enemy = this.groups.enemies[i];
        if (!enemy.active) continue;
        
        if (this.physics.overlap(this.player.body, enemy.body)) {
            this.player.onCollide(enemy);
            enemy.onCollide(this.player);
        }
    }
    
    // Bullets vs entities
    var activeBullets = this.bullets.getActive();
    for (var j = 0; j < activeBullets.length; j++) {
        var bullet = activeBullets[j];
        if (!bullet.active) continue;
        
        // Player bullets vs enemies
        if (!bullet.isEnemyBullet) {
            for (var k = 0; k < this.groups.enemies.length; k++) {
                var target = this.groups.enemies[k];
                if (target.active && this.physics.overlap(bullet.body, target.body)) {
                    bullet.onOverlap(target);
                }
            }
        }
        // Enemy bullets vs player
        else {
            if (this.physics.overlap(bullet.body, this.player.body)) {
                bullet.onOverlap(this.player);
            }
        }
    }
};

/**
 * Update camera to follow player
 */
ACT_World.prototype.updateCamera = function() {
    if (!this.player) return;
    
    var targetX = this.player.x - Graphics.width / 2;
    var targetY = this.player.y - Graphics.height / 2;
    
    // Smooth follow
    this.cameraX += (targetX - this.cameraX) * 0.1;
    this.cameraY += (targetY - this.cameraY) * 0.1;
    
    // Clamp to bounds
    this.cameraX = Math.max(0, Math.min(this.cameraX, this.mapWidth - Graphics.width));
    this.cameraY = Math.max(0, Math.min(this.cameraY, this.mapHeight - Graphics.height));
};

/**
 * Clear all entities
 */
ACT_World.prototype.clear = function() {
    this.entities = [];
    this.player = null;
    this.physics.clear();
    this.bullets.clear();
    
    for (var key in this.groups) {
        this.groups[key] = [];
    }
};

/**
 * Pause/unpause
 */
ACT_World.prototype.setPaused = function(paused) {
    this.isPaused = paused;
    this.physics.isPaused = paused;
};
