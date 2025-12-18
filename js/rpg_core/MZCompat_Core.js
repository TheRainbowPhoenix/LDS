//-----------------------------------------------------------------------------
// MZ Core Compatibility
//
// Adds lightweight shims so MZ plugins can coexist with MV code.

if (typeof Main === "undefined") {
  function Main() {}
}

Main.prototype.eraseLoadingSpinner = function () {
  var spinner = document.getElementById("loadingSpinner");
  if (spinner && spinner.parentNode) {
    spinner.parentNode.removeChild(spinner);
  }
  if (Graphics._loadingSpinner && Graphics._loadingSpinner.parentNode) {
    Graphics._loadingSpinner.parentNode.removeChild(Graphics._loadingSpinner);
  }
};

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

// Loading spinner helper for MZ-style plugins
if (typeof Graphics._createLoadingSpinner !== "function") {
  Graphics._createLoadingSpinner = function () {
    var spinner = document.createElement("div");
    spinner.id = "loadingSpinner";
    spinner.style.display = "none";
    spinner.style.width = "60px";
    spinner.style.height = "60px";
    spinner.style.border = "8px solid #f3f3f3";
    spinner.style.borderTop = "8px solid #555";
    spinner.style.borderRadius = "50%";
    spinner.style.position = "absolute";
    spinner.style.left = "50%";
    spinner.style.top = "50%";
    spinner.style.transform = "translate(-50%, -50%)";
    spinner.style.boxSizing = "border-box";
    spinner.style.zIndex = 99;
    spinner.style.animation = "spin 1s linear infinite";
    document.body.appendChild(spinner);
    Graphics._loadingSpinner = spinner;
  };
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

  if (!Object.getOwnPropertyDescriptor(Window.prototype, "_pauseSignSprite")) {
    Object.defineProperty(Window.prototype, "_pauseSignSprite", {
      get: function () {
        return this._windowPauseSignSprite;
      },
      set: function (value) {
        this._windowPauseSignSprite = value;
      },
      configurable: true,
    });
  }
}
