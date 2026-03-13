// ===== 游戏数据配置 =====

// 作物数据
const CROPS_DATA = {
    radish: {
        id: 'radish', name: '萝卜', icon: '🥕', color: 0xff6600,
        growTime: 2 * 60, // 秒（游戏内时间，实际2分钟）
        price: 10, sellPrice: 25, xp: 5,
        stages: ['🌱', '🌿', '🥕'], unlockLevel: 1,
        type: 'fast', quality: 1,
        description: '生长最快的蔬菜，适合新手'
    },
    lettuce: {
        id: 'lettuce', name: '生菜', icon: '🥬', color: 0x44aa44,
        growTime: 3 * 60,
        price: 12, sellPrice: 30, xp: 6,
        stages: ['🌱', '🌿', '🥬'], unlockLevel: 1,
        type: 'fast', quality: 1,
        description: '清脆爽口的蔬菜'
    },
    tomato: {
        id: 'tomato', name: '番茄', icon: '🍅', color: 0xff2200,
        growTime: 8 * 60,
        price: 20, sellPrice: 55, xp: 12,
        stages: ['🌱', '🌿', '🌸', '🍅'], unlockLevel: 5,
        type: 'normal', quality: 2,
        description: '多汁的番茄，用途广泛'
    },
    corn: {
        id: 'corn', name: '玉米', icon: '🌽', color: 0xffcc00,
        growTime: 10 * 60,
        price: 25, sellPrice: 70, xp: 15,
        stages: ['🌱', '🌿', '🌾', '🌽'], unlockLevel: 5,
        type: 'normal', quality: 2,
        description: '金黄的玉米，产量丰富'
    },
    wheat: {
        id: 'wheat', name: '小麦', icon: '🌾', color: 0xddaa00,
        growTime: 6 * 60,
        price: 15, sellPrice: 40, xp: 10,
        stages: ['🌱', '🌿', '🌾'], unlockLevel: 3,
        type: 'normal', quality: 1,
        description: '可以加工成面粉'
    },
    strawberry: {
        id: 'strawberry', name: '草莓', icon: '🍓', color: 0xff1155,
        growTime: 20 * 60,
        price: 50, sellPrice: 150, xp: 30,
        stages: ['🌱', '🌿', '🌸', '🍓'], unlockLevel: 15,
        type: 'rare', quality: 3,
        description: '甜蜜的草莓，价值不菲'
    },
    blueberry: {
        id: 'blueberry', name: '蓝莓', icon: '🫐', color: 0x4444ff,
        growTime: 25 * 60,
        price: 60, sellPrice: 180, xp: 35,
        stages: ['🌱', '🌿', '🌸', '🫐'], unlockLevel: 15,
        type: 'rare', quality: 3,
        description: '富含营养的蓝莓'
    },
    pumpkin: {
        id: 'pumpkin', name: '南瓜', icon: '🎃', color: 0xff8800,
        growTime: 15 * 60,
        price: 40, sellPrice: 110, xp: 25,
        stages: ['🌱', '🌿', '🎃'], unlockLevel: 10,
        type: 'normal', quality: 2,
        description: '秋季特色作物'
    },
    sunflower: {
        id: 'sunflower', name: '向日葵', icon: '🌻', color: 0xffdd00,
        growTime: 12 * 60,
        price: 35, sellPrice: 90, xp: 20,
        stages: ['🌱', '🌿', '🌻'], unlockLevel: 8,
        type: 'normal', quality: 2,
        description: '阳光般的花朵，可提取葵花油'
    },
    goldApple: {
        id: 'goldApple', name: '金苹果', icon: '🍎', color: 0xffd700,
        growTime: 60 * 60,
        price: 200, sellPrice: 800, xp: 100,
        stages: ['🌱', '🌿', '🌸', '🍎'], unlockLevel: 30,
        type: 'legendary', quality: 4,
        description: '传说中的金苹果，价值连城',
        special: true
    },
    rainbowRose: {
        id: 'rainbowRose', name: '彩虹玫瑰', icon: '🌹', color: 0xff00ff,
        growTime: 90 * 60,
        price: 300, sellPrice: 1200, xp: 150,
        stages: ['🌱', '🌿', '🌸', '🌹'], unlockLevel: 35,
        type: 'legendary', quality: 4,
        description: '极其罕见的彩虹玫瑰',
        special: true
    }
};

// 动物数据
const ANIMALS_DATA = {
    chicken: {
        id: 'chicken', name: '小鸡', icon: '🐔', color: 0xffdd88,
        growTime: 5 * 60, // 成长时间
        price: 100, product: '🥚', productName: '鸡蛋',
        productValue: 15, productTime: 3 * 60,
        unlockLevel: 1, type: 'poultry',
        description: '勤劳的小鸡，每天产蛋'
    },
    duck: {
        id: 'duck', name: '鸭子', icon: '🦆', color: 0x88aaff,
        growTime: 6 * 60,
        price: 150, product: '🥚', productName: '鸭蛋',
        productValue: 20, productTime: 4 * 60,
        unlockLevel: 3, type: 'poultry',
        description: '可爱的鸭子，产出鸭蛋'
    },
    cow: {
        id: 'cow', name: '奶牛', icon: '🐄', color: 0xffffff,
        growTime: 15 * 60,
        price: 500, product: '🥛', productName: '牛奶',
        productValue: 50, productTime: 8 * 60,
        unlockLevel: 8, type: 'livestock',
        description: '温顺的奶牛，产出新鲜牛奶'
    },
    sheep: {
        id: 'sheep', name: '绵羊', icon: '🐑', color: 0xeeeeee,
        growTime: 12 * 60,
        price: 400, product: '🧶', productName: '羊毛',
        productValue: 40, productTime: 6 * 60,
        unlockLevel: 6, type: 'livestock',
        description: '软绵绵的绵羊，产出羊毛'
    },
    pig: {
        id: 'pig', name: '小猪', icon: '🐷', color: 0xffaaaa,
        growTime: 10 * 60,
        price: 300, product: '🥩', productName: '猪肉',
        productValue: 60, productTime: 10 * 60,
        unlockLevel: 5, type: 'livestock',
        description: '胖乎乎的小猪'
    },
    alpaca: {
        id: 'alpaca', name: '羊驼', icon: '🦙', color: 0xddcc88,
        growTime: 30 * 60,
        price: 1500, product: '✨', productName: '稀有毛料',
        productValue: 200, productTime: 20 * 60,
        unlockLevel: 20, type: 'rare',
        description: '神奇的羊驼，产出稀有毛料'
    },
    peacock: {
        id: 'peacock', name: '孔雀', icon: '🦚', color: 0x00aaaa,
        growTime: 40 * 60,
        price: 2000, product: '🪶', productName: '孔雀羽毛',
        productValue: 300, productTime: 25 * 60,
        unlockLevel: 25, type: 'rare',
        description: '美丽的孔雀，产出珍贵羽毛'
    },
    unicorn: {
        id: 'unicorn', name: '独角兽', icon: '🦄', color: 0xff88ff,
        growTime: 120 * 60,
        price: 10000, product: '💫', productName: '传说材料',
        productValue: 1000, productTime: 60 * 60,
        unlockLevel: 40, type: 'fantasy',
        description: '传说中的独角兽，产出传说材料',
        special: true
    }
};

// 商店工具数据
const TOOLS_DATA = {
    wateringCan: { id: 'wateringCan', name: '高级水壶', icon: '🪣', price: 200, description: '浇水效率+50%', unlockLevel: 5 },
    fertilizer: { id: 'fertilizer', name: '有机肥料', icon: '🌿', price: 50, description: '加速作物生长20%', unlockLevel: 1, stackable: true },
    pesticide: { id: 'pesticide', name: '农药', icon: '💊', price: 80, description: '保护作物免受病虫害', unlockLevel: 3, stackable: true },
    speedUp: { id: 'speedUp', name: '加速卡', icon: '⚡', price: 100, description: '立即完成一个作物生长', unlockLevel: 1, stackable: true },
    energyDrink: { id: 'energyDrink', name: '能量饮料', icon: '🧃', price: 30, description: '恢复30点能量', unlockLevel: 1, stackable: true },
    landUpgrade: { id: 'landUpgrade', name: '土地升级券', icon: '📜', price: 500, description: '升级一块土地品质', unlockLevel: 10, stackable: true },
    streakProtect: { id: 'streakProtect', name: '连胜保护卡', icon: '🛡️', price: 150, description: '保护连续签到记录', unlockLevel: 5, stackable: true }
};

// 装饰数据
const DECO_DATA = {
    fence: { id: 'fence', name: '木栅栏', icon: '🪵', price: 100, description: '装饰农场边界' },
    windmill: { id: 'windmill', name: '风车', icon: '🌀', price: 500, description: '增加农场魅力值' },
    pond: { id: 'pond', name: '小池塘', icon: '🏞️', price: 800, description: '可以钓鱼' },
    barn: { id: 'barn', name: '谷仓', icon: '🏚️', price: 1000, description: '增加仓库容量' },
    greenhouse: { id: 'greenhouse', name: '温室', icon: '🏡', price: 2000, description: '作物不受天气影响' },
    scarecrow: { id: 'scarecrow', name: '稻草人', icon: '🎃', price: 300, description: '保护作物' }
};

// 成就数据
const ACHIEVEMENTS_DATA = [
    // === 种植成就 ===
    { id: 'first_harvest', name: '初次收获', icon: '🌾', desc: '收获第一棵作物', reward: 100, xp: 50, diamond: 1, condition: 'totalHarvest >= 1', rarity: 'common', category: 'plant' },
    { id: 'harvest_10', name: '勤劳农夫', icon: '👨‍🌾', desc: '累计收获10次', reward: 200, xp: 100, diamond: 2, condition: 'totalHarvest >= 10', rarity: 'common', category: 'plant' },
    { id: 'harvest_50', name: '种植能手', icon: '🌿', desc: '累计收获50次', reward: 400, xp: 200, diamond: 3, condition: 'totalHarvest >= 50', rarity: 'uncommon', category: 'plant' },
    { id: 'harvest_100', name: '丰收达人', icon: '🏆', desc: '累计收获100次', reward: 500, xp: 300, diamond: 5, condition: 'totalHarvest >= 100', rarity: 'rare', category: 'plant' },
    { id: 'harvest_500', name: '农业帝国', icon: '👑', desc: '累计收获500次', reward: 2000, xp: 1000, diamond: 10, condition: 'totalHarvest >= 500', rarity: 'legendary', category: 'plant' },
    { id: 'rare_crop', name: '珍稀收藏家', icon: '🍓', desc: '收获一种珍稀作物', reward: 500, xp: 200, diamond: 3, condition: 'rareHarvest >= 1', rarity: 'rare', category: 'plant' },
    { id: 'rare_crop_10', name: '稀有专家', icon: '🫐', desc: '累计收获10次珍稀作物', reward: 1000, xp: 500, diamond: 5, condition: 'rareHarvest >= 10', rarity: 'epic', category: 'plant' },
    { id: 'legendary_crop', name: '传说农夫', icon: '🌹', desc: '收获一种传说作物', reward: 2000, xp: 1000, diamond: 8, condition: 'legendaryHarvest >= 1', rarity: 'legendary', category: 'plant' },
    { id: 'golden_harvest', name: '金色奇迹', icon: '✨', desc: '触发一次金色收获', reward: 300, xp: 150, diamond: 2, condition: 'goldenHarvests >= 1', rarity: 'rare', category: 'plant' },
    { id: 'golden_harvest_10', name: '黄金之手', icon: '🤲', desc: '触发10次金色收获', reward: 1000, xp: 500, diamond: 5, condition: 'goldenHarvests >= 10', rarity: 'epic', category: 'plant' },
    { id: 'all_crops', name: '植物百科', icon: '📚', desc: '种植过所有种类的作物', reward: 3000, xp: 1500, diamond: 10, condition: 'uniqueCrops >= 11', rarity: 'legendary', category: 'plant' },

    // === 动物成就 ===
    { id: 'first_animal', name: '动物朋友', icon: '🐾', desc: '购买第一只动物', reward: 150, xp: 80, diamond: 1, condition: 'totalAnimals >= 1', rarity: 'common', category: 'animal' },
    { id: 'animals_3', name: '小牧场', icon: '🐣', desc: '拥有3只动物', reward: 300, xp: 150, diamond: 2, condition: 'totalAnimals >= 3', rarity: 'common', category: 'animal' },
    { id: 'animals_5', name: '小农场主', icon: '🐄', desc: '同时拥有5只动物', reward: 400, xp: 200, diamond: 3, condition: 'totalAnimals >= 5', rarity: 'uncommon', category: 'animal' },
    { id: 'animals_10', name: '牧场主人', icon: '🏡', desc: '同时拥有10只动物', reward: 1000, xp: 500, diamond: 5, condition: 'totalAnimals >= 10', rarity: 'rare', category: 'animal' },
    { id: 'animals_15', name: '动物园长', icon: '🦁', desc: '同时拥有15只动物', reward: 2000, xp: 1000, diamond: 8, condition: 'totalAnimals >= 15', rarity: 'epic', category: 'animal' },

    // === 等级成就 ===
    { id: 'level_5', name: '启程之路', icon: '🌱', desc: '达到5级', reward: 200, xp: 0, diamond: 1, condition: 'level >= 5', rarity: 'common', category: 'progress' },
    { id: 'level_10', name: '成长之路', icon: '⭐', desc: '达到10级', reward: 500, xp: 0, diamond: 2, condition: 'level >= 10', rarity: 'uncommon', category: 'progress' },
    { id: 'level_20', name: '农业专家', icon: '🌟', desc: '达到20级', reward: 1000, xp: 0, diamond: 5, condition: 'level >= 20', rarity: 'rare', category: 'progress' },
    { id: 'level_30', name: '庄园主', icon: '💫', desc: '达到30级', reward: 2000, xp: 0, diamond: 8, condition: 'level >= 30', rarity: 'epic', category: 'progress' },
    { id: 'level_40', name: '传奇农神', icon: '👑', desc: '达到40级', reward: 5000, xp: 0, diamond: 15, condition: 'level >= 40', rarity: 'legendary', category: 'progress' },

    // === 经济成就 ===
    { id: 'gold_1000', name: '小有积蓄', icon: '💰', desc: '累计获得1000金币', reward: 200, xp: 100, diamond: 1, condition: 'totalGoldEarned >= 1000', rarity: 'common', category: 'economy' },
    { id: 'gold_10000', name: '富甲一方', icon: '💎', desc: '累计获得10000金币', reward: 500, xp: 300, diamond: 3, condition: 'totalGoldEarned >= 10000', rarity: 'rare', category: 'economy' },
    { id: 'gold_50000', name: '农业大亨', icon: '🏦', desc: '累计获得50000金币', reward: 1500, xp: 800, diamond: 8, condition: 'totalGoldEarned >= 50000', rarity: 'epic', category: 'economy' },
    { id: 'gold_100000', name: '百万富翁', icon: '💵', desc: '累计获得100000金币', reward: 3000, xp: 1500, diamond: 15, condition: 'totalGoldEarned >= 100000', rarity: 'legendary', category: 'economy' },

    // === 签到成就 ===
    { id: 'streak_3', name: '初来乍到', icon: '📅', desc: '连续签到3天', reward: 100, xp: 50, diamond: 1, condition: 'maxStreak >= 3', rarity: 'common', category: 'social' },
    { id: 'streak_7', name: '坚持一周', icon: '🔥', desc: '连续签到7天', reward: 300, xp: 150, diamond: 3, condition: 'maxStreak >= 7', rarity: 'uncommon', category: 'social' },
    { id: 'streak_30', name: '月度达人', icon: '🌙', desc: '连续签到30天', reward: 1000, xp: 500, diamond: 8, condition: 'maxStreak >= 30', rarity: 'epic', category: 'social' },
    { id: 'streak_100', name: '百日冲刺', icon: '💯', desc: '连续签到100天', reward: 3000, xp: 1500, diamond: 15, condition: 'maxStreak >= 100', rarity: 'legendary', category: 'social' },

    // === 钓鱼成就 ===
    { id: 'first_fish', name: '初试垂钓', icon: '🐟', desc: '成功钓到第一条鱼', reward: 100, xp: 50, diamond: 1, condition: 'totalFishCaught >= 1', rarity: 'common', category: 'fish' },
    { id: 'fish_20', name: '钓鱼爱好者', icon: '🎣', desc: '累计钓到20条鱼', reward: 500, xp: 200, diamond: 3, condition: 'totalFishCaught >= 20', rarity: 'uncommon', category: 'fish' },
    { id: 'fish_100', name: '垂钓大师', icon: '🐠', desc: '累计钓到100条鱼', reward: 1500, xp: 800, diamond: 8, condition: 'totalFishCaught >= 100', rarity: 'epic', category: 'fish' },

    // === 收集成就 ===
    { id: 'gacha_5', name: '扭蛋新手', icon: '🎰', desc: '完成5次扭蛋', reward: 200, xp: 100, diamond: 2, condition: 'totalGacha >= 5', rarity: 'common', category: 'collect' },
    { id: 'gacha_30', name: '扭蛋达人', icon: '🎲', desc: '完成30次扭蛋', reward: 800, xp: 400, diamond: 5, condition: 'totalGacha >= 30', rarity: 'rare', category: 'collect' },
    { id: 'pokedex_50', name: '图鉴半满', icon: '📖', desc: '图鉴完成度达50%', reward: 1000, xp: 500, diamond: 5, condition: 'pokedexPercent >= 50', rarity: 'rare', category: 'collect' }
];

// 每日任务数据（任务池 - 每天从中随机选4个）
const DAILY_QUESTS_POOL = [
    { id: 'harvest_3', name: '今日收获', desc: '收获3次作物', target: 3, reward: 50, xp: 30, diamond: 0, type: 'harvest' },
    { id: 'water_5', name: '辛勤浇水', desc: '浇水5次', target: 5, reward: 20, xp: 15, diamond: 0, type: 'water' },
    { id: 'feed_2', name: '喂食动物', desc: '喂食动物2次', target: 2, reward: 30, xp: 20, diamond: 0, type: 'feed' },
    { id: 'fish_1', name: '钓到一条鱼', desc: '成功钓到1条鱼', target: 1, reward: 40, xp: 25, diamond: 0, type: 'fish' },
    { id: 'plant_3', name: '播种希望', desc: '播种3次', target: 3, reward: 20, xp: 15, diamond: 0, type: 'plant' },
    { id: 'gacha_1', name: '扭蛋一次', desc: '完成1次扭蛋', target: 1, reward: 0, xp: 10, diamond: 2, type: 'gacha' },
    { id: 'online_10', name: '在线10分钟', desc: '在线游戏10分钟', target: 10, reward: 30, xp: 20, diamond: 0, type: 'online_min' },
    { id: 'rare_harvest_1', name: '稀有收获', desc: '收获1个稀有作物', target: 1, reward: 0, xp: 30, diamond: 3, type: 'rare' }
];

// 每日全勤奖
const DAILY_ALLCLEAR_REWARD = { gold: 0, diamond: 8, xp: 50 };

// 兼容旧版：保留原 DAILY_QUESTS 引用
const DAILY_QUESTS = [
    { id: 'harvest_5', name: '今日收获', desc: '收获5次作物', target: 5, reward: 200, xp: 50, type: 'harvest' },
    { id: 'water_10', name: '辛勤浇水', desc: '浇水10次', target: 10, reward: 100, xp: 30, type: 'water' },
    { id: 'feed_animals', name: '喂食动物', desc: '喂食动物3次', target: 3, reward: 150, xp: 40, type: 'feed' },
    { id: 'earn_gold', name: '今日收益', desc: '今日获得500金币', target: 500, reward: 100, xp: 50, type: 'gold' },
    { id: 'plant_3', name: '播种希望', desc: '播种3次', target: 3, reward: 80, xp: 25, type: 'plant' }
];

// 每周任务数据
const WEEKLY_QUESTS = [
    { id: 'harvest_50', name: '丰收周', desc: '本周收获50次', target: 50, reward: 1000, xp: 300, type: 'harvest' },
    { id: 'earn_5000', name: '周度收益', desc: '本周获得5000金币', target: 5000, reward: 500, xp: 200, type: 'gold' },
    { id: 'rare_harvest', name: '珍稀收获', desc: '收获3次珍稀作物', target: 3, reward: 800, xp: 400, type: 'rare' },
    { id: 'animals_product', name: '牧场产出', desc: '收集20次动物产出', target: 20, reward: 600, xp: 250, type: 'collect' }
];

// 主线任务
const MAIN_QUESTS = [
    { id: 'main_1', name: '农场初体验', desc: '收获第一棵作物', target: 1, reward: 500, xp: 100, type: 'harvest', unlockLevel: 1 },
    { id: 'main_2', name: '动物伙伴', desc: '购买第一只动物', target: 1, reward: 800, xp: 200, type: 'buy_animal', unlockLevel: 3 },
    { id: 'main_3', name: '扩大规模', desc: '同时种植5块土地', target: 5, reward: 1000, xp: 300, type: 'active_plots', unlockLevel: 5 },
    { id: 'main_4', name: '珍稀收藏', desc: '收获一种珍稀作物', target: 1, reward: 2000, xp: 500, type: 'rare', unlockLevel: 15 },
    { id: 'main_5', name: '农业大亨', desc: '累计获得50000金币', target: 50000, reward: 5000, xp: 2000, type: 'gold', unlockLevel: 20 }
];

// 天气数据（8种）
const WEATHER_DATA = {
    sunny:        { name: '晴天',   icon: '☀️',  effect: '作物生长+20%', growBonus: 1.2, autoWater: false },
    sunny_cloudy: { name: '晴间多云', icon: '⛅', effect: '正常生长',     growBonus: 1.0, autoWater: false },
    cloudy:       { name: '多云',   icon: '☁️',  effect: '正常生长',     growBonus: 1.0, autoWater: false },
    overcast:     { name: '阴天',   icon: '🌫️', effect: '生长-10%',     growBonus: 0.9, autoWater: false },
    rainy:        { name: '小雨',   icon: '🌧️', effect: '自动浇水',     growBonus: 1.0, autoWater: true },
    heavy_rain:   { name: '大雨',   icon: '⛈️', effect: '自动浇水+涝灾风险', growBonus: 0.9, autoWater: true, damage: true },
    thunderstorm: { name: '雷暴',   icon: '⚡',  effect: '作物可能受损', growBonus: 0.8, autoWater: true, damage: true },
    snow:         { name: '小雪',   icon: '🌨️', effect: '作物生长-30%', growBonus: 0.7, autoWater: false },
    blizzard:     { name: '大雪',   icon: '❄️',  effect: '户外活动暂停', growBonus: 0.5, autoWater: false },
    storm:        { name: '暴风雨', icon: '⛈️', effect: '作物可能受损', growBonus: 0.8, autoWater: true, damage: true }
};


// 季节数据
const SEASONS_DATA = {
    spring: { name: '春季', icon: '🌸', color: 0xffccee, bonusCrops: ['radish', 'lettuce', 'strawberry'] },
    summer: { name: '夏季', icon: '☀️', color: 0xffeeaa, bonusCrops: ['tomato', 'corn', 'sunflower'] },
    autumn: { name: '秋季', icon: '🍂', color: 0xffaa44, bonusCrops: ['pumpkin', 'wheat', 'blueberry'] },
    winter: { name: '冬季', icon: '❄️', color: 0xaaccff, bonusCrops: ['goldApple', 'rainbowRose'] }
};

// 等级称号
const LEVEL_TITLES = [
    { level: 1, title: '新手农夫' },
    { level: 5, title: '初级农夫' },
    { level: 10, title: '熟练农夫' },
    { level: 15, title: '高级农夫' },
    { level: 20, title: '农场主' },
    { level: 25, title: '庄园主' },
    { level: 30, title: '农业专家' },
    { level: 35, title: '农业大亨' },
    { level: 40, title: '传奇农神' }
];

// 签到奖励
const CHECKIN_REWARDS = [
    { day: 1, icon: '💰', amount: 100, type: 'gold', desc: '100金币' },
    { day: 2, icon: '💰', amount: 200, type: 'gold', desc: '200金币 + 5能量' },
    { day: 3, icon: '🌱', amount: 1, type: 'seed_pack', desc: '普通种子包' },
    { day: 4, icon: '💰', amount: 500, type: 'gold', desc: '500金币' },
    { day: 5, icon: '🌟', amount: 1, type: 'rare_seed', desc: '稀有种子包' },
    { day: 6, icon: '💎', amount: 10, type: 'diamond', desc: '10钻石' },
    { day: 7, icon: '🎁', amount: 1, type: 'legend_pack', desc: '传说礼包' }
];

// ===== 钻石商店商品数据 =====
const DIAMOND_SHOP_DATA = [
    {
        id: 'premium_fertilizer',
        name: '高级肥料',
        icon: '🧪',
        price: 3,
        type: 'buff',
        buffType: 'growSpeed',
        buffValue: 2,        // 生长速度 x2
        duration: 30 * 60,   // 30 分钟（秒）
        description: '作物生长速度×2，持续30分钟',
        category: 'consumable'
    },
    {
        id: 'lucky_potion',
        name: '幸运药水',
        icon: '🍀',
        price: 5,
        type: 'buff',
        buffType: 'luckyHarvest',
        buffValue: 1.5,      // 稀有度提升概率 +50%
        duration: 30 * 60,
        description: '收获稀有品质概率+50%，持续30分钟',
        category: 'consumable'
    },
    {
        id: 'animal_feed_pack',
        name: '动物饲料包',
        icon: '🥫',
        price: 6,
        type: 'instant',
        description: '所有动物立即产出',
        category: 'consumable'
    },
    {
        id: 'master_bait',
        name: '钓鱼大师饵',
        icon: '🪱',
        price: 8,
        type: 'buff',
        buffType: 'fishLuck',
        buffValue: 1.5,      // 稀有鱼概率 +50%
        charges: 5,           // 5 次钓鱼
        description: '稀有鱼概率+50%，持续5次钓鱼',
        category: 'consumable'
    },
    {
        id: 'auto_watering',
        name: '自动浇水器',
        icon: '💦',
        price: 10,
        type: 'buff',
        buffType: 'autoWater',
        buffValue: 1,
        duration: 2 * 60 * 60, // 2 小时
        description: '自动浇水2小时',
        category: 'consumable'
    },
    {
        id: 'rare_seed_box',
        name: '稀有种子盲盒',
        icon: '🎁',
        price: 15,
        type: 'instant',
        description: '随机获得紫色/金色品质种子',
        category: 'consumable'
    },
    {
        id: 'land_expansion',
        name: '土地扩展券',
        icon: '📜',
        price: 30,
        type: 'permanent',
        description: '永久解锁1块新土地',
        category: 'permanent'
    }
];

// 模拟排行榜数据
const MOCK_RANK_DATA = [
    { name: '农场大王', avatar: '👑', score: 98500, level: 45, badge: '🏆' },
    { name: '丰收女神', avatar: '🌸', score: 87200, level: 42, badge: '🥈' },
    { name: '绿野仙踪', avatar: '🌿', score: 76800, level: 38, badge: '🥉' },
    { name: '田园诗人', avatar: '🎭', score: 65400, level: 35, badge: '⭐' },
    { name: '快乐农夫', avatar: '😊', score: 54300, level: 32, badge: '⭐' },
    { name: '阳光牧场', avatar: '☀️', score: 43200, level: 28, badge: '⭐' },
    { name: '花园精灵', avatar: '🧚', score: 32100, level: 25, badge: '' },
    { name: '勤劳小蜜蜂', avatar: '🐝', score: 21000, level: 20, badge: '' },
    { name: '你', avatar: '🧑‍🌾', score: 0, level: 1, badge: '', isPlayer: true }
];
