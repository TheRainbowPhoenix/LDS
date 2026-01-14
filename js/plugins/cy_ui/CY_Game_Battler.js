/*:
 * @plugindesc Game_Battler extensions for CY Battle System
 */

// We define a helper namespace or mixin, but since Game_Battler is global pattern,
// we'll apply the mixin logic here or allow CY_Scene_Battle to enable it.
// Given the user request for "CY_Game_Enemy", we will structure this similarly.

// Since the effects (CorruptStages) seem persistent or critical to the game mechanics
// derived from CorruptBattleLine.js, we should probably apply them globally OR
// only when the logic is effectively active.
// However, the user request says "Game_Enemy overwrite would become some CY_Game_Enemy where you'd hook the methods needed only when in CY_Scene_Battle."
// For Game_Battler (states), it seems to be mechanics that might apply generally if the battle system assumes these states exist.
// But following the instruction, we will try to scope it or just define the logic here.

const CY_CorruptStages = {
    // key = "stage", value = ordered list of state IDs
    0: [52, 53, 54, 55], // Worms
    2: [43, 44, 45, 46], // Tentacles
    3: [47, 48, 49, 50], // Slime
    4: [33, 34, 35, 36, 37], // Ball
    5: [38, 39, 40, 41, 42], // Wall
};

// Helper function to be used by Game_Battler mixin
function CY_Game_Battler_getCorruptState(battler) {
    if (battler.isStateAffected(10)) return "2"; // QB2.png
    if (battler.isStateAffected(11)) return "3"; // QB3.png
    if (battler.isStateAffected(12)) return "H"; // QBH.png
    if (battler.isStateAffected(13)) return "R"; // QBR.png
    if (battler.isStateAffected(14)) return "TKO"; // QBTKO.png

    if (battler.isStateAffected(18)) return "B"; // DRONESTATEFOREVER
    if (battler.isStateAffected(19)) return "Q"; // Become Bee Drone
    if (battler.isStateAffected(20)) return "R"; // Resin(DONE)
    if (battler.isStateAffected(21)) return "RB"; // Resin(DONEBEE)
    if (battler.isStateAffected(23)) return "B2"; // Bound(BEE)
    if (battler.isStateAffected(24)) return "B2"; // Bound(EX)(BEE)

    if (battler.isStateAffected(30)) return "2"; // Bound
    if (battler.isStateAffected(31)) return "2"; // Bound(EX)
    if (battler.isStateAffected(106)) return "TKO"; // TKO (Ally) Persistent

    if (battler.isStateAffected(302)) return "H"; // Hypno2
    if (battler.isStateAffected(303)) return "H"; // Hypno2
    if (battler.isStateAffected(305)) return "HB"; // Hypno2(BEE)
    if (battler.isStateAffected(306)) return "HB"; // Hypno2(BEE)
    return null;
}

// Logic for adding state with corruption progression
function CY_Game_Battler_addState(battler, stateId, originalMethod) {
    if (!(SceneManager._scene instanceof CY_Scene_Battle)) {
        return originalMethod.call(battler, stateId);
    }

    // look for any stage whose list contains the attempted stateId
    for (const stageKey in CY_CorruptStages) {
        const list = CY_CorruptStages[stageKey];
        const attemptedIdx = list.indexOf(stateId);
        if (attemptedIdx > -1) {
            // found a matching stage list -> time to "progress"
            let currIdx = -1;
            for (let i = 0; i < list.length; i++) {
                if (battler.isStateAffected(list[i])) {
                    currIdx = i;
                }
            }

            let nextIdx;
            if (currIdx === -1) {
                nextIdx = attemptedIdx;
            } else if (currIdx < list.length - 1) {
                nextIdx = currIdx + 1;
            } else {
                return; // already at final corrupt state
            }

            const newStateId = list[nextIdx];
            // erase *any* state from this stage
            for (const sid of list) {
                if (battler.isStateAffected(sid)) {
                    battler.removeState(sid);
                }
            }
            battler._needRefresh = true;
            return originalMethod.call(battler, newStateId);
        }
    }
    return originalMethod.call(battler, stateId);
}

// Apply hooks
const _Game_Battler_addState = Game_Battler.prototype.addState;
Game_Battler.prototype.addState = function (stateId) {
    return CY_Game_Battler_addState(this, stateId, _Game_Battler_addState);
};

// Add helper method to prototype (safe to add globally usually)
Game_Battler.prototype.getCorruptState = function () {
    return CY_Game_Battler_getCorruptState(this);
};

// Global actor change helper
window.change_class = function (actorId, classId, keepExp) {
    keepExp = !!keepExp;
    const actor = $gameActors.actor(actorId);
    if (!actor) {
        console.warn(`change_class: No actor found with ID ${actorId}`);
        return;
    }
    actor.changeClass(classId, keepExp);
    actor.refresh();
};
