//=============================================================================
// CY_Window_TabBar.js
//=============================================================================

/*:
 * @plugindesc Cyberpunk UI Mod - Tab Bar Window Class
 * @author Cyberpunk UI Mod
 *
 * @help
 * CY_Window_TabBar - Horizontal tab navigation bar for the options screen.
 * Extends CY_Window_Selectable with custom tab styling:
 * - Horizontal layout with maxCols = tab count
 * - Cyan underline for selected tab
 * - L1/R1 indicators on left/right edges
 * - Pageup/pagedown handling for tab switching
 *
 * This plugin requires CY_System.js and CY_Window_Selectable.js to be loaded first.
 *
 * Requirements fulfilled:
 * - 5.2: Horizontal tab bar with categories
 * - 5.3: L1/LB or Q navigates to previous tab
 * - 5.4: R1/RB or E navigates to next tab
 * - 5.5: Selected tab highlighted with cyan color
 */

//-----------------------------------------------------------------------------
// CY_Window_TabBar
//
// The horizontal tab navigation bar with Cyberpunk styling.
// Extends CY_Window_Selectable for selection functionality.
//-----------------------------------------------------------------------------

function CY_Window_TabBar() {
    this.initialize.apply(this, arguments);
}

CY_Window_TabBar.prototype = Object.create(CY_Window_Selectable.prototype);
CY_Window_TabBar.prototype.constructor = CY_Window_TabBar;

//-----------------------------------------------------------------------------
// Initialization
//-----------------------------------------------------------------------------

/**
 * Initialize the Cyberpunk-styled tab bar.
 * @param {string[]} [tabs] - Array of tab names (default: ['SOUND', 'CONTROLS', 'GAMEPLAY'])
 */
CY_Window_TabBar.prototype.initialize = function(tabs) {
    this._tabs = tabs || ['SOUND', 'CONTROLS', 'GAMEPLAY'];
    var width = Graphics.width; // Full screen width
    var height = this.fittingHeight(1);
    CY_Window_Selectable.prototype.initialize.call(this, 0, 0, width, height);
    this.refresh();
    this.select(0);
};

//-----------------------------------------------------------------------------
// Layout Configuration
//-----------------------------------------------------------------------------

/**
 * Return the number of columns (horizontal layout).
 * Each tab is a column, enabling horizontal navigation.
 * @returns {number} Number of columns equal to tab count
 */
CY_Window_TabBar.prototype.maxCols = function() {
    return this._tabs.length;
};

/**
 * Return the total number of items (tabs).
 * @returns {number} Number of tabs
 */
CY_Window_TabBar.prototype.maxItems = function() {
    return this._tabs.length;
};

/**
 * Calculate the width of each tab item.
 * Divides available content width equally among all tabs.
 * @returns {number} Width of each tab in pixels
 */
CY_Window_TabBar.prototype.itemWidth = function() {
    return Math.floor(this.contentsWidth() / this.maxCols());
};

//-----------------------------------------------------------------------------
// Drawing
//-----------------------------------------------------------------------------

/**
 * Draw a single tab item.
 * Selected tabs get cyan text and an underline indicator.
 * Unselected tabs use inactive text color.
 * @param {number} index - Index of the tab to draw
 */
CY_Window_TabBar.prototype.drawItem = function(index) {
    var rect = this.itemRect(index);
    var isSelected = (index === this.index());
    
    // Draw tab text with appropriate color
    if (isSelected) {
        this.changeTextColor(CY_System.Colors.cyan);
        // Draw cyan underline for selected tab
        // Position underline at bottom of item rect
        var underlineHeight = 2;
        var underlineY = rect.y + rect.height - 4;
        this.contents.fillRect(
            rect.x, 
            underlineY, 
            rect.width, 
            underlineHeight, 
            CY_System.Colors.cyan
        );
    } else {
        this.changeTextColor(CY_System.Colors.inactiveText);
    }
    
    // Draw centered tab text
    this.drawText(this._tabs[index], rect.x, rect.y, rect.width, 'center');
};

/**
 * Refresh the tab bar contents.
 * Draws all tabs and L1/R1 navigation indicators.
 */
CY_Window_TabBar.prototype.refresh = function() {
    CY_Window_Selectable.prototype.refresh.call(this);
    this.drawNavigationIndicators();
};

/**
 * Draw L1/R1 navigation indicators on left and right edges.
 * These indicate that shoulder buttons can be used for tab switching.
 */
CY_Window_TabBar.prototype.drawNavigationIndicators = function() {
    var indicatorWidth = 40;
    var y = 0;
    
    // Draw L1 indicator on left edge
    this.changeTextColor(CY_System.Colors.inactiveText);
    this.drawText('L1', 10, y, indicatorWidth, 'left');
    
    // Draw R1 indicator on right edge
    this.drawText('R1', this.contentsWidth() - indicatorWidth - 10, y, indicatorWidth, 'right');
};

//-----------------------------------------------------------------------------
// Tab Access
//-----------------------------------------------------------------------------

/**
 * Get the currently selected tab name.
 * @returns {string} Name of the currently selected tab
 */
CY_Window_TabBar.prototype.currentTab = function() {
    return this._tabs[this.index()];
};

/**
 * Get the index of a tab by name.
 * @param {string} tabName - Name of the tab to find
 * @returns {number} Index of the tab, or -1 if not found
 */
CY_Window_TabBar.prototype.findTab = function(tabName) {
    return this._tabs.indexOf(tabName);
};

/**
 * Select a tab by name.
 * @param {string} tabName - Name of the tab to select
 */
CY_Window_TabBar.prototype.selectTab = function(tabName) {
    var index = this.findTab(tabName);
    if (index >= 0) {
        this.select(index);
    }
};

//-----------------------------------------------------------------------------
// Input Handling
//-----------------------------------------------------------------------------

/**
 * Process input handling for the tab bar.
 * Adds L1/R1 (pageup/pagedown) support for tab switching.
 * Requirement 5.3: L1/LB or Q navigates to previous tab
 * Requirement 5.4: R1/RB or E navigates to next tab
 */
CY_Window_TabBar.prototype.processHandling = function() {
    CY_Window_Selectable.prototype.processHandling.call(this);
    
    if (this.isOpenAndActive()) {
        // L1/LB/Q - Navigate to previous tab
        if (Input.isTriggered('pageup')) {
            this.processPreviousTab();
        }
        // R1/RB/E - Navigate to next tab
        else if (Input.isTriggered('pagedown')) {
            this.processNextTab();
        }
    }
};

/**
 * Process navigation to the previous tab.
 * Wraps around to the last tab if at the first tab.
 */
CY_Window_TabBar.prototype.processPreviousTab = function() {
    var index = this.index();
    var maxItems = this.maxItems();
    
    // Wrap around: if at first tab, go to last tab
    var newIndex = (index - 1 + maxItems) % maxItems;
    
    this.select(newIndex);
    SoundManager.playCursor();
};

/**
 * Process navigation to the next tab.
 * Wraps around to the first tab if at the last tab.
 */
CY_Window_TabBar.prototype.processNextTab = function() {
    var index = this.index();
    var maxItems = this.maxItems();
    
    // Wrap around: if at last tab, go to first tab
    var newIndex = (index + 1) % maxItems;
    
    this.select(newIndex);
    SoundManager.playCursor();
};

/**
 * Override cursorLeft to wrap around for horizontal navigation.
 * @param {boolean} wrap - Whether to wrap around (always true for tabs)
 */
CY_Window_TabBar.prototype.cursorLeft = function(wrap) {
    this.processPreviousTab();
};

/**
 * Override cursorRight to wrap around for horizontal navigation.
 * @param {boolean} wrap - Whether to wrap around (always true for tabs)
 */
CY_Window_TabBar.prototype.cursorRight = function(wrap) {
    this.processNextTab();
};

//-----------------------------------------------------------------------------
// Override highlight for tab-specific styling
//-----------------------------------------------------------------------------

/**
 * Override refreshHighlight to use tab-specific styling.
 * Tabs use a more subtle highlight without the left border accent.
 * @param {number} w - Width of the highlight
 * @param {number} h - Height of the highlight
 */
CY_Window_TabBar.prototype.refreshHighlight = function(w, h) {
    var bmp = this._highlightSprite.bitmap;
    
    // Resize bitmap if dimensions changed
    if (bmp.width !== w || bmp.height !== h) {
        bmp.resize(w, h);
    }
    
    bmp.clear();
    
    // Draw very subtle background highlight for tabs
    // Tabs primarily use the underline for selection indication
    CY_System.drawCutCornerRect(
        bmp, 
        0, 
        0, 
        w, 
        h, 
        'rgba(0, 240, 255, 0.08)', 
        6
    );
};

