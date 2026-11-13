// FUSE診断 データ辞書 v0.1
// 質問・配点・特性・系統・代償・発動条件・相互作用・プロンプト素材
// 配点ルール: 主パラメータ +6 / 副パラメータ +3 / 指向スコア o（ヒーロー+ / ヴィラン-）

const PARAMS = ["PER", "DRV", "CTL", "RES", "FLX", "DEP"];
const PARAM_JA = { PER: "感知", DRV: "瞬発", CTL: "制御", RES: "共鳴", FLX: "変容", DEP: "深度" };

// 特性: パラメータ × ゾーン（low 0-32 / mid 33-66 / high 67-100）
const TRAITS = {
  PER: ["遮断", "観察", "予兆"],
  DRV: ["蓄積", "切替", "初動"],
  CTL: ["解放", "調律", "精密"],
  RES: ["独立場", "同調", "伝播"],
  FLX: ["不変", "適応", "変幻"],
  DEP: ["拡散", "没入", "深潜"],
};

// 質問16問（全問ヒーロー映画の場面）。選択肢文は設計図の配点マップから起こした v0 ドラフト
const QUESTIONS = [
  { scene: "覚醒の朝", q: "掌に今までなかった力が宿っていた。最初にしたのは？", options: [
    { t: "五感で、体と周囲の異変を確かめる", m: "PER", s: "CTL" },
    { t: "試しに小さく使ってみる", m: "DRV", s: "FLX" },
    { t: "誰にも知られず練習できる場所を探す", m: "DEP", s: "CTL" },
    { t: "一番信頼できる人にだけ見せる", m: "RES", s: "PER" } ] },
  { scene: "緊急出動", q: "崩れかけたビルの現場に到着。最初の一手は？", options: [
    { t: "瓦礫の下の生存者の気配を探す", m: "PER", s: "RES" },
    { t: "考え終わる前に飛び込む", m: "DRV", s: "FLX" },
    { t: "建物の構造から崩落ポイントを特定する", m: "CTL", s: "DEP" },
    { t: "避難する人々の流れを作って混乱を止める", m: "RES", s: "CTL" } ] },
  { scene: "作戦の合間", q: "拠点でのオフの過ごし方は？", options: [
    { t: "能力の訓練を一人で詰める", m: "DEP", s: "CTL" },
    { t: "街に出て気分を変える", m: "FLX", s: "DRV" },
    { t: "仲間と飯を食いながら長く話す", m: "RES", s: "PER" },
    { t: "新しい装備をいじり倒す", m: "FLX", s: "CTL" } ] },
  { scene: "作戦会議", q: "仲間の意見が真っ二つに割れた。自分は？", options: [
    { t: "全員の本音と懸念を聞き出す", m: "PER", s: "RES", o: 6 },
    { t: "自分が決めて責任を取る", m: "DRV", s: "CTL" },
    { t: "誰も言っていない第三の作戦を出す", m: "FLX", s: "DEP" },
    { t: "目的のためなら自分の案を押し切る", m: "DRV", s: "FLX", o: -6 } ] },
  { scene: "潜入", q: "未知の敵拠点に入った瞬間、最初に気になるのは？", options: [
    { t: "出口と監視の死角", m: "PER", s: "CTL" },
    { t: "部屋の空気と敵意の有無", m: "RES", s: "PER" },
    { t: "面白そうな装置や仕掛け", m: "FLX", s: "DRV" },
    { t: "一人になれる影や死角", m: "DEP", s: "PER" } ] },
  { scene: "暴走", q: "自分の能力が制御を離れて暴れ始めた。どうする？", options: [
    { t: "呼吸を整えて出力を絞る", m: "CTL", s: "DEP" },
    { t: "暴走ごと敵にぶつける", m: "DRV", s: "FLX" },
    { t: "仲間に合図して距離を取らせる", m: "RES", s: "PER" },
    { t: "別の使い方に切り替えて力を逃がす", m: "FLX", s: "CTL" } ] },
  { scene: "戦線離脱", q: "仲間が傷つき、戦う気力を失っている。自分は？", options: [
    { t: "言葉を交わすより先に、異変に気づいていた", m: "PER", s: "RES", o: 6 },
    { t: "復帰までの代替作戦を考える", m: "CTL", s: "DEP" },
    { t: "笑わせて無理やり外へ連れ出す", m: "DRV", s: "FLX", o: 6 },
    { t: "あえて一人にさせるが、背後は必ず守る", m: "DEP", s: "PER", o: 6 } ] },
  { scene: "新装備", q: "開発班から新しい装備（または能力の拡張）を渡された。", options: [
    { t: "仕様とマニュアルを読み込む", m: "CTL", s: "DEP" },
    { t: "実戦で試すのが一番早い", m: "DRV", s: "FLX" },
    { t: "先輩の使い手の動きを観察する", m: "PER", s: "RES" },
    { t: "自分専用に調整を詰める", m: "CTL", s: "DEP" } ] },
  { scene: "絶体絶命", q: "あと10秒で何かが決まる。その時一番頼りになるのは？", options: [
    { t: "冴えわたる勘", m: "PER" },
    { t: "考える前に動く体", m: "DRV" },
    { t: "冷えていく頭と、勝ち筋の組み立て", m: "CTL", s: "DEP" },
    { t: "仲間の声", m: "RES" } ] },
  { scene: "長期戦", q: "戦いが何週間も続く。どうやって戦い続ける？", options: [
    { t: "ルーティンを崩さず淡々と", m: "CTL", s: "DEP" },
    { t: "作戦と戦い方を毎日変える", m: "FLX", s: "PER" },
    { t: "仲間と支え合うから続く", m: "RES", s: "PER" },
    { t: "追い込まれるほど燃える", m: "DRV", s: "DEP" } ] },
  { scene: "自分の部屋", q: "拠点にある自分のスペースはどんな感じ？", options: [
    { t: "装備は全部定位置に収まっている", m: "CTL", s: "PER" },
    { t: "散らかっているが、物の場所は全部把握している", m: "PER", s: "FLX" },
    { t: "私物は最小限。すぐ出動できる", m: "DEP", s: "CTL" },
    { t: "気分で模様替えする", m: "FLX", s: "RES" } ] },
  { scene: "チーム戦", q: "集団戦で自分が担いがちな役割は？", options: [
    { t: "敵の動きを先読みして警告する", m: "PER", s: "DEP" },
    { t: "最初に斬り込む", m: "DRV", s: "FLX" },
    { t: "味方の連携を調整する", m: "RES", s: "CTL" },
    { t: "最終局面まで奥の手を切らずに詰める", m: "DEP", s: "CTL" } ] },
  { scene: "想定外", q: "敵は想定の3倍、作戦は崩壊した。まずどう動く？", options: [
    { t: "むしろ燃える", m: "FLX", s: "DRV" },
    { t: "影響範囲と撤退路を洗い直す", m: "CTL", s: "PER" },
    { t: "立て直しに時間がいる。まず態勢を整える", m: "DEP", s: "CTL" },
    { t: "仲間の動揺を見てから動く", m: "RES", s: "PER" } ] },
  { scene: "力の使い道", q: "戦いの後、あなたの力で願いを1つだけ叶えられる。何に使う？", options: [
    { t: "二度と誰も傷つかない世界にする", m: "RES", s: "PER", o: 24 },
    { t: "世界の仕組みと真理を知る", m: "DEP" },
    { t: "誰にも縛られない自由を手に入れる", m: "FLX", s: "DRV", o: -6 },
    { t: "誰もが自分の名を知る存在になる", m: "DRV", s: "RES", o: -6 } ] },
  { scene: "代償の選択", q: "最終決戦、能力の代償は避けられない。誰が払う？", options: [
    { t: "自分が払う", o: 24 },
    { t: "チームで分け合う", o: 12 },
    { t: "代償自体を消す方法を探す", m: "CTL", s: "DEP" },
    { t: "敵に払わせる", o: -24 } ] },
  { scene: "命令と現場", q: "上層部から撤退命令。だが現場にはまだ取り残された人がいる。", options: [
    { t: "命令を破って救助に戻る", o: 12 },
    { t: "命令に従うのも、力を持つ者の責任だ", m: "CTL", o: 12 },
    { t: "状況次第で、得になる方を選ぶ", m: "FLX", o: -6 },
    { t: "命令より自分の目的を優先し、敵を追う", m: "DRV", o: -24 } ] },
];

// 系統: pair=適性パラメータ（重み2.0、他は0.6） / color=ロゴ色 / fx=縁取り色（補色マップ）
const LINEAGES = {
  "時間系": { code: "TM", pair: ["PER", "DEP"], color: "#22d3ee", fx: "#fbbf24" },
  "空間系": { code: "SP", pair: ["FLX", "CTL"], color: "#818cf8", fx: "#e7c46b" },
  "物質系": { code: "MT", pair: ["CTL", "DRV"], color: "#4ade80", fx: "#fb7185" },
  "身体系": { code: "BD", pair: ["DRV", "PER"], color: "#f87171", fx: "#2dd4bf" },
  "精神系": { code: "MN", pair: ["DEP", "PER"], color: "#f472b6", fx: "#a3e635" },
  "感情系": { code: "EM", pair: ["RES", "FLX"], color: "#fb923c", fx: "#38bdf8" },
  "情報系": { code: "IN", pair: ["CTL", "DEP"], color: "#60a5fa", fx: "#fb923c" },
  "確率系": { code: "PR", pair: ["FLX", "DRV"], color: "#c084fc", fx: "#fde047" },
};
const FORM_CODES = { "予知型": "PRE", "速度型": "ACC", "遮断型": "CUT", "変換型": "TRN", "共有型": "SHR",
  "改変型": "ALT", "転移型": "MOV", "増幅型": "AMP", "回復型": "REC", "読解型": "ANL", "蓄積型": "CHG", "固定型": "FIX" };

// 代償（最低パラメータから）
const COSTS = {
  PER: { tag: "代償：周囲の変化に気づけない", text: "発動中、周囲の変化に気づけない" },
  DRV: { tag: "代償：発動に溜めが要る", text: "発動までに時間を要する（溜めが必要）" },
  CTL: { tag: "代償：暴走の危険", text: "出力が安定せず、使いすぎると暴走する" },
  RES: { tag: "代償：一人の場面に弱い", text: "1人でしか使えない／人に頼れない場面で弱い" },
  FLX: { tag: "代償：応用が利かない", text: "同じ使い方しかできない（応用が利かない）" },
  DEP: { tag: "代償：核心に届かない", text: "浅く広くしか届かない（核心には届かない）" },
};

// 発動条件（最高パラメータ × ゾーン）
const TRIGGERS = {
  PER: ["静まり返った時", "周囲を一望した時", "異変を感じた瞬間"],
  DRV: ["溜めきった時", "スイッチが入った時", "考えるより先にピンチで"],
  CTL: ["感情が溢れた時", "呼吸を整えた時", "狙いを定めた時"],
  RES: ["一人きりの時", "誰かと目が合った時", "誰かを守ろうとした時"],
  FLX: ["いつもの日常・ルーティンの中で", "いつもと違う道を選んだ時", "状況が一変した時"],
  DEP: ["目についた瞬間", "没頭しきった時", "静かな場所で集中した時"],
};

// 相互作用ルール（特記事項）
const INTERACTIONS = [
  { if: (v) => v.PER >= 67 && v.RES >= 67, text: "他人の感情を拾いすぎる。人の多い場所では消耗する" },
  { if: (v) => v.DRV >= 67 && v.CTL <= 32, text: "発動は最速だが、自分でも止められないことがある" },
  { if: (v) => v.DEP >= 67 && v.FLX <= 32, text: "一度決めた対象からは切り替えが苦手" },
  { if: (v) => v.CTL >= 67 && v.DRV <= 32, text: "精度は最高クラス。ただし発動までが長い" },
  { if: (v) => v.FLX >= 67 && v.DEP <= 32, text: "同時にいくつも始められるが、飽きも早い" },
  { if: (v) => v.PER <= 32 && v.CTL >= 67, text: "雑音に強く、混乱した場ほど冷静になる" },
];

// キャラクター生成プロンプト素材（英語 / 日本語）
const PROMPT_BITS = {
  lineage_en: {
    "時間系": "floating clock gears and glowing time rings fill the background",
    "空間系": "warped space, floating geometric structures and stretching distance markers surround the character",
    "物質系": "crystals, stone and metal reshape in mid-air around the character",
    "身体系": "glowing heartbeat waveforms and energy lines run through the character's body",
    "精神系": "dreamlike giant eyes and floating fragments of memories drift around the character",
    "感情系": "drifting embers and warm glowing light orbs fill the air",
    "情報系": "streams of glowing data, letters and glyphs flow around the character",
    "確率系": "floating dice, playing cards and branching paths of light surround the character",
  },
  form_en: {
    "予知型": "translucent afterimages of near-future movements move slightly ahead of the body",
    "速度型": "bright speed trails and multiple motion afterimages streak behind the character",
    "遮断型": "a clean silent barrier cuts through the air where all effects stop",
    "変換型": "objects caught mid-transformation, half one form and half another",
    "共有型": "gentle waves of light spread from the character to everyone nearby",
    "改変型": "reality glitches and rewrites itself in patches around the character",
    "転移型": "the character appears half-faded in two places at once",
    "増幅型": "radiating shockwaves of power expand outward from the character",
    "回復型": "soft healing light knits wounds and cracks closed",
    "読解型": "hidden patterns and weak points glow like annotations in the air",
    "蓄積型": "compressed energy gathers into one dense glowing point, about to release",
    "固定型": "everything around the character is frozen perfectly in place",
  },
  trait_en: {
    "遮断": "a calm self-contained stance, an invisible wall of focus", "観察": "watching from one step back with an analytical gaze",
    "予兆": "calm and focused, eyes gently closed in concentration", "蓄積": "a coiled patient stance, power held back",
    "切替": "relaxed but ready, one hand resting on an invisible switch", "初動": "an explosive starting pose, the body already in motion",
    "解放": "an unrestrained wide stance, power overflowing", "調律": "a precise balanced posture, hands adjusting invisible dials",
    "精密": "a meticulous pose, fingertips aligned with millimeter precision", "独立場": "standing alone and unshaken in the middle of chaos",
    "同調": "mirroring the pose of an unseen partner in perfect sync", "伝播": "arms open in a welcoming stance with a warm reassuring smile",
    "不変": "an immovable stance like a mountain in a storm", "適応": "a fluid pose, already shifting to fit the moment",
    "変幻": "a playful mid-change pose, the form blurring into a new shape", "拡散": "gesturing widely, attention split across many points at once",
    "没入": "deeply absorbed, the world outside the focus blurred away", "深潜": "a quiet diving pose, sinking toward something deep and hidden",
  },
  cost_en: {
    PER: "one eye covered by a dark lens that never lifts", DRV: "a heavy charging device locked around one ankle",
    CTL: "cracks of unstable energy run along one arm", RES: "a barrier field that quietly pushes other people away",
    FLX: "a rigid single-form weapon that can never change shape", DEP: "a shallow rippling aura that never reaches deep water",
  },
  type_en: {
    "尖型": "a dynamic low-angle composition with strong diagonal motion",
    "双極型": "two contrasting translucent duplicates flank the character symmetrically",
    "万能型": "a balanced centered composition with a stable grounded stance",
    "潜在型": "a quiet composition with soft light, power still sleeping beneath the surface",
  },
  styles: {
    "アニメ映画風": "high-quality anime movie illustration, cinematic lighting",
    "アメコミ風": "American comic book style, bold ink outlines, halftone dot shading, vibrant flat colors",
    "ゲーム風": "polished game key visual illustration, dramatic lighting",
  },
};
