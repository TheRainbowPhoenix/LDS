//=============================================================================

/**
 * The Superclass of all scene within the game.
 *
 * @class Scene_Base
 * @constructor
 * @extends Stage
 */
function Scene_Base() {
  this.initialize.apply(this, arguments);
}

Scene_Base.prototype = Object.create(Stage.prototype);
Scene_Base.prototype.constructor = Scene_Base;

/**
 * Create a instance of Scene_Base.
 *
 * @instance
 * @memberof Scene_Base
 */
Scene_Base.prototype.initialize = function () {
  Stage.prototype.initialize.call(this);
  this._started = false;
  this._active = false;
  this._fadeSign = 0;
  this._fadeDuration = 0;
  this._fadeWhite = 0;
  this._fadeOpacity = 0;
  this._fadeSprite = null;
  this._imageReservationId = Utils.generateRuntimeId();
  this.createColorFilter();
};

Scene_Base.prototype.create = function() {
    //
};

/**
 * Attach a reservation to the reserve queue.
 *
 * @method attachReservation
 * @instance
 * @memberof Scene_Base
 */
Scene_Base.prototype.attachReservation = function () {
  ImageManager.setDefaultReservationId(this._imageReservationId);
};

/**
 * Remove the reservation from the Reserve queue.
 *
 * @method detachReservation
 * @instance
 * @memberof Scene_Base
 */
Scene_Base.prototype.detachReservation = function () {
  ImageManager.releaseReservation(this._imageReservationId);
};

/**
 * Create the components and add them to the rendering process.
 *
 * @method create
 * @instance
 * @memberof Scene_Base
 */
Scene_Base.prototype.create = function () {};

/**
 * Returns whether the scene is active or not.
 *
 * @method isActive
 * @instance
 * @memberof Scene_Base
 * @return {Boolean} return true if the scene is active
 */
Scene_Base.prototype.isActive = function () {
  return this._active;
};

/**
 * Return whether the scene is ready to start or not.
 *
 * @method isReady
 * @instance
 * @memberof Scene_Base
 * @return {Boolean} Return true if the scene is ready to start
 */
Scene_Base.prototype.isReady = function () {
  return ImageManager.isReady() /* &&
        EffectManager.isReady() &&
        FontManager.isReady() */
};

/**
 * Start the scene processing.
 *
 * @method start
 * @instance
 * @memberof Scene_Base
 */
Scene_Base.prototype.start = function () {
  this._started = true;
  this._active = true;
};

/**
 * Update the scene processing each new frame.
 *
 * @method update
 * @instance
 * @memberof Scene_Base
 */
Scene_Base.prototype.update = function () {
  this.updateFade();
  this.updateColorFilter();
  this.updateChildren();
  // AudioManager.checkErrors();
};

/**
 * Stop the scene processing.
 *
 * @method stop
 * @instance
 * @memberof Scene_Base
 */
Scene_Base.prototype.stop = function () {
  this._active = false;
};

Scene_Base.prototype.isStarted = function() {
    return this._started;
};

/**
 * Return whether the scene is busy or not.
 *
 * @method isBusy
 * @instance
 * @memberof Scene_Base
 * @return {Boolean} Return true if the scene is currently busy
 */
Scene_Base.prototype.isBusy = function() {
    return this.isFading();
};

Scene_Base.prototype.isFading = function() {
    return this._fadeDuration > 0;
};

/**
 * Terminate the scene before switching to a another scene.
 *
 * @method terminate
 * @instance
 * @memberof Scene_Base
 */
Scene_Base.prototype.terminate = function () {};

/**
 * Create the layer for the windows children
 * and add it to the rendering process.
 *
 * @method createWindowLayer
 * @instance
 * @memberof Scene_Base
 */
Scene_Base.prototype.createWindowLayer = function () {
  var width = Graphics.boxWidth;
  var height = Graphics.boxHeight;
  var x = (Graphics.width - width) / 2;
  var y = (Graphics.height - height) / 2;
  this._windowLayer = new WindowLayer();
  this._windowLayer.move(x, y, width, height);
  this.addChild(this._windowLayer);
};

/**
 * Add the children window to the windowLayer processing.
 *
 * @method addWindow
 * @instance
 * @memberof Scene_Base
 */
Scene_Base.prototype.addWindow = function (window) {
  this._windowLayer.addChild(window);
};

/**
 * Request a fadeIn screen process.
 *
 * @method startFadeIn
 * @param {Number} [duration=30] The time the process will take for fadeIn the screen
 * @param {Boolean} [white=false] If true the fadein will be process with a white color else it's will be black
 *
 * @instance
 * @memberof Scene_Base
 */
Scene_Base.prototype.startFadeIn = function (duration, white) {
  this.createFadeSprite(white);
  this._fadeSign = 1;
  this._fadeDuration = duration || 30;
  this._fadeWhite = white;
  this._fadeSprite.opacity = 255;
  this._fadeOpacity = 255;
  this.updateColorFilter();
};

/**
 * Request a fadeOut screen process.
 *
 * @method startFadeOut
 * @param {Number} [duration=30] The time the process will take for fadeOut the screen
 * @param {Boolean} [white=false] If true the fadeOut will be process with a white color else it's will be black
 *
 * @instance
 * @memberof Scene_Base
 */
Scene_Base.prototype.startFadeOut = function (duration, white) {
  this.createFadeSprite(white);
  this._fadeSign = -1;
  this._fadeDuration = duration || 30;
  this._fadeWhite = white;
  this._fadeSprite.opacity = 0;
  this._fadeOpacity = 0;
  this.updateColorFilter();
};

Scene_Base.prototype.createColorFilter = function() {
    this._colorFilter = new ColorFilter();
    this.filters = [this._colorFilter];
};

Scene_Base.prototype.updateColorFilter = function() {
    const c = this._fadeWhite ? 255 : 0;
    const blendColor = [c, c, c, this._fadeOpacity];
    this._colorFilter.setBlendColor(blendColor);
};


/**
 * Create a Screen sprite for the fadein and fadeOut purpose and
 * add it to the rendering process.
 *
 * @method createFadeSprite
 * @instance
 * @memberof Scene_Base
 */
Scene_Base.prototype.createFadeSprite = function (white) {
  if (!this._fadeSprite) {
    this._fadeSprite = new ScreenSprite();
    this.addChild(this._fadeSprite);
  }
  if (white) {
    this._fadeSprite.setWhite();
  } else {
    this._fadeSprite.setBlack();
  }
};

/**
 * Update the screen fade processing.
 *
 * @method updateFade
 * @instance
 * @memberof Scene_Base
 */
Scene_Base.prototype.updateFade = function () {
  if (this._fadeDuration > 0) {
    var d = this._fadeDuration;
    if (this._fadeSign > 0) {
      this._fadeSprite.opacity -= this._fadeSprite.opacity / d;
    } else {
      this._fadeSprite.opacity += (255 - this._fadeSprite.opacity) / d;
    }
    this._fadeDuration--;
  }
};

/**
 * Update the children of the scene EACH frame.
 *
 * @method updateChildren
 * @instance
 * @memberof Scene_Base
 */
Scene_Base.prototype.updateChildren = function () {
  this.children.forEach(function (child) {
    if (child.update) {
      child.update();
    }
  });
};

/**
 * Pop the scene from the stack array and switch to the
 * previous scene.
 *
 * @method popScene
 * @instance
 * @memberof Scene_Base
 */
Scene_Base.prototype.popScene = function () {
  SceneManager.pop();
};

/**
 * Check whether the game should be triggering a gameover.
 *
 * @method checkGameover
 * @instance
 * @memberof Scene_Base
 */
Scene_Base.prototype.checkGameover = function () {
  if ($gameParty.isAllDead()) {
    SceneManager.goto(Scene_Gameover);
  }
};

/**
 * Slowly fade out all the visual and audio of the scene.
 *
 * @method fadeOutAll
 * @instance
 * @memberof Scene_Base
 */
Scene_Base.prototype.fadeOutAll = function () {
  const time = this.slowFadeSpeed() / 60;
  AudioManager.fadeOutBgm(time);
  AudioManager.fadeOutBgs(time);
  AudioManager.fadeOutMe(time);
  this.startFadeOut(this.slowFadeSpeed());
};

/**
 * Return the screen fade speed value.
 *
 * @method fadeSpeed
 * @instance
 * @memberof Scene_Base
 * @return {Number} Return the fade speed
 */
Scene_Base.prototype.fadeSpeed = function () {
  return 24;
};

/**
 * Return a slow screen fade speed value.
 *
 * @method slowFadeSpeed
 * @instance
 * @memberof Scene_Base
 * @return {Number} Return the fade speed
 */
Scene_Base.prototype.slowFadeSpeed = function () {
  return this.fadeSpeed() * 2;
};

Scene_Base.prototype.scaleSprite = function(sprite) {
    const ratioX = Graphics.width / sprite.bitmap.width;
    const ratioY = Graphics.height / sprite.bitmap.height;
    const scale = Math.max(ratioX, ratioY, 1.0);
    sprite.scale.x = scale;
    sprite.scale.y = scale;
};

Scene_Base.prototype.centerSprite = function(sprite) {
    sprite.x = Graphics.width / 2;
    sprite.y = Graphics.height / 2;
    sprite.anchor.x = 0.5;
    sprite.anchor.y = 0.5;
};

Scene_Base.prototype.isBottomHelpMode = function() {
    return true;
};

Scene_Base.prototype.isBottomButtonMode = function() {
    return false;
};

Scene_Base.prototype.isRightInputMode = function() {
    return true;
};

Scene_Base.prototype.mainCommandWidth = function() {
    return 240;
};

Scene_Base.prototype.buttonAreaTop = function() {
    if (this.isBottomButtonMode()) {
        return Graphics.boxHeight - this.buttonAreaHeight();
    } else {
        return 0;
    }
};

Scene_Base.prototype.buttonAreaBottom = function() {
    return this.buttonAreaTop() + this.buttonAreaHeight();
};

Scene_Base.prototype.buttonAreaHeight = function() {
    return 52;
};

Scene_Base.prototype.buttonY = function() {
    const offsetY = Math.floor((this.buttonAreaHeight() - 48) / 2);
    return this.buttonAreaTop() + offsetY;
};

Scene_Base.prototype.calcWindowHeight = function(numLines, selectable) {
    if (selectable) {
        return Window_Selectable.prototype.fittingHeight(numLines);
    } else {
        return Window_Base.prototype.fittingHeight(numLines);
    }
};

Scene_Base.prototype.requestAutosave = function() {
    if (this.isAutosaveEnabled()) {
        this.executeAutosave();
    }
};

Scene_Base.prototype.isAutosaveEnabled = function() {
    return (
        !DataManager.isBattleTest() &&
        !DataManager.isEventTest() &&
        $gameSystem.isAutosaveEnabled() &&
        $gameSystem.isSaveEnabled()
    );
};

Scene_Base.prototype.executeAutosave = function() {
    $gameSystem.onBeforeSave();
    DataManager.saveGame(0)
        .then(() => this.onAutosaveSuccess())
        .catch(() => this.onAutosaveFailure());
};

Scene_Base.prototype.onAutosaveSuccess = function() {
    //
};

Scene_Base.prototype.onAutosaveFailure = function() {
    //
};