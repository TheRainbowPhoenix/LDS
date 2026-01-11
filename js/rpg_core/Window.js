//-----------------------------------------------------------------------------
/**
 * The window in the game.
 *
 * @class Window
 * @constructor
 */
function Window() {
  this.initialize.apply(this, arguments);
}

Window.prototype = Object.create(PIXI.Container.prototype);
Window.prototype.constructor = Window;

Window.prototype.initialize = function () {
  var baseInstance = new PIXI.Container();
  // Copy only non-function properties to avoid shadowing prototype methods
  for (var key in baseInstance) {
    if (baseInstance.hasOwnProperty(key) && typeof baseInstance[key] !== 'function') {
      this[key] = baseInstance[key];
    }
  }
  // Ensure we have the PIXI.Container's core internals
  if (baseInstance.children) this.children = baseInstance.children;
  if (baseInstance.parent !== undefined) this.parent = baseInstance.parent;
  if (baseInstance.transform) this.transform = baseInstance.transform;
  if (baseInstance.worldAlpha !== undefined) this.worldAlpha = baseInstance.worldAlpha;
  if (baseInstance._bounds) this._bounds = baseInstance._bounds;

  this._isWindow = true;
  this._windowskin = null;
  this._width = 0;
  this._height = 0;
  this._cursorRect = new Rectangle();
  this._openness = 255;
  this._animationCount = 0;

  this._padding = 18; // 12 on MZ
  this._margin = 4;
  this._colorTone = [0, 0, 0, 0]; // [MV] = [0, 0, 0]
  this._innerChildren = [];

  this._windowSpriteContainer = null;
  this._windowBackSprite = null;
  this._windowCursorSprite = null;
  this._windowFrameSprite = null;
  this._windowContentsSprite = null;
  this._windowArrowSprites = [];
  this._windowPauseSignSprite = null;
  this._contentsBackSprite = null;
  this._clientArea = null;

  // Container + main sprites
  aliasProp(Window.prototype, "_container", "_windowSpriteContainer");
  aliasProp(Window.prototype, "_backSprite", "_windowBackSprite");
  aliasProp(Window.prototype, "_frameSprite", "_windowFrameSprite");
  aliasProp(Window.prototype, "_cursorSprite", "_windowCursorSprite");
  aliasProp(Window.prototype, "_contentsSprite", "_windowContentsSprite");
  aliasProp(Window.prototype, "_pauseSignSprite", "_windowPauseSignSprite");

  this._createAllParts();

  /**
   * The origin point of the window for scrolling.
   *
   * @property origin
   * @type Point
   */
  this.origin = new Point();

  /**
   * The active state for the window.
   *
   * @property active
   * @type Boolean
   */
  this.active = true;

  /**
   * The visibility of the frame.
   *
   * @type boolean
   */
  this.frameVisible = true;

  /**
   * The visibility of the cursor.
   *
   * @type boolean
   */
  this.cursorVisible = true;

  /**
   * The visibility of the down scroll arrow.
   *
   * @property downArrowVisible
   * @type Boolean
   */
  this.downArrowVisible = false;

  /**
   * The visibility of the up scroll arrow.
   *
   * @property upArrowVisible
   * @type Boolean
   */
  this.upArrowVisible = false;

  /**
   * The visibility of the pause sign.
   *
   * @property pause
   * @type Boolean
   */
  this.pause = false;
};

/**
 * The image used as a window skin.
 *
 * @property windowskin
 * @type Bitmap
 */
Object.defineProperty(Window.prototype, "windowskin", {
  get: function () {
    return this._windowskin;
  },
  set: function (value) {
    if (this._windowskin !== value) {
      this._windowskin = value;
      this._windowskin.addLoadListener(this._onWindowskinLoad.bind(this));
    }
  },
  configurable: true,
});

/**
 * The bitmap used for the window contents.
 *
 * @property contents
 * @type Bitmap
 */
Object.defineProperty(Window.prototype, "contents", {
  get: function () {
    return this._windowContentsSprite.bitmap;
  },
  set: function (value) {
    this._windowContentsSprite.bitmap = value;
  },
  configurable: true,
});

/**
 * The bitmap used for the window contents background.
 *
 * @type Bitmap
 * @name Window#contentsBack
 */
Object.defineProperty(Window.prototype, "contentsBack", {
  get: function () {
    return this._contentsBackSprite && this._contentsBackSprite.bitmap;
  },
  set: function (value) {
    if (this._contentsBackSprite) {
      this._contentsBackSprite.bitmap = value;
    }
  },
  configurable: true,
});

/**
 * The width of the window in pixels.
 *
 * @property width
 * @type Number
 */
Object.defineProperty(Window.prototype, "width", {
  get: function () {
    return this._width;
  },
  set: function (value) {
    this._width = value;
    this._refreshAllParts();
  },
  configurable: true,
});

/**
 * The height of the window in pixels.
 *
 * @property height
 * @type Number
 */
Object.defineProperty(Window.prototype, "height", {
  get: function () {
    return this._height;
  },
  set: function (value) {
    this._height = value;
    this._refreshAllParts();
  },
  configurable: true,
});

/**
 * The size of the padding between the frame and contents.
 *
 * @property padding
 * @type Number
 */
Object.defineProperty(Window.prototype, "padding", {
  get: function () {
    return this._padding;
  },
  set: function (value) {
    this._padding = value;
    this._refreshAllParts();
  },
  configurable: true,
});

/**
 * The size of the margin for the window background.
 *
 * @property margin
 * @type Number
 */
Object.defineProperty(Window.prototype, "margin", {
  get: function () {
    return this._margin;
  },
  set: function (value) {
    this._margin = value;
    this._refreshAllParts();
  },
  configurable: true,
});

/**
 * The opacity of the window without contents (0 to 255).
 *
 * @property opacity
 * @type Number
 */
Object.defineProperty(Window.prototype, "opacity", {
  get: function () {
    return this._windowSpriteContainer.alpha * 255;
  },
  set: function (value) {
    this._windowSpriteContainer.alpha = value.clamp(0, 255) / 255;
  },
  configurable: true,
});

/**
 * The opacity of the window background (0 to 255).
 *
 * @property backOpacity
 * @type Number
 */
Object.defineProperty(Window.prototype, "backOpacity", {
  get: function () {
    return this._windowBackSprite.alpha * 255;
  },
  set: function (value) {
    this._windowBackSprite.alpha = value.clamp(0, 255) / 255;
  },
  configurable: true,
});

/**
 * The opacity of the window contents (0 to 255).
 *
 * @property contentsOpacity
 * @type Number
 */
Object.defineProperty(Window.prototype, "contentsOpacity", {
  get: function () {
    return this._windowContentsSprite.alpha * 255;
  },
  set: function (value) {
    this._windowContentsSprite.alpha = value.clamp(0, 255) / 255;
  },
  configurable: true,
});

/**
 * The openness of the window (0 to 255).
 *
 * @property openness
 * @type Number
 */
Object.defineProperty(Window.prototype, "openness", {
  get: function () {
    return this._openness;
  },
  set: function (value) {
    if (this._openness !== value) {
      this._openness = value.clamp(0, 255);
      this._windowSpriteContainer.scale.y = this._openness / 255;
      this._windowSpriteContainer.y =
        (this.height / 2) * (1 - this._openness / 255);
    }
  },
  configurable: true,
});

/**
 * The width of the content area in pixels.
 *
 * @readonly
 * @type number
 * @name Window#innerWidth
 */
Object.defineProperty(Window.prototype, "innerWidth", {
  get: function () {
    return Math.max(0, this._width - this._padding * 2);
  },
  configurable: true,
});

/**
 * The height of the content area in pixels.
 *
 * @readonly
 * @type number
 * @name Window#innerHeight
 */
Object.defineProperty(Window.prototype, "innerHeight", {
  get: function () {
    return Math.max(0, this._height - this._padding * 2);
  },
  configurable: true,
});

/**
 * The rectangle of the content area.
 *
 * @readonly
 * @type Rectangle
 * @name Window#innerRect
 */
Object.defineProperty(Window.prototype, "innerRect", {
  get: function () {
    return new Rectangle(
      this._padding,
      this._padding,
      this.innerWidth,
      this.innerHeight
    );
  },
  configurable: true,
});

/**
 * Destroys the window.
 */
Window.prototype.destroy = function () {
  const options = { children: true, texture: true };
  // PIXI.Container.prototype.destroy.call(this, options);
};

if (!Object.getOwnPropertyDescriptor(Window.prototype, "_downArrowSprite")) {
  Object.defineProperty(Window.prototype, "_downArrowSprite", {
    get: function () {
      return this._windowArrowSprites && this._windowArrowSprites[0];
    },
    set: function (v) {
      this._windowArrowSprites = this._windowArrowSprites || [];
      this._windowArrowSprites[0] = v;
    },
    configurable: true,
  });
}

if (!Object.getOwnPropertyDescriptor(Window.prototype, "_upArrowSprite")) {
  Object.defineProperty(Window.prototype, "_upArrowSprite", {
    get: function () {
      return this._windowArrowSprites && this._windowArrowSprites[1];
    },
    set: function (v) {
      this._windowArrowSprites = this._windowArrowSprites || [];
      this._windowArrowSprites[1] = v;
    },
    configurable: true,
  });
}

/**
 * Updates the window for each frame.
 *
 * @method update
 */
Window.prototype.update = function () {
  if (this.active) {
    this._animationCount++;
  }
  this.children.forEach(function (child) {
    if (child.update) {
      child.update();
    }
  });
};

/**
 * Sets the x, y, width, and height all at once.
 *
 * @method move
 * @param {Number} x The x coordinate of the window
 * @param {Number} y The y coordinate of the window
 * @param {Number} width The width of the window
 * @param {Number} height The height of the window
 */
Window.prototype.move = function (x, y, width, height) {
  this.x = x || 0;
  this.y = y || 0;
  if (this._width !== width || this._height !== height) {
    this._width = width || 0;
    this._height = height || 0;
    this._refreshAllParts();
  }
};

/**
 * Returns true if the window is completely open (openness == 255).
 *
 * @method isOpen
 */
Window.prototype.isOpen = function () {
  return this._openness >= 255;
};

/**
 * Returns true if the window is completely closed (openness == 0).
 *
 * @method isClosed
 */
Window.prototype.isClosed = function () {
  return this._openness <= 0;
};

/**
 * Sets the position of the command cursor.
 *
 * @method setCursorRect
 * @param {Number} x The x coordinate of the cursor
 * @param {Number} y The y coordinate of the cursor
 * @param {Number} width The width of the cursor
 * @param {Number} height The height of the cursor
 */
Window.prototype.setCursorRect = function (x, y, width, height) {
  var cx = Math.floor(x || 0);
  var cy = Math.floor(y || 0);
  var cw = Math.floor(width || 0);
  var ch = Math.floor(height || 0);
  var rect = this._cursorRect;
  if (
    rect.x !== cx ||
    rect.y !== cy ||
    rect.width !== cw ||
    rect.height !== ch
  ) {
    this._cursorRect.x = cx;
    this._cursorRect.y = cy;
    this._cursorRect.width = cw;
    this._cursorRect.height = ch;
    this._refreshCursor();
  }
};

/**
 * Moves the cursor position by the given amount (MZ compatibility).
 *
 * @param {Number} x
 * @param {Number} y
 */
Window.prototype.moveCursorBy = function (x, y) {
  this._cursorRect.x += x;
  this._cursorRect.y += y;
};

/**
 * Moves inner children by the given amount (MZ compatibility).
 *
 * @param {Number} x
 * @param {Number} y
 */
Window.prototype.moveInnerChildrenBy = function (x, y) {
  for (var i = 0; i < this._innerChildren.length; i++) {
    var child = this._innerChildren[i];
    child.x += x;
    child.y += y;
  }
};

/**
 * Changes the color of the background.
 *
 * @method setTone
 * @param {Number} r The red value in the range (-255, 255)
 * @param {Number} g The green value in the range (-255, 255)
 * @param {Number} b The blue value in the range (-255, 255)
 */
Window.prototype.setTone = function (r, g, b) {
  var tone = this._colorTone;
  if (r !== tone[0] || g !== tone[1] || b !== tone[2]) {
    this._colorTone = [r, g, b, tone[3] || 0];
    this._refreshBack();
  }
};

/**
 * Adds a child between the background and contents.
 *
 * @method addChildToBack
 * @param {Object} child The child to add
 * @return {Object} The child that was added
 */
Window.prototype.addChildToBack = function (child) {
  var containerIndex = this.children.indexOf(this._windowSpriteContainer);
  return this.addChildAt(child, containerIndex + 1);
};

/**
 * Adds a child to the inner client area (MZ compatibility).
 *
 * @method addInnerChild
 * @param {Object} child The child to add
 * @return {Object} The child that was added
 */
Window.prototype.addInnerChild = function (child) {
  if (this._innerChildren.indexOf(child) === -1) {
    this._innerChildren.push(child);
  }
  return this._clientArea.addChild(child);
};

/**
 * @method updateTransform
 * @private
 */
Window.prototype.updateTransform = function () {
  this._updateClientArea();
  this._updateFrame();
  this._updateContentsBack();
  this._updateCursor();
  this._updateContents();
  this._updateArrows();
  this._updatePauseSign();
  PIXI.Container.prototype.updateTransform.call(this);
  this._updateFilterArea();
};

Window.prototype.drawShape = function (graphics) {
  if (graphics) {
    const width = this.width;
    const height = (this.height * this._openness) / 255;
    const x = this.x;
    const y = this.y + (this.height - height) / 2;
    graphics.beginFill(0xffffff);
    graphics.drawRoundedRect(x, y, width, height, 0);
    graphics.endFill();
  }
};

/**
 * @method _createAllParts
 * @private
 */
Window.prototype._createAllParts = function () {
  this._createContainer();
  this._createBackSprite();
  this._createFrameSprite();
  this._createClientArea();
  this._createContentsBackSprite();
  this._createCursorSprite();
  this._createContentsSprite();
  this._createArrowSprites();
  this._createPauseSignSprite();
};

Window.prototype._createContainer = function () {
  // MV internal
  this._windowSpriteContainer = new PIXI.Container();
  this.addChild(this._windowSpriteContainer);
};

Window.prototype._createBackSprite = function () {
  // MV internal: simple Sprite with 1x1 bitmap, alpha 192/255
  this._windowBackSprite = new Sprite();
  this._windowBackSprite.bitmap = new Bitmap(1, 1);
  this._windowBackSprite.alpha = 192 / 255;
  this._windowSpriteContainer.addChild(this._windowBackSprite);
};

Window.prototype._createFrameSprite = function () {
  // MV internal: single sprite (MV draws frame into bitmap elsewhere)
  this._windowFrameSprite = new Sprite();
  this._windowSpriteContainer.addChild(this._windowFrameSprite);
};

Window.prototype._createClientArea = function () {
  this._clientArea = new Sprite();

  // IMPORTANT: AlphaFilter clipping is optional.
  // If you keep it, you MUST keep filterArea sized, otherwise contents can vanish.
  const hasAlphaFilter = PIXI.filters && PIXI.filters.AlphaFilter;
  if (hasAlphaFilter && false) {
    // FIXME: alpha bug ??
    this._clientArea.filters = [new PIXI.filters.AlphaFilter()];
    this._clientArea.filterArea = new Rectangle();
  } else {
    this._clientArea.filters = null;
    this._clientArea.filterArea = null;
  }

  // Use MV-safe padding value
  const pad = this.padding != null ? this.padding : this._padding || 0;
  this._clientArea.move(pad, pad);

  this.addChild(this._clientArea);
};

Window.prototype._createContentsBackSprite = function () {
  this._contentsBackSprite = new Sprite();
  this._clientArea.addChild(this._contentsBackSprite);
};

Window.prototype._createCursorSprite = function () {
  this._windowCursorSprite = new Sprite();
  this._clientArea.addChild(this._windowCursorSprite);
};

Window.prototype._createContentsSprite = function () {
  this._windowContentsSprite = new Sprite();
  this._clientArea.addChild(this._windowContentsSprite);
};

Window.prototype._createArrowSprites = function () {
  this._downArrowSprite = new Sprite();
  this.addChild(this._downArrowSprite);

  this._upArrowSprite = new Sprite();
  this.addChild(this._upArrowSprite);
};

Window.prototype._createPauseSignSprite = function () {
  this._windowPauseSignSprite = new Sprite();
  this.addChild(this._windowPauseSignSprite);
};

Window.prototype.OLD_createAllParts = function () {
  this._windowSpriteContainer = new PIXI.Container();
  this._windowBackSprite = new Sprite();
  this._windowCursorSprite = new Sprite();
  this._windowFrameSprite = new Sprite();
  this._windowContentsSprite = new Sprite();
  this._contentsBackSprite = new Sprite();
  this._downArrowSprite = new Sprite();
  this._upArrowSprite = new Sprite();
  this._windowPauseSignSprite = new Sprite();
  this._windowBackSprite.bitmap = new Bitmap(1, 1);
  this._windowBackSprite.alpha = 192 / 255;
  this._clientArea = new Sprite();
  var alphaFilter =
    PIXI.filters && PIXI.filters.AlphaFilter
      ? new PIXI.filters.AlphaFilter()
      : null;
  this._clientArea.filters = alphaFilter ? [alphaFilter] : null;
  this._clientArea.filterArea = alphaFilter ? new Rectangle() : null;

  this.addChild(this._windowSpriteContainer);
  this._windowSpriteContainer.addChild(this._windowBackSprite);
  this._windowSpriteContainer.addChild(this._windowFrameSprite);
  this.addChild(this._clientArea);
  this._clientArea.addChild(this._contentsBackSprite);
  this._clientArea.addChild(this._windowCursorSprite);
  this._clientArea.addChild(this._windowContentsSprite);
  this.addChild(this._downArrowSprite);
  this.addChild(this._upArrowSprite);
  this.addChild(this._windowPauseSignSprite);

  // MZ aliases for compatibility
  // this._container = this._windowSpriteContainer;
  // this._backSprite = this._windowBackSprite;
  // this._frameSprite = this._windowFrameSprite;
  // this._cursorSprite = this._windowCursorSprite;
  // this._contentsSprite = this._windowContentsSprite;
  // this._pauseSignSprite = this._windowPauseSignSprite;
};

/**
 * @method _onWindowskinLoad
 * @private
 */
Window.prototype._onWindowskinLoad = function () {
  this._refreshAllParts();
};

/**
 * @method _refreshAllParts
 * @private
 */
Window.prototype._refreshAllParts = function () {
  this._refreshBack();
  this._refreshFrame();
  this._refreshCursor();
  this._refreshContents();
  this._refreshArrows();
  this._refreshPauseSign();
};

/**
 * @method _refreshBack
 * @private
 */
Window.prototype._refreshBack = function () {
  var m = this._margin;
  var w = this._width - m * 2;
  var h = this._height - m * 2;
  var bitmap = new Bitmap(w, h);

  this._windowBackSprite.bitmap = bitmap;
  this._windowBackSprite.setFrame(0, 0, w, h);
  this._windowBackSprite.move(m, m);

  if (w > 0 && h > 0 && this._windowskin) {
    var p = 96;
    bitmap.blt(this._windowskin, 0, 0, p, p, 0, 0, w, h);
    for (var y = 0; y < h; y += p) {
      for (var x = 0; x < w; x += p) {
        bitmap.blt(this._windowskin, 0, p, p, p, x, y, p, p);
      }
    }
    var tone = this._colorTone;
    bitmap.adjustTone(tone[0], tone[1], tone[2]);
  }
};

/**
 * @method _refreshFrame
 * @private
 */
Window.prototype._refreshFrame = function () {
  var w = this._width;
  var h = this._height;
  var m = 24;
  var bitmap = new Bitmap(w, h);

  this._windowFrameSprite.bitmap = bitmap;
  this._windowFrameSprite.setFrame(0, 0, w, h);

  if (w > 0 && h > 0 && this._windowskin) {
    var skin = this._windowskin;
    var p = 96;
    var q = 96;
    bitmap.blt(skin, p + m, 0 + 0, p - m * 2, m, m, 0, w - m * 2, m);
    bitmap.blt(skin, p + m, 0 + q - m, p - m * 2, m, m, h - m, w - m * 2, m);
    bitmap.blt(skin, p + 0, 0 + m, m, p - m * 2, 0, m, m, h - m * 2);
    bitmap.blt(skin, p + q - m, 0 + m, m, p - m * 2, w - m, m, m, h - m * 2);
    bitmap.blt(skin, p + 0, 0 + 0, m, m, 0, 0, m, m);
    bitmap.blt(skin, p + q - m, 0 + 0, m, m, w - m, 0, m, m);
    bitmap.blt(skin, p + 0, 0 + q - m, m, m, 0, h - m, m, m);
    bitmap.blt(skin, p + q - m, 0 + q - m, m, m, w - m, h - m, m, m);
  }
};

/**
 * @method _refreshCursor
 * @private
 */
Window.prototype._refreshCursor = function () {
  var w = this._cursorRect.width;
  var h = this._cursorRect.height;
  var m = 4;
  var bitmap = new Bitmap(w, h);

  this._windowCursorSprite.bitmap = bitmap;

  if (w > 0 && h > 0 && this._windowskin) {
    var skin = this._windowskin;
    var p = 96;
    var q = 48;
    bitmap.blt(
      skin,
      p + m,
      p + m,
      q - m * 2,
      q - m * 2,
      m,
      m,
      w - m * 2,
      h - m * 2
    );
    bitmap.blt(skin, p + m, p + 0, q - m * 2, m, m, 0, w - m * 2, m);
    bitmap.blt(skin, p + m, p + q - m, q - m * 2, m, m, h - m, w - m * 2, m);
    bitmap.blt(skin, p + 0, p + m, m, q - m * 2, 0, m, m, h - m * 2);
    bitmap.blt(skin, p + q - m, p + m, m, q - m * 2, w - m, m, m, h - m * 2);
    bitmap.blt(skin, p + 0, p + 0, m, m, 0, 0, m, m);
    bitmap.blt(skin, p + q - m, p + 0, m, m, w - m, 0, m, m);
    bitmap.blt(skin, p + 0, p + q - m, m, m, 0, h - m, m, m);
    bitmap.blt(skin, p + q - m, p + q - m, m, m, w - m, h - m, m, m);
  }
  this._updateCursorPos();
};

/**
 * @method _refreshContents
 * @private
 */
Window.prototype._refreshContents = function () {
  var pad = this.padding != null ? this.padding : this._padding;
  if (this._clientArea) {
    this._clientArea.move(pad, pad);
  }
  if (this._contentsBackSprite) {
    this._contentsBackSprite.move(0, 0);
  }
  this._windowContentsSprite.move(0, 0);
};

/**
 * @method _refreshArrows
 * @private
 */
Window.prototype._refreshArrows = function () {
  var w = this._width;
  var h = this._height;
  var p = 24;
  var q = p / 2;
  var sx = 96 + p;
  var sy = 0 + p;
  this._downArrowSprite.bitmap = this._windowskin;
  this._downArrowSprite.anchor.x = 0.5;
  this._downArrowSprite.anchor.y = 0.5;
  this._downArrowSprite.setFrame(sx + q, sy + q + p, p, q);
  this._downArrowSprite.move(w / 2, h - q);
  this._upArrowSprite.bitmap = this._windowskin;
  this._upArrowSprite.anchor.x = 0.5;
  this._upArrowSprite.anchor.y = 0.5;
  this._upArrowSprite.setFrame(sx + q, sy, p, q);
  this._upArrowSprite.move(w / 2, q);
};

/**
 * @method _refreshPauseSign
 * @private
 */
Window.prototype._refreshPauseSign = function () {
  var sx = 144;
  var sy = 96;
  var p = 24;
  this._windowPauseSignSprite.bitmap = this._windowskin;
  this._windowPauseSignSprite.anchor.x = 0.5;
  this._windowPauseSignSprite.anchor.y = 1;
  this._windowPauseSignSprite.move(this._width / 2, this._height);
  this._windowPauseSignSprite.setFrame(sx, sy, p, p);
  this._windowPauseSignSprite.alpha = 0;
};

Window.prototype._updateClientArea = function () {
  if (this._clientArea) {
    var pad = this.padding != null ? this.padding : this._padding;
    this._clientArea.move(pad, pad);
    this._clientArea.visible = this.isOpen();
  }
};

Window.prototype._updateFrame = function () {
  if (this._frameSprite) {
    this._frameSprite.visible = this.frameVisible;
  } else if (this._windowFrameSprite) {
    this._windowFrameSprite.visible = this.frameVisible;
  }
};

Window.prototype._updateContentsBack = function () {
  if (this._contentsBackSprite) {
    var bitmap = this._contentsBackSprite.bitmap;
    if (bitmap) {
      this._contentsBackSprite.setFrame(0, 0, bitmap.width, bitmap.height);
      this._contentsBackSprite.visible = this.isOpen();
    } else {
      this._contentsBackSprite.visible = false;
    }
  }
};

/**
 * @method _updateCursor
 * @private
 */
Window.prototype._updateCursor = function () {
  var blinkCount = this._animationCount % 40;
  var cursorOpacity = this.contentsOpacity;
  if (this.active) {
    if (blinkCount < 20) {
      cursorOpacity -= blinkCount * 8;
    } else {
      cursorOpacity -= (40 - blinkCount) * 8;
    }
  }
  this._windowCursorSprite.alpha = cursorOpacity / 255;
  this._windowCursorSprite.visible = this.isOpen() && this.cursorVisible;
  this._updateCursorPos();
};

Window.prototype._updateCursorPos = function () {
  var pad = this.padding != null ? this.padding : this._padding;
  var x = this._cursorRect.x - this.origin.x;
  var y = this._cursorRect.y - this.origin.y;
  var w = this._cursorRect.width;
  var h = this._cursorRect.height;
  var x2 = Math.max(x, 0);
  var y2 = Math.max(y, 0);
  var ox = x2 - x;
  var oy = y2 - y;
  var wLimit = Math.max(0, this._width - pad * 2 - x2);
  var hLimit = Math.max(0, this._height - pad * 2 - y2);
  var w2 = Math.max(0, Math.min(w, wLimit));
  var h2 = Math.max(0, Math.min(h, hLimit));

  this._windowCursorSprite.setFrame(ox, oy, w2, h2);
  this._windowCursorSprite.move(x2, y2);
};

Window.prototype._makeCursorAlpha = function () {
  const blinkCount = this._animationCount % 40;
  const baseAlpha = this.contentsOpacity / 255;
  if (this.active) {
    if (blinkCount < 20) {
      return baseAlpha - blinkCount / 32;
    } else {
      return baseAlpha - (40 - blinkCount) / 32;
    }
  }
  return baseAlpha;
};

/**
 * @method _updateContents
 * @private
 */
Window.prototype._updateContents = function () {
  var pad = this.padding != null ? this.padding : this._padding;
  var w = this._width - pad * 2;
  var h = this._height - pad * 2;
  if (w > 0 && h > 0) {
    this._windowContentsSprite.setFrame(this.origin.x, this.origin.y, w, h);
    this._windowContentsSprite.visible = this.isOpen();
  } else {
    this._windowContentsSprite.visible = false;
  }
};

/**
 * @method _updateArrows
 * @private
 */
Window.prototype._updateArrows = function () {
  this._downArrowSprite.visible = this.isOpen() && this.downArrowVisible;
  this._upArrowSprite.visible = this.isOpen() && this.upArrowVisible;
};

/**
 * @method _updatePauseSign
 * @private
 */
Window.prototype._updatePauseSign = function () {
  var sprite = this._windowPauseSignSprite;
  var x = Math.floor(this._animationCount / 16) % 2;
  var y = Math.floor(this._animationCount / 16 / 2) % 2;
  var sx = 144;
  var sy = 96;
  var p = 24;
  if (!this.pause) {
    sprite.alpha = 0;
  } else if (sprite.alpha < 1) {
    sprite.alpha = Math.min(sprite.alpha + 0.1, 1);
  }
  sprite.setFrame(sx + x * p, sy + y * p, p, p);
  sprite.visible = this.isOpen();
};

Window.prototype._updateFilterArea = function () {
  if (this._clientArea && this._clientArea.filterArea) {
    var pad = this.padding != null ? this.padding : this._padding;
    var w = this.width - pad * 2;
    var h = this.height - pad * 2;
    this._clientArea.filterArea.x = this.x + pad;
    this._clientArea.filterArea.y = this.y + pad;
    this._clientArea.filterArea.width = Math.max(0, w);
    this._clientArea.filterArea.height = Math.max(0, h);
  }
};

// The important members from Pixi.js

/**
 * The visibility of the window.
 *
 * @property visible
 * @type Boolean
 */

/**
 * The x coordinate of the window.
 *
 * @property x
 * @type Number
 */

/**
 * The y coordinate of the window.
 *
 * @property y
 * @type Number
 */

/**
 * [read-only] The array of children of the window.
 *
 * @property children
 * @type Array
 */

/**
 * [read-only] The object that contains the window.
 *
 * @property parent
 * @type Object
 */

/**
 * Adds a child to the container.
 *
 * @method addChild
 * @param {Object} child The child to add
 * @return {Object} The child that was added
 */

/**
 * Adds a child to the container at a specified index.
 *
 * @method addChildAt
 * @param {Object} child The child to add
 * @param {Number} index The index to place the child in
 * @return {Object} The child that was added
 */

/**
 * Removes a child from the container.
 *
 * @method removeChild
 * @param {Object} child The child to remove
 * @return {Object} The child that was removed
 */

/**
 * Removes a child from the specified index position.
 *
 * @method removeChildAt
 * @param {Number} index The index to get the child from
 * @return {Object} The child that was removed
 */
