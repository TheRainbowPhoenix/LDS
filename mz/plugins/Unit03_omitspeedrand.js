//=============================================================================
// PBomitspeedrand.js v1.0
//=============================================================================

//-----------------------------------------------------------------------------
/*:
 * @target MZ
 * @plugindesc 行動順からランダム性を除外
 * @author PB
 *
 * @help 行動順からランダム性を除外
 * 
 */
(() => {
    "use strict"
    Game_Action.prototype.speed = function() {
//        const agi = this.subject().agi;
//        let speed = agi + Math.randomInt(Math.floor(5 + agi / 4));
        let speed = this.subject().agi;
        if (this.item()) {
            speed += this.item().speed;
        }
        if (this.isAttack()) {
            speed += this.subject().attackSpeed();
        }
        return speed;
    };
})();