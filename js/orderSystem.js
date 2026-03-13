// ===== 订单/交付系统 =====

const ORDER_NPCS = [
    { id: 'baker', name: '面包师傅老王', icon: '👨‍🍳', line: '我需要新鲜材料做面包！' },
    { id: 'chef', name: '厨娘小芳', icon: '👩‍🍳', line: '今天有客人预订了大餐~' },
    { id: 'merchant', name: '旅行商人杰克', icon: '🧳', line: '稀有货物总是最受欢迎的！' },
    { id: 'granny', name: '隔壁李奶奶', icon: '👵', line: '帮奶奶准备一些食材吧~' },
    { id: 'festival', name: '节庆委员会', icon: '🎪', line: '节日快到了，需要大量物资！' },
    { id: 'mystery', name: '神秘旅客', icon: '🎭', line: '我在寻找一些特别的东西...' }
];

// 订单模板
const ORDER_TEMPLATES = [
    // 简单订单（1-5级）
    { items: { radish: 3 }, reward: { gold: 80, xp: 20 }, level: 1, time: 600, npc: 'granny', difficulty: 'easy' },
    { items: { lettuce: 2 }, reward: { gold: 70, xp: 15 }, level: 1, time: 600, npc: 'granny', difficulty: 'easy' },
    { items: { radish: 5, lettuce: 3 }, reward: { gold: 200, xp: 40 }, level: 2, time: 900, npc: 'baker', difficulty: 'easy' },
    { items: { wheat: 3 }, reward: { gold: 150, xp: 30 }, level: 3, time: 600, npc: 'baker', difficulty: 'easy' },
    // 中等订单（5-15级）
    { items: { tomato: 3, corn: 2 }, reward: { gold: 400, xp: 60 }, level: 5, time: 1200, npc: 'chef', difficulty: 'medium' },
    { items: { wheat: 5, sunflower: 2 }, reward: { gold: 500, xp: 80 }, level: 8, time: 1200, npc: 'baker', difficulty: 'medium' },
    { items: { pumpkin: 3 }, reward: { gold: 450, xp: 70 }, level: 10, time: 900, npc: 'chef', difficulty: 'medium' },
    { items: { 'animal_chicken': 3 }, reward: { gold: 300, xp: 50 }, level: 3, time: 900, npc: 'granny', difficulty: 'medium' },
    { items: { 'animal_cow': 2 }, reward: { gold: 500, xp: 80 }, level: 8, time: 1200, npc: 'chef', difficulty: 'medium' },
    // 困难订单（15+级）
    { items: { strawberry: 3, blueberry: 2 }, reward: { gold: 1200, xp: 150, diamond: 3 }, level: 15, time: 1800, npc: 'merchant', difficulty: 'hard' },
    { items: { goldApple: 1 }, reward: { gold: 2000, xp: 300, diamond: 5 }, level: 30, time: 3600, npc: 'mystery', difficulty: 'hard' },
    { items: { rainbowRose: 1 }, reward: { gold: 3000, xp: 500, diamond: 8 }, level: 35, time: 3600, npc: 'mystery', difficulty: 'hard' },
    // 加工品订单
    { items: { flour: 3 }, reward: { gold: 300, xp: 50 }, level: 5, time: 900, npc: 'baker', difficulty: 'medium', isProcessed: true },
    { items: { bread: 2 }, reward: { gold: 600, xp: 100 }, level: 8, time: 1200, npc: 'baker', difficulty: 'medium', isProcessed: true },
    { items: { strawberry_jam: 2 }, reward: { gold: 800, xp: 120, diamond: 2 }, level: 12, time: 1500, npc: 'chef', difficulty: 'hard', isProcessed: true },
    // 组合订单
    { items: { tomato: 3, 'animal_cow': 2, wheat: 5 }, reward: { gold: 1000, xp: 200, diamond: 3 }, level: 10, time: 1800, npc: 'festival', difficulty: 'hard' },
];

const OrderSystem = {
    _currentTab: 'active',
    _initialized: false,

    initState() {
        if (this._initialized) return;
        this._initialized = true;

        if (!GameState.orders) {
            GameState.orders = {
                active: [],
                completed: [],
                totalCompleted: 0,
                totalReputation: 0,
                reputation: 0,
                lastRefresh: null,
                dailyRefreshed: false
            };
        }

        // 初始刷新
        this.refreshOrders();
        // 每5分钟检查过期
        setInterval(() => this.checkExpired(), 60000);
    },

    // 刷新订单（每天刷新，最多同时5个）
    refreshOrders() {
        const today = new Date().toDateString();
        if (GameState.orders.lastRefresh === today && GameState.orders.active.length > 0) return;

        GameState.orders.lastRefresh = today;

        // 清理已过期的
        GameState.orders.active = GameState.orders.active.filter(o => !o.expired);

        // 补充到5个
        const needed = 5 - GameState.orders.active.length;
        const level = GameState.player.level;

        for (let i = 0; i < needed; i++) {
            const order = this._generateOrder(level);
            if (order) GameState.orders.active.push(order);
        }

        GameState.save();
    },

    // 生成订单
    _generateOrder(playerLevel) {
        const eligible = ORDER_TEMPLATES.filter(t => t.level <= playerLevel);
        if (eligible.length === 0) return null;

        const template = eligible[Math.floor(Math.random() * eligible.length)];
        const npc = ORDER_NPCS.find(n => n.id === template.npc) || ORDER_NPCS[0];

        // 随机上浮奖励10-30%
        const bonus = 1 + Math.random() * 0.3;

        return {
            id: Date.now() + '_' + Math.random().toString(36).slice(2, 6),
            items: { ...template.items },
            reward: {
                gold: Math.floor((template.reward.gold || 0) * bonus),
                xp: Math.floor((template.reward.xp || 0) * bonus),
                diamond: template.reward.diamond || 0,
                reputation: Math.floor((template.difficulty === 'hard' ? 15 : template.difficulty === 'medium' ? 8 : 3) * bonus)
            },
            npc: npc,
            difficulty: template.difficulty,
            isProcessed: template.isProcessed || false,
            timeLimit: template.time,
            acceptedAt: null,
            expired: false,
            accepted: false
        };
    },

    // 接受订单
    acceptOrder(orderId) {
        const order = GameState.orders.active.find(o => o.id === orderId);
        if (!order || order.accepted) return;

        order.accepted = true;
        order.acceptedAt = Date.now();
        showNotification(`📋 接受了 ${order.npc.name} 的订单！`, 'gold');
        GameState.save();
        this.renderPanel();
    },

    // 交付订单
    deliverOrder(orderId) {
        const order = GameState.orders.active.find(o => o.id === orderId);
        if (!order || !order.accepted) return;

        // 检查是否满足
        for (const [itemId, needed] of Object.entries(order.items)) {
            const have = this._getItemCount(itemId);
            if (have < needed) {
                showNotification(`❌ 材料不足: 还需要更多物品`, '📦', 'warning');
                return;
            }
        }

        // 扣除材料
        for (const [itemId, needed] of Object.entries(order.items)) {
            this._consumeItem(itemId, needed);
        }

        // 发放奖励
        if (order.reward.gold) GameState.addGold(order.reward.gold);
        if (order.reward.xp) GameState.addXP(order.reward.xp);
        if (order.reward.diamond) GameState.addDiamond(order.reward.diamond);
        if (order.reward.reputation) {
            GameState.orders.reputation = (GameState.orders.reputation || 0) + order.reward.reputation;
            GameState.orders.totalReputation = (GameState.orders.totalReputation || 0) + order.reward.reputation;
        }

        // 记录完成
        GameState.orders.totalCompleted = (GameState.orders.totalCompleted || 0) + 1;
        GameState.orders.active = GameState.orders.active.filter(o => o.id !== orderId);
        GameState.orders.completed.push({ ...order, completedAt: Date.now() });

        // 限制历史记录
        if (GameState.orders.completed.length > 50) {
            GameState.orders.completed = GameState.orders.completed.slice(-50);
        }

        // 更新任务进度
        GameState.updateQuestProgress('order_complete');

        // 通知
        let rewardText = [];
        if (order.reward.gold) rewardText.push(`💰${order.reward.gold}`);
        if (order.reward.xp) rewardText.push(`${order.reward.xp}XP`);
        if (order.reward.diamond) rewardText.push(`💎${order.reward.diamond}`);
        if (order.reward.reputation) rewardText.push(`⭐${order.reward.reputation}声望`);
        showNotification(`✅ 订单完成！奖励：${rewardText.join(' + ')}`, 'gold');

        // 自动补充新订单
        this.refreshOrders();
        this.renderPanel();
        GameState.save();
    },

    // 检查过期
    checkExpired() {
        const now = Date.now();
        GameState.orders.active.forEach(order => {
            if (order.accepted && order.acceptedAt && !order.expired) {
                if (now - order.acceptedAt > order.timeLimit * 1000) {
                    order.expired = true;
                    showNotification(`⏰ 订单已过期：${order.npc.name}的订单`, 'warning');
                }
            }
        });
    },

    // 获取物品数量
    _getItemCount(itemId) {
        // 检查收获物
        if (GameState.inventory.harvest[itemId]) return GameState.inventory.harvest[itemId];
        // 检查动物产品
        if (itemId.startsWith('animal_') && GameState.inventory.harvest[itemId]) return GameState.inventory.harvest[itemId];
        // 检查加工产品
        if (GameState.cooking && GameState.cooking.products && GameState.cooking.products[itemId]) {
            return GameState.cooking.products[itemId];
        }
        return 0;
    },

    // 消耗物品
    _consumeItem(itemId, amount) {
        if (GameState.inventory.harvest[itemId] && GameState.inventory.harvest[itemId] >= amount) {
            GameState.inventory.harvest[itemId] -= amount;
            return;
        }
        if (GameState.cooking && GameState.cooking.products && GameState.cooking.products[itemId] >= amount) {
            GameState.cooking.products[itemId] -= amount;
            return;
        }
    },

    // 获取物品名称
    _getItemName(itemId) {
        if (CROPS_DATA[itemId]) return CROPS_DATA[itemId].icon + ' ' + CROPS_DATA[itemId].name;
        if (itemId.startsWith('animal_')) {
            const type = itemId.replace('animal_', '');
            if (ANIMALS_DATA[type]) return ANIMALS_DATA[type].product + ' ' + ANIMALS_DATA[type].productName;
        }
        if (typeof RECIPES !== 'undefined') {
            const recipe = Object.values(RECIPES).find(r => Object.keys(r.output || {}).includes(itemId) || r.id === itemId);
            if (recipe) return recipe.resultIcon + ' ' + recipe.name;
        }
        return '📦 ' + itemId;
    },

    // 打开面板
    openPanel() {
        this.initState();
        showModal('order-modal');
    },

    switchTab(tab) {
        this._currentTab = tab;
        document.querySelectorAll('#order-modal .tab-btn').forEach(b => b.classList.remove('active'));
        event.target.classList.add('active');
        this.renderPanel();
    },

    renderPanel() {
        const content = document.getElementById('order-content');
        if (!content) return;

        if (this._currentTab === 'active') this._renderActive(content);
        else if (this._currentTab === 'history') this._renderHistory(content);
        else this._renderReputation(content);
    },

    _renderActive(el) {
        const orders = GameState.orders.active.filter(o => !o.expired);
        el.innerHTML = '';

        if (orders.length === 0) {
            el.innerHTML = '<div style="text-align:center;color:#aaa;padding:30px">📋 暂无可用订单，明天会有新订单</div>';
            return;
        }

        orders.forEach(order => {
            const card = document.createElement('div');
            const diffColor = { easy: '#4CAF50', medium: '#ff9800', hard: '#f44336' }[order.difficulty];
            const diffLabel = { easy: '简单', medium: '中等', hard: '困难' }[order.difficulty];

            // 物品列表
            let itemsHtml = Object.entries(order.items).map(([id, count]) => {
                const have = this._getItemCount(id);
                const color = have >= count ? '#4CAF50' : '#f44336';
                return `<span style="margin-right:8px">${this._getItemName(id)} <span style="color:${color}">${have}/${count}</span></span>`;
            }).join('');

            // 奖励
            let rewardHtml = [];
            if (order.reward.gold) rewardHtml.push(`💰${order.reward.gold}`);
            if (order.reward.xp) rewardHtml.push(`${order.reward.xp}XP`);
            if (order.reward.diamond) rewardHtml.push(`💎${order.reward.diamond}`);
            if (order.reward.reputation) rewardHtml.push(`⭐${order.reward.reputation}`);

            // 倒计时
            let timeHtml = '';
            if (order.accepted && order.acceptedAt) {
                const remaining = Math.max(0, order.timeLimit - (Date.now() - order.acceptedAt) / 1000);
                const mins = Math.floor(remaining / 60);
                const secs = Math.floor(remaining % 60);
                timeHtml = `<span style="color:${remaining < 120 ? '#f44336' : '#aaa'};font-size:12px">⏰ ${mins}:${String(secs).padStart(2,'0')}</span>`;
            }

            // 检查能否交付
            const canDeliver = order.accepted && Object.entries(order.items).every(([id, count]) => this._getItemCount(id) >= count);

            card.style.cssText = 'background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.1);border-radius:12px;padding:14px;margin-bottom:10px';
            card.innerHTML = `
                <div style="display:flex;align-items:center;gap:10px;margin-bottom:8px">
                    <span style="font-size:28px">${order.npc.icon}</span>
                    <div style="flex:1">
                        <div style="color:#ddd;font-size:14px;font-weight:bold">${order.npc.name}</div>
                        <div style="color:#888;font-size:11px;font-style:italic">"${order.npc.line}"</div>
                    </div>
                    <span style="background:${diffColor};color:white;font-size:11px;padding:2px 8px;border-radius:10px">${diffLabel}</span>
                    ${timeHtml}
                </div>
                <div style="background:rgba(0,0,0,0.2);border-radius:8px;padding:10px;margin-bottom:8px">
                    <div style="font-size:12px;color:#aaa;margin-bottom:4px">需要材料：</div>
                    <div style="font-size:13px">${itemsHtml}</div>
                </div>
                <div style="display:flex;justify-content:space-between;align-items:center">
                    <div style="font-size:13px;color:#ffd700">${rewardHtml.join(' + ')}</div>
                    ${!order.accepted 
                        ? `<button onclick="OrderSystem.acceptOrder('${order.id}')" style="background:linear-gradient(135deg,#4CAF50,#2E7D32);border:none;color:white;padding:8px 16px;border-radius:8px;font-size:13px;cursor:pointer">接受订单</button>`
                        : canDeliver
                            ? `<button onclick="OrderSystem.deliverOrder('${order.id}')" style="background:linear-gradient(135deg,#ffd700,#ff8c00);border:none;color:#1a0a00;padding:8px 16px;border-radius:8px;font-size:13px;font-weight:bold;cursor:pointer">✅ 交付</button>`
                            : `<span style="color:#888;font-size:12px">材料准备中...</span>`
                    }
                </div>
            `;
            el.appendChild(card);
        });
    },

    _renderHistory(el) {
        const list = (GameState.orders.completed || []).slice(-20).reverse();
        el.innerHTML = '';

        if (list.length === 0) {
            el.innerHTML = '<div style="text-align:center;color:#aaa;padding:30px">📋 还没有完成过订单</div>';
            return;
        }

        el.innerHTML = `<div style="text-align:center;color:#4CAF50;font-size:14px;margin-bottom:10px">累计完成 ${GameState.orders.totalCompleted || 0} 笔订单</div>`;
        list.forEach(o => {
            const div = document.createElement('div');
            div.style.cssText = 'background:rgba(255,255,255,0.03);border-radius:8px;padding:10px;margin-bottom:6px;display:flex;align-items:center;gap:8px;opacity:0.7';
            div.innerHTML = `
                <span style="font-size:20px">${o.npc.icon}</span>
                <div style="flex:1;font-size:12px;color:#aaa">${o.npc.name}</div>
                <div style="font-size:12px;color:#ffd700">💰${o.reward.gold}</div>
                <div style="font-size:12px;color:#4CAF50">✅</div>
            `;
            el.appendChild(div);
        });
    },

    _renderReputation(el) {
        const rep = GameState.orders.reputation || 0;
        const totalRep = GameState.orders.totalReputation || 0;
        const level = rep < 50 ? { name: '新手配送员', icon: '📦', next: 50 }
            : rep < 150 ? { name: '可靠供应商', icon: '🏪', next: 150 }
            : rep < 400 ? { name: '金牌商户', icon: '🏆', next: 400 }
            : rep < 1000 ? { name: '传奇大亨', icon: '👑', next: 1000 }
            : { name: '田园之神', icon: '🌟', next: 99999 };

        const pct = Math.min(100, (rep / level.next) * 100);

        el.innerHTML = `
            <div style="text-align:center;padding:20px">
                <div style="font-size:48px;margin-bottom:10px">${level.icon}</div>
                <div style="font-size:20px;font-weight:bold;color:#ffd700;margin-bottom:5px">${level.name}</div>
                <div style="font-size:14px;color:#aaa;margin-bottom:15px">声望: ${rep} / ${level.next}</div>
                <div style="background:rgba(255,255,255,0.1);border-radius:10px;height:12px;margin-bottom:20px">
                    <div style="background:linear-gradient(90deg,#ffd700,#ff8c00);border-radius:10px;height:12px;width:${pct}%;transition:width 0.5s"></div>
                </div>
                <div style="display:grid;grid-template-columns:repeat(2,1fr);gap:12px;text-align:center">
                    <div style="background:rgba(255,255,255,0.05);border-radius:10px;padding:15px">
                        <div style="font-size:24px;color:#ffd700;font-weight:bold">${GameState.orders.totalCompleted || 0}</div>
                        <div style="font-size:12px;color:#aaa">订单完成</div>
                    </div>
                    <div style="background:rgba(255,255,255,0.05);border-radius:10px;padding:15px">
                        <div style="font-size:24px;color:#ffd700;font-weight:bold">⭐${totalRep}</div>
                        <div style="font-size:12px;color:#aaa">总声望</div>
                    </div>
                </div>
                <div style="margin-top:20px;font-size:12px;color:#888">
                    <div style="margin-bottom:5px">📦 新手配送员 (0)</div>
                    <div style="margin-bottom:5px">🏪 可靠供应商 (50)</div>
                    <div style="margin-bottom:5px">🏆 金牌商户 (150)</div>
                    <div style="margin-bottom:5px">👑 传奇大亨 (400)</div>
                    <div>🌟 田园之神 (1000)</div>
                </div>
            </div>
        `;
    }
};
