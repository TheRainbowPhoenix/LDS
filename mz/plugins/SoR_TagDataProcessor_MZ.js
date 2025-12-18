//=============================================================================
// SoR_TagDataProcessor_MZ.js
// SoR License (C) 2020 蒼竜, REQUIRED User Registration on Dragon Cave
// http://dragonflare.blue/dcave/license.php
// ----------------------------------------------------------------------------
// Latest version v1.10 (2021/08/02)
//=============================================================================
/*:ja
@plugindesc ＜SoRタグデータ解析＞ v1.10
@author 蒼竜
@target MZ
@url http://dragonflare.blue/dcave/
@help SoRプラグインにおける、データベースを直接拡張するために
記述するタグを一斉に読み取る基礎機構です。
(本プラグイン単体では、何の効果ももたらしません。)

プラグインの仕組みの都合、冗長になりやすいタグ読み込み処理を
一括で行うもので、関連プラグインの数が多ければ多いほどゲーム起動時に
発生する読み込み処理時間が短縮されます。

メモ欄にタグを記述する使用形式のプラグインの多くにおいて、
以後本プラグインが導入必須となります。

プラグイン管理画面において最上部に配置する必要はありませんが、
影響のある全てのプラグインよりも上部に配置してください。
*/
/*:
@plugindesc <SoR Tag Data Processor> v1.10
@author Soryu
@target MZ
@url http://dragonflare.blue/dcave/
@help This is a fundamental mechanism for SoR plugins to 
ACCELERATE data tag analysis in the game boot.
(Applying only this plugin presents no effects.)

In terms of plugins, tag reading process by many plugins must cause 
great overhead for the game boot. This plugin becomes a main control of 
tag analysis for SoR plugins, which greatly reduce boot time of the game. 

Most of SoR plugins which uses tag notation for additional data definition
requires this plugin (see the pdf for detail).

Place this plugin in the plugin manager with higher priority than 
any other related plugins as much as possible.
*/

(function() {
const pluginName = "SoR_TagDataProcessor_MZ";
let SoRTagDataProcessor_isLoaded = false;

const SoR_TDP_SB_initialize = Scene_Boot.prototype.initialize;
Scene_Boot.prototype.initialize = function() {
    SoR_TDP_SB_initialize.call(this);
    DataManager.initializeSoRTags();
    DataManager.initializeSoRTagProcessor();
}
DataManager.initializeSoRTags = function() { /* for others */ }
DataManager.initializeSoRTagProcessor = function() { this._SoRTagProcessFuncs = []; }
DataManager.SoRtagReadInitializer = function(obj, funcs) {
    for(const dat of funcs){
        const f = dat.name + "_init";
        this[f](obj);
    }
}

const SoR_TDP_DM_isDatabaseLoaded = DataManager.isDatabaseLoaded;
DataManager.isDatabaseLoaded = function() {
	if(!SoR_TDP_DM_isDatabaseLoaded.call(this)) return false;
	
    if(!SoRTagDataProcessor_isLoaded){
        this.SoRTagDataProcessor($dataActors, "actor");
        this.SoRTagDataProcessor($dataClasses, "class");
        this.SoRTagDataProcessor($dataSkills, "skill");
        this.SoRTagDataProcessor($dataItems, "item");
        this.SoRTagDataProcessor($dataWeapons, "weapon");
        this.SoRTagDataProcessor($dataArmors, "armor");
        this.SoRTagDataProcessor($dataEnemies, "enemy");
        this.SoRTagDataProcessor($dataTroops, "troop");
        this.SoRTagDataProcessor($dataStates, "state");
        this.SoRTagDataProcessor($dataAnimations, "anim");
        this.SoRTagDataProcessor($dataTilesets, "tile");
        this.SoRTagDataProcessor($dataCommonEvents, "common");

        this._SoRTagProcessFuncs = [];
        delete this._SoRTagProcessFuncs;
        SoRTagDataProcessor_isLoaded = true;
	}
    return true;
}

DataManager.SoRTagDataProcessor = function(DM, target){
    const funcs = this._SoRTagProcessFuncs.filter((x)=> x.target.some((d)=> d === target));
    if(funcs.length == 0) return;

    let intensive = "";
    const n_data = DM.length;
    for (let i = 1; i < n_data; i++) {
        const obj = DM[i];
        const notes = obj.note.split(/[\r\n]+/);
        const n_note = notes.length;

        this.SoRtagReadInitializer(obj, funcs);

        for(let n = 0; n < n_note; n++) {
            if(intensive != ""){
                const res = this[intensive](obj, notes[n], true);
                if(res == true) intensive = "";
                if(res != false) continue;
            }

            for(const dat of funcs){
                const f = dat.name;
                const res = this[f](obj, notes[n]);
                if(res==true) break; // may no longer match
                else if(res==null){ // specific tags for multiple-lines
                    intensive = f;
                    break;
                }
            }
            
        }
    }
}

})();