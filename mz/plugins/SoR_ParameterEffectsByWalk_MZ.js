//=============================================================================
// SoR_ParameterEffectsByWalk_MZ.js
// SoR License (C) 2020 蒼竜, REQUIRED User Registration on Dragon Cave
// http://dragonflare.blue/dcave/license.php
// ----------------------------------------------------------------------------
// Latest version v1.30 (2021/07/10)
//=============================================================================
/*:ja
@plugindesc ＜任意歩数ごとのアクターへの各種効果を与えるステート・装備＞ v1.30
@author 蒼竜
@target MZ
@orderAfter SoR_TagDataProcessor_MZ
@base SoR_TagDataProcessor_MZ
@url http://dragonflare.blue/dcave/
@help マップ上で、プレイヤーキャラクターが指定した歩数を
移動するたびに、回復やダメージ等の効果を発生させる効果を持つ
[ステート]や[装備]の実装を提供します。

通常のRPGツクールMVで用意されている毒ステートなどによる
HP増減効果(HP再生率)は「20歩ごと」に発生すると決められていますが、
それとは独立に自由な歩数を指定した状態を作成することが可能です。
また、通常のHP再生率を指定したステート等とは独立に動作し、両立します。

@param IsEnableFlash_for_HPDamage
@desc 'true'の時、HP減少効果発生時に画面をフラッシュさせます。(通常の「毒」等のHP減少演出とは独立です)
@default true
@type boolean
*/
/*:
@plugindesc <Variables and Parameters Change States and Equipments Every Specified Walk Steps> v1.30
@author Soryu
@target MZ
@orderAfter SoR_TagDataProcessor_MZ
@base SoR_TagDataProcessor_MZ
@url http://dragonflare.blue/dcave/index_e.php
@help This presents an implementation of equipments or states which 
causes heal, damage, growth, and several events when the player 
character moves on map.

In the default system of RPGMV, damages or heals (called regeneration) 
on the map due to states such as poison are activated every 20 steps. 
We cannot modify the number of steps in RPGMV editor. This scripts 
enable us to define arbitrary number of steps to activate such effects 
on map. Effects on actors derived by this plugin are compatible with 
default RPGMV regeneration systems.  

@param IsEnableFlash_for_HPDamage
@desc If 'true', a flash effect on the game screen is occurred when actor's HP is decreased. (This doesn't affect the default effect such as Poison state.)
@default true
@type boolean
*/
 
var Imported = Imported || {};
Imported.SoR_PEW = true;
var SoR = SoR || {};
(function() {
if(!PluginManager._scripts.includes("SoR_TagDataProcessor_MZ")) throw new Error("[SoR_ParameterEffectsByWalk_MZ] This plugin REQUIRES SoR_TagDataProcessor_MZ.");

const Parameters = PluginManager.parameters('SoR_ParameterEffectsByWalk_MZ');
const IsEnableFlash_for_HPDamage = Boolean(Parameters['IsEnableFlash_for_HPDamage'] === 'true' || false);

const SoR_ELD_DM_initializeSoRTagProcessor = DataManager.initializeSoRTagProcessor;
DataManager.initializeSoRTagProcessor = function() {
    SoR_ELD_DM_initializeSoRTagProcessor.call(this);
    const q = {name: "SoRTagCRW", target: ["state","weapon","armor"]};
    this._SoRTagProcessFuncs.push(q);
}

DataManager.SoRTagCRW_init = function(obj) {
    obj.mapRegen = [];
}
DataManager.SoRTagCRW = function(obj, line) { 
	let MatchFlag = true;
	const tag = /<(?:MapWalkEff):[ ]*(.*),[ ]*(.*),[ ]*(.*)>/;

	if (line.match(tag)) {
	    const mapReg = {
			stepsForRegen: undefined,
			stepsForRegenMin: undefined,
			stepsForRegenMax: undefined,
			stateParam: String(RegExp.$2),
			RegenValueMin: undefined,
			RegenValueMax: undefined,
			propo: 'null',
			startsteps: 0
		};
				
		const reg_val = String(RegExp.$1);
		const reg_val2 = String(RegExp.$3);
		let tag2 = /(\d+)\s*~?\s*(\d+)?/;
		if (reg_val.match(tag2)){
			mapReg.stepsForRegenMin = parseInt(RegExp.$1);
			if(mapReg.stepsForRegenMin < 1) mapReg.stepsForRegenMin = 1;
					  
			if(RegExp.$2){
				mapReg.stepsForRegenMax = parseInt(RegExp.$2);
				if(mapReg.stepsForRegenMin > mapReg.stepsForRegenMax){
					const tmp = mapReg.stepsForRegenMin;
					mapReg.stepsForRegenMin = mapReg.stepsForRegenMax;
					mapReg.stepsForRegenMax = tmp;
				}
			}		  
		}
		else return MatchFlag;
				  
		tag2 = /([+,-]?\d+)\s*~?\s*([+,-]?\d+)?(%)?([mc])?/;
		if (reg_val2.match(tag2)){
			mapReg.RegenValueMin = parseInt(RegExp.$1);
			if(RegExp.$2){
				mapReg.RegenValueMax = parseInt(RegExp.$2);
				  
				if(mapReg.RegenValueMin > mapReg.RegenValueMax){
				    const tmp = mapReg.RegenValueMin;
				    mapReg.RegenValueMin = mapReg.RegenValueMax;
				    mapReg.RegenValueMax = tmp;
				}
			}
					  
			if(RegExp.$3){
				if(RegExp.$4) mapReg.propo = String(RegExp.$3) + String(RegExp.$4);// %m or %c
				else mapReg.propo = String(RegExp.$3) + 'm'; //%m
			}
			else if(RegExp.$4) mapReg.propo = '%' + String(RegExp.$4);
					  
					  
		}
		else return MatchFlag;
				  
		obj.mapRegen.push(mapReg);
	}
	else MatchFlag = false;

	return MatchFlag;
}
/////////////////////////////////////////////////////////////////////////////



const SoR_GA_CRW_turnEndOnMap = Game_Actor.prototype.turnEndOnMap;
Game_Actor.prototype.turnEndOnMap = function(){
	SoR_GA_CRW_turnEndOnMap.call(this);
	this.ParameterEffect_onWalk();
}

Game_Actor.prototype.ParameterEffect_onWalk = function() {
	if(!this.WalkEffects_cand) this.WalkEffects_cand = [];
	else this.checkCurrentParameterEffects();	
	
	let num = 0;
	const nstates = this._states.length;
    for(let i=0; i < nstates; i++){
		let state_id = this._states[i];
		if( this.WalkEffects_cand.some(x => x.type=="state" && x.id === state_id) == true ) continue;
		
		if($dataStates[state_id].mapRegen && $dataStates[state_id].mapRegen.length > 0){
			const n_states = $dataStates[state_id].mapRegen.length;
			for(let j=0; j < n_states; j++){
				const effect = {regen: Object.assign({},$dataStates[state_id].mapRegen[j]), type: "state", id: state_id};
			    this.WalkEffects_cand[num] = effect;
			    num++;
			}
		}
	}

	const neqs = this._equips.length;
    for(let i=0; i < neqs; i++){
		let eq_id = this._equips[i]._itemId;
		if(eq_id == 0) continue;
		if(this._equips[i]._dataClass == "weapon"){
		    if( this.WalkEffects_cand.some(x => x.type=="weapon" && x.id === eq_id) == true ) continue;

			if($dataWeapons[eq_id].mapRegen && $dataWeapons[eq_id].mapRegen.length > 0){
				const n_weapons = $dataWeapons[eq_id].mapRegen.length;
				for(let j=0; j < n_weapons; j++){
					const effect = {regen: Object.assign({},$dataWeapons[eq_id].mapRegen[j]), type: "weapon", id: eq_id};
					this.WalkEffects_cand[num] = effect;
				    num++;
				}
			}
		}
		else if(this._equips[i]._dataClass == "armor"){
			if( this.WalkEffects_cand.some(x => x.type=="armor" && x.id === eq_id) == true ) continue;
			
			if($dataArmors[eq_id].mapRegen && $dataArmors[eq_id].mapRegen.length > 0){
				const n_armors = $dataArmors[eq_id].mapRegen.length;
				for(let j=0; j < n_armors; j++){
					Object.assign({},$dataArmors[eq_id].mapRegen[j])

					const effect = {regen: Object.assign({},$dataArmors[eq_id].mapRegen[j]), type: "armor", id: eq_id};
					this.WalkEffects_cand[num] = effect;
					num++;
				}
			}
		}
	}
	
	if(this.WalkEffects_cand.length == 0) return;
	this.ParameterEffect_ByWalk();
}



Game_Actor.prototype.checkCurrentParameterEffects = function() {
	const n_weff = this.WalkEffects_cand.length;
	for(let i=0; i<n_weff; i++){
		const x = this.WalkEffects_cand[i];

		let flag = true;
		if(typeof x === "undefined") false;
		else if(x.type=="state"){
			flag = this._states.some(y => x.id === y);
		}
		else if(x.type=="weapon"){
			flag = this._equips.some(y => y._dataClass=="weapon" && x.id === y._itemId);
		}
		else if(x.type=="armor"){
			flag = this._equips.some(y => y._dataClass=="armor" && x.id === y._itemId);
		}
		if(!flag) this.WalkEffects_cand.splice(i, 1);
	}
}



Game_Actor.prototype.ParameterEffect_ByWalk = function() {

	const nEffk = this.WalkEffects_cand.length;
	for(let j=0; j < nEffk; j++){
		let param = -1;
		let EfkArr = this.WalkEffects_cand[j];
		let mapReg_data = EfkArr.regen;
		
		if(mapReg_data.stepsForRegen == undefined){
			mapReg_data.stepsForRegen = CalcRndForEffect_inRange(mapReg_data.stepsForRegenMin, mapReg_data.stepsForRegenMax);
		    mapReg_data.startsteps = $gameParty.steps()-1;
		}
		 
		
		if( $gameParty.steps()!=mapReg_data.startsteps && ($gameParty.steps()-mapReg_data.startsteps) % mapReg_data.stepsForRegen == 0){
			const result = AnalyzeTagforVal(mapReg_data);
			
			switch(mapReg_data.stateParam){
			case "hp":
			case "HP":
				var Isdamaged = this.regenerateHp_ByWalk(result);
				if(Isdamaged && IsEnableFlash_for_HPDamage) this.performMapDamage();
				break;
						
			case "mp":
			case "MP":
				this.regenerateMp_ByWalk(result);
				break;
					
			case "tp":
			case "TP":
				this.regenerateTp_ByWalk(result);
				break;
					
			case "exp":
			case "EXP":
				this.changeExp_ByWalk(result);
				break;	
				
			case "money":
			case "MONEY":
				changeMoney_ByWalk(result);
				break;

			case "mhp":
			case "MHP":
			    param = 0;
				break;
				
			case "mmp":
			case "MMP":
			    param = 1;
				break;
				
			case "atk":
			case "ATK":
			    param = 2;
				break;
				
			case "def":
			case "DEF":
			    param = 3;
				break;
				
			case "mat":
			case "MAT":
			    param = 4;
				break;
				
			case "mdf":
			case "MDF":
			    param = 5;
				break;
				
			case "agi":
			case "AGI":
			    param = 6;
				break;
				
			case "luk":
			case "LUK":
			    param = 7;
				break;
				
			default:		
							
				let tag = /(?:Var\[)(\d+)\]/i;
				if(mapReg_data.stateParam.match(tag)){ // Variable
					changeVariable_ByWalk(parseInt(RegExp.$1),result);
					break;
				}
				    tag = /(?:Switch\[)(\d+)\]/i;
				if(mapReg_data.stateParam.match(tag)){ // Switch
					changeSwitch_ByWalk(parseInt(RegExp.$1),result);
					break;
				}
					tag = /(?:Script\[)(.*)\]/i;
				if(mapReg_data.stateParam.match(tag)){ // Script
					SoR_Eval(RegExp.$1);
					break;
				}
				
				
				if(Imported.FTKR_AOP){ // For Original parameters defined in FTKR_AddOriginalParameters.js
				    this.ProcessFTKR_AOP_OrigParamVal(mapReg_data.stateParam,result);
				}
				break;
			}
			
			if(param >= 0) this.changeParam_ByWalk(param, result);
			//update num of steps for an effect
			mapReg_data.stepsForRegen = CalcRndForEffect_inRange(mapReg_data.stepsForRegenMin, mapReg_data.stepsForRegenMax);
			mapReg_data.startsteps = $gameParty.steps() ;
		}
		
	}
}



Game_Battler.prototype.regenerateHp_ByWalk = function(v) {
	let val;
	if(v[1]=='%m') val = CalcPropotionValue(this.mhp, v[0]);
	else if(v[1]=='%c') val = CalcPropotionValue(this.hp, v[0]);
	else val = v[0];
	
    val = Math.max(val, -this.maxSlipDamage());
    if (val !== 0) { this.gainHp(val); }
	
	if(val < 0) return true;
	else return false;
}


Game_Battler.prototype.regenerateMp_ByWalk = function(v) {
	let val;
	if(v[1]=='%m') val = CalcPropotionValue(this.mmp, v[0]);
	else if(v[1]=='%c') val = CalcPropotionValue(this.mp, v[0]);
	else val = v[0];
	
    if (val !== 0){ this.gainMp(val); }
}


Game_Battler.prototype.regenerateTp_ByWalk = function(v) {
	let val;
	if(v[1]=='%m') val = CalcPropotionValue(this.tp, v[0]);
	else if(v[1]=='%c') val = CalcPropotionValue(this.tp, v[0]);
	else val = v[0];
	
    if (val !== 0){ this.gainSilentTp(val); }
}


Game_Battler.prototype.changeExp_ByWalk = function(v) {
	const current = this.currentExp();

	if(v[1]=='%m') gain = CalcPropotionValue(current, v[0]);
	else if(v[1]=='%c') gain = CalcPropotionValue(current, v[0]);
	else gain = v[0];

	if(gain>0){
		const uplim = this.nextRequiredExp() - 1;
		if(current+gain > uplim) gain = uplim;
	}
	else{
	    const lolim = (this._level>1 ? this.expForLevel(this._level - 1) : 0 ) - current;
		if(current+gain < lolim) gain = lolim;
	}
	
    this._exp[this._classId] += gain;
}


Game_Battler.prototype.changeParam_ByWalk = function(param,v) {
	let val;
	if(v[1]=='%m') val = CalcPropotionValue(this._paramPlus[param], v[0]);
	else if(v[1]=='%c') val = CalcPropotionValue(this._paramPlus[param], v[0]);
	else val = v[0];
		
	this.addParam(param, val);
}


Game_Battler.prototype.ProcessFTKR_AOP_OrigParamVal = function(Param,v) {
   const FTKR_param = DataManager.getParamId(Param,this);
   if(FTKR_param == -1) return;
      
	let val;
	if(v[1]=='%m') val = CalcPropotionValue(this._aop[FTKR_param] , v[0]);
	else if(v[1]=='%c') val = CalcPropotionValue(this._aop[FTKR_param] , v[0]);
	else val = v[0];
	
    this.gainCAop(FTKR_param, v[0]);
}




function changeMoney_ByWalk(v) {
	let val;
	if(v[1]=='%m') val = CalcPropotionValue($gameParty.gold(), v[0]);
	else if(v[1]=='%c') val = CalcPropotionValue($gameParty.gold(), v[0]);
	else val = v[0];	
		
	if (Imported.CommonPopupCore && Imported.GetInformation){ 
		CommonPopupManager._popEnable = CommonPopupManager.popEnable();
		$gameParty.gainGold(val);
		CommonPopupManager._popEnable = false;
	}
	else {
		$gameParty.gainGold(val);
	}
}


function changeVariable_ByWalk(ID, v) {
	if(ID <= 0) return;
    const current_VarVal = $gameVariables.value(ID);
	
	let val;
	if(v[1]=='%m') val = CalcPropotionValue(current_VarVal, v[0]);
	else if(v[1]=='%c') val = CalcPropotionValue(current_VarVal, v[0]);
	else val = v[0];	
	
	
	
	$gameVariables.setValue(ID,current_VarVal+val)
}


function changeSwitch_ByWalk(ID, val) {
	if(ID <= 0) return;
	
	if(val == 0) $gameSwitches.setValue(ID,false);
	else $gameSwitches.setValue(ID,true);	
}



function AnalyzeTagforVal(data){
	const min = data.RegenValueMin
	const max = data.RegenValueMax;
	const Ispropo = (data.propo == '%m' || data.propo == '%c') ? true : false;
	let res = [0,''];
	
	if(max==undefined) res[0] = min;
	else res[0] =  Math.floor(CalcRndForEffect_inRange(min,max));
	if(Ispropo) res[1] = data.propo;	
	
	return res;	
}



function CalcPropotionValue(target,value){
	let res = Math.floor(target /100.0 * value);
	if(res == 0 && value >0) return 1;
	if(res == 0 && value <0) return -1;  
	return res;
}



function CalcRndForEffect_inRange(min,max){
	min = Math.ceil(min);
	if(max==undefined) return min;
	max = Math.floor(max);
	return Math.round((Math.random() * (max - min + 0.9998)) - 0.4999 + min);
}

/////////////////////////////////////////////////////////////////////////////////////
function SoR_Eval(ev) {
    const sentence = "return (" + ev + ");";

    if(typeof $gameTemp.SoRTmp_script === "undefined") $gameTemp.SoRTmp_script = new Map();
    if(!$gameTemp.SoRTmp_script.has(sentence)){
        $gameTemp.SoRTmp_script.set(sentence, new Function(sentence));
    }
    const res = $gameTemp.SoRTmp_script.get(sentence)();
    return res;
}
}());