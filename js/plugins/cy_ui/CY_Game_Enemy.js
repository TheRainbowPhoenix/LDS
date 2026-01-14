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

// Hook into Game_Troop to position enemies for CY_Scene_Battle
// This is tricky because setup happens before scene start usually.
// But we can check if we likely want this layout? 
// Or better: In CY_Scene_Battle, we can force a repositioning of enemies?
// Alternatively: Override setup and check a flag? 
// Since we don't know the scene during setup (setup happens when encounter starts), 
// we might check purely based on the plugin being active? 
// Valid approach: CY_Scene_Battle.prototype.start/create calls a helper to reposition enemies.
// But CorruptBattleLine.js modifies Game_Troop directly.
// Let's implement static helper for positioning that CY_Scene_Battle calls.

CY_Game_Enemy.setupTroopFormatted = function () {
    // Layout constants
    const cols = 3;
    const startX = Graphics.boxWidth - 80;
    const startY = Graphics.boxHeight * 0.55;
    const hSpacing = 180;
    const vSpacing = 120;

    const members = $gameTroop.members(); // These are Game_Enemy instances
    // We need to re-assign their X/Y.
    // However, Game_Troop setup creates them from $dataTroops.
    // If we just move them here, it works.

    // Warning: members order in $gameTroop._enemies matches allocation order.
    // We should iterate them and re-assign screenX/Y?
    // Game_Enemy coordinates are _screenX, _screenY usually set in ctor.
    // makeUniqueNames() is also called.

    // Re-run the logic from CorruptBattleLine for positioning
    // Note: The logic in CorruptBattleLine used `i` variable that skips hidden/ID=5 enemies.

    // We can't easily re-run the loop on existing members without knowing which member maps to which index logic.
    // But since we are in a fresh scene, we can iterate $gameTroop._enemies and reposition them.

    // Let's rely on the fact that we can iterate them.
    let i = 0;
    const enemies = $gameTroop._enemies;
    for (let k = 0; k < enemies.length; k++) {
        const enemy = enemies[k];
        // If enemy was hidden or is specific ID?
        // Corrupt logic: if (m.enemyId != 5) ... i++
        // We can check enemy.enemyId()

        if (enemy.enemyId() !== 5) {
            const col = i % cols;
            const row = Math.floor(i / cols);
            const x = startX - (cols - col - 1) * hSpacing - ((i >= 3 && i < 6) ? hSpacing * 0.5 : 0);
            const y = startY + row * vSpacing;

            enemy._screenX = x;
            enemy._screenY = y;
            i++;
        }
    }
};
