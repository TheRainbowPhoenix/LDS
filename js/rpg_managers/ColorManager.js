//-----------------------------------------------------------------------------
// ColorManager (MZ compatibility)
//
// Provides a subset of the MZ color helpers used by plugins and new UI pieces.

/*:
 * @target MV
 * @plugindesc Adds minimal MZ-like color helpers for compatibility.
 * @author RPG Maker MV Ace
 */

function ColorManager() {
  throw new Error("This is a static class");
}

ColorManager.loadWindowskin = function () {
  this._windowskin = ImageManager.loadSystem("Window");
};

ColorManager._ensureWindow = function () {
  if (!this._helperWindow) {
    this._helperWindow = new Window_Base(new Rectangle(0, 0, 0, 0));
  }
  if (this._windowskin) {
    this._helperWindow.windowskin = this._windowskin;
  }
};

ColorManager.textColor = function (n) {
  this._ensureWindow();
  return this._helperWindow.textColor(n);
};

ColorManager.normalColor = function () {
  return this.textColor(0);
};

ColorManager.systemColor = function () {
  return this.textColor(16);
};

ColorManager.crisisColor = function () {
  return this.textColor(17);
};

ColorManager.deathColor = function () {
  return this.textColor(18);
};

ColorManager.gaugeBackColor = function () {
  return this.textColor(19);
};

ColorManager.hpGaugeColor1 = function () {
  return this.textColor(20);
};

ColorManager.hpGaugeColor2 = function () {
  return this.textColor(21);
};

ColorManager.mpGaugeColor1 = function () {
  return this.textColor(22);
};

ColorManager.mpGaugeColor2 = function () {
  return this.textColor(23);
};

ColorManager.mpCostColor = function () {
  return this.textColor(23);
};

ColorManager.powerUpColor = function () {
  return this.textColor(24);
};

ColorManager.powerDownColor = function () {
  return this.textColor(25);
};

ColorManager.tpGaugeColor1 = function () {
  return this.textColor(28);
};

ColorManager.tpGaugeColor2 = function () {
  return this.textColor(29);
};

ColorManager.tpCostColor = function () {
  return this.textColor(29);
};

ColorManager.pendingColor = function () {
  return this.textColor(16);
};

ColorManager.hpColor = function (actor) {
  if (actor && actor.isDead && actor.isDead()) {
    return this.deathColor();
  } else if (actor && actor.isDying && actor.isDying()) {
    return this.crisisColor();
  } else {
    return this.normalColor();
  }
};

ColorManager.mpColor = function () {
  return this.normalColor();
};

ColorManager.tpColor = function () {
  return this.systemColor();
};

ColorManager.paramchangeTextColor = function (change) {
  if (change > 0) {
    return this.powerUpColor();
  } else if (change < 0) {
    return this.powerDownColor();
  } else {
    return this.normalColor();
  }
};

ColorManager.damageColor = function (colorType) {
  switch (colorType) {
    case 0:
      return this.textColor(10);
    case 1:
      return this.textColor(24);
    default:
      return this.normalColor();
  }
};

ColorManager.outlineColor = function () {
  return "rgba(0, 0, 0, 0.5)";
};

ColorManager.dimColor1 = function () {
  return "rgba(0, 0, 0, 0.6)";
};

ColorManager.dimColor2 = function () {
  return "rgba(0, 0, 0, 0)";
};

ColorManager.itemBackColor1 = function () {
  return "rgba(255, 255, 255, 0.2)";
};

ColorManager.itemBackColor2 = function () {
  return "rgba(0, 0, 0, 0.2)";
};
