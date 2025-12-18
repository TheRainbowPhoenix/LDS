//-----------------------------------------------------------------------------
// MZ Compatible Windows
//
// Adds MZ window classes used by plugins while keeping MV behavior.

if (typeof Window_StatusBase === "undefined") {
  function Window_StatusBase() {
    this.initialize(...arguments);
  }

  Window_StatusBase.prototype = Object.create(Window_Selectable.prototype);
  Window_StatusBase.prototype.constructor = Window_StatusBase;

  Window_StatusBase.prototype.initialize = function () {
    var rect = arguments[0];
    if (rect && rect.constructor === Rectangle && arguments.length === 1) {
      Window_Selectable.prototype.initialize.call(
        this,
        rect.x,
        rect.y,
        rect.width,
        rect.height
      );
    } else {
      Window_Selectable.prototype.initialize.apply(this, arguments);
    }
    this._additionalSprites = {};
    this.loadFaceImages();
  };

  Window_StatusBase.prototype.loadFaceImages = function () {
    $gameParty.members().forEach(function (actor) {
      ImageManager.loadFace(actor.faceName());
    });
  };

  Window_StatusBase.prototype.refresh = function () {
    this.hideAdditionalSprites();
    Window_Selectable.prototype.refresh.call(this);
  };

  Window_StatusBase.prototype.hideAdditionalSprites = function () {
    Object.values(this._additionalSprites).forEach(function (sprite) {
      sprite.hide();
    });
  };

  Window_StatusBase.prototype.placeActorName = function (actor, x, y) {
    var key = "actor%1-name".format(actor.actorId());
    var sprite = this.createInnerSprite(key, Sprite_Name);
    sprite.setup(actor);
    sprite.move(x, y);
    sprite.show();
  };

  Window_StatusBase.prototype.placeStateIcon = function (actor, x, y) {
    var key = "actor%1-stateIcon".format(actor.actorId());
    var sprite = this.createInnerSprite(key, Sprite_StateIcon);
    sprite.setup(actor);
    sprite.move(x, y);
    sprite.show();
  };

  Window_StatusBase.prototype.placeGauge = function (actor, type, x, y) {
    var key = "actor%1-gauge-%2".format(actor.actorId(), type);
    var sprite = this.createInnerSprite(key, Sprite_Gauge);
    sprite.setup(actor, type);
    sprite.move(x, y);
    sprite.show();
  };

  Window_StatusBase.prototype.placeTimeGauge = function (actor, x, y) {
    if (BattleManager.isTpb && BattleManager.isTpb()) {
      this.placeGauge(actor, "time", x, y);
    }
  };

  Window_StatusBase.prototype.placeBasicGauges = function (actor, x, y) {
    this.placeGauge(actor, "hp", x, y);
    this.placeGauge(actor, "mp", x, y + this.gaugeLineHeight());
    if ($dataSystem.optDisplayTp) {
      this.placeGauge(actor, "tp", x, y + this.gaugeLineHeight() * 2);
    }
  };

  Window_StatusBase.prototype.gaugeLineHeight = function () {
    return 24;
  };

  Window_StatusBase.prototype.drawActorCharacter = function (actor, x, y) {
    this.drawCharacter(actor.characterName(), actor.characterIndex(), x, y);
  };

  Window_StatusBase.prototype.drawActorFace = function (
    actor,
    x,
    y,
    width,
    height
  ) {
    this.drawFace(actor.faceName(), actor.faceIndex(), x, y, width, height);
  };

  Window_StatusBase.prototype.drawActorName = function (actor, x, y, width) {
    width = width || 168;
    this.changeTextColor(ColorManager.hpColor(actor));
    this.drawText(actor.name(), x, y, width);
  };

  Window_StatusBase.prototype.drawActorClass = function (actor, x, y, width) {
    width = width || 168;
    this.resetTextColor();
    this.drawText(actor.currentClass().name, x, y, width);
  };

  Window_StatusBase.prototype.drawActorNickname = function (
    actor,
    x,
    y,
    width
  ) {
    width = width || 270;
    this.resetTextColor();
    this.drawText(actor.nickname(), x, y, width);
  };

  Window_StatusBase.prototype.drawActorLevel = function (actor, x, y) {
    this.changeTextColor(ColorManager.systemColor());
    this.drawText(TextManager.levelA, x, y, 48);
    this.resetTextColor();
    this.drawText(actor.level, x + this.textWidth(TextManager.levelA), y, 36);
  };

  Window_StatusBase.prototype.placeItem = function (actor, item, x, y) {
    var key = "actor%1-item-%2".format(actor.actorId(), item.itypeId || 0);
    var sprite = this.createInnerSprite(key, Sprite);
    sprite.bitmap = ImageManager.loadSystem("IconSet");
    sprite.setFrame(
      (item.iconIndex % 16) * 32,
      Math.floor(item.iconIndex / 16) * 32,
      32,
      32
    );
    sprite.move(x, y);
    sprite.show();
  };

  Window_StatusBase.prototype.createInnerSprite = function (key, spriteClass) {
    var dict = this._additionalSprites;
    if (dict[key]) {
      return dict[key];
    } else {
      var sprite = new spriteClass();
      dict[key] = sprite;
      this.addChild(sprite);
      return sprite;
    }
  };
}

if (typeof Window_StatusEquip === "undefined") {
  function Window_StatusEquip() {
    this.initialize(...arguments);
  }

  Window_StatusEquip.prototype = Object.create(Window_StatusBase.prototype);
  Window_StatusEquip.prototype.constructor = Window_StatusEquip;

  Window_StatusEquip.prototype.initialize = function () {
    Window_StatusBase.prototype.initialize.apply(this, arguments);
    this._actor = null;
  };

  Window_StatusEquip.prototype.setActor = function (actor) {
    if (this._actor !== actor) {
      this._actor = actor;
      this.refresh();
    }
  };

  Window_StatusEquip.prototype.maxItems = function () {
    return this._actor ? this._actor.equipSlots().length : 0;
  };

  Window_StatusEquip.prototype.itemHeight = function () {
    return this.lineHeight();
  };

  Window_StatusEquip.prototype.drawItem = function (index) {
    var rect = this.itemRectForText(index);
    var equips = this._actor ? this._actor.equips() : [];
    var item = equips[index];
    var slotName = this._actor
      ? this._actor.equipSlots()[index] || ""
      : TextManager.emptySlot || "";
    var sw = 138;
    this.changeTextColor(ColorManager.systemColor());
    this.drawText(slotName, rect.x, rect.y, sw, rect.height);
    this.drawItemName(item, rect.x + sw, rect.y, rect.width - sw);
  };

  Window_StatusEquip.prototype.drawItemBackground = function () {};
}
