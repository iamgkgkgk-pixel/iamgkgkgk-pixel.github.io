// ===== 季节活动系统 =====

const SEASONAL_EVENTS = {
    spring_blossom: {
        id: 'spring_blossom',
        name: '🌸 春日花祭',
        season: 'spring',
        icon: '🌸',
        description: '春天来了！收集樱花瓣，兑换限定奖励！',
        currency: { id: 'cherry_petal', name: '樱花瓣', icon: '🌸' },
        tasks: [
            { id: 'plant_spring', desc: '种植春季作物5次', type: 'plant', target: 5, reward: 10 },
            { id: 'harvest_spring', desc: '收获春季作物10次', type: 'harvest', target: 10, reward: 20 },
            { id: 'water_spring', desc: '浇水15次', type: 'water', target: 15, reward: 15 },
            { id: 'order_spring', desc: '完成2个订单', type: 'order_complete', target: 2, reward: 25 }
        ],
        shop: [
            { id: 'spring_seeds', name: '春日种子礼包', icon: '🌱', cost: 30, type: 'seeds', seeds: { strawberry: 3, lettuce: 5 } },
            { id: 'spring_deco', name: '樱花树装饰', icon: '🌸', cost: 50, type: 'deco', decoId: 'cherry_tree' },
            { id: 'spring_gold', name: '春日金币', icon: '💰', cost: 15, type: 'gold', amount: 500 },
            { id: 'spring_diamond', name: '春之钻石', icon: '💎', cost: 80, type: 'diamond', amount: 10 },
            { id: 'spring_speedup', name: '春风加速包', icon: '⚡', cost: 20, type: 'tool', toolId: 'speedUp', amount: 3 }
        ]
    },
    summer_festival: {
        id: 'summer_festival',
        name: '☀️ 盛夏嘉年华',
        season: 'summer',
        icon: '☀️',
        description: '炎炎夏日，收集太阳碎片，赢取丰厚奖励！',
        currency: { id: 'sun_shard', name: '太阳碎片', icon: '☀️' },
        tasks: [
            { id: 'plant_summer', desc: '种植夏季作物5次', type: 'plant', target: 5, reward: 10 },
            { id: 'harvest_summer', desc: '收获夏季作物10次', type: 'harvest', target: 10, reward: 20 },
            { id: 'feed_summer', desc: '喂食动物8次', type: 'feed', target: 8, reward: 15 },
            { id: 'fish_summer', desc: '钓鱼5次', type: 'fish', target: 5, reward: 25 }
        ],
        shop: [
            { id: 'summer_seeds', name: '盛夏种子礼包', icon: '🌱', cost: 30, type: 'seeds', seeds: { corn: 5, tomato: 3 } },
            { id: 'summer_deco', name: '遮阳伞装饰', icon: '⛱️', cost: 50, type: 'deco', decoId: 'parasol' },
            { id: 'summer_gold', name: '夏日金币', icon: '💰', cost: 15, type: 'gold', amount: 500 },
            { id: 'summer_diamond', name: '夏之钻石', icon: '💎', cost: 80, type: 'diamond', amount: 10 },
            { id: 'summer_gacha', name: '限定扭蛋币', icon: '🪙', cost: 40, type: 'gacha', amount: 2 }
        ]
    },
    autumn_harvest: {
        id: 'autumn_harvest',
        name: '🍂 金秋丰收节',
        season: 'autumn',
        icon: '🍂',
        description: '丰收的季节！收集金叶，兑换秋季限定！',
        currency: { id: 'golden_leaf', name: '金叶', icon: '🍂' },
        tasks: [
            { id: 'harvest_autumn', desc: '收获秋季作物10次', type: 'harvest', target: 10, reward: 20 },
            { id: 'sell_autumn', desc: '出售作物获得2000金', type: 'gold', target: 2000, reward: 25 },
            { id: 'cook_autumn', desc: '加工食品3次', type: 'cook', target: 3, reward: 20 },
            { id: 'order_autumn', desc: '完成3个订单', type: 'order_complete', target: 3, reward: 30 }
        ],
        shop: [
            { id: 'autumn_seeds', name: '秋收种子礼包', icon: '🌱', cost: 30, type: 'seeds', seeds: { pumpkin: 3, wheat: 5 } },
            { id: 'autumn_deco', name: '稻草人装饰', icon: '🎃', cost: 50, type: 'deco', decoId: 'harvest_scarecrow' },
            { id: 'autumn_gold', name: '金秋金币', icon: '💰', cost: 15, type: 'gold', amount: 800 },
            { id: 'autumn_diamond', name: '秋之钻石', icon: '💎', cost: 80, type: 'diamond', amount: 10 },
            { id: 'autumn_boost', name: '丰收肥料包', icon: '🌿', cost: 25, type: 'tool', toolId: 'fertilizer', amount: 5 }
        ]
    },
    winter_wonder: {
        id: 'winter_wonder',
        name: '❄️ 冬日奇缘',
        season: 'winter',
        icon: '❄️',
        description: '银装素裹，收集雪花水晶，温暖整个冬天！',
        currency: { id: 'snow_crystal', name: '雪花水晶', icon: '❄️' },
        tasks: [
            { id: 'harvest_winter', desc: '收获冬季作物5次', type: 'harvest', target: 5, reward: 20 },
            { id: 'pet_winter', desc: '抚摸动物10次', type: 'pet', target: 10, reward: 15 },
            { id: 'order_winter', desc: '完成2个订单', type: 'order_complete', target: 2, reward: 25 },
            { id: 'gacha_winter', desc: '完成3次扭蛋', type: 'gacha', target: 3, reward: 30 }
        ],
        shop: [
            { id: 'winter_seeds', name: '冬日种子礼包', icon: '🌱', cost: 40, type: 'seeds', seeds: { goldApple: 1, rainbowRose: 1 } },
            { id: 'winter_deco', name: '雪人装饰', icon: '⛄', cost: 50, type: 'deco', decoId: 'snowman' },
            { id: 'winter_gold', name: '冬日金币', icon: '💰', cost: 15, type: 'gold', amount: 500 },
            { id: 'winter_diamond', name: '冬之钻石', icon: '💎', cost: 80, type: 'diamond', amount: 15 },
            { id: 'winter_energy', name: '热可可', icon: '☕', cost: 10, type: 'energy', amount: 50 }
        ]
    }
};

const SeasonalEvents = {
    _currentTab: 'tasks',
    _initialized: false,

    initState() {
        if (this._initialized) return;
        this._initialized = true;

        if (!GameState.seasonalEvent) {
            GameState.seasonalEvent = {
                currentEventId: null,
                currency: 0,
                tasks: {},
                purchased: [],
                lastSeason: null
            };
        }

        this._checkNewSeason();
    },

    // 检查是否需要切换活动
    _checkNewSeason() {
        const currentSeason = GameState.gameTime.season;
        const eventId = Object.keys(SEASONAL_EVENTS).find(k => SEASONAL_EVENTS[k].season === currentSeason);

        if (!eventId) return;

        if (GameState.seasonalEvent.lastSeason !== currentSeason) {
            // 新季节，重置活动
            GameState.seasonalEvent = {
                currentEventId: eventId,
                currency: 0,
                tasks: {},
                purchased: [],
                lastSeason: currentSeason
            };

            // 初始化任务进度
            const event = SEASONAL_EVENTS[eventId];
            event.tasks.forEach(t => {
                GameState.seasonalEvent.tasks[t.id] = {
                    progress: 0,
                    completed: false,
                    claimed: false
                };
            });

            showNotification(`🎪 ${event.name} 活动开始了！`, 'gold');
            GameState.save();
        }
    },

    // 获取当前活动
    getCurrentEvent() {
        const id = GameState.seasonalEvent?.currentEventId;
        return id ? SEASONAL_EVENTS[id] : null;
    },

    // 更新活动任务进度
    updateProgress(type, amount = 1) {
        const event = this.getCurrentEvent();
        if (!event) return;

        event.tasks.forEach(task => {
            const progress = GameState.seasonalEvent.tasks[task.id];
            if (!progress || progress.completed) return;

            if (task.type === type) {
                progress.progress = Math.min(task.target, progress.progress + amount);
                if (progress.progress >= task.target) {
                    progress.completed = true;
                    showNotification(`🎪 活动任务完成：${task.desc}`, 'gold');
                }
            }
        });
    },

    // 领取任务奖励
    claimTaskReward(taskId) {
        const event = this.getCurrentEvent();
        if (!event) return;

        const task = event.tasks.find(t => t.id === taskId);
        const progress = GameState.seasonalEvent.tasks[taskId];
        if (!task || !progress || !progress.completed || progress.claimed) return;

        progress.claimed = true;
        GameState.seasonalEvent.currency += task.reward;

        showNotification(`${event.currency.icon} 获得 ${task.reward} ${event.currency.name}！`, 'gold');
        GameState.save();
        this.renderPanel();
    },

    // 购买活动商品
    buyEventItem(itemId) {
        const event = this.getCurrentEvent();
        if (!event) return;

        const item = event.shop.find(s => s.id === itemId);
        if (!item) return;

        if (GameState.seasonalEvent.currency < item.cost) {
            showNotification(`${event.currency.icon} 不足！需要 ${item.cost}`, 'warning');
            return;
        }

        GameState.seasonalEvent.currency -= item.cost;
        GameState.seasonalEvent.purchased.push(itemId);

        // 发放奖品
        switch (item.type) {
            case 'gold':
                GameState.addGold(item.amount);
                break;
            case 'diamond':
                GameState.addDiamond(item.amount);
                break;
            case 'energy':
                GameState.recoverEnergy(item.amount);
                break;
            case 'seeds':
                Object.entries(item.seeds).forEach(([seedId, count]) => {
                    if (!GameState.inventory.seeds[seedId]) GameState.inventory.seeds[seedId] = 0;
                    GameState.inventory.seeds[seedId] += count;
                });
                break;
            case 'tool':
                if (!GameState.inventory.tools[item.toolId]) GameState.inventory.tools[item.toolId] = 0;
                GameState.inventory.tools[item.toolId] += item.amount;
                break;
            case 'deco':
                if (typeof DecoSystem !== 'undefined') {
                    DecoSystem.initState();
                    if (!GameState.decoration.inventory[item.decoId]) GameState.decoration.inventory[item.decoId] = 0;
                    GameState.decoration.inventory[item.decoId]++;
                }
                break;
            case 'gacha':
                GameState.gacha.tokens = (GameState.gacha.tokens || 0) + item.amount;
                break;
        }

        showNotification(`🎁 兑换了 ${item.name}！`, 'gold');
        GameState.save();
        this.renderPanel();
    },

    // 打开面板
    openPanel() {
        this.initState();
        showModal('event-modal');
    },

    switchTab(tab) {
        this._currentTab = tab;
        document.querySelectorAll('#event-modal .tab-btn').forEach(b => b.classList.remove('active'));
        event.target.classList.add('active');
        this.renderPanel();
    },

    renderPanel() {
        const content = document.getElementById('event-content');
        if (!content) return;

        const ev = this.getCurrentEvent();
        if (!ev) {
            content.innerHTML = '<div style="text-align:center;color:#aaa;padding:30px">🎪 当前没有进行中的活动</div>';
            return;
        }

        if (this._currentTab === 'tasks') this._renderTasks(content, ev);
        else if (this._currentTab === 'shop') this._renderShop(content, ev);
        else this._renderInfo(content, ev);
    },

    _renderTasks(el, ev) {
        el.innerHTML = '';

        // 活动货币显示
        const header = document.createElement('div');
        header.style.cssText = 'text-align:center;margin-bottom:15px;padding:12px;background:rgba(255,215,0,0.08);border-radius:12px;border:1px solid rgba(255,215,0,0.2)';
        header.innerHTML = `
            <div style="font-size:16px;color:#ffd700;font-weight:bold">${ev.currency.icon} ${GameState.seasonalEvent.currency} ${ev.currency.name}</div>
            <div style="font-size:12px;color:#aaa;margin-top:4px">完成任务获取活动货币</div>
        `;
        el.appendChild(header);

        ev.tasks.forEach(task => {
            const progress = GameState.seasonalEvent.tasks[task.id] || { progress: 0, completed: false, claimed: false };
            const pct = Math.min(100, (progress.progress / task.target) * 100);

            const div = document.createElement('div');
            div.className = 'quest-item';
            if (progress.completed) div.style.borderLeftColor = '#ffd700';
            if (progress.claimed) div.style.opacity = '0.5';

            div.innerHTML = `
                <div class="quest-name">${task.desc}</div>
                <div class="quest-progress-bg"><div class="quest-progress" style="width:${pct}%"></div></div>
                <div style="display:flex;justify-content:space-between;align-items:center;margin-top:5px">
                    <div class="quest-reward">${ev.currency.icon} +${task.reward} ${ev.currency.name}</div>
                    <div style="font-size:12px;color:#aaa">${progress.progress}/${task.target}</div>
                </div>
                ${progress.completed && !progress.claimed ? `<button class="btn-gold" style="margin-top:8px;width:100%;padding:6px" onclick="SeasonalEvents.claimTaskReward('${task.id}')">领取奖励</button>` : ''}
                ${progress.claimed ? '<div style="color:#4CAF50;font-size:12px;margin-top:5px">✅ 已领取</div>' : ''}
            `;
            el.appendChild(div);
        });
    },

    _renderShop(el, ev) {
        el.innerHTML = '';

        // 货币
        const balance = document.createElement('div');
        balance.style.cssText = 'text-align:center;margin-bottom:15px;padding:10px;background:rgba(255,215,0,0.08);border-radius:10px';
        balance.innerHTML = `<span style="font-size:16px;color:#ffd700">${ev.currency.icon} 当前: ${GameState.seasonalEvent.currency} ${ev.currency.name}</span>`;
        el.appendChild(balance);

        const grid = document.createElement('div');
        grid.style.cssText = 'display:grid;grid-template-columns:repeat(2,1fr);gap:10px';
        el.appendChild(grid);

        ev.shop.forEach(item => {
            const canAfford = GameState.seasonalEvent.currency >= item.cost;
            const card = document.createElement('div');
            card.className = 'shop-item';
            card.style.cssText = `padding:15px;${!canAfford ? 'opacity:0.5;' : ''}`;

            card.innerHTML = `
                <div class="item-icon" style="font-size:32px">${item.icon}</div>
                <div class="item-name" style="font-size:13px;margin:6px 0;color:#ddd">${item.name}</div>
                <div class="item-price" style="color:#ffd700">${ev.currency.icon} ${item.cost}</div>
            `;

            if (canAfford) {
                card.onclick = () => this.buyEventItem(item.id);
                card.style.cursor = 'pointer';
            }

            grid.appendChild(card);
        });
    },

    _renderInfo(el, ev) {
        const completed = Object.values(GameState.seasonalEvent.tasks).filter(t => t.claimed).length;
        const total = ev.tasks.length;

        el.innerHTML = `
            <div style="text-align:center;padding:20px">
                <div style="font-size:60px;margin-bottom:10px">${ev.icon}</div>
                <div style="font-size:22px;font-weight:bold;color:#ffd700;margin-bottom:5px">${ev.name}</div>
                <div style="font-size:14px;color:#aaa;margin-bottom:15px;line-height:1.6">${ev.description}</div>
                <div style="display:grid;grid-template-columns:repeat(2,1fr);gap:12px;margin-bottom:20px">
                    <div style="background:rgba(255,255,255,0.05);border-radius:10px;padding:15px">
                        <div style="font-size:24px;font-weight:bold;color:#4CAF50">${completed}/${total}</div>
                        <div style="font-size:12px;color:#aaa">任务完成</div>
                    </div>
                    <div style="background:rgba(255,255,255,0.05);border-radius:10px;padding:15px">
                        <div style="font-size:24px;font-weight:bold;color:#ffd700">${ev.currency.icon} ${GameState.seasonalEvent.currency}</div>
                        <div style="font-size:12px;color:#aaa">${ev.currency.name}</div>
                    </div>
                </div>
                <div style="font-size:12px;color:#888;text-align:left;background:rgba(255,255,255,0.03);border-radius:8px;padding:12px">
                    <div style="font-weight:bold;margin-bottom:8px;color:#aaa">📖 活动规则</div>
                    <div>• 每个季节都有限定活动</div>
                    <div>• 完成活动任务获取活动货币</div>
                    <div>• 活动货币可在活动商店兑换限定奖励</div>
                    <div>• 季节切换后活动将重置</div>
                </div>
            </div>
        `;
    }
};
