// ===== UI管理 =====

// 显示弹窗
function showModal(id) {
    document.getElementById(id).classList.add('show');
    // 刷新内容
    switch(id) {
        case 'shop-modal': renderShop('seeds'); break;
        case 'inventory-modal': renderInventory('seeds'); break;
        case 'quest-modal': renderQuests('daily'); break;
        case 'achievement-modal': renderAchievements(); break;
        case 'animal-modal': renderAnimalPanel(); break;
        case 'rank-modal': renderRankboard('week'); break;
        case 'checkin-modal': renderCheckinGrid(); break;
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
}

// 更新天气显示
function updateWeatherDisplay() {
    const weather = WEATHER_DATA[GameState.gameTime.weather];
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
                    showNotification(`${deco.icon} 购买了 ${deco.name}！`, '🏡');
                    GameState.save();
                } else {
                    showNotification(`金币不足！需要 ${deco.price} 金币`, '💰', 'warning');
                }
            };
            content.appendChild(item);
        });
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
    } else if (tab === 'tools') {
        Object.entries(GameState.inventory.tools).forEach(([id, count]) => {
            if (count > 0 && TOOLS_DATA[id]) {
                items.push({ icon: TOOLS_DATA[id].icon, name: TOOLS_DATA[id].name, count });
            }
        });
    }
    
    if (items.length === 0) {
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

// ===== 成就渲染 =====
function renderAchievements() {
    const content = document.getElementById('achievement-content');
    content.innerHTML = '';
    
    const rarityColors = { common: '#aaa', uncommon: '#4CAF50', rare: '#2196F3', epic: '#9C27B0', legendary: '#FF9800' };
    
    ACHIEVEMENTS_DATA.forEach(ach => {
        const unlocked = GameState.achievements.has(ach.id);
        const item = document.createElement('div');
        item.className = `achievement-item ${unlocked ? 'unlocked' : 'locked'}`;
        item.innerHTML = `
            <div class="ach-icon">${ach.icon}</div>
            <div class="ach-info">
                <div class="ach-name" style="color:${rarityColors[ach.rarity]}">${ach.name}</div>
                <div class="ach-desc">${ach.desc}</div>
                <div style="font-size:11px;color:#ffd700;margin-top:3px">奖励: 💰${ach.reward}</div>
            </div>
            <div style="font-size:20px">${unlocked ? '✅' : '🔒'}</div>
        `;
        content.appendChild(item);
    });
    
    const total = ACHIEVEMENTS_DATA.length;
    const unlocked = GameState.achievements.size;
    const header = document.createElement('div');
    header.style.cssText = 'text-align:center;color:#aaa;font-size:13px;margin-bottom:15px;padding:8px;background:rgba(255,255,255,0.05);border-radius:8px';
    header.textContent = `已解锁 ${unlocked}/${total} 个成就`;
    content.insertBefore(header, content.firstChild);
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

// 点击空白关闭弹窗
document.addEventListener('click', (e) => {
    if (e.target.classList.contains('modal')) {
        e.target.classList.remove('show');
    }
});
