/*:
 * @plugindesc Draw party members’ static PNGs from img/enemies in side-view battle
 * @help
 * Put Makoto.png, STE.png, QB.png, etc. into img/enemies/
 * and name your actors in the database exactly “Makoto”, “STE”, “QB”, etc.
 *
 * Installation:
 * 1. Save this file as js/plugins/PartyStaticSprites.js
 * 2. Enable it in the Plugin Manager (order doesn’t matter).
 */
(() => {
  const CorruptStages = {
    // key = “stage”, value = ordered list of state IDs
    0: [52, 53, 54, 55], // Worms
    2: [43, 44, 45, 46], // Tentacles
    3: [47, 48, 49, 50], // Slime
    4: [33, 34, 35, 36, 37], // Ball
    5: [38, 39, 40, 41, 42], // Wall
  };

  Game_Battler.prototype.getCorruptState = function () {
    // e.g. depending on states you have applied...
    if (this.isStateAffected(10)) return "2"; // “QB2.png”
    if (this.isStateAffected(11)) return "3"; // “QB3.png”
    if (this.isStateAffected(12)) return "H"; // “QBH.png”
    if (this.isStateAffected(13)) return "R"; // “QBR.png”
    if (this.isStateAffected(14)) return "TKO"; // “QBTKO.png”

    if (this.isStateAffected(18)) return "B"; // DRONESTATEFOREVER
    if (this.isStateAffected(19)) return "Q"; // Become Bee Drone
    if (this.isStateAffected(20)) return "R"; // Resin(DONE)
    if (this.isStateAffected(21)) return "RB"; // Resin(DONEBEE)
    if (this.isStateAffected(23)) return "B2"; // Bound(BEE)
    if (this.isStateAffected(24)) return "B2"; // Bound(EX)(BEE)

    if (this.isStateAffected(30)) return "2"; // Bound
    if (this.isStateAffected(31)) return "2"; // Bound(EX)
    if (this.isStateAffected(106)) return "TKO"; // TKO (Ally) Persistent

    if (this.isStateAffected(302)) return "H"; // Hypno2
    if (this.isStateAffected(303)) return "H"; // Hypno2
    if (this.isStateAffected(305)) return "HB"; // Hypno2(BEE)
    if (this.isStateAffected(306)) return "HB"; // Hypno2(BEE)
    return null; // default
  };

  const actorPrefix = {
    "Q-Bee": "QB",
    "Makoto=Nanaya": "Makoto",
    Shantae: "STE",
    // add more mappings here as needed...
  };

  /**
   * Change the class of a game actor on the fly.
   * @param {number} actorId - The database ID of the actor to modify.
   * @param {number} classId - The database ID of the class to assign.
   * @param {boolean} [keepExp=false] - If true, the actor keeps their current EXP.
   */
  window.change_class = function (actorId, classId, keepExp) {
    // default keepExp to false if not provided
    keepExp = !!keepExp;
    const actor = $gameActors.actor(actorId);
    if (!actor) {
      console.warn(`change_class: No actor found with ID ${actorId}`);
      return;
    }
    // changeClass is built‐in to Game_Actor: (newClassId, keepExp)
    actor.changeClass(classId, keepExp);
    actor.refresh(); // force a stats/UI update
  };

  // Custom Sprite_Gauge for battle
  function Sprite_HUDGauge() {
    this.initialize(...arguments);
  }
  Sprite_HUDGauge.prototype = Object.create(Sprite_Gauge.prototype);
  Sprite_HUDGauge.prototype.drawLabel = function () {};
  Sprite_HUDGauge.prototype.drawValue = function () {};
  Sprite_HUDGauge.prototype.gaugeX = function () {
    return 0;
  };
  Sprite_HUDGauge.prototype.gaugeHeight = function () {
    switch (this._statusType) {
      case "hp":
        return 10;
      case "mp":
        return 5;
      case "tp":
        return 5;
      default:
        return 12;
    }
  };

  // small HP-bar sprite
  function Sprite_InfoBar() {
    this.initialize(...arguments);
  }
  Sprite_InfoBar.prototype = Object.create(Sprite.prototype);
  Sprite_InfoBar.prototype.constructor = Sprite_InfoBar;
  Sprite_InfoBar.prototype.initialize = function () {
    Sprite.prototype.initialize.call(this);
    this._battler = null;
    this.anchor.x = 0.5;
    this.anchor.y = 0;
    this.bitmap = new Bitmap(64, 8);
  };
  Sprite_InfoBar.prototype.setup = function (battler) {
    this._battler = battler;
    this._infoGauges = [];

    const GAUGE_WIDTH = 64;
    const GAUGE_HEIGHT = 8;
    const GAUGE_SPACING = GAUGE_HEIGHT + 2; // vertical gap between bars

    let gap = 4;
    const X = -GAUGE_WIDTH / 2;

    // HP gauge
    this._hpGauge = new Sprite_HUDGauge();
    this._hpGauge.setup(battler, "hp");
    this._hpGauge.move(X, 0);
    this._hpGauge.show();
    this.addChild(this._hpGauge);
    this._infoGauges.push(this._hpGauge);

    gap += this._hpGauge.gaugeHeight() + 2;

    // MP gauge
    this._mpGauge = new Sprite_HUDGauge();
    this._mpGauge.setup(battler, "mp");
    this._mpGauge.move(X, gap);
    this._mpGauge.show();
    this.addChild(this._mpGauge);
    this._infoGauges.push(this._mpGauge);

    gap += this._mpGauge.gaugeHeight() + 2;

    // TP gauge (only if enabled)
    if ($dataSystem.optDisplayTp) {
      this._tpGauge = new Sprite_HUDGauge();
      this._tpGauge.setup(battler, "tp");
      this._tpGauge.move(X, gap); // HP + gap + MP + gap
      this._tpGauge.show();
      this.addChild(this._tpGauge);
      this._infoGauges.push(this._tpGauge);
    }

    gap += this._tpGauge.gaugeHeight() + 2;

    // State‐icon row under all gauges
    this._stateIcon = new Sprite_StateIcon();
    this._stateIcon.setup(battler);
    this._stateIcon.x = -12;
    this._stateIcon.y = 0;
    this.addChild(this._stateIcon);
  };
  Sprite_InfoBar.prototype.update = function () {
    Sprite.prototype.update.call(this);

    if (!this._battler) return;
  };

  // Sprite PlayerBattler

  function Sprite_PlayerBattler() {
    this.initialize(...arguments);
  }

  Sprite_PlayerBattler.prototype = Object.create(Sprite_Actor.prototype);
  Sprite_PlayerBattler.prototype.constructor = Sprite_PlayerBattler;

  Sprite_PlayerBattler.prototype.initialize = function (battler) {
    Sprite_Actor.prototype.initialize.call(this, battler);
  };

  Sprite_PlayerBattler.prototype.loadBitmap = function (_) {
    const battler = this._battler;
    // figure out prefix & suffix
    const prefix = actorPrefix[battler.name()] || battler.name();
    const suffix = battler.getCorruptState() || "";
    const name = prefix + suffix;
    const hue = battler.battlerHue ? battler.battlerHue() : 0;
    // load side‐view enemy sheet (so PNG attachments)
    this._mainSprite.bitmap = ImageManager.loadSvEnemy(name, hue);
  };

  Sprite_PlayerBattler.prototype.updateBitmap = function () {
    const battler = this._battler;
    // figure out prefix & suffix
    const prefix = actorPrefix[battler.name()] || battler.name();
    const suffix = battler.getCorruptState() || "";
    const name = prefix + suffix;
    const hue = battler.battlerHue ? battler.battlerHue() : 0;
    // load side‐view enemy sheet (so PNG attachments)
    this._mainSprite.bitmap = ImageManager.loadSvEnemy(name, hue);
  };

  Sprite_PlayerBattler.prototype.updateFrame = function () {
    Sprite_Battler.prototype.updateFrame.call(this);
    const bitmap = this._mainSprite.bitmap;
    if (bitmap) {
      const motionIndex = this._motion ? this._motion.index : 0;
      const pattern = this._pattern < 3 ? this._pattern : 1;

      // Breathing only when the select-ring is visible
      //    (falls back to normal scale otherwise)
      if (this._selectShadow && this._selectShadow.visible) {
        // initialize counter
        this._breathCount = (this._breathCount || 0) + 1;
        // full cycle in 120 frames (~2 seconds at 60fps)
        const cycle = 120;
        const theta = (2 * Math.PI * (this._breathCount % cycle)) / cycle;
        // y-scale from 0.99 to 1.01
        this._mainSprite.scale.y = 1 + 0.01 * Math.sin(theta);
      } else {
        // reset
        this._breathCount = 0;
        this._mainSprite.scale.y = 1;
      }
    }
  };

  Sprite_PlayerBattler.prototype.update = function () {
    Sprite_Actor.prototype.update.call(this);
  };

  Sprite_PlayerBattler.prototype.setActorHome = function (index) {
    this.setHome(120 + index * 180, Graphics.boxHeight * 0.75 + index * 20);
  };

  Sprite_PlayerBattler.prototype.moveToStartPosition = function () {
    this.startMove(-200, 0, 0);
  };

  const _Sprite_PlayerBattler_createShadowSprite =
    Sprite_PlayerBattler.prototype.createShadowSprite;
  Sprite_PlayerBattler.prototype.createShadowSprite = function () {
    _Sprite_PlayerBattler_createShadowSprite.call(this);

    // 3) Now add our “selection ring” under the player
    //    We'll draw a hollow circle with a yellow border.
    const ring = new PIXI.Graphics();
    const height = 24; // tweak this for how “flat” you want it
    const width = height * 6; // 2× wider than tall

    const lineWidth = 2;
    ring.lineStyle(lineWidth, 0xffff00, 1.0);
    // drawEllipse(cx, cy, halfWidth, halfHeight):
    ring.drawEllipse(0, 0, width / 2, height / 2);
    ring.endFill();

    // center it under the battler just like the shadow
    ring.x = 0;
    ring.y = this._shadowSprite.y;
    ring.zIndex = this._shadowSprite.zIndex - 1;
    ring.visible = false;

    this._selectShadow = ring;
    this.addChild(ring);
  };

  Sprite_PlayerBattler.prototype.stepForward = function () {
    this.startMove(12, 0, 12); // Move a bit to trigger the (!this.inHomePosition())
    // grow + tint the shadow
    if (this._selectShadow) {
      this._selectShadow.visible = true;
    }
  };

  Sprite_PlayerBattler.prototype.stepBack = function () {
    this.startMove(0, 0, 12);
    // reset shadow
    if (this._selectShadow) {
      this._selectShadow.visible = false;
    }
  };

  const _Sprite_PlayerBattler_update = Sprite_PlayerBattler.prototype.update;
  Sprite_PlayerBattler.prototype.update = function () {
    _Sprite_PlayerBattler_update.call(this);
    if (this._selectShadow && this._selectShadow.visible) {
      // simple sine‐wave pulse
      const t = performance.now() / 200;
      const scale = 1 + 0.05 * Math.sin(t);
      this._selectShadow.scale.set(scale, scale);
    }
  };

  Sprite_PlayerBattler.prototype.retreat = function () {
    // this.startMove(300, 0, 30);
  };

  Sprite_PlayerBattler.prototype.setBattler = function (battler) {
    Sprite_Actor.prototype.setBattler.call(this, battler);
    this._battler = battler;
  };

  Sprite_PlayerBattler.prototype.setupWeaponAnimation = function () {
    // TODO: disable this for now !
    // if (this._actor.isWeaponAnimationRequested()) {
    //     this._weaponSprite.setup(this._actor.weaponImageId());
    //     this._actor.clearWeaponAnimation();
    // }
  };

  window.Sprite_PlayerBattler = Sprite_PlayerBattler;

  //

  Sprite_Enemy.prototype.setBattler = function (battler) {
    Sprite_Battler.prototype.setBattler.call(this, battler);
    this._enemy = battler;
    this.setHome(battler.screenX(), battler.screenY());
    this._stateIconSprite.setup(battler);
  };

  // Fixes for UI
  // Hide the default bottom bar
  const _Window_BattleStatus_initialize =
    Window_BattleStatus.prototype.initialize;
  Window_BattleStatus.prototype.initialize = function (rect) {
    _Window_BattleStatus_initialize.call(this, rect);
    this.hide();
    this.backOpacity = 0;
  };

  Window_BattleStatus.prototype.drawRect = function (x, y, width, height) {};
  Window_BattleStatus.prototype.drawShape = function (graphics) {};
  Window_BattleStatus.prototype.drawItemBackground = function (index) {};

  Window_BattleStatus.prototype.drawBackgroundRect = function (rect) {
    // const rect = this.itemRect(index);
    // this.drawBackgroundRect(rect);
  };

  Window_BattleStatus.prototype.drawItem = function (index) {
    //   console.log('Window_BattleStatus.prototype.drawItem')
  };

  Window_BattleStatus.prototype.selectActor = function (actor) {};

  // -------------------------------------------
  // Fixes enemy selector

  Scene_Battle.prototype.enemyWindowRect = function () {
    const ww = Graphics.boxWidth * 0.65;
    const wx = Graphics.boxWidth - ww - 96; // this._statusWindow.x;
    const wh = this.windowAreaHeight();
    const wy = 0; // Graphics.boxHeight - wh;
    return new Rectangle(wx, wy, ww, wh);
  };

  Scene_Battle.prototype.buttonY = function () {
    const offsetY = Math.floor((this.buttonAreaHeight() - 48) / 2);
    return 0 + offsetY;
  };

 // Scene_Battle.prototype.createAllWindows = function() { --> add a "Battle round" on the left, plus the "battle order" on the bottom

  Scene_Battle.prototype.createButtons = function() {
    if (ConfigManager.touchUI) {
        this.createCancelButton();
        this.createPauseButton();
    }
};

  Scene_Battle.prototype.createCancelButton = function () {
    this._cancelButton = new Sprite_Button("cancel");
    this._cancelButton.x = Graphics.boxWidth - this._cancelButton.width - 4;
    this._cancelButton.y = this.buttonY();
    this.addWindow(this._cancelButton);
  };

  Scene_Battle.prototype.createPauseButton = function () {
    this._menuButton = new Sprite_Button("menu");
    this._menuButton.x = this._cancelButton.x - this._cancelButton.width - this._menuButton.width - 4*2;
    this._menuButton.y = this.buttonY();
    this._menuButton.visible = true;
    this.addWindow(this._menuButton);
  }

  Window_BattleEnemy.prototype.maxCols = function () {
    return 3; // doing 3x3 grid
  };

  Window_BattleEnemy.prototype.drawBackgroundRect = function (rect) {};
  Window_BattleEnemy.prototype._refreshBack = function () {};
  Window_BattleEnemy.prototype._refreshFrame = function () {};
  Window_BattleEnemy.prototype.createCancelButton = function () {};
  // -------------------------------------------

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
          return;
        }
        const newStateId = list[nextIdx];
        //  c) erase *any* state from this stage
        for (const sid of list) {
          if (this.isStateAffected(sid)) {
            this.removeState(sid);
          }
        }
        this._needRefresh = true;
        //  d) add the progressed state
        return _Game_Battler_addState.call(this, newStateId);
      }
    }
    // if it wasn’t in any CorruptStages list, fall back to normal behavior
    return _Game_Battler_addState.call(this, stateId);
  };

  //  createActors

  Spriteset_Battle.prototype.createActors = function () {
    this._actorSprites = [];

    const members = $gameParty.battleMembers();
    const count = members.length;
    if (count === 0) return;

    // define left‐side region (10% of width) and spacing
    const leftW = Graphics.boxWidth * 0.05;
    const spacing = leftW / (count + 1);
    const yPos = Graphics.boxHeight - 48; // tweak this if you want them higher/lower

    for (let i = 0; i < $gameParty.maxBattleMembers(); i++) {
      const battler = members[i];
      const sprite = new Sprite_PlayerBattler();
      sprite.setBattler(members[i]);

      // position the battler sprite
      sprite.x = spacing * (i + 1);
      sprite.y = yPos;

      const hp = new Sprite_InfoBar();
      hp.anchor.set(0.5, 1);
      hp.setup(battler);

      hp.y = -340;
      hp.x = -40;

      sprite.addChild(hp);

      this._actorSprites.push(sprite);
      this._battleField.addChild(sprite);
    }

    // for (let i = 0; i < $gameParty.maxBattleMembers(); i++) {
    //   const sprite = new Sprite_PlayerBattler();
    //   this._actorSprites.push(sprite);
    //   this._battleField.addChild(sprite);
    // }
  };

//   const _Game_Actor_performCollapse = Game_Actor.prototype.performCollapse;
//   Game_Actor.prototype.performCollapse = function () {
//     _Game_Actor_performCollapse.performCollapse.call(this);
//     if ($gameParty.inBattle()) {
//       SoundManager.playActorCollapse();
//     }
//     console.log(this);
//     //  infoBar.setup(battler); ?
//   };

// TOOD: hook Game_Party.prototype.removeActor - Window_BattleStatus.prototype.preparePartyRefresh ?



    const _Spriteset_Battle_updateActors = Spriteset_Battle.prototype.updateActors;
    Spriteset_Battle.prototype.updateActors = function() {
        const members = $gameParty.battleMembers();

        // if (this._actorSprites.length > members.length) {
        //     console.log("recreate actors")
        // }

        _Spriteset_Battle_updateActors.call(this);

  //         for (let i = 0; i < this._actorSprites.length; i++) {
  //             const sprite = this._actorSprites[i];
  //             const battler = members[i];

  //             // Re-setup the InfoBar so it picks up the new battler (and removes old bars)
  //             // const infoBar = sprite.children.find(c => c instanceof Sprite_InfoBar);
  //             // if (infoBar) {
  //             //     infoBar.setup(battler);
  //             // }

  //         }
      };

  // Create enemies

  Spriteset_Battle.prototype.createEnemies = function () {
    const enemies = $gameTroop.members();
    const sprites = [];
    for (const enemy of enemies) {
      sprites.push(new Sprite_Enemy(enemy));
    }
    sprites.sort(this.compareEnemySprite.bind(this));
    for (const sprite of sprites) {
      this._battleField.addChild(sprite);
    }
    this._enemySprites = sprites;
  };

  const _Game_Troop_setup = Game_Troop.prototype.setup;
  Game_Troop.prototype.setup = function (troopId) {
    this.clear();
    this._troopId = troopId;
    this._enemies = [];

    // layout constants
    const cols = 3; // 3 columns
    const startX = Graphics.boxWidth - 80; // rightmost anchor
    const startY = Graphics.boxHeight * 0.55; // top of your “triangle”
    const hSpacing = 180; // pixels between cols
    const vSpacing = 120; // pixels between rows

    // pull the raw data.members array
    const members = this.troop().members;
    let i = 0;

    for (let k = 0; k < members.length; k++) {
      const m = members[i];
      if (!$dataEnemies[m.enemyId]) continue;

      let x = 0,
        y = 0;
      // Ignore set-up enemies (id 5) ??
      if (m.enemyId != 5) {
        // compute col (0,1,2) then row (0,1,2...)
        const col = i % cols;
        const row = Math.floor(i / cols);

        // x goes right→left, y goes top→down
        x = startX - (cols - col - 1) * hSpacing;
        y = startY + row * vSpacing;

        // Set a small padding on the middle row
        if (i >= 3 && i < 6) {
          x -= hSpacing * 0.5;
        }

        i++;
      }

      // instantiate the real Game_Enemy with our x,y
      const enemy = new Game_Enemy(m.enemyId, x, y);
      if (m.hidden) enemy.hide();
      this._enemies.push(enemy);
    }

    this.makeUniqueNames();
  };

  // --------------------------------
  // Custom battle action menu

  // Remove all window padding so cells are exactly 48×48
  Window_ActorCommand.prototype.standardPadding = function () {
    return 0;
  };
  Window_ActorCommand.prototype.standardBackOpacity = function () {
    return 0;
  };

  globalThis._UI = {
    ATK_BTN_SZ: 96,
  };

  Scene_Battle.prototype.actorCommandWindowRect = function () {
    const rows = Window_ActorCommand.prototype.numVisibleRows.call(this);
    const ww = Window_ActorCommand.prototype.windowWidth.call(this) + 8 * 4;
    const wh = globalThis._UI.ATK_BTN_SZ * rows + 32;
    const wx = 0;
    const wy = Graphics.boxHeight - wh;
    return new Rectangle(wx, wy, ww, wh);
  };

  // 2) Single-column, 4-rows
  Window_ActorCommand.prototype.maxCols = function () {
    return 5;
  };
  Window_ActorCommand.prototype.numVisibleRows = function () {
    return 1;
  };

  // 3) Fixed size to match a 120×120 icon (you can tweak to taste)
  Window_ActorCommand.prototype.windowWidth = function () {
    return (
      globalThis._UI.ATK_BTN_SZ *
      Window_ActorCommand.prototype.maxCols.call(this)
    );
  };

  Window_ActorCommand.prototype.windowHeight = function () {
    return (
      globalThis._UI.ATK_BTN_SZ *
      Window_ActorCommand.prototype.numVisibleRows.call(this)
    );
  };

  Window_ActorCommand.prototype.itemWidth = function () {
    return globalThis._UI.ATK_BTN_SZ;
  };

  Window_ActorCommand.prototype.itemHeight = function () {
    return globalThis._UI.ATK_BTN_SZ;
  };

  // 4) Build only the commands you need, in your preferred order
  Window_ActorCommand.prototype.makeCommandList = function () {
    this._atkIcons = ImageManager.loadBitmap("img/ui/battle/", "atkIcons");

    if (this._actor) {
      this.addAttackCommand();
      this.addSkillCommands();
      this.addGuardCommand();
      this.addItemCommand();
    }
    // this.addCommand(TextManager.cancel, 'cancel');
  };

  Window_ActorCommand.prototype.itemActRect = function (index) {
    const maxCols = this.maxCols();
    const itemWidth = this.itemWidth();
    const itemHeight = this.itemHeight();
    const colSpacing = this.colSpacing();
    const rowSpacing = this.rowSpacing();
    const col = index % maxCols;
    const row = Math.floor(index / maxCols);
    const x = col * itemWidth + colSpacing / 2 - this.scrollBaseX();
    const y = row * itemHeight + rowSpacing / 2 - this.scrollBaseY();
    const width = itemWidth + colSpacing;
    const height = itemHeight + rowSpacing;

    return new Rectangle(x, y, width, height);
  };

  // 5) Draw an icon instead of text
  Window_ActorCommand.prototype.drawItem = function (index) {
    const rect = this.itemActRect(index);
    const align = this.itemTextAlign();
    this.resetTextColor();
    this.changePaintOpacity(this.isCommandEnabled(index));

    const symbol = this.commandSymbol(index);

    const pw = globalThis._UI.ATK_BTN_SZ;
    const ph = globalThis._UI.ATK_BTN_SZ;
    // const sx = (iconIndex % 16) * pw;
    // const sy = Math.floor(iconIndex / 16) * ph;
    // this.drawRect(rect.x, rect.y, rect.width, rect.height);

    let idx = this.iconIndexForSymbol(symbol);
    const ax = 0 + pw * (idx % this.maxCols());
    const ay = 0 + ph * ((idx / this.maxCols()) | 0);

    this.contents.blt(this._atkIcons, ax, ay, pw, ph, rect.x, rect.y);

    this.drawText(this.commandName(index), rect.x, rect.y, rect.width, 24);
  };

  // 6) Map each command symbol to your icon-set index
  Window_ActorCommand.prototype.iconIndexForSymbol = function (symbol) {
    switch (symbol) {
      case "attack":
        return 0; // ← your “attack” icon index
      case "skill":
        return 1; // ← your “magic” icon index
      case "guard":
        return 2; // ← your “guard” icon index
      case "item":
        return 3; // ← your “item” icon index
      case "assist":
        return 4; // ← your “item” icon index
      case "cancel":
        return 5; // ← your “escape” or “cancel” icon
    }
    return 0;
  };

  // --------------------------------------
  Game_Enemy.prototype.parseSkillUseAI = function (note) {
    const blocks = [];
    const tagRegex = /<Skill_Use_AI:\s*(\d+)>\s*([\s\S]*?)<\/skill_use_AI>/gi;
    let match;
    while ((match = tagRegex.exec(note))) {
      const skillId = Number(match[1]);
      const body = match[2].trim();
      const lines = body
        .split(/\r?\n/)
        .map((l) => l.trim())
        .filter((l) => l);
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

  Game_Enemy.prototype.evaluateSkillUseAI = function (rules, t) {
    const valid = [];
    const defaults = [];

    for (const rule of rules) {
      // 1) Remove any if any remove_if expr is true
      const isRemoved = rule.conditions
        .filter((c) => c.type === "remove_if")
        .some((c) => this.evalConditionAI(c.expr, t));
      if (isRemoved) continue;

      // 2) If there are select_if rules, require at least one to be true
      const selects = rule.conditions.filter((c) => c.type === "select_if");
      if (selects.length > 0) {
        if (selects.some((c) => this.evalConditionAI(c.expr, t))) {
          valid.push(rule.skillId);
        }
      } else if (rule.selection === "default") {
        // deferred default
        defaults.push(rule.skillId);
      } else {
        // no select_if rules: always valid
        valid.push(rule.skillId);
      }
    }

    if (valid.length > 0) {
      return valid;
    } else {
      // fallback to any defaults
      return defaults;
    }
  };

  Game_Enemy.prototype.evalConditionAI = function (expr, t) {
    // 1) t.state?(ID)
    const stateRegex = /^\s*t\.state\?\(\s*(\d+)\s*\)\s*$/i;
    let match = stateRegex.exec(expr);
    if (match) {
      const stateId = Number(match[1]);
      // Game_Enemy stores states in _states (an array)
      return Array.isArray(t._states) && t._states.includes(stateId);
    }

    // 2) (t.hp_rate * 100) <= N
    const hpRateRegex =
      /^\s*\(\s*t\.hp_rate\s*\*\s*100\s*\)\s*<=\s*(\d+(?:\.\d+)?)\s*$/i;
    match = hpRateRegex.exec(expr);
    if (match) {
      const threshold = parseFloat(match[1]);
      // t.hpRate() returns a 0–1 fraction
      return t.hpRate() * 100 <= threshold;
    }

    // unsupported condition
    console.warn(`Unsupported AI condition: ${expr}`);
    return false;
  };

  const _Game_Enemy_makeActions = Game_Enemy.prototype.makeActions;
  Game_Enemy.prototype.makeActions = function () {
    this.clearActions();
    if (!this.isBattleMember()) return;

    const note = this.enemy().note;
    // console.log(note);

    if (note.match(/<Skill_Use_AI:/i)) {
      // parse & evaluate
      const rules = this.parseSkillUseAI(note);
      // pass `this` as `t`, so conditions like t.state?(ID) or t.hp_rate work
      const choices = this.evaluateSkillUseAI(rules, this);
      if (choices.length) {
        // pick one skill (random among valid)
        const skillId = choices[Math.floor(Math.random() * choices.length)];
        const action = new Game_Action(this);
        action.setSkill(skillId);
        this._actions.push(action);
        return;
      }
      // if parsing yielded nothing, fall through to default AI
    }

    // default behavior
    _Game_Enemy_makeActions.call(this);
  };
})();
