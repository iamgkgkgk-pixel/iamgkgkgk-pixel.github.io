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
        case 'upgrade': doUpgradeLand(currentPlotId); break;
    }
}

// 动物操作
function doAnimalAction(action) {
    hideAllMenus();
    switch(action) {
        case 'feed': doFeedAnimal(currentAnimalId); break;
        case 'pet': doPetAnimal(currentAnimalId); break;
        case 'collect': doCollectAnimal(currentAnimalId); break;
        case 'rename': doRenameAnimal(currentAnimalId); break;
    }
}

// 显示种植弹窗
function showPlantModal(plotId) {
    currentPlotId = plotId;
    const content = document.getElementById('plant-content');
    content.innerHTML = '';
    
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
        
        content.appendChild(item);
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
    
    animal.fedToday = true;
    animal.mood = Math.min(100, animal.mood + 20);
    animal.intimacy = Math.min(100, animal.intimacy + 5);
    
    GameState.updateQuestProgress('feed');
    
    const animalData = ANIMALS_DATA[animal.type];
    showNotification(`${animalData.icon} ${animal.name} 吃得很开心！`, '🥕');
    GameState.save();
}

// 抚摸动物
function doPetAnimal(animalId) {
    const animal = GameState.animals.find(a => a.id === animalId);
    if (!animal) return;
    
    if (animal.pettedToday) {
        showNotification('今天已经抚摸过了！', '🤝', 'warning');
        return;
    }
    
    animal.pettedToday = true;
    animal.mood = Math.min(100, animal.mood + 15);
    animal.intimacy = Math.min(100, animal.intimacy + 10);
    
    const animalData = ANIMALS_DATA[animal.type];
    showNotification(`${animalData.icon} ${animal.name} 很喜欢你的抚摸！`, '❤️');
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
    
    if (totalGold > 0) {
        GameState.addGold(totalGold);
        GameState.addXP(Math.floor(totalGold / 10));
        showNotification(`💰 出售了 ${totalItems} 件物品，获得 ${totalGold} 金币！`, 'gold');
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
            break;
        case 'rare_seed':
            ['strawberry', 'blueberry'].forEach(s => {
                if (!GameState.inventory.seeds[s]) GameState.inventory.seeds[s] = 0;
                GameState.inventory.seeds[s] += 1;
            });
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
    GameState.save();
}
