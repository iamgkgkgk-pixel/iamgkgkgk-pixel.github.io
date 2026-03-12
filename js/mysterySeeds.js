// ===== 神秘种子盲盒系统 =====

// 植物稀有度分类
const PLANT_RARITY = {
    common: ['radish', 'lettuce', 'wheat', 'corn', 'pumpkin', 'sunflower'],
    rare: ['tomato', 'strawberry', 'blueberry'],
    legendary: ['goldApple', 'rainbowRose']
};

// 种子袋配置
const SEED_BAG_CONFIG = {
    normal: {
        id: 'normal',
        name: '普通种子袋',
        icon: '🎒',
        color: '#8B6914',
        bgColor: 'rgba(139,105,20,0.2)',
        borderColor: '#8B6914',
        desc: '棕色麻袋，蕴含普通种子',
        prob: { common: 0.60, rare: 0.35, legendary: 0.05 },
        effect: null
    },
    rare: {
        id: 'rare',
        name: '稀有种子袋',
        icon: '💙',
        color: '#2196F3',
        bgColor: 'rgba(33,150,243,0.2)',
        borderColor: '#2196F3',
        desc: '蓝色丝袋，微光粒子环绕',
        prob: { common: 0.30, rare: 0.55, legendary: 0.15 },
        effect: 'sparkle'
    },
    legendary: {
        id: 'legendary',
        name: '传说种子袋',
        icon: '✨',
        color: '#FFD700',
        bgColor: 'rgba(255,215,0,0.2)',
        borderColor: '#FFD700',
        desc: '金色锦袋，持续金光闪耀',
        prob: { common: 0.10, rare: 0.40, legendary: 0.50 },
        effect: 'golden'
    }
};

// 变异概率
const MUTATION_PROB = {
    color: 0.05,   // 颜色变异
    size: 0.03,    // 形态变异
    shiny: 0.01    // 闪光变异
};

// 变异描述
const MUTATION_DESC = {
    color: { suffix: '（变色）', emoji: '🎨', label: '颜色变异' },
    size_big: { suffix: '（巨型）', emoji: '🔮', label: '形态变异·巨型' },
    size_small: { suffix: '（迷你）', emoji: '🔮', label: '形态变异·迷你' },
    shiny: { suffix: '（闪光）', emoji: '⭐', label: '闪光变异' }
};

// 神秘种子系统
const MysterySeeds = {
    // 从种子袋中抽取植物
    drawFromBag(bagType) {
        const config = SEED_BAG_CONFIG[bagType];
        if (!config) return null;

        // 确定稀有度
        const rand = Math.random();
        let rarity;
        if (rand < config.prob.legendary) {
            rarity = 'legendary';
        } else if (rand < config.prob.legendary + config.prob.rare) {
            rarity = 'rare';
        } else {
            rarity = 'common';
        }

        // 从对应稀有度中随机选植物
        const pool = PLANT_RARITY[rarity];
        const cropId = pool[Math.floor(Math.random() * pool.length)];

        // 检查变异
        let mutation = null;
        const mutRand = Math.random();
        if (mutRand < MUTATION_PROB.shiny) {
            mutation = 'shiny';
        } else if (mutRand < MUTATION_PROB.shiny + MUTATION_PROB.size) {
            mutation = Math.random() < 0.5 ? 'size_big' : 'size_small';
        } else if (mutRand < MUTATION_PROB.shiny + MUTATION_PROB.size + MUTATION_PROB.color) {
            mutation = 'color';
        }

        return { cropId, rarity, mutation, bagType };
    },

    // 种植神秘种子到地块
    plantMystery(plotId, bagType) {
        const plot = GameState.plots[plotId];
        if (plot.state !== 'empty') {
            showNotification('这块土地已经种植了！', '⚠️', 'warning');
            return false;
        }

        // 消耗种子袋
        const bagKey = `mystery_${bagType}`;
        if (!GameState.inventory.seeds[bagKey] || GameState.inventory.seeds[bagKey] <= 0) {
            showNotification('种子袋不足！', '🎒', 'warning');
            return false;
        }

        if (!GameState.spendEnergy(2)) return false;

        GameState.inventory.seeds[bagKey]--;

        // 抽取结果（但先隐藏）
        const result = this.drawFromBag(bagType);

        // 新手保底：前3次种植必得稀有或以上
        const totalPlanted = GameState.player.totalMysteryPlanted || 0;
        if (totalPlanted < 3 && result.rarity === 'common') {
            result.rarity = 'rare';
            const pool = PLANT_RARITY['rare'];
            result.cropId = pool[Math.floor(Math.random() * pool.length)];
        }

        // 更新土地状态（神秘种子特殊标记）
        plot.state = 'planted';
        plot.crop = result.cropId;
        plot.plantTime = Date.now();
        plot.growProgress = 0;
        plot.watered = false;
        plot.fertilized = false;
        plot.isMystery = true;
        plot.mysteryRarity = result.rarity;
        plot.mysteryMutation = result.mutation;
        plot.mysteryRevealed = false;

        // 随机品质
        const rand = Math.random();
        if (rand < 0.1) plot.cropQuality = 'perfect';
        else if (rand < 0.3) plot.cropQuality = 'good';
        else plot.cropQuality = 'normal';

        GameState.player.totalMysteryPlanted = totalPlanted + 1;

        Scene3D.updatePlot(plot);
        GameState.updateQuestProgress('plant');
        GameState.player.uniqueCrops.add(result.cropId);

        const crop = CROPS_DATA[result.cropId];
        const growHours = Math.round(crop.growTime / 60);
        showNotification(`🎒 神秘种子已种下！约${growHours}分钟后揭晓！`, '🌱');

        GameState.save();
        return true;
    },

    // 获取地块当前显示的外观（悬念阶段）
    getMysteryAppearance(plot) {
        if (!plot.isMystery || plot.mysteryRevealed) return null;

        const stage = Math.floor(plot.growProgress * 5); // 0-4
        // 阶段0-1: 完全隐藏，阶段2: 轮廓，阶段3: 部分显示，阶段4: 揭晓
        return {
            stage,
            hidden: stage < 2,
            showOutline: stage === 2,
            showPartial: stage === 3,
            revealed: stage >= 4
        };
    },

    // 揭晓神秘种子（成熟时调用）
    revealMystery(plotId) {
        const plot = GameState.plots[plotId];
        if (!plot.isMystery || plot.mysteryRevealed) return;

        plot.mysteryRevealed = true;
        const crop = CROPS_DATA[plot.crop];
        const rarity = plot.mysteryRarity;
        const mutation = plot.mysteryMutation;

        // 播放揭晓动画
        this.playRevealAnimation(rarity, crop, mutation, plotId);

        // 录入图鉴
        const entryKey = mutation ? `${plot.crop}_${mutation}` : plot.crop;
        Pokedex.unlock('plant', entryKey, {
            cropId: plot.crop,
            rarity,
            mutation,
            firstTime: Date.now()
        });
    },

    // 揭晓动画
    playRevealAnimation(rarity, crop, mutation, plotId) {
        const overlay = document.getElementById('mystery-reveal-overlay');
        const content = document.getElementById('mystery-reveal-content');

        let animClass = 'reveal-common';
        let title = '植物揭晓！';
        let bgEffect = '';

        if (rarity === 'legendary') {
            animClass = 'reveal-legendary';
            title = '✨ 传说植物！✨';
            bgEffect = 'golden-bg';
        } else if (rarity === 'rare') {
            animClass = 'reveal-rare';
            title = '🌟 稀有植物！';
            bgEffect = 'rare-bg';
        }

        const mutInfo = mutation ? MUTATION_DESC[mutation] : null;
        const mutLabel = mutInfo ? `<div class="reveal-mutation">${mutInfo.emoji} ${mutInfo.label}</div>` : '';
        const rarityLabel = { common: '普通', rare: '稀有', legendary: '传说' }[rarity];

        content.innerHTML = `
            <div class="reveal-title">${title}</div>
            <div class="reveal-icon ${animClass}">${crop.icon}</div>
            <div class="reveal-name">${crop.name}${mutInfo ? mutInfo.suffix : ''}</div>
            <div class="reveal-rarity rarity-${rarity}">${rarityLabel}</div>
            ${mutLabel}
            <div class="reveal-desc">${crop.description}</div>
            <button class="btn-primary" onclick="MysterySeeds.closeReveal()" style="margin-top:15px">太棒了！</button>
        `;

        overlay.className = `mystery-reveal-overlay show ${bgEffect}`;
        overlay.style.display = 'flex';

        // 传说植物：相机环绕效果
        if (rarity === 'legendary') {
            setTimeout(() => {
                if (typeof Scene3D !== 'undefined' && Scene3D.doCameraOrbit) {
                    Scene3D.doCameraOrbit(plotId, 3000);
                }
            }, 500);
        }

        // 自动关闭（可跳过）
        const duration = rarity === 'legendary' ? 3000 : rarity === 'rare' ? 2000 : 1000;
        this._revealTimer = setTimeout(() => this.closeReveal(), duration + 2000);
    },

    closeReveal() {
        clearTimeout(this._revealTimer);
        const overlay = document.getElementById('mystery-reveal-overlay');
        overlay.style.display = 'none';
    },

    // 开启种子袋UI
    // plotId: 可选，从种植弹窗传入时直接种植；不传时进入"选择地块"模式
    openBagUI(bagType, plotId) {
        const config = SEED_BAG_CONFIG[bagType];
        const count = GameState.inventory.seeds[`mystery_${bagType}`] || 0;

        if (count <= 0) {
            showNotification(`没有${config.name}！`, '🎒', 'warning');
            return;
        }

        // 显示确认弹窗
        const modal = document.getElementById('seed-bag-modal');
        document.getElementById('seed-bag-title').textContent = `${config.icon} ${config.name}`;
        document.getElementById('seed-bag-desc').textContent = config.desc;
        document.getElementById('seed-bag-count').textContent = `剩余: ${count} 个`;
        document.getElementById('seed-bag-prob').innerHTML = `
            <div style="color:#aaa;font-size:12px;margin-bottom:6px">概率预览：</div>
            <div style="color:#ddd;margin:2px 0">🌿 普通 ${Math.round(config.prob.common * 100)}%</div>
            <div style="color:#4CAF50;margin:2px 0">🌟 稀有 ${Math.round(config.prob.rare * 100)}%</div>
            <div style="color:#FFD700;margin:2px 0">✨ 传说 ${Math.round(config.prob.legendary * 100)}%</div>
        `;

        const useBtn = document.getElementById('seed-bag-use-btn');
        if (plotId !== undefined) {
            // 从种植弹窗进入：直接种植到指定地块
            useBtn.textContent = '🌱 确认种植';
            useBtn.onclick = () => {
                hideModal('seed-bag-modal');
                MysterySeeds.plantMystery(plotId, bagType);
            };
        } else {
            // 从背包进入：进入选择地块模式
            useBtn.textContent = '🌱 选择地块种植';
            useBtn.onclick = () => {
                hideModal('seed-bag-modal');
                showNotification('请点击一块空地来种植神秘种子！', '🌱');
                GameState.pendingMysteryBag = bagType;
            };
        }

        modal.style.borderColor = config.borderColor;
        showModal('seed-bag-modal');
    },


    // 添加种子袋到背包
    addBag(bagType, count = 1) {
        const key = `mystery_${bagType}`;
        if (!GameState.inventory.seeds[key]) GameState.inventory.seeds[key] = 0;
        GameState.inventory.seeds[key] += count;
        const config = SEED_BAG_CONFIG[bagType];
        showNotification(`${config.icon} 获得 ${config.name} ×${count}！`, 'gold');
        updateHUD();
        GameState.save();
    }
};
