//=============================================================================
// CY_Window_SaveList.js
//=============================================================================

/*:
 * @plugindesc Cyberpunk UI Mod - Save List Window
 * @author Cyberpunk UI Mod
 *
 * @help
 * CY_Window_SaveList - Scrollable save slot list with Cyberpunk styling.
 * Each save entry has:
 * - Cut corner container (bottom-right)
 * - Red border (#351218), cyan when selected
 * - Dark background (#0D0D17)
 * - Save info: slot number, playtime, location
 *
 * This plugin requires CY_System.js and CY_Window_Selectable.js.
 */

//-----------------------------------------------------------------------------
// CY_Window_SaveList
//
// Save slot list window with Cyberpunk styling.
//-----------------------------------------------------------------------------

function CY_Window_SaveList() {
    this.initialize.apply(this, arguments);
}

CY_Window_SaveList.prototype = Object.create(CY_Window_Selectable.prototype);
CY_Window_SaveList.prototype.constructor = CY_Window_SaveList;

//-----------------------------------------------------------------------------
// Constants
//-----------------------------------------------------------------------------

CY_Window_SaveList.SLOT_HEIGHT = 80; // Increased for party faces
CY_Window_SaveList.MAX_SAVES = 20;
CY_Window_SaveList.BORDER_COLOR = '#351218';
CY_Window_SaveList.BORDER_COLOR_SELECTED = '#5CF5FA'; // Cyan
CY_Window_SaveList.BG_COLOR = '#0D0D17';

//-----------------------------------------------------------------------------
// Initialization
//-----------------------------------------------------------------------------

CY_Window_SaveList.prototype.initialize = function(x, y, width, height) {
    this._saveInfo = [];
    this.loadAllSaveInfo();
    CY_Window_Selectable.prototype.initialize.call(this, x, y, width, height);
    this.refresh();
};

CY_Window_SaveList.prototype.loadAllSaveInfo = function() {
    this._saveInfo = [];
    for (var i = 1; i <= CY_Window_SaveList.MAX_SAVES; i++) {
        var info = DataManager.loadSavefileInfo(i);
        this._saveInfo.push(info);
    }
};

//-----------------------------------------------------------------------------
// Layout
//-----------------------------------------------------------------------------

CY_Window_SaveList.prototype.maxItems = function() {
    return CY_Window_SaveList.MAX_SAVES;
};

CY_Window_SaveList.prototype.itemHeight = function() {
    return CY_Window_SaveList.SLOT_HEIGHT;
};

CY_Window_SaveList.prototype.maxCols = function() {
    return 1;
};

//-----------------------------------------------------------------------------
// Drawing
//-----------------------------------------------------------------------------

CY_Window_SaveList.prototype.drawItem = function(index) {
    var rect = this.itemRect(index);
    var info = this._saveInfo[index];
    var isSelected = (index === this.index());
    
    // Draw container background with cut corner
    this.drawSaveSlotBackground(rect, isSelected);
    
    // Draw save info
    this.drawSaveSlotContent(index, info, rect);
};

CY_Window_SaveList.prototype.drawSaveSlotBackground = function(rect, isSelected) {
    var x = rect.x + 2;
    var y = rect.y + 2;
    var w = rect.width - 4;
    var h = rect.height - 4;
    var cutSize = 10;
    var borderWidth = 2;
    
    var borderColor = isSelected ? CY_Window_SaveList.BORDER_COLOR_SELECTED : CY_Window_SaveList.BORDER_COLOR;
    var bgColor = CY_Window_SaveList.BG_COLOR;
    
    // Draw background
    CY_System.drawCutCornerRect(this.contents, x, y, w, h, bgColor, cutSize);
    
    // Draw border
    CY_System.drawCutCornerBorder(this.contents, x, y, w, h, borderColor, borderWidth, cutSize);
};

CY_Window_SaveList.prototype.drawSaveSlotContent = function(index, info, rect) {
    var x = rect.x + 12;
    var y = rect.y + 10;
    var w = rect.width - 24;
    var contentHeight = rect.height - 16;
    
    // Slot number (top left)
    this.contents.fontSize = 16;
    this.changeTextColor(CY_System.Colors.cyan);
    this.drawText('SLOT ' + (index + 1).toString().padStart(2, '0'), x, y, 80, 'left');
    
    if (info) {
        // Has save data
        
        // Playtime (top right, same line as slot)
        this.changeTextColor(CY_System.Colors.white);
        this.contents.fontSize = 14;
        if (info.playtime) {
            this.drawText(info.playtime, x, y, w, 'right');
        }
        
        // Party faces in the center
        var faceSize = 48;
        var faceY = y + 2;
        var faceStartX = x + 90;
        if (info.faces) {
            for (var i = 0; i < info.faces.length && i < 4; i++) {
                var faceData = info.faces[i];
                if (faceData[0]) {
                    this.drawFace(faceData[0], faceData[1], faceStartX + i * (faceSize + 4), faceY, faceSize, faceSize);
                }
            }
        }
        
        // Timestamp (bottom right)
        this.contents.fontSize = 12;
        this.changeTextColor(CY_System.Colors.inactiveText);
        if (info.timestamp) {
            var date = new Date(info.timestamp);
            var dateStr = date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
            this.drawText(dateStr, x, y + contentHeight - 16, w, 'right');
        }
    } else {
        // Empty slot
        this.contents.fontSize = 14;
        this.changeTextColor(CY_System.Colors.inactiveText);
        this.drawText('- Empty -', x + 90, y + 20, w - 90, 'left');
    }
    
    this.resetFontSettings();
};

//-----------------------------------------------------------------------------
// Refresh
//-----------------------------------------------------------------------------

CY_Window_SaveList.prototype.refresh = function() {
    this.loadAllSaveInfo();
    CY_Window_Selectable.prototype.refresh.call(this);
};

//-----------------------------------------------------------------------------
// Override highlight for save slot styling
//-----------------------------------------------------------------------------

CY_Window_SaveList.prototype.refreshHighlight = function(w, h) {
    var bmp = this._highlightSprite.bitmap;
    
    if (bmp.width !== w || bmp.height !== h) {
        bmp.resize(w, h);
    }
    
    bmp.clear();
    
    // Very subtle glow effect for selected slot
    // The main selection indication is the cyan border drawn in drawItem
    CY_System.drawCutCornerRect(
        bmp, 
        2, 
        2, 
        w - 4, 
        h - 4, 
        'rgba(92, 245, 250, 0.05)', 
        10
    );
};

//-----------------------------------------------------------------------------
// Selection change triggers redraw for border color
//-----------------------------------------------------------------------------

CY_Window_SaveList.prototype.select = function(index) {
    var lastIndex = this._index;
    CY_Window_Selectable.prototype.select.call(this, index);
    
    // Redraw previous and current items to update border colors
    if (lastIndex >= 0 && lastIndex !== index) {
        this.redrawItem(lastIndex);
    }
    if (index >= 0) {
        this.redrawItem(index);
    }
};
