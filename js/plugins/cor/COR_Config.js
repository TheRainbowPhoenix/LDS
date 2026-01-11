/*:
 * @plugindesc Corruption Framework - Configuration
 * @author Phoebe
 * @version 1.0.0
 *
 * @help
 * ============================================================================
 * COR_Config - Define Your Corruption Types Here
 * ============================================================================
 * 
 * This file contains all corruption type definitions. Edit this file to
 * add, modify, or remove corruption types for your game.
 * 
 * Each corruption type has:
 * - id: Unique identifier (string)
 * - name: Display name
 * - maxStage: Maximum corruption level (default 4)
 * - stateIds: Array of RPG Maker state IDs for each stage
 * - stages: Array of stage configurations
 * - timeProgression: Optional time-based advancement
 * - callbacks: onApply, onAdvance, onRemove, onMaxStage
 * 
 * Stage Configuration Options:
 * - statModifiers: { atk: 0.9, def: 0.8, ... } (multipliers)
 * - rateModifiers: { cri: 0.1, eva: -0.05, ... } (additive)
 * - moveSpeed: -1 (speed delta)
 * - behavior: 'none', 'randomMove', 'confused', etc.
 * - stumbleChance: 0.1 (10% chance to stumble)
 * - visual: { suffix: 'C1', tint: [r,g,b,a], ... }
 * - transform: { classId: 5, learnSkills: [...], ... }
 * - sealedSkills: [1, 2, 3] (skill IDs that can't be used)
 * - equipRestrictions: { forbiddenEtypes: [1, 2], ... }
 * 
 */

var Imported = Imported || {};
Imported.COR_Config = '1.0.0';

(function() {
    'use strict';

    if (!Imported.COR_Core) {
        console.error('COR_Config requires COR_Core');
        return;
    }

    //==========================================================================
    // EXAMPLE CORRUPTION TYPES
    // Modify these or add your own!
    //==========================================================================

    /**
     * Slime Corruption
     * Progressive transformation into a slime creature
     */
    COR.Registry.registerType('slime', {
        name: 'Slime Corruption',
        maxStage: 4,
        stateIds: [47, 48, 49, 50], // Link to your database states
        spriteSuffix: 'S', // For sprite naming: HeroS1, HeroS2, etc.
        
        stages: [
            // Stage 1 - Minor infection
            {
                statModifiers: { agi: 0.95 },
                rateModifiers: { eva: -0.02 },
                moveSpeed: 0,
                visual: { suffix: 'S1', priority: 1 }
            },
            // Stage 2 - Spreading
            {
                statModifiers: { agi: 0.85, def: 1.1 },
                rateModifiers: { eva: -0.05 },
                moveSpeed: -1,
                stumbleChance: 0.05,
                visual: { suffix: 'S2', priority: 2 }
            },
            // Stage 3 - Major transformation
            {
                statModifiers: { agi: 0.7, def: 1.3, atk: 0.8 },
                rateModifiers: { eva: -0.1, hit: -0.05 },
                moveSpeed: -2,
                stumbleChance: 0.1,
                behavior: 'randomMove',
                visual: { suffix: 'S3', priority: 3, tint: [0, 100, 200, 64] }
            },
            // Stage 4 - Full transformation
            {
                statModifiers: { agi: 0.5, def: 1.5, atk: 0.6, mat: 0.6 },
                rateModifiers: { eva: -0.15, hit: -0.1 },
                moveSpeed: -3,
                behavior: 'confused',
                visual: { suffix: 'S4', priority: 4, tint: [0, 150, 255, 96] },
                transform: {
                    classId: null, // Set to class ID if you want class change
                    learnSkills: [], // Skill IDs to learn
                    forgetSkills: [] // Skill IDs to forget
                }
            }
        ],
        
        // Time-based progression (optional)
        timeProgression: {
            interval: 3600 // Frames between auto-advancement (60 = 1 second)
        },
        
        // Callbacks
        onApply: function(battler, stage) {
            console.log(battler.name() + ' contracted Slime Corruption!');
        },
        onMaxStage: function(battler) {
            console.log(battler.name() + ' fully transformed into slime!');
        }
    });

    /**
     * Mind Control / Hypnosis
     * Mental corruption leading to loss of control
     */
    COR.Registry.registerType('hypnosis', {
        name: 'Hypnosis',
        maxStage: 4,
        stateIds: [302, 303, 305, 306], // Your hypno states
        spriteSuffix: 'H',
        
        stages: [
            // Stage 1 - Dazed
            {
                statModifiers: { mat: 0.9, mdf: 0.9 },
                rateModifiers: { hit: -0.03 },
                visual: { suffix: 'H1', priority: 1 }
            },
            // Stage 2 - Suggestible
            {
                statModifiers: { mat: 0.8, mdf: 0.8 },
                rateModifiers: { hit: -0.05 },
                behavior: 'confused',
                visual: { suffix: 'H2', priority: 2 }
            },
            // Stage 3 - Enthralled
            {
                statModifiers: { mat: 0.7, mdf: 0.7, atk: 1.1 },
                rateModifiers: { hit: -0.08 },
                behavior: 'autoAttack',
                visual: { suffix: 'H3', priority: 3, tint: [200, 0, 200, 64] }
            },
            // Stage 4 - Fully controlled
            {
                statModifiers: { mat: 0.5, mdf: 0.5, atk: 1.3 },
                behavior: 'charmed',
                visual: { suffix: 'H4', priority: 4, tint: [255, 0, 255, 96] },
                transform: {
                    toEnemy: {
                        enemyId: 6, // Enemy ID when converted
                        keepName: true,
                        removeFromParty: true
                    }
                }
            }
        ]
    });

    /**
     * Parasite / Worm Infestation
     * Physical corruption with stat drain
     */
    COR.Registry.registerType('parasite', {
        name: 'Parasite Infestation',
        maxStage: 5,
        stateIds: [52, 53, 54, 55, 56], // Your parasite states
        spriteSuffix: 'P',
        
        stages: [
            {
                statModifiers: { mhp: 0.95 },
                visual: { suffix: 'P1' }
            },
            {
                statModifiers: { mhp: 0.85, atk: 0.95 },
                rateModifiers: { hrg: -0.01 },
                visual: { suffix: 'P2' }
            },
            {
                statModifiers: { mhp: 0.75, atk: 0.9, def: 0.9 },
                rateModifiers: { hrg: -0.02 },
                visual: { suffix: 'P3', tint: [100, 50, 100, 48] }
            },
            {
                statModifiers: { mhp: 0.6, atk: 0.8, def: 0.8 },
                rateModifiers: { hrg: -0.03 },
                behavior: 'randomMove',
                visual: { suffix: 'P4', tint: [150, 50, 150, 64] }
            },
            {
                statModifiers: { mhp: 0.5, atk: 0.7, def: 0.7, agi: 0.7 },
                rateModifiers: { hrg: -0.05 },
                behavior: 'cannotAct',
                visual: { suffix: 'P5', tint: [200, 50, 200, 96] }
            }
        ],
        
        timeProgression: {
            interval: 1800 // Faster progression
        }
    });

    /**
     * Bee/Drone Transformation
     * Based on your existing CorruptChange system
     */
    COR.Registry.registerType('drone', {
        name: 'Drone Transformation',
        maxStage: 4,
        stateIds: [20, 21, 22, 23], // Your TF states
        spriteSuffix: 'B',
        
        stages: [
            {
                statModifiers: { agi: 1.05 },
                visual: { suffix: 'B1' }
            },
            {
                statModifiers: { agi: 1.1, atk: 0.95 },
                visual: { suffix: 'B2' }
            },
            {
                statModifiers: { agi: 1.15, atk: 0.9, mat: 0.9 },
                behavior: 'moveTowardEnemy',
                visual: { suffix: 'B3', tint: [255, 200, 0, 48] }
            },
            {
                statModifiers: { agi: 1.2, atk: 0.8, mat: 0.8, mdf: 0.8 },
                behavior: 'charmed',
                visual: { suffix: 'B4', tint: [255, 200, 0, 96] },
                transform: {
                    classId: 5, // Drone class
                    keepExp: true,
                    toEnemy: {
                        enemyId: 6,
                        keepName: true
                    }
                }
            }
        ],
        
        onMaxStage: function(battler) {
            // Custom logic when fully transformed
            if ($gameParty.inBattle()) {
                $gameParty.makeEnemy && $gameParty.makeEnemy(battler);
            }
        }
    });

    /**
     * Bound/Restrained
     * Movement restriction corruption
     */
    COR.Registry.registerType('bound', {
        name: 'Bound',
        maxStage: 3,
        stateIds: [30, 31, 32],
        spriteSuffix: 'R',
        
        stages: [
            {
                statModifiers: { agi: 0.7, eva: 0.5 },
                moveSpeed: -2,
                visual: { suffix: 'R1' }
            },
            {
                statModifiers: { agi: 0.4, eva: 0.2, def: 0.8 },
                moveSpeed: -4,
                behavior: 'cannotAct',
                visual: { suffix: 'R2' }
            },
            {
                statModifiers: { agi: 0.1, eva: 0, def: 0.5 },
                moveSpeed: -6,
                behavior: 'cannotAct',
                visual: { suffix: 'R3' },
                sealedSkills: [] // All skills sealed at this stage
            }
        ]
    });

    //==========================================================================
    // CUSTOM EFFECT HANDLERS
    // Register handlers for special effects
    //==========================================================================

    /**
     * Example: Drain HP over time
     */
    COR.Registry.registerEffectHandler('hpDrain', function(battler, amount) {
        if (battler && battler.isAlive()) {
            battler.gainHp(-amount);
            if (battler.hp <= 0) {
                battler.addState(battler.deathStateId());
            }
        }
    });

    /**
     * Example: Spread corruption to nearby party members
     */
    COR.Registry.registerEffectHandler('spread', function(battler, typeId, chance) {
        if (Math.random() > chance) return;
        
        $gameParty.battleMembers().forEach(function(member) {
            if (member !== battler && !COR.Manager.isCorrupted(member, typeId)) {
                if (Math.random() < 0.3) { // 30% spread chance
                    COR.Manager.apply(member, typeId, 1);
                }
            }
        });
    });

})();
