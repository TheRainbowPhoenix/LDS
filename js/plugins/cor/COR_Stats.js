/*:
 * @plugindesc Corruption Framework - Stat Modifiers
 * @author Phoebe
 * @version 1.0.0
 *
 * @help
 * ============================================================================
 * COR_Stats - Stat Modification System
 * ============================================================================
 * 
 * This module hooks into RPG Maker's stat calculation to apply corruption
 * effects to battler parameters.
 * 
 * Supported stat modifiers:
 * - atk, def, mat, mdf, agi, luk (multipliers)
 * - mhp, mmp (max HP/MP multipliers)
 * 
 * Supported rate modifiers:
 * - hit, eva, cri, cev, mev, mrf, cnt, hrg, mrg, trg
 * 
 * Configure these in your corruption type definitions.
 * 
 */

var Imported = Imported || {};
Imported.COR_Stats = '1.0.0';

(function() {
    'use strict';

    if (!Imported.COR_Core) {
        console.error('COR_Stats requires COR_Core');
        return;
    }

    //==========================================================================
    // Parameter Modifiers (ATK, DEF, etc.)
    //==========================================================================

    const _Game_BattlerBase_param = Game_BattlerBase.prototype.param;
    Game_BattlerBase.prototype.param = function(paramId) {
        let value = _Game_BattlerBase_param.call(this, paramId);
        
        // Apply corruption modifiers
        const paramNames = ['mhp', 'mmp', 'atk', 'def', 'mat', 'mdf', 'agi', 'luk'];
        const paramName = paramNames[paramId];
        
        if (paramName) {
            const modifier = COR.Effects.getStatModifier(this, paramName);
            value = Math.round(value * modifier);
        }
        
        return Math.max(0, value);
    };

    //==========================================================================
    // X-Parameter Modifiers (HIT, EVA, CRI, etc.)
    //==========================================================================

    const _Game_BattlerBase_xparam = Game_BattlerBase.prototype.xparam;
    Game_BattlerBase.prototype.xparam = function(xparamId) {
        let value = _Game_BattlerBase_xparam.call(this, xparamId);
        
        // Apply corruption rate modifiers
        const xparamNames = ['hit', 'eva', 'cri', 'cev', 'mev', 'mrf', 'cnt', 'hrg', 'mrg', 'trg'];
        const xparamName = xparamNames[xparamId];
        
        if (xparamName) {
            const modifier = COR.Effects.getRateModifier(this, xparamName);
            value += modifier;
        }
        
        return value;
    };

    //==========================================================================
    // S-Parameter Modifiers (TGR, GRD, REC, etc.)
    //==========================================================================

    const _Game_BattlerBase_sparam = Game_BattlerBase.prototype.sparam;
    Game_BattlerBase.prototype.sparam = function(sparamId) {
        let value = _Game_BattlerBase_sparam.call(this, sparamId);
        
        // Apply corruption rate modifiers
        const sparamNames = ['tgr', 'grd', 'rec', 'pha', 'mcr', 'tcr', 'pdr', 'mdr', 'fdr', 'exr'];
        const sparamName = sparamNames[sparamId];
        
        if (sparamName) {
            const modifier = COR.Effects.getRateModifier(this, sparamName);
            value += modifier;
        }
        
        return value;
    };

    //==========================================================================
    // Action Restriction from Corruption
    //==========================================================================

    const _Game_BattlerBase_canMove = Game_BattlerBase.prototype.canMove;
    Game_BattlerBase.prototype.canMove = function() {
        if (!_Game_BattlerBase_canMove.call(this)) return false;
        
        const behavior = COR.Effects.getBehavior(this);
        if (behavior === COR.BehaviorType.CANNOT_ACT) {
            return false;
        }
        
        return true;
    };

    //==========================================================================
    // Confusion/Charm Effects in Battle
    //==========================================================================

    const _Game_Action_setConfusion = Game_Action.prototype.setConfusion;
    Game_Action.prototype.setConfusion = function() {
        _Game_Action_setConfusion.call(this);
        
        // Check for corruption-based confusion
        const behavior = COR.Effects.getBehavior(this.subject());
        if (behavior === COR.BehaviorType.CONFUSED) {
            this.setAttack();
        }
    };

    /**
     * Check if battler should target allies due to corruption
     */
    Game_Action.prototype.isCorruptionConfused = function() {
        const behavior = COR.Effects.getBehavior(this.subject());
        return behavior === COR.BehaviorType.CONFUSED || 
               behavior === COR.BehaviorType.CHARMED;
    };

    const _Game_Action_targetsForOpponents = Game_Action.prototype.targetsForOpponents;
    Game_Action.prototype.targetsForOpponents = function() {
        if (this.isCorruptionConfused() && Math.random() < 0.5) {
            // 50% chance to target allies instead
            return this.targetsForFriends();
        }
        return _Game_Action_targetsForOpponents.call(this);
    };

    //==========================================================================
    // Auto-Attack Behavior
    //==========================================================================

    const _Game_Actor_makeActions = Game_Actor.prototype.makeActions;
    Game_Actor.prototype.makeActions = function() {
        const behavior = COR.Effects.getBehavior(this);
        
        if (behavior === COR.BehaviorType.AUTO_ATTACK || 
            behavior === COR.BehaviorType.CONFUSED ||
            behavior === COR.BehaviorType.CHARMED) {
            // Force auto-attack behavior
            this.clearActions();
            if (this.canMove()) {
                const action = new Game_Action(this);
                action.setAttack();
                this._actions.push(action);
            }
            return;
        }
        
        _Game_Actor_makeActions.call(this);
    };

    /**
     * Check if actor can receive player commands
     */
    Game_Actor.prototype.canInput = function() {
        if (!Game_BattlerBase.prototype.canInput.call(this)) return false;
        return COR.Effects.canControl(this);
    };

})();
