/*:
 * @plugindesc Draw party members’ corrupted
 * @author Phoebe
 *
 * @param -> MAIN <----------------------
 * @desc
 *
 * @param EnableClassChange
 * @text Enable Class Change
 * @desc Enable corruption class change
 * @default true
 * @parent -> MAIN <----------------------
 *
 * @param EnableActorToEnemy
 * @text Enable Actor To Enemy
 * @desc Enable corruption to Enemy
 * @default true
 * @parent -> MAIN <----------------------
 *
 */
(() => {
  //–– Plugin parameters
  var Imported = Imported || {};
  Imported.CorruptChange = true;

  const params = PluginManager.parameters("CorruptChange");
  const enableClassChange = params.EnableClassChange === "true";
  const classChangeRules = JSON.parse(
    params.ClassChangeRules ||
      JSON.stringify([
        {
          triggerStateId: 20, // inflict Change 1
          requiredStateId: 23, // has Change 4
          newClassId: 5, // set class to changed
        },
      ])
  );
  const enableActorToEnemy = params.EnableActorToEnemy === "true";
  const actorToEnemyRules = JSON.parse(
    params.ActorToEnemyRules ||
      JSON.stringify([
        {
          triggerStateId: 20,
          requiredClassId: 5,
          enemyId: 6, // queen
        },
      ])
  );

  const CorruptStages = {
    // key = “stage”, value = ordered list of state IDs
    0: [20, 21, 22, 23], // TF stages
  };

  Game_Battler.prototype.getCorruptStage = function () {
    if (this.isStateAffected(20)) return "C"; //
    if (this.isStateAffected(21)) return "C"; //
    if (this.isStateAffected(22)) return "C"; //
    if (this.isStateAffected(23)) return "C"; //
    return null; // default
  };

  Game_Battler.prototype.getCorruptLvl = function () {
    if (this.isStateAffected(20)) return 1; //
    if (this.isStateAffected(21)) return 2; //
    if (this.isStateAffected(22)) return 3; //
    if (this.isStateAffected(23)) return 4; //
    return 0; // default
  };

  Game_Party.prototype.makeEnemy = function(actor) {
    if (!$gameParty.inBattle()) return;

    let enemyId = 6; // queen, change it later ? actor._actorId + offset ?
    let name = actor.name() || "Change"; 

    let y = (actor._actorId > 3) ? 500 : 300;
    let x = 900 + (actor._actorId % 3) * 150;
  
    const enemy = new Game_Enemy(enemyId, x, y); // $gameTroop._enemies.length, 
    if (name) {
      enemy._originalName = name;
      enemy._name = name;
    }

    $gameTroop._enemies.push(enemy);

    SceneManager._scene._spriteset.refreshEnemies();
    BattleManager.makeActionOrders();

  }

  const _Spriteset_Battle_createEnemies = Spriteset_Battle.prototype.createEnemies;
  Spriteset_Battle.prototype.createEnemies = function () {
    _Spriteset_Battle_createEnemies.call(this);
    if (!this._enemySprites) this._enemySprites = [];
    const newSprites = $gameTroop._enemies.map(enemy => new Sprite_Enemy(enemy));
    this._enemySprites = newSprites;
    for (const sprite of newSprites) {
      this._battleField.addChild(sprite);
    }
  };

  Spriteset_Battle.prototype.refreshEnemies = function () {
    for (const sprite of this._enemySprites) {
      this._battleField.removeChild(sprite);
    }
    this.createEnemies();
  };

  const _Game_Battler_addState = Game_Battler.prototype.addState;
  Game_Battler.prototype.addState = function (stateId) {
    // look for any stage whose list contains the attempted stateId
    for (const stageKey in CorruptStages) {
      const list = CorruptStages[stageKey];
      const attemptedIdx = list.indexOf(stateId);
      if (attemptedIdx > -1) {
        // found a matching stage list → time to “progress”
        //  a) find the highest-index state they currently have
        let currIdx = -1;
        for (let i = 0; i < list.length; i++) {
          if (this.isStateAffected(list[i])) {
            currIdx = i;
          }
        }
        //  b) decide the next index
        let nextIdx;
        if (currIdx === -1) {
          // no existing corrupt state → use the one they tried to add
          nextIdx = attemptedIdx;
        } else if (currIdx < list.length - 1) {
          // they have a corrupt state but not the final one → step forward
          nextIdx = currIdx + 1;
        } else {
          // already at final corrupt state → do nothing
          nextIdx = null;
          // return;
        }
        let result = null;
        if (nextIdx !== null) {
          const newStateId = list[nextIdx];
          //  c) erase *any* state from this stage
          for (const sid of list) {
            if (this.isStateAffected(sid)) {
              this.removeState(sid);
            }
          }
          this._needRefresh = true;
          
          // — fallback to normal state-adding
          result = _Game_Battler_addState.call(this, newStateId);
        }
        


        //–– now our two optional features, only on actors
        if (this.isActor()) {
          const actor = this;

          // Actor→Enemy Conversion Feature
          if (enableActorToEnemy) {
            actorToEnemyRules.forEach((rule) => {
              if (
                stateId == rule.triggerStateId &&
                actor.currentClass().id === +rule.requiredClassId
              ) {
                // 2a) KO the actor
                actor.addState(actor.deathStateId());
                // 2b) in‐battle: remove from party & spawn as enemy
                const scene = SceneManager._scene;
                if (scene instanceof Scene_Battle) {
                  // remove from party so no longer fights for you
                  $gameParty.makeEnemy(actor);
                  // add a brand‐new enemy
                  // const e = new Game_Enemy(+rule.enemyId, 0, 0);
                  // $gameTroop._enemies.push(e);
                  // refresh sprites
                  // scene._spriteset.createEnemies();
                }
              }
            });
          }

          // Class-Change Feature
          if (enableClassChange) {
            classChangeRules.forEach((rule) => {
              if (
                stateId == rule.triggerStateId &&
                actor.isStateAffected(+rule.requiredStateId)
              ) {
                keepExp = true;
                actor.changeClass(+rule.newClassId, keepExp);

                // actor.initSkills(); // ← grab all class skills, but remove all others
                actor.currentClass().learnings.forEach((learning) => {
                  if (learning.level <= actor.level) {
                    actor.learnSkill(learning.skillId);
                  }
                });
                actor.refresh(); // force a stats/UI update
              }
            });
          }
        }

        return result;
      }
    }
    // if it wasn’t in any CorruptStages list, fall back to normal behavior
    return _Game_Battler_addState.call(this, stateId);
  };

  const _GB_removeState = Game_Battler.prototype.removeState;
  Game_Battler.prototype.removeState = function (stateId) {
    _GB_removeState.call(this, stateId);
    this._needRefresh = true;
  };

  /*
  =======================================================================
  = Patches for MOG_BattleHud
  */

  clamp = function (base, min, max) {
    return Math.min(Math.max(base, min), max);
  };

  const _BH_createFace = Battle_Hud.prototype.create_face;
  Battle_Hud.prototype.create_face = function () {
    if (String(Moghunter.bhud_face_visible) != "true") {
      return;
    }
    this.removeChild(this._face);
    if (!this._battler) {
      return;
    }

    // Add corrupt
    let st = "C"; // this._battler.getCorruptStage() || "";

    this._face = new Sprite(
      ImageManager.loadBHud("Face_" + this._battler._actorId + st)
    );
    this._face.anchor.x = 0.5;
    this._face.anchor.y = 0.5;
    this._face_data = [0, 0, false, false, false, -1];
    this._face.ph = 0;
    this._face.animation = [-1, 0, 0, 0, 0, 0, 0, 0, 0];
    this._face.breathEffect = this._battler._bhud.faceBreath;
    this._face.scaleY = 0;
    if (String(Moghunter.bhud_face_shake) === "true") {
      this._face_data[2] = true;
    }
    if (String(Moghunter.bhud_face_animated) === "true") {
      this._face_data[4] = true;
    }
    this._battler._bhud_face_data = [0, 0, 0, 1];
    this.addChild(this._face);
  };

  bh_update_face = Battle_Hud.prototype.update_face;
  Battle_Hud.prototype.update_face = function () {
    // console.log("update_face");
    if (!this._face || !this._face.bitmap.isReady()) return;

    if (
      this._face_data[4] &&
      this._face_data[5] != this._battler._bhud_face_data[2]
    ) {
      this.refresh_face();
    }

    // [PATCH: Load face]
    if (this._battler._needRefresh === true) {
      this._battler._needRefresh = false;
      this.refresh_face();
    }
    // Back to the normal flow

    this.update_face_animation();
    this.update_face_shake();
    this.update_face_zoom();
    if (this._face.breathEffect) {
      this.updateFaceEffects();
    }
  };

  Battle_Hud.prototype.getBattlerImage = function () {
    // Add corrupt
    let st = "C"; // this._battler.getCorruptStage() || "";

    return ImageManager.loadBHud("Face_" + this._battler._actorId + st);
  };

  bh_refresh_face = Battle_Hud.prototype.refresh_face;
  Battle_Hud.prototype.refresh_face = function () {
    // console.log("refresh_face");
    //bh_refresh_face.call(this);

    // let image = this.getBattlerImage()
    // this._face = new Sprite(
    //   image
    // );

    // this._face.bitmap = ImageManager.loadFace(filename);
    // this._face.bitmap.addLoadListener(() => {
    //   this._face.setFrame(0, 0, this._face.bitmap.width, this._face.bitmap.height);
    // });

    // Remember which stage we’ve drawn
    this._face_data[5] = this._battler._bhud_face_data[2];
    // [PATCH: Load face]

    const cw = this._face.bitmap.width / 5;
    const ch = this._face.bitmap.height; // / 2;

    const rowIndex = 0; // this._battler.isDead() === true ? 1 : 0;
    const colIndex = clamp(this._battler.getCorruptLvl(), 0, 5);

    this._face.setFrame(cw * colIndex, ch * rowIndex, cw, ch);
    // this._face.setFrame(
    //   0,
    //   0,
    //   this._face.bitmap.width,
    //   this._face.bitmap.height
    // );
  };

  Battle_Hud.prototype.update_face_animation = function () {
    // console.log("update_face_animation");
    // TODO: disabled
    // if (this._battler._bhud_face_data[3] > 0) {
    //   this._battler._bhud_face_data[3] -= 1;
    //   if (this._battler._bhud_face_data[3] === 0) {
    //     if (this._battler.isDead()) {this._battler._bhud_face_data[2] = 4}
    // 	  else if (this._battler.hp <= 30 * this._battler.mhp / 100) {this._battler._bhud_face_data[2] = 3}
    // 	  else {this._battler._bhud_face_data[2] = 0};
    // 	};
    // 	if (this._battler.hp <= 30 * this._battler.mhp / 100) {this._battler._bhud_face_data[2] = 3}
    // 	else {this._battler._bhud_face_data[2] = 0};
    // };
  };

  Battle_Hud.prototype.update_face_zoom = function () {
    if (this._battler._bhud_face_data[1] > 0) {
      this._battler._bhud_face_data[1] -= 1;
      if (this._battler._bhud_face_data[1] == 0) {
        this._face.scale.x = 1.0;
      } else if (this._battler._bhud_face_data[1] < 35) {
        this._face.scale.x -= 0.005;
        if (this._face.scale.x < 1.0) {
          this._face.scale.x = 1.0;
        }
      } else if (this._battler._bhud_face_data[1] < 70) {
        this._face.scale.x += 0.005;
        if (this._face.scale.x > 1.1) {
          this._face.scale.x = 1.1;
        }
      }
      this._face.scale.y = this._face.scale.x;
    }
  };
})();
