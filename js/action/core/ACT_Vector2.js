//=============================================================================
// ACT_Vector2 - 2D Vector Mathematics
//=============================================================================

/**
 * A simple 2D vector class for physics calculations.
 * 
 * @class ACT_Vector2
 * @param {number} x - X component
 * @param {number} y - Y component
 */
function ACT_Vector2(x, y) {
    this.x = x || 0;
    this.y = y || 0;
}

ACT_Vector2.prototype.constructor = ACT_Vector2;

/**
 * Set both components
 * @param {number} x 
 * @param {number} y 
 * @returns {ACT_Vector2} this
 */
ACT_Vector2.prototype.set = function(x, y) {
    this.x = x;
    this.y = y;
    return this;
};

/**
 * Copy from another vector
 * @param {ACT_Vector2} v 
 * @returns {ACT_Vector2} this
 */
ACT_Vector2.prototype.copy = function(v) {
    this.x = v.x;
    this.y = v.y;
    return this;
};

/**
 * Clone this vector
 * @returns {ACT_Vector2} new vector
 */
ACT_Vector2.prototype.clone = function() {
    return new ACT_Vector2(this.x, this.y);
};

/**
 * Add another vector
 * @param {ACT_Vector2} v 
 * @returns {ACT_Vector2} this
 */
ACT_Vector2.prototype.add = function(v) {
    this.x += v.x;
    this.y += v.y;
    return this;
};

/**
 * Subtract another vector
 * @param {ACT_Vector2} v 
 * @returns {ACT_Vector2} this
 */
ACT_Vector2.prototype.subtract = function(v) {
    this.x -= v.x;
    this.y -= v.y;
    return this;
};

/**
 * Multiply by scalar
 * @param {number} s 
 * @returns {ACT_Vector2} this
 */
ACT_Vector2.prototype.multiply = function(s) {
    this.x *= s;
    this.y *= s;
    return this;
};

/**
 * Get magnitude (length)
 * @returns {number}
 */
ACT_Vector2.prototype.magnitude = function() {
    return Math.sqrt(this.x * this.x + this.y * this.y);
};

/**
 * Normalize to unit vector
 * @returns {ACT_Vector2} this
 */
ACT_Vector2.prototype.normalize = function() {
    var mag = this.magnitude();
    if (mag > 0) {
        this.x /= mag;
        this.y /= mag;
    }
    return this;
};

/**
 * Dot product with another vector
 * @param {ACT_Vector2} v 
 * @returns {number}
 */
ACT_Vector2.prototype.dot = function(v) {
    return this.x * v.x + this.y * v.y;
};

/**
 * Distance to another vector
 * @param {ACT_Vector2} v 
 * @returns {number}
 */
ACT_Vector2.prototype.distanceTo = function(v) {
    var dx = v.x - this.x;
    var dy = v.y - this.y;
    return Math.sqrt(dx * dx + dy * dy);
};

/**
 * Angle to another vector (radians)
 * @param {ACT_Vector2} v 
 * @returns {number}
 */
ACT_Vector2.prototype.angleTo = function(v) {
    return Math.atan2(v.y - this.y, v.x - this.x);
};

/**
 * Linear interpolation
 * @param {ACT_Vector2} v 
 * @param {number} t - 0 to 1
 * @returns {ACT_Vector2} this
 */
ACT_Vector2.prototype.lerp = function(v, t) {
    this.x += (v.x - this.x) * t;
    this.y += (v.y - this.y) * t;
    return this;
};

/**
 * Reset to zero
 * @returns {ACT_Vector2} this
 */
ACT_Vector2.prototype.reset = function() {
    this.x = 0;
    this.y = 0;
    return this;
};

// Static helper methods
ACT_Vector2.add = function(a, b) {
    return new ACT_Vector2(a.x + b.x, a.y + b.y);
};

ACT_Vector2.subtract = function(a, b) {
    return new ACT_Vector2(a.x - b.x, a.y - b.y);
};

ACT_Vector2.distance = function(a, b) {
    return a.distanceTo(b);
};

ACT_Vector2.ZERO = function() {
    return new ACT_Vector2(0, 0);
};

ACT_Vector2.UP = function() {
    return new ACT_Vector2(0, -1);
};

ACT_Vector2.DOWN = function() {
    return new ACT_Vector2(0, 1);
};

ACT_Vector2.LEFT = function() {
    return new ACT_Vector2(-1, 0);
};

ACT_Vector2.RIGHT = function() {
    return new ACT_Vector2(1, 0);
};
