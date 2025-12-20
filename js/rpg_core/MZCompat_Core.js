//-----------------------------------------------------------------------------
// MZCompat_Core
//
// A minimal compatibility layer that backfills selected MZ APIs on top of the
// MV-first engine. All patches are opt-in and guarded to avoid changing MV
// behavior while allowing MZ plugins/features to run.

// ---------------------------------------------------------------------------
// Utils helpers (MZ additions)
if (typeof Utils !== "undefined") {
  if (Utils.canUseWebAudioAPI == null) {
    Utils.canUseWebAudioAPI = function () {
      return !!(window.AudioContext || window.webkitAudioContext);
    };
  }

  if (Utils.canUseWebGL == null) {
    Utils.canUseWebGL = function () {
      try {
        return !!document.createElement("canvas").getContext("webgl");
      } catch (e) {
        return false;
      }
    };
  }

  if (Utils.canPlayOgg == null) {
    Utils.canPlayOgg = function () {
      var audio = document.createElement("audio");
      return !!audio.canPlayType && audio.canPlayType("audio/ogg") !== "";
    };
  }

  if (Utils.canPlayWebm == null) {
    Utils.canPlayWebm = function () {
      var video = document.createElement("video");
      return !!video.canPlayType && video.canPlayType("video/webm") !== "";
    };
  }

  if (Utils.isLocal == null) {
    Utils.isLocal = function () {
      return location.protocol === "file:";
    };
  }

  if (Utils.containsArabic == null) {
    Utils.containsArabic = function (str) {
      return /[\u0600-\u06FF]/.test(str || "");
    };
  }

  // [MZ] HTML escaping helper
  if (!Utils.escapeHtml) {
    Utils.escapeHtml = function (str) {
      const entityMap = {
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;",
        "/": "&#x2F;",
      };
      return String(str).replace(/[&<>"'/]/g, (s) => entityMap[s]);
    };
  }

  // [MZ] Encryption info setters (Maps to Decrypter in MV)
  if (!Utils.setEncryptionInfo) {
    Utils.setEncryptionInfo = function (hasImages, hasAudio, key) {
      if (typeof Decrypter !== "undefined") {
        Decrypter.hasEncryptedImages = hasImages;
        Decrypter.hasEncryptedAudio = hasAudio;
        Decrypter._encryptionKey = key;
      }
    };
  }

  if (!Utils.hasEncryptedImages) {
    Utils.hasEncryptedImages = function () {
      return typeof Decrypter !== "undefined" && Decrypter.hasEncryptedImages;
    };
  }

  if (!Utils.hasEncryptedAudio) {
    Utils.hasEncryptedAudio = function () {
      return typeof Decrypter !== "undefined" && Decrypter.hasEncryptedAudio;
    };
  }

  // [MZ] Decryption helper (Moved from Decrypter in MV)
  if (!Utils.decryptArrayBuffer) {
    Utils.decryptArrayBuffer = function (source) {
      if (typeof Decrypter !== "undefined") {
        return Decrypter.decryptArrayBuffer(source);
      }
      return source;
    };
  }

  // [MZ] Environment checks
  if (!Utils.canUseCssFontLoading) {
    Utils.canUseCssFontLoading = function () {
      return !!(document.fonts && document.fonts.ready);
    };
  }

  if (!Utils.canUseIndexedDB) {
    Utils.canUseIndexedDB = function () {
      return !!(
        window.indexedDB ||
        window.mozIndexedDB ||
        window.webkitIndexedDB
      );
    };
  }

  if (!Utils.checkRMVersion) {
    Utils.checkRMVersion = function (version) {
      var current = (Utils.RPGMAKER_VERSION || "0.0.0").split(".");
      var target = String(version).split(".");
      for (var i = 0; i < 3; i++) {
        var v1 = parseInt(current[i] || 0);
        var v2 = parseInt(target[i] || 0);
        if (v1 > v2) return true;
        if (v1 < v2) return false;
      }
      return true;
    };
  }

  // ---------------------------------------------------------------------------
  // Array helpers (MZ additions)
  if (!Array.prototype.remove) {
    Object.defineProperty(Array.prototype, "remove", {
      value: function (element) {
        var index = this.indexOf(element);
        if (index >= 0) {
          this.splice(index, 1);
          return true;
        }
        return false;
      },
      writable: true,
      configurable: true,
    });
  }

  //-----------------------------------------------------------------------------
  // Bitmap (MZ Additions)
  //-----------------------------------------------------------------------------

  if (typeof Bitmap !== "undefined") {
    // [MZ] fontBold support
    if (!Bitmap.prototype.hasOwnProperty("fontBold")) {
      Object.defineProperty(Bitmap.prototype, "fontBold", {
        get: function () {
          return this._fontBold;
        },
        set: function (value) {
          this._fontBold = value;
        },
        configurable: true,
      });

      // Initialize default
      var _Bitmap_initialize = Bitmap.prototype.initialize;
      Bitmap.prototype.initialize = function (width, height) {
        _Bitmap_initialize.call(this, width, height);
        this._fontBold = false;
      };

      // Hook into font string generation
      var _Bitmap_makeFontNameText = Bitmap.prototype._makeFontNameText;
      Bitmap.prototype._makeFontNameText = function () {
        var text = _Bitmap_makeFontNameText.call(this);
        if (this._fontBold) {
          return "Bold " + text;
        }
        return text;
      };
    }

    // [MZ] strokeRect
    if (!Bitmap.prototype.strokeRect) {
      Bitmap.prototype.strokeRect = function (x, y, width, height, color) {
        var context = this._context;
        context.save();
        context.strokeStyle = color;
        context.strokeRect(x, y, width, height);
        context.restore();
        this._setDirty();
      };
    }

    // [MZ] retry
    if (!Bitmap.prototype.retry) {
      Bitmap.prototype.retry = function () {
        if (this.startRequest) this.startRequest();
      };
    }
  }

  //-----------------------------------------------------------------------------
  // Sprite (MZ Additions)
  //-----------------------------------------------------------------------------

  if (typeof Sprite !== "undefined") {
    // [MZ] hide/show convenience methods
    if (!Sprite.prototype.hide) {
      Sprite.prototype.hide = function () {
        this._hidden = true;
        this.updateVisibility();
      };
    }

    if (!Sprite.prototype.show) {
      Sprite.prototype.show = function () {
        this._hidden = false;
        this.updateVisibility();
      };
    }

    if (!Sprite.prototype.updateVisibility) {
      Sprite.prototype.updateVisibility = function () {
        this.visible = !this._hidden;
      };
    }

    // Initialize _hidden flag in MV sprites
    var _Sprite_initialize = Sprite.prototype.initialize;
    Sprite.prototype.initialize = function (bitmap) {
      _Sprite_initialize.call(this, bitmap);
      this._hidden = false;
    };
  }

  //-----------------------------------------------------------------------------
  // Window (MZ Additions)
  //-----------------------------------------------------------------------------

  if (typeof Window !== "undefined") {
    // [MZ] Inner geometry getters
    Object.defineProperty(Window.prototype, "innerWidth", {
      get: function () {
        return Math.max(0, this._width - this._padding * 2);
      },
      configurable: true,
    });

    Object.defineProperty(Window.prototype, "innerHeight", {
      get: function () {
        return Math.max(0, this._height - this._padding * 2);
      },
      configurable: true,
    });

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

    // [MZ] Move helpers
    if (!Window.prototype.moveCursorBy) {
      Window.prototype.moveCursorBy = function (x, y) {
        if (this._cursorRect) {
          this._cursorRect.x += x;
          this._cursorRect.y += y;
        }
      };
    }

    if (!Window.prototype.moveInnerChildrenBy) {
      Window.prototype.moveInnerChildrenBy = function (x, y) {
        if (this._innerChildren) {
          for (var i = 0; i < this._innerChildren.length; i++) {
            var child = this._innerChildren[i];
            if (child) {
              child.x += x;
              child.y += y;
            }
          }
        }
      };
    }

    // [MZ] drawShape (used by WindowLayer for masking)
    if (!Window.prototype.drawShape) {
      Window.prototype.drawShape = function (graphics) {
        if (graphics) {
          var width = this.width;
          var height = (this.height * this._openness) / 255;
          var x = this.x;
          var y = this.y + (this.height - height) / 2;
          graphics.beginFill(0xffffff);
          graphics.drawRoundedRect(x, y, width, height, 0);
          graphics.endFill();
        }
      };
    }

    // [MZ Compat] Shim for adding inner children if not present
    if (!Window.prototype.addInnerChild) {
      Window.prototype.addInnerChild = function (child) {
        this.addChild(child); // Fallback to normal add for MV
        if (!this._innerChildren) this._innerChildren = [];
        this._innerChildren.push(child);
        return child;
      };
    }
  }

  // ---------------------------------------------------------------------------
  // Input virtual button hook (MZ)
  if (typeof Input !== "undefined" && !Input.virtualClick) {
    var _Input_clear = Input.clear;
    Input.clear = function () {
      _Input_clear.call(this);
      this._virtualButton = null;
    };

    Input.virtualClick = function (buttonName) {
      this._virtualButton = buttonName;
    };

    var _Input_update = Input.update;
    Input.update = function () {
      _Input_update.call(this);
      if (this._virtualButton) {
        this._latestButton = this._virtualButton;
        this._pressedTime = 0;
        this._virtualButton = null;
      }
    };
  }

  // ---------------------------------------------------------------------------
  // TouchInput helpers (MZ shims)
  if (typeof TouchInput !== "undefined") {
    if (!TouchInput._createNewState) {
      TouchInput._createNewState = function () {
        return {
          triggered: false,
          cancelled: false,
          moved: false,
          released: false,
          hovered: false,
          wheelX: 0,
          wheelY: 0,
        };
      };
    }

    var _TouchInput_clear = TouchInput.clear;
    TouchInput.clear = function () {
      _TouchInput_clear.call(this);
      this._clicked = false;
      this._hovered = false;
      this._newState = this._createNewState();
      this._currentState = this._createNewState();
    };

    var _TouchInput_update = TouchInput.update;
    TouchInput.update = function () {
      _TouchInput_update.call(this);
      if (this._createNewState) {
        this._currentState = this._newState || this._createNewState();
        var state = (this._newState = this._createNewState());
        state.triggered = !!this._triggered;
        state.cancelled = !!this._cancelled;
        state.moved = !!this._moved;
        state.released = !!this._released;
        state.wheelX = this._wheelX || 0;
        state.wheelY = this._wheelY || 0;
        state.hovered = !!this._hovered;
        state.x = this._x;
        state.y = this._y;
        this._clicked = state.released && !state.moved;
        this._hovered = false;
      }
    };

    var _TouchInput_onMouseMove = TouchInput._onMouseMove;
    TouchInput._onMouseMove = function (event) {
      _TouchInput_onMouseMove.call(this, event);
      if (!this.isPressed()) {
        this._hovered = true;
      }
    };

    if (!TouchInput.isClicked) {
      TouchInput.isClicked = function () {
        return !!this._clicked;
      };
    }

    if (!TouchInput.isHovered) {
      TouchInput.isHovered = function () {
        return !!(this._currentState && this._currentState.hovered);
      };
    }
  }

  // ---------------------------------------------------------------------------
  // Window client area + inner children (MZ style, MV-safe)
  if (typeof Window !== "undefined") {

    Window.prototype._updateClientArea = function () {
      if (this._clientArea) {
        var pad = this.padding != null ? this.padding : this._padding || 0;
        this._clientArea.move(pad, pad);
      }
    };

    Window.prototype._updateFilterArea = function () {
      if (this._clientArea && this._clientArea.filterArea) {
        var pad = this.padding != null ? this.padding : this._padding || 0;
        var w = this.width - pad * 2;
        var h = this.height - pad * 2;
        this._clientArea.filterArea.x = this.x + pad;
        this._clientArea.filterArea.y = this.y + pad;
        this._clientArea.filterArea.width = Math.max(0, w);
        this._clientArea.filterArea.height = Math.max(0, h);
      }
    };

    Window.prototype.addInnerChild = function (child) {
      this._createClientArea();
      this._innerChildren = this._innerChildren || [];
      if (this._innerChildren.indexOf(child) === -1) {
        this._innerChildren.push(child);
      }
      return this._clientArea.addChild(child);
    };

    var _Window_updateTransform = Window.prototype.updateTransform;
    Window.prototype.updateTransform = function () {
      if (this._updateClientArea) {
        this._updateClientArea();
      }
      _Window_updateTransform.call(this);
      if (this._updateFilterArea) {
        this._updateFilterArea();
      }
    };
  }
}

// Tilemap.Layer alias used by some plugins to tweak rendering
if (typeof Tilemap !== "undefined" && !Tilemap.Layer) {
  function TilemapLayer() {
    PIXI.Container.call(this);
  }
  TilemapLayer.prototype = Object.create(PIXI.Container.prototype);
  TilemapLayer.prototype.constructor = TilemapLayer;
  Tilemap.Layer = TilemapLayer;
}