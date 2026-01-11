/*:
 * @plugindesc Corruption Framework - Visual Effects
 * @author Phoebe
 * @version 1.0.0
 *
 * @help
 * ============================================================================
 * COR_Visual - Sprite and Visual Changes
 * ============================================================================
 * 
 * This module handles visual changes from corruption:
 * - Map character sprite changes
 * - Battle sprite changes
 * - Face/portrait changes
 * - Tint/color effects
 * 
 * Visual Configuration in stage config:
 * {
 *   visual: {
 *     suffix: 'C1',           // Appended to sprite name
 *     characterName: 'Actor1_Corrupt',  // Override character sprite
 *     characterIndex: 0,      // Override character index
 *     faceName: 'Actor1_Corrupt',       // Override face
 *     faceIndex: 0,           // Override face index
 *     battlerName: 'Actor1_C1',         // Override battler sprite
 *     tint: [255, 0, 0, 128], // RGBA tint
 *     priority: 1             // Higher = takes precedence
 *   }
 * }
 * 
 */

var Imported = Imported || {};
Imported.COR_Visual = '1.0.0';

(function() {
    'use strict';

    if (!Imported.COR_Core) {
        console.error('COR_Visual requires COR_Core');
        return;
    }

    //==========================================================================
    // Actor Visual Getters
    //==========================================================================

    /**
     * Get character name with corruption suffix
     */
    const _Game_Actor_characterName = Game_Actor.prototype.characterName;
    Game_Actor.prototype.characterName = function() {
        const baseName = _Game_Actor_characterName.call(this);
        const config = COR.Effects.getVisualConfig(this);
        
        if (config) {
            if (config.characterName) {
                return config.characterName;
            }
            if (config.suffix) {
                return baseName + config.suffix;
            }
        }
        
        return baseName;
    };

    /**
     * Get character index with corruption override
     */
    const _Game_Actor_characterIndex = Game_Actor.prototype.characterIndex;
    Game_Actor.prototype.characterIndex = function() {
        const config = COR.Effects.getVisualConfig(this);
        
        if (config && typeof config.characterIndex === 'number') {
            return config.characterIndex;
        }
        
        return _Game_Actor_characterIndex.call(this);
    };

    /**
     * Get face name with corruption suffix
     */
    const _Game_Actor_faceName = Game_Actor.prototype.faceName;
    Game_Actor.prototype.faceName = function() {
        const baseName = _Game_Actor_faceName.call(this);
        const config = COR.Effects.getVisualConfig(this);
        
        if (config) {
            if (config.faceName) {
                return config.faceName;
            }
            if (config.suffix) {
                return baseName + config.suffix;
            }
        }
        
        return baseName;
    };

    /**
     * Get face index with corruption override
     */
    const _Game_Actor_faceIndex = Game_Actor.prototype.faceIndex;
    Game_Actor.prototype.faceIndex = function() {
        const config = COR.Effects.getVisualConfig(this);
        
        if (config && typeof config.faceIndex === 'number') {
            return config.faceIndex;
        }
        
        return _Game_Actor_faceIndex.call(this);
    };

    /**
     * Get battler name with corruption suffix
     */
    const _Game_Actor_battlerName = Game_Actor.prototype.battlerName;
    Game_Actor.prototype.battlerName = function() {
        const baseName = _Game_Actor_battlerName.call(this);
        const config = COR.Effects.getVisualConfig(this);
        
        if (config) {
            if (config.battlerName) {
                return config.battlerName;
            }
            if (config.suffix) {
                return baseName + config.suffix;
            }
        }
        
        return baseName;
    };

    //==========================================================================
    // Sprite Refresh on Corruption Change
    //==========================================================================

    const _Sprite_Actor_updateBitmap = Sprite_Actor.prototype.updateBitmap;
    Sprite_Actor.prototype.updateBitmap = function() {
        const actor = this._actor;
        
        if (actor && actor._needCorruptRefresh) {
            actor._needCorruptRefresh = false;
            this._battlerName = ''; // Force reload
        }
        
        _Sprite_Actor_updateBitmap.call(this);
    };

    //==========================================================================
    // Map Sprite Refresh
    //==========================================================================

    const _Sprite_Character_updateBitmap = Sprite_Character.prototype.updateBitmap;
    Sprite_Character.prototype.updateBitmap = function() {
        // Check if this is the player and needs refresh
        if (this._character === $gamePlayer) {
            const leader = $gameParty.leader();
            if (leader && leader._needCorruptRefresh) {
                this._characterName = ''; // Force reload
            }
        }
        
        _Sprite_Character_updateBitmap.call(this);
    };

    //==========================================================================
    // Tint Effects
    //==========================================================================

    const _Sprite_Actor_update = Sprite_Actor.prototype.update;
    Sprite_Actor.prototype.update = function() {
        _Sprite_Actor_update.call(this);
        this.updateCorruptionTint();
    };

    Sprite_Actor.prototype.updateCorruptionTint = function() {
        if (!this._actor) return;
        
        const config = COR.Effects.getVisualConfig(this._actor);
        
        if (config && config.tint) {
            const tint = config.tint;
            this.setBlendColor(tint);
        } else {
            this.setBlendColor([0, 0, 0, 0]);
        }
    };

    //==========================================================================
    // Window Face Drawing Override
    //==========================================================================

    const _Window_Base_drawActorFace = Window_Base.prototype.drawActorFace;
    Window_Base.prototype.drawActorFace = function(actor, x, y, width, height) {
        // Actor's faceName/faceIndex already handle corruption via overrides
        _Window_Base_drawActorFace.call(this, actor, x, y, width, height);
    };

    //==========================================================================
    // Corruption Visual Helper
    //==========================================================================

    /**
     * Get corruption-aware sprite name for an actor
     * Useful for custom sprite systems
     */
    COR.Visual = COR.Visual || {};

    COR.Visual.getSpriteName = function(actor, baseType) {
        if (!actor) return '';
        
        const config = COR.Effects.getVisualConfig(actor);
        let baseName = '';
        
        switch (baseType) {
            case 'character':
                baseName = actor.actor().characterName;
                break;
            case 'face':
                baseName = actor.actor().faceName;
                break;
            case 'battler':
                baseName = actor.actor().battlerName;
                break;
            default:
                baseName = actor.name();
        }
        
        if (config && config.suffix) {
            return baseName + config.suffix;
        }
        
        return baseName;
    };

    /**
     * Build sprite name from actor and corruption state
     * Format: BaseName + CorruptType + Stage
     * Example: "Hero" + "Slime" + "2" = "HeroSlime2"
     */
    COR.Visual.buildSpriteName = function(actor, format) {
        if (!actor) return '';
        
        format = format || '{base}{type}{stage}';
        
        const corruptions = COR.Manager.getAll(actor);
        if (corruptions.length === 0) {
            return format.replace('{base}', actor.name())
                        .replace('{type}', '')
                        .replace('{stage}', '');
        }
        
        // Use highest priority corruption
        let primary = corruptions[0];
        corruptions.forEach(function(c) {
            if (c.stage > primary.stage) {
                primary = c;
            }
        });
        
        const type = COR.Registry.getType(primary.typeId);
        const typeName = type ? (type.spriteSuffix || type.id) : '';
        
        return format.replace('{base}', actor.name())
                    .replace('{type}', typeName)
                    .replace('{stage}', primary.stage.toString());
    };

})();
