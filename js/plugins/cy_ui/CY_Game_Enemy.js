/*:
 * @plugindesc Enemy Logic extensions for CY Battle System
 */

function CY_Game_Enemy() {
    throw new Error('This is a static class');
}

CY_Game_Enemy.parseSkillUseAI = function (note) {
    const blocks = [];
    const tagRegex = /<Skill_Use_AI:\s*(\d+)>\s*([\s\S]*?)<\/skill_use_AI>/gi;
    let match;
    while ((match = tagRegex.exec(note))) {
        const skillId = Number(match[1]);
        const body = match[2].trim();
        const lines = body.split(/\r?\n/).map(l => l.trim()).filter(l => l);
        const conditions = [];
        let selection = null;
        for (const line of lines) {
            if (/^Select_If:\s*(.+)$/i.test(line)) {
                conditions.push({ type: "select_if", expr: RegExp.$1.trim() });
            } else if (/^Remove_If:\s*(.+)$/i.test(line)) {
                conditions.push({ type: "remove_if", expr: RegExp.$1.trim() });
            } else if (/^Select_Random$/i.test(line)) {
                selection = "random";
            } else if (/^Select_Default$/i.test(line)) {
                selection = "default";
            }
        }
        blocks.push({ skillId, conditions, selection });
    }
    return blocks;
};

CY_Game_Enemy.evaluateSkillUseAI = function (enemy, rules, t) {
    const valid = [];
    const defaults = [];

    for (const rule of rules) {
        // 1) Remove any if any "remove_if" expr is true
        const isRemoved = rule.conditions
            .filter(c => c.type === "remove_if")
            .some(c => CY_Game_Enemy.evalConditionAI(enemy, c.expr, t));
        if (isRemoved) continue;

        // 2) If there are select_if rules, require at least one to be true
        const selects = rule.conditions.filter(c => c.type === "select_if");
        if (selects.length > 0) {
            if (selects.some(c => CY_Game_Enemy.evalConditionAI(enemy, c.expr, t))) {
                valid.push(rule.skillId);
            }
        } else if (rule.selection === "default") {
            defaults.push(rule.skillId);
        } else {
            valid.push(rule.skillId);
        }
    }

    if (valid.length > 0) return valid;
    return defaults;
};

CY_Game_Enemy.evalConditionAI = function (enemy, expr, t) {
    // 1) t.state?(ID)
    const stateRegex = /^\s*t\.state\?\(\s*(\d+)\s*\)\s*$/i;
    let match = stateRegex.exec(expr);
    if (match) {
        const stateId = Number(match[1]);
        // t is usually 'this' (the enemy) or the target? 
        // In CorruptBattleLine.js usage: evalConditionAI(expr, t). 
        // And it was called with t._states checks.
        // wait, 't' in CorruptBattleLine.js Logic seems to be referring to 'this' (the enemy itself) or target?
        // Ah, in verify: "evalConditionAI(c.expr, t)".
        // And "Game_Enemy.prototype.parseSkillUseAI"
        // Actually, CorruptBattleLine line 773: evalConditionAI(expr, t).
        // line 739: evaluateSkillUseAI(rules, t).
        // Usage of 't' suggests 'target' or 'self'.
        // In ruby implementations often 't' is target, 's' is user.
        // But looking at line 780: `return Array.isArray(t._states) && t._states.includes(stateId);`
        // It checks t's states.
        return t.isStateAffected(stateId);
    }

    // 2) (t.hp_rate * 100) <= N
    const hpRateRegex = /^\s*\(\s*t\.hp_rate\s*\*\s*100\s*\)\s*<=\s*(\d+(?:\.\d+)?)\s*$/i;
    match = hpRateRegex.exec(expr);
    if (match) {
        const threshold = parseFloat(match[1]);
        return t.hpRate() * 100 <= threshold;
    }

    console.warn(`Unsupported AI condition: ${expr}`);
    return false;
};

// Hook into Game_Enemy
const _Game_Enemy_makeActions = Game_Enemy.prototype.makeActions;
Game_Enemy.prototype.makeActions = function () {
    if (SceneManager._scene instanceof CY_Scene_Battle) {
        this.clearActions();
        if (this.canMove()) {
            // Check for AI rules in note
            // Optimization: cache parsed rules?
            const rules = CY_Game_Enemy.parseSkillUseAI(this.enemy().note);
            if (rules && rules.length > 0) {
                // Determine skills to use
                const skillIds = CY_Game_Enemy.evaluateSkillUseAI(this, rules, this);
                if (skillIds.length > 0) {
                    const skillId = skillIds[Math.floor(Math.random() * skillIds.length)];
                    const action = new Game_Action(this);
                    action.setSkill(skillId);
                    action.decideRandomTarget();
                    this._actions.push(action);
                    return;
                }
            }
            // Fallback to default behavior if no custom AI triggered
            _Game_Enemy_makeActions.call(this);
        }
    } else {
        _Game_Enemy_makeActions.call(this);
    }
};

// ----------------------------------------------------------------------------
// Positioning Helpers and Overrides
// ----------------------------------------------------------------------------

CY_Game_Enemy.setupTroopFormatted = function () {
    // Layout constants
    const cols = 3;
    const startX = Graphics.boxWidth - 80;
    const startY = Graphics.boxHeight * 0.55;
    const hSpacing = 180;
    const vSpacing = 120;

    const enemies = $gameTroop.members();
    console.log("CY_Game_Enemy.setupTroopFormatted: Re-positioning " + enemies.length + " enemies");

    let i = 0;
    for (let k = 0; k < enemies.length; k++) {
        const enemy = enemies[k];
        if (enemy.enemyId() !== 5) {
            const col = i % cols;
            const row = Math.floor(i / cols);
            const x = startX - (cols - col - 1) * hSpacing - ((i >= 3 && i < 6) ? hSpacing * 0.5 : 0);
            const y = startY + row * vSpacing;

            enemy._screenX = x;
            enemy._screenY = y;
            console.log(" -> Enemy " + k + " moved to (" + x + "," + y + ")");
            i++;
        }
    }
};

// Override Game_Troop.setup to enforce this logic from the start
// This ensures that when BattleManager/DataManager sets up the troop,
// we use our grid layout instead of the default or rpg_basic.js layout.
const _Game_Troop_setup = Game_Troop.prototype.setup;
Game_Troop.prototype.setup = function (troopId) {
    // If not SideView, fall back to default behavior (which might be rpg_basic's implementation)
    // However, since we want to force our layout for this mode, we just check system setting.
    if ($gameSystem.isSideView()) {
        this.clear();
        this._troopId = troopId;
        this._enemies = [];

        // Layout constants
        const cols = 3;
        const startX = Graphics.boxWidth - 80;
        const startY = Graphics.boxHeight * 0.55;
        const hSpacing = 180;
        const vSpacing = 120;

        const members = this.troop().members;
        let i = 0;

        for (let k = 0; k < members.length; k++) {
            const m = members[k];
            if (!$dataEnemies[m.enemyId]) continue;

            let x = 0;
            let y = 0;

            if (m.enemyId !== 5) {
                const col = i % cols;
                const row = Math.floor(i / cols);
                x = startX - (cols - col - 1) * hSpacing - ((i >= 3 && i < 6) ? hSpacing * 0.5 : 0);
                y = startY + row * vSpacing;
                i++;
            }

            const enemy = new Game_Enemy(m.enemyId, x, y);
            if (m.hidden) {
                enemy.hide();
            }
            this._enemies.push(enemy);
        }
        this.makeUniqueNames();
    } else {
        _Game_Troop_setup.call(this, troopId);
    }
};

// ----------------------------------------------------------------------------
// Fix for rpg_basic.js interference
// ----------------------------------------------------------------------------

// rpg_basic.js adds setEnemyHome to Sprite_Enemy and calls it during updates, 
// which forces enemies to the left side of the screen. We override it to do nothing,
// preserving the positions set by our setupTroopFormatted logic.
Sprite_Enemy.prototype.setEnemyHome = function (index) {
    // Intentionally left empty
};
