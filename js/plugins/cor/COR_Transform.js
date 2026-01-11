/*:
 * @plugindesc Corruption Framework - Transformation System
 * @author Phoebe
 * @version 1.0.0
 *
 * @help
 * ============================================================================
 * COR_Transform - Class Change and Enemy Conversion
 * ============================================================================
 * 
 * This module handles major transformations from corruption:
 * - Class changes at certain corruption stages
 * - Actor to enemy conversion (betrayal/mind control)
 * - Skill learning/forgetting based on corruption
 * - Equipment restrictions
 * 
 * Transform Configuration in stage config:
 * {
 *   transform: {
 *     classId: 5,              // Change to this class
 *     keepExp: true,           // Keep experience on class change
 *     learnSkills: [10, 11],   // Learn these skills
 *     forgetSkills: [1, 2],    // Forget these skills
 *     toEnemy: {               // Convert to enemy in battle
 *       enemyId: 6,
 *       removeFromParty: true
 *     }
 *   }
 * }
 * 
 */

var Imported = Imported || {};
Imported.COR_Transform = '1.0.0';

(function() {
    'use strict';

    if (!Imported.COR_Core) {
        console.error('COR_Transform requires COR_Core');
        return;
    }

    //==========================================================================
    // Transform Manager
    //==========================================================================

    COR.Transform = {
        /**
         * Apply transformation effects for a corruption stage
         */
        applyTransform: function(battler, typeId, stage) {
            if (!battler || !battler.isActor()) return;
            
            const type = COR.Registry.getType(typeId);
            if (!type || !type.stages) return;
            
            const stageConfig = type.stages[stage - 1];
            if (!stageConfig || !stageConfig.transform) return;
            
            const transform = stageConfig.transform;
            
            // Class change
            if (transform.classId) {
                this.changeClass(battler, transform.classId, transform.keepExp);
            }
            
            // Learn skills
            if (transform.learnSkills) {
                transform.learnSkills.forEach(function(skillId) {
                    battler.learnSkill(skillId);
                });
            }
            
            // Forget skills
            if (transform.forgetSkills) {
                transform.forgetSkills.forEach(function(skillId) {
                    battler.forgetSkill(skillId);
                });
            }
            
            // Enemy conversion (in battle)
            if (transform.toEnemy && $gameParty.inBattle()) {
                this.convertToEnemy(battler, transform.toEnemy);
            }
        },

        /**
         * Change actor's class
         */
        changeClass: function(actor, classId, keepExp) {
            if (!actor || !actor.isActor()) return;
            
            keepExp = keepExp !== false;
            actor.changeClass(classId, keepExp);
            
            // Learn class skills up to current level
            actor.currentClass().learnings.forEach(function(learning) {
                if (learning.level <= actor.level) {
                    actor.learnSkill(learning.skillId);
                }
            });
            
            actor.refresh();
        },

        /**
         * Convert actor to enemy in battle
         */
        convertToEnemy: function(actor, config) {
            if (!$gameParty.inBattle()) return;
            
            const enemyId = config.enemyId;
            const removeFromParty = config.removeFromParty !== false;
            
            // KO the actor
            actor.addState(actor.deathStateId());
            
            // Create enemy
            const actorIndex = $gameParty.battleMembers().indexOf(actor);
            const x = 900 + (actorIndex % 3) * 150;
            const y = actorIndex > 2 ? 500 : 300;
            
            const enemy = new Game_Enemy(enemyId, x, y);
            
            // Transfer name if configured
            if (config.keepName) {
                enemy._originalName = actor.name();
                enemy._name = actor.name();
            }
            
            // Add to troop
            $gameTroop._enemies.push(enemy);
            
            // Refresh battle sprites
            const scene = SceneManager._scene;
            if (scene && scene._spriteset && scene._spriteset.refreshEnemies) {
                scene._spriteset.refreshEnemies();
            }
            
            // Update action order
            BattleManager.makeActionOrders();
            
            // Remove from party if configured
            if (removeFromParty) {
                // Note: Full removal might need to be handled post-battle
                actor._corruptionConverted = true;
            }
        },

        /**
         * Check if actor was converted to enemy
         */
        wasConverted: function(actor) {
            return actor && actor._corruptionConverted === true;
        },

        /**
         * Restore converted actor (for cure/reversal)
         */
        restoreConverted: function(actor) {
            if (!actor) return;
            actor._corruptionConverted = false;
            actor.removeState(actor.deathStateId());
            actor.refresh();
        }
    };

    //==========================================================================
    // Hook into Corruption Application
    //==========================================================================

    // Store original apply function
    const _COR_Manager_apply = COR.Manager.apply;
    COR.Manager.apply = function(battler, typeId, stage) {
        const result = _COR_Manager_apply.call(this, battler, typeId, stage);
        
        if (result) {
            // Apply transformation effects
            COR.Transform.applyTransform(battler, typeId, stage);
        }
        
        return result;
    };

    //==========================================================================
    // Equipment Restrictions
    //==========================================================================

    const _Game_Actor_canEquip = Game_Actor.prototype.canEquip;
    Game_Actor.prototype.canEquip = function(item) {
        if (!_Game_Actor_canEquip.call(this, item)) return false;
        
        // Check corruption equipment restrictions
        const corruptions = COR.Manager.getAll(this);
        
        for (let i = 0; i < corruptions.length; i++) {
            const corruption = corruptions[i];
            const type = COR.Registry.getType(corruption.typeId);
            if (!type || !type.stages) continue;
            
            const stageConfig = type.stages[corruption.stage - 1];
            if (!stageConfig || !stageConfig.equipRestrictions) continue;
            
            const restrictions = stageConfig.equipRestrictions;
            
            // Check forbidden equipment types
            if (restrictions.forbiddenEtypes) {
                if (DataManager.isWeapon(item)) {
                    if (restrictions.forbiddenEtypes.includes(item.etypeId)) {
                        return false;
                    }
                } else if (DataManager.isArmor(item)) {
                    if (restrictions.forbiddenEtypes.includes(item.etypeId)) {
                        return false;
                    }
                }
            }
            
            // Check forbidden specific items
            if (restrictions.forbiddenItems) {
                const itemKey = (DataManager.isWeapon(item) ? 'w' : 'a') + item.id;
                if (restrictions.forbiddenItems.includes(itemKey)) {
                    return false;
                }
            }
        }
        
        return true;
    };

    //==========================================================================
    // Skill Restrictions
    //==========================================================================

    const _Game_Actor_isSkillSealed = Game_Actor.prototype.isSkillSealed;
    Game_Actor.prototype.isSkillSealed = function(skillId) {
        if (_Game_Actor_isSkillSealed.call(this, skillId)) return true;
        
        // Check corruption skill restrictions
        const corruptions = COR.Manager.getAll(this);
        
        for (let i = 0; i < corruptions.length; i++) {
            const corruption = corruptions[i];
            const type = COR.Registry.getType(corruption.typeId);
            if (!type || !type.stages) continue;
            
            const stageConfig = type.stages[corruption.stage - 1];
            if (!stageConfig || !stageConfig.sealedSkills) continue;
            
            if (stageConfig.sealedSkills.includes(skillId)) {
                return true;
            }
        }
        
        return false;
    };

    //==========================================================================
    // Battle Sprite Refresh for Enemies
    //==========================================================================

    if (!Spriteset_Battle.prototype.refreshEnemies) {
        Spriteset_Battle.prototype.refreshEnemies = function() {
            // Remove old sprites
            if (this._enemySprites) {
                this._enemySprites.forEach(function(sprite) {
                    this._battleField.removeChild(sprite);
                }, this);
            }
            
            // Create new sprites
            this._enemySprites = [];
            const enemies = $gameTroop.members();
            
            enemies.forEach(function(enemy) {
                const sprite = new Sprite_Enemy(enemy);
                this._enemySprites.push(sprite);
                this._battleField.addChild(sprite);
            }, this);
            
            // Sort by Y position
            this._enemySprites.sort(function(a, b) {
                return a.y - b.y;
            });
        };
    }

})();
