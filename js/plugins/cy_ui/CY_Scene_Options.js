//=============================================================================
// CY_Scene_Options.js
//=============================================================================

/*:
 * @plugindesc Cyberpunk UI Mod - Options Scene
 * @author Cyberpunk UI Mod
 *
 * @help
 * CY_Scene_Options - Full-screen tabbed options scene with Cyberpunk styling.
 * Extends Scene_MenuBase with:
 * - Full screen gradient background (dark red to black)
 * - Horizontal tab bar (Sound, Controls, Gameplay) - full width
 * - Centered options list with max dialog width
 * - Bottom action bar - full width
 * - Global L1/R1 tab switching from any active window
 * - Settings persistence via ConfigManager
 */

//-----------------------------------------------------------------------------
// CY_Scene_Options
//
// The full-screen tabbed options scene with Cyberpunk styling.
//-----------------------------------------------------------------------------

function CY_Scene_Options() {
    this.initialize.apply(this, arguments);
}

CY_Scene_Options.prototype = Object.create(Scene_MenuBase.prototype);
CY_Scene_Options.prototype.constructor = CY_Scene_Options;

//-----------------------------------------------------------------------------
// Constants
//-----------------------------------------------------------------------------

CY_Scene_Options.MAX_OPTIONS_WIDTH = 816; // Max width for options content
CY_Scene_Options.TAB_BAR_HEIGHT = 48;
CY_Scene_Options.ACTION_BAR_HEIGHT = 48;
CY_Scene_Options.LENS_PADDING = 26; // Padding to compensate for CRT lens distortion

//-----------------------------------------------------------------------------
// Initialization
//-----------------------------------------------------------------------------

CY_Scene_Options.prototype.initialize = function() {
    Scene_MenuBase.prototype.initialize.call(this);
};

//-----------------------------------------------------------------------------
// Scene Lifecycle
//-----------------------------------------------------------------------------

CY_Scene_Options.prototype.create = function() {
    Scene_MenuBase.prototype.create.call(this);
    this.createGradientBackground();
    this.createTabBar();
    this.createOptionsWindow();
    this.createActionBar();
    this.applyCRTFilter();
};

CY_Scene_Options.prototype.terminate = function() {
    Scene_MenuBase.prototype.terminate.call(this);
    ConfigManager.save();
};

CY_Scene_Options.prototype.start = function() {
    Scene_MenuBase.prototype.start.call(this);
    this._tabBar.activate();
    this._lastFocus = 'tabBar';
    this.updateActionBar();
};

//-----------------------------------------------------------------------------
// Background - Full Screen Gradient
//-----------------------------------------------------------------------------

/**
 * Override createBackground to use custom gradient.
 */
CY_Scene_Options.prototype.createBackground = function() {
    // Don't call parent - we create our own background
    this._backgroundSprite = new Sprite();
    this._backgroundSprite.bitmap = new Bitmap(Graphics.width, Graphics.height);
    this.addChild(this._backgroundSprite);
};

/**
 * Create the gradient background.
 * Top: #39141B, Center: #06060E, Bottom: #08090E
 */
CY_Scene_Options.prototype.createGradientBackground = function() {
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
// CRT Lens Distortion Shader with Ghosting
//-----------------------------------------------------------------------------

/**
 * Apply CRT lens distortion filter to the entire scene.
 * Creates pincushion distortion (concave/inward curved edges), sharp ghost shadow,
 * and edge noise trail glitch effect (dead pixel lines on left/right edges).
 */
CY_Scene_Options.prototype.applyCRTFilter = function() {
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
        
        // Pseudo-random function
        float rand(vec2 co) {
            return fract(sin(dot(co.xy, vec2(12.9898, 78.233))) * 43758.5453);
        }
        
        // Pincushion distortion function (concave - edges curve inward)
        vec2 pincushionDistortion(vec2 coord, float amt) {
            vec2 cc = coord - 0.5;
            float dist = dot(cc, cc);
            // Negative amount creates pincushion (concave) effect
            return coord + cc * dist * (-amt);
        }
        
        void main(void) {
            // Apply pincushion distortion for concave CRT lens curve effect
            vec2 uv = pincushionDistortion(vTextureCoord, uDistortion);
            
            // Check if we're outside the screen after distortion
            if (uv.x < 0.0 || uv.x > 1.0 || uv.y < 0.0 || uv.y > 1.0) {
                gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0);
                return;
            }
            
            // Sample main color - no blur, sharp sampling
            vec4 color = texture2D(uSampler, uv);
            
            // Sharp ghost shadow effect - offset sample without any blur
            vec2 ghostUV = pincushionDistortion(vTextureCoord + vec2(uGhostOffset, uGhostOffset * 0.6), uDistortion);
            if (ghostUV.x >= 0.0 && ghostUV.x <= 1.0 && ghostUV.y >= 0.0 && ghostUV.y <= 1.0) {
                vec4 ghost = texture2D(uSampler, ghostUV);
                // Blend ghost as a sharp darker shadow behind (additive dark)
                color.rgb = color.rgb - ghost.rgb * uGhostOpacity;
            }
            
            // Edge noise trail glitch effect (dead pixel lines on left and right edges)
            float edgeWidth = uEdgeNoiseWidth;
            float leftEdge = smoothstep(0.0, edgeWidth, vTextureCoord.x);
            float rightEdge = smoothstep(0.0, edgeWidth, 1.0 - vTextureCoord.x);
            
            // Create blocky noise pattern (6px x 2px rectangles feel)
            float blockY = floor(vTextureCoord.y * 180.0); // Vertical blocks
            float blockTime = floor(uTime * 8.0); // Slow movement
            
            // Left edge glitch
            if (vTextureCoord.x < edgeWidth) {
                float noiseVal = rand(vec2(blockY * 0.1, blockTime + 1.0));
                float glitchChance = rand(vec2(blockY, blockTime * 0.5));
                
                // Random glitch blocks - some bright, some dark (dead pixels)
                if (glitchChance > 0.985) {
                    // Bright glitch pixel
                    float intensity = noiseVal * 0.4 * (1.0 - leftEdge);
                    color.rgb += vec3(intensity * 0.3, intensity * 0.8, intensity * 0.9);
                } else if (glitchChance > 0.85) {
                    // Dark dead pixel
                    color.rgb *= leftEdge + 0.1;
                }
            }
            
            // Right edge glitch
            if (vTextureCoord.x > 1.0 - edgeWidth) {
                float noiseVal = rand(vec2(blockY * 0.1 + 100.0, blockTime + 2.0));
                float glitchChance = rand(vec2(blockY + 50.0, blockTime * 0.5 + 1.0));
                
                // Random glitch blocks
                if (glitchChance > 0.985) {
                    // Bright glitch pixel (cyan-ish)
                    float intensity = noiseVal * 0.4 * (1.0 - rightEdge);
                    color.rgb += vec3(intensity * 0.2, intensity * 0.7, intensity * 0.8);
                } else if (glitchChance > 0.85) {
                    // Dark dead pixel
                    color.rgb *= rightEdge + 0.1;
                }
            }
            
            // Very subtle scanlines (reduced to not affect readability)
            float scanline = sin(uv.y * 600.0) * 0.5 + 0.5;
            scanline = pow(scanline, 3.0) * 0.015;
            color.rgb -= scanline;
            
            // Slight vignette at edges
            float vignette = 1.0 - dot(vTextureCoord - 0.5, vTextureCoord - 0.5) * 0.3;
            color.rgb *= vignette;
            
            gl_FragColor = color;
        }
    `;
    
    try {
        this._crtFilter = new PIXI.Filter(null, crtFragmentShader, {
            uTime: 0.0,
            uDistortion: 0.16,      // Pincushion distortion amount (2x stronger)
            uGhostOffset: 0.002,    // Sharp ghost shadow offset
            uGhostOpacity: 0.12,    // Ghost shadow opacity (subtle but visible)
            uEdgeNoiseWidth: 0.025  // Width of edge noise effect (2.5% of screen)
        });
        
        // Apply filter to the entire scene
        this.filters = [this._crtFilter];
        this._crtTime = 0;
    } catch (e) {
        console.warn('CRT filter not supported:', e);
    }
};

/**
 * Update CRT shader time uniform for animation.
 */
CY_Scene_Options.prototype.updateCRTFilter = function() {
    if (this._crtFilter && this._crtFilter.uniforms) {
        this._crtTime += 0.016;
        this._crtFilter.uniforms.uTime = this._crtTime;
    }
};


//-----------------------------------------------------------------------------
// Window Creation - Full Width Tab Bar and Action Bar, Centered Options
//-----------------------------------------------------------------------------

/**
 * Calculate the offset needed to go from boxWidth/boxHeight to full screen.
 */
CY_Scene_Options.prototype.getScreenOffsets = function() {
    return {
        x: -Math.floor((Graphics.width - Graphics.boxWidth) / 2),
        y: -Math.floor((Graphics.height - Graphics.boxHeight) / 2),
        fullWidth: Graphics.width,
        fullHeight: Graphics.height
    };
};

/**
 * Create the tab bar window - centered at top with fixed width.
 */
CY_Scene_Options.prototype.createTabBar = function() {
    var offsets = this.getScreenOffsets();
    var lensPadding = CY_Scene_Options.LENS_PADDING;
    
    this._tabBar = new CY_Window_TabBar(['SOUND', 'CONTROLS', 'GAMEPLAY']);
    // Center the tab bar horizontally, add top padding for lens compensation
    var tabBarX = Math.floor((Graphics.boxWidth - this._tabBar.width) / 2);
    var tabBarY = offsets.y + lensPadding;
    this._tabBar.move(tabBarX, tabBarY, this._tabBar.width, this._tabBar.height);
    this._tabBar.setHandler('ok', this.onTabOk.bind(this));
    this._tabBar.setHandler('cancel', this.popScene.bind(this));
    this._tabBar.opacity = 0; // Transparent window chrome
    // Make the custom CY background fully transparent
    if (this._tabBar._cyBackSprite) {
        this._tabBar._cyBackSprite.bitmap.clear();
        this._tabBar._cyBackSprite.visible = false;
    }
    this.addWindow(this._tabBar);
};

/**
 * Create the options window - centered with max width, transparent background.
 */
CY_Scene_Options.prototype.createOptionsWindow = function() {
    var offsets = this.getScreenOffsets();
    var lensPadding = CY_Scene_Options.LENS_PADDING;
    var maxWidth = CY_Scene_Options.MAX_OPTIONS_WIDTH;
    var width = Math.min(maxWidth, Graphics.boxWidth - 40);
    var x = Math.floor((Graphics.boxWidth - width) / 2); // Centered within boxWidth
    // Position below tab bar with lens padding
    var y = offsets.y + lensPadding + CY_Scene_Options.TAB_BAR_HEIGHT;
    // Height accounts for both top and bottom lens padding
    var height = offsets.fullHeight - CY_Scene_Options.TAB_BAR_HEIGHT - CY_Scene_Options.ACTION_BAR_HEIGHT - (lensPadding * 2);

    this._optionsWindow = new CY_Window_OptionsList(x, y, width, height);
    this._optionsWindow.setHandler('cancel', this.onOptionsCancel.bind(this));
    this._optionsWindow.opacity = 0; // Transparent window chrome
    // Make the custom CY background fully transparent
    if (this._optionsWindow._cyBackSprite) {
        this._optionsWindow._cyBackSprite.bitmap.clear();
        this._optionsWindow._cyBackSprite.visible = false;
    }
    this.addWindow(this._optionsWindow);
    
    this.loadTabOptions(0);
};

/**
 * Create the action bar window - full width at bottom.
 */
CY_Scene_Options.prototype.createActionBar = function() {
    var offsets = this.getScreenOffsets();
    var lensPadding = CY_Scene_Options.LENS_PADDING;
    var width = offsets.fullWidth;
    var height = CY_Scene_Options.ACTION_BAR_HEIGHT;
    // Position with bottom lens padding
    var y = offsets.fullHeight - height - lensPadding + offsets.y;
    
    this._actionBar = new CY_Window_ActionBar();
    this._actionBar.move(offsets.x, y, width, height);
    this._actionBar.opacity = 0; // Transparent window chrome
    // Make the custom CY background fully transparent
    if (this._actionBar._cyBackSprite) {
        this._actionBar._cyBackSprite.bitmap.clear();
        this._actionBar._cyBackSprite.visible = false;
    }
    this.updateActionBar();
    this.addWindow(this._actionBar);
};

/**
 * Update action bar based on current active window.
 */
CY_Scene_Options.prototype.updateActionBar = function() {
    if (!this._actionBar) return;
    
    var actions = [];
    
    if (this._tabBar && this._tabBar.active) {
        actions = [
            { button: 'B', label: 'Back' },
            { button: 'L1', label: 'Prev Tab' },
            { button: 'R1', label: 'Next Tab' },
            { button: 'A', label: 'Select' }
        ];
    } else if (this._optionsWindow && this._optionsWindow.active) {
        actions = [
            { button: 'B', label: 'Back' },
            { button: 'L1', label: 'Prev Tab' },
            { button: 'R1', label: 'Next Tab' },
            { button: 'A', label: 'Adjust' }
        ];
    } else {
        actions = [
            { button: 'B', label: 'Close' },
            { button: 'A', label: 'Select' }
        ];
    }
    
    this._actionBar.setActions(actions);
};

//-----------------------------------------------------------------------------
// Data Logic
//-----------------------------------------------------------------------------

CY_Scene_Options.prototype.loadTabOptions = function(tabIndex) {
    var options = [];
    
    switch (tabIndex) {
        case 0: // SOUND
            options = [
                { type: 'header', label: 'Volume' },
                { type: 'slider', label: 'Master Volume', symbol: 'bgmVolume', step: 20 },
                { type: 'slider', label: 'SFX Volume', symbol: 'seVolume', step: 20 },
                { type: 'slider', label: 'Music Volume', symbol: 'meVolume', step: 20 },
                { type: 'header', label: 'Misc' },
                { type: 'toggle', label: 'Mute Detection Sounds', symbol: 'muteDetection' }
            ];
            break;
            
        case 1: // CONTROLS
            options = [
                { type: 'header', label: 'Input' },
                { type: 'toggle', label: 'Always Dash', symbol: 'alwaysDash' },
                { type: 'toggle', label: 'Command Remember', symbol: 'commandRemember' }
            ];
            break;
            
        case 2: // GAMEPLAY
            options = [
                { type: 'header', label: 'Display' },
                { type: 'toggle', label: 'Show Damage Numbers', symbol: 'showDamage' },
                { type: 'header', label: 'Subtitles' },
                { type: 'toggle', label: 'Cinematic', symbol: 'subtitlesCinematic' },
                { type: 'toggle', label: 'Overhead', symbol: 'subtitlesOverhead' }
            ];
            break;
    }
    
    this._optionsWindow.setOptions(options);
};

//-----------------------------------------------------------------------------
// Handler Methods
//-----------------------------------------------------------------------------

CY_Scene_Options.prototype.onTabOk = function() {
    this.loadTabOptions(this._tabBar.index());
    this._optionsWindow.activate();
    this._optionsWindow.select(0);
    this.updateActionBar();
};

CY_Scene_Options.prototype.onOptionsCancel = function() {
    this._optionsWindow.deselect();
    this._tabBar.activate();
    this.updateActionBar();
};

//-----------------------------------------------------------------------------
// Input & Update
//-----------------------------------------------------------------------------

CY_Scene_Options.prototype.update = function() {
    Scene_MenuBase.prototype.update.call(this);
    
    // Update CRT shader animation
    this.updateCRTFilter();
    if (Input.isTriggered('pageup')) {
        this.switchTab(-1);
    } else if (Input.isTriggered('pagedown')) {
        this.switchTab(1);
    }
    
    // Handle tab bar clicks even when options window is active
    this.updateTabBarClick();
    
    this.updateActionBarOnFocusChange();
};

/**
 * Check for mouse clicks on the tab bar and switch tabs accordingly.
 * This allows clicking tabs even when the options window has focus.
 */
CY_Scene_Options.prototype.updateTabBarClick = function() {
    if (TouchInput.isTriggered() && this._tabBar) {
        var tabIndex = this._tabBar.getTabIndexAt(TouchInput.x, TouchInput.y);
        if (tabIndex >= 0 && tabIndex !== this._tabBar.index()) {
            // Switch to clicked tab
            this._tabBar.select(tabIndex);
            this.loadTabOptions(tabIndex);
            
            // If options window was active, keep it active but reset selection
            if (this._optionsWindow.active) {
                this._optionsWindow.select(0);
            }
            
            SoundManager.playCursor();
        } else if (tabIndex >= 0 && this._optionsWindow.active) {
            // Clicked on current tab while options active - switch focus to tab bar
            this._optionsWindow.deactivate();
            this._optionsWindow.deselect();
            this._tabBar.activate();
            this.updateActionBar();
            SoundManager.playCursor();
        }
    }
};

CY_Scene_Options.prototype.updateActionBarOnFocusChange = function() {
    var currentFocus = this._tabBar.active ? 'tabBar' : 
                       this._optionsWindow.active ? 'options' : 'none';
    
    if (this._lastFocus !== currentFocus) {
        this._lastFocus = currentFocus;
        this.updateActionBar();
    }
};

CY_Scene_Options.prototype.switchTab = function(direction) {
    var tabCount = 3;
    var currentIndex = this._tabBar.index();
    var newIndex = (currentIndex + direction + tabCount) % tabCount;
    
    this._tabBar.select(newIndex);
    this.loadTabOptions(newIndex);
    
    if (this._optionsWindow.active) {
        this._optionsWindow.select(0);
    }
    
    SoundManager.playCursor();
};
