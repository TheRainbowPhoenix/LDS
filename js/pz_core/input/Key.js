/**
 * Phaser.Key
 * Represents a single key that can be polled.
 */
Phaser.Key = function (game, keycode) {
    this.game = game;
    this.keyCode = keycode;
    this.isDown = false;
    this.isUp = true;
    this.timeDown = 0;
    this.timeUp = 0;
    this.onDown = new Phaser.Signal();
    this.onUp = new Phaser.Signal();
};

Phaser.Key.prototype = {
    update: function () {
        var current = this.game.input.keyboard.isDown(this.keyCode);

        if (current && this.isUp) {
            this.isDown = true;
            this.isUp = false;
            this.timeDown = Date.now();
            this.onDown.dispatch(this);
        } else if (!current && this.isDown) {
            this.isDown = false;
            this.isUp = true;
            this.timeUp = Date.now();
            this.onUp.dispatch(this);
        }
    }
};
