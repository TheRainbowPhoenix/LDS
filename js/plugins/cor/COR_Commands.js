/*:
 * @plugindesc Corruption Framework - Plugin Commands
 * @author Phoebe
 * @version 1.0.0
 *
 * @command ApplyCorruption
 * @text Apply Corruption
 * @desc Apply corruption to an actor
 *
 * @arg actorId
 * @type actor
 * @text Actor
 * @desc The actor to corrupt
 *
 * @arg corruptionType
 * @type string
 * @text Corruption Type
 * @desc The corruption type ID (e.g., 'slime', 'hypnosis')
 *
 * @arg stage
 * @type number
 * @min 1
 * @max 10
 * @default 1
 * @text Stage
 * @desc The corruption stage to apply
 *
 * @command AdvanceCorruption
 * @text Advance Corruption
 * @desc Advance corruption by stages
 *
 * @arg actorId
 * @type actor
 * @text Actor
 *
 * @arg corruptionType
 * @type string
 * @text Corruption Type
 *
 * @arg amount
 * @type number
 * @min 1
 * @default 1
 * @text Amount
 * @desc Stages to advance
 *
 * @command RemoveCorruption
 * @text Remove Corruption
 * @desc Remove corruption from an actor
 *
 * @arg actorId
 * @type actor
 * @text Actor
 *
 * @arg corruptionType
 * @type string
 * @text Corruption Type
 * @desc Leave empty to remove all corruptions
 *
 * @command SetTimeProgression
 * @text Set Time Progression
 * @desc Enable or disable time-based corruption progression
 *
 * @arg enabled
 * @type boolean
 * @default true
 * @text Enabled
 *
 * @help
 * ============================================================================
 * COR_Commands - Plugin Commands for Corruption Framework
 * ============================================================================
 * 
 * MZ Plugin Commands:
 * - Apply Corruption: Apply a corruption type to an actor
 * - Advance Corruption: Increase corruption stage
 * - Remove Corruption: Remove corruption from actor
 * - Set Time Progression: Enable/disable auto-progression
 * 
 * MV Script Calls:
 * - COR.apply(actorId, 'type', stage)
 * - COR.advance(actorId, 'type', amount)
 * - COR.remove(actorId, 'type')
 * - COR.getLevel(actorId, 'type')
 * - COR.isCorrupted(actorId, 'type')
 * - COR.TimeProgression.setEnabled(true/false)
 * 
 * Conditional Branch Script:
 * - COR.isCorrupted(1, 'slime')  // Is actor 1 slime corrupted?
 * - COR.getLevel(1, 'slime') >= 3  // Is corruption at stage 3+?
 * 
 */

var Imported = Imported || {};
Imported.COR_Commands = '1.0.0';

(function() {
    'use strict';

    if (!Imported.COR_Core) {
        console.error('COR_Commands requires COR_Core');
        return;
    }

    //==========================================================================
    // MZ Plugin Commands
    //==========================================================================

    if (PluginManager && PluginManager.registerCommand) {
        
        PluginManager.registerCommand('COR_Commands', 'ApplyCorruption', function(args) {
            const actorId = Number(args.actorId);
            const type = String(args.corruptionType);
            const stage = Number(args.stage) || 1;
            COR.apply(actorId, type, stage);
        });

        PluginManager.registerCommand('COR_Commands', 'AdvanceCorruption', function(args) {
            const actorId = Number(args.actorId);
            const type = String(args.corruptionType);
            const amount = Number(args.amount) || 1;
            COR.advance(actorId, type, amount);
        });

        PluginManager.registerCommand('COR_Commands', 'RemoveCorruption', function(args) {
            const actorId = Number(args.actorId);
            const type = String(args.corruptionType);
            
            if (type) {
                COR.remove(actorId, type);
            } else {
                const actor = $gameActors.actor(actorId);
                COR.Manager.removeAll(actor);
            }
        });

        PluginManager.registerCommand('COR_Commands', 'SetTimeProgression', function(args) {
            const enabled = args.enabled === 'true';
            COR.TimeProgression.setEnabled(enabled);
        });
    }

    //==========================================================================
    // MV Plugin Commands (for compatibility)
    //==========================================================================

    const _Game_Interpreter_pluginCommand = Game_Interpreter.prototype.pluginCommand;
    Game_Interpreter.prototype.pluginCommand = function(command, args) {
        _Game_Interpreter_pluginCommand.call(this, command, args);
        
        if (command.toUpperCase() === 'COR' || command.toUpperCase() === 'CORRUPTION') {
            const subCommand = (args[0] || '').toUpperCase();
            
            switch (subCommand) {
                case 'APPLY':
                    // COR APPLY actorId type stage
                    COR.apply(Number(args[1]), args[2], Number(args[3]) || 1);
                    break;
                    
                case 'ADVANCE':
                    // COR ADVANCE actorId type amount
                    COR.advance(Number(args[1]), args[2], Number(args[3]) || 1);
                    break;
                    
                case 'REMOVE':
                    // COR REMOVE actorId type
                    if (args[2]) {
                        COR.remove(Number(args[1]), args[2]);
                    } else {
                        const actor = $gameActors.actor(Number(args[1]));
                        COR.Manager.removeAll(actor);
                    }
                    break;
                    
                case 'TIMEPROGRESSION':
                    // COR TIMEPROGRESSION ON/OFF
                    COR.TimeProgression.setEnabled(args[1].toUpperCase() === 'ON');
                    break;
            }
        }
    };

    //==========================================================================
    // Event Note Tag Processing
    //==========================================================================

    /**
     * Process event note tags for corruption triggers
     * <CorruptOnTouch: type, stage>
     * <CorruptOnAction: type, stage>
     */
    
    const _Game_Event_start = Game_Event.prototype.start;
    Game_Event.prototype.start = function() {
        _Game_Event_start.call(this);
        this.processCorruptionNoteTags();
    };

    Game_Event.prototype.processCorruptionNoteTags = function() {
        if (!this.event()) return;
        
        const note = this.event().note || '';
        
        // <CorruptOnTouch: type, stage>
        const touchMatch = note.match(/<CorruptOnTouch:\s*(\w+)\s*,?\s*(\d*)\s*>/i);
        if (touchMatch) {
            const type = touchMatch[1];
            const stage = Number(touchMatch[2]) || 1;
            const leader = $gameParty.leader();
            if (leader) {
                COR.Manager.advance(leader, type, stage);
            }
        }
    };

    //==========================================================================
    // Battle Event Integration
    //==========================================================================

    /**
     * Enemy note tags for corruption attacks
     * <CorruptAttack: type, stage, chance>
     */
    
    const _Game_Action_apply = Game_Action.prototype.apply;
    Game_Action.prototype.apply = function(target) {
        _Game_Action_apply.call(this, target);
        
        // Check for corruption effect on skill/item
        const item = this.item();
        if (item && item.note) {
            this.applyCorruptionEffect(target, item.note);
        }
        
        // Check for enemy corruption attack
        if (this.subject().isEnemy()) {
            const enemy = this.subject().enemy();
            if (enemy && enemy.note) {
                this.applyCorruptionEffect(target, enemy.note);
            }
        }
    };

    Game_Action.prototype.applyCorruptionEffect = function(target, note) {
        // <CorruptAttack: type, stage, chance>
        const match = note.match(/<CorruptAttack:\s*(\w+)\s*,?\s*(\d*)\s*,?\s*([\d.]*)\s*>/i);
        if (match) {
            const type = match[1];
            const stage = Number(match[2]) || 1;
            const chance = Number(match[3]) || 1.0;
            
            if (Math.random() < chance && target.isActor()) {
                COR.Manager.advance(target, type, stage);
            }
        }
    };

    //==========================================================================
    // State Integration
    //==========================================================================

    /**
     * Automatically apply corruption when certain states are added
     * State Note: <CorruptionLink: type, stage>
     */
    
    const _Game_Battler_addState = Game_Battler.prototype.addState;
    Game_Battler.prototype.addState = function(stateId) {
        _Game_Battler_addState.call(this, stateId);
        
        // Check for corruption link in state note
        const state = $dataStates[stateId];
        if (state && state.note) {
            const match = state.note.match(/<CorruptionLink:\s*(\w+)\s*,?\s*(\d*)\s*>/i);
            if (match) {
                const type = match[1];
                const stage = Number(match[2]) || 1;
                COR.Manager.apply(this, type, stage);
            }
        }
    };

    //==========================================================================
    // Debug Commands (for testing)
    //==========================================================================

    if (Utils.isOptionValid('test') || Utils.isNwjs()) {
        
        /**
         * Debug: List all corruptions on party
         */
        window.COR_Debug = {
            listAll: function() {
                $gameParty.allMembers().forEach(function(actor) {
                    console.log('=== ' + actor.name() + ' ===');
                    const corruptions = COR.Manager.getAll(actor);
                    if (corruptions.length === 0) {
                        console.log('  No corruptions');
                    } else {
                        corruptions.forEach(function(c) {
                            console.log('  ' + c.typeId + ': Stage ' + c.stage);
                        });
                    }
                });
            },
            
            applyAll: function(type, stage) {
                $gameParty.allMembers().forEach(function(actor) {
                    COR.Manager.apply(actor, type, stage || 1);
                });
            },
            
            clearAll: function() {
                $gameParty.allMembers().forEach(function(actor) {
                    COR.Manager.removeAll(actor);
                });
            },
            
            listTypes: function() {
                console.log('Registered corruption types:');
                COR.Registry.getAllTypes().forEach(function(id) {
                    const type = COR.Registry.getType(id);
                    console.log('  ' + id + ': ' + type.name + ' (max stage: ' + type.maxStage + ')');
                });
            }
        };
        
        console.log('COR Debug commands available: COR_Debug.listAll(), COR_Debug.applyAll(type, stage), COR_Debug.clearAll(), COR_Debug.listTypes()');
    }

})();
