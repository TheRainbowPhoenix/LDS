//=============================================================================
// main.js
//=============================================================================

PluginManager.setup($plugins);

var effekseerWasmUrl = "js/libs/effekseer.wasm";

function onEffekseerLoad() {
    SceneManager.run(Scene_Boot);
}

function onEffekseerError() {
    console.error("Failed to load: " + effekseerWasmUrl);
    SceneManager.run(Scene_Boot);
}

window.onload = function() {
    if (window.effekseer && typeof effekseer.initRuntime === "function") {
        effekseer.initRuntime(effekseerWasmUrl, onEffekseerLoad, onEffekseerError);
    } else {
        SceneManager.run(Scene_Boot);
    }
};

// MZ compatibility: expose Main class placeholder
if (typeof Main === "undefined") {
    function Main() {}
}
