// ===== 农场核心逻辑 =====

// 当前选中的土地ID
let currentPlotId = -1;
let currentAnimalId = -1;

// 选择工具
function selectTool(tool) {
    GameState.currentTool = tool;
    document.querySelectorAll('.tool-btn').forEach(btn => btn.classList.remove('active'));
    const btn = document.getElementById(`tool-${tool}`);
    if (btn) btn.classList.add('active');
    hideAllMenus();
}

// 土地点击处理
function onPlotClick(plotId, mouseX, mouseY) {
    currentPlotId = plotId;
    const plot = GameState.plots[plotId];
    const tool = GameState.currentTool;
    
    // 根据当前工具直接操作
    if (tool === 'seed' && plot.state === 'empty') {
        showPlantModal(plotId);
        return;
    }
    if (tool === 'water' && (plot.state === 'planted' || plot.state === 'fertilized')) {
        doWater(plotId);
        return;
    }
    if (tool === 'fertilize' && (plot.state === 'planted' || plot.state === 'watered')) {
        doFertilize(plotId);
        return;
    }
    if (tool === 'harvest' && plot.state === 'ready') {
        doHarvest(plotId);
        return;
    }
    
    // 显示操作菜单
    showLandMenu(plotId, mouseX, mouseY);
}

// 动物点击处理
function onAnimalClick(animalId, mouseX, mouseY) {
    currentAnimalId = animalId;
    const tool = GameState.currentTool;
    
    if (tool === 'feed') {
        doFeedAnimal(animalId);
        return;
    }
    
    showAnimalMenu(animalId, mouseX, mouseY);
}

// 显示土地菜单
function showLandMenu(plotId, x, y) {
    const plot = GameState.plots[plotId];
    const menu = document.getElementById('land-menu');
    
    // 更新菜单项可见性
    document.getElementById('action-plant').style.display = plot.state === 'empty' ? 'flex' : 'none';
    document.getElementById('action-water').style.display = (plot.state === 'planted' || plot.state === 'fertilized') ? 'flex' : 'none';
    document.getElementById('action-fertilize').style.display = (plot.state === 'planted' || plot.state === 'watered') ? 'flex' : 'none';
    document.getElementById('action-harvest').style.display = plot.state === 'ready' ? 'flex' : 'none';
    // 加速卡：作物在生长中（不是空地也不是已成熟）时显示
    const speedupBtn = document.getElementById('action-speedup');
    if (speedupBtn) {
        const canSpeedup = plot.state !== 'empty' && plot.state !== 'ready';
        const speedCount = (GameState.inventory.tools && GameState.inventory.tools['speedUp']) || 0;
        speedupBtn.style.display = canSpeedup ? 'flex' : 'none';
        speedupBtn.querySelector('.action-icon').nextSibling.textContent = ` 使用加速卡 (${speedCount})`;
    }
    document.getElementById('action-upgrade').style.display = plot.quality !== 'magic' ? 'flex' : 'none';
    
    // 定位菜单
    menu.style.left = Math.min(x, window.innerWidth - 180) + 'px';
    menu.style.top = Math.min(y, window.innerHeight - 200) + 'px';
    menu.style.display = 'block';
    
    // 显示作物信息
    if (plot.state !== 'empty') {
        showCropInfo(plotId, x, y);
    }
}

// 显示动物菜单
function showAnimalMenu(animalId, x, y) {
    const menu = document.getElementById('animal-menu');
    menu.style.left = Math.min(x, window.innerWidth - 180) + 'px';
    menu.style.top = Math.min(y, window.innerHeight - 200) + 'px';
    menu.style.display = 'block';

    // 羊才显示剪羊毛按鈕
    const shearBtn = document.getElementById('action-shear');
    if (shearBtn) {
        const animal = GameState.animals.find(a => a.id === animalId);
        shearBtn.style.display = (animal && animal.type === 'sheep') ? 'flex' : 'none';
    }
}


// 显示作物信息
function showCropInfo(plotId, x, y) {
    const plot = GameState.plots[plotId];
    if (!plot.crop) return;
    
    const crop = CROPS_DATA[plot.crop];
    const info = document.getElementById('crop-info');
    
    document.getElementById('crop-info-name').textContent = `${crop.icon} ${crop.name}`;
    
    const stages = ['种子', '幼苗', '生长中', '即将成熟', '已成熟'];
    const stageIdx = Math.floor(plot.growProgress * 4);
    document.getElementById('crop-info-stage').textContent = `生长阶段：${stages[Math.min(stageIdx, 4)]}`;
    document.getElementById('crop-info-progress').style.width = (plot.growProgress * 100) + '%';
    
    const remaining = Math.max(0, crop.growTime * (1 - plot.growProgress));
    document.getElementById('crop-info-time').textContent = plot.state === 'ready' ? '✅ 可以收获！' : `还需 ${formatTime(remaining)}`;
    
    info.style.left = Math.min(x + 10, window.innerWidth - 220) + 'px';
    info.style.top = Math.max(10, y - 120) + 'px';
    info.style.display = 'block';
    
    setTimeout(() => { info.style.display = 'none'; }, 3000);
}

// 隐藏所有菜单
function hideAllMenus() {
    document.getElementById('land-menu').style.display = 'none';
    document.getElementById('animal-menu').style.display = 'none';
    document.getElementById('crop-info').style.display = 'none';
}

// 土地操作
function doLandAction(action) {
    hideAllMenus();
    switch(action) {
        case 'plant': showPlantModal(currentPlotId); break;
        case 'water': doWater(currentPlotId); break;
        case 'fertilize': doFertilize(currentPlotId); break;
        case 'harvest': doHarvest(currentPlotId); break;
        case 'speedup': useSpeedUp(currentPlotId); break;
        case 'upgrade': doUpgradeLand(currentPlotId); break;
    }
}

// 动物操作
function doAnimalAction(action) {
    hideAllMenus();
    switch(action) {
        case 'feed':    doFeedAnimal(currentAnimalId); break;
        case 'pet':     doPetAnimal(currentAnimalId); break;
        case 'collect': doCollectAnimal(currentAnimalId); break;
        case 'shear':   doShearSheep(currentAnimalId); break;
        case 'rename':  doRenameAnimal(currentAnimalId); break;
    }
}

// 抚摸动物
function doPetAnimal(animalId) {
    const animal = GameState.animals.find(a => a.id === animalId);
    if (!animal) return;
    const mesh = Scene3D.animalMeshes.find(m => m.userData.animalId === animalId);
    if (typeof AnimalBehavior !== 'undefined') {
        AnimalBehavior.petAnimal(mesh, animal);
    } else {
        showNotification('💕 抚摸了动物！', 'gold');
    }

    // 培育系统：提升亲密度
    if (typeof BreedingSystem !== 'undefined') BreedingSystem.addIntimacy(animalId, 3);
    // 季节活动
    if (typeof SeasonalEvents !== 'undefined') SeasonalEvents.updateProgress('pet');

    GameState.save();
}

// 剪羊毛
function doShearSheep(animalId) {
    const animal = GameState.animals.find(a => a.id === animalId);
    if (!animal || animal.type !== 'sheep') return;
    const mesh = Scene3D.animalMeshes.find(m => m.userData.animalId === animalId);
    if (typeof AnimalBehavior !== 'undefined') {
        const success = AnimalBehavior.shearSheep(mesh, animal);
        if (success) {
            // 羊毛加入背包
            GameState.inventory.harvest['wool'] = (GameState.inventory.harvest['wool'] || 0) + 1;
            showNotification('✂️ 剪到了羊毛！🧶', 'gold');
            GameState.addXP(10);
            GameState.updateQuestProgress('collect');
            GameState.save();
        }
    }
}


// 显示种植弹窗
function showPlantModal(plotId) {
    currentPlotId = plotId;
    
    // 如果有待种植的神秘种子袋，直接种植
    if (GameState.pendingMysteryBag) {
        const bagType = GameState.pendingMysteryBag;
        GameState.pendingMysteryBag = null;
        MysterySeeds.plantMystery(plotId, bagType);
        return;
    }
    
    const content = document.getElementById('plant-content');
    content.innerHTML = '';

    
    // 神秘种子袋区域
    const mysterySection = document.createElement('div');
    mysterySection.style.cssText = 'margin-bottom:15px;padding:10px;background:rgba(255,215,0,0.05);border-radius:8px;border:1px solid rgba(255,215,0,0.2)';
    mysterySection.innerHTML = '<div style="color:#FFD700;font-size:13px;margin-bottom:8px">🎒 神秘种子袋</div>';
    
    const bagTypes = ['normal', 'rare', 'legendary'];
    let hasBag = false;
    bagTypes.forEach(bagType => {
        const count = GameState.inventory.seeds[`mystery_${bagType}`] || 0;
        if (count > 0) {
            hasBag = true;
            const config = SEED_BAG_CONFIG[bagType];
            const bagItem = document.createElement('div');
            bagItem.className = 'shop-item';
            bagItem.style.cssText = `border-color:${config.borderColor};background:${config.bgColor};display:inline-block;width:calc(33% - 5px);margin:2px`;
            bagItem.innerHTML = `
                <div class="item-icon">${config.icon}</div>
                <div class="item-name" style="color:${config.color}">${config.name}</div>
                <div class="item-price">库存: ${count}</div>
            `;
            bagItem.onclick = () => {
                hideModal('plant-modal');
                MysterySeeds.openBagUI(bagType, plotId);
            };

            mysterySection.appendChild(bagItem);
        }
    });
    
    if (hasBag) content.appendChild(mysterySection);
    
    // 普通种子区域
    const normalTitle = document.createElement('div');
    normalTitle.style.cssText = 'color:#aaa;font-size:13px;margin-bottom:8px';
    normalTitle.textContent = '🌱 普通种子';
    content.appendChild(normalTitle);
    
    const normalGrid = document.createElement('div');
    normalGrid.className = 'shop-grid';
    content.appendChild(normalGrid);

    Object.values(CROPS_DATA).forEach(crop => {
        const count = GameState.inventory.seeds[crop.id] || 0;
        const locked = GameState.player.level < crop.unlockLevel;
        
        const item = document.createElement('div');
        item.className = 'shop-item';
        item.innerHTML = `
            <div class="item-icon">${crop.icon}</div>
            <div class="item-name">${crop.name}</div>
            <div class="item-time">⏱ ${formatTime(crop.growTime)}</div>
            ${locked ? `<div class="item-locked">🔒 需要${crop.unlockLevel}级</div>` : `<div class="item-price">库存: ${count}</div>`}
        `;
        
        if (!locked && count > 0) {
            item.onclick = () => { doPlant(plotId, crop.id); hideModal('plant-modal'); };
        } else if (!locked && count === 0) {
            item.style.opacity = '0.5';
            item.title = '种子不足，请去商店购买';
        } else {
            item.style.opacity = '0.4';
        }
        
        normalGrid.appendChild(item);
    });

    
    showModal('plant-modal');
}

// 种植
function doPlant(plotId, cropId) {
    const plot = GameState.plots[plotId];
    if (plot.state !== 'empty') {
        showNotification('这块土地已经种植了！', '⚠️', 'warning');
        return;
    }
    
    const count = GameState.inventory.seeds[cropId] || 0;
    if (count <= 0) {
        showNotification('种子不足！', '🌱', 'warning');
        return;
    }
    
    if (!GameState.spendEnergy(2)) return;
    
    // 消耗种子
    GameState.inventory.seeds[cropId]--;
    
    // 更新土地状态
    plot.state = 'planted';
    plot.crop = cropId;
    plot.plantTime = Date.now();
    plot.growProgress = 0;
    plot.watered = false;
    plot.fertilized = false;
    
    // 随机品质
    const rand = Math.random();
    if (rand < 0.1) plot.cropQuality = 'perfect';
    else if (rand < 0.3) plot.cropQuality = 'good';
    else plot.cropQuality = 'normal';
    
    // 更新3D场景
    Scene3D.updatePlot(plot);
    
    // 更新任务
    GameState.updateQuestProgress('plant');
    GameState.player.uniqueCrops.add(cropId);
    
    const crop = CROPS_DATA[cropId];
    showNotification(`${crop.icon} 种下了 ${crop.name}！`, '🌱');
    
    // 教程通知
    if (typeof TutorialSystem !== 'undefined') TutorialSystem.notifyAction('plant');
    // 季节活动
    if (typeof SeasonalEvents !== 'undefined') SeasonalEvents.updateProgress('plant');
    // 庆典追踪
    if (typeof CelebrationSystem !== 'undefined') CelebrationSystem.trackWeekly('harvest', 0);

    GameState.save();
}

// 浇水
function doWater(plotId) {
    const plot = GameState.plots[plotId];
    if (plot.state === 'empty' || plot.state === 'ready') {
        showNotification('无法浇水！', '💧', 'warning');
        return;
    }
    if (plot.watered) {
        showNotification('已经浇过水了！', '💧', 'warning');
        return;
    }
    
    if (!GameState.spendEnergy(1)) return;
    
    plot.watered = true;
    if (plot.state === 'planted') plot.state = 'watered';
    
    Scene3D.createWaterEffect(plotId);
    Scene3D.updatePlot(plot);
    
    GameState.updateQuestProgress('water');
    showNotification('💧 浇水完成！作物生长加速！', '💧');

    // 教程通知
    if (typeof TutorialSystem !== 'undefined') TutorialSystem.notifyAction('water');
    // 季节活动
    if (typeof SeasonalEvents !== 'undefined') SeasonalEvents.updateProgress('water');

    GameState.save();
}

// 施肥
function doFertilize(plotId) {
    const plot = GameState.plots[plotId];
    if (plot.state === 'empty' || plot.state === 'ready') {
        showNotification('无法施肥！', '🌿', 'warning');
        return;
    }
    if (plot.fertilized) {
        showNotification('已经施过肥了！', '🌿', 'warning');
        return;
    }
    
    const fertCount = GameState.inventory.tools['fertilizer'] || 0;
    if (fertCount <= 0) {
        showNotification('肥料不足！请去商店购买', '🌿', 'warning');
        return;
    }
    
    if (!GameState.spendEnergy(1)) return;
    
    GameState.inventory.tools['fertilizer']--;
    plot.fertilized = true;
    if (plot.state === 'watered') plot.state = 'fertilized';
    
    Scene3D.updatePlot(plot);
    showNotification('🌿 施肥完成！作物品质提升！', '🌿');
    GameState.save();
}

// 收获
function doHarvest(plotId) {
    const plot = GameState.plots[plotId];
    if (plot.state !== 'ready') {
        showNotification('作物还没成熟！', '🌾', 'warning');
        return;
    }
    
    if (!GameState.spendEnergy(1)) return;
    
    const crop = CROPS_DATA[plot.crop];
    
    // 计算产量
    let quantity = 1;
    if (plot.quality === 'fertile') quantity = 2;
    if (plot.quality === 'magic') quantity = 3;
    if (plot.fertilized) quantity = Math.ceil(quantity * 1.5);
    
    // 金色收获（5%概率）
    let isGolden = false;
    if (Math.random() < 0.05) {
        isGolden = true;
        quantity *= 3;
        GameState.player.goldenHarvests++;
        showGoldenHarvest(crop.name, quantity);
    }
    
    // 品质加成
    let sellMultiplier = 1;
    if (plot.cropQuality === 'good') sellMultiplier = 1.5;
    if (plot.cropQuality === 'perfect') sellMultiplier = 2;

    // 钻石商店：幸运药水 buff 提升品质
    if (GameState.buffs.luckyHarvest && GameState.buffs.luckyHarvest.active) {
        if (sellMultiplier < 2 && Math.random() < 0.5) {
            sellMultiplier = sellMultiplier < 1.5 ? 1.5 : 2;
            showNotification('🍀 幸运药水发挥效果！品质提升！', 'gold');
        }
    }
    
    // 添加到背包
    if (!GameState.inventory.harvest[plot.crop]) {
        GameState.inventory.harvest[plot.crop] = 0;
    }
    GameState.inventory.harvest[plot.crop] += quantity;
    
    // 统计
    GameState.player.totalHarvest++;
    if (crop.type === 'rare') GameState.player.rareHarvest++;
    if (crop.type === 'legendary') GameState.player.legendaryHarvest++;
    
    // 经验
    GameState.addXP(crop.xp * (isGolden ? 3 : 1));
    
    // 任务进度
    GameState.updateQuestProgress('harvest');
    if (crop.type === 'rare' || crop.type === 'legendary') {
        GameState.updateQuestProgress('rare');
    }
    
    // 粒子特效
    Scene3D.createHarvestEffect(plotId, crop.color);
    
    // 神秘种子揭晓
    if (plot.isMystery && !plot.mysteryRevealed) {
        MysterySeeds.revealMystery(plotId);
    } else if (!plot.isMystery) {
        // 普通种子也录入图鉴
        Pokedex.unlock('plant', plot.crop, { cropId: plot.crop, rarity: crop.type, firstTime: Date.now() });
    }

    
    // 重置土地
    plot.state = 'empty';
    plot.crop = null;
    plot.growProgress = 0;
    plot.watered = false;
    plot.fertilized = false;
    
    Scene3D.updatePlot(plot);
    
    if (!isGolden) {
        showNotification(`${crop.icon} 收获了 ${quantity} 个 ${crop.name}！`, '🌾');
    }
    
    // 教程通知
    if (typeof TutorialSystem !== 'undefined') TutorialSystem.notifyAction('harvest');
    // 季节活动
    if (typeof SeasonalEvents !== 'undefined') SeasonalEvents.updateProgress('harvest');
    // 庆典追踪
    if (typeof CelebrationSystem !== 'undefined') CelebrationSystem.trackWeekly('harvest');

    GameState.checkAchievements();
    GameState.save();
}

// 升级土地
function doUpgradeLand(plotId) {
    const plot = GameState.plots[plotId];
    
    let cost = 0;
    let nextQuality = '';
    
    if (plot.quality === 'normal') {
        cost = 500;
        nextQuality = 'fertile';
    } else if (plot.quality === 'fertile') {
        cost = 2000;
        nextQuality = 'magic';
    } else {
        showNotification('土地已达最高品质！', '⬆️');
        return;
    }
    
    if (!GameState.spendGold(cost)) {
        showNotification(`金币不足！需要 ${cost} 金币`, '💰', 'warning');
        return;
    }
    
    plot.quality = nextQuality;
    Scene3D.updatePlot(plot);
    
    const qualityNames = { fertile: '肥沃土地', magic: '神奇土地' };
    showNotification(`⬆️ 土地升级为 ${qualityNames[nextQuality]}！`, 'gold');
    GameState.save();
}

// 购买种子
function buySeed(cropId) {
    const crop = CROPS_DATA[cropId];
    if (!crop) return;
    
    if (GameState.player.level < crop.unlockLevel) {
        showNotification(`需要达到 ${crop.unlockLevel} 级才能购买！`, '🔒', 'warning');
        return;
    }
    
    if (!GameState.spendGold(crop.price)) {
        showNotification(`金币不足！需要 ${crop.price} 金币`, '💰', 'warning');
        return;
    }
    
    if (!GameState.inventory.seeds[cropId]) GameState.inventory.seeds[cropId] = 0;
    GameState.inventory.seeds[cropId] += 5;
    
    showNotification(`${crop.icon} 购买了 5 个 ${crop.name} 种子！`, '🌱');
    GameState.save();
}

// 购买动物
function buyAnimal(animalType) {
    const animalData = ANIMALS_DATA[animalType];
    if (!animalData) return;
    
    if (GameState.player.level < animalData.unlockLevel) {
        showNotification(`需要达到 ${animalData.unlockLevel} 级才能购买！`, '🔒', 'warning');
        return;
    }
    
    if (!GameState.spendGold(animalData.price)) {
        showNotification(`金币不足！需要 ${animalData.price} 金币`, '💰', 'warning');
        return;
    }
    
    const animal = {
        id: Date.now(),
        type: animalType,
        name: animalData.name,
        grown: false,
        growProgress: 0,
        mood: 100,
        intimacy: 0,
        hasProduct: false,
        productProgress: 0,
        fedToday: false,
        pettedToday: false
    };
    
    GameState.animals.push(animal);
    GameState.player.totalAnimals = GameState.animals.length;
    
    // 添加3D模型
    Scene3D.addAnimalMesh(animal);
    
    // 任务进度
    GameState.updateQuestProgress('buy_animal');
    
    showNotification(`${animalData.icon} 购买了 ${animalData.name}！`, '🐾');
    GameState.checkAchievements();
    GameState.save();
}

// 购买工具
function buyTool(toolId) {
    const tool = TOOLS_DATA[toolId];
    if (!tool) return;
    
    if (!GameState.spendGold(tool.price)) {
        showNotification(`金币不足！需要 ${tool.price} 金币`, '💰', 'warning');
        return;
    }
    
    if (!GameState.inventory.tools[toolId]) GameState.inventory.tools[toolId] = 0;
    GameState.inventory.tools[toolId]++;
    
    showNotification(`${tool.icon} 购买了 ${tool.name}！`, '🔧');
    GameState.save();
}

// 喂食动物
function doFeedAnimal(animalId) {
    const animal = GameState.animals.find(a => a.id === animalId);
    if (!animal) return;
    
    if (animal.fedToday) {
        showNotification('今天已经喂过了！', '🥕', 'warning');
        return;
    }
    
    if (!GameState.spendEnergy(2)) return;
    
    // 集成AnimalBehavior喂食逻辑
    if (typeof AnimalBehavior !== 'undefined') {
        AnimalBehavior.feedAnimal(animal);
    } else {
        animal.fedToday = true;
        animal.mood = Math.min(255, (animal.mood || 100) + 30);
    }
    
    GameState.updateQuestProgress('feed');
    
    const animalData = ANIMALS_DATA[animal.type];
    showNotification(`${animalData.icon} ${animal.name} 吃得很开心！`, '🥕');

    // 培育系统：提升亲密度
    if (typeof BreedingSystem !== 'undefined') BreedingSystem.addIntimacy(animalId, 5);
    // 季节活动
    if (typeof SeasonalEvents !== 'undefined') SeasonalEvents.updateProgress('feed');

    GameState.save();
}


// 收集动物产出
function doCollectAnimal(animalId) {
    const animal = GameState.animals.find(a => a.id === animalId);
    if (!animal) return;
    
    if (!animal.hasProduct) {
        showNotification('还没有产出！', '🥚', 'warning');
        return;
    }
    
    if (!animal.grown) {
        showNotification('动物还没长大！', '🐾', 'warning');
        return;
    }
    
    const animalData = ANIMALS_DATA[animal.type];
    
    // 计算产出数量（亲密度影响）
    let quantity = 1;
    if (animal.intimacy >= 50) quantity = 2;
    if (animal.intimacy >= 80) quantity = 3;
    
    // 添加到背包
    const productKey = `animal_${animal.type}`;
    if (!GameState.inventory.harvest[productKey]) GameState.inventory.harvest[productKey] = 0;
    GameState.inventory.harvest[productKey] += quantity;
    
    // 计算金币
    const gold = animalData.productValue * quantity;
    GameState.addGold(gold);
    GameState.addXP(10 * quantity);
    
    animal.hasProduct = false;
    animal.productProgress = 0;
    
    Scene3D.updateAnimalProductMarker(animalId, false);
    
    GameState.updateQuestProgress('collect');
    showNotification(`${animalData.product} 收集了 ${quantity} 个 ${animalData.productName}，获得 ${gold} 金币！`, '🥚');

    // 培育系统：提升亲密度
    if (typeof BreedingSystem !== 'undefined') BreedingSystem.addIntimacy(animalId, 2);
    // 庆典追踪
    if (typeof CelebrationSystem !== 'undefined') CelebrationSystem.trackWeekly('collect');
    // 季节活动
    if (typeof SeasonalEvents !== 'undefined') SeasonalEvents.updateProgress('collect');

    GameState.save();
}

// 重命名动物
function doRenameAnimal(animalId) {
    const animal = GameState.animals.find(a => a.id === animalId);
    if (!animal) return;
    
    const newName = prompt(`给 ${animal.name} 起个新名字：`, animal.name);
    if (newName && newName.trim()) {
        animal.name = newName.trim().substring(0, 10);
        showNotification(`✏️ 已重命名为 "${animal.name}"！`, '✏️');
        GameState.save();
    }
}

// 一键出售收获物
function sellAll() {
    let totalGold = 0;
    let totalItems = 0;
    
    Object.entries(GameState.inventory.harvest).forEach(([key, count]) => {
        if (count <= 0) return;
        
        let value = 0;
        if (CROPS_DATA[key]) {
            value = CROPS_DATA[key].sellPrice * count;
        } else if (key.startsWith('animal_')) {
            const animalType = key.replace('animal_', '');
            if (ANIMALS_DATA[animalType]) {
                value = ANIMALS_DATA[animalType].productValue * count;
            }
        }
        
        totalGold += value;
        totalItems += count;
        GameState.inventory.harvest[key] = 0;
    });

    // 同时出售加工产品
    if (typeof CookingSystem !== 'undefined' && GameState.cooking && GameState.cooking.products) {
        Object.entries(GameState.cooking.products).forEach(([productId, count]) => {
            if (count <= 0) return;
            const recipe = Object.values(RECIPES).find(r => Object.keys(r.output).includes(productId));
            if (recipe) {
                totalGold += recipe.sellPrice * count;
                totalItems += count;
                GameState.cooking.products[productId] = 0;
            }
        });
    }
    
    if (totalGold > 0) {
        GameState.addGold(totalGold);
        GameState.addXP(Math.floor(totalGold / 10));
        showNotification(`💰 出售了 ${totalItems} 件物品，获得 ${totalGold} 金币！`, 'gold');

        // 庆典追踪
        if (typeof CelebrationSystem !== 'undefined') CelebrationSystem.trackWeekly('gold', totalGold);
        // 季节活动
        if (typeof SeasonalEvents !== 'undefined') SeasonalEvents.updateProgress('gold', totalGold);

        GameState.save();
    } else {
        showNotification('背包中没有可出售的物品！', '🎒', 'warning');
    }
}

// 每日签到
function doCheckin() {
    const today = new Date().toDateString();
    
    if (GameState.player.lastCheckin === today) {
        showNotification('今天已经签到过了！', '📅', 'warning');
        return;
    }
    
    const yesterday = new Date(Date.now() - 86400000).toDateString();
    if (GameState.player.lastCheckin === yesterday) {
        GameState.player.streak++;
    } else if (GameState.player.lastCheckin !== today) {
        GameState.player.streak = 1;
    }
    
    GameState.player.maxStreak = Math.max(GameState.player.maxStreak, GameState.player.streak);
    GameState.player.lastCheckin = today;
    
    const dayIdx = (GameState.player.streak - 1) % 7;
    const reward = CHECKIN_REWARDS[dayIdx];
    
    // 发放奖励
    switch(reward.type) {
        case 'gold':
            GameState.addGold(reward.amount);
            GameState.recoverEnergy(reward.day * 5);
            break;
        case 'diamond':
            GameState.addDiamond(reward.amount);
            break;
        case 'seed_pack':
            ['radish', 'lettuce', 'wheat'].forEach(s => {
                if (!GameState.inventory.seeds[s]) GameState.inventory.seeds[s] = 0;
                GameState.inventory.seeds[s] += 3;
            });
            // 额外赠送1个普通神秘种子袋
            MysterySeeds.addBag('normal', 1);
            break;
        case 'rare_seed':
            ['strawberry', 'blueberry'].forEach(s => {
                if (!GameState.inventory.seeds[s]) GameState.inventory.seeds[s] = 0;
                GameState.inventory.seeds[s] += 1;
            });
            // 额外赠送1个稀有神秘种子袋
            MysterySeeds.addBag('rare', 1);
            break;

        case 'legend_pack':
            GameState.addGold(2000);
            GameState.addDiamond(50);
            GameState.recoverEnergy(50);
            break;
    }
    
    GameState.player.checkinDays.push(today);
    
    showNotification(`✅ 签到成功！连续 ${GameState.player.streak} 天！获得 ${reward.desc}`, 'gold');
    
    // 更新签到UI
    renderCheckinGrid();
    document.getElementById('checkin-btn').textContent = '✅ 今日已签到';
    document.getElementById('checkin-btn').disabled = true;
    
    GameState.checkAchievements();
    GameState.save();
    updateHUD();
}

// 格式化时间
function formatTime(seconds) {
    if (seconds < 60) return `${Math.ceil(seconds)}秒`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)}分${Math.ceil(seconds % 60)}秒`;
    return `${Math.floor(seconds / 3600)}小时${Math.floor((seconds % 3600) / 60)}分`;
}

// 使用加速卡
function useSpeedUp(plotId) {
    const count = GameState.inventory.tools['speedUp'] || 0;
    if (count <= 0) {
        showNotification('没有加速卡！', '⚡', 'warning');
        return;
    }
    
    const plot = GameState.plots[plotId];
    if (plot.state === 'empty' || plot.state === 'ready') {
        showNotification('无法使用加速卡！', '⚡', 'warning');
        return;
    }
    
    GameState.inventory.tools['speedUp']--;
    plot.growProgress = 1;
    plot.state = 'ready';
    Scene3D.updatePlot(plot);
    
    showNotification('⚡ 加速卡使用成功！作物立即成熟！', 'gold');

    // 教程通知
    if (typeof TutorialSystem !== 'undefined') TutorialSystem.notifyAction('speedup_used');

    GameState.save();
}

// ===== 钻石商店购买逻辑 =====
function buyDiamondItem(itemId) {
    const item = DIAMOND_SHOP_DATA.find(i => i.id === itemId);
    if (!item) return;

    // 检查钻石是否足够
    if (GameState.player.diamond < item.price) {
        showNotification(`💎 钻石不足！需要 ${item.price} 钻石`, '💎', 'warning');
        return;
    }

    // 执行购买
    switch (item.id) {
        case 'premium_fertilizer':
        case 'lucky_potion':
        case 'auto_watering': {
            // 时间制 buff
            if (!GameState.spendDiamond(item.price)) return;
            const buff = GameState.buffs[item.buffType];
            buff.active = true;
            buff.endTime = Date.now() + item.duration * 1000;
            buff.value = item.buffValue;
            const mins = Math.floor(item.duration / 60);
            showNotification(`${item.icon} ${item.name} 已激活！持续${mins}分钟`, 'gold');
            break;
        }

        case 'master_bait': {
            // 次数制 buff
            if (!GameState.spendDiamond(item.price)) return;
            const fishBuff = GameState.buffs.fishLuck;
            fishBuff.active = true;
            fishBuff.charges = (fishBuff.charges || 0) + item.charges;
            fishBuff.value = item.buffValue;
            showNotification(`${item.icon} ${item.name} 已激活！剩余${fishBuff.charges}次`, 'gold');
            break;
        }

        case 'animal_feed_pack': {
            // 即时效果：所有成年动物立即产出
            if (!GameState.spendDiamond(item.price)) return;
            let count = 0;
            GameState.animals.forEach(animal => {
                if (animal.grown) {
                    animal.hasProduct = true;
                    animal.productProgress = 1;
                    count++;
                }
            });
            if (count > 0) {
                showNotification(`${item.icon} ${count}只动物立即产出！`, 'gold');
            } else {
                showNotification('没有成年动物可以产出', '🐾', 'warning');
            }
            break;
        }

        case 'rare_seed_box': {
            // 即时效果：随机获得紫色/金色种子
            if (!GameState.spendDiamond(item.price)) return;
            const rareCrops = Object.values(CROPS_DATA).filter(c => c.type === 'rare' || c.type === 'legendary');
            const picked = rareCrops[Math.floor(Math.random() * rareCrops.length)];
            if (picked) {
                if (!GameState.inventory.seeds[picked.id]) GameState.inventory.seeds[picked.id] = 0;
                GameState.inventory.seeds[picked.id] += 3;
                showNotification(`${item.icon} 获得了 3 个 ${picked.icon} ${picked.name} 种子！`, 'gold');
            }
            break;
        }

        case 'land_expansion': {
            // 永久效果：新增1块土地
            if (GameState.plots.length >= 16) {
                showNotification('土地已达上限（16块）！', '📜', 'warning');
                return;
            }
            if (!GameState.spendDiamond(item.price)) return;
            const newPlotId = GameState.plots.length;
            GameState.plots.push({
                id: newPlotId,
                state: 'empty',
                crop: null,
                plantTime: 0,
                growProgress: 0,
                watered: false,
                fertilized: false,
                quality: 'normal',
                cropQuality: 'normal'
            });
            GameState.extraPlots = (GameState.extraPlots || 0) + 1;
            // 通知3D场景更新
            if (typeof Scene3D !== 'undefined' && Scene3D.addPlotMesh) {
                Scene3D.addPlotMesh(newPlotId);
            }
            showNotification(`${item.icon} 解锁了第 ${newPlotId + 1} 块土地！`, 'gold');
            break;
        }

        default:
            showNotification('未知商品！', '❓', 'warning');
            return;
    }

    updateHUD();
    GameState.save();

    // 刷新商店 UI
    if (typeof renderDiamondShop === 'function') {
        renderDiamondShop();
    }
}
