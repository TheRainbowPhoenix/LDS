//-----------------------------------------------------------------------------
// Window_Base
//
// The superclass of all windows within the game.

function Window_Base() {
  this.initialize.apply(this, arguments);
}

Window_Base.prototype = Object.create(Window.prototype);
Window_Base.prototype.constructor = Window_Base;

Window_Base.prototype.initialize = function (x, y, width, height) {
  Window.prototype.initialize.call(this);
  this.loadWindowskin();
  this.move(x, y, width, height); // (rect.x, rect.y, rect.width, rect.height);
  this.updatePadding();
  this.updateBackOpacity();
  this.updateTone();
  this.createContents();
  this._opening = false;
  this._closing = false;
  this._dimmerSprite = null;
};

Window_Base._iconWidth = 32;
Window_Base._iconHeight = 32;
Window_Base._faceWidth = 144;
Window_Base._faceHeight = 144;

Window_Base.prototype.destroy = function (options) {
  this.destroyContents();
  // if (this._dimmerSprite) {
  //     this._dimmerSprite.bitmap.destroy();
  // }
  Window.prototype.destroy.call(this, options);
};

Window_Base.prototype.checkRectObject = function (rect) {
  if (typeof rect !== "object" || !("x" in rect)) {
    // Probably MV plugin is used
    throw new Error("Argument must be a Rectangle");
  }
};

Window_Base.prototype.lineHeight = function () {
  return 36;
};

Window_Base.prototype.itemWidth = function () {
  return this.innerWidth;
};

Window_Base.prototype.itemHeight = function () {
  return this.lineHeight();
};

Window_Base.prototype.itemPadding = function () {
  return 8;
};

Window_Base.prototype.baseTextRect = function () {
  const rect = new Rectangle(0, 0, this.innerWidth, this.innerHeight);
  rect.pad(-this.itemPadding(), 0);
  return rect;
};

Window_Base.prototype.standardFontFace = function () {
  if ($gameSystem.mainFontFace) {
    return $gameSystem.mainFontFace();
  } else if ($gameSystem.isChinese()) {
    return "SimHei, Heiti TC, sans-serif";
  } else if ($gameSystem.isKorean()) {
    return "Dotum, AppleGothic, sans-serif";
  } else {
    return "GameFont";
  }
};

Window_Base.prototype.standardFontSize = function () {
  return 28;
};

Window_Base.prototype.standardPadding = function () {
  return 18;
};

Window_Base.prototype.textPadding = function () {
  return 6;
};

Window_Base.prototype.standardBackOpacity = function () {
  return 192;
};

Window_Base.prototype.loadWindowskin = function () {
  this.windowskin = ImageManager.loadSystem("Window");
};

Window_Base.prototype.updatePadding = function () {
  this.padding = this.standardPadding();
  // this.padding = $gameSystem && $gameSystem.windowPadding ? $gameSystem.windowPadding() : this.standardPadding(); // [MZ]: this.padding = $gameSystem.windowPadding();
};

Window_Base.prototype.updateBackOpacity = function () {
  this.backOpacity = this.standardBackOpacity(); 
  // this.backOpacity = $gameSystem && $gameSystem.windowOpacity ? $gameSystem.windowOpacity() : this.standardBackOpacity(); // [MZ]: = $gameSystem.windowOpacity();
};

Window_Base.prototype.contentsWidth = function () {
  return this.width - this.standardPadding() * 2; // [MZ]: return this.innerWidth;
};

Window_Base.prototype.contentsHeight = function () {
  return this.height - this.standardPadding() * 2; // [MZ]: return this.innerHeight;
};

Window_Base.prototype.fittingHeight = function (numLines) {
  return numLines * this.lineHeight() + this.standardPadding() * 2;
  // return numLines * this.lineHeight() + (
  //   $gameSystem && $gameSystem.windowPadding ?
  //   $gameSystem.windowPadding() :
  //   this.standardPadding()
  // ) * 2; // [MZ]:  $gameSystem.windowPadding() * 2;
};

Window_Base.prototype.updateTone = function () {
  var tone = $gameSystem.windowTone();
  this.setTone(tone[0], tone[1], tone[2]);
};

Window_Base.prototype.createContents = function () {
  const width = this.contentsWidth();
  const height = this.contentsHeight();
  this.destroyContents();
  this.contents = new Bitmap(width, height);
  this.contentsBack = new Bitmap(width, height);
  this.resetFontSettings();
};

Window_Base.prototype.destroyContents = function () {
  if (this.contents && this.contents.destroy) {
    this.contents.destroy();
  }
  if (this.contentsBack && this.contentsBack.destroy) {
    this.contentsBack.destroy();
  }
};

Window_Base.prototype.resetFontSettings = function () {
  this.contents.fontFace = this.standardFontFace();
  this.contents.fontSize = this.standardFontSize();
  this.resetTextColor();
};

Window_Base.prototype.resetTextColor = function () {
  this.changeTextColor(this.normalColor());
  this.changeOutlineColor(ColorManager.outlineColor());
};

Window_Base.prototype.update = function () {
  Window.prototype.update.call(this);
  this.updateTone();
  this.updateOpen();
  this.updateClose();
  this.updateBackgroundDimmer();
};

Window_Base.prototype.updateOpen = function () {
  if (this._opening) {
    this.openness += 32;
    if (this.isOpen()) {
      this._opening = false;
    }
  }
};

Window_Base.prototype.updateClose = function () {
  if (this._closing) {
    this.openness -= 32;
    if (this.isClosed()) {
      this._closing = false;
    }
  }
};

Window_Base.prototype.open = function () {
  if (!this.isOpen()) {
    this._opening = true;
  }
  this._closing = false;
};

Window_Base.prototype.close = function () {
  if (!this.isClosed()) {
    this._closing = true;
  }
  this._opening = false;
};

Window_Base.prototype.isOpening = function () {
  return this._opening;
};

Window_Base.prototype.isClosing = function () {
  return this._closing;
};

Window_Base.prototype.show = function () {
  this.visible = true;
};

Window_Base.prototype.hide = function () {
  this.visible = false;
};

Window_Base.prototype.activate = function () {
  this.active = true;
};

Window_Base.prototype.deactivate = function () {
  this.active = false;
};

Window_Base.prototype.textColor = function (n) {
  var px = 96 + (n % 8) * 12 + 6;
  var py = 144 + Math.floor(n / 8) * 12 + 6;
  return this.windowskin.getPixel(px, py);
};

Window_Base.prototype.normalColor = function () {
  return this.textColor(0);
};

Window_Base.prototype.systemColor = function () {
  return this.textColor(16); // [MZ]: ColorManager.systemColor();
};

Window_Base.prototype.crisisColor = function () {
  return this.textColor(17);
};

Window_Base.prototype.deathColor = function () {
  return this.textColor(18);
};

Window_Base.prototype.gaugeBackColor = function () {
  return this.textColor(19);
};

Window_Base.prototype.hpGaugeColor1 = function () {
  return this.textColor(20);
};

Window_Base.prototype.hpGaugeColor2 = function () {
  return this.textColor(21);
};

Window_Base.prototype.mpGaugeColor1 = function () {
  return this.textColor(22);
};

Window_Base.prototype.mpGaugeColor2 = function () {
  return this.textColor(23);
};

Window_Base.prototype.mpCostColor = function () {
  return this.textColor(23);
};

Window_Base.prototype.powerUpColor = function () {
  return this.textColor(24);
};

Window_Base.prototype.powerDownColor = function () {
  return this.textColor(25);
};

Window_Base.prototype.tpGaugeColor1 = function () {
  return this.textColor(28);
};

Window_Base.prototype.tpGaugeColor2 = function () {
  return this.textColor(29);
};

Window_Base.prototype.tpCostColor = function () {
  return this.textColor(29);
};

Window_Base.prototype.pendingColor = function () {
  return this.windowskin.getPixel(120, 120);
};

Window_Base.prototype.translucentOpacity = function () {
  return 160;
};

Window_Base.prototype.changeTextColor = function (color) {
  this.contents.textColor = color;
};

Window_Base.prototype.changeOutlineColor = function (color) {
  this.contents.outlineColor = color;
};

Window_Base.prototype.changePaintOpacity = function (enabled) {
  this.contents.paintOpacity = enabled ? 255 : this.translucentOpacity();
};

Window_Base.prototype.drawRect = function (x, y, width, height) {
  const outlineColor = this.contents.outlineColor;
  const mainColor = this.contents.textColor;
  this.contents.fillRect(x, y, width, height, outlineColor);
  this.contents.fillRect(x + 1, y + 1, width - 2, height - 2, mainColor);
};

Window_Base.prototype.drawText = function (text, x, y, maxWidth, align) {
  this.contents.drawText(text, x, y, maxWidth, this.lineHeight(), align);
};

Window_Base.prototype.textWidth = function (text) {
  return this.contents.measureTextWidth(text);
};

Window_Base.prototype.drawTextEx = function (text, x, y, width = 0) {
  if (text) {
    var textState = this.createTextState(text, x, y, width);
    this.resetFontSettings();
    while (textState.index < textState.text.length) {
      this.processCharacter(textState);
    }
    return textState.x - x;
  } else {
    return 0;
  }
};

Window_Base.prototype.createTextState = function (text, x, y, width) {
  const rtl = Utils.containsArabic ? Utils.containsArabic(text) : false;
  let textState = { index: 0, x: x, y: y, left: x };
  textState.text = this.convertEscapeCharacters(text);
  textState.x = rtl ? x + width : x;
  textState.width = width;
  textState.height = this.calcTextHeight(textState, false);
  textState.startX = textState.x;
  textState.startY = textState.y;
  textState.rtl = rtl;
  textState.buffer = this.createTextBuffer(rtl);
  textState.drawing = true;
  textState.outputWidth = 0;
  textState.outputHeight = 0;

  return textState;
};

Window_Base.prototype.processAllText = function (textState) {
  while (textState.index < textState.text.length) {
    this.processCharacter(textState);
  }
  this.flushTextState(textState);
};

Window_Base.prototype.flushTextState = function (textState) {
  const text = textState.buffer;
  const rtl = textState.rtl;
  const width = this.textWidth(text);
  const height = textState.height;
  const x = rtl ? textState.x - width : textState.x;
  const y = textState.y;
  if (textState.drawing) {
    this.contents.drawText(text, x, y, width, height);
  }
  textState.x += rtl ? -width : width;
  textState.buffer = this.createTextBuffer(rtl);
  const outputWidth = Math.abs(textState.x - textState.startX);
  if (textState.outputWidth < outputWidth) {
    textState.outputWidth = outputWidth;
  }
  textState.outputHeight = y - textState.startY + height;
};

Window_Base.prototype.createTextBuffer = function (rtl) {
  // U+202B: RIGHT-TO-LEFT EMBEDDING
  return rtl ? "\u202B" : "";
};

Window_Base.prototype.convertEscapeCharacters = function (text) {
  text = text.replace(/\\/g, "\x1b");
  text = text.replace(/\x1b\x1b/g, "\\");
  text = text.replace(
    /\x1bV\[(\d+)\]/gi,
    function () {
      return $gameVariables.value(parseInt(arguments[1]));
    }.bind(this)
  );
  text = text.replace(
    /\x1bV\[(\d+)\]/gi,
    function () {
      return $gameVariables.value(parseInt(arguments[1]));
    }.bind(this)
  );
  text = text.replace(
    /\x1bN\[(\d+)\]/gi,
    function () {
      return this.actorName(parseInt(arguments[1]));
    }.bind(this)
  );
  text = text.replace(
    /\x1bP\[(\d+)\]/gi,
    function () {
      return this.partyMemberName(parseInt(arguments[1]));
    }.bind(this)
  );
  text = text.replace(/\x1bG/gi, TextManager.currencyUnit);
  return text;
};

Window_Base.prototype.actorName = function (n) {
  const actor = n >= 1 ? $gameActors.actor(n) : null;
  return actor ? actor.name() : "";
};

Window_Base.prototype.partyMemberName = function (n) {
  const actor = n >= 1 ? $gameParty.members()[n - 1] : null;
  return actor ? actor.name() : "";
};

Window_Base.prototype.processCharacter = function (textState) {
  const c = textState.text[textState.index];
  if (c.charCodeAt(0) < 0x20) {
    this.flushTextState(textState);
    this.processControlCharacter(textState, c);
  } else {
    switch (c) {
      case "\n":
        this.processNewLine(textState);
        break;
      case "\f":
        this.processNewPage(textState);
        break;
      case "\x1b":
        this.processControlCharacter(textState, c);
        break;
      default:
        this.processNormalCharacter(textState);
        break;
    }
  }
};

Window_Base.prototype.processControlCharacter = function (textState, c) {
  if (c === "\n") {
    this.processNewLine(textState);
  }
  if (c === "\x1b") {
    const code = this.obtainEscapeCode(textState);
    this.processEscapeCharacter(code, textState);
  }
};

Window_Base.prototype.processNormalCharacter = function (textState) {
  var c = textState.text[textState.index++];
  var w = this.textWidth(c);
  this.contents.drawText(c, textState.x, textState.y, w * 2, textState.height);
  textState.x += w;
};

Window_Base.prototype.processNewLine = function (textState) {
  textState.x = textState.left; // .startX
  textState.y += textState.height;
  textState.height = this.calcTextHeight(textState, false);
  textState.index++;
};

Window_Base.prototype.processNewPage = function (textState) {
  textState.index++;
};

Window_Base.prototype.obtainEscapeCode = function (textState) {
  textState.index++;
  var regExp = /^[\$\.\|\^!><\{\}\\]|^[A-Z]+/i;
  var arr = regExp.exec(textState.text.slice(textState.index));
  if (arr) {
    textState.index += arr[0].length;
    return arr[0].toUpperCase();
  } else {
    return "";
  }
};

Window_Base.prototype.obtainEscapeParam = function (textState) {
  var arr = /^\[\d+\]/.exec(textState.text.slice(textState.index));
  if (arr) {
    textState.index += arr[0].length;
    return parseInt(arr[0].slice(1));
  } else {
    return "";
  }
};

Window_Base.prototype.processEscapeCharacter = function (code, textState) {
  switch (code) {
    case "C":
      this.changeTextColor(this.textColor(this.obtainEscapeParam(textState)));
      break;
    case "I":
      this.processDrawIcon(this.obtainEscapeParam(textState), textState);
      break;
    case "PX":
      textState.x = this.obtainEscapeParam(textState);
      break;
    case "PY":
      textState.y = this.obtainEscapeParam(textState);
      break;
    case "FS":
      this.contents.fontSize = this.obtainEscapeParam(textState);
      break;
    case "{":
      this.makeFontBigger();
      break;
    case "}":
      this.makeFontSmaller();
      break;
  }
};

Window_Base.prototype.processColorChange = function (colorIndex) {
  this.changeTextColor(ColorManager.textColor(colorIndex));
};

Window_Base.prototype.processDrawIcon = function (iconIndex, textState) {
  if (textState.drawing !== false) {
    this.drawIcon(iconIndex, textState.x + 2, textState.y + 2);
  }
  textState.x += Window_Base._iconWidth + 4;
  // if (ImageManager && ImageManager.iconWidth) {
  //   textState.x += ImageManager.iconWidth + 4;
  // } else {
  //   textState.x += Window_Base._iconWidth + 4;
  // }
};

Window_Base.prototype.makeFontBigger = function () {
  if (this.contents.fontSize <= 96) {
    this.contents.fontSize += 12;
  }
};

Window_Base.prototype.makeFontSmaller = function () {
  if (this.contents.fontSize >= 24) {
    this.contents.fontSize -= 12;
  }
};

Window_Base.prototype.calcTextHeight = function (textState, all) {
  const lineSpacing = this.lineHeight() - $gameSystem.mainFontSize();
  var lastFontSize = this.contents.fontSize;
  var textHeight = 0;
  var lines = textState.text.slice(textState.index).split("\n");
  var maxLines = all ? lines.length : 1;

  for (var i = 0; i < maxLines; i++) {
    var maxFontSize = this.contents.fontSize;
    var regExp = /\x1b[\{\}]/g;
    for (;;) {
      var array = regExp.exec(lines[i]);
      if (array) {
        if (array[0] === "\x1b{") {
          this.makeFontBigger();
        }
        if (array[0] === "\x1b}") {
          this.makeFontSmaller();
        }
        if (maxFontSize < this.contents.fontSize) {
          maxFontSize = this.contents.fontSize;
        }
      } else {
        break;
      }
    }
    textHeight += maxFontSize + 8;
  }

  this.contents.fontSize = lastFontSize;
  return textHeight;
};

Window_Base.prototype.maxFontSizeInLine = function (line) {
  let maxFontSize = this.contents.fontSize;
  const regExp = /\x1b({|}|FS)(\[(\d+)])?/gi;
  for (;;) {
    const array = regExp.exec(line);
    if (!array) {
      break;
    }
    const code = String(array[1]).toUpperCase();
    if (code === "{") {
      this.makeFontBigger();
    } else if (code === "}") {
      this.makeFontSmaller();
    } else if (code === "FS") {
      this.contents.fontSize = parseInt(array[3]);
    }
    if (this.contents.fontSize > maxFontSize) {
      maxFontSize = this.contents.fontSize;
    }
  }
  return maxFontSize;
};

Window_Base.prototype.drawIcon = function (iconIndex, x, y) {
  var bitmap = ImageManager.loadSystem("IconSet");
  var pw = Window_Base._iconWidth; // [MZ]: ImageManager.iconWidth;
  var ph = Window_Base._iconHeight; // [MZ]: ImageManager.iconHeight;
  var sx = (iconIndex % 16) * pw;
  var sy = Math.floor(iconIndex / 16) * ph;
  this.contents.blt(bitmap, sx, sy, pw, ph, x, y);
};

Window_Base.prototype.drawFace = function (
  faceName,
  faceIndex,
  x,
  y,
  width,
  height
) {
  width = width || Window_Base._faceWidth; // [MZ]: ImageManager.faceWidth;
  height = height || Window_Base._faceHeight; // [MZ]: ImageManager.faceHeight;
  const bitmap = ImageManager.loadFace(faceName);
  const pw = Window_Base._faceWidth; // [MZ]: ImageManager.faceWidth;
  const ph = Window_Base._faceHeight; // [MZ]: ImageManager.faceHeight;
  const sw = Math.min(width, pw);
  const sh = Math.min(height, ph);
  const dx = Math.floor(x + Math.max(width - pw, 0) / 2);
  const dy = Math.floor(y + Math.max(height - ph, 0) / 2);
  const sx = (faceIndex % 4) * pw + (pw - sw) / 2;
  const sy = Math.floor(faceIndex / 4) * ph + (ph - sh) / 2;
  this.contents.blt(bitmap, sx, sy, sw, sh, dx, dy);
};

Window_Base.prototype.drawCharacter = function (
  characterName,
  characterIndex,
  x,
  y
) {
  const bitmap = ImageManager.loadCharacter(characterName);
  const big = ImageManager.isBigCharacter(characterName);
  const pw = bitmap.width / (big ? 3 : 12);
  const ph = bitmap.height / (big ? 4 : 8);
  const n = big ? 0 : characterIndex;
  const sx = ((n % 4) * 3 + 1) * pw;
  const sy = Math.floor(n / 4) * 4 * ph;
  this.contents.blt(bitmap, sx, sy, pw, ph, x - pw / 2, y - ph);
};

Window_Base.prototype.drawGauge = function (x, y, width, rate, color1, color2) {
  var fillW = Math.floor(width * rate);
  var gaugeY = y + this.lineHeight() - 8;
  this.contents.fillRect(x, gaugeY, width, 6, this.gaugeBackColor());
  this.contents.gradientFillRect(x, gaugeY, fillW, 6, color1, color2);
};

Window_Base.prototype.hpColor = function (actor) {
  if (actor.isDead()) {
    return this.deathColor();
  } else if (actor.isDying()) {
    return this.crisisColor();
  } else {
    return this.normalColor();
  }
};

Window_Base.prototype.mpColor = function (actor) {
  return this.normalColor();
};

Window_Base.prototype.tpColor = function (actor) {
  return this.normalColor();
};

Window_Base.prototype.drawActorCharacter = function (actor, x, y) {
  this.drawCharacter(actor.characterName(), actor.characterIndex(), x, y);
};

Window_Base.prototype.drawActorFace = function (actor, x, y, width, height) {
  this.drawFace(actor.faceName(), actor.faceIndex(), x, y, width, height);
};

Window_Base.prototype.drawActorName = function (actor, x, y, width) {
  width = width || 168;
  this.changeTextColor(this.hpColor(actor));
  this.drawText(actor.name(), x, y, width);
};

Window_Base.prototype.drawActorClass = function (actor, x, y, width) {
  width = width || 168;
  this.resetTextColor();
  this.drawText(actor.currentClass().name, x, y, width);
};

Window_Base.prototype.drawActorNickname = function (actor, x, y, width) {
  width = width || 270;
  this.resetTextColor();
  this.drawText(actor.nickname(), x, y, width);
};

Window_Base.prototype.drawActorLevel = function (actor, x, y) {
  this.changeTextColor(this.systemColor());
  this.drawText(TextManager.levelA, x, y, 48);
  this.resetTextColor();
  this.drawText(actor.level, x + 84, y, 36, "right");
};

Window_Base.prototype.drawActorIcons = function (actor, x, y, width) {
  width = width || 144;
  var icons = actor
    .allIcons()
    .slice(0, Math.floor(width / Window_Base._iconWidth));
  for (var i = 0; i < icons.length; i++) {
    this.drawIcon(icons[i], x + Window_Base._iconWidth * i, y + 2);
  }
};

Window_Base.prototype.drawCurrentAndMax = function (
  current,
  max,
  x,
  y,
  width,
  color1,
  color2
) {
  var labelWidth = this.textWidth("HP");
  var valueWidth = this.textWidth("0000");
  var slashWidth = this.textWidth("/");
  var x1 = x + width - valueWidth;
  var x2 = x1 - slashWidth;
  var x3 = x2 - valueWidth;
  if (x3 >= x + labelWidth) {
    this.changeTextColor(color1);
    this.drawText(current, x3, y, valueWidth, "right");
    this.changeTextColor(color2);
    this.drawText("/", x2, y, slashWidth, "right");
    this.drawText(max, x1, y, valueWidth, "right");
  } else {
    this.changeTextColor(color1);
    this.drawText(current, x1, y, valueWidth, "right");
  }
};

Window_Base.prototype.drawActorHp = function (actor, x, y, width) {
  width = width || 186;
  var color1 = this.hpGaugeColor1();
  var color2 = this.hpGaugeColor2();
  this.drawGauge(x, y, width, actor.hpRate(), color1, color2);
  this.changeTextColor(this.systemColor());
  this.drawText(TextManager.hpA, x, y, 44);
  this.drawCurrentAndMax(
    actor.hp,
    actor.mhp,
    x,
    y,
    width,
    this.hpColor(actor),
    this.normalColor()
  );
};

Window_Base.prototype.drawActorMp = function (actor, x, y, width) {
  width = width || 186;
  var color1 = this.mpGaugeColor1();
  var color2 = this.mpGaugeColor2();
  this.drawGauge(x, y, width, actor.mpRate(), color1, color2);
  this.changeTextColor(this.systemColor());
  this.drawText(TextManager.mpA, x, y, 44);
  this.drawCurrentAndMax(
    actor.mp,
    actor.mmp,
    x,
    y,
    width,
    this.mpColor(actor),
    this.normalColor()
  );
};

Window_Base.prototype.drawActorTp = function (actor, x, y, width) {
  width = width || 96;
  var color1 = this.tpGaugeColor1();
  var color2 = this.tpGaugeColor2();
  this.drawGauge(x, y, width, actor.tpRate(), color1, color2);
  this.changeTextColor(this.systemColor());
  this.drawText(TextManager.tpA, x, y, 44);
  this.changeTextColor(this.tpColor(actor));
  this.drawText(actor.tp, x + width - 64, y, 64, "right");
};

Window_Base.prototype.drawActorSimpleStatus = function (actor, x, y, width) {
  var lineHeight = this.lineHeight();
  var x2 = x + 180;
  var width2 = Math.min(200, width - 180 - this.textPadding());
  this.drawActorName(actor, x, y);
  this.drawActorLevel(actor, x, y + lineHeight * 1);
  this.drawActorIcons(actor, x, y + lineHeight * 2);
  this.drawActorClass(actor, x2, y);
  this.drawActorHp(actor, x2, y + lineHeight * 1, width2);
  this.drawActorMp(actor, x2, y + lineHeight * 2, width2);
};

Window_Base.prototype.drawItemName = function (item, x, y, width) {
  width = width || 312;
  if (item) {
    var iconBoxWidth = Window_Base._iconWidth + 4;
    this.resetTextColor();
    this.drawIcon(item.iconIndex, x + 2, y + 2);
    this.drawText(item.name, x + iconBoxWidth, y, width - iconBoxWidth);
  }
};

Window_Base.prototype.drawCurrencyValue = function (value, unit, x, y, width) {
  const unitWidth = Math.min(80, this.textWidth(unit));
  this.resetTextColor();
  this.drawText(value, x, y, width - unitWidth - 6, "right");
  this.changeTextColor(this.systemColor()); // ColorManager.systemColor()
  this.drawText(unit, x + width - unitWidth, y, unitWidth, "right");
};

Window_Base.prototype.paramchangeTextColor = function (change) {
  if (change > 0) {
    return this.powerUpColor();
  } else if (change < 0) {
    return this.powerDownColor();
  } else {
    return this.normalColor();
  }
};

Window_Base.prototype.setBackgroundType = function (type) {
  if (type === 0) {
    this.opacity = 255;
  } else {
    this.opacity = 0;
  }
  if (type === 1) {
    this.showBackgroundDimmer();
  } else {
    this.hideBackgroundDimmer();
  }
};

Window_Base.prototype.showBackgroundDimmer = function () {
  if (!this._dimmerSprite) {
    this._dimmerSprite = new Sprite(); // [MZ]: this.createDimmerSprite();
    this._dimmerSprite.bitmap = new Bitmap(0, 0);
    this.addChildToBack(this._dimmerSprite);
  }
  const bitmap = this._dimmerSprite.bitmap;
  if (bitmap.width !== this.width || bitmap.height !== this.height) {
    this.refreshDimmerBitmap();
  }
  this._dimmerSprite.visible = true;
  this.updateBackgroundDimmer();
};

Window_Base.prototype.createDimmerSprite = function () {
  this._dimmerSprite = new Sprite();
  this._dimmerSprite.bitmap = new Bitmap(0, 0);
  this._dimmerSprite.x = -4;
  this.addChildToBack(this._dimmerSprite);
};

Window_Base.prototype.hideBackgroundDimmer = function () {
  if (this._dimmerSprite) {
    this._dimmerSprite.visible = false;
  }
};

Window_Base.prototype.updateBackgroundDimmer = function () {
  if (this._dimmerSprite) {
    this._dimmerSprite.opacity = this.openness;
  }
};

Window_Base.prototype.refreshDimmerBitmap = function () {
  if (this._dimmerSprite) {
    const bitmap = this._dimmerSprite.bitmap;
    const w = this.width > 0 ? this.width /* + 8 */ : 0;
    const h = this.height;
    const m = this.padding;
    const c1 = this.dimColor1(); // ColorManager.dimColor1();
    const c2 = this.dimColor2(); // ColorManager.dimColor2();
    bitmap.resize(w, h);
    bitmap.gradientFillRect(0, 0, w, m, c2, c1, true);
    bitmap.fillRect(0, m, w, h - m * 2, c1);
    bitmap.gradientFillRect(0, h - m, w, m, c1, c2, true);
    this._dimmerSprite.setFrame(0, 0, w, h);
  }
};

Window_Base.prototype.dimColor1 = function () {
  return "rgba(0, 0, 0, 0.6)";
};

Window_Base.prototype.dimColor2 = function () {
  return "rgba(0, 0, 0, 0)";
};

Window_Base.prototype.canvasToLocalX = function (x) {
  var node = this;
  while (node) {
    x -= node.x;
    node = node.parent;
  }
  return x;
};

Window_Base.prototype.canvasToLocalY = function (y) {
  var node = this;
  while (node) {
    y -= node.y;
    node = node.parent;
  }
  return y;
};

Window_Base.prototype.reserveFaceImages = function () {
  $gameParty.members().forEach(function (actor) {
    ImageManager.reserveFace(actor.faceName());
  }, this);
};

Window_Base.prototype.playCursorSound = function () {
  SoundManager.playCursor();
};

Window_Base.prototype.playOkSound = function () {
  SoundManager.playOk();
};

Window_Base.prototype.playBuzzerSound = function () {
  SoundManager.playBuzzer();
};
