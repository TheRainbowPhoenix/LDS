//=============================================================================
// ACT_AABB - Axis-Aligned Bounding Box
//=============================================================================

/**
 * Axis-Aligned Bounding Box for collision detection.
 * 
 * @class ACT_AABB
 * @param {number} x - Left edge
 * @param {number} y - Top edge
 * @param {number} width - Width
 * @param {number} height - Height
 */
function ACT_AABB(x, y, width, height) {
    this.x = x || 0;
    this.y = y || 0;
    this.width = width || 0;
    this.height = height || 0;
}

ACT_AABB.prototype.constructor = ACT_AABB;

// Getters for edges
Object.defineProperties(ACT_AABB.prototype, {
    left: {
        get: function() { return this.x; },
        set: function(value) { this.x = value; }
    },
    right: {
        get: function() { return this.x + this.width; },
        set: function(value) { this.width = value - this.x; }
    },
    top: {
        get: function() { return this.y; },
        set: function(value) { this.y = value; }
    },
    bottom: {
        get: function() { return this.y + this.height; },
        set: function(value) { this.height = value - this.y; }
    },
    centerX: {
        get: function() { return this.x + this.width / 2; }
    },
    centerY: {
        get: function() { return this.y + this.height / 2; }
    },
    halfWidth: {
        get: function() { return this.width / 2; }
    },
    halfHeight: {
        get: function() { return this.height / 2; }
    }
});

/**
 * Set all properties
 */
ACT_AABB.prototype.set = function(x, y, width, height) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    return this;
};

/**
 * Copy from another AABB
 */
ACT_AABB.prototype.copy = function(aabb) {
    this.x = aabb.x;
    this.y = aabb.y;
    this.width = aabb.width;
    this.height = aabb.height;
    return this;
};

/**
 * Clone this AABB
 */
ACT_AABB.prototype.clone = function() {
    return new ACT_AABB(this.x, this.y, this.width, this.height);
};

/**
 * Check if point is inside
 */
ACT_AABB.prototype.contains = function(x, y) {
    return x >= this.left && x <= this.right &&
           y >= this.top && y <= this.bottom;
};

/**
 * Check if another AABB intersects
 */
ACT_AABB.prototype.intersects = function(aabb) {
    return !(this.right < aabb.left || 
             this.left > aabb.right ||
             this.bottom < aabb.top || 
             this.top > aabb.bottom);
};

/**
 * Get intersection rectangle (or null if no intersection)
 */
ACT_AABB.prototype.intersection = function(aabb) {
    if (!this.intersects(aabb)) return null;
    
    var x = Math.max(this.left, aabb.left);
    var y = Math.max(this.top, aabb.top);
    var width = Math.min(this.right, aabb.right) - x;
    var height = Math.min(this.bottom, aabb.bottom) - y;
    
    return new ACT_AABB(x, y, width, height);
};

/**
 * Get overlap amounts on each axis
 */
ACT_AABB.prototype.getOverlap = function(aabb) {
    var overlapX = 0;
    var overlapY = 0;
    
    if (this.intersects(aabb)) {
        // Calculate overlap on X axis
        if (this.centerX < aabb.centerX) {
            overlapX = this.right - aabb.left;
        } else {
            overlapX = -(aabb.right - this.left);
        }
        
        // Calculate overlap on Y axis
        if (this.centerY < aabb.centerY) {
            overlapY = this.bottom - aabb.top;
        } else {
            overlapY = -(aabb.bottom - this.top);
        }
    }
    
    return { x: overlapX, y: overlapY };
};

/**
 * Expand by amount on all sides
 */
ACT_AABB.prototype.expand = function(amount) {
    this.x -= amount;
    this.y -= amount;
    this.width += amount * 2;
    this.height += amount * 2;
    return this;
};

/**
 * Union with another AABB (smallest AABB containing both)
 */
ACT_AABB.prototype.union = function(aabb) {
    var x = Math.min(this.left, aabb.left);
    var y = Math.min(this.top, aabb.top);
    var right = Math.max(this.right, aabb.right);
    var bottom = Math.max(this.bottom, aabb.bottom);
    
    this.x = x;
    this.y = y;
    this.width = right - x;
    this.height = bottom - y;
    return this;
};

/**
 * Create from center point and half-extents
 */
ACT_AABB.fromCenter = function(cx, cy, halfWidth, halfHeight) {
    return new ACT_AABB(
        cx - halfWidth,
        cy - halfHeight,
        halfWidth * 2,
        halfHeight * 2
    );
};
