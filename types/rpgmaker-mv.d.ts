declare var SceneManager: SceneManagerT;
declare var $gamePlayer: Game_Player;
declare var $gameMap: Game_Map;

declare class SceneManagerT {
  static _scene: Scene_Base;
}

declare class Scene_Base {
  addChild(child: PIXI.DisplayObject): void;
}

declare class Game_Player {
  x: number;
  y: number;
}

declare class Game_Map {
  mapId(): number;
}
