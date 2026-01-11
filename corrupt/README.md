# Corruption Framework (COR)

A robust, extensible framework for managing corruption, transformation, and negative status effects in RPG Maker MZ/MV.

## Features

- **Multiple simultaneous corruptions** - Characters can have multiple corruption types active at once
- **Progressive stages** - Each corruption type can have multiple stages with escalating effects
- **Time-based progression** - Corruption can automatically advance over time
- **Stat modifiers** - ATK, DEF, AGI, crit rate, miss chance, etc.
- **Movement effects** - Speed changes, stumbling, loss of control
- **Visual changes** - Sprite suffixes, tints, face/battler swaps
- **Behavior effects** - Random movement, confusion, auto-attack, charm
- **Transformation** - Class changes, skill learning/forgetting, enemy conversion
- **Extensible** - Easy to add new corruption types and custom effects

## Plugin Load Order

```
1. COR_Core.js        - Core system (required)
2. COR_Stats.js       - Stat modifiers
3. COR_Movement.js    - Map movement effects
4. COR_Visual.js      - Sprite/visual changes
5. COR_Transform.js   - Class change/enemy conversion
6. COR_Config.js      - Your corruption definitions
7. COR_Commands.js    - Plugin commands
```

## Quick Start

### Script Calls

```javascript
// Apply corruption to actor 1
COR.apply(1, 'slime', 1);

// Advance corruption by 1 stage
COR.advance(1, 'slime');

// Check corruption level
var level = COR.getLevel(1, 'slime');

// Check if corrupted
if (COR.isCorrupted(1, 'slime')) { ... }

// Remove corruption
COR.remove(1, 'slime');
```

### MV Plugin Commands

```
COR APPLY 1 slime 1
COR ADVANCE 1 slime 1
COR REMOVE 1 slime
COR TIMEPROGRESSION ON
```

### Note Tags

**On Events (touch trigger):**
```
<CorruptOnTouch: slime, 1>
```

**On Skills/Items:**
```
<CorruptAttack: hypnosis, 1, 0.5>
```

**On States:**
```
<CorruptionLink: parasite, 2>
```

## Defining Corruption Types

Edit `COR_Config.js` to add your corruption types:

```javascript
COR.Registry.registerType('myCorruption', {
    name: 'My Corruption',
    maxStage: 4,
    stateIds: [10, 11, 12, 13], // RPG Maker state IDs
    spriteSuffix: 'C',
    
    stages: [
        // Stage 1
        {
            statModifiers: { atk: 0.95, def: 0.95 },
            rateModifiers: { cri: -0.02 },
            moveSpeed: 0,
            visual: { suffix: 'C1' }
        },
        // Stage 2
        {
            statModifiers: { atk: 0.85, def: 0.85 },
            rateModifiers: { cri: -0.05, hit: -0.03 },
            moveSpeed: -1,
            stumbleChance: 0.05,
            behavior: 'randomMove',
            visual: { suffix: 'C2', tint: [100, 0, 0, 48] }
        },
        // ... more stages
    ],
    
    timeProgression: {
        interval: 3600 // Frames between auto-advance
    },
    
    onApply: function(battler, stage) {
        // Custom logic when corruption is applied
    },
    onMaxStage: function(battler) {
        // Custom logic at max corruption
    }
});
```

## Stage Configuration Options

| Option | Type | Description |
|--------|------|-------------|
| `statModifiers` | Object | Multipliers for stats: `{ atk: 0.9, def: 1.1, ... }` |
| `rateModifiers` | Object | Additive rates: `{ cri: 0.1, eva: -0.05, ... }` |
| `moveSpeed` | Number | Speed delta (-3 to +3) |
| `stumbleChance` | Number | 0-1 chance to stumble when moving |
| `behavior` | String | 'none', 'randomMove', 'confused', 'autoAttack', 'charmed', 'cannotAct' |
| `visual.suffix` | String | Appended to sprite names |
| `visual.tint` | Array | [R, G, B, A] color tint |
| `visual.characterName` | String | Override map sprite |
| `visual.battlerName` | String | Override battle sprite |
| `visual.faceName` | String | Override face graphic |
| `transform.classId` | Number | Change to this class |
| `transform.learnSkills` | Array | Skill IDs to learn |
| `transform.forgetSkills` | Array | Skill IDs to forget |
| `transform.toEnemy` | Object | Convert to enemy in battle |
| `sealedSkills` | Array | Skill IDs that can't be used |
| `equipRestrictions` | Object | Equipment limitations |

## Behavior Types

| Behavior | Effect |
|----------|--------|
| `none` | Normal control |
| `randomMove` | Random movement on map, no player control |
| `moveTowardEnemy` | Auto-move toward events with `<Enemy>` tag |
| `confused` | 50% chance to attack allies in battle |
| `autoAttack` | Automatically attacks, no player input |
| `charmed` | Controlled by enemy, may convert to enemy |
| `cannotAct` | Cannot move or act |

## Debug Commands (Test Mode)

```javascript
COR_Debug.listAll()           // List all corruptions on party
COR_Debug.listTypes()         // List registered corruption types
COR_Debug.applyAll('slime', 2) // Apply to all party members
COR_Debug.clearAll()          // Remove all corruptions
```

## Migration from Old Plugins

The framework replaces and consolidates:
- `CorruptBattleLine.js` - Battle sprite changes
- `CorruptChange.js` - Class changes and enemy conversion
- `CorruptMiniStatus.js` - Face/portrait changes

Your existing state IDs can be linked to corruption stages via the `stateIds` array in each corruption type definition.
