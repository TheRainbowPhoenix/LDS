//==============================================================================
// MpiShowSpine
//==============================================================================

/*:
 * @plugindesc Spineアニメーションの表示を行うプラグイン
 * @author 奏ねこま（おとぶき ねこま）
 * 
 * @param Spine File
 * @type string[]
 * @default 
 * @desc Spineファイル（*.json）の場所を指定してください。
 *
 * @help
 * [概要]
 *  Esoteric Software社のSpineアニメーションファイルを読み込み、表示する機能を提
 *  供します。
 * 
 * [使い方]
 *  ※[事前準備]、[制限事項]、[プラグインパラメータ]、[プラグインコマンド]をよく
 *    お読みになった上でご使用ください。
 * 
 *  ※すべてのプラグインコマンドの引数に変数を指定することができます。
 *    例：SetSpineAnimation 1 \v[10] true
 *    上記例の場合、\v[10]の部分は変数＃0010の値に置き換えられます。
 * 
 *  [Spineアニメーションを表示する]
 *   プラグインコマンド'ShowSpine'を使用します。
 *   当コマンド実行後にイベントコマンド「ピクチャの表示」を実行すると、ピクチャ
 *   の表示で設定した座標、拡大率、不透明度でSpineアニメーションを表示します。
 *   なお、「原点」「合成方法」の設定は無効となります。また、不透明度については
 *   パーツごとに半透明となるため、期待した表示結果にならない可能性があります。
 * 
 *  [アニメーション内容を変更する]
 *   プラグインコマンド'SetSpineAnimation'、'AddSpineAnimation'を使用します。
 *   コマンドを実行した時点で即座に変更したい場合はSetSpineAnimationを、表示中の
 *   アニメーションが1ループ分終わったあとに変更したい場合はAddSpineAnimationを
 *   使用してください。
 * 
 *  [複数のアニメーションを連続して再生する]
 *   プラグインコマンド'AddSpineAnimation'を使用します。
 *   当コマンドを一度に複数設定すると、設定したアニメーションを順次再生します。
 * 
 *  [指定したアニメーションの中からランダムで再生する]
 *   プラグインコマンド'SetSpineRandomAnimation'、'AddSpineRandomAnimation'、
 *   'SetSpineRandomAnimationEx'、'AddSpineRandomAnimationEx'を使用します。
 * 
 *  [アニメーションの切り替わりを滑らかにする]
 *   プラグインコマンド'SetSpineMix'を使用します。
 * 
 *  [スキンを切り替える]
 *   プラグインコマンド'SetSpineSkin'を使用します。
 * 
 *  [アニメーションの再生速度（タイムスケール）を変更する]
 *   プラグインコマンド'SetSpineTimeScale'を使用します。
 * 
 *  [色合いや透明度を変更する]
 *   プラグインコマンド'SetSpineColor'を使用します。
 * 
 *  [一部のパーツにモザイクをかける]]
 *   プラグインコマンド'SetSpineMosaic'を使用します。
 * 
 *  [Spineに設定したイベントの音声を再生する]
 *   [イベントに設定した音声の再生について]をご参照ください。
 * 
 * [事前準備]
 *  'https://github.com/pixijs'から'pixi-spine.js'を取得してください。
 *  ※ご利用のSpineのバージョンによって取得する場所が異なります。
 *   ・Spine 3.7x以前
 *  　　https://github.com/pixijs/pixi-spine/tree/v4.x/bin
 * 　・Spine 3.8x以降
 *  　　https://github.com/pixijs/pixi-spine/tree/pixi4-spine3.8/bin
 *  取得した'pixi-spine.js'を、'js/libs'フォルダ内に置いてください。
 *  'img'フォルダ内に、'spines'フォルダを作成してください。
 *  作成した'spines'フォルダの中に、json形式でエクスポートしたSpineアニメーショ
 *  ンファイル一式（jsonファイル以外のファイルを含む）を入れてください。
 *  なお、エクスポートの際は「アトラス作成（Create atlas）」をONにしてください。
 *  atlasファイルはjsonファイルと同名でなければなりません。
 *  エクスポートした結果、ファイル名が異なっていた場合は同名に変更してください。
 * 
 * [制限事項]
 *  デプロイメントの際に「未使用ファイルを含まない」をONにしていると'spines'フォ
 *  ルダおよびその中のファイルは未使用ファイルと判断され、デプロイメントの対象か
 *  ら外されてしまいます。お手数ですがデプロイメント後に'spines'フォルダ以下のフ
 *  ァイルをデプロイメント先にコピーするなど、個別に対応をお願いします。
 * 
 *  画像の暗号化には対応していません。デプロイメントの際に画像の暗号化を行われる
 *  場合はデプロイメント後に'spines'フォルダ以下のファイルを暗号化前のものと置き
 *  換えて頂くようお願いします。
 * 
 * [プラグインパラメータ]
 *  Spine File
 *   Spineアニメーションファイル（*.json）を指定してください。ファイルは複数指定
 *   できます。jsonファイル以外のファイルは指定する必要はありません。
 *   また、拡張子（.json）は書く必要はありません。（書いても問題ありません）。
 * 
 *   [例] 'img/spines'フォルダにある'spineboy.json'ファイルを指定する場合
 * 
 *     spineboy
 * 
 *   [例] 'img/spines'フォルダに'spineboy'フォルダがあり、
 *          その中に'spineboy.json'ファイルがある場合
 * 
 *     spineboy/spineboy
 * 
 * [プラグインコマンド]
 *  ShowSpine <ファイル名> <アニメーション名> <ループの有無>
 *   <ファイル名>       Spineアニメーションファイルのファイル名（拡張子不要）
 *   <アニメーション名> Spineアニメーションに設定されているアニメーション名
 *   <ループの有無>     アニメーションを繰り返すかどうか。（true/false）
 * 
 *   表示したいSpineアニメーションを設定します。コマンド実行後、イベントコマンド
 *   「ピクチャの表示」実行時に、設定したSpineアニメーションが表示されます。
 *   ループの有無は省略可能です。省略した場合、'true'を指定した扱いとなります。
 * 
 *   [例] ShowSpine spineboy walk true
 *   [例] ShowSpine spineboy jump false
 * ........
 *  SetSpineAnimation <ピクチャ番号> <アニメーション名> <ループの有無>
 *   <ピクチャ番号>     アニメーションを設定する対象となるピクチャ番号
 *   <アニメーション名> Spineアニメーションに設定されているアニメーション名
 *   <ループの有無>     アニメーションを繰り返すかどうか。（true/false）
 * 
 *   表示中のSpineアニメーションのアニメーション内容を変更します。コマンド実行直
 *   後に現在のアニメーションは中断され、新しいアニメーションが開始されます。
 *   ループの有無は省略可能です。省略した場合、'true'を指定した扱いとなります。
 * 
 *   [例] SetSpineAnimation 1 walk true
 *   [例] SetSpineAnimation 2 jump false
 * ........
 *  AddSpineAnimation <ピクチャ番号> <アニメーション名> <ループの有無>
 *   <ピクチャ番号>     アニメーションを追加する対象となるピクチャ番号
 *   <アニメーション名> Spineアニメーションに設定されているアニメーション名
 *   <ループの有無>     アニメーションを繰り返すかどうか。（true/false）
 * 
 *   表示中のSpineアニメーションにアニメーション内容を追加します。コマンドを実行
 *   しても即座にアニメーションは開始せず、現在再生中のアニメーションが1ループ分
 *   完了したのちに再生を開始します。また、複数のAddSpineAnimationを重ねて実行し
 *   た場合、実行した順にアニメーションを順次再生していきます。
 *   ループの有無は省略可能です。省略した場合、'true'を指定した扱いとなります。
 *   なお、複数のAddSpineAnimationを重ねて実行した場合、ループの有無の指定は最後
 *   のコマンドのみ有効となります。
 * 
 *   [例] AddSpineAnimation 1 walk true
 *   [例] AddSpineAnimation 2 jump false
 * ........
 *  SetSpineRandomAnimation <ピクチャ番号> <アニメーション名リスト> <ループの有無>
 *   <ピクチャ番号>           アニメーションを設定する対象となるピクチャ番号
 *   <アニメーション名リスト> Spineアニメーションに設定されているアニメーション名のリスト
 *   <ループの有無>           アニメーションを繰り返すかどうか。（true/false）
 * 
 *   表示中のSpineアニメーションのアニメーション内容を変更します。コマンド実行直
 *   後に現在のアニメーションは中断され、新しいアニメーションが開始されます。
 *   開始するアニメーションはアニメーション名リストの中からランダムで抽選されま
 *   す。また、アニメーションごとに抽選確率を設定できます（下記実行例を参照）。
 *   ループの有無は省略可能です。省略した場合、'true'を指定した扱いとなります。
 * 
 *   [例] SetSpineRandomAnimation 1 idle,walk true
 * 
 *    idleとwalkを1:1の確率で抽選し、選ばれた方のアニメーションを開始
 * 
 *   [例] SetSpineRandomAnimation 2 idle(5),walk false
 * 
 *    idleとwalkを5:1の確率で抽選し、選ばれた方のアニメーションを開始
 * ........
 *  AddRandomSpineAnimation <ピクチャ番号> <アニメーション名リスト> <ループの有無>
 *   <ピクチャ番号>           アニメーションを追加する対象となるピクチャ番号
 *   <アニメーション名リスト> Spineアニメーションに設定されているアニメーション名のリスト
 *   <ループの有無>           アニメーションを繰り返すかどうか。（true/false）
 * 
 *   表示中のSpineアニメーションにアニメーション内容を追加します。コマンドを実行
 *   しても即座にアニメーションは開始せず、現在再生中のアニメーションが1ループ分
 *   完了したのちに再生を開始します。開始するアニメーションはアニメーション名リ
 *   ストの中からランダムで抽選されます。また、アニメーションごとに抽選確率を設
 *   定できます（下記実行例を参照）。
 *   ループの有無は省略可能です。省略した場合、'true'を指定した扱いとなります。
 *   なお、複数のAddSpineAnimationを重ねて実行した場合、ループの有無の指定は最後
 *   のコマンドのみ有効となります。
 * 
 *   [例] AddSpineRandomAnimation 1 idle,walk true
 * 
 *    idleとwalkを1:1の確率で抽選し、選ばれた方のアニメーションを追加
 * 
 *   [例] AddSpineRandomAnimation 2 idle(5),walk false
 * 
 *    idleとwalkを5:1の確率で抽選し、選ばれた方のアニメーションを追加
 * ........
 *  SetSpineRandomAnimationEx <ピクチャ番号> <アニメーション名リスト>
 *   <ピクチャ番号>           アニメーションを設定する対象となるピクチャ番号
 *   <アニメーション名リスト> Spineアニメーションに設定されているアニメーション名のリスト
 * 
 *   基本的にSetSpineRandomAnimationと同じですが、設定されたアニメーションが1ル
 *   ープ分再生されると再びランダム抽選し、アニメーションを開始します。
 * 
 *   [例] SetSpineRandomAnimationEx 1 idle,walk true
 * 
 *    idleとwalkを1:1の確率で抽選し、選ばれた方のアニメーションを開始
 *    アニメーションの再生が終わると再びランダムで抽選し、再生
 * 
 *   [例] SetSpineRandomAnimationEx 2 idle(5),walk false
 * 
 *    idleとwalkを5:1の確率で抽選し、選ばれた方のアニメーションを開始
 *    アニメーションの再生が終わると再びランダムで抽選し、再生
 * ........
 *  AddSpineRandomAnimationEx <ピクチャ番号> <アニメーション名リスト>
 *   <ピクチャ番号>           アニメーションを追加する対象となるピクチャ番号
 *   <アニメーション名リスト> Spineアニメーションに設定されているアニメーション名のリスト
 * 
 *   基本的にAddSpineRandomAnimationと同じですが、設定されたアニメーションが1ル
 *   ープ分再生されると再びランダム抽選し、アニメーションを開始します。
 * 
 *   [例] AddSpineRandomAnimationEx 1 idle,walk true
 * 
 *    idleとwalkを1:1の確率で抽選し、選ばれた方のアニメーションを追加
 *    追加されたアニメーションの再生が終わると再びランダムで抽選し、再生
 * 
 *   [例] AddSpineRandomAnimationEx 2 idle(5),walk false
 * 
 *    idleとwalkを5:1の確率で抽選し、選ばれた方のアニメーションを追加
 *    追加されたアニメーションの再生が終わると再びランダムで抽選し、再生
 * ........
 *  SetSpineMix <ピクチャ番号> <アニメーション名> <次アニメーション名> <合成時間>
 *   <ピクチャ番号>       アニメーション合成を設定する対象となるピクチャ番号
 *   <アニメーション名>   Spineアニメーションに設定されているアニメーション名
 *   <次アニメーション名> Spineアニメーションに設定されているアニメーション名
 *   <合成時間>           アニメーション間の合成部分の時間
 * 
 *   アニメーションを切り替える際の、アニメーション間の合成部分の時間を設定しま
 *   す。本設定を行うと、アニメーションが切り替わるとき、切り替え前のアニメーシ
 *   ョンから切り替え後のアニメーションへ、指定した合成時間をかけて滑らかに移行
 *   します。
 * 
 *   [例] SetSpineMix 1 walk run 0.2
 * 
 *    walk から run へ切り替わるとき、0.2秒かけて滑らかに切り替わる
 * 
 *   [例] SetSpineMix 2 run jump 0.4
 * 
 *    run から jump へ切り替わるとき、0.4秒かけて滑らかに切り替わる
 * ........
 *  SetSpineSkin <ピクチャ番号> <スキン名>
 *   <ピクチャ番号> スキンを設定する対象となるピクチャ番号
 *   <スキン名>     Spineアニメーションに設定されているスキン名
 * 
 *   表示中のSpineアニメーションのスキンを変更します。
 * 
 *   [例] SetSpineSkin 1 goblin
 *   [例] SetSpineSkin 2 goblingirl
 * 
 * ........
 *  SetSpineTimeScale <ピクチャ番号> <タイムスケール値>
 *   <ピクチャ番号>     タイムスケールを設定する対象となるピクチャ番号
 *   <タイムスケール値> 設定するタイムスケールの値
 * 
 *   表示中のSpineアニメーションのタイムスケールを変更します。デフォルトのタイム
 *   スケールは1です。例えばタイムスケール値に2を指定した場合、アニメーション速
 *   度が2倍になります。タイムスケール値に0は指定できません。アニメーションが停
 *   止したような演出をしたい場合は、0に近い0以外の値を指定してください。
 * 
 *   [例] SetSpineTimeScale 1 2
 *   [例] SetSpineTimeScale 2 4
 *   [例] SetSpineTimeScale 3 0.0000001
 * 
 * ........
 *  SetSpineColor <ピクチャ番号> <赤> <緑> <青> <不透明度>
 *   <ピクチャ番号> 色を設定する対象となるピクチャ番号
 *   <赤>           係数（赤）
 *   <緑>           係数（緑）
 *   <青>           係数（青）
 *   <不透明度>     係数（不透明度）
 * 
 *   表示中のSpineアニメーションの色を変更します。色そのものを指定するのではなく
 *   元の色に各係数を掛けたものが表示される色となります。
 *   例えば元の色がRGBA=(100,100,100,255)だった場合、係数（赤）に1.5を指定し、他
 *   はすべて1.0とすると、表示される色はRGBA=(150,100,100,255)となります。
 *   要するに1.0は元の色のまま、1.0より小さいとその色味は弱くなり、1.0より大きい
 *   と強くなります。
 * 
 *   [例] SetSpineColor 1 1.5 1.0 1.0 1.0
 *   [例] SetSpineColor 2 1.0 1.0 1.0 0.5
 * 
 * ........
 *  SetSpineMosaic <ピクチャ番号> <イメージ名> <サイズ>
 *   <ピクチャ番号> モザイクを適用する対象となるピクチャ番号
 *   <イメージ名>   適用するパーツのイメージ名
 *   <サイズ>       モザイクのサイズ（ピクセル数）
 * 
 *   Spineアニメーションの一部パーツにモザイクを適用します。指定するイメージ名は
 *   Spineアニメーション作成時に設定した画像ファイルの名前です。例えばSpineアニ
 *   ーションに「head」という画像を設定していて、その部分をモザイクにしたい場合
 *   はイメージ名に head と指定します。モザイクを解除する場合はサイズの指定をせ
 *   ずにプラグインコマンドを実行してください。
 * 
 *   [例] SetSpineMosaic 1 head 6
 *   [例] SetSpineMosaic 2 foot 12
 *   [例] SetSpineMosaic 1 head
 * 
 * [イベントに設定した音声の再生について]
 *  Spineにイベントを設定していて、そのイベントにオーディオを設定している場合、
 *  イベントのトリガーに合わせて音声を再生します。再生される音声について、以下の
 *  点にご注意ください。
 * 
 *  ・再生される音声はaudio/seフォルダ内のoggまたはm4aファイル
 *    例えばSpineのイベントに「ABC.mp3」という音声ファイルを登録していた場合、
 *    ツクールMVで再生する場合はaudio/seフォルダ内の「ABC.ogg」または「ABC.m4a」
 *    が再生されます。ogg/m4aのどちらが再生されるかについてはツクールMVの仕様、
 *    または外部プラグイン等の制御に従います。
 * 
 *  ・ボリュームとバランスはタイムライン上のキーに設定したものを使用
 *    音声のボリュームとバランスは、タイムライン上に配置したイベントのキーに設定
 *    されているものを使用します。ツリー上のイベントの音声設定を変更しても、タイ
 *    ムライン上の設定が変更されていなければゲームには反映されません。
 *
 *  ボリュームとバランスについては変数の値を反映することもできます。タイムライン
 *  上のイベントのキーの「文字列」に以下のような記述をすることで変数の値を使用す
 *  るようになります。
 *
 *  ・変数10番の値をボリュームの値として使用する場合
 *     volume:10
 *
 *  ・変数20番の値をバランスの値として使用する場合
 *     balance:20
 *
 *  ・ボリュームとバランスの両方に変数の値を使用する場合
 *     volume:10,balance:20
 * 
 * [利用規約] ..................................................................
 *  - 本プラグインの利用は、RPGツクールMV/RPGMakerMVの正規ユーザーに限られます。
 *  - 商用、非商用、有償、無償、一般向け、成人向けを問わず、利用可能です。
 *  - 利用の際、連絡や報告は必要ありません。また、製作者名の記載等も不要です。
 *  - プラグインを導入した作品に同梱する形以外での再配布、転載はご遠慮ください。
 *  - 本プラグインにより生じたいかなる問題についても、一切の責任を負いかねます。
 * [改訂履歴] ..................................................................
 *   Version 1.12  2020/05/28  pixi-spine.jsとjsonの読み込み処理改善
 *   Version 1.11  2020/02/09  クリッピングのあるアニメーション実行中にモザイク
 *                             化を実行するとエラーになることがある不具合を修正
 *   Version 1.10  2019/10/21  パーツのモザイク化機能を追加
 *   Version 1.09  2019/10/18  アニメーションのランダム再生機能を追加
 *   Version 1.08  2019/10/11  Spineのイベントによる音声再生に対応
 *   Version 1.07  2019/10/06  MadeWithMv.jsとの競合対策
 *   Version 1.06  2019/03/29  セーブ時に表示していたSpineアニメーションが
 *                             ロード後に表示されなくなっていた不具合を修正
 *                             スキン変更が正しく行われていなかった不具合を修正
 *   Version 1.05  2019/03/17  競合対策
 *   Version 1.04  2018/12/13  カラー変更機能追加
 *   Version 1.03  2018/10/31  Spineファイル読み込み処理改善
 *   Version 1.02  2018/10/24  タイムスケール変更機能追加
 *   Version 1.01  2018/06/11  スキンに対応
 *   Version 1.00  2018/06/11  初版
 * -+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-
 *  Web Site: http://makonet.sakura.ne.jp/rpg_tkool/
 *  Twitter : https://twitter.com/koma_neko
 *  Copylight (c) 2018 Nekoma Otobuki
 */

var Imported = Imported || {};
var Makonet = Makonet || {};

(function(){
    'use strict';

    const plugin = 'MpiShowSpine';

    Imported[plugin] = true;
    Makonet[plugin] = {};

    const $mpi = Makonet[plugin];
    $mpi.parameters = PluginManager.parameters(plugin);

    $mpi.spineFiles = eval($mpi.parameters['Spine File']);
    $mpi.spineData = {};

    function loadSpine() {
        let loader = new PIXI.loaders.Loader();
        $mpi.spineFiles.forEach(function(file) {
            let name = file.replace(/^.*\//, '').replace(/\.json$/, '');
            $mpi.spineData[name] = null;
            loader = loader.add(name, 'img/spines/' + file.replace(/^\//, '').replace(/\.json$/, '') + '.json');
        });
        loader.load(function(loader, resource) {
            Object.keys($mpi.spineData).forEach(function(key) {
                $mpi.spineData[key] = resource[key].spineData;
            });
        });
    }

    if (!PIXI.spine) {
        let js = null;
        for (let element of document.getElementsByTagName('script')) {
            if (element.src.match('pixi-spine.js')) {
                js = element;
            }
        }
        if (!js) {
            js = document.createElement('script');
            js.type = 'text/javascript';
            js.src = 'js/libs/pixi-spine.js';
            document.body.appendChild(js);
        }
        js.addEventListener('load', loadSpine);
    } else {
        loadSpine();
    }
    
    // mosaic filter
    class MosaicFilter extends PIXI.Filter {
        constructor(size = 10) {
            let fragment = 'precision mediump float;varying vec2 vTextureCoord;uniform vec2 size;uniform sampler2D uSampler;uniform vec4 filterArea;vec2 mapCoord(vec2 coord){coord*=filterArea.xy;coord+=filterArea.zw;return coord;}vec2 unmapCoord(vec2 coord){coord-=filterArea.zw;coord/=filterArea.xy;return coord;}vec2 pixelate(vec2 coord, vec2 size){return floor(coord / size) * size;}void main(void){vec2 coord=mapCoord(vTextureCoord);coord=pixelate(coord, size);coord=unmapCoord(coord);gl_FragColor=texture2D(uSampler, coord);}';
            super(null, fragment);
            this.uniforms.size = [size, size];
        }
    }
    PIXI.filters.MosaicFilter = MosaicFilter;

    //==============================================================================
    // Private Methods
    //==============================================================================

    function convertVariables(text) {
        if (typeof(text) !== 'string') return text;
        let pattern = '\\\\v\\[(\\d+)\\]';
        while (text.match(RegExp(pattern, 'i'))) {
            text = text.replace(RegExp(pattern, 'gi'), function(){
                return $gameVariables.value(+arguments[1]);
            });
        }
        return text;
    }

    //==============================================================================
    // Scene_Boot
    //==============================================================================
    
    {
        let __isReady = Scene_Boot.prototype.isReady;
        Scene_Boot.prototype.isReady = function() {
            return __isReady.apply(this, arguments) &&
            Object.keys($mpi.spineData).every(function(key) {
                return !!$mpi.spineData[key];
            });
        };
    }

    //==============================================================================
    // Game_Temp
    //==============================================================================

    {
        let __initialize = Game_Temp.prototype.initialize;
        Game_Temp.prototype.initialize = function() {
            __initialize.apply(this, arguments);
            this._MSS_Spines = {};
        };
    }
    
    //==============================================================================
    // Game_Interpreter
    //==============================================================================
    
    {
        let __pluginCommand = Game_Interpreter.prototype.pluginCommand;
        Game_Interpreter.prototype.pluginCommand = function(command, args) {
            __pluginCommand.apply(this, arguments);
            command = command.toLowerCase();
            switch (command) {
            case 'showspine':
                var name = convertVariables(args[0]) || '';
                var animation = convertVariables(args[1]) || '';
                var loop = (convertVariables(args[2]) || 'true').toLowerCase() === 'true';
                $gameTemp._MSS_SpineActions = [{ name: name, animation: animation, loop: loop, type: 0 }];
                break;
            case 'setspineanimation':
            case 'addspineanimation':
                var id = Number(convertVariables(args[0])) || 0;
                var animation = convertVariables(args[1]) || '';
                var loop = (convertVariables(args[2]) || 'true').toLowerCase() === 'true';
                var picture = (id > 0) ? $gameScreen.picture(id) : null;
                var type = (command === 'setspineanimation') ? 0 : 1;
                if (picture && picture._MSS_IsSpine) {
                    if (!picture._MSS_SpineActions) {
                        picture._MSS_SpineActions = [];
                    }
                    picture._MSS_SpineActions.push({ animation: animation, loop: loop, type: type });
                }
                break;
            case 'setspinemix':
                var id = Number(convertVariables(args[0])) || 0;
                var from = convertVariables(args[1]) || '';
                var to = convertVariables(args[2]) || '';
                var duration = Number(convertVariables(args[3])) || 0;
                var picture = (id > 0) ? $gameScreen.picture(id) : null;
                if (picture && picture._MSS_IsSpine) {
                    if (!picture._MSS_SpineActions) {
                        picture._MSS_SpineActions = [];
                    }
                    picture._MSS_SpineActions.push({ from: from, to: to, duration: duration, type: 2 });
                }
                break;
            case 'setspineskin':
                var id = Number(convertVariables(args[0])) || 0;
                var skin = convertVariables(args[1]) || '';
                var picture = (id > 0) ? $gameScreen.picture(id) : null;
                if (picture && picture._MSS_IsSpine) {
                    if (!picture._MSS_SpineActions) {
                        picture._MSS_SpineActions = [];
                    }
                    picture._MSS_SpineActions.push({ skin: skin, type: 3 });
                }
                break;
            case 'addspineskin':
                var id = Number(convertVariables(args[0])) || 0;
                var skin = convertVariables(args[1]) || '';
                var picture = (id > 0) ? $gameScreen.picture(id) : null;
                if (picture && picture._MSS_IsSpine) {
                    if (!picture._MSS_SpineActions) {
                        picture._MSS_SpineActions = [];
                    }
                    picture._MSS_SpineActions.push({ skin: skin, type: 11 });
                }
                break;
            case 'setspinetimescale':
                var id = Number(convertVariables(args[0])) || 0;
                var timescale = Number(convertVariables(args[1])) || 1;
                var picture = (id > 0) ? $gameScreen.picture(id) : null;
                if (picture && picture._MSS_IsSpine) {
                    if (!picture._MSS_SpineActions) {
                        picture._MSS_SpineActions = [];
                    }
                    picture._MSS_SpineActions.push({ timescale: timescale, type: 4 });
                }
                break;
            case 'setspinecolor':
                var id = Number(convertVariables(args[0])) || 0;
                var red = Number(convertVariables(args[1])) || 0;
                var green = Number(convertVariables(args[2])) || 0;
                var blue = Number(convertVariables(args[3])) || 0;
                var alpha = Number(convertVariables(args[4])) || 0;
                var picture = (id > 0) ? $gameScreen.picture(id) : null;
                if (picture && picture._MSS_IsSpine) {
                    if (!picture._MSS_SpineActions) {
                        picture._MSS_SpineActions = [];
                    }
                    picture._MSS_SpineActions.push({ color: { red: red, green: green, blue: blue, alpha: alpha }, type: 5 });
                }
                break;
            case 'setspinerandomanimation':
            case 'addspinerandomanimation':
            case 'setspinerandomanimationex':
            case 'addspinerandomanimationex':
                var id = Number(convertVariables(args[0])) || 0;
                var animations = convertVariables(args[1]) || '';
                var loop = (convertVariables(args[2]) || 'true').toLowerCase() === 'true';
                var picture = (id > 0) ? $gameScreen.picture(id) : null;
                var type = 6 + (/^add/.test(command) ? 1 : 0) + (/ex$/.test(command) ? 2 : 0);
                if (picture && picture._MSS_IsSpine) {
                    if (!picture._MSS_SpineActions) {
                        picture._MSS_SpineActions = [];
                    }
                    picture._MSS_SpineActions.push({ animations: animations, loop: (type <= 7) ? loop : false, type: type });
                }
                break;
            case 'setspinemosaic':
                var id = Number(convertVariables(args[0])) || 0;
                var image = convertVariables(args[1]) || '';
                var size = Number(convertVariables(args[2])) || 1;
                var picture = (id > 0) ? $gameScreen.picture(id) : null;
                if (picture && picture._MSS_IsSpine) {
                    if (!picture._MSS_SpineActions) {
                        picture._MSS_SpineActions = [];
                    }
                    picture._MSS_SpineActions.push({ image: image, size: size, type: 10 });
                }
                break;
            }
        };
    }
    
    //==============================================================================
    // Game_Screen
    //==============================================================================

    {
        let __showPicture = Game_Screen.prototype.showPicture;
        Game_Screen.prototype.showPicture = function(pictureId, name, origin, x, y, scaleX, scaleY, opacity, blendMode) {
            let spineAnimations = $gameTemp._MSS_SpineActions;
            if (spineAnimations) {
                name = '';
            }
            __showPicture.call(this, pictureId, name, origin, x, y, scaleX, scaleY, opacity, blendMode);
            let picture = this._pictures[this.realPictureId(pictureId)];
            if (spineAnimations) {
                picture._MSS_SpineActions = spineAnimations;
                picture._MSS_IsSpine = true;
                delete $gameTemp._MSS_SpineActions;
            } else {
                picture._MSS_IsSpine = false;
            }
        };
    }
    
    //==============================================================================
    // Sprite_Picture
    //==============================================================================
    
    {
        let __update = Sprite_Picture.prototype.update;
        Sprite_Picture.prototype.update = function() {
            let picture = this.picture();
            if (!picture || !picture._MSS_IsSpine) {
                if (this._MSS_Spine) {
                    this.removeChild(this._MSS_Spine);
                    delete this._MSS_Spine;
                }
                let realPictureId = $gameScreen.realPictureId(this._pictureId);
                if ($gameTemp._MSS_Spines[realPictureId]) {
                    delete $gameTemp._MSS_Spines[realPictureId];
                }
                if (picture) {
                    delete picture._MSS_SpineName;
                    delete picture._MSS_SpineAnimationList;
                    delete picture._MSS_SpineMixList;
                    delete picture._MSS_SpineSkin;
                    delete picture._MSS_SpineTimeScale;
                    delete picture._MSS_SpineStart;
                    delete picture._MSS_SpinePause;
                    delete picture._MSS_SpineColor;
                    delete picture._MSS_SpineRandomAnimationList;
                    delete picture._MSS_SpineMosaicList;
                }
            }
            let update = Sprite.prototype.update;
            if (this._MSS_Spine) {
                Sprite.prototype.update = function(){};
            }
            __update.apply(this,arguments);
            Sprite.prototype.update = update;
        };
        Sprite_Picture.prototype.playAction = function (PicNo ,Spine_State, Spine_Action) {
            var mLayer = 0;
            var mSpeed = 1;
            var loopflg = true;
            var n = 0;
            /* for (n = 0; n <= SpinAnimePLayer.length - 1; n++){
                if (SpinAnimePLayer[n]._PicNo == PicNo){
                    if (SpinAnimePLayer[n]._MtnName == Spine_Action.animation) {
                        loopflg = SpinAnimePLayer[n]._loopflg;
                        mLayer = SpinAnimePLayer[n]._Slayer;
                        mSpeed = SpinAnimePLayer[n]._Speed;
                    }
                }
            } */
            Spine_State.setAnimation(mLayer, Spine_Action.animation, loopflg, mSpeed);
        }
        Sprite_Picture.prototype.AddAction = function (PicNo, Spine_State, Spine_Action) {
            var mLayer = 0;
            var mSpeed = 1;
            var loopflg = true;
            var n = 0;
            /* for (n = 0; n <= SpinAnimePLayer.length - 1; n++) {
                if (SpinAnimePLayer[n]._PicNo == PicNo) {
                    if (SpinAnimePLayer[n]._MtnName == Spine_Action.animation) {
                        loopflg = SpinAnimePLayer[n]._loopflg;
                        mLayer = SpinAnimePLayer[n]._Slayer;
                        mSpeed = SpinAnimePLayer[n]._Speed;
                    }
                }
            } */
            Spine_State.addAnimation(mLayer, Spine_Action.animation, loopflg, 0, mSpeed);
        }

        let __updateBitmap = Sprite_Picture.prototype.updateBitmap;
        Sprite_Picture.prototype.updateBitmap = function() {
            __updateBitmap.apply(this, arguments);
            let picture = this.picture();
            if (picture) {
                if (picture._MSS_RsvSpineActions != undefined) {
                    for (var jj = 0; jj <= picture._MSS_RsvSpineActions.length - 1; jj++) {
                        if (picture._MSS_SpineActions == undefined) {
                            picture._MSS_SpineActions  = [];
                        }
                        picture._MSS_SpineActions.push(picture._MSS_RsvSpineActions[jj]);
                    }
                }
                picture._MSS_RsvSpineActions = [];
                let spineActions = picture._MSS_SpineActions;
                let realPictureId = $gameScreen.realPictureId(this._pictureId);
                if (spineActions) {
                    spineActions.forEach(function(spineAction) {
                        // show spine
                        if (spineAction.name) {
                            if (!$mpi.spineData[spineAction.name]) { 
                                console.log("ActionResave"); 
                                picture._MSS_RsvSpineActions.push(spineAction);
                                return;
                            }
                            picture._MSS_SpineName = spineAction.name;
                            picture._MSS_SpineAnimationList = [spineAction];
                            picture._MSS_SpineMixList = {};
                            picture._MSS_SpineSkin = null;
                            picture._MSS_SpineTimeScale = 1;
                            picture._MSS_SpineStart = performance.now();
                            picture._MSS_SpinePause = 0;
                            picture._MSS_SpineColor = null;
                            picture._MSS_SpineRandomAnimationList = null;
                            picture._MSS_SpineMosaicList = null;
                            if (this._MSS_Spine) {
                                this.removeChild(this._MSS_Spine);
                            }
                            this._MSS_Spine = $gameTemp._MSS_Spines[realPictureId] = new PIXI.spine.Spine($mpi.spineData[spineAction.name]);
                            this._MSS_Spine.state.setAnimation(0, spineAction.animation, spineAction.loop);
                            if (this._MSS_Spine.spineData.skins.length > 1) {
                                picture._MSS_SpineSkin = this._MSS_Spine.spineData.skins[1].name;
                                this._MSS_Spine.skeleton.setSkinByName(picture._MSS_SpineSkin);
                            }
                            this._MSS_Spine.state.addListener({
                                event: this.onSpineEvent.bind(this),
                                complete: this.onSpineComplete.bind(this)
                            });
                            this.addChild(this._MSS_Spine);
                        // set animation
                        } else if (spineAction.type === 0) {
                            this._MSS_Spine.state.setAnimation(0, spineAction.animation, spineAction.loop);
                            picture._MSS_SpineAnimationList = [spineAction];
                            picture._MSS_SpineStart = performance.now();
                            picture._MSS_SpinePause = 0;
                            picture._MSS_SpineRandomAnimationList = null;
                        // add animation
                        } else if (spineAction.type === 1) {
                            this._MSS_Spine.state.addAnimation(0, spineAction.animation, spineAction.loop, 0);
                            picture._MSS_SpineAnimationList.push(spineAction);
                            picture._MSS_SpineRandomAnimationList = null;
                        // set mix
                        } else if (spineAction.type === 2) {
                            var si = 0;
                            for (si = 0; si <= this._MSS_Spine.spineData.animations.length - 1; si++){
                                if (spineAction.to != this._MSS_Spine.spineData.animations[si].name) {
                                    this._MSS_Spine.stateData.setMix(this._MSS_Spine.spineData.animations[si].name
                                        , spineAction.to, spineAction.duration);
                                    picture._MSS_SpineMixList[[this._MSS_Spine.spineData.animations[si].name, spineAction.to]] = spineAction;
                                }
                            }
                            //this._MSS_Spine.stateData.setMix(spineAction.from, spineAction.to, spineAction.duration); //nupu元はこれ
                        } else if (spineAction.type === 3) {
                            this._MSS_Spine.skeleton.setSkinByName(spineAction.skin);
                            this._MSS_Spine.skeleton.setSlotsToSetupPose();
                            picture._MSS_SpineSkin = spineAction.skin;
                        // set timescale
                        } else if (spineAction.type === 4) {
                            this._MSS_Spine.state.timeScale = spineAction.timescale;
                            picture._MSS_SpineTimeScale = spineAction.timescale;
                        // set color
                        } else if (spineAction.type === 5) {
                            let color = spineAction.color;
                            let filter = new PIXI.filters.ColorMatrixFilter();
                            filter.matrix = [
                                color.red, 0, 0, 0, 0,
                                0, color.green, 0, 0, 0,
                                0, 0, color.blue, 0, 0,
                                0, 0, 0, color.alpha, 0
                            ];
                            this._MSS_Spine.filters = [filter];
                            picture._MSS_SpineColor = spineAction.color;
                        // set random animation
                        // add random animation
                        // set random animation ex
                        // add random animation ex
                        } else if (spineAction.type >= 6 && spineAction.type <= 9) {
                            let list = [];
                            let total_weight = 0;
                            spineAction.animations.split(/,/).forEach(animation => {
                                let name = animation.replace(/\((\d+)\)$/, '');
                                let weight = Number(RegExp.$1) || 1;
                                list.push({ name: name, border: total_weight + weight });
                                total_weight += weight;
                            });
                            let value = Math.random() * total_weight;
                            let animation = '';
                            for (let i = 0; i < list.length; i++) {
                                if (list[i].border > value) {
                                    animation = list[i].name;
                                    break;
                                }
                            }
                            if (animation) {
                                spineAction.animation = animation;
                                delete spineAction.animations;
                                if ([6, 8].includes(spineAction.type)) {
                                    this._MSS_Spine.state.setAnimation(0, animation, spineAction.loop);
                                    picture._MSS_SpineAnimationList = [spineAction];
                                    picture._MSS_SpineStart = performance.now();
                                    picture._MSS_SpinePause = 0;
                                } else {
                                    this._MSS_Spine.state.addAnimation(0, animation, spineAction.loop, 0);
                                    picture._MSS_SpineAnimationList.push(spineAction);
                                }
                                picture._MSS_SpineRandomAnimationList = null;
                            }
                            if (spineAction.type >= 8) {
                                picture._MSS_SpineRandomAnimationList = list;
                            }
                        // set mosaic
                        } else if (spineAction.type == 10) {
                            let image = spineAction.image;
                            let size = spineAction.size;
                            this._MSS_Spine.children.forEach(child => {
                                child.children.forEach(child => {
                                    try{ 
                                        if (child.region && child.region.name == image) {
                                            let filters = child.filters || [];
                                            let index = filters.findIndex(filter => {
                                                return (filter instanceof MosaicFilter);
                                            });
                                            if (index >= 0) {
                                                if (size > 1) {
                                                    filters.splice(index, 1, new MosaicFilter(size));
                                                    spineAction.index = index;
                                                    MosOkAdd(realPictureId, image, size);
                                                } else {
                                                    filters.splice(index, 1);
                                                }
                                            } else if (size > 1) {
                                                filters.push(new MosaicFilter(size));
                                                spineAction.index = 0;
                                                MosOkAdd(realPictureId, image, size);
                                            }
                                            child.filters = (filters.length > 0) ? filters : null;
                                        }
                                    } catch (ex) {
                                        MosErrAdd(realPictureId, image, size);
                                    }
                                });
                            });
                            let list = picture._MSS_SpineMosaicList || {};
                            (size > 1) ? list[image] = spineAction : delete list[image];
                            picture._MSS_SpineMosaicList = list;
                        } else if (spineAction.type === 11) {
                            this._MSS_Spine.skeleton.setSkinByName(spineAction.skin);
                            this._MSS_Spine.skeleton.setSlotsToSetupPose();
                            picture._MSS_SpineSkin = spineAction.skin;
                        }
                    }, this);
                    delete picture._MSS_SpineActions;
                } else if (!this._MSS_Spine) {
                    // after scene change
                    if ($gameTemp._MSS_Spines[realPictureId]) {
                        this._MSS_Spine = $gameTemp._MSS_Spines[realPictureId];
                        this.addChild(this._MSS_Spine);
                        this._MSS_Spine.updateTransform();
                        this._MSS_Spine.state.timeScale = picture._MSS_SpineTimeScale || 1;
                    // after load data
                    } else if (picture._MSS_IsSpine) {
                        if (picture._MSS_SpineName != undefined) {
                            this._MSS_Spine = $gameTemp._MSS_Spines[realPictureId] = new PIXI.spine.Spine($mpi.spineData[picture._MSS_SpineName]);
                            let trackTime = (picture._MSS_SpinePause - picture._MSS_SpineStart) / 1000;
                            let finished = 0;
                            let durations = {};
                            let durationTotal = 0;
                            this._MSS_Spine.spineData.animations.forEach(function(animation) {
                                durations[animation.name] = animation.duration;
                            });
                            picture._MSS_SpineAnimationList.forEach(function(spineAnimation, index) {
                                if (index === 0) {
                                    this._MSS_Spine.state.setAnimation(0, spineAnimation.animation, spineAnimation.loop);
                                } else {
                                    this._MSS_Spine.state.addAnimation(0, spineAnimation.animation, spineAnimation.loop, 0);
                                }
                                durationTotal += durations[spineAnimation.animation];
                                if (durationTotal <= trackTime) {
                                    finished++;
                                }
                            }, this);
                            Object.keys(picture._MSS_SpineMixList).forEach(function(key) {
                                let spineMix = picture._MSS_SpineMixList[key];
                                try {
                                    this._MSS_Spine.stateData.setMix(spineMix.from, spineMix.to, spineMix.duration);
                                }catch(ex){
                                }
                            }, this);
                            this._MSS_Spine.state.tracks[0].trackTime = trackTime;
                            if (picture._MSS_SpineSkin) {
                                this._MSS_Spine.skeleton.setSkinByName(picture._MSS_SpineSkin);
                            }
                            this._MSS_Spine.state.timeScale = picture._MSS_SpineTimeScale || 1;
                            if (picture._MSS_SpineColor) {
                                let color = picture._MSS_SpineColor;
                                let filter = new PIXI.filters.ColorMatrixFilter();
                                filter.matrix = [
                                    color.red, 0, 0, 0, 0,
                                    0, color.green, 0, 0, 0,
                                    0, 0, color.blue, 0, 0,
                                    0, 0, 0, color.alpha, 0
                                ];
                                this._MSS_Spine.filters = [filter];
                            }
                            if (picture._MSS_SpineMosaicList) {
                                let list = picture._MSS_SpineMosaicList;
                                Object.keys(list).sort((a, b) => list[a].index - list[b].index)
                                    .forEach(key => {
                                        this._MSS_Spine.children.forEach(child => {
                                            child.children.forEach(child => {
                                                if (child.region != undefined) { 
                                                    if (child.region.name == key) {
                                                        child.filters = [new MosaicFilter(list[key].size)];
                                                    }
                                                }
                                            });
                                        });
                                    });
                            }
                            this.addChild(this._MSS_Spine);
                            this._MSS_Spine.state.addListener({ complete: this.onSpineComplete.bind(this) });
                            for (let i = 0; i < finished; i++) {
                                this._MSS_Spine.updateTransform();
                            }
                            this._MSS_Spine.state.addListener({ event: this.onSpineEvent.bind(this) });
                            console.log("after Load Spine"); 
                            SpineLoadFlg = true; 
                            this._MSS_Spine.skeleton.Mdlname = picture._MSS_SpineName;
                            this._MSS_Spine.skeleton.setSkinByName("");
                        }
                    }
                }
                // pause animation
                if (this._MSS_Spine) {
                    if (this._MSS_Spine.state.timeScale === 0) {
                        if (picture._MSS_SpinePause === 0) {
                            picture._MSS_SpinePause = performance.now();
                        }
                    } else {
                        if (picture._MSS_SpinePause > 0) {
                            picture._MSS_SpineStart += (performance.now() - picture._MSS_SpinePause);
                            picture._MSS_SpinePause = 0;
                        }
                    }
                }
            }
        };

        Sprite_Picture.prototype.onSpineEvent = function(trackEntry, event) {
            if (!event.audioData) {
                let path = event.data.audioPath;
                let dir = '';
                let name = '';
                let volume = event.volume;
                let balance = event.balance;
                let stringValue = event.stringValue;
                let volume_id = null;
                let balance_id = null;
                path = path ? path.replace(/\.[^.]+$/, '') : '';
                if (path.includes('/')) {
                    let index = path.lastIndexOf('/');
                    dir = path.substr(0, index);
                    name = path.substr(index + 1);
                } else {
                    dir = '';
                    name = path;
                }
                volume = (typeof volume == 'number') ? volume * 100 : 100;
                balance = (typeof balance == 'number') ? balance * 100 : 0;
                stringValue.trim().split(/ *, */).forEach(data => {
                    let [name, value] = data.split(/ *: */);
                    switch (name) {
                    case 'volume':
                        volume_id = Number(value);
                        break;
                    case 'balance':
                        balance_id = Number(value);
                        break;
                    }
                });
                event.audioData = {
                    path: path,
                    dir: dir,
                    name: name,
                    volume: volume,
                    balance: balance,
                    volume_id: volume_id,
                    balance_id: balance_id
                };
            }
            let audioData = event.audioData;
            let path = audioData.path;
            let dir = audioData.dir;
            let name = audioData.name;
            let volume = audioData.volume;
            let balance = audioData.balance;
            let volume_id = audioData.volume_id;
            let balance_id = audioData.balance_id;
            if (path) {
                let se = {
                    path: path,
                    dir: dir,
                    name: name,
                    volume: volume_id ? $gameVariables.value(volume_id) : volume,
                    pan: balance_id ? $gameVariables.value(balance_id) : balance,
                    pitch: 100
                };
                AudioManager.playSpineSe(se);
            }
        };

        Sprite_Picture.prototype.onSpineComplete = function(trackEntry) {
            if (!trackEntry.next) {
                let picture = this.picture();
                if (picture) {
                    let list = picture._MSS_SpineRandomAnimationList;
                    if (list) {
                        let value = Math.random() * list[list.length - 1].border;
                        let animation = '';
                        for (let i = 0; i < list.length; i++) {
                            if (list[i].border > value) {
                                animation = list[i].name;
                                break;
                            }
                        }
                        if (animation) {
                            this._MSS_Spine.state.setAnimation(0, animation, false);
                            picture._MSS_SpineAnimationList.reverse().splice(1);
                            picture._MSS_SpineAnimationList[0].animation = animation;
                            picture._MSS_SpineStart = performance.now();
                            picture._MSS_SpinePause = 0;
                        }
                    }
                }
            }
        };
    }

    //==============================================================================
    // Scene_Base
    //==============================================================================

    {
        let __terminate = Scene_Base.prototype.terminate;
        Scene_Base.prototype.terminate = function() {
            __terminate.apply(this, arguments);
            if ($gameTemp) {
                Object.keys($gameTemp._MSS_Spines).forEach(function(key) {
                    $gameTemp._MSS_Spines[key].state.timeScale = 0;
                });
            }
            if (this._spriteset && this._spriteset._pictureContainer) {
                this._spriteset._pictureContainer.children.forEach(function(sprite) {
                    if (sprite instanceof Sprite_Picture) {
                        let picture = sprite.picture();
                        if (picture && picture._MSS_IsSpine) {
                            sprite.update();
                        }
                    }
                });
            }
        };
    }
    
    //==============================================================================
    // AudioManager
    //==============================================================================
    
    AudioManager.playSpineSe = function(se) {
        if (se.name) {
            this.loadSpineSe(se);
            for (var i = 0; i < this._staticBuffers.length; i++) {
                var buffer = this._staticBuffers[i];
                if (buffer._reservedSeName === se.path) {
                    buffer.stop();
                    this.updateSeParameters(buffer, se);
                    buffer.play(false);
                    break;
                }
            }
        }
    };
    
    AudioManager.loadSpineSe = function(se) {
        if (se.name && !this.isStaticSe({ name: se.path })) {
            var buffer = this.createBuffer(se.dir ? 'se/' + se.dir : 'se', se.name);
            buffer._reservedSeName = se.path;
            this._staticBuffers.push(buffer);
            if (this.shouldUseHtml5Audio()) {
                Html5Audio.setStaticSe(buffer._url);
            }
        }
    };

    //==============================================================================
    // Console Debug Extensions
    //==============================================================================

    /**
     * Display a Spine animation from the Console.
     * @param {number} picId - The Picture ID (1-100).
     * @param {string} fileName - The Spine JSON file name (without extension).
     * @param {string} animName - The specific animation name (e.g., 'walk', 'idle').
     * @param {boolean} loop - Whether to loop the animation (default: true).
     * @param {number} x - X screen coordinate (default: center).
     * @param {number} y - Y screen coordinate (default: center).
     */
    window.debugSpine = function(picId, fileName, animName, loop, x, y) {
        // Validation checks
        if (!$gameScreen) { console.error("Game is not running or scene is not ready."); return; }
        
        // Check if the spine data is actually loaded in the parameters
        var spineData = Makonet['MpiShowSpine'].spineData;
        if (!spineData || !spineData[fileName]) {
            console.warn("Spine file '" + fileName + "' not found in pre-loaded data.");
            console.log("Available Spines:", Object.keys(spineData));
            return;
        }

        // Defaults
        picId = picId || 1;
        animName = animName || 'idle'; // Attempt 'idle' if generic
        loop = (loop === undefined) ? true : loop;
        x = (x === undefined) ? 408 : x; // Default to approx center of 816 width
        y = (y === undefined) ? 312 : y; // Default to approx center of 624 height

        console.log("Injecting Spine: " + fileName + " (" + animName + ") -> Picture " + picId);

        // 1. Set the Global Temp Action (This mimics the Plugin Command logic)
        $gameTemp._MSS_SpineActions = [{ 
            name: fileName, 
            animation: animName, 
            loop: loop, 
            type: 0 
        }];

        // 2. Call Show Picture (This triggers the MpiShowSpine override)
        // Origin is set to 1 (Center) by default for easier testing
        $gameScreen.showPicture(
            picId, 
            "",   // Name is empty because Spine handles the texture
            1,    // Origin (0=TopLeft, 1=Center)
            x, 
            y, 
            100,  // Scale X
            100,  // Scale Y
            255,  // Opacity
            0     // Blend Mode
        );
    };

    /**
     * Helper to see what animations are available inside a loaded Spine file.
     */
    window.listSpineAnims = function(fileName) {
        var spineData = Makonet['MpiShowSpine'].spineData;
        if (spineData && spineData[fileName]) {
            var anims = spineData[fileName].animations.map(function(a) { return a.name; });
            console.log("Animations for " + fileName + ":", anims);
        } else {
            console.error("Spine file not found. Loaded files:", Object.keys(spineData));
        }
    };
}());
