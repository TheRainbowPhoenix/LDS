/*:
 * @plugindesc Corruption Framework Core - A robust, extensible system for managing corruption and bad states
 * @author Phoebe
 * @version 1.0.0
 *
 * @help
 * ============================================================================
 * CORRUPTION FRAMEWORK CORE
 * ============================================================================
 * 
 * A comprehensive framework for managing corruption, transformation, and
 * negative status effects in RPG Maker MZ/MV.
 * 
 * Features:
 * - Multiple corruption types running simultaneously
 * - Progressive stages with automatic advancement
 * - Time-based corruption progression
 * - Stat modifiers (ATK, DEF, crit, miss, etc.)
 * - Movement speed effects
 * - Visual changes (map sprite, battle sprite, face)
 * - Behavior effects (loss of control, auto-movement)
 * - Extensible effect system
 * - Event hooks for custom logic
 * 
 * ============================================================================
 * SETUP
 * ============================================================================
 * 
 * 1. Define corruption types in COR_Config.js
 * 2. Link states in the database to corruption stages
 * 3. Use plugin commands or script calls to apply/remove corruption
 * 
 * ============================================================================
 * SCRIPT CALLS
 * ============================================================================
 * 
 * // Apply corruption to actor
 * COR.apply(actorId, 'corruptionType', stage);
 * 
 * // Get corruption level
 * COR.getLevel(actorId, 'corruptionType');
 * 
 * // Check if corrupted
 * COR.isCorrupted(actorId, 'corruptionType');
 * 
 * // Remove corruption
 * COR.remove(actorId, 'corruptionType');
 * 
 * // Advance corruption by 1 stage
 * COR.advance(actorId, 'corruptionType');
 * 
 */

var COR = COR || {};
var Imported = Imported || {};
Imported.COR_Core = '1.0.0';

(function() {
    'use strict';

    //==========================================================================
    // COR.EffectType - Enum for effect categories
    //==========================================================================
    COR.EffectType = {
        STAT_MODIFIER: 'statModifier',      // Affects stats (ATK, DEF, etc.)
        RATE_MODIFIER: 'rateModifier',      // Affects rates (crit, miss, etc.)
        MOVEMENT: 'movement',                // Affects movement speed
        VISUAL: 'visual',                    // Changes appearance
        BEHAVIOR: 'behavior',                // Affects control/AI
        TRANSFORM: 'transform',              // Class/enemy transformation
        CUSTOM: 'custom'                     // User-defined effects
    };

    //==========================================================================
    // COR.BehaviorType - Enum for behavior effects
    //==========================================================================
    COR.BehaviorType = {
        NONE: 'none',
        RANDOM_MOVE: 'randomMove',           // Random movement on map
        MOVE_TOWARD_ENEMY: 'moveTowardEnemy',
        CANNOT_ACT: 'cannotAct',             // Skip turn in battle
        AUTO_ATTACK: 'autoAttack',           // Attack random target
        CONFUSED: 'confused',                // May attack allies
        CHARMED: 'charmed'                   // Controlled by enemy
    };

    //==========================================================================
    // COR.Registry - Central registry for corruption types
    //==========================================================================
    COR.Registry = {
        _types: {},
        _effectHandlers: {},

        /**
         * Register a new corruption type
         * @param {string} id - Unique identifier
         * @param {Object} config - Corruption configuration
         */
        registerType: function(id, config) {
            this._types[id] = Object.assign({
                id: id,
                name: config.name || id,
                maxStage: config.maxStage || 4,
                stages: config.stages || [],
                stateIds: config.stateIds || [],
                stackable: config.stackable !== false,
                persistent: config.persistent || false,
                timeProgression: config.timeProgression || null,
                onApply: config.onApply || null,
                onAdvance: config.onAdvance || null,
                onRemove: config.onRemove || null,
                onMaxStage: config.onMaxStage || null
            }, config);
            return this;
        },

        /**
         * Get corruption type by ID
         */
        getType: function(id) {
            return this._types[id] || null;
        },

        /**
         * Get all registered types
         */
        getAllTypes: function() {
            return Object.keys(this._types);
        },

        /**
         * Register a custom effect handler
         */
        registerEffectHandler: function(effectId, handler) {
            this._effectHandlers[effectId] = handler;
            return this;
        },

        /**
         * Get effect handler
         */
        getEffectHandler: function(effectId) {
            return this._effectHandlers[effectId] || null;
        }
    };

    //==========================================================================
    // COR.Manager - Core corruption management
    //==========================================================================
    COR.Manager = {
        /**
         * Apply corruption to a battler
         * @param {Game_Battler} battler
         * @param {string} typeId
         * @param {number} stage - Target stage (1-based)
         * @returns {boolean} Success
         */
        apply: function(battler, typeId, stage) {
            if (!battler) return false;
            
            const type = COR.Registry.getType(typeId);
            if (!type) {
                console.warn(`COR: Unknown corruption type "${typeId}"`);
                return false;
            }

            stage = Math.max(1, Math.min(stage || 1, type.maxStage));
            
            // Initialize corruption data if needed
            if (!battler._corruptionData) {
                battler._corruptionData = {};
            }

            const prevStage = this.getStage(battler, typeId);
            const isNew = prevStage === 0;

            // Set corruption data
            battler._corruptionData[typeId] = {
                stage: stage,
                appliedAt: Graphics.frameCount,
                lastProgression: Graphics.frameCount
            };

            // Apply linked state if configured
            this._applyLinkedState(battler, type, stage);

            // Fire callbacks
            if (isNew && type.onApply) {
                type.onApply(battler, stage);
            }
            if (!isNew && type.onAdvance) {
                type.onAdvance(battler, prevStage, stage);
            }
            if (stage >= type.maxStage && type.onMaxStage) {
                type.onMaxStage(battler);
            }

            // Mark for visual refresh
            battler._needCorruptRefresh = true;

            return true;
        },

        /**
         * Advance corruption by delta stages
         */
        advance: function(battler, typeId, delta) {
            delta = delta || 1;
            const currentStage = this.getStage(battler, typeId);
            if (currentStage === 0) {
                return this.apply(battler, typeId, delta);
            }
            return this.apply(battler, typeId, currentStage + delta);
        },

        /**
         * Get current corruption stage (0 = not corrupted)
         */
        getStage: function(battler, typeId) {
            if (!battler || !battler._corruptionData) return 0;
            const data = battler._corruptionData[typeId];
            return data ? data.stage : 0;
        },

        /**
         * Check if battler has any corruption of type
         */
        isCorrupted: function(battler, typeId) {
            return this.getStage(battler, typeId) > 0;
        },

        /**
         * Remove corruption completely
         */
        remove: function(battler, typeId) {
            if (!battler || !battler._corruptionData) return false;
            
            const type = COR.Registry.getType(typeId);
            const hadCorruption = this.isCorrupted(battler, typeId);

            // Remove linked states
            if (type && type.stateIds) {
                type.stateIds.forEach(function(stateId) {
                    if (battler.isStateAffected(stateId)) {
                        battler.removeState(stateId);
                    }
                });
            }

            delete battler._corruptionData[typeId];

            if (hadCorruption && type && type.onRemove) {
                type.onRemove(battler);
            }

            battler._needCorruptRefresh = true;
            return hadCorruption;
        },

        /**
         * Remove all corruptions from battler
         */
        removeAll: function(battler) {
            if (!battler || !battler._corruptionData) return;
            
            const types = Object.keys(battler._corruptionData);
            types.forEach(function(typeId) {
                this.remove(battler, typeId);
            }, this);
        },

        /**
         * Get all active corruptions on battler
         * @returns {Array} Array of {typeId, stage, data}
         */
        getAll: function(battler) {
            if (!battler || !battler._corruptionData) return [];
            
            const result = [];
            Object.keys(battler._corruptionData).forEach(function(typeId) {
                const data = battler._corruptionData[typeId];
                result.push({
                    typeId: typeId,
                    stage: data.stage,
                    data: data
                });
            });
            return result;
        },

        /**
         * Apply linked RPG Maker state
         */
        _applyLinkedState: function(battler, type, stage) {
            if (!type.stateIds || type.stateIds.length === 0) return;

            // Remove all states from this corruption type first
            type.stateIds.forEach(function(stateId) {
                if (battler.isStateAffected(stateId)) {
                    battler.removeState(stateId);
                }
            });

            // Apply the state for current stage (0-indexed in array)
            const stateIndex = stage - 1;
            if (stateIndex >= 0 && stateIndex < type.stateIds.length) {
                const stateId = type.stateIds[stateIndex];
                if (stateId > 0) {
                    battler.addState(stateId);
                }
            }
        }
    };


    //==========================================================================
    // COR.Effects - Effect calculation system
    //==========================================================================
    COR.Effects = {
        /**
         * Calculate total stat modifier from all corruptions
         * @param {Game_Battler} battler
         * @param {string} statName - 'atk', 'def', 'mat', 'mdf', 'agi', 'luk'
         * @returns {number} Multiplier (1.0 = no change)
         */
        getStatModifier: function(battler, statName) {
            if (!battler || !battler._corruptionData) return 1.0;

            let modifier = 1.0;
            
            COR.Manager.getAll(battler).forEach(function(corruption) {
                const type = COR.Registry.getType(corruption.typeId);
                if (!type || !type.stages) return;

                const stageConfig = type.stages[corruption.stage - 1];
                if (!stageConfig || !stageConfig.statModifiers) return;

                const statMod = stageConfig.statModifiers[statName];
                if (typeof statMod === 'number') {
                    modifier *= statMod;
                }
            });

            return modifier;
        },

        /**
         * Calculate rate modifier (crit, miss, etc.)
         * @param {string} rateName - 'cri', 'eva', 'hit', 'cnt', etc.
         */
        getRateModifier: function(battler, rateName) {
            if (!battler || !battler._corruptionData) return 0;

            let modifier = 0;
            
            COR.Manager.getAll(battler).forEach(function(corruption) {
                const type = COR.Registry.getType(corruption.typeId);
                if (!type || !type.stages) return;

                const stageConfig = type.stages[corruption.stage - 1];
                if (!stageConfig || !stageConfig.rateModifiers) return;

                const rateMod = stageConfig.rateModifiers[rateName];
                if (typeof rateMod === 'number') {
                    modifier += rateMod;
                }
            });

            return modifier;
        },

        /**
         * Get movement speed modifier
         * @returns {number} Speed delta (positive = faster, negative = slower)
         */
        getMoveSpeedModifier: function(battler) {
            if (!battler || !battler._corruptionData) return 0;

            let modifier = 0;
            
            COR.Manager.getAll(battler).forEach(function(corruption) {
                const type = COR.Registry.getType(corruption.typeId);
                if (!type || !type.stages) return;

                const stageConfig = type.stages[corruption.stage - 1];
                if (stageConfig && typeof stageConfig.moveSpeed === 'number') {
                    modifier += stageConfig.moveSpeed;
                }
            });

            return modifier;
        },

        /**
         * Get the most severe behavior effect
         */
        getBehavior: function(battler) {
            if (!battler || !battler._corruptionData) return COR.BehaviorType.NONE;

            let behavior = COR.BehaviorType.NONE;
            let priority = 0;

            const behaviorPriority = {
                'none': 0,
                'randomMove': 1,
                'moveTowardEnemy': 2,
                'confused': 3,
                'autoAttack': 4,
                'charmed': 5,
                'cannotAct': 6
            };

            COR.Manager.getAll(battler).forEach(function(corruption) {
                const type = COR.Registry.getType(corruption.typeId);
                if (!type || !type.stages) return;

                const stageConfig = type.stages[corruption.stage - 1];
                if (stageConfig && stageConfig.behavior) {
                    const p = behaviorPriority[stageConfig.behavior] || 0;
                    if (p > priority) {
                        priority = p;
                        behavior = stageConfig.behavior;
                    }
                }
            });

            return behavior;
        },

        /**
         * Check if battler can be controlled by player
         */
        canControl: function(battler) {
            const behavior = this.getBehavior(battler);
            return behavior === COR.BehaviorType.NONE;
        },

        /**
         * Get visual suffix for sprite names
         * Returns the highest priority visual change
         */
        getVisualSuffix: function(battler) {
            if (!battler || !battler._corruptionData) return '';

            let suffix = '';
            let priority = 0;

            COR.Manager.getAll(battler).forEach(function(corruption) {
                const type = COR.Registry.getType(corruption.typeId);
                if (!type || !type.stages) return;

                const stageConfig = type.stages[corruption.stage - 1];
                if (stageConfig && stageConfig.visual) {
                    const p = stageConfig.visual.priority || corruption.stage;
                    if (p > priority) {
                        priority = p;
                        suffix = stageConfig.visual.suffix || '';
                    }
                }
            });

            return suffix;
        },

        /**
         * Get full visual config for battler
         */
        getVisualConfig: function(battler) {
            if (!battler || !battler._corruptionData) return null;

            let config = null;
            let priority = 0;

            COR.Manager.getAll(battler).forEach(function(corruption) {
                const type = COR.Registry.getType(corruption.typeId);
                if (!type || !type.stages) return;

                const stageConfig = type.stages[corruption.stage - 1];
                if (stageConfig && stageConfig.visual) {
                    const p = stageConfig.visual.priority || corruption.stage;
                    if (p > priority) {
                        priority = p;
                        config = Object.assign({}, stageConfig.visual, {
                            typeId: corruption.typeId,
                            stage: corruption.stage
                        });
                    }
                }
            });

            return config;
        }
    };

    //==========================================================================
    // COR.TimeProgression - Time-based corruption advancement
    //==========================================================================
    COR.TimeProgression = {
        _enabled: true,

        /**
         * Update all battlers' time-based corruption
         * Call this from Game_Map.update or similar
         */
        update: function() {
            if (!this._enabled) return;
            if (!$gameParty) return;

            $gameParty.allMembers().forEach(function(actor) {
                this.updateBattler(actor);
            }, this);
        },

        /**
         * Update single battler
         */
        updateBattler: function(battler) {
            if (!battler || !battler._corruptionData) return;

            const now = Graphics.frameCount;

            COR.Manager.getAll(battler).forEach(function(corruption) {
                const type = COR.Registry.getType(corruption.typeId);
                if (!type || !type.timeProgression) return;

                const stageConfig = type.stages[corruption.stage - 1];
                const interval = stageConfig && stageConfig.progressionInterval 
                    ? stageConfig.progressionInterval 
                    : type.timeProgression.interval;

                if (!interval) return;

                const elapsed = now - corruption.data.lastProgression;
                if (elapsed >= interval) {
                    // Check if can advance
                    if (corruption.stage < type.maxStage) {
                        COR.Manager.advance(battler, corruption.typeId, 1);
                        corruption.data.lastProgression = now;
                    }
                }
            });
        },

        /**
         * Enable/disable time progression
         */
        setEnabled: function(enabled) {
            this._enabled = enabled;
        }
    };

    //==========================================================================
    // Public API - Convenience functions
    //==========================================================================
    
    /**
     * Apply corruption to actor by ID
     */
    COR.apply = function(actorId, typeId, stage) {
        const actor = $gameActors.actor(actorId);
        return COR.Manager.apply(actor, typeId, stage);
    };

    /**
     * Get corruption level for actor
     */
    COR.getLevel = function(actorId, typeId) {
        const actor = $gameActors.actor(actorId);
        return COR.Manager.getStage(actor, typeId);
    };

    /**
     * Check if actor is corrupted
     */
    COR.isCorrupted = function(actorId, typeId) {
        const actor = $gameActors.actor(actorId);
        return COR.Manager.isCorrupted(actor, typeId);
    };

    /**
     * Remove corruption from actor
     */
    COR.remove = function(actorId, typeId) {
        const actor = $gameActors.actor(actorId);
        return COR.Manager.remove(actor, typeId);
    };

    /**
     * Advance corruption stage
     */
    COR.advance = function(actorId, typeId, delta) {
        const actor = $gameActors.actor(actorId);
        return COR.Manager.advance(actor, typeId, delta);
    };

    //==========================================================================
    // Save/Load Integration
    //==========================================================================
    
    const _Game_Actor_initMembers = Game_Actor.prototype.initMembers;
    Game_Actor.prototype.initMembers = function() {
        _Game_Actor_initMembers.call(this);
        this._corruptionData = {};
        this._needCorruptRefresh = false;
    };

    const _Game_Enemy_initMembers = Game_Enemy.prototype.initMembers;
    Game_Enemy.prototype.initMembers = function() {
        _Game_Enemy_initMembers.call(this);
        this._corruptionData = {};
        this._needCorruptRefresh = false;
    };

})();
