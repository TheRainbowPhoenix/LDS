// Tilemap_ImpactLayer
//
// The tilemap sprite for a single layer of an ImpactJS map.

function Tilemap_ImpactLayer() {
    this.initialize.apply(this, arguments);
}

Tilemap_ImpactLayer.prototype = Object.create(Tilemap.prototype);
Tilemap_ImpactLayer.prototype.constructor = Tilemap_ImpactLayer;

Tilemap_ImpactLayer.prototype.initialize = function() {
    Tilemap.prototype.initialize.call(this);
    this._layerData = null;
};

/**
 * Sets the data for a single layer.
 * @param {object} layerData - A layer object from the ImpactJS map data.
 */
Tilemap_ImpactLayer.prototype.setData = function(layerData) {
    this._layerData = layerData;
    this.tileWidth = layerData.tilesize;
    this.tileHeight = layerData.tilesize;

    // RPG Maker's Tilemap expects a 1D array, but ImpactJS provides a 2D array.
    // We must flatten the 2D array into a 1D array before passing it.
    var flatData = layerData.data.flat();

    // Call the parent setData method with the corrected data format.
    Tilemap.prototype.setData.call(this, layerData.width, layerData.height, flatData);
    
    this.loadTileset();
};

/**
 * Loads the unique tileset for this specific layer.
 */
Tilemap_ImpactLayer.prototype.loadTileset = function() {
    if (this._layerData && this._layerData.tilesetName) {
        // RPG Maker's Tilemap expects an array of bitmaps. For ImpactJS maps,
        // we'll just have one bitmap per layer in the first slot.
        this.bitmaps[0] = ImageManager.loadTileset(this._layerData.tilesetName);
    }
};

/**
 * Updates the layer's position to create a parallax effect.
 */
Tilemap_ImpactLayer.prototype.update = function() {
    Tilemap.prototype.update.call(this);
    if (this._layerData) {
        // The 'distance' property controls the parallax effect.
        // A distance of 1 means it scrolls with the map.
        // A distance < 1 means it scrolls slower (appears further away).
        var distance = this._layerData.distance || 1;
        this.origin.x = $gameImpactMap.displayX() * this.tileWidth * distance;
        this.origin.y = $gameImpactMap.displayY() * this.tileHeight * distance;
    }
};
