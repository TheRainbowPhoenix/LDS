// Impact_Map
//
// The game object class for a CrossCode (ImpactJS) map. It contains
// the layer and entity data, as well as scrolling and dimension properties.

function Impact_Map() {
    this.initialize.apply(this, arguments);
}

Impact_Map.prototype.initialize = function() {
    this._mapId = 0;
    this._mapData = null;
    this._tilesize = 0;
    this._width = 0;
    this._height = 0;
    this._layers = [];
    this._entities = [];
    this._collisionMap = null;
    this._bgm = '';
    this._attributes = {};
    this._displayX = 0;
    this._displayY = 0;
};

Impact_Map.prototype.setup = function(mapId) {
    if (!$dataImpactMap) {
        throw new Error('The ImpactJS map data is not available');
    }
    this._mapId = mapId;
    this._mapData = $dataImpactMap;

    // Set the master dimensions of the map.
    // Note that individual layers can have different dimensions.
    this._width = this._mapData.width || 0;
    this._height = this._mapData.height || 0;
    this._bgm = this._mapData.bgm || '';
    this._attributes = this._mapData.attributes || {};

    // Separate layers and entities
    this._layers = this._mapData.layer || [];
    this._entities = this._mapData.entities || [];

    // Find and set up the collision map
    const collisionLayer = this._layers.find(layer => layer.name === 'collision');
    if (collisionLayer) {
        // In a real implementation, you would instantiate a proper CollisionMap class
        // similar to the ImpactJS example. For now, we'll store the raw data.
        this._collisionMap = collisionLayer.data;
    }

    this._displayX = 0;
    this._displayY = 0;
};

// --- Accessor Methods ---

Impact_Map.prototype.width = function() {
    return this._width;
};

Impact_Map.prototype.height = function() {
    return this._height;
};

Impact_Map.prototype.tilesize = function() {
    return this._tilesize;
};

Impact_Map.prototype.layers = function() {
    return this._layers;
};

Impact_Map.prototype.entities = function() {
    return this._entities;
};

Impact_Map.prototype.collisionMap = function() {
    return this._collisionMap;
};

Impact_Map.prototype.bgm = function() {
    return this._bgm;
};

Impact_Map.prototype.attributes = function() {
    return this._attributes;
};

Impact_Map.prototype.displayX = function() {
    return this._displayX;
};

Impact_Map.prototype.displayY = function() {
    return this._displayY;
};
