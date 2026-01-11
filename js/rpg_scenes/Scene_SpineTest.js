//=============================================================================
// Scene_SpineTest
//=============================================================================

function Scene_SpineTest() {
    this.initialize.apply(this, arguments);
}

Scene_SpineTest.prototype = Object.create(Scene_Base.prototype);
Scene_SpineTest.prototype.constructor = Scene_SpineTest;

Scene_SpineTest.prototype.initialize = function() {
    Scene_Base.prototype.initialize.call(this);
};

Scene_SpineTest.prototype.create = function() {
    Scene_Base.prototype.create.call(this);

    PIXI.Assets.load('spine/spineboy-pro/spineboy-pro.json').then((resource) => {
        const animation = new PIXI.spine.Spine(resource.spineData);

        // center the spine animation
        animation.x = Graphics.width / 2;
        animation.y = Graphics.height / 2;

        this.addChild(animation);

        if (animation.state.hasAnimation('run')) {
            animation.state.setAnimation(0, 'run', true);
            animation.state.timeScale = 0.5;
        }
    });

    this.createBackButton();
};

Scene_SpineTest.prototype.createBackButton = function() {
    const button = new PIXI.Text('Back to Menu', {
        fontFamily: 'Arial',
        fontSize: 24,
        fill: 0xffffff,
        backgroundColor: 0x333333,
        padding: 10
    });
    button.x = Graphics.width / 2;
    button.y = Graphics.height - 50;
    button.anchor.set(0.5);
    button.interactive = true;
    button.buttonMode = true;
    button.on('pointerdown', () => SceneManager.pop());
    this.addChild(button);
};

Scene_SpineTest.prototype.update = function() {
    Scene_Base.prototype.update.call(this);

    if (Input.isTriggered('cancel') || Input.isTriggered('menu')) {
        SceneManager.pop();
    }
};

Scene_SpineTest.prototype.terminate = function() {
    Scene_Base.prototype.terminate.call(this);
};
