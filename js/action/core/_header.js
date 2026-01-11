//=============================================================================
// Action Core - Physics and Utilities
//=============================================================================
// This module provides the core physics engine and utility functions for
// the action platformer system. It is designed to work alongside RPG Maker's
// existing systems while providing arcade-style physics.
//=============================================================================

/**
 * @namespace ACT
 * @description Global namespace for the Action Platformer system
 */
var ACT = ACT || {};

/**
 * Version information
 */
ACT.VERSION = '1.0.0';

/**
 * Physics constants - can be overridden per-map or globally
 */
ACT.Config = {
    // Physics
    GRAVITY: 0.4,
    MAX_FALL_SPEED: 12,
    FRICTION_GROUND: 0.85,
    FRICTION_AIR: 0.95,
    
    // Tile size (matches RPG Maker)
    TILE_WIDTH: 48,
    TILE_HEIGHT: 48,
    
    // Collision
    OVERLAP_BIAS: 4,
    TILE_BIAS: 16,
    
    // Timing
    FIXED_DELTA: 1000 / 60, // 60 FPS target
    
    // Debug
    DEBUG_PHYSICS: false,
    DEBUG_COLLISION: false
};
