/*:
 * @target MV
 * @plugindesc Changes actor portraits dynamically based on states (e.g., corruption stages). Easy to expand and control.
 * @author Phoebe
 *
 * @help StatePortraitChanger.js
 *
 * This plugin updates actor face and full-body images based on their current
 * states (such as corruption levels). You can define what states correspond
 * to what image variations.
 *
 * How to Use:
 * - Add your custom logic or state mappings inside the plugin code.
 * - Actor face in menus and full-body ("fullBody") portraits will change
 *   automatically according to current state.
 *
 * No plugin commands required.
 *
 * Terms of Use:
 * - Free for commercial and non-commercial use.
 * - Credit appreciated but not required.
 */
var CorruptMiniStatus = CorruptMiniStatus || {};
(function () {
  const CorruptFaces = {
    // Here you list the active state ID, for example 41 is "Zombie化 Lv.1"
    0: [52, 53, 54, 55], // Worms
    2: [43, 44, 45, 46], // Tentacles
    3: [47, 48, 49, 50], // Slime
    4: [33, 34, 35, 36, 37], // Ball
    5: [38, 39, 40, 41, 42], // Wall

    // 0: [41, 42, 43, 44], // Zombie
    // 1: [45, 46, 47, 48], // WereFrog
    // 2: [49, 50, 51, 52], // Succubus
    // 3: [53, 54, 55, 56], // 3 Werewolf
    // 4: [57, 58, 59, 60], // 4 Skunk
    // 5: [61, 62, 63, 64], // 5 Beast

    // 6: [65, 66, 67, 68], // 6 Leona Werewolf
    // 7: [69, 70, 71, 72], // 7 Leona Skunk
  };

  // Get the current corruption stage index
  function getCorruptionStage(actor) {
    const stageId = $gameVariables.value(1);
    const states = actor.states();

    const stageStates = CorruptFaces[stageId];
    if (!stageStates) return 0;

    for (let i = stageStates.length - 1; i >= 0; i--) {
      if (states.some((state) => state.id === stageStates[i])) {
        return i + 1; // Level 1-4
      }
    }
    return 0; // Clean
  }

  // Your corruption → stage lookup
  const characterNameToCorruptFaces = {
    "QBNEW":    ["QQB", "QQB",  "QQB",  "QQB" ],
    "QBEEWALG": ["QB",  "QB",   "QB",   "QB"  ],
    "QB3aG":    ["QBN", "QBN",  "QBN",  "QBN" ]
  };

    // Your corruption → stage lookup
    const characterNameToBattler = {
      "QBNEW":    ["QQB", "QQBK",  "QQBL",  "QQBS", "QQBT", "QQBW"],
      "QBEEWALG": ["Qbee", "QBeeK",  "QBeeL",  "QBeeS", "QBeeT", "QBeeW"],
      "QB3aG":    ["QbeeN", "QBN",  "QBN",  "QBN" ]
    };
  

  // Given actor and stage, pick the faceName
  function getMappedFaceName(actor, stage) {
    const name = actor._characterName;
    const map = characterNameToCorruptFaces[name];
    if (Array.isArray(map)) {
      // if stage index exists, use it; otherwise fallback to first entry
      return map[stage] !== undefined ? map[stage] : map[0];
    }
    // not in map → default to actor.faceName() from the database
    return actor.faceName();
  }

  // Determine the correct face image based on corruption
  Window_StatusBase.prototype.drawActorFace = function (
    actor,
    x,
    y,
    width,
    height
  ) {
    const stage = getCorruptionStage(actor);
    const faceName = getMappedFaceName(actor, stage);
    // this.drawFace(actor.faceName(), stage, x, y, width, height);
    // drawFace(name, index, x, y, w, h) uses 'index' as column on the sheet
    this.drawFace(faceName, 0, x, y, width, height);
  };

  // --------------------------------------------------------------

  const PICID = {
    FULL_BODY_L1: 5,
    FULL_BODY_L2: 3,
    FULL_BODY_CB: 2,
    FULL_BODY_R2: 4,
    FULL_BODY_R1: 6,
  };

  const FULL_BODY_POS = {
    L1: 100,
    L2: 254,
    CB: 408,
    R2: 562,
    R1: 716,
  };

  const _positionMap = {};
  const getPictureId = (pos) => PICID[`FULL_BODY_${pos.toUpperCase()}`] || 5;
  const getX = (pos) => FULL_BODY_POS[pos.toUpperCase()] || 100;

  window.FullBodyManager = {
    /**
     * Show a character portrait.
     * @param {string} pos - Position like 'L1', 'CB', etc.
     * @param {number} actorId - Actor ID used in filename.
     * @param {number} stateId - Expression/state variation.
     * @param {boolean} reverse - Flip horizontally.
     */
    show(pos, actorId, stateId = 0, reverse = false) {
      const pictureId = getPictureId(pos);
      const x = getX(pos);
      const y = actorId === 8 ? 20 : 0;
      const scaleX = reverse ? -100 : 100;
      const fileName = `t_${actorId}_${stateId}`;
      $gameScreen.showPicture(
        pictureId,
        fileName,
        2,
        x,
        y,
        scaleX,
        100,
        255,
        0
      );

      _positionMap[pos.toUpperCase()] = pictureId;
    },

    /**
     * Move a portrait from one position to another.
     * @param {string} fromPos - Start position.
     * @param {string} toPos - Destination position.
     * @param {number} duration - Time in frames to move.
     * @param {boolean} reverse - Flip horizontally.
     */
    move(fromPos, toPos, duration = 30, reverse = false) {
      const from = fromPos.toUpperCase();
      const to = toPos.toUpperCase();
      const pictureId = _positionMap[from];
      if (!pictureId) return;

      const x = getX(to);
      const y = 0;
      const scaleX = reverse ? -100 : 100;

      $gameScreen.movePicture(
        pictureId,
        2,
        x,
        y,
        scaleX,
        100,
        255,
        0,
        duration,
        0
      );

      // Update logical position map
      _positionMap[to] = pictureId;
      delete _positionMap[from];
    },

    /**
     * Erase a character portrait.
     * @param {string} pos - Position like 'L1', 'CB', etc.
     */
    erase(pos) {
      const position = pos.toUpperCase();
      const pictureId = _positionMap[position];
      if (pictureId) {
        $gameScreen.erasePicture(pictureId);
        delete _positionMap[position];
      }
    },
  };

  /**
   * Returns the corruption level (1–4) or 0 if clean.
   */
  Game_Battler.prototype.getCorruptStateLv = function () {
    const stageIndex = $gameVariables.value(1);

    const stateList = CorruptFaces[stageIndex] || [];

    for (let i = 0; i < stateList.length; i++) {
      if (this.isStateAffected(stateList[i])) {
        return i + 1; // Return 1–4 based on which state is applied
      }
    }
    return 0; // No corruption state
  };

  /*
  =======================================================================
  = Patches for MOG_BattleHud
  */

  clamp = function (base, min, max) {
    return Math.min(Math.max(base, min), max);
  };

  ImageManager.loadBattlers = function(filename) {
    return this.loadBitmap('img/Battlers/', filename);
  };	

  Battle_Hud.prototype.getBattlerImage = function() {
    const stage = clamp(this._battler.getCorruptStateLv(), 0, 5);

    let base =  (this._battler._characterName == "QBNEW") ? "QQB" : "Qbee";
    
    let suffix = (this._battler._characterName == "QB3aG") ? "N" : "";

    let corruptType = ""; // K, L, S, T, W, B ... -  $gameVariables.value(1)

    let currupt_stage = (stage > 0) ? stage : ""
    return base + currupt_stage + corruptType + suffix
  } 

  const _BH_createFace = Battle_Hud.prototype.create_face;
  Battle_Hud.prototype.create_face = function () {
    console.log("create_face");
    // _BH_createFace.call(this);

    if (String(Moghunter.bhud_face_visible) !== "true") {
      return;
    }

    this.removeChild(this._face);

    if (!this._battler) {
      return;
    }
    // [PATCH: Load face]
    // const stage = clamp(this._battler.getCorruptStateLv(), 0, 5);
    // TODO: debug this !!
    let face_name = this.getBattlerImage()
    // let face_name = "Face_" + this._battler._actorId + "_" + $gameVariables.value(1)

    // if (stage == 0) {
    //   face_name = "QQB"
    // } else { // TODO: change by type ? 
    //   face_name = `QQBR${stage}`
    // }

    this._face = new Sprite(
      // ImageManager.loadBHud(face_name)
      // ImageManager.loadFace(face_name)
      ImageManager.loadBattlers(face_name)
    );
    // [/PATCH: Load face]

    this._face.anchor.x = 0.5;
    this._face.anchor.y = 0.5;

    // Init face‐data flags
    this._face_data = [
      0,                                   // frame index
      0,                                   // breath timer
      String(Moghunter.bhud_face_shake)==="true",    // shake?
      false,                               // unused
      String(Moghunter.bhud_face_animated)==="true", // animated?
      -1 // Limit to first image
    ];

    this._face.ph = 0;
    this._face.animation = [-1, 0, 0, 0, 0, 0, 0, 0, 0];
    this._face.breathEffect = this._battler._bhud.faceBreath;
    this._face.scaleY = 0;
 
    this._battler._bhud_face_data = [0, 0, 0, 1]; // [0,0,stage,1] ?
    this.addChild(this._face);
  };

  const _GB_addState = Game_Battler.prototype.addState;
  Game_Battler.prototype.addState = function(stateId) {
    _GB_addState.call(this, stateId);
    this._needRefresh = true;
  };

  const _GB_removeState = Game_Battler.prototype.removeState;
  Game_Battler.prototype.removeState = function(stateId) {
    _GB_removeState.call(this, stateId);
    this._needRefresh = true;
  };


  bh_update_face = Battle_Hud.prototype.update_face;
  Battle_Hud.prototype.update_face = function () {
    console.log("update_face");
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
    bh_update_face.call(this);
  };

  bh_refresh_face = Battle_Hud.prototype.refresh_face;
  Battle_Hud.prototype.refresh_face = function () {
    console.log("refresh_face");
    //bh_refresh_face.call(this);

    let face_name = this.getBattlerImage()
    this._face = new Sprite(
      ImageManager.loadBattlers(face_name)
    );

    // this._face.bitmap = ImageManager.loadFace(filename);
    // this._face.bitmap.addLoadListener(() => {
    //   this._face.setFrame(0, 0, this._face.bitmap.width, this._face.bitmap.height);
    // });

    // Remember which stage we’ve drawn
    this._face_data[5] = this._battler._bhud_face_data[2];
    // [PATCH: Load face]
    /*
    var cw = this._face.bitmap.width / 5;
  //	var ch = this._face.bitmap.height;
  //	this._face.setFrame(cw * this._face_data[5], 0, cw, ch);
    var ch = this._face.bitmap.height / 10;
    var _deadNum = (this._battler.isDead() === true ? 5 : 0);
    this._face.setFrame(cw * this._face_data[5], ch * (this._battler.getCorruptStateLv() + _deadNum) + 1, cw, ch-1);
  */
    const cw = this._face.bitmap.width / 5;
    const ch = this._face.bitmap.height / 2;

    const rowIndex = this._battler.isDead() === true ? 1 : 0;
    const colIndex = clamp(this._battler.getCorruptStateLv(), 0, 5);

    // this._face.setFrame(
    //   cw * colIndex,
    //   ch * rowIndex,
    //   cw,
    //   ch
    // );
    this._face.setFrame(
      0,
      0,
      this._face.bitmap.width,
      this._face.bitmap.height
    );
  };

  Battle_Hud.prototype.update_face_animation = function () {
    console.log("update_face_animation");
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

  /*
Battle_Hud.prototype.load_img = function() {
//	this._layout_img = ImageManager.loadBHud("Layout");
	this._layout_img = ImageManager.loadBHud("");
  */
})();
