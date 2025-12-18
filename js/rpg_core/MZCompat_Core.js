//-----------------------------------------------------------------------------
// MZ Core Compatibility
//
// Adds lightweight shims so MZ plugins can coexist with MV code.

if (typeof Main === "undefined") {
  function Main() {}
}

// TouchInput hover helper (noop but prevents plugin crashes)
if (typeof TouchInput.isHovered !== "function") {
  TouchInput.isHovered = function () {
    return false;
  };
}

// Tilemap.Layer alias used by some plugins to tweak rendering
if (typeof Tilemap !== "undefined" && !Tilemap.Layer) {
  Tilemap.Layer = PIXI.Container;
}

// Window compatibility: frameVisible and _frameSprite alias to MZ naming
if (typeof Window !== "undefined") {
  if (!Object.getOwnPropertyDescriptor(Window.prototype, "frameVisible")) {
    Object.defineProperty(Window.prototype, "frameVisible", {
      get: function () {
        return this._windowFrameSprite ? this._windowFrameSprite.visible : true;
      },
      set: function (value) {
        if (this._windowFrameSprite) {
          this._windowFrameSprite.visible = value;
        }
      },
      configurable: true,
    });
  }

  if (!Object.getOwnPropertyDescriptor(Window.prototype, "_frameSprite")) {
    Object.defineProperty(Window.prototype, "_frameSprite", {
      get: function () {
        return this._windowFrameSprite;
      },
      set: function (value) {
        this._windowFrameSprite = value;
      },
      configurable: true,
    });
  }
}
