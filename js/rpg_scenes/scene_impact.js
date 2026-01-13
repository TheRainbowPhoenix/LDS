function Scene_Impact() {
    this.initialize.apply(this, arguments);
}

Scene_Impact.prototype = Object.create(Scene_Base.prototype);
Scene_Impact.prototype.constructor = Scene_Impact;

Scene_Impact.prototype.initialize = function() {
    Scene_Base.prototype.initialize.call(this);
    this._waitCount = 0;
    this._mapLoaded = false;
};

Scene_Impact.prototype.create = function() {
    Scene_Base.prototype.create.call(this);
    // TODO: For now, we'll hardcode the map ID. A real implementation would pass this in.
    DataManager.loadImpactMapData(1); 
};

Scene_Impact.prototype.isReady = function() {
    if (!this._mapLoaded && DataManager.isImpactMapLoaded()) {
        this.onMapLoaded();
        this._mapLoaded = true;
    }
    return this._mapLoaded && Scene_Base.prototype.isReady.call(this);
};

Scene_Impact.prototype.onMapLoaded = function() {
    // For now, we'll hardcode the map ID.
    $gameImpactMap.setup(1);
    this.createDisplayObjects();
};

Scene_Impact.prototype.start = function() {
    Scene_Base.prototype.start.call(this);
    SceneManager.clearStack();
    this.startFadeIn(this.fadeSpeed(), false);
};

Scene_Impact.prototype.update = function() {
    this.updateMain();
    Scene_Base.prototype.update.call(this);
};

Scene_Impact.prototype.updateMain = function() {
    var active = this.isActive();
    // TODO: In the future, we would update $gameImpactMap, player, etc.
    // $gameImpactMap.update(active);
};

Scene_Impact.prototype.stop = function() {
    Scene_Base.prototype.stop.call(this);
};

Scene_Impact.prototype.isBusy = function() {
    return Scene_Base.prototype.isBusy.call(this);
};

Scene_Impact.prototype.terminate = function() {
    Scene_Base.prototype.terminate.call(this);
};

Scene_Impact.prototype.createDisplayObjects = function() {
    this.createSpriteset();
};

Scene_Impact.prototype.createSpriteset = function() {
    this._spriteset = new Spriteset_Impact();
    this.addChild(this._spriteset);
};
