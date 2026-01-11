//=============================================================================
// CY_Scene_MenuBase.js
//=============================================================================

/*:
 * @plugindesc Cyberpunk UI Mod - Menu Base Scene
 * @author Cyberpunk UI Mod
 *
 * @help
 * CY_Scene_MenuBase - Base class for Cyberpunk-styled menu scenes.
 * Provides common functionality:
 * - Full screen gradient background (dark red to black)
 * - CRT lens distortion shader with ghosting
 * - Edge noise glitch effects
 * - Lens padding compensation
 *
 * This plugin requires CY_System.js to be loaded first.
 */

//-----------------------------------------------------------------------------
// CY_Scene_MenuBase
//
// Base class for Cyberpunk-styled menu scenes.
//-----------------------------------------------------------------------------

function CY_Scene_MenuBase() {
    this.initialize.apply(this, arguments);
}

CY_Scene_MenuBase.prototype = Object.create(Scene_MenuBase.prototype);
CY_Scene_MenuBase.prototype.constructor = CY_Scene_MenuBase;

//-----------------------------------------------------------------------------
// Constants
//-----------------------------------------------------------------------------

CY_Scene_MenuBase.LENS_PADDING = 100; // Padding to compensate for CRT lens distortion
CY_Scene_MenuBase.TOP_BAR_HEIGHT = 48;
CY_Scene_MenuBase.ACTION_BAR_HEIGHT = 48;

//-----------------------------------------------------------------------------
// Initialization
//-----------------------------------------------------------------------------

CY_Scene_MenuBase.prototype.initialize = function() {
    Scene_MenuBase.prototype.initialize.call(this);
};

//-----------------------------------------------------------------------------
// Scene Lifecycle
//-----------------------------------------------------------------------------

CY_Scene_MenuBase.prototype.create = function() {
    Scene_MenuBase.prototype.create.call(this);
    this.createGradientBackground();
};

CY_Scene_MenuBase.prototype.start = function() {
    Scene_MenuBase.prototype.start.call(this);
    this.applyCRTFilter();
};

CY_Scene_MenuBase.prototype.update = function() {
    Scene_MenuBase.prototype.update.call(this);
    this.updateCRTFilter();
};

//-----------------------------------------------------------------------------
// Background - Full Screen Gradient
//-----------------------------------------------------------------------------

/**
 * Override createBackground to use custom gradient.
 */
CY_Scene_MenuBase.prototype.createBackground = function() {
    this._backgroundSprite = new Sprite();
    this._backgroundSprite.bitmap = new Bitmap(Graphics.width, Graphics.height);
    this.addChild(this._backgroundSprite);
};

/**
 * Create the gradient background.
 * Top: #39141B, Center: #06060E, Bottom: #08090E
 */
CY_Scene_MenuBase.prototype.createGradientBackground = function() {
    if (!this._backgroundSprite) return;
    
    var bmp = this._backgroundSprite.bitmap;
    var ctx = bmp._context;
    var w = Graphics.width;
    var h = Graphics.height;
    
    // Create vertical gradient
    var gradient = ctx.createLinearGradient(0, 0, 0, h);
    gradient.addColorStop(0, '#39141B');    // Top - dark red
    gradient.addColorStop(0.5, '#06060E');  // Center - very dark
    gradient.addColorStop(1, '#08090E');    // Bottom - near black
    
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, w, h);
    
    bmp._baseTexture.update();
};

//-----------------------------------------------------------------------------
// Screen Offset Helpers
//-----------------------------------------------------------------------------

/**
 * Calculate the offset needed to go from boxWidth/boxHeight to full screen.
 */
CY_Scene_MenuBase.prototype.getScreenOffsets = function() {
    return {
        x: -Math.floor((Graphics.width - Graphics.boxWidth) / 2),
        y: -Math.floor((Graphics.height - Graphics.boxHeight) / 2),
        fullWidth: Graphics.width,
        fullHeight: Graphics.height
    };
};

/**
 * Get the lens padding value.
 */
CY_Scene_MenuBase.prototype.getLensPadding = function() {
    return CY_Scene_MenuBase.LENS_PADDING;
};

/**
 * Make a window fully transparent (no background).
 */
CY_Scene_MenuBase.prototype.makeWindowTransparent = function(window) {
    window.opacity = 0;
    if (window._cyBackSprite) {
        window._cyBackSprite.bitmap.clear();
        window._cyBackSprite.visible = false;
    }
};

//-----------------------------------------------------------------------------
// CRT Lens Distortion Shader
//-----------------------------------------------------------------------------

/**
 * Apply CRT lens distortion filter to the entire scene.
 */
CY_Scene_MenuBase.prototype.applyCRTFilter = function() {
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
        
        float rand(vec2 co) {
            return fract(sin(dot(co.xy, vec2(12.9898, 78.233))) * 43758.5453);
        }
        
        vec2 pincushionDistortion(vec2 coord, float amt) {
            vec2 cc = coord - 0.5;
            float dist = dot(cc, cc);
            return coord + cc * dist * (-amt);
        }
        
        void main(void) {
            vec2 uv = pincushionDistortion(vTextureCoord, uDistortion);
            
            if (uv.x < 0.0 || uv.x > 1.0 || uv.y < 0.0 || uv.y > 1.0) {
                gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0);
                return;
            }
            
            vec4 color = texture2D(uSampler, uv);
            
            vec2 ghostUV = pincushionDistortion(vTextureCoord + vec2(uGhostOffset, uGhostOffset * 0.6), uDistortion);
            if (ghostUV.x >= 0.0 && ghostUV.x <= 1.0 && ghostUV.y >= 0.0 && ghostUV.y <= 1.0) {
                vec4 ghost = texture2D(uSampler, ghostUV);
                color.rgb = color.rgb - ghost.rgb * uGhostOpacity;
            }
            
            float edgeWidth = uEdgeNoiseWidth;
            float leftEdge = smoothstep(0.0, edgeWidth, vTextureCoord.x);
            float rightEdge = smoothstep(0.0, edgeWidth, 1.0 - vTextureCoord.x);
            
            float blockY = floor(vTextureCoord.y * 180.0);
            float blockTime = floor(uTime * 8.0);
            
            if (vTextureCoord.x < edgeWidth) {
                float noiseVal = rand(vec2(blockY * 0.1, blockTime + 1.0));
                float glitchChance = rand(vec2(blockY, blockTime * 0.5));
                if (glitchChance > 0.985) {
                    float intensity = noiseVal * 0.4 * (1.0 - leftEdge);
                    color.rgb += vec3(intensity * 0.3, intensity * 0.8, intensity * 0.9);
                } else if (glitchChance > 0.85) {
                    color.rgb *= leftEdge + 0.1;
                }
            }
            
            if (vTextureCoord.x > 1.0 - edgeWidth) {
                float noiseVal = rand(vec2(blockY * 0.1 + 100.0, blockTime + 2.0));
                float glitchChance = rand(vec2(blockY + 50.0, blockTime * 0.5 + 1.0));
                if (glitchChance > 0.985) {
                    float intensity = noiseVal * 0.4 * (1.0 - rightEdge);
                    color.rgb += vec3(intensity * 0.2, intensity * 0.7, intensity * 0.8);
                } else if (glitchChance > 0.85) {
                    color.rgb *= rightEdge + 0.1;
                }
            }
            
            float scanline = sin(uv.y * 600.0) * 0.5 + 0.5;
            scanline = pow(scanline, 3.0) * 0.015;
            color.rgb -= scanline;
            
            float vignette = 1.0 - dot(vTextureCoord - 0.5, vTextureCoord - 0.5) * 0.3;
            color.rgb *= vignette;
            
            gl_FragColor = color;
        }
    `;
    
    try {
        this._crtFilter = new PIXI.Filter(null, crtFragmentShader, {
            uTime: 0.0,
            uDistortion: 0.16,
            uGhostOffset: 0.002,
            uGhostOpacity: 0.12,
            uEdgeNoiseWidth: 0.025
        });
        
        var crtEnabled = ConfigManager.crtShader !== false;
        if (crtEnabled) {
            this.filters = [this._crtFilter];
        }
        this._crtTime = 0;
    } catch (e) {
        console.warn('CRT filter not supported:', e);
    }
};

/**
 * Update CRT shader.
 */
CY_Scene_MenuBase.prototype.updateCRTFilter = function() {
    var crtEnabled = ConfigManager.crtShader !== false;
    
    if (this._crtFilter) {
        if (crtEnabled && !this.filters) {
            this.filters = [this._crtFilter];
        } else if (!crtEnabled && this.filters) {
            this.filters = null;
        }
        
        if (crtEnabled && this._crtFilter.uniforms) {
            this._crtTime += 0.016;
            this._crtFilter.uniforms.uTime = this._crtTime;
        }
    }
};
