/*:
 * @plugindesc Corruption Framework - Movement Effects
 * @author Phoebe
 * @version 1.0.0
 *
 * @help
 * ============================================================================
 * COR_Movement - Movement and Map Behavior
 * ============================================================================
 * 
 * This module handles corruption effects on map movement:
 * - Movement speed changes
 * - Random/erratic movement
 * - Loss of player control
 * - Auto-movement toward enemies/objectives
 * 
 */

var Imported = Imported || {};
Imported.COR_Movement = '1.0.0';

(function() {
    'use strict';

    if (!Imported.COR_Core) {
        console.error('COR_Movement requires COR_Core');
        return;
    }

    //==========================================================================
    // Movement Speed Modification
    //==========================================================================

    const _Game_CharacterBase_realMoveSpeed = Game_CharacterBase.prototype.realMoveSpeed;
    Game_CharacterBase.prototype.realMoveSpeed = function() {
        let speed = _Game_CharacterBase_realMoveSpeed.call(this);
        
        // Only apply to player
        if (this === $gamePlayer) {
            const leader = $gameParty.leader();
            if (leader) {
                const modifier = COR.Effects.getMoveSpeedModifier(leader);
                speed = Math.max(1, speed + modifier);
            }
        }
        
        return speed;
    };

    //==========================================================================
    // Player Control Override
    //==========================================================================

    const _Game_Player_canMove = Game_Player.prototype.canMove;
    Game_Player.prototype.canMove = function() {
        if (!_Game_Player_canMove.call(this)) return false;
        
        const leader = $gameParty.leader();
        if (leader) {
            const behavior = COR.Effects.getBehavior(leader);
            
            // These behaviors prevent normal player control
            if (behavior === COR.BehaviorType.RANDOM_MOVE ||
                behavior === COR.BehaviorType.MOVE_TOWARD_ENEMY ||
                behavior === COR.BehaviorType.CANNOT_ACT) {
                return false;
            }
        }
        
        return true;
    };

    //==========================================================================
    // Autonomous Movement (when player loses control)
    //==========================================================================

    const _Game_Player_update = Game_Player.prototype.update;
    Game_Player.prototype.update = function(sceneActive) {
        _Game_Player_update.call(this, sceneActive);
        
        if (sceneActive) {
            this.updateCorruptionMovement();
        }
    };

    Game_Player.prototype.updateCorruptionMovement = function() {
        if (this.isMoving()) return;
        
        const leader = $gameParty.leader();
        if (!leader) return;
        
        const behavior = COR.Effects.getBehavior(leader);
        
        switch (behavior) {
            case COR.BehaviorType.RANDOM_MOVE:
                this.updateRandomCorruptMove();
                break;
            case COR.BehaviorType.MOVE_TOWARD_ENEMY:
                this.updateMoveTowardEnemy();
                break;
        }
    };

    Game_Player.prototype.updateRandomCorruptMove = function() {
        // Random movement with some delay
        if (!this._corruptMoveTimer) {
            this._corruptMoveTimer = 0;
        }
        
        this._corruptMoveTimer++;
        
        // Move every 30-60 frames randomly
        if (this._corruptMoveTimer >= 30 + Math.randomInt(30)) {
            this._corruptMoveTimer = 0;
            
            const direction = 2 + Math.randomInt(4) * 2; // 2, 4, 6, or 8
            this.moveStraight(direction);
        }
    };

    Game_Player.prototype.updateMoveTowardEnemy = function() {
        // Find nearest event with <Enemy> tag or specific note
        if (!this._corruptMoveTimer) {
            this._corruptMoveTimer = 0;
        }
        
        this._corruptMoveTimer++;
        
        if (this._corruptMoveTimer >= 20) {
            this._corruptMoveTimer = 0;
            
            const target = this.findNearestEnemyEvent();
            if (target) {
                this.moveTowardCharacter(target);
            } else {
                // No target, move randomly
                const direction = 2 + Math.randomInt(4) * 2;
                this.moveStraight(direction);
            }
        }
    };

    Game_Player.prototype.findNearestEnemyEvent = function() {
        let nearest = null;
        let nearestDist = Infinity;
        
        $gameMap.events().forEach(function(event) {
            if (!event) return;
            
            // Check for enemy tag in event note
            const note = event.event().note || '';
            if (note.match(/<Enemy>/i) || note.match(/<CorruptTarget>/i)) {
                const dist = Math.abs(this.x - event.x) + Math.abs(this.y - event.y);
                if (dist < nearestDist) {
                    nearestDist = dist;
                    nearest = event;
                }
            }
        }, this);
        
        return nearest;
    };

    //==========================================================================
    // Time Progression Update Hook
    //==========================================================================

    const _Game_Map_update = Game_Map.prototype.update;
    Game_Map.prototype.update = function(sceneActive) {
        _Game_Map_update.call(this, sceneActive);
        
        if (sceneActive) {
            COR.TimeProgression.update();
        }
    };

    //==========================================================================
    // Stumble/Trip Effect (optional visual feedback)
    //==========================================================================

    Game_Player.prototype.corruptionStumble = function() {
        // Brief pause and direction change to simulate stumbling
        this._waitCount = 15;
        const dirs = [2, 4, 6, 8];
        const randomDir = dirs[Math.randomInt(4)];
        this.setDirection(randomDir);
    };

    /**
     * Check if player should stumble based on corruption
     */
    Game_Player.prototype.shouldStumble = function() {
        const leader = $gameParty.leader();
        if (!leader) return false;
        
        // Check for stumble chance in corruption effects
        let stumbleChance = 0;
        
        COR.Manager.getAll(leader).forEach(function(corruption) {
            const type = COR.Registry.getType(corruption.typeId);
            if (!type || !type.stages) return;
            
            const stageConfig = type.stages[corruption.stage - 1];
            if (stageConfig && typeof stageConfig.stumbleChance === 'number') {
                stumbleChance = Math.max(stumbleChance, stageConfig.stumbleChance);
            }
        });
        
        return Math.random() < stumbleChance;
    };

    const _Game_Player_moveStraight = Game_Player.prototype.moveStraight;
    Game_Player.prototype.moveStraight = function(d) {
        if (this.shouldStumble()) {
            this.corruptionStumble();
            return;
        }
        _Game_Player_moveStraight.call(this, d);
    };

})();
