// Spriteset_Impact
//
// The spriteset for displaying an ImpactJS map.

function Spriteset_Impact() {
    this.initialize.apply(this, arguments);
}

Spriteset_Impact.prototype = Object.create(Spriteset_Base.prototype);
Spriteset_Impact.prototype.constructor = Spriteset_Impact;

Spriteset_Impact.prototype.initialize = function() {
    Spriteset_Base.prototype.initialize.call(this);
    this._tilemapLayers = [];
};

Spriteset_Impact.prototype.createLowerLayer = function() {
    Spriteset_Base.prototype.createLowerLayer.call(this);
    this.createTilemaps();
    this.createCharacters();
};

Spriteset_Impact.prototype.createBaseSprite = function() {
    Spriteset_Base.prototype.createBaseSprite.call(this);
    // In a more advanced implementation, a TilingSprite for parallax backgrounds
    // would be created here, similar to Spriteset_Map.
};

/**
 * Creates a Tilemap_ImpactLayer for each layer in the map data.
 */
Spriteset_Impact.prototype.createTilemaps = function() {
    var layers = $gameImpactMap.layers();
    
    // Sort layers by their 'level' property for correct Z-ordering.
    layers.sort(function(a, b) {
        return (a.level || 0) - (b.level || 0);
    });

    for (var i = 0; i < layers.length; i++) {
        var layerData = layers[i];
        if (layerData.name !== 'collision') {
            var tilemap = new Tilemap_ImpactLayer();
            tilemap.setData(layerData);
            this._tilemapLayers.push(tilemap);
            this._baseSprite.addChild(tilemap);
        }
    }
};

/**
 * Creates the character sprites. (Placeholder for now)
 */
Spriteset_Impact.prototype.createCharacters = function() {
    // In the future, this is where you would iterate through $gameImpactMap.entities()
    // and create Sprite_Character objects for them.
};

/**
 * The main update loop.
 */
Spriteset_Impact.prototype.update = function() {
    Spriteset_Base.prototype.update.call(this);
    // The parent update function will call the update function of all children,
    // including our custom Tilemap_ImpactLayer instances, which will handle
    // their own positioning for parallax scrolling.
};
