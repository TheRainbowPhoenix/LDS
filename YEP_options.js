
if (Utils.RPGMAKER_VERSION && Utils.RPGMAKER_VERSION >= "1.5.0") {

    //=============================================================================
    // Parameter Variables
    //=============================================================================

    Yanfly.Parameters = PluginManager.parameters('YEP_OptionsCore');
    Yanfly.Param = Yanfly.Param || {};

    Yanfly.Param.OptionsAllCmd = String(Yanfly.Parameters['AllCommand']);
    Yanfly.Param.OptionsAllCmdHelp = String(Yanfly.Parameters['AllHelpDesc']);
    Yanfly.Param.OptionsExitCmd = String(Yanfly.Parameters['ExitCommand']);
    Yanfly.Param.OptionsExitCmdHelp = String(Yanfly.Parameters['ExitHelpDesc']);

    Yanfly.Param.OptionsCategoryWidth = Number(Yanfly.Parameters['CategoryWidth']);
    Yanfly.Param.OptionsStatusWidth = Number(Yanfly.Parameters['StatusWidth']);
    Yanfly.Param.OptionsVolumeOffset = Number(Yanfly.Parameters['VolumeOffset']);
    Yanfly.Param.OptionsWinToneOffset = Number(Yanfly.Parameters['WindowToneOffset']);

    Yanfly.SetupParameters = function() {
        Yanfly.Param.OptionsSymbols = {};
        var data = JSON.parse(Yanfly.Parameters['OptionsCategories']);
        var length = data.length;
        // Options Categories
        for (var i = 0; i < length; ++i) {
            data[i] = JSON.parse(data[i]);
            data[i]['OptionsList'] = JSON.parse(data[i]['OptionsList']);
            var optionsLength = data[i]['OptionsList'].length;
            // Options List
            for (var j = 0; j < optionsLength; ++j) {
                data[i]['OptionsList'][j] = JSON.parse(data[i]['OptionsList'][j]);
                var settings = data[i]['OptionsList'][j];
                var symbol = settings.Symbol;
                var name = symbol;
                eval(JSON.parse(settings.DefaultConfigCode));
                Yanfly.Param.OptionsSymbols[symbol] = {
                    SaveConfigCode: settings.SaveConfigCode,
                    LoadConfigCode: settings.LoadConfigCode
                }
            }
        }
        Yanfly.Param.OptionsCategories = data;
    }
    ;
    Yanfly.SetupParameters();

    //=============================================================================
    // ConfigManager
    //=============================================================================

    ConfigManager.masterVolume = 100;
    Object.defineProperty(ConfigManager, 'masterVolume', {
        get: function() {
            return parseInt(AudioManager.masterVolume * 100);
        },
        set: function(value) {
            AudioManager.masterVolume = value / 100;
        },
        configurable: true
    });

    Yanfly.Options.ConfigManager_makeData = ConfigManager.makeData;
    ConfigManager.makeData = function() {
        var config = Yanfly.Options.ConfigManager_makeData.call(this);
        for (var key in Yanfly.Param.OptionsSymbols) {
            var setting = Yanfly.Param.OptionsSymbols[key];
            var symbol = key;
            var name = symbol;
            eval(JSON.parse(Yanfly.Param.OptionsSymbols[key].SaveConfigCode));
        }
        return config;
    }
    ;

    Yanfly.Options.ConfigManager_applyData = ConfigManager.applyData;
    ConfigManager.applyData = function(config) {
        Yanfly.Options.ConfigManager_applyData.call(this, config);
        for (var key in Yanfly.Param.OptionsSymbols) {
            var setting = Yanfly.Param.OptionsSymbols[key];
            var symbol = key;
            var name = symbol;
            eval(JSON.parse(Yanfly.Param.OptionsSymbols[key].LoadConfigCode));
        }
    }
    ;

    //=============================================================================
    // Window_OptionsCategory
    //=============================================================================

    function Window_OptionsCategory() {
        this.initialize.apply(this, arguments);
    }

    Window_OptionsCategory.prototype = Object.create(Window_Command.prototype);
    Window_OptionsCategory.prototype.constructor = Window_OptionsCategory;

    Window_OptionsCategory.prototype.initialize = function(helpWin, optionsWin) {
        var x = 0;
        var y = helpWin.y + helpWin.height;
        this._width = Yanfly.Param.OptionsCategoryWidth;
        this._height = Graphics.boxHeight - y;
        Window_Command.prototype.initialize.call(this, x, y);
        this.setOptionsWindow(optionsWin);
        this.setHelpWindow(helpWin);
        this.refresh();
        this.select(0);
        this.activate();
    }
    ;

    Window_OptionsCategory.prototype.windowWidth = function() {
        return this._width;
    }
    ;

    Window_OptionsCategory.prototype.windowHeight = function() {
        return this._height;
    }
    ;

    Window_OptionsCategory.prototype.setOptionsWindow = function(optionsWindow) {
        this._optionsWindow = optionsWindow;
    }
    ;

    Window_OptionsCategory.prototype.makeCommandList = function() {
        this.addAllCommand();
        this.addCategoryList();
        this.addExitCommand();
    }
    ;

    Window_OptionsCategory.prototype.addCategoryList = function() {
        var categories = Yanfly.Param.OptionsCategories;
        var length = categories.length;
        for (var i = 0; i < length; ++i) {
            var category = categories[i];
            var name = category.Name;
            this.addCommand(name, 'category', true, category);
        }
    }
    ;

    Window_OptionsCategory.prototype.addAllCommand = function() {
        if (!Yanfly.Param.OptionsAllCmd)
            return;
        var data = {
            HelpDesc: Yanfly.Param.OptionsAllCmdHelp,
            OptionsList: []
        }
        for (var key in Yanfly.Param.OptionsCategories) {
            var category = Yanfly.Param.OptionsCategories[key];
            var list = category.OptionsList;
            if (list) {
                var length = list.length;
                for (var i = 0; i < length; ++i) {
                    data.OptionsList.push(list[i]);
                }
            }
        }
        this.addCommand(Yanfly.Param.OptionsAllCmd, 'category', true, data);
    }
    ;

    Window_OptionsCategory.prototype.addExitCommand = function() {
        if (!Yanfly.Param.OptionsExitCmd)
            return;
        var data = {
            HelpDesc: Yanfly.Param.OptionsExitCmdHelp,
            OptionsList: []
        }
        this.addCommand(Yanfly.Param.OptionsExitCmd, 'cancel', true, data);
    }
    ;

    Window_OptionsCategory.prototype.updateHelp = function() {
        if (!this._helpWindow)
            return;
        if (this.currentExt()) {
            var data = this.currentExt();
            this._helpWindow.setText(JSON.parse(data.HelpDesc));
            if (data.OptionsList.length > 0) {
                this._optionsWindow.makeCommandListFromData(data.OptionsList);
            } else {
                this._optionsWindow.clearRefresh();
            }
        } else {
            this._helpWindow.clear();
        }
    }
    ;

    Window_OptionsCategory.prototype.drawItem = function(index) {
        var rect = this.itemRectForText(index);
        var align = this.itemTextAlign();
        this.resetTextColor();
        this.changePaintOpacity(this.isCommandEnabled(index));
        this.drawTextEx(this.commandName(index), rect.x, rect.y);
    }
    ;

    //=============================================================================
    // Window_Options
    //=============================================================================

    Window_Options.prototype.initialize = function() {
        this._commandListData = undefined;
        Window_Command.prototype.initialize.call(this, 0, 0);
        this.deactivate();
        this.deselect();
    }
    ;

    Window_Options.prototype.updatePlacement = function() {
        this._placementUpdated = true;
        this.x = Yanfly.Param.OptionsCategoryWidth;
        this.y = this._helpWindow.y + this._helpWindow.height;
    }
    ;

    Window_Options.prototype.windowWidth = function() {
        return Graphics.boxWidth - Yanfly.Param.OptionsCategoryWidth;
    }
    ;

    Window_Options.prototype.windowHeight = function() {
        if (this._placementUpdated) {
            return Graphics.boxHeight - this.y;
        } else {
            return Graphics.boxHeight - this.fittingHeight(2);
        }
    }
    ;

    Window_Options.prototype.setHelpWindow = function(helpWindow) {
        Window_Command.prototype.setHelpWindow.call(this, helpWindow);
        this.updatePlacement();
        this.refresh();
    }
    ;

    Window_Options.prototype.clearRefresh = function() {
        this.clearCommandList();
        this.createContents();
        Window_Selectable.prototype.refresh.call(this);
    }
    ;

    Window_Options.prototype.makeCommandList = function() {
        if (!this._commandListData)
            return;
        this._symbolData = {};
        var data = this._commandListData;
        var length = data.length;
        for (var i = 0; i < length; ++i) {
            this.processCommandData(data[i]);
        }
    }
    ;

    Window_Options.prototype.statusWidth = function() {
        return Math.min(Yanfly.Param.OptionsStatusWidth, this.contents.width / 2);
    }
    ;

    Window_Options.prototype.volumeOffset = function() {
        return Yanfly.Param.OptionsVolumeOffset || 20;
    }
    ;

    Window_Options.prototype.windowToneOffset = function() {
        return Yanfly.Param.OptionsWinToneOffset || 5;
    }
    ;

    Window_Options.prototype.makeCommandListFromData = function(data) {
        if (!data)
            return;
        this._commandListData = data;
        this.refresh();
    }
    ;

    Window_Options.prototype.processCommandData = function(data) {
        // Check if Shown
        var show = false;
        eval(JSON.parse(data.ShowHide));
        if (!show)
            return;
        // Add Command
        var name = data.Name;
        if (name === '<insert option name>')
            return;
        if (name.match(/EVAL:[ ](.*)/i)) {
            var code = String(RegExp.$1);
            try {
                name = eval(code);
            } catch (e) {
                Yanfly.Util.displayError(e, formula, 'CUSTOM OPTIONS NAME ERROR');
            }
        }
        var symbol = data.Symbol;
        if (symbol === '<insert option symbol>')
            symbol = name;
        var enable = false;
        var ext = 0;
        eval(JSON.parse(data.Enable));
        eval(JSON.parse(data.Ext));
        eval(JSON.parse(data.MakeCommandCode));
        // Save symbol data
        this._symbolData[symbol] = {
            DrawItemCode: data.DrawItemCode,
            ProcessOkCode: data.ProcessOkCode,
            CursorLeftCode: data.CursorLeftCode,
            CursorRightCode: data.CursorRightCode,
            HelpDesc: data.HelpDesc
        }
    }
    ;

    Yanfly.Options.Window_Options_drawItem = Window_Options.prototype.drawItem;
    Window_Options.prototype.drawItem = function(index) {
        var symbol = this.commandSymbol(index);
        if (symbol) {
            eval(JSON.parse(this._symbolData[symbol].DrawItemCode));
        } else {
            Yanfly.Options.Window_Options_drawItem.call(this, index);
        }
    }
    ;

    Window_Options.prototype.drawOptionsName = function(index) {
        var rect = this.itemRectForText(index);
        var statusWidth = this.statusWidth();
        var titleWidth = rect.width - statusWidth;
        this.resetTextColor();
        this.changePaintOpacity(this.isCommandEnabled(index));
        this.drawTextEx(this.commandName(index), rect.x, rect.y);
    }
    ;

    Window_Options.prototype.drawOptionsOnOff = function(index, onText, offText) {
        onText = onText || 'ON';
        offText = offText || 'OFF';
        var rect = this.itemRectForText(index);
        var statusWidth = this.statusWidth();
        var halfStatusWidth = this.statusWidth() / 2;
        var titleWidth = rect.width - statusWidth;
        this.resetTextColor();
        var symbol = this.commandSymbol(index);
        var value = this.getConfigValue(symbol);
        this.changePaintOpacity(!value);
        this.drawText(offText, titleWidth, rect.y, halfStatusWidth, 'center');
        this.changePaintOpacity(value);
        this.drawText(onText, titleWidth + halfStatusWidth, rect.y, halfStatusWidth, 'center');
    }
    ;

    Window_Options.prototype.drawOptionsGauge = function(index, rate, c1, c2) {
        var rect = this.itemRectForText(index);
        var statusWidth = this.statusWidth();
        var halfStatusWidth = this.statusWidth() / 2;
        var titleWidth = rect.width - statusWidth;
        this.drawGauge(titleWidth, rect.y, statusWidth, rate, c1, c2);
    }
    ;

    Yanfly.Options.Window_Options_processOk = Window_Options.prototype.processOk;
    Window_Options.prototype.processOk = function() {
        var symbol = this.commandSymbol(this.index());
        if (symbol) {
            eval(JSON.parse(this._symbolData[symbol].ProcessOkCode));
        } else {
            Yanfly.Options.Window_Options_processOk.call(this);
        }
    }
    ;

    Yanfly.Options.Window_Options_cursorLeft = Window_Options.prototype.cursorLeft;
    Window_Options.prototype.cursorLeft = function(wrap) {
        var symbol = this.commandSymbol(this.index());
        if (symbol) {
            eval(JSON.parse(this._symbolData[symbol].CursorLeftCode));
        } else {
            Yanfly.Options.Window_Options_cursorLeft.call(this, wrap);
        }
    }
    ;

    Yanfly.Options.Window_Options_cursorRight = Window_Options.prototype.cursorRight;
    Window_Options.prototype.cursorRight = function(wrap) {
        var symbol = this.commandSymbol(this.index());
        if (symbol) {
            eval(JSON.parse(this._symbolData[symbol].CursorRightCode));
        } else {
            Yanfly.Options.Window_Options_cursorRight.call(this, wrap);
        }
    }
    ;

    Window_Options.prototype.changeWindowTone = function(symbol, value, color) {
        var index = ['red', 'green', 'blue'].indexOf(color);
        if (index < 0)
            return;
        var tone = JsonEx.makeDeepCopy($gameSystem.windowTone());
        var lastValue = tone[index];
        tone[index] = value.clamp(-255, 255);
        if (lastValue !== tone[index]) {
            $gameSystem.setWindowTone(tone);
            this.redrawItem(this.findSymbol(symbol));
            SoundManager.playCursor();
        }
    }
    ;

    Window_Options.prototype.updateHelp = function() {
        if (!this._helpWindow)
            return;
        if (this.index() < 0)
            return;
        var symbol = this.commandSymbol(this.index());
        if (this._symbolData && this._symbolData[symbol]) {
            this._helpWindow.setText(JSON.parse(this._symbolData[symbol].HelpDesc));
        } else {
            this._helpWindow.clear();
        }
    }
    ;

    //=============================================================================
    // Scene_Options
    //=============================================================================

    Scene_Options.prototype.create = function() {
        Scene_MenuBase.prototype.create.call(this);
        this.createHelpWindow();
        this.createOptionsWindow();
        this.createCategoryWindow();
    }
    ;

    Yanfly.Options.Scene_Options_createOptionsWindow = Scene_Options.prototype.createOptionsWindow;
    Scene_Options.prototype.createOptionsWindow = function() {
        Yanfly.Options.Scene_Options_createOptionsWindow.call(this);
        this._optionsWindow.setHelpWindow(this._helpWindow);
        this._optionsWindow.setHandler('cancel', this.onOptionsCancel.bind(this));
    }
    ;

    Scene_Options.prototype.createCategoryWindow = function() {
        var helpWin = this._helpWindow;
        var optionsWin = this._optionsWindow;
        this._categoryWindow = new Window_OptionsCategory(helpWin,optionsWin);
        this._categoryWindow.setHandler('cancel', this.popScene.bind(this));
        this._categoryWindow.setHandler('category', this.onCategoryOk.bind(this));
        this.addWindow(this._categoryWindow);
    }
    ;

    Scene_Options.prototype.onCategoryOk = function() {
        this._optionsWindow.activate();
        this._optionsWindow.select(0);
    }
    ;

    Scene_Options.prototype.onOptionsCancel = function() {
        this._optionsWindow.deselect();
        this._categoryWindow.activate();
    }
    ;

    //=============================================================================
    // Utilities
    //=============================================================================

    Yanfly.Util = Yanfly.Util || {};

    Yanfly.Util.displayError = function(e, code, message) {
        console.log(message);
        console.log(code || 'NON-EXISTENT');
        console.error(e);
        if (Utils.RPGMAKER_VERSION && Utils.RPGMAKER_VERSION >= "1.6.0")
            return;
        if (Utils.isNwjs() && Utils.isOptionValid('test')) {
            if (!require('nw.gui').Window.get().isDevToolsOpen()) {
                require('nw.gui').Window.get().showDevTools();
            }
        }
    }
    ;

    //=============================================================================
    // End of Main Functions
    //=============================================================================
} else {

    var text = '';
    text += 'You are getting this error because you are trying to run ';
    text += 'YEP_OptionsCore while your project files are lower than version ';
    text += '1.5.0.\n\nPlease visit this thread for instructions on how to update ';
    text += 'your project files to 1.5.0 or higher: \n\n';
    text += 'https://forums.rpgmakerweb.com/index.php';
    console.log(text);

}
// (Utils.RPGMAKER_VERSION && Utils.RPGMAKER_VERSION >= '1.5.0')
//=============================================================================
// End of File
//=============================================================================
