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

function CY_Scene_Loading() {
  this.initialize.apply(this, arguments);
}

CY_Scene_Loading.prototype = Object.create(Scene_Base.prototype);
CY_Scene_Loading.prototype.constructor = CY_Scene_Loading;

//-----------------------------------------------------------------------------
// Static Properties
//-----------------------------------------------------------------------------

CY_Scene_Loading._nextSceneClass = null;

CY_Scene_Loading.prepare = function (nextSceneClass) {
  CY_Scene_Loading._nextSceneClass = nextSceneClass;
};

//-----------------------------------------------------------------------------
// Initialization
//-----------------------------------------------------------------------------

CY_Scene_Loading.prototype.initialize = function () {
  Scene_Base.prototype.initialize.call(this);
  // Default to Scene_Map if not specified
  this._nextSceneClass = CY_Scene_Loading._nextSceneClass || Scene_Map;
  this._duration = 0;
  this._loadingMessages = [
    "Shooting while moving is less accurate than when in stable position.",
    "Use your scanner to identify enemy weaknesses before engaging.",
    "Tech weapons can shoot through cover.",
    "Visit ripperdocs to upgrade your cyberware.",
    "Netrunning requires a cyberdeck equipped with quickhacks.",
  ];
};

//-----------------------------------------------------------------------------
// Scene Creation
//-----------------------------------------------------------------------------

CY_Scene_Loading.prototype.create = function () {
  Scene_Base.prototype.create.call(this);
  this.createBackground();
  this.createUILayer();
  this._duration = 360; // 3 seconds at 60fps
};

CY_Scene_Loading.prototype.start = function () {
  Scene_Base.prototype.start.call(this);
};

CY_Scene_Loading.prototype.createBackground = function () {
  // Try to load a background image
  var bgName = $dataSystem.title1Name || "Castle";
  /** @type {PIXI.Sprite} */
  this._backSprite = new Sprite(ImageManager.loadTitle1(bgName));

  // Stretch to fill entire screen
  // this._backSprite.width = Graphics.width;
  // this._backSprite.height = Graphics.height;

  this._backSprite.scale.x = Graphics.width / this._backSprite.width;
  this._backSprite.scale.y = Graphics.height / this._backSprite.height;

  this.addChild(this._backSprite);
};

//-----------------------------------------------------------------------------
// UI Construction
//-----------------------------------------------------------------------------

CY_Scene_Loading.prototype.createUILayer = function () {
  this._uiContainer = new PIXI.Container();
  // Filter Area covers screen
  this._uiContainer.filterArea = new PIXI.Rectangle(
    0,
    0,
    Graphics.width,
    Graphics.height
  );
  this.addChild(this._uiContainer);

  this.createLensDistortion();
  this.createVisualElements();
  this.createSpinner();
  this.createTextElements();
};

CY_Scene_Loading.prototype.createLensDistortion = function () {
  if (!PIXI.Filter) return;

  return;

  // Standard Pincushion distortion
  var distortionFrag = `
    varying vec2 vTextureCoord;
    uniform sampler2D uSampler;
    
    void main(void) {
        vec2 uv = vTextureCoord;
        
        // Center the coordinates around (0, 0)
        vec2 centered = uv - 0.5;
        
        // Calculate distance squared from center
        float r2 = dot(centered, centered);
        
        // Apply barrel distortion (concave/inward)
        // Negative value pulls pixels TOWARD center
        float distortion = 1.0 - 0.3 * r2;
        
        // Apply distortion to centered coordinates
        vec2 distorted = centered * distortion;
        
        // Move back to (0, 1) range
        uv = distorted + 0.5;
        
        // Check bounds and render
        if (uv.x < 0.0 || uv.x > 1.0 || uv.y < 0.0 || uv.y > 1.0) {
            discard;
        } else {
            gl_FragColor = texture2D(uSampler, uv);
        }
    }
    `;
  var crtFragmentShader = `
    precision mediump float;
    
    varying vec2 vTextureCoord;
    uniform sampler2D uSampler;
    uniform float uTime;
    uniform float uDistortion;
    uniform float uGhostOffset;
    uniform float uGhostOpacity;
    uniform float uEdgeNoiseWidth;
    
    float rand(vec2 co) {
        return fract(sin(dot(co.xy, vec2(12.9898, 78.233))) * 43758.5453);
    }
    
    vec2 barrelDistortion(vec2 coord, float amt) {
        vec2 cc = coord - 0.5;
        float dist = dot(cc, cc);
        return coord + cc * dist * amt;
    }
    
    void main(void) {
        vec2 uv = barrelDistortion(vTextureCoord, uDistortion);
        
        // Return Transparent if out of bounds
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
        
        // Edge Noise / Glitch
        float edgeWidth = uEdgeNoiseWidth;
        float leftEdge = smoothstep(0.0, edgeWidth, vTextureCoord.x);
        float rightEdge = smoothstep(0.0, edgeWidth, 1.0 - vTextureCoord.x);
        
        float blockY = floor(vTextureCoord.y * 180.0);
        float blockTime = floor(uTime * 8.0);
        
        // Vignette
        float vignette = 1.0 - dot(vTextureCoord - 0.5, vTextureCoord - 0.5) * 0.3;
        color.rgb *= vignette;
        
        gl_FragColor = color;
    }
`;

  try {
    this._lensFilter = new PIXI.Filter(null, crtFragmentShader, {
      uTime: { type: "1f", value: 0.0 },
      uDistortion: { type: "1f", value: -0.05 }, // Negative for barrel/concave
      uGhostOffset: { type: "1f", value: 0.002 },
      uGhostOpacity: { type: "1f", value: 0.15 },
      uEdgeNoiseWidth: { type: "1f", value: 0.05 },
    });
    this._uiContainer.filters = [this._lensFilter];
  } catch (e) {
    console.warn("CY_Scene_Loading: Failed to create lens filter", e);
  }
};

CY_Scene_Loading.prototype.createVisualElements = function () {
  /** @type {PIXI.Graphics} */
  var g = new PIXI.Graphics();
  this._uiContainer.addChild(g);

  var w = Graphics.width;
  var h = Graphics.height;
  var barHeight = 90; // Increased padding
  var redColor = parseInt(CY_System.Colors.lightRed.replace("#", ""), 16);

  // 1. Black Bars (Solid)
  g.beginFill(0x000000);
  g.drawRect(0, 0, w, barHeight + 5);
  g.drawRect(w * 0.25, 0, w * 0.75, barHeight + 10);

  g.drawRect(0, h - barHeight - 5, w, barHeight + 5);
  g.drawRect(w * 0.75, h - barHeight - 10, w, 10);
  g.endFill();

  // 2. Red Lines with Jumps
  g.lineStyle(2, redColor, 1);

  // Top Line (1/4 jump down)
  var lineYTop = barHeight + 5;
  var jumpXTop = w * 0.25;
  g.moveTo(0, lineYTop);
  g.lineTo(jumpXTop, lineYTop);
  g.lineTo(jumpXTop, lineYTop + 5);
  g.lineTo(w, lineYTop + 5);

  // Bottom Line (3/4 jump up)
  var lineYBot = h - barHeight - 5;
  var jumpXBot = w * 0.75;
  g.moveTo(0, lineYBot);
  g.lineTo(jumpXBot, lineYBot);
  g.lineTo(jumpXBot, lineYBot - 5);
  g.lineTo(w, lineYBot - 5);

  // 3. Top Left Box (NCCAM wrapper)
  g.lineStyle(1, redColor, 0.8);
  g.beginFill(0x000000, 0.5);
  g.drawRect(40, 25, 160, 30);
  g.endFill();
  // Second NCCAM box
  g.lineStyle(1, redColor, 0.8);
  g.beginFill(0x000000, 0.5);
  g.drawRect(200, 25, 380, 30);
  g.endFill();

  // 4. Bottom Right Box
  var brX = w - 210 - 20;
  var brY = h - 65; // Move up significantly to avoid cutoff
  g.lineStyle(1, redColor);
  g.moveTo(brX, brY);
  g.lineTo(brX + 150, brY);
  g.lineTo(brX + 170, brY + 20);
  g.lineTo(brX, brY + 20);
  g.closePath();

  // arrow icon
  g.lineStyle(3, redColor);
  g.drawPolygon([
    brX + 6,    brY + 14,
    brX + 6,    brY + 6,
    brX + 8,    brY + 6,
    brX + 14,   brY + 12,
    brX + 20,   brY + 12,
  ]);

  g.moveTo(brX + 14, brY + 6);
  g.lineTo(brX + 20, brY + 6);

  this._brY = brY; // Store for text
};

CY_Scene_Loading.prototype.createSpinner = function () {
  var redColor = parseInt(CY_System.Colors.lightRed.replace("#", ""), 16);
  var w = Graphics.width;

  this._spinnerContainer = new PIXI.Container();
  // Position inside Top Right
  // barHeight is 90. Spinner radius 20. Center at 45?
  this._spinnerContainer.x = w - 90;
  this._spinnerContainer.y = 60;
  this._uiContainer.addChild(this._spinnerContainer);

  var diskBg = new PIXI.Graphics();
  diskBg.beginFill(0xFF6158, 0.05);
  diskBg.drawRect(0, 0, 60, 60);
  diskBg.endFill();
  diskBg.x = - 30
  diskBg.y = - 30
  this._spinnerContainer.addChild(diskBg);

  var diskBorder = new PIXI.Graphics();
  diskBorder.lineStyle(1, redColor, 0.8);
  diskBorder.drawCircle(0, 0, 22);
  this._spinnerContainer.addChild(diskBorder);

  // CD Disk Graphics
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

  // Static corners
  var corners = new PIXI.Graphics();
  corners.lineStyle(2, redColor);
  var cOff = 28;
  var cLen = 6;
  corners.moveTo(-cOff, -cOff + cLen);
  corners.lineTo(-cOff, -cOff);
  corners.lineTo(-cOff + cLen, -cOff);
  corners.moveTo(cOff, -cOff + cLen);
  corners.lineTo(cOff, -cOff);
  corners.lineTo(cOff - cLen, -cOff);
  corners.moveTo(cOff, cOff - cLen);
  corners.lineTo(cOff, cOff);
  corners.lineTo(cOff - cLen, cOff);
  corners.moveTo(-cOff, cOff - cLen);
  corners.lineTo(-cOff, cOff);
  corners.lineTo(-cOff + cLen, cOff);

  this._spinnerContainer.addChild(corners);
};

CY_Scene_Loading.prototype.createTextElements = function () {
  var redColor = CY_System.Colors.lightRed;
  var style = {
    fontFamily: "GameFont",
    fontSize: 20,
    fill: redColor,
    fontWeight: "bold",
    dropShadow: true,
    dropShadowDistance: 2,
    dropShadowColor: "#000000",
  };

  // Top Left Text
  let ncc_top = 30;
  this._nccamText = CY_Main.makeTextSprite("NCCAM", 45, ncc_top - 10, 200, 40, {
    fontFace: "GameFont",
    fontSize: 20,
    textColor: CY_System.Colors.lightRed,
    outlineColor: "#000000",
    outlineWidth: 4,
    align: "left",
  });
  this._uiContainer.addChild(this._nccamText);

  this._codeText = CY_Main.makeTextSprite(
    "FC_4350",
    130,
    ncc_top - 6,
    120,
    32,
    {
      fontFace: "GameFont",
      fontSize: 16,
      textColor: CY_System.Colors.lightRed,
    }
  );
  this._uiContainer.addChild(this._codeText);
  // Additional box text (small)
  this._nccamCodeExtra = CY_Main.makeTextSprite(
    "4RgspUSpK4A8QG 2 BHQD6bwV93ot fRqvIq8BuwOES z2ORbSCicaJighjuMDqG xPcSXaCPD8iD8eJs Sj4 wTXA OQSyfNdAgXXIL ExrqeQ+8t2kE cBw FCTcemo FESd0YiL9z V10jkQ64Obp8f8X6FRbh7x0HhSLI TILHGtA",
    210,
    20,
    360,
    30,
    {
      fontFace: "GameFont",
      fontSize: 10,
      textColor: CY_System.Colors.lightRed,
      outlineColor: "#000000",
      outlineWidth: 2,
      align: "left",
    }
  );
  this._uiContainer.addChild(this._nccamCodeExtra);

  this._nccamCodeExtraTwo = CY_Main.makeTextSprite(
    "8iisoVdEumXsB JTw  RUa LyA k C8h478xSiDqqfSQNIvkjb2G CBYhEr8btF OcRgbS2SHqKP+SixjR4014uEehS0G9CceRpcLw8A9X D aGt I6f3OHLQ8 IXDQEzBO8dXIoVpbMe  Xj0FgQAHOSFAQS6fx4TpTLwgJt2qD6wzcP",
    210,
    30,
    320,
    30,
    {
      fontFace: "GameFont",
      fontSize: 10,
      textColor: CY_System.Colors.lightRed,
      outlineColor: "#000000",
      outlineWidth: 2,
      align: "left",
    }
  );
  this._uiContainer.addChild(this._nccamCodeExtraTwo);

  // Bottom Left Hint - Moved UP to avoid cutoff by lens distortion
  var hint =
    this._loadingMessages[
      Math.floor(Math.random() * this._loadingMessages.length)
    ];

  this._hintText = CY_Main.makeTextSprite(
    hint,
    50,
    Graphics.height - 80,
    Graphics.width - 100,
    40,
    {
      fontFace: "GameFont",
      fontSize: 18,
      textColor: CY_System.Colors.lightRed,
      outlineColor: "#000000",
      outlineWidth: 4,
      align: "left",
    }
  );

  this._uiContainer.addChild(this._hintText);

  this._hintTextFxPre1 = CY_Main.makeTextSprite(
    "C8h478xSiDqqfSQN",
    50,
    Graphics.height - 92,
    180,
    10,
    {
      fontFace: "GameFont",
      fontSize: 5,
      textColor: CY_System.Colors.lightRed,
      outlineColor: "#000000",
      outlineWidth: 2,
      align: "left",
    }
  );
  this._uiContainer.addChild(this._hintTextFxPre1);
  this._hintTextFxPre2 = CY_Main.makeTextSprite(
    "Ivkjb2G CBYhEr8btF",
    50,
    Graphics.height - 86,
    180,
    10,
    {
      fontFace: "GameFont",
      fontSize: 5,
      textColor: CY_System.Colors.lightRed,
      outlineColor: "#000000",
      outlineWidth: 2,
      align: "left",
    }
  );
  this._uiContainer.addChild(this._hintTextFxPre2);


  // Bottom Right System Text
  this._sysText = CY_Main.makeTextSprite(
    "SYSTEM_LOADING",
    Graphics.width - 200,
    this._brY - 7,
    180,
    32,
    {
      fontFace: "GameFont",
      fontSize: 16,
      textColor: CY_System.Colors.lightRed,
      outlineColor: "#000000",
      outlineWidth: 4,
      align: "left",
    }
  );

  this._uiContainer.addChild(this._sysText);
  this._sysLoadDat = CY_Main.makeTextSprite(
    "█  NC_DR_HQ6AYB5LEL3Y6.",
    Graphics.width - 225,
    this._brY + 16,
    180,
    32,
    {
      fontFace: "GameFont",
      fontSize: 6,
      textColor: CY_System.Colors.lightRed,
      outlineColor: CY_System.Colors.lightRed,
      outlineWidth: 1,
      align: "left",
    }
  );

  this._uiContainer.addChild(this._sysLoadDat);
};

//-----------------------------------------------------------------------------
// Update Loop
//-----------------------------------------------------------------------------

CY_Scene_Loading.prototype.update = function () {
  Scene_Base.prototype.update.call(this);

  if (this._spinnerDisk) {
    this._spinnerDisk.rotation += 0.1;
  }

  this._duration--;

  if (this._duration <= 0) {
    this.onLoadComplete();
  }
};

CY_Scene_Loading.prototype.onLoadComplete = function () {
  if (this._nextSceneClass) {
    SceneManager.goto(this._nextSceneClass);
  } else {
    SceneManager.goto(Scene_Map);
  }
};
