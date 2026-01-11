//=============================================================================
// ACT_Utils - Utility Functions
//=============================================================================

/**
 * Utility functions for the action system.
 */
ACT.Utils = {
    /**
     * Clamp a value between min and max
     */
    clamp: function(value, min, max) {
        return Math.max(min, Math.min(max, value));
    },
    
    /**
     * Linear interpolation
     */
    lerp: function(a, b, t) {
        return a + (b - a) * t;
    },
    
    /**
     * Smooth step interpolation
     */
    smoothStep: function(a, b, t) {
        t = t * t * (3 - 2 * t);
        return a + (b - a) * t;
    },
    
    /**
     * Random integer between min and max (inclusive)
     */
    randomInt: function(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    },
    
    /**
     * Random float between min and max
     */
    randomFloat: function(min, max) {
        return Math.random() * (max - min) + min;
    },
    
    /**
     * Convert degrees to radians
     */
    degToRad: function(degrees) {
        return degrees * Math.PI / 180;
    },
    
    /**
     * Convert radians to degrees
     */
    radToDeg: function(radians) {
        return radians * 180 / Math.PI;
    },
    
    /**
     * Distance between two points
     */
    distance: function(x1, y1, x2, y2) {
        var dx = x2 - x1;
        var dy = y2 - y1;
        return Math.sqrt(dx * dx + dy * dy);
    },
    
    /**
     * Angle between two points (radians)
     */
    angle: function(x1, y1, x2, y2) {
        return Math.atan2(y2 - y1, x2 - x1);
    },
    
    /**
     * Normalize angle to -PI to PI range
     */
    normalizeAngle: function(angle) {
        while (angle > Math.PI) angle -= Math.PI * 2;
        while (angle < -Math.PI) angle += Math.PI * 2;
        return angle;
    },
    
    /**
     * Check if point is in rectangle
     */
    pointInRect: function(px, py, rx, ry, rw, rh) {
        return px >= rx && px <= rx + rw && py >= ry && py <= ry + rh;
    },
    
    /**
     * Check if two rectangles overlap
     */
    rectsOverlap: function(r1x, r1y, r1w, r1h, r2x, r2y, r2w, r2h) {
        return !(r1x + r1w < r2x || r2x + r2w < r1x ||
                 r1y + r1h < r2y || r2y + r2h < r1y);
    },
    
    /**
     * Sign of a number (-1, 0, or 1)
     */
    sign: function(value) {
        if (value > 0) return 1;
        if (value < 0) return -1;
        return 0;
    },
    
    /**
     * Approach a target value by a step amount
     */
    approach: function(current, target, step) {
        if (current < target) {
            return Math.min(current + step, target);
        } else {
            return Math.max(current - step, target);
        }
    },
    
    /**
     * Create a simple timer
     */
    createTimer: function(duration, callback) {
        return {
            duration: duration,
            elapsed: 0,
            callback: callback,
            finished: false,
            
            update: function(delta) {
                if (this.finished) return;
                
                this.elapsed += delta;
                if (this.elapsed >= this.duration) {
                    this.finished = true;
                    if (this.callback) this.callback();
                }
            },
            
            reset: function() {
                this.elapsed = 0;
                this.finished = false;
            },
            
            getProgress: function() {
                return Math.min(this.elapsed / this.duration, 1);
            }
        };
    }
};

// Add clamp to Number prototype if not exists
if (!Number.prototype.clamp) {
    Number.prototype.clamp = function(min, max) {
        return Math.max(min, Math.min(max, this));
    };
}

// Add equals to Array prototype for tileset flag comparison
if (!Array.prototype.equals) {
    Array.prototype.equals = function(array) {
        if (!array) return false;
        if (this.length !== array.length) return false;
        for (var i = 0; i < this.length; i++) {
            if (this[i] !== array[i]) return false;
        }
        return true;
    };
}
