//=============================================================================
// ACT_Input - Extended Input Handling
//=============================================================================

/**
 * Extended input handling for action gameplay.
 * Adds action-specific button mappings.
 */

(function() {
    
    // Add action-specific key mappings
    var _Input_keyMapper = Input.keyMapper;
    
    // Z key for jump (if not already mapped)
    if (!Input.keyMapper[90]) {
        Input.keyMapper[90] = 'jump'; // Z
    }
    
    // X key for attack
    if (!Input.keyMapper[88]) {
        Input.keyMapper[88] = 'attack'; // X
    }
    
    // C key for dash
    if (!Input.keyMapper[67]) {
        Input.keyMapper[67] = 'dash'; // C
    }
    
    // Space for jump (alternative)
    if (!Input.keyMapper[32]) {
        Input.keyMapper[32] = 'jump'; // Space
    }
    
    // Gamepad mappings
    var _Input_gamepadMapper = Input.gamepadMapper;
    
    // A button for jump
    Input.gamepadMapper[0] = 'jump';
    // B button for attack  
    Input.gamepadMapper[1] = 'attack';
    // X button for dash
    Input.gamepadMapper[2] = 'dash';
    // Y button for special
    Input.gamepadMapper[3] = 'special';
    // Start for menu
    Input.gamepadMapper[9] = 'menu';
    
})();

/**
 * Input helper for action controls
 */
ACT.Input = {
    /**
     * Get horizontal input (-1, 0, or 1)
     */
    getHorizontal: function() {
        if (Input.isPressed('left')) return -1;
        if (Input.isPressed('right')) return 1;
        return 0;
    },
    
    /**
     * Get vertical input (-1, 0, or 1)
     */
    getVertical: function() {
        if (Input.isPressed('up')) return -1;
        if (Input.isPressed('down')) return 1;
        return 0;
    },
    
    /**
     * Check if jump pressed
     */
    isJumpPressed: function() {
        return Input.isPressed('jump') || Input.isPressed('ok');
    },
    
    /**
     * Check if jump just triggered
     */
    isJumpTriggered: function() {
        return Input.isTriggered('jump') || Input.isTriggered('ok');
    },
    
    /**
     * Check if attack pressed
     */
    isAttackPressed: function() {
        return Input.isPressed('attack');
    },
    
    /**
     * Check if attack just triggered
     */
    isAttackTriggered: function() {
        return Input.isTriggered('attack');
    },
    
    /**
     * Check if dash pressed
     */
    isDashPressed: function() {
        return Input.isPressed('dash') || Input.isPressed('shift');
    },
    
    /**
     * Check if dash just triggered
     */
    isDashTriggered: function() {
        return Input.isTriggered('dash') || Input.isTriggered('shift');
    }
};
