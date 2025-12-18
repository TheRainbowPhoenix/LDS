//-----------------------------------------------------------------------------
// MZ Compatible Sprites
//
// Provides MZ-only sprite classes so plugins can run alongside MV.

if (typeof Sprite_Clickable === "undefined") {
  function Sprite_Clickable() {
    this.initialize(...arguments);
  }

  Sprite_Clickable.prototype = Object.create(Sprite.prototype);
  Sprite_Clickable.prototype.constructor = Sprite_Clickable;

  Sprite_Clickable.prototype.initialize = function () {
    Sprite.prototype.initialize.call(this);
    this._pressed = false;
    this._hovered = false;
  };

  Sprite_Clickable.prototype.update = function () {
    Sprite.prototype.update.call(this);
    this.processTouch();
  };

  Sprite_Clickable.prototype.processTouch = function () {
    if (this.isClickEnabled()) {
      if (this.isBeingTouched()) {
        if (!this._hovered && TouchInput.isHovered && TouchInput.isHovered()) {
          this._hovered = true;
          this.onMouseEnter();
        }
        if (TouchInput.isTriggered()) {
          this._pressed = true;
          this.onPress();
        }
      } else {
        if (this._hovered) {
          this.onMouseExit();
        }
        this._pressed = false;
        this._hovered = false;
      }
      if (this._pressed && TouchInput.isReleased()) {
        this._pressed = false;
        this.onClick();
      }
    } else {
      this._pressed = false;
      this._hovered = false;
    }
  };

  Sprite_Clickable.prototype.isPressed = function () {
    return this._pressed;
  };

  Sprite_Clickable.prototype.isClickEnabled = function () {
    return this.worldVisible;
  };

  Sprite_Clickable.prototype.isBeingTouched = function () {
    var touchPos = new Point(TouchInput.x, TouchInput.y);
    var localPos = this.worldTransform.applyInverse(touchPos);
    return this.hitTest(localPos.x, localPos.y);
  };

  Sprite_Clickable.prototype.hitTest = function (x, y) {
    var rect = new Rectangle(
      -this.anchor.x * this.width,
      -this.anchor.y * this.height,
      this.width,
      this.height
    );
    return rect.contains(x, y);
  };

  Sprite_Clickable.prototype.onMouseEnter = function () {};
  Sprite_Clickable.prototype.onMouseExit = function () {};
  Sprite_Clickable.prototype.onPress = function () {};
  Sprite_Clickable.prototype.onClick = function () {};
}

if (typeof Sprite_AnimationMV === "undefined") {
  var Sprite_AnimationMV = Sprite_Animation;
}

if (typeof Sprite_Gauge === "undefined") {
  function Sprite_Gauge() {
    this.initialize(...arguments);
  }

  Sprite_Gauge.prototype = Object.create(Sprite.prototype);
  Sprite_Gauge.prototype.constructor = Sprite_Gauge;

  Sprite_Gauge.prototype.initialize = function () {
    Sprite.prototype.initialize.call(this);
    this._battler = null;
    this._statusType = "";
    this._value = NaN;
    this._maxValue = NaN;
    this._targetValue = NaN;
    this._targetMaxValue = NaN;
    this._duration = 0;
    this.createBitmap();
  };

  Sprite_Gauge.prototype.destroy = function (options) {
    if (this.bitmap) {
      this.bitmap.destroy();
    }
    Sprite.prototype.destroy.call(this, options);
  };

  Sprite_Gauge.prototype.createBitmap = function () {
    this.bitmap = new Bitmap(this.bitmapWidth(), this.bitmapHeight());
  };

  Sprite_Gauge.prototype.bitmapWidth = function () {
    return 128;
  };

  Sprite_Gauge.prototype.bitmapHeight = function () {
    return 32;
  };

  Sprite_Gauge.prototype.gaugeHeight = function () {
    return 12;
  };

  Sprite_Gauge.prototype.textHeight = function () {
    return 24;
  };

  Sprite_Gauge.prototype.gaugeX = function () {
    return this._statusType === "time" ? 0 : 40;
  };

  Sprite_Gauge.prototype.setup = function (battler, statusType) {
    this._battler = battler;
    this._statusType = statusType;
    this._value = this.currentValue();
    this._maxValue = this.currentMaxValue();
    this.redraw();
  };

  Sprite_Gauge.prototype.update = function () {
    Sprite.prototype.update.call(this);
    this.updateBitmap();
  };

  Sprite_Gauge.prototype.updateBitmap = function () {
    var value = this.currentValue();
    var maxValue = this.currentMaxValue();
    if (value !== this._targetValue || maxValue !== this._targetMaxValue) {
      this._targetValue = value;
      this._targetMaxValue = maxValue;
      this._duration = this.smoothness();
    }
    if (this._duration > 0) {
      var d = this._duration;
      this._value = (this._value * (d - 1) + this._targetValue) / d;
      this._maxValue = (this._maxValue * (d - 1) + this._targetMaxValue) / d;
      this._duration--;
      this.redraw();
    }
  };

  Sprite_Gauge.prototype.smoothness = function () {
    return this._statusType === "time" ? 5 : 20;
  };

  Sprite_Gauge.prototype.currentValue = function () {
    if (!this._battler) return NaN;
    switch (this._statusType) {
      case "hp":
        return this._battler.hp;
      case "mp":
        return this._battler.mp;
      case "tp":
        return this._battler.tp;
      case "time":
        return this._battler.tpbChargeTime
          ? this._battler.tpbChargeTime()
          : 0;
      default:
        return NaN;
    }
  };

  Sprite_Gauge.prototype.currentMaxValue = function () {
    if (!this._battler) return NaN;
    switch (this._statusType) {
      case "hp":
        return this._battler.mhp;
      case "mp":
        return this._battler.mmp;
      case "tp":
        return this._battler.maxTp ? this._battler.maxTp() : 100;
      case "time":
        return 1;
      default:
        return NaN;
    }
  };

  Sprite_Gauge.prototype.drawGauge = function () {
    var rate =
      this._maxValue > 0 ? Math.max(this._value / this._maxValue, 0) : 0;
    var fillW = Math.floor((this.gaugeWidth() - 2) * rate);
    var gaugeY = this.textHeight() - this.gaugeHeight();
    this.bitmap.fillRect(
      this.gaugeX(),
      gaugeY,
      this.gaugeWidth(),
      this.gaugeHeight(),
      ColorManager.gaugeBackColor()
    );
    this.bitmap.gradientFillRect(
      this.gaugeX(),
      gaugeY,
      fillW,
      this.gaugeHeight(),
      this.gaugeColor1(),
      this.gaugeColor2()
    );
  };

  Sprite_Gauge.prototype.gaugeWidth = function () {
    return this.bitmapWidth() - this.gaugeX();
  };

  Sprite_Gauge.prototype.gaugeColor1 = function () {
    switch (this._statusType) {
      case "hp":
        return ColorManager.hpGaugeColor1();
      case "mp":
        return ColorManager.mpGaugeColor1();
      case "tp":
        return ColorManager.tpGaugeColor1();
      case "time":
        return ColorManager.textColor(30);
      default:
        return ColorManager.normalColor();
    }
  };

  Sprite_Gauge.prototype.gaugeColor2 = function () {
    switch (this._statusType) {
      case "hp":
        return ColorManager.hpGaugeColor2();
      case "mp":
        return ColorManager.mpGaugeColor2();
      case "tp":
        return ColorManager.tpGaugeColor2();
      case "time":
        return ColorManager.textColor(31);
      default:
        return ColorManager.normalColor();
    }
  };

  Sprite_Gauge.prototype.label = function () {
    switch (this._statusType) {
      case "hp":
        return TextManager.hpA;
      case "mp":
        return TextManager.mpA;
      case "tp":
        return TextManager.tpA || "TP";
      case "time":
        return "";
      default:
        return "";
    }
  };

  Sprite_Gauge.prototype.redraw = function () {
    this.bitmap.clear();
    this.drawGauge();
    this.drawLabel();
    this.drawValue();
  };

  Sprite_Gauge.prototype._mainFontFace = function () {
    return $gameSystem && $gameSystem.mainFontFace
      ? $gameSystem.mainFontFace()
      : Window_Base.prototype.standardFontFace.call(Window_Base.prototype);
  };

  Sprite_Gauge.prototype._mainFontSize = function () {
    return $gameSystem && $gameSystem.mainFontSize
      ? $gameSystem.mainFontSize()
      : Window_Base.prototype.standardFontSize.call(Window_Base.prototype);
  };

  Sprite_Gauge.prototype._numberFontFace = function () {
    return $gameSystem && $gameSystem.numberFontFace
      ? $gameSystem.numberFontFace()
      : this._mainFontFace();
  };

  Sprite_Gauge.prototype.drawLabel = function () {
    this.bitmap.fontFace = this._mainFontFace();
    this.bitmap.fontSize = this._mainFontSize() - 2;
    this.bitmap.textColor = ColorManager.systemColor();
    this.bitmap.outlineColor = ColorManager.outlineColor();
    this.bitmap.outlineWidth = 4;
    this.bitmap.drawText(this.label(), 0, 0, this.gaugeX(), this.textHeight());
  };

  Sprite_Gauge.prototype.drawValue = function () {
    this.bitmap.fontFace = this._numberFontFace();
    this.bitmap.fontSize = this._mainFontSize() - 6;
    this.bitmap.textColor = this.valueColor();
    this.bitmap.outlineColor = ColorManager.outlineColor();
    this.bitmap.outlineWidth = 4;
    var width = this.bitmapWidth() - this.gaugeX();
    this.bitmap.drawText(
      Math.round(this._value),
      this.gaugeX(),
      0,
      width,
      this.textHeight(),
      "right"
    );
  };

  Sprite_Gauge.prototype.valueColor = function () {
    switch (this._statusType) {
      case "hp":
        return ColorManager.hpColor(this._battler);
      case "mp":
        return ColorManager.mpColor(this._battler);
      case "tp":
        return ColorManager.tpColor(this._battler);
      default:
        return ColorManager.normalColor();
    }
  };
}

if (typeof Sprite_Name === "undefined") {
  function Sprite_Name() {
    this.initialize(...arguments);
  }

  Sprite_Name.prototype = Object.create(Sprite.prototype);
  Sprite_Name.prototype.constructor = Sprite_Name;

  Sprite_Name.prototype.initialize = function () {
    Sprite.prototype.initialize.call(this);
    this._battler = null;
    this._name = "";
    this._textColor = "";
    this.bitmap = new Bitmap(this.bitmapWidth(), this.bitmapHeight());
  };

  Sprite_Name.prototype.bitmapWidth = function () {
    return 128;
  };

  Sprite_Name.prototype.bitmapHeight = function () {
    return 24;
  };

  Sprite_Name.prototype.fontFace = function () {
    return $gameSystem && $gameSystem.mainFontFace
      ? $gameSystem.mainFontFace()
      : Window_Base.prototype.standardFontFace.call(Window_Base.prototype);
  };

  Sprite_Name.prototype.fontSize = function () {
    return $gameSystem && $gameSystem.mainFontSize
      ? $gameSystem.mainFontSize()
      : Window_Base.prototype.standardFontSize.call(Window_Base.prototype);
  };

  Sprite_Name.prototype.setup = function (battler) {
    this._battler = battler;
    this.updateBitmap();
  };

  Sprite_Name.prototype.update = function () {
    Sprite.prototype.update.call(this);
    this.updateBitmap();
  };

  Sprite_Name.prototype.updateBitmap = function () {
    var name = this.name();
    var color = this.textColor();
    if (name !== this._name || color !== this._textColor) {
      this._name = name;
      this._textColor = color;
      this.redraw();
    }
  };

  Sprite_Name.prototype.name = function () {
    return this._battler ? this._battler.name() : "";
  };

  Sprite_Name.prototype.textColor = function () {
    return ColorManager.hpColor(this._battler);
  };

  Sprite_Name.prototype.outlineColor = function () {
    return ColorManager.outlineColor();
  };

  Sprite_Name.prototype.redraw = function () {
    this.bitmap.clear();
    this.bitmap.fontFace = this.fontFace();
    this.bitmap.fontSize = this.fontSize();
    this.bitmap.textColor = this.textColor();
    this.bitmap.outlineColor = this.outlineColor();
    this.bitmap.outlineWidth = 4;
    this.bitmap.drawText(
      this.name(),
      0,
      0,
      this.bitmapWidth(),
      this.bitmapHeight(),
      "center"
    );
  };
}
