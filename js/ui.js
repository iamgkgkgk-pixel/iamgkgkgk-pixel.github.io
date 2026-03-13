// ===== UI管理 =====

// 显示弹窗
function showModal(id) {
    document.getElementById(id).classList.add('show');
    // 刷新内容
    switch(id) {
        case 'shop-modal': renderShop('seeds'); break;
        case 'inventory-modal': renderInventory('seeds'); break;
        case 'quest-modal': renderQuests('dailyNew'); break;
        case 'achievement-modal': renderAchievements(); break;
        case 'animal-modal': renderAnimalPanel(); break;
        case 'rank-modal': renderRankboard('week'); break;
        case 'checkin-modal': renderCheckinGrid(); break;
        case 'pokedex-modal': Pokedex.render('plant'); break;
        case 'fishing-modal':
            // 更新钓鱼统计
            const fishToday = document.getElementById('fish-today');
            const fishTotal = document.getElementById('fish-total');
            if (fishToday) fishToday.textContent = FishingSystem.totalFishToday || 0;
            if (fishTotal) fishTotal.textContent = GameState.player.totalFishCaught || 0;
            break;
        case 'cooking-modal':
            if (typeof CookingSystem !== 'undefined') {
                CookingSystem.initState();
                CookingSystem.renderPanel();
            }
            break;
        case 'social-modal':
            if (typeof SocialSystem !== 'undefined') {
                SocialSystem.initState();
                SocialSystem.renderPanel();
            }
            break;
        case 'order-modal':
            if (typeof OrderSystem !== 'undefined') {
                OrderSystem.initState();
                OrderSystem.renderPanel();
            }
            break;
        case 'deco-modal':
            if (typeof DecoSystem !== 'undefined') {
                DecoSystem.initState();
                DecoSystem.renderPanel();
            }
            break;
        case 'event-modal':
            if (typeof SeasonalEvents !== 'undefined') {
                SeasonalEvents.initState();
                SeasonalEvents.renderPanel();
                // 更新标题
                const ev = SeasonalEvents.getCurrentEvent();
                const titleEl = document.getElementById('event-modal-title');
                if (titleEl && ev) titleEl.textContent = ev.name;
            }
            break;
        case 'breeding-modal':
            if (typeof BreedingSystem !== 'undefined') {
                BreedingSystem.initState();
                BreedingSystem.renderPanel();
            }
            break;
        case 'celebration-modal':
            if (typeof CelebrationSystem !== 'undefined') {
                CelebrationSystem.initState();
                CelebrationSystem.renderPanel();
            }
            break;

    }
}


// 隐藏弹窗
function hideModal(id) {
    document.getElementById(id).classList.remove('show');
}

// 更新HUD
function updateHUD() {
    const p = GameState.player;
    document.getElementById('gold-display').textContent = formatNumber(p.gold);
    document.getElementById('diamond-display').textContent = p.diamond;
    document.getElementById('streak-display').textContent = p.streak;
    document.getElementById('level-num').textContent = p.level;
    document.getElementById('level-title').textContent = GameState.getLevelTitle();
    
    const xpPercent = (p.xp / p.xpToNext) * 100;
    document.getElementById('xp-bar').style.width = xpPercent + '%';
    document.getElementById('xp-text').textContent = `${p.xp} / ${p.xpToNext} XP`;
    
    const energyPercent = (p.energy / p.maxEnergy) * 100;
    document.getElementById('energy-fill').style.width = energyPercent + '%';
    document.getElementById('energy-text').textContent = `${Math.floor(p.energy)}/${p.maxEnergy}`;
    
    // 更新排行榜中玩家数据
    MOCK_RANK_DATA[MOCK_RANK_DATA.length - 1].score = p.totalGoldEarned;
    MOCK_RANK_DATA[MOCK_RANK_DATA.length - 1].level = p.level;

    // 签到小红点：今天还未签到
    const todayStr = new Date().toDateString();
    const checkinDot = document.getElementById('checkin-red-dot');
    if (checkinDot) {
        checkinDot.style.display = (p.lastCheckin !== todayStr) ? 'block' : 'none';
    }

    // 任务小红点：有已完成但未领取的任务
    const questDot = document.getElementById('quest-red-dot');
    if (questDot) {
        const hasClaimable = [...Object.values(GameState.quests.daily || {}),
                              ...Object.values(GameState.quests.weekly || {}),
                              ...Object.values(GameState.quests.main || {})]
            .some(q => q.completed && !q.claimed);
        questDot.style.display = hasClaimable ? 'block' : 'none';
    }

    // 社交小红点：有收到的互助通知
    const socialDot = document.getElementById('social-red-dot');
    if (socialDot) {
        const hasUnread = (GameState.social?.receivedHelp || []).length > 0;
        socialDot.style.display = hasUnread ? 'block' : 'none';
    }

    // 游戏时钟更新
    const hour = GameState.gameTime.hour || 8;
    const clockEl = document.getElementById('clock-time');
    const clockIcon = document.getElementById('clock-icon');
    const clockPeriod = document.getElementById('clock-period');
    if (clockEl) {
        clockEl.textContent = `${String(hour).padStart(2,'0')}:00`;
    }
    if (clockIcon) {
        if (hour >= 5 && hour < 7)       clockIcon.textContent = '🌅';
        else if (hour >= 7 && hour < 17) clockIcon.textContent = '🌞';
        else if (hour >= 17 && hour < 19) clockIcon.textContent = '🌇';
        else                              clockIcon.textContent = '🌙';
    }
    if (clockPeriod) {
        if (hour >= 5 && hour < 12)       clockPeriod.textContent = '上午';
        else if (hour >= 12 && hour < 18) clockPeriod.textContent = '下午';
        else if (hour >= 18 && hour < 22) clockPeriod.textContent = '傍晚';
        else                              clockPeriod.textContent = '深夜';
    }
}



// 更新天气显示
function updateWeatherDisplay() {
    const weather = WEATHER_DATA[GameState.gameTime.weather] || WEATHER_DATA['sunny'];
    document.getElementById('weather-icon').textContent = weather.icon;
    document.getElementById('weather-name').textContent = weather.name;
    document.getElementById('weather-effect').textContent = weather.effect;
}


// 更新季节显示
function updateSeasonDisplay() {
    const season = SEASONS_DATA[GameState.gameTime.season];
    document.getElementById('season-name').textContent = `${season.icon} ${season.name}`;
    document.getElementById('season-day').textContent = `第${GameState.gameTime.seasonDay}天`;
}

// 格式化数字
function formatNumber(num) {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
}

// 显示通知
function showNotification(text, icon = '📢', type = '') {
    const container = document.getElementById('notifications');
    const notif = document.createElement('div');
    notif.className = `notification ${type}`;
    notif.innerHTML = `<span>${icon}</span><span>${text}</span>`;
    container.appendChild(notif);
    
    setTimeout(() => {
        notif.style.animation = 'slideOut 0.3s ease forwards';
        setTimeout(() => notif.remove(), 300);
    }, 3000);
}

// 显示金色收获特效
function showGoldenHarvest(cropName, quantity) {
    const el = document.getElementById('golden-harvest');
    document.getElementById('golden-sub-text').textContent = `${cropName} × ${quantity}`;
    el.style.display = 'block';
    setTimeout(() => { el.style.display = 'none'; }, 2000);
}

// 显示升级特效
function showLevelUpEffect() {
    const el = document.getElementById('level-up-effect');
    el.querySelector('.levelup-text').textContent = `🎉 升级到 ${GameState.player.level} 级！`;
    el.style.display = 'block';
    setTimeout(() => { el.style.display = 'none'; }, 3000);
}

// ===== 商店渲染 =====
let currentShopTab = 'seeds';

function switchShopTab(tab) {
    currentShopTab = tab;
    document.querySelectorAll('#shop-modal .tab-btn').forEach(btn => btn.classList.remove('active'));
    event.target.classList.add('active');
    renderShop(tab);
}

function renderShop(tab) {
    const content = document.getElementById('shop-content');
    content.innerHTML = '';
    
    if (tab === 'seeds') {
        Object.values(CROPS_DATA).forEach(crop => {
            const locked = GameState.player.level < crop.unlockLevel;
            const item = document.createElement('div');
            item.className = 'shop-item';
            item.innerHTML = `
                <div class="item-icon">${crop.icon}</div>
                <div class="item-name">${crop.name}</div>
                <div class="item-time">⏱ ${formatTime(crop.growTime)}</div>
                <div class="item-price">💰 ${crop.price}/5粒</div>
                ${locked ? `<div class="item-locked">🔒 需要${crop.unlockLevel}级</div>` : `<div style="color:#4CAF50;font-size:11px">库存: ${GameState.inventory.seeds[crop.id] || 0}</div>`}
            `;
            if (!locked) {
                item.onclick = () => buySeed(crop.id);
            } else {
                item.style.opacity = '0.5';
            }
            content.appendChild(item);
        });
    } else if (tab === 'animals') {
        Object.values(ANIMALS_DATA).forEach(animal => {
            const locked = GameState.player.level < animal.unlockLevel;
            const item = document.createElement('div');
            item.className = 'shop-item';
            item.innerHTML = `
                <div class="item-icon">${animal.icon}</div>
                <div class="item-name">${animal.name}</div>
                <div class="item-time">产出: ${animal.product} ${animal.productName}</div>
                <div class="item-price">💰 ${animal.price}</div>
                ${locked ? `<div class="item-locked">🔒 需要${animal.unlockLevel}级</div>` : ''}
            `;
            if (!locked) {
                item.onclick = () => { buyAnimal(animal.id); hideModal('shop-modal'); };
            } else {
                item.style.opacity = '0.5';
            }
            content.appendChild(item);
        });
    } else if (tab === 'tools') {
        Object.values(TOOLS_DATA).forEach(tool => {
            const locked = GameState.player.level < tool.unlockLevel;
            const item = document.createElement('div');
            item.className = 'shop-item';
            item.innerHTML = `
                <div class="item-icon">${tool.icon}</div>
                <div class="item-name">${tool.name}</div>
                <div class="item-time">${tool.description}</div>
                <div class="item-price">💰 ${tool.price}</div>
                ${locked ? `<div class="item-locked">🔒 需要${tool.unlockLevel}级</div>` : `<div style="color:#4CAF50;font-size:11px">库存: ${GameState.inventory.tools[tool.id] || 0}</div>`}
            `;
            if (!locked) {
                item.onclick = () => buyTool(tool.id);
            } else {
                item.style.opacity = '0.5';
            }
            content.appendChild(item);
        });
    } else if (tab === 'deco') {
        Object.values(DECO_DATA).forEach(deco => {
            const item = document.createElement('div');
            item.className = 'shop-item';
            item.innerHTML = `
                <div class="item-icon">${deco.icon}</div>
                <div class="item-name">${deco.name}</div>
                <div class="item-time">${deco.description}</div>
                <div class="item-price">💰 ${deco.price}</div>
            `;
            item.onclick = () => {
                if (GameState.spendGold(deco.price)) {
                    // 添加到装饰系统库存
                    if (typeof DecoSystem !== 'undefined') {
                        DecoSystem.initState();
                        if (!GameState.decoration.inventory[deco.id]) GameState.decoration.inventory[deco.id] = 0;
                        GameState.decoration.inventory[deco.id]++;
                    }
                    showNotification(`${deco.icon} 购买了 ${deco.name}！`, '🏡');
                    GameState.save();
                    renderShop('deco');
                } else {
                    showNotification(`金币不足！需要 ${deco.price} 金币`, '💰', 'warning');
                }
            };
            content.appendChild(item);
        });
    } else if (tab === 'diamond') {
        renderDiamondShop();
    }
}

// ===== 背包渲染 =====
let currentInvTab = 'seeds';

function switchInvTab(tab) {
    currentInvTab = tab;
    document.querySelectorAll('#inventory-modal .tab-btn').forEach(btn => btn.classList.remove('active'));
    event.target.classList.add('active');
    renderInventory(tab);
}

function renderInventory(tab) {
    const content = document.getElementById('inventory-content');
    content.innerHTML = '';
    
    let items = [];
    
    if (tab === 'seeds') {
        // 神秘种子袋区域
        const bagTypes = ['normal', 'rare', 'legendary'];
        let hasBag = false;
        bagTypes.forEach(bagType => {
            const count = GameState.inventory.seeds[`mystery_${bagType}`] || 0;
            if (count > 0) {
                hasBag = true;
                const config = SEED_BAG_CONFIG[bagType];
                const slot = document.createElement('div');
                slot.className = 'inv-slot';
                slot.style.cssText = `border-color:${config.borderColor};background:${config.bgColor}`;
                slot.innerHTML = `
                    <div class="slot-icon">${config.icon}</div>
                    <div class="slot-name" style="color:${config.color}">${config.name}</div>
                    <div class="slot-count">×${count}</div>
                `;
                slot.onclick = () => MysterySeeds.openBagUI(bagType);
                content.appendChild(slot);
            }
        });
        
        // 普通种子
        Object.entries(GameState.inventory.seeds).forEach(([id, count]) => {
            if (count > 0 && CROPS_DATA[id]) {
                items.push({ icon: CROPS_DATA[id].icon, name: CROPS_DATA[id].name, count });
            }
        });
    } else if (tab === 'harvest') {

        Object.entries(GameState.inventory.harvest).forEach(([key, count]) => {
            if (count <= 0) return;
            if (CROPS_DATA[key]) {
                items.push({ icon: CROPS_DATA[key].icon, name: CROPS_DATA[key].name, count, value: CROPS_DATA[key].sellPrice });
            } else if (key.startsWith('animal_')) {
                const animalType = key.replace('animal_', '');
                if (ANIMALS_DATA[animalType]) {
                    items.push({ icon: ANIMALS_DATA[animalType].product, name: ANIMALS_DATA[animalType].productName, count, value: ANIMALS_DATA[animalType].productValue });
                }
            }
        });
        // 显示加工产品
        if (typeof CookingSystem !== 'undefined' && GameState.cooking && GameState.cooking.products) {
            Object.entries(GameState.cooking.products).forEach(([productId, count]) => {
                if (count <= 0) return;
                const recipe = Object.values(RECIPES).find(r => Object.keys(r.output).includes(productId));
                if (recipe) {
                    items.push({ icon: recipe.resultIcon, name: recipe.name, count, value: recipe.sellPrice, isProcessed: true });
                }
            });
        }
    } else if (tab === 'tools') {
        Object.entries(GameState.inventory.tools).forEach(([id, count]) => {
            if (count > 0 && TOOLS_DATA[id]) {
                items.push({ icon: TOOLS_DATA[id].icon, name: TOOLS_DATA[id].name, count });
            }
        });
        // 显示钓鱼碎片
        const rareFrags = GameState.inventory.tools['rare_fragment'] || 0;
        const legendFrags = GameState.inventory.tools['legend_fragment'] || 0;
        if (rareFrags > 0) items.push({ icon: '🧩', name: '稀有碎片', count: rareFrags, hint: `${rareFrags}/10可合成` });
        if (legendFrags > 0) items.push({ icon: '✨', name: '传说碎片', count: legendFrags, hint: `${legendFrags}/5可合成` });
    }

    
    if (items.length === 0 && content.children.length === 0) {
        content.innerHTML = '<div style="color:#aaa;text-align:center;padding:20px;grid-column:1/-1">暂无物品</div>';
        return;
    }
    
    items.forEach(item => {

        const slot = document.createElement('div');
        slot.className = 'inv-slot';
        slot.innerHTML = `
            <div class="slot-icon">${item.icon}</div>
            <div class="slot-name">${item.name}</div>
            <div class="slot-count">×${item.count}</div>
            ${item.value ? `<div style="color:#ffd700;font-size:10px">💰${item.value}each</div>` : ''}
        `;
        content.appendChild(slot);
    });
}

// ===== 任务渲染 =====
let currentQuestTab = 'daily';

function switchQuestTab(tab) {
    currentQuestTab = tab;
    document.querySelectorAll('#quest-modal .tab-btn').forEach(btn => btn.classList.remove('active'));
    event.target.classList.add('active');
    renderQuests(tab);
}

function renderQuests(tab) {
    const content = document.getElementById('quest-content');
    content.innerHTML = '';

    // 新版每日任务
    if (tab === 'dailyNew') {
        renderDailyNewQuests(content);
        return;
    }
    
    let quests = [];
    let questData = [];
    
    if (tab === 'daily') {
        questData = DAILY_QUESTS;
        quests = GameState.quests.daily;
    } else if (tab === 'weekly') {
        questData = WEEKLY_QUESTS;
        quests = GameState.quests.weekly;
    } else {
        questData = MAIN_QUESTS;
        quests = GameState.quests.main;
    }
    
    questData.forEach(q => {
        const progress = quests[q.id] || { progress: 0, completed: false, claimed: false };
        const percent = Math.min(100, (progress.progress / q.target) * 100);
        
        const item = document.createElement('div');
        item.className = 'quest-item';
        if (progress.completed) item.style.borderLeftColor = '#ffd700';
        
        item.innerHTML = `
            <div class="quest-name">${q.name}</div>
            <div class="quest-desc">${q.desc}</div>
            <div class="quest-progress-bg"><div class="quest-progress" style="width:${percent}%"></div></div>
            <div style="display:flex;justify-content:space-between;align-items:center;margin-top:5px">
                <div class="quest-reward">奖励: 💰${q.reward} + ${q.xp}XP</div>
                <div style="font-size:12px;color:#aaa">${progress.progress}/${q.target}</div>
            </div>
            ${progress.completed && !progress.claimed ? `<button class="btn-gold" style="margin-top:8px;width:100%;padding:6px" onclick="claimQuest('${tab}','${q.id}')">领取奖励</button>` : ''}
            ${progress.claimed ? '<div style="color:#4CAF50;font-size:12px;margin-top:5px">✅ 已领取</div>' : ''}
        `;
        content.appendChild(item);
    });
}

// 领取任务奖励
function claimQuest(tab, questId) {
    let questData, quests;
    if (tab === 'daily') { questData = DAILY_QUESTS; quests = GameState.quests.daily; }
    else if (tab === 'weekly') { questData = WEEKLY_QUESTS; quests = GameState.quests.weekly; }
    else { questData = MAIN_QUESTS; quests = GameState.quests.main; }
    
    const q = questData.find(q => q.id === questId);
    const progress = quests[questId];
    
    if (!q || !progress || !progress.completed || progress.claimed) return;
    
    progress.claimed = true;
    GameState.addGold(q.reward);
    GameState.addXP(q.xp);
    
    showNotification(`🎁 领取了任务奖励：${q.reward}金币 + ${q.xp}XP！`, 'gold');
    renderQuests(tab);
    GameState.save();
}

// ===== 新版每日任务渲染 =====
function renderDailyNewQuests(content) {
    // 确保任务已初始化
    GameState.refreshDailyTasks();
    
    const tasks = GameState.dailyTaskSystem.tasks || [];
    
    if (tasks.length === 0) {
        content.innerHTML = '<div style="color:#aaa;text-align:center;padding:20px">任务加载中...</div>';
        return;
    }

    // 完成进度总览
    const completedCount = tasks.filter(t => t.claimed).length;
    const headerDiv = document.createElement('div');
    headerDiv.style.cssText = 'text-align:center;margin-bottom:15px;padding:10px;background:rgba(0,191,255,0.08);border-radius:10px;border:1px solid rgba(0,191,255,0.2)';
    headerDiv.innerHTML = `
        <div style="font-size:14px;color:#00bfff;margin-bottom:6px">📋 今日任务进度</div>
        <div style="display:flex;gap:8px;justify-content:center">
            ${[0,1,2,3].map(i => `<div style="width:24px;height:24px;border-radius:50%;background:${i < completedCount ? '#4CAF50' : 'rgba(255,255,255,0.1)'};display:flex;align-items:center;justify-content:center;font-size:12px">${i < completedCount ? '✓' : (i+1)}</div>`).join('')}
        </div>
    `;
    content.appendChild(headerDiv);
    
    // 任务列表
    tasks.forEach((task, idx) => {
        const percent = Math.min(100, (task.progress / task.target) * 100);
        const item = document.createElement('div');
        item.className = 'quest-item';
        if (task.completed) item.style.borderLeftColor = '#ffd700';
        if (task.claimed) item.style.opacity = '0.6';
        
        // 构建奖励文字
        let rewardText = [];
        if (task.reward > 0) rewardText.push(`💰${task.reward}`);
        if (task.diamond > 0) rewardText.push(`💎${task.diamond}`);
        if (task.xp > 0) rewardText.push(`${task.xp}XP`);
        
        item.innerHTML = `
            <div class="quest-name">${task.name}</div>
            <div class="quest-desc">${task.desc}</div>
            <div class="quest-progress-bg"><div class="quest-progress" style="width:${percent}%"></div></div>
            <div style="display:flex;justify-content:space-between;align-items:center;margin-top:5px">
                <div class="quest-reward">奖励: ${rewardText.join(' + ')}</div>
                <div style="font-size:12px;color:#aaa">${task.progress}/${task.target}</div>
            </div>
            ${task.completed && !task.claimed ? `<button class="btn-gold" style="margin-top:8px;width:100%;padding:6px" onclick="claimDailyNewQuest(${idx})">领取奖励</button>` : ''}
            ${task.claimed ? '<div style="color:#4CAF50;font-size:12px;margin-top:5px">✅ 已领取</div>' : ''}
        `;
        content.appendChild(item);
    });
    
    // 全勤奖
    const allClearDiv = document.createElement('div');
    const isAllClear = GameState.isDailyAllClear();
    const allClearClaimed = GameState.dailyTaskSystem.allClearClaimed;
    
    allClearDiv.style.cssText = `margin-top:15px;padding:15px;background:${isAllClear ? 'rgba(255,215,0,0.1)' : 'rgba(255,255,255,0.03)'};border-radius:12px;border:2px solid ${isAllClear && !allClearClaimed ? '#ffd700' : 'rgba(255,255,255,0.1)'};text-align:center`;
    allClearDiv.innerHTML = `
        <div style="font-size:16px;margin-bottom:6px">🎖️ 全勤奖</div>
        <div style="font-size:13px;color:#aaa;margin-bottom:8px">完成全部4个任务后领取</div>
        <div style="font-size:14px;color:#ffd700">奖励: 💎${DAILY_ALLCLEAR_REWARD.diamond} + ${DAILY_ALLCLEAR_REWARD.xp}XP</div>
        <div style="margin-top:8px;font-size:12px;color:#aaa">${completedCount}/4 已领取</div>
        ${isAllClear && !allClearClaimed ? `<button class="btn-gold" style="margin-top:10px;width:100%" onclick="claimDailyAllClear()">🎖️ 领取全勤奖</button>` : ''}
        ${allClearClaimed ? '<div style="color:#4CAF50;font-size:13px;margin-top:8px">✅ 已领取全勤奖</div>' : ''}
    `;
    content.appendChild(allClearDiv);
}

// 领取新版每日任务奖励
function claimDailyNewQuest(idx) {
    const task = GameState.dailyTaskSystem.tasks[idx];
    if (!task || !task.completed || task.claimed) return;
    
    task.claimed = true;
    
    if (task.reward > 0) GameState.addGold(task.reward);
    if (task.diamond > 0) GameState.addDiamond(task.diamond);
    if (task.xp > 0) GameState.addXP(task.xp);
    
    let rewardMsg = [];
    if (task.reward > 0) rewardMsg.push(`${task.reward}金币`);
    if (task.diamond > 0) rewardMsg.push(`${task.diamond}钻石`);
    if (task.xp > 0) rewardMsg.push(`${task.xp}XP`);
    
    showNotification(`🎁 领取了：${rewardMsg.join(' + ')}！`, 'gold');
    renderQuests('dailyNew');
    GameState.save();
}

// 领取全勤奖
function claimDailyAllClear() {
    if (!GameState.isDailyAllClear() || GameState.dailyTaskSystem.allClearClaimed) return;
    
    GameState.dailyTaskSystem.allClearClaimed = true;
    
    if (DAILY_ALLCLEAR_REWARD.gold > 0) GameState.addGold(DAILY_ALLCLEAR_REWARD.gold);
    if (DAILY_ALLCLEAR_REWARD.diamond > 0) GameState.addDiamond(DAILY_ALLCLEAR_REWARD.diamond);
    if (DAILY_ALLCLEAR_REWARD.xp > 0) GameState.addXP(DAILY_ALLCLEAR_REWARD.xp);
    
    showNotification(`🎖️ 全勤奖领取成功！💎${DAILY_ALLCLEAR_REWARD.diamond} + ${DAILY_ALLCLEAR_REWARD.xp}XP！`, 'gold');
    renderQuests('dailyNew');
    GameState.save();
}

// ===== 成就渲染 =====
let currentAchTab = 'all';

function renderAchievements() {
    const content = document.getElementById('achievement-content');
    content.innerHTML = '';
    
    const rarityColors = { common: '#aaa', uncommon: '#4CAF50', rare: '#2196F3', epic: '#9C27B0', legendary: '#FF9800' };
    
    // 总计
    const total = ACHIEVEMENTS_DATA.length;
    const unlocked = GameState.achievements.size;
    
    const header = document.createElement('div');
    header.style.cssText = 'text-align:center;color:#aaa;font-size:13px;margin-bottom:12px;padding:8px;background:rgba(255,255,255,0.05);border-radius:8px';
    header.textContent = `已解锁 ${unlocked}/${total} 个成就`;
    content.appendChild(header);

    // 分类标签
    const categories = [
        { key: 'all', label: '全部' },
        { key: 'plant', label: '🌱 种植' },
        { key: 'animal', label: '🐄 动物' },
        { key: 'progress', label: '⭐ 成长' },
        { key: 'economy', label: '💰 经济' },
        { key: 'social', label: '📅 签到' },
        { key: 'fish', label: '🎣 钓鱼' },
        { key: 'collect', label: '📖 收集' }
    ];
    
    const tabsDiv = document.createElement('div');
    tabsDiv.className = 'tabs';
    tabsDiv.style.marginBottom = '12px';
    categories.forEach(cat => {
        const btn = document.createElement('button');
        btn.className = `tab-btn ${currentAchTab === cat.key ? 'active' : ''}`;
        btn.textContent = cat.label;
        btn.onclick = () => {
            currentAchTab = cat.key;
            renderAchievements();
        };
        tabsDiv.appendChild(btn);
    });
    content.appendChild(tabsDiv);
    
    // 过滤成就
    const filtered = currentAchTab === 'all' ? ACHIEVEMENTS_DATA : ACHIEVEMENTS_DATA.filter(a => a.category === currentAchTab);
    
    filtered.forEach(ach => {
        const isUnlocked = GameState.achievements.has(ach.id);
        const item = document.createElement('div');
        item.className = `achievement-item ${isUnlocked ? 'unlocked' : 'locked'}`;
        
        let rewardText = `💰${ach.reward}`;
        if (ach.diamond > 0) rewardText += ` + 💎${ach.diamond}`;
        if (ach.xp > 0) rewardText += ` + ${ach.xp}XP`;
        
        item.innerHTML = `
            <div class="ach-icon">${ach.icon}</div>
            <div class="ach-info">
                <div class="ach-name" style="color:${rarityColors[ach.rarity]}">${ach.name}</div>
                <div class="ach-desc">${ach.desc}</div>
                <div style="font-size:11px;color:#ffd700;margin-top:3px">奖励: ${rewardText}</div>
            </div>
            <div style="font-size:20px">${isUnlocked ? '✅' : '🔒'}</div>
        `;
        content.appendChild(item);
    });
}

// ===== 动物面板渲染 =====
function renderAnimalPanel() {
    const content = document.getElementById('animal-content');
    content.innerHTML = '';
    
    if (GameState.animals.length === 0) {
        content.innerHTML = '<div style="color:#aaa;text-align:center;padding:20px">还没有动物，去商店购买吧！</div>';
        return;
    }
    
    GameState.animals.forEach(animal => {
        const animalData = ANIMALS_DATA[animal.type];
        if (!animalData) return;
        
        const card = document.createElement('div');
        card.className = 'animal-card';
        
        const moodEmoji = animal.mood > 70 ? '😊' : animal.mood > 40 ? '😐' : '😢';
        const growPercent = animal.grown ? 100 : Math.floor((animal.growProgress || 0) * 100);
        const productPercent = animal.grown ? Math.floor((animal.productProgress || 0) * 100) : 0;
        
        card.innerHTML = `
            <div class="animal-icon">${animalData.icon}</div>
            <div class="animal-info">
                <div class="animal-name">${animal.name} ${animal.hasProduct ? '🌟' : ''}</div>
                <div class="animal-type">${animalData.name} · 亲密度: ${Math.floor(animal.intimacy || 0)}</div>
                <div class="animal-mood">${moodEmoji} 心情: ${Math.floor(animal.mood || 0)}%</div>
                <div class="mood-bar-bg"><div class="mood-bar" style="width:${animal.mood || 0}%"></div></div>
                ${!animal.grown ? `<div style="font-size:11px;color:#aaa;margin-top:3px">成长中: ${growPercent}%</div>` : ''}
                ${animal.grown ? `<div style="font-size:11px;color:#aaa;margin-top:3px">产出进度: ${productPercent}%</div>` : ''}
            </div>
        `;
        
        card.onclick = () => {
            if (animal.hasProduct) {
                doCollectAnimal(animal.id);
                renderAnimalPanel();
            } else if (!animal.fedToday) {
                doFeedAnimal(animal.id);
                renderAnimalPanel();
            } else {
                doPetAnimal(animal.id);
                renderAnimalPanel();
            }
        };
        
        content.appendChild(card);
    });
}

// ===== 排行榜渲染 =====
let currentRankTab = 'week';

function switchRankTab(tab) {
    currentRankTab = tab;
    document.querySelectorAll('#rank-modal .tab-btn').forEach(btn => btn.classList.remove('active'));
    event.target.classList.add('active');
    renderRankboard(tab);
}

function renderRankboard(tab) {
    const content = document.getElementById('rank-content');
    content.innerHTML = '';
    
    // 更新玩家数据
    const playerEntry = MOCK_RANK_DATA.find(r => r.isPlayer);
    if (playerEntry) {
        playerEntry.score = GameState.player.totalGoldEarned;
        playerEntry.level = GameState.player.level;
        playerEntry.name = GameState.player.name;
    }
    
    // 排序
    const sorted = [...MOCK_RANK_DATA].sort((a, b) => {
        if (tab === 'level') return b.level - a.level;
        return b.score - a.score;
    });
    
    sorted.forEach((entry, i) => {
        const item = document.createElement('div');
        item.className = 'rank-item';
        if (entry.isPlayer) item.style.background = 'rgba(76,175,80,0.1)';
        
        const rankClass = i === 0 ? 'gold' : i === 1 ? 'silver' : i === 2 ? 'bronze' : '';
        const rankIcon = i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : (i + 1);
        
        item.innerHTML = `
            <div class="rank-num ${rankClass}">${rankIcon}</div>
            <div class="rank-avatar">${entry.avatar}</div>
            <div class="rank-info">
                <div class="rank-name">${entry.name}${entry.isPlayer ? ' (你)' : ''}</div>
                <div class="rank-score">${tab === 'level' ? `Lv.${entry.level}` : `💰 ${formatNumber(entry.score)}`}</div>
            </div>
            <div class="rank-badge">${entry.badge || ''}</div>
        `;
        content.appendChild(item);
    });
}

// ===== 签到渲染 =====
function renderCheckinGrid() {
    const grid = document.getElementById('checkin-grid');
    grid.innerHTML = '';
    
    const today = new Date().toDateString();
    const todayChecked = GameState.player.lastCheckin === today;
    
    CHECKIN_REWARDS.forEach((reward, i) => {
        const dayNum = i + 1;
        const isDone = GameState.player.streak >= dayNum || (todayChecked && GameState.player.streak >= dayNum);
        const isToday = (GameState.player.streak % 7 === i) || (GameState.player.streak === 0 && i === 0);
        
        const day = document.createElement('div');
        day.className = `checkin-day ${isDone ? 'done' : ''} ${isToday && !todayChecked ? 'today' : ''}`;
        day.innerHTML = `
            <div class="day-num">第${dayNum}天</div>
            <div class="day-reward">${reward.icon}</div>
            <div class="day-amount">${reward.desc}</div>
        `;
        grid.appendChild(day);
    });
    
    const btn = document.getElementById('checkin-btn');
    if (todayChecked) {
        btn.textContent = '✅ 今日已签到';
        btn.disabled = true;
    } else {
        btn.textContent = '✅ 今日签到';
        btn.disabled = false;
    }
}

// ===== 钻石商店渲染 =====
function renderDiamondShop() {
    const content = document.getElementById('shop-content');
    content.innerHTML = '';

    // 当前余额提示
    const balanceDiv = document.createElement('div');
    balanceDiv.style.cssText = 'text-align:center;margin-bottom:15px;padding:10px;background:rgba(0,191,255,0.1);border-radius:10px;border:1px solid rgba(0,191,255,0.3)';
    balanceDiv.innerHTML = `<span style="font-size:16px;color:#00bfff">💎 当前钻石: <strong>${GameState.player.diamond}</strong></span>`;
    content.appendChild(balanceDiv);

    // 当前活跃 buff 提示
    const activeBuffs = [];
    if (GameState.buffs.growSpeed && GameState.buffs.growSpeed.active) {
        const remain = Math.max(0, Math.ceil((GameState.buffs.growSpeed.endTime - Date.now()) / 60000));
        activeBuffs.push(`🧪 高级肥料 (${remain}分钟)`);
    }
    if (GameState.buffs.luckyHarvest && GameState.buffs.luckyHarvest.active) {
        const remain = Math.max(0, Math.ceil((GameState.buffs.luckyHarvest.endTime - Date.now()) / 60000));
        activeBuffs.push(`🍀 幸运药水 (${remain}分钟)`);
    }
    if (GameState.buffs.autoWater && GameState.buffs.autoWater.active) {
        const remain = Math.max(0, Math.ceil((GameState.buffs.autoWater.endTime - Date.now()) / 60000));
        activeBuffs.push(`💦 自动浇水 (${remain}分钟)`);
    }
    if (GameState.buffs.fishLuck && GameState.buffs.fishLuck.active && GameState.buffs.fishLuck.charges > 0) {
        activeBuffs.push(`🪱 钓鱼大师 (${GameState.buffs.fishLuck.charges}次)`);
    }

    if (activeBuffs.length > 0) {
        const buffDiv = document.createElement('div');
        buffDiv.style.cssText = 'margin-bottom:12px;padding:8px 12px;background:rgba(76,175,80,0.1);border-radius:8px;border:1px solid rgba(76,175,80,0.3);font-size:12px;color:#8BC34A';
        buffDiv.innerHTML = `<div style="margin-bottom:4px;font-weight:bold">✨ 当前生效中:</div>${activeBuffs.join('<br>')}`;
        content.appendChild(buffDiv);
    }

    // 商品网格
    const grid = document.createElement('div');
    grid.className = 'shop-grid';
    grid.style.gridTemplateColumns = 'repeat(2, 1fr)';
    content.appendChild(grid);

    DIAMOND_SHOP_DATA.forEach(item => {
        const canAfford = GameState.player.diamond >= item.price;
        const card = document.createElement('div');
        card.className = 'shop-item';
        card.style.cssText = `
            border-color: ${canAfford ? 'rgba(0,191,255,0.4)' : 'rgba(255,255,255,0.05)'};
            background: ${canAfford ? 'rgba(0,191,255,0.05)' : 'rgba(255,255,255,0.02)'};
            ${!canAfford ? 'opacity:0.5;' : ''}
            padding: 15px;
        `;

        // 检查是否为永久物品且已满
        let statusText = '';
        if (item.id === 'land_expansion' && GameState.plots.length >= 16) {
            statusText = '<div style="color:#f44336;font-size:11px;margin-top:4px">已达上限</div>';
        }

        card.innerHTML = `
            <div class="item-icon" style="font-size:36px">${item.icon}</div>
            <div class="item-name" style="font-size:13px;font-weight:bold;margin:6px 0;color:#ddd">${item.name}</div>
            <div style="font-size:11px;color:#aaa;min-height:30px">${item.description}</div>
            <div class="item-price" style="color:#00bfff;font-size:14px;margin-top:6px">💎 ${item.price}</div>
            ${statusText}
        `;

        if (canAfford && !(item.id === 'land_expansion' && GameState.plots.length >= 16)) {
            card.onclick = () => {
                buyDiamondItem(item.id);
                renderDiamondShop();
            };
            card.style.cursor = 'pointer';
        } else {
            card.style.cursor = 'not-allowed';
        }

        grid.appendChild(card);
    });
}

// 点击空白关闭弹窗
document.addEventListener('click', (e) => {
    if (e.target.classList.contains('modal')) {
        e.target.classList.remove('show');
    }
});
