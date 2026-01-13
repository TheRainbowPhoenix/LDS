//=============================================================================
// CY_Scene_Loading.js
//=============================================================================

/*:
 * @plugindesc Cyberpunk UI Mod - Loading Screen
 * @author Cyberpunk UI Mod
 *
 * @help
 * CY_Scene_Loading - A transition scene that simulates loading with
 * Cyberpunk-styled visuals (Lens distortion, spinner, etc).
 *
 * Usage:
 * CY_Scene_Loading.prepare(NextSceneClass);
 * SceneManager.push(CY_Scene_Loading);
 */

//=============================================================================
// CY_Loading_Visuals
// Reuseable PIXI Container for the loading UI
//=============================================================================

function CY_Loading_Visuals() {
    this.initialize.apply(this, arguments);
}

CY_Loading_Visuals.prototype = Object.create(PIXI.Container.prototype);
CY_Loading_Visuals.prototype.constructor = CY_Loading_Visuals;

CY_Loading_Visuals.prototype.initialize = function () {
    PIXI.Container.call(this);
    this._width = Graphics.width;
    this._height = Graphics.height;
    this._loadingMessages = [
        "Shooting while moving is less accurate than when in stable position.",
        "Use your scanner to identify enemy weaknesses before engaging.",
        "Tech weapons can shoot through cover.",
        "Visit ripperdocs to upgrade your cyberware.",
        "Netrunning requires a cyberdeck equipped with quickhacks."
    ];

    // Check for minimal mode (First boot)
    this._isMinimal = typeof $dataSystem === 'undefined' || !$dataSystem;

    this.createBackground();
    this.createUILayer();
};

CY_Loading_Visuals.prototype.createBackground = function () {
    if (this._isMinimal) {
        this._gradientFallback = new PIXI.Graphics();
        this._gradientFallback.beginFill(0x000000);
        this._gradientFallback.drawRect(0, 0, this._width, this._height);
        this._gradientFallback.endFill();
        this.addChild(this._gradientFallback);
        return;
    }

    var bgName = $dataSystem && $dataSystem.title1Name || "Castle";
    var bitmap = ImageManager.loadTitle1(bgName);

    this._backSprite = new Sprite(bitmap);
    this._backSprite.anchor.x = 0.5;
    this._backSprite.anchor.y = 0.5;
    this._backSprite.x = this._width / 2;
    this._backSprite.y = this._height / 2;

    // Gradient Fallback Logic
    this._gradientFallback = new PIXI.Graphics();
    this._gradientFallback.beginFill(0x0a0a0a); // Dark bg
    this._gradientFallback.drawRect(0, 0, this._width, this._height);
    this._gradientFallback.beginFill(0x842624, 0.2); // Dark Red
    this._gradientFallback.drawCircle(this._width / 2, this._height / 2, this._width / 1.5);
    this._gradientFallback.endFill();

    this.addChild(this._gradientFallback);
    this.addChild(this._backSprite);
};

CY_Loading_Visuals.prototype.updateBackground = function () {
    if (this._isMinimal) return;

    if (this._backSprite && this._backSprite.bitmap && this._backSprite.bitmap.isReady()) {
        this._backSprite.visible = true;
        this._gradientFallback.visible = false;
        // Update scale to fill screen
        var scaleX = this._width / this._backSprite.bitmap.width;
        var scaleY = this._height / this._backSprite.bitmap.height;
        var scale = Math.max(scaleX, scaleY); // Cover
        this._backSprite.scale.set(scale, scale);
    } else {
        if (this._backSprite) this._backSprite.visible = false;
        if (this._gradientFallback) this._gradientFallback.visible = true;
    }
};

CY_Loading_Visuals.prototype.createUILayer = function () {
    this._uiContainer = new PIXI.Container();
    this._uiContainer.filterArea = new PIXI.Rectangle(0, 0, this._width, this._height);
    this.addChild(this._uiContainer);

    if (this._isMinimal) {
        this.createSpinner();
        return;
    }

    this.createLensDistortion();
    this.createVisualElements();
    this.createProgressBar();
    this.createSpinner();
    this.createTextElements();
};

CY_Loading_Visuals.prototype.createLensDistortion = function () {
    if (!PIXI.Filter) return;

    var crtFragmentShader = `
    precision mediump float;
    
    varying vec2 vTextureCoord;
    uniform sampler2D uSampler;
    uniform float uTime;
    uniform float uDistortion;
    uniform float uGhostOffset;
    uniform float uGhostOpacity;
    uniform float uEdgeNoiseWidth;
    
    vec2 barrelDistortion(vec2 coord, float amt) {
        vec2 cc = coord - 0.5;
        float dist = dot(cc, cc);
        return coord + cc * dist * amt;
    }
    
    void main(void) {
        vec2 uv = barrelDistortion(vTextureCoord, uDistortion);
        
        if (uv.x < 0.0 || uv.x > 1.0 || uv.y < 0.0 || uv.y > 1.0) {
            gl_FragColor = vec4(0.0, 0.0, 0.0, 0.0); 
            return;
        }
        
        vec4 color = texture2D(uSampler, uv);
        
        // Ghosting
        vec2 ghostUV = barrelDistortion(vTextureCoord + vec2(uGhostOffset, uGhostOffset * 0.6), uDistortion);
        if (ghostUV.x >= 0.0 && ghostUV.x <= 1.0 && ghostUV.y >= 0.0 && ghostUV.y <= 1.0) {
            vec4 ghost = texture2D(uSampler, ghostUV);
            color.rgb = color.rgb - ghost.rgb * uGhostOpacity;
        }
        
        // Vignette
        float vignette = 1.0 - dot(vTextureCoord - 0.5, vTextureCoord - 0.5) * 0.3;
        color.rgb *= vignette;
        
        gl_FragColor = color;
    }
    `;

    try {
        this._lensFilter = new PIXI.Filter(null, crtFragmentShader, {
            uTime: { type: "1f", value: 0.0 },
            uDistortion: { type: "1f", value: -0.05 },
            uGhostOffset: { type: "1f", value: 0.002 },
            uGhostOpacity: { type: "1f", value: 0.15 },
            uEdgeNoiseWidth: { type: "1f", value: 0.05 },
        });
        this._uiContainer.filters = [this._lensFilter];
    } catch (e) {
        console.warn("CY_Loading_Visuals: Failed to create lens filter", e);
    }
};

CY_Loading_Visuals.prototype.createVisualElements = function () {
    var g = new PIXI.Graphics();
    this._uiContainer.addChild(g);

    var w = this._width;
    var h = this._height;
    var barHeight = 90;
    var redColor = parseInt(CY_System.Colors.lightRed.replace("#", ""), 16);

    // Black Bars
    g.beginFill(0x000000);
    g.drawRect(0, 0, w, barHeight + 5);
    g.drawRect(w * 0.25, 0, w * 0.75, barHeight + 10);
    g.drawRect(0, h - barHeight - 5, w, barHeight + 5);
    g.drawRect(w * 0.75, h - barHeight - 10, w, 10);
    g.endFill();

    // Red Lines with Jumps
    g.lineStyle(2, redColor, 1);

    var lineYTop = barHeight + 5;
    var jumpXTop = w * 0.25;
    g.moveTo(0, lineYTop);
    g.lineTo(jumpXTop, lineYTop);
    g.lineTo(jumpXTop, lineYTop + 5);
    g.lineTo(w, lineYTop + 5);

    var lineYBot = h - barHeight - 5;
    var jumpXBot = w * 0.75;
    g.moveTo(0, lineYBot);
    g.lineTo(jumpXBot, lineYBot);
    g.lineTo(jumpXBot, lineYBot - 5);
    g.lineTo(w, lineYBot - 5);

    // Top Left Boxes
    g.lineStyle(1, redColor, 0.8);
    g.beginFill(0x000000, 0.5);
    g.drawRect(40, 25, 160, 30);
    g.endFill();

    g.lineStyle(1, redColor, 0.8);
    g.beginFill(0x000000, 0.5);
    g.drawRect(200, 25, 380, 30);
    g.endFill();

    // Bottom Right Box
    var brX = w - 210 - 20;
    var brY = h - 65;
    g.lineStyle(1, redColor);
    g.moveTo(brX, brY);
    g.lineTo(brX + 150, brY);
    g.lineTo(brX + 170, brY + 20);
    g.lineTo(brX, brY + 20);
    g.closePath();

    // Arrow Icon
    g.lineStyle(3, redColor);
    g.drawPolygon([
        brX + 6, brY + 14,
        brX + 6, brY + 6,
        brX + 8, brY + 6,
        brX + 14, brY + 12,
        brX + 20, brY + 12,
    ]);
    g.moveTo(brX + 14, brY + 6);
    g.lineTo(brX + 20, brY + 6);

    this._brY = brY;
};

CY_Loading_Visuals.prototype.createProgressBar = function () {
    var redColor = parseInt(CY_System.Colors.lightRed.replace('#', ''), 16);
    var w = this._width;

    var barWidth = 280;
    var barHeight = 12;
    var x = w - 90 - 45 - barWidth;
    var y = 80 - (barHeight / 2); // Corrected Y from user feedback

    this._progressBarContainer = new PIXI.Container();
    this._progressBarContainer.x = x;
    this._progressBarContainer.y = y;
    this._uiContainer.addChild(this._progressBarContainer);

    var g = new PIXI.Graphics();
    g.lineStyle(2, redColor);
    g.drawRect(0, 0, barWidth, barHeight);
    this._progressBarContainer.addChild(g);

    this._progressBarFill = new PIXI.Graphics();
    this._progressBarFill.beginFill(redColor);
    this._progressBarFill.drawRect(0, 0, barWidth - 8, barHeight - 6);
    this._progressBarFill.endFill();
    this._progressBarFill.scale.x = 0;
    this._progressBarFill.x = 4;
    this._progressBarFill.y = 3;
    this._progressBarContainer.addChild(this._progressBarFill);

    var label = CY_Main.makeTextSprite(
        "MEM_CHECK...",
        x,
        y - 25, // Corrected Y from user feedback
        100,
        20,
        {
            fontFace: "GameFont",
            fontSize: 14, // Corrected size
            textColor: CY_System.Colors.lightRed,
            align: 'left'
        }
    );
    this._uiContainer.addChild(label);
};

CY_Loading_Visuals.prototype.createSpinner = function () {
    var redColor = parseInt(CY_System.Colors.lightRed.replace("#", ""), 16);
    var w = this._width;

    this._spinnerContainer = new PIXI.Container();
    this._spinnerContainer.x = w - 90;
    this._spinnerContainer.y = 60;
    this._uiContainer.addChild(this._spinnerContainer);

    var diskBg = new PIXI.Graphics();
    diskBg.beginFill(0xFF6158, 0.05);
    diskBg.drawRect(0, 0, 60, 60);
    diskBg.endFill();
    diskBg.x = -30;
    diskBg.y = -30;
    this._spinnerContainer.addChild(diskBg);

    var diskBorder = new PIXI.Graphics();
    diskBorder.lineStyle(1, redColor, 0.8);
    diskBorder.drawCircle(0, 0, 22);
    this._spinnerContainer.addChild(diskBorder);

    var disk = new PIXI.Graphics();
    disk.beginFill(redColor);
    disk.arc(0, 0, 20, 0.2, 2.9);
    disk.arc(0, 0, 8, 2.9, 0.2, true);
    disk.closePath();
    disk.arc(0, 0, 20, 3.3, 6.0);
    disk.arc(0, 0, 8, 6.0, 3.3, true);
    disk.closePath();

    this._spinnerDisk = disk;
    this._spinnerContainer.addChild(disk);

    var corners = new PIXI.Graphics();
    corners.lineStyle(2, redColor);
    var cOff = 28;
    var cLen = 6;
    corners.moveTo(-cOff, -cOff + cLen); corners.lineTo(-cOff, -cOff); corners.lineTo(-cOff + cLen, -cOff);
    corners.moveTo(cOff, -cOff + cLen); corners.lineTo(cOff, -cOff); corners.lineTo(cOff - cLen, -cOff);
    corners.moveTo(cOff, cOff - cLen); corners.lineTo(cOff, cOff); corners.lineTo(cOff - cLen, cOff);
    corners.moveTo(-cOff, cOff - cLen); corners.lineTo(-cOff, cOff); corners.lineTo(-cOff + cLen, cOff);
    this._spinnerContainer.addChild(corners);
};

CY_Loading_Visuals.prototype.createTextElements = function () {
    var ncc_top = 30;

    // Top Left Text
    this._nccamText = CY_Main.makeTextSprite("NCCAM", 45, ncc_top - 10, 200, 40, {
        fontFace: "GameFont", fontSize: 20, textColor: CY_System.Colors.lightRed,
        outlineColor: "#000000", outlineWidth: 4, align: "left"
    });
    this._uiContainer.addChild(this._nccamText);

    this._codeText = CY_Main.makeTextSprite("FC_4350", 130, ncc_top - 6, 120, 32, {
        fontFace: "GameFont", fontSize: 16, textColor: CY_System.Colors.lightRed
    });
    this._uiContainer.addChild(this._codeText);

    // Decorative Text
    this._nccamCodeExtra = CY_Main.makeTextSprite(
        "4RgspUSpK4A8QG 2 BHQD6bwV93ot fRqvIq8BuwOES z2ORbSCicaJighjuMDqG xPcSXaCPD8iD8eJs Sj4 wTXA OQSyfNdAgXXIL ExrqeQ+8t2kE cBw FCTcemo FESd0YiL9z V10jkQ64Obp8f8X6FRbh7x0HhSLI TILHGtA",
        210, 20, 360, 30, {
        fontFace: "GameFont", fontSize: 10, textColor: CY_System.Colors.lightRed,
        outlineColor: "#000000", outlineWidth: 2, align: "left"
    }
    );
    this._uiContainer.addChild(this._nccamCodeExtra);

    this._nccamCodeExtraTwo = CY_Main.makeTextSprite(
        "8iisoVdEumXsB JTw  RUa LyA k C8h478xSiDqqfSQNIvkjb2G CBYhEr8btF OcRgbS2SHqKP+SixjR4014uEehS0G9CceRpcLw8A9X D aGt I6f3OHLQ8 IXDQEzBO8dXIoVpbMe  Xj0FgQAHOSFAQS6fx4TpTLwgJt2qD6wzcP",
        210, 30, 320, 30, {
        fontFace: "GameFont", fontSize: 10, textColor: CY_System.Colors.lightRed,
        outlineColor: "#000000", outlineWidth: 2, align: "left"
    }
    );
    this._uiContainer.addChild(this._nccamCodeExtraTwo);

    // Hint Text
    var hint = this._loadingMessages[Math.floor(Math.random() * this._loadingMessages.length)];
    this._hintText = CY_Main.makeTextSprite(hint, 50, Graphics.height - 80, Graphics.width - 100, 40, {
        fontFace: "GameFont", fontSize: 18, textColor: CY_System.Colors.lightRed,
        outlineColor: "#000000", outlineWidth: 4, align: "left"
    });
    this._uiContainer.addChild(this._hintText);

    // Fx Text
    this._hintTextFxPre1 = CY_Main.makeTextSprite("C8h478xSiDqqfSQN", 50, Graphics.height - 92, 180, 10, {
        fontFace: "GameFont", fontSize: 5, textColor: CY_System.Colors.lightRed,
        outlineColor: "#000000", outlineWidth: 2, align: "left"
    });
    this._uiContainer.addChild(this._hintTextFxPre1);

    this._hintTextFxPre2 = CY_Main.makeTextSprite("Ivkjb2G CBYhEr8btF", 50, Graphics.height - 86, 180, 10, {
        fontFace: "GameFont", fontSize: 5, textColor: CY_System.Colors.lightRed,
        outlineColor: "#000000", outlineWidth: 2, align: "left"
    });
    this._uiContainer.addChild(this._hintTextFxPre2);

    // System Text
    this._sysText = CY_Main.makeTextSprite("SYSTEM_LOADING", Graphics.width - 200, this._brY - 7, 180, 32, {
        fontFace: "GameFont", fontSize: 16, textColor: CY_System.Colors.lightRed,
        outlineColor: "#000000", outlineWidth: 4, align: "left"
    });
    this._uiContainer.addChild(this._sysText);

    this._sysLoadDat = CY_Main.makeTextSprite("█  NC_DR_HQ6AYB5LEL3Y6.", Graphics.width - 225, this._brY + 16, 180, 32, {
        fontFace: "GameFont", fontSize: 6, textColor: CY_System.Colors.lightRed,
        outlineColor: CY_System.Colors.lightRed, outlineWidth: 1, align: "left"
    });
    this._uiContainer.addChild(this._sysLoadDat);
};

CY_Loading_Visuals.prototype.update = function (progress) {
    this.updateBackground();

    if (this._spinnerDisk) {
        this._spinnerDisk.rotation += 0.1;
    }

    if (this._progressBarFill) {
        this._progressBarFill.scale.x = Math.max(0, Math.min(1, progress));
    }
};

//=============================================================================
// CY_Scene_Loading
// Standard Transition Scene
//=============================================================================

function CY_Scene_Loading() {
    this.initialize.apply(this, arguments);
}

CY_Scene_Loading.prototype = Object.create(Scene_Base.prototype);
CY_Scene_Loading.prototype.constructor = CY_Scene_Loading;
CY_Scene_Loading._nextSceneClass = null;

CY_Scene_Loading.prepare = function (nextSceneClass) {
    CY_Scene_Loading._nextSceneClass = nextSceneClass;
};

CY_Scene_Loading.prototype.initialize = function () {
    Scene_Base.prototype.initialize.call(this);
    this._nextSceneClass = CY_Scene_Loading._nextSceneClass || Scene_Map;
    this._maxDuration = 360;
    this._duration = this._maxDuration;
};

CY_Scene_Loading.prototype.create = function () {
    Scene_Base.prototype.create.call(this);
    this._visuals = new CY_Loading_Visuals();
    this.addChild(this._visuals);
};

CY_Scene_Loading.prototype.start = function () {
    Scene_Base.prototype.start.call(this);
};

CY_Scene_Loading.prototype.update = function () {
    Scene_Base.prototype.update.call(this);
    this._duration--;

    var progress = 1 - (this._duration / this._maxDuration);
    this._visuals.update(progress);

    if (this._duration <= 0) {
        if (this._nextSceneClass) {
            SceneManager.goto(this._nextSceneClass);
        } else {
            SceneManager.goto(Scene_Map);
        }
    }
};

//=============================================================================
// Graphics Override (Built-in Loading)
//=============================================================================

// Helper to manage the global loading visual
CY_Scene_Loading.GlobalVisuals = null;
CY_Scene_Loading.GlobalStage = null;

Graphics.startLoading = function () {
    this._loadingCount = 0;
    this._cyLoadingDuration = 0; // Track time

    // Do NOT create GlobalVisuals yet. Wait for delay.

    // Hide default opacity (if any)
    if (this._upperCanvas) {
        this._upperCanvas.style.opacity = 0;
    }

    // We use a custom flag to tell SceneManager/Graphics we are busy
    this._cyLoadingActive = true;
};

Graphics.updateLoading = function () {
    this._loadingCount++;
    this._cyLoadingDuration++;

    this._paintUpperCanvas();
    if (this._upperCanvas) {
        this._upperCanvas.style.opacity = 0; // Force hide
    }

    // Only show full loading screen after 2 seconds (120 frames at 60fps)
    var delayFrames = 120;
    var fadeFrames = 30;

    if (this._cyLoadingDuration > delayFrames) {
        // Time to show the loading screen
        if (!CY_Scene_Loading.GlobalVisuals) {
            CY_Scene_Loading.GlobalVisuals = new CY_Loading_Visuals();
            CY_Scene_Loading.GlobalVisuals.alpha = 0; // Start transparent
        }

        // Calculate fade in
        var fadeProgress = (this._cyLoadingDuration - delayFrames) / fadeFrames;
        CY_Scene_Loading.GlobalVisuals.alpha = Math.min(1, fadeProgress);

        // Update our visuals
        if (CY_Scene_Loading.GlobalVisuals) {
            // Mock progress based on loadingCount or random
            var fakeProgress = (Math.sin(this._loadingCount * 0.05) + 1) / 2;
            CY_Scene_Loading.GlobalVisuals.update(fakeProgress * 0.8);

            // Render manually
            if (Graphics._renderer) {
                Graphics._renderer.render(CY_Scene_Loading.GlobalVisuals);
            }
        }
    }
};

Graphics.endLoading = function () {
    this._clearUpperCanvas();
    if (this._upperCanvas) {
        this._upperCanvas.style.opacity = 0;
    }
    this._cyLoadingActive = false;
    this._cyLoadingDuration = 0;

    // Destroy global visuals to reset state
    if (CY_Scene_Loading.GlobalVisuals) {
        if (Graphics._renderer) {
            CY_Scene_Loading.GlobalVisuals.destroy({ children: true });
        }
        CY_Scene_Loading.GlobalVisuals = null;
    }
};
