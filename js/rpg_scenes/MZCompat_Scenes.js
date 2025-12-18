//-----------------------------------------------------------------------------
// Scene_Message (MZ compatibility)
//
// Provides a lightweight Scene_Message so MZ plugins can reference it.

if (typeof Scene_Message === "undefined") {
  function Scene_Message() {
    this.initialize(...arguments);
  }

  Scene_Message.prototype = Object.create(Scene_Base.prototype);
  Scene_Message.prototype.constructor = Scene_Message;

  Scene_Message.prototype.initialize = function () {
    Scene_Base.prototype.initialize.call(this);
  };

  Scene_Message.prototype.create = function () {
    Scene_Base.prototype.create.call(this);
    this.createMessageWindow();
  };

  Scene_Message.prototype.createMessageWindow = function () {
    this._messageWindow = new Window_Message();
    this.addWindow(this._messageWindow);
  };

  Scene_Message.prototype.start = function () {
    Scene_Base.prototype.start.call(this);
  };

  Scene_Message.prototype.isReady = function () {
    return Scene_Base.prototype.isReady.call(this);
  };
}
