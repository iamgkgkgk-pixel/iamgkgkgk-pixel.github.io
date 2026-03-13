// ===== 加工/烹饪系统 =====

// 加工建筑数据
const PROCESSING_BUILDINGS = {
    flour_mill: {
        id: 'flour_mill',
        name: '磨坊',
        icon: '🏭',
        description: '将小麦研磨成面粉',
        price: 800,
        unlockLevel: 5,
        slots: 1,
        category: 'basic'
    },
    bakery: {
        id: 'bakery',
        name: '面包房',
        icon: '🍞',
        description: '烘焙各种面包和糕点',
        price: 1500,
        unlockLevel: 8,
        slots: 2,
        category: 'basic'
    },
    jam_workshop: {
        id: 'jam_workshop',
        name: '果酱工坊',
        icon: '🍯',
        description: '制作新鲜水果果酱',
        price: 1200,
        unlockLevel: 10,
        slots: 2,
        category: 'basic'
    },
    dairy: {
        id: 'dairy',
        name: '奶制品坊',
        icon: '🧀',
        description: '加工牛奶为奶酪、黄油等',
        price: 2000,
        unlockLevel: 12,
        slots: 2,
        category: 'advanced'
    },
    kitchen: {
        id: 'kitchen',
        name: '农家厨房',
        icon: '🍳',
        description: '烹饪精美菜肴',
        price: 3000,
        unlockLevel: 15,
        slots: 3,
        category: 'advanced'
    },
    winery: {
        id: 'winery',
        name: '酿酒坊',
        icon: '🍷',
        description: '酿造果酒和特饮',
        price: 5000,
        unlockLevel: 20,
        slots: 2,
        category: 'premium'
    }
};

// 加工配方数据
const RECIPES = {
    // === 磨坊配方 ===
    flour: {
        id: 'flour',
        name: '面粉',
        icon: '🌾➡️',
        resultIcon: '🫓',
        building: 'flour_mill',
        ingredients: { wheat: 3 },
        time: 60,          // 60秒
        output: { flour: 2 },
        sellPrice: 30,
        xp: 8,
        unlockLevel: 5,
        description: '基础面粉，烘焙必需品'
    },
    corn_flour: {
        id: 'corn_flour',
        name: '玉米粉',
        icon: '🌽➡️',
        resultIcon: '🟡',
        building: 'flour_mill',
        ingredients: { corn: 2 },
        time: 60,
        output: { corn_flour: 2 },
        sellPrice: 40,
        xp: 10,
        unlockLevel: 6,
        description: '金色玉米研磨而成'
    },
    sunflower_oil: {
        id: 'sunflower_oil',
        name: '葵花油',
        icon: '🌻➡️',
        resultIcon: '🫒',
        building: 'flour_mill',
        ingredients: { sunflower: 2 },
        time: 90,
        output: { sunflower_oil: 1 },
        sellPrice: 60,
        xp: 15,
        unlockLevel: 9,
        description: '天然健康的葵花籽油'
    },

    // === 面包房配方 ===
    bread: {
        id: 'bread',
        name: '田园面包',
        icon: '🫓➡️',
        resultIcon: '🍞',
        building: 'bakery',
        ingredients: { flour: 2 },
        time: 120,
        output: { bread: 1 },
        sellPrice: 80,
        xp: 15,
        unlockLevel: 8,
        description: '香喷喷的新鲜面包'
    },
    corn_bread: {
        id: 'corn_bread',
        name: '玉米面包',
        icon: '🟡➡️',
        resultIcon: '🍞',
        building: 'bakery',
        ingredients: { corn_flour: 2 },
        time: 120,
        output: { corn_bread: 1 },
        sellPrice: 90,
        xp: 18,
        unlockLevel: 9,
        description: '金黄色的玉米面包'
    },
    cake: {
        id: 'cake',
        name: '奶油蛋糕',
        icon: '🫓🥛➡️',
        resultIcon: '🎂',
        building: 'bakery',
        ingredients: { flour: 3, animal_cow: 2 },
        time: 180,
        output: { cake: 1 },
        sellPrice: 200,
        xp: 35,
        unlockLevel: 13,
        description: '甜蜜的奶油蛋糕'
    },
    cookie: {
        id: 'cookie',
        name: '曲奇饼干',
        icon: '🫓🥚➡️',
        resultIcon: '🍪',
        building: 'bakery',
        ingredients: { flour: 1, animal_chicken: 2 },
        time: 90,
        output: { cookie: 2 },
        sellPrice: 50,
        xp: 12,
        unlockLevel: 8,
        description: '酥脆可口的曲奇'
    },

    // === 果酱工坊配方 ===
    strawberry_jam: {
        id: 'strawberry_jam',
        name: '草莓果酱',
        icon: '🍓➡️',
        resultIcon: '🍓🫙',
        building: 'jam_workshop',
        ingredients: { strawberry: 3 },
        time: 150,
        output: { strawberry_jam: 2 },
        sellPrice: 120,
        xp: 25,
        unlockLevel: 15,
        description: '甜蜜的草莓果酱'
    },
    blueberry_jam: {
        id: 'blueberry_jam',
        name: '蓝莓果酱',
        icon: '🫐➡️',
        resultIcon: '🫐🫙',
        building: 'jam_workshop',
        ingredients: { blueberry: 3 },
        time: 150,
        output: { blueberry_jam: 2 },
        sellPrice: 140,
        xp: 28,
        unlockLevel: 15,
        description: '浓郁的蓝莓果酱'
    },
    pumpkin_pie_filling: {
        id: 'pumpkin_pie_filling',
        name: '南瓜泥',
        icon: '🎃➡️',
        resultIcon: '🟠',
        building: 'jam_workshop',
        ingredients: { pumpkin: 2 },
        time: 90,
        output: { pumpkin_filling: 2 },
        sellPrice: 70,
        xp: 15,
        unlockLevel: 10,
        description: '丝滑的南瓜泥'
    },

    // === 奶制品坊配方 ===
    cheese: {
        id: 'cheese',
        name: '农家奶酪',
        icon: '🥛➡️',
        resultIcon: '🧀',
        building: 'dairy',
        ingredients: { animal_cow: 3 },
        time: 180,
        output: { cheese: 1 },
        sellPrice: 180,
        xp: 30,
        unlockLevel: 12,
        description: '醇香的农家奶酪'
    },
    butter: {
        id: 'butter',
        name: '黄油',
        icon: '🥛➡️',
        resultIcon: '🧈',
        building: 'dairy',
        ingredients: { animal_cow: 2 },
        time: 120,
        output: { butter: 1 },
        sellPrice: 120,
        xp: 20,
        unlockLevel: 12,
        description: '浓郁的天然黄油'
    },
    yogurt: {
        id: 'yogurt',
        name: '酸奶',
        icon: '🥛➡️',
        resultIcon: '🥛✨',
        building: 'dairy',
        ingredients: { animal_cow: 2 },
        time: 240,
        output: { yogurt: 2 },
        sellPrice: 90,
        xp: 22,
        unlockLevel: 13,
        description: '健康美味的酸奶'
    },

    // === 农家厨房配方 ===
    salad: {
        id: 'salad',
        name: '田园沙拉',
        icon: '🥬🍅➡️',
        resultIcon: '🥗',
        building: 'kitchen',
        ingredients: { lettuce: 2, tomato: 1 },
        time: 60,
        output: { salad: 1 },
        sellPrice: 100,
        xp: 20,
        unlockLevel: 15,
        description: '新鲜健康的田园沙拉'
    },
    pumpkin_soup: {
        id: 'pumpkin_soup',
        name: '南瓜浓汤',
        icon: '🟠🥛➡️',
        resultIcon: '🍲',
        building: 'kitchen',
        ingredients: { pumpkin_filling: 2, animal_cow: 1 },
        time: 120,
        output: { pumpkin_soup: 1 },
        sellPrice: 150,
        xp: 28,
        unlockLevel: 15,
        description: '温暖的南瓜浓汤'
    },
    pizza: {
        id: 'pizza',
        name: '农场披萨',
        icon: '🫓🍅🧀➡️',
        resultIcon: '🍕',
        building: 'kitchen',
        ingredients: { flour: 2, tomato: 2, cheese: 1 },
        time: 180,
        output: { pizza: 1 },
        sellPrice: 350,
        xp: 50,
        unlockLevel: 18,
        description: '用料十足的农场披萨'
    },
    golden_feast: {
        id: 'golden_feast',
        name: '黄金盛宴',
        icon: '🍎✨➡️',
        resultIcon: '🍽️✨',
        building: 'kitchen',
        ingredients: { goldApple: 1, butter: 1, flour: 2 },
        time: 300,
        output: { golden_feast: 1 },
        sellPrice: 2000,
        xp: 200,
        unlockLevel: 30,
        description: '传说中的黄金盛宴，极致美味'
    },

    // === 酿酒坊配方 ===
    strawberry_wine: {
        id: 'strawberry_wine',
        name: '草莓酒',
        icon: '🍓➡️',
        resultIcon: '🍷',
        building: 'winery',
        ingredients: { strawberry: 5 },
        time: 300,
        output: { strawberry_wine: 1 },
        sellPrice: 500,
        xp: 60,
        unlockLevel: 20,
        description: '甜美的草莓果酒'
    },
    blueberry_wine: {
        id: 'blueberry_wine',
        name: '蓝莓酒',
        icon: '🫐➡️',
        resultIcon: '🍷',
        building: 'winery',
        ingredients: { blueberry: 5 },
        time: 300,
        output: { blueberry_wine: 1 },
        sellPrice: 550,
        xp: 65,
        unlockLevel: 20,
        description: '浓郁的蓝莓果酒'
    },
    rainbow_elixir: {
        id: 'rainbow_elixir',
        name: '彩虹仙酿',
        icon: '🌹✨➡️',
        resultIcon: '🧪🌈',
        building: 'winery',
        ingredients: { rainbowRose: 1, strawberry_wine: 1 },
        time: 600,
        output: { rainbow_elixir: 1 },
        sellPrice: 5000,
        xp: 500,
        unlockLevel: 35,
        description: '传说中的彩虹仙酿，价值连城'
    }
};

// 加工系统主对象
const CookingSystem = {
    // 获取玩家已购买的建筑列表
    getOwnedBuildings() {
        return GameState.cooking ? (GameState.cooking.buildings || []) : [];
    },

    // 获取加工队列
    getQueue() {
        return GameState.cooking ? (GameState.cooking.queue || []) : [];
    },

    // 获取已完成产品
    getProducts() {
        return GameState.cooking ? (GameState.cooking.products || {}) : {};
    },

    // 初始化加工系统状态（在GameState.init中调用）
    initState() {
        if (!GameState.cooking) {
            GameState.cooking = {
                buildings: [],      // 已购买的建筑ID列表
                queue: [],          // 加工队列：[{recipeId, buildingId, startTime, duration}]
                products: {},       // 已完成产品：{productId: count}
                totalProcessed: 0   // 总加工次数
            };
        }
    },

    // 购买建筑
    buyBuilding(buildingId) {
        const building = PROCESSING_BUILDINGS[buildingId];
        if (!building) return;

        if (GameState.player.level < building.unlockLevel) {
            showNotification(`需要达到 ${building.unlockLevel} 级才能购买！`, '🔒', 'warning');
            return;
        }

        const owned = this.getOwnedBuildings();
        if (owned.includes(buildingId)) {
            showNotification('已经拥有这个建筑了！', '🏭', 'warning');
            return;
        }

        if (!GameState.spendGold(building.price)) {
            showNotification(`金币不足！需要 ${building.price} 金币`, '💰', 'warning');
            return;
        }

        GameState.cooking.buildings.push(buildingId);
        showNotification(`${building.icon} 购买了 ${building.name}！`, 'gold');
        GameState.addXP(building.price / 10);
        GameState.save();

        // 刷新UI
        this.renderPanel();
    },

    // 检查是否有足够的材料
    hasIngredients(recipe) {
        for (const [itemId, amount] of Object.entries(recipe.ingredients)) {
            const available = this.getItemCount(itemId);
            if (available < amount) return false;
        }
        return true;
    },

    // 获取物品数量（从背包harvest和products中统一查找）
    getItemCount(itemId) {
        let count = 0;
        // 从收获物背包
        if (GameState.inventory.harvest[itemId]) {
            count += GameState.inventory.harvest[itemId];
        }
        // 从加工产品
        const products = this.getProducts();
        if (products[itemId]) {
            count += products[itemId];
        }
        return count;
    },

    // 消耗材料
    consumeIngredients(recipe) {
        for (const [itemId, amount] of Object.entries(recipe.ingredients)) {
            let remaining = amount;

            // 优先从收获物背包扣除
            if (GameState.inventory.harvest[itemId] && GameState.inventory.harvest[itemId] > 0) {
                const deduct = Math.min(GameState.inventory.harvest[itemId], remaining);
                GameState.inventory.harvest[itemId] -= deduct;
                remaining -= deduct;
            }

            // 再从加工产品扣除
            if (remaining > 0 && GameState.cooking.products[itemId]) {
                const deduct = Math.min(GameState.cooking.products[itemId], remaining);
                GameState.cooking.products[itemId] -= deduct;
                remaining -= deduct;
            }
        }
    },

    // 获取建筑当前使用的槽位数
    getBuildingUsedSlots(buildingId) {
        const queue = this.getQueue();
        return queue.filter(q => q.buildingId === buildingId && !q.completed).length;
    },

    // 开始加工
    startProcessing(recipeId) {
        const recipe = RECIPES[recipeId];
        if (!recipe) return;

        const building = PROCESSING_BUILDINGS[recipe.building];
        if (!building) return;

        // 检查是否拥有建筑
        if (!this.getOwnedBuildings().includes(recipe.building)) {
            showNotification(`需要先购买 ${building.name}！`, '🏭', 'warning');
            return;
        }

        // 检查等级
        if (GameState.player.level < recipe.unlockLevel) {
            showNotification(`需要达到 ${recipe.unlockLevel} 级才能制作！`, '🔒', 'warning');
            return;
        }

        // 检查槽位
        const usedSlots = this.getBuildingUsedSlots(recipe.building);
        if (usedSlots >= building.slots) {
            showNotification(`${building.name} 的加工槽位已满！`, '⏳', 'warning');
            return;
        }

        // 检查材料
        if (!this.hasIngredients(recipe)) {
            showNotification('材料不足！', '📦', 'warning');
            return;
        }

        // 消耗能量
        if (!GameState.spendEnergy(3)) return;

        // 消耗材料
        this.consumeIngredients(recipe);

        // 添加到队列
        const queueItem = {
            id: Date.now() + '_' + Math.random().toString(36).substr(2, 5),
            recipeId: recipeId,
            buildingId: recipe.building,
            startTime: Date.now(),
            duration: recipe.time * 1000,  // 转为毫秒
            completed: false
        };

        GameState.cooking.queue.push(queueItem);

        showNotification(`${recipe.resultIcon} 开始制作 ${recipe.name}！`, '🔥');

        // 更新任务进度
        GameState.updateQuestProgress('process');
        GameState.cooking.totalProcessed = (GameState.cooking.totalProcessed || 0) + 1;

        GameState.save();
        this.renderPanel();
    },

    // 收取完成的产品
    collectProduct(queueItemId) {
        const queue = this.getQueue();
        const item = queue.find(q => q.id === queueItemId);
        if (!item) return;

        const recipe = RECIPES[item.recipeId];
        if (!recipe) return;

        // 检查是否完成
        const now = Date.now();
        if (now - item.startTime < item.duration) {
            showNotification('还在加工中，请稍等！', '⏳', 'warning');
            return;
        }

        // 添加产品到产品库
        for (const [productId, amount] of Object.entries(recipe.output)) {
            if (!GameState.cooking.products[productId]) {
                GameState.cooking.products[productId] = 0;
            }
            GameState.cooking.products[productId] += amount;
        }

        // 经验
        GameState.addXP(recipe.xp);

        // 从队列移除
        GameState.cooking.queue = queue.filter(q => q.id !== queueItemId);

        showNotification(`${recipe.resultIcon} ${recipe.name} 制作完成！`, 'gold');
        GameState.save();
        this.renderPanel();
    },

    // 一键收取所有完成产品
    collectAllProducts() {
        const queue = this.getQueue();
        const now = Date.now();
        let collected = 0;

        const completedItems = queue.filter(q => now - q.startTime >= q.duration);

        completedItems.forEach(item => {
            const recipe = RECIPES[item.recipeId];
            if (!recipe) return;

            for (const [productId, amount] of Object.entries(recipe.output)) {
                if (!GameState.cooking.products[productId]) {
                    GameState.cooking.products[productId] = 0;
                }
                GameState.cooking.products[productId] += amount;
            }
            GameState.addXP(recipe.xp);
            collected++;
        });

        if (collected > 0) {
            GameState.cooking.queue = queue.filter(q => now - q.startTime < q.duration);
            showNotification(`✅ 收取了 ${collected} 个加工产品！`, 'gold');
            GameState.save();
            this.renderPanel();
        } else {
            showNotification('没有已完成的产品可收取', '📦', 'warning');
        }
    },

    // 出售加工产品
    sellProduct(productId, amount) {
        const products = this.getProducts();
        if (!products[productId] || products[productId] < amount) {
            showNotification('产品数量不足！', '📦', 'warning');
            return;
        }

        // 查找对应配方获取价格
        const recipe = Object.values(RECIPES).find(r => Object.keys(r.output).includes(productId));
        if (!recipe) return;

        const gold = recipe.sellPrice * amount;
        GameState.cooking.products[productId] -= amount;
        GameState.addGold(gold);
        GameState.addXP(Math.floor(gold / 20));

        showNotification(`💰 出售了 ${amount} 个 ${recipe.name}，获得 ${gold} 金币！`, 'gold');
        GameState.save();
        this.renderPanel();
    },

    // 一键出售所有加工产品
    sellAllProducts() {
        const products = this.getProducts();
        let totalGold = 0;
        let totalItems = 0;

        Object.entries(products).forEach(([productId, count]) => {
            if (count <= 0) return;
            const recipe = Object.values(RECIPES).find(r => Object.keys(r.output).includes(productId));
            if (!recipe) return;
            totalGold += recipe.sellPrice * count;
            totalItems += count;
            GameState.cooking.products[productId] = 0;
        });

        if (totalGold > 0) {
            GameState.addGold(totalGold);
            GameState.addXP(Math.floor(totalGold / 20));
            showNotification(`💰 出售了 ${totalItems} 件加工产品，获得 ${totalGold} 金币！`, 'gold');
            GameState.save();
            this.renderPanel();
        } else {
            showNotification('没有可出售的加工产品！', '📦', 'warning');
        }
    },

    // 更新加工进度（在gameLoop中调用）
    update(deltaTime) {
        if (!GameState.cooking) return;

        const queue = this.getQueue();
        const now = Date.now();
        let hasNewComplete = false;

        queue.forEach(item => {
            if (!item.completed && now - item.startTime >= item.duration) {
                item.completed = true;
                hasNewComplete = true;
                const recipe = RECIPES[item.recipeId];
                if (recipe) {
                    showNotification(`${recipe.resultIcon} ${recipe.name} 加工完成！去收取吧！`, '🔔');
                }
            }
        });

        if (hasNewComplete) {
            // 更新HUD红点
            this.updateBadge();
        }
    },

    // 更新加工完成红点
    updateBadge() {
        const badge = document.getElementById('cooking-red-dot');
        if (!badge) return;

        const queue = this.getQueue();
        const now = Date.now();
        const hasComplete = queue.some(q => now - q.startTime >= q.duration);
        badge.style.display = hasComplete ? 'block' : 'none';
    },

    // ===== UI渲染 =====

    // 当前面板标签
    currentTab: 'buildings',

    // 渲染加工面板
    renderPanel() {
        CookingSystem.initState();
        const content = document.getElementById('cooking-content');
        if (!content) return;

        switch(this.currentTab) {
            case 'buildings': this.renderBuildingsTab(content); break;
            case 'recipes': this.renderRecipesTab(content); break;
            case 'queue': this.renderQueueTab(content); break;
            case 'products': this.renderProductsTab(content); break;
        }
    },

    // 渲染建筑标签页
    renderBuildingsTab(content) {
        content.innerHTML = '';
        const owned = this.getOwnedBuildings();

        // 进度总览
        const headerDiv = document.createElement('div');
        headerDiv.style.cssText = 'text-align:center;margin-bottom:15px;padding:10px;background:rgba(255,140,0,0.08);border-radius:10px;border:1px solid rgba(255,140,0,0.2)';
        headerDiv.innerHTML = `
            <div style="font-size:14px;color:#ff8c00;margin-bottom:4px">🏭 已拥有建筑</div>
            <div style="font-size:12px;color:#aaa">${owned.length} / ${Object.keys(PROCESSING_BUILDINGS).length}</div>
        `;
        content.appendChild(headerDiv);

        const grid = document.createElement('div');
        grid.className = 'shop-grid';
        grid.style.gridTemplateColumns = 'repeat(2, 1fr)';
        content.appendChild(grid);

        Object.values(PROCESSING_BUILDINGS).forEach(building => {
            const isOwned = owned.includes(building.id);
            const locked = GameState.player.level < building.unlockLevel;

            const card = document.createElement('div');
            card.className = 'shop-item';
            card.style.cssText = `
                padding:15px;
                border-color: ${isOwned ? 'rgba(76,175,80,0.5)' : locked ? 'rgba(255,255,255,0.05)' : 'rgba(255,140,0,0.3)'};
                background: ${isOwned ? 'rgba(76,175,80,0.08)' : 'rgba(255,255,255,0.02)'};
                ${locked ? 'opacity:0.5;' : ''}
            `;

            const usedSlots = isOwned ? this.getBuildingUsedSlots(building.id) : 0;

            card.innerHTML = `
                <div class="item-icon" style="font-size:36px">${building.icon}</div>
                <div class="item-name" style="font-size:13px;font-weight:bold;margin:6px 0;color:${isOwned ? '#4CAF50' : '#ddd'}">${building.name}</div>
                <div style="font-size:11px;color:#aaa;min-height:24px">${building.description}</div>
                <div style="font-size:11px;color:#aaa;margin-top:4px">槽位: ${building.slots}</div>
                ${isOwned ? `<div style="color:#4CAF50;font-size:12px;margin-top:4px">✅ 已拥有 (${usedSlots}/${building.slots}使用中)</div>` :
                    locked ? `<div class="item-locked">🔒 需要${building.unlockLevel}级</div>` :
                    `<div class="item-price" style="color:#ffd700;font-size:14px;margin-top:6px">💰 ${building.price}</div>`}
            `;

            if (!isOwned && !locked) {
                card.onclick = () => CookingSystem.buyBuilding(building.id);
                card.style.cursor = 'pointer';
            }

            grid.appendChild(card);
        });
    },

    // 渲染配方标签页
    renderRecipesTab(content) {
        content.innerHTML = '';
        const owned = this.getOwnedBuildings();

        // 按建筑分组
        const buildingGroups = {};
        Object.values(RECIPES).forEach(recipe => {
            if (!buildingGroups[recipe.building]) {
                buildingGroups[recipe.building] = [];
            }
            buildingGroups[recipe.building].push(recipe);
        });

        // 遍历每个建筑的配方
        Object.entries(buildingGroups).forEach(([buildingId, recipes]) => {
            const building = PROCESSING_BUILDINGS[buildingId];
            if (!building) return;

            const isOwned = owned.includes(buildingId);

            const section = document.createElement('div');
            section.style.cssText = 'margin-bottom:20px';

            const sectionTitle = document.createElement('div');
            sectionTitle.style.cssText = `font-size:14px;font-weight:bold;color:${isOwned ? '#ff8c00' : '#555'};margin-bottom:10px;padding:6px 10px;background:rgba(255,140,0,0.05);border-radius:8px;display:flex;align-items:center;gap:8px`;
            sectionTitle.innerHTML = `${building.icon} ${building.name} ${!isOwned ? '<span style="font-size:11px;color:#666">(未购买)</span>' : ''}`;
            section.appendChild(sectionTitle);

            const grid = document.createElement('div');
            grid.style.cssText = 'display:grid;grid-template-columns:1fr;gap:8px';
            section.appendChild(grid);

            recipes.forEach(recipe => {
                const canMake = isOwned && this.hasIngredients(recipe) && GameState.player.level >= recipe.unlockLevel;
                const locked = GameState.player.level < recipe.unlockLevel;

                const card = document.createElement('div');
                card.style.cssText = `
                    display:flex;align-items:center;gap:12px;padding:10px;border-radius:10px;
                    background:${canMake ? 'rgba(255,140,0,0.08)' : 'rgba(255,255,255,0.03)'};
                    border:1px solid ${canMake ? 'rgba(255,140,0,0.3)' : 'rgba(255,255,255,0.08)'};
                    cursor:${canMake ? 'pointer' : 'default'};
                    transition:all 0.2s;
                    ${locked || !isOwned ? 'opacity:0.5;' : ''}
                `;

                // 材料文本
                const ingredientTexts = Object.entries(recipe.ingredients).map(([itemId, amount]) => {
                    const available = this.getItemCount(itemId);
                    const enough = available >= amount;
                    const itemName = this.getItemName(itemId);
                    return `<span style="color:${enough ? '#4CAF50' : '#f44336'}">${itemName}×${amount}</span>`;
                }).join(' + ');

                card.innerHTML = `
                    <div style="font-size:28px;flex-shrink:0">${recipe.resultIcon}</div>
                    <div style="flex:1;min-width:0">
                        <div style="font-size:13px;font-weight:bold;color:#ddd">${recipe.name}</div>
                        <div style="font-size:11px;color:#aaa;margin:3px 0">${recipe.description}</div>
                        <div style="font-size:11px;margin-top:3px">材料: ${ingredientTexts}</div>
                        <div style="display:flex;gap:12px;margin-top:3px;font-size:11px">
                            <span style="color:#aaa">⏱ ${formatTime(recipe.time)}</span>
                            <span style="color:#ffd700">💰 ${recipe.sellPrice}</span>
                            <span style="color:#00bfff">+${recipe.xp}XP</span>
                        </div>
                    </div>
                    ${locked ? '<div style="font-size:11px;color:#f44336">🔒 ' + recipe.unlockLevel + '级</div>' :
                        canMake ? '<div style="font-size:22px;cursor:pointer" title="开始制作">▶️</div>' : ''}
                `;

                if (canMake) {
                    card.onmouseenter = () => card.style.borderColor = 'rgba(255,140,0,0.6)';
                    card.onmouseleave = () => card.style.borderColor = 'rgba(255,140,0,0.3)';
                    card.onclick = () => CookingSystem.startProcessing(recipe.id);
                }

                grid.appendChild(card);
            });

            content.appendChild(section);
        });
    },

    // 渲染加工队列
    renderQueueTab(content) {
        content.innerHTML = '';
        const queue = this.getQueue();
        const now = Date.now();

        // 一键收取按钮
        const hasComplete = queue.some(q => now - q.startTime >= q.duration);
        if (hasComplete) {
            const collectAllBtn = document.createElement('button');
            collectAllBtn.className = 'btn-gold';
            collectAllBtn.style.cssText = 'width:100%;margin-bottom:15px;padding:10px';
            collectAllBtn.textContent = '📦 一键收取全部完成品';
            collectAllBtn.onclick = () => CookingSystem.collectAllProducts();
            content.appendChild(collectAllBtn);
        }

        if (queue.length === 0) {
            content.innerHTML += '<div style="color:#aaa;text-align:center;padding:30px">暂无进行中的加工<br><span style="font-size:12px">去"配方"页签选择食谱开始制作吧！</span></div>';
            return;
        }

        queue.forEach(item => {
            const recipe = RECIPES[item.recipeId];
            if (!recipe) return;

            const elapsed = now - item.startTime;
            const progress = Math.min(1, elapsed / item.duration);
            const isComplete = progress >= 1;
            const remaining = Math.max(0, (item.duration - elapsed) / 1000);

            const card = document.createElement('div');
            card.style.cssText = `
                display:flex;align-items:center;gap:12px;padding:12px;border-radius:10px;
                background:${isComplete ? 'rgba(76,175,80,0.1)' : 'rgba(255,255,255,0.03)'};
                border:1px solid ${isComplete ? 'rgba(76,175,80,0.4)' : 'rgba(255,255,255,0.08)'};
                margin-bottom:10px;
            `;

            const building = PROCESSING_BUILDINGS[item.buildingId];

            card.innerHTML = `
                <div style="font-size:32px">${recipe.resultIcon}</div>
                <div style="flex:1">
                    <div style="font-size:13px;font-weight:bold;color:${isComplete ? '#4CAF50' : '#ddd'}">${recipe.name}</div>
                    <div style="font-size:11px;color:#aaa">${building ? building.icon + ' ' + building.name : ''}</div>
                    <div style="margin-top:6px">
                        <div style="background:rgba(255,255,255,0.1);border-radius:5px;height:6px;overflow:hidden">
                            <div style="background:${isComplete ? '#4CAF50' : 'linear-gradient(90deg, #ff8c00, #ffd700)'};height:6px;width:${progress * 100}%;transition:width 1s;border-radius:5px"></div>
                        </div>
                        <div style="font-size:11px;color:${isComplete ? '#4CAF50' : '#aaa'};margin-top:3px">
                            ${isComplete ? '✅ 已完成！点击收取' : '⏳ 剩余 ' + formatTime(remaining)}
                        </div>
                    </div>
                </div>
                ${isComplete ? '<div style="font-size:28px;cursor:pointer" title="收取">📦</div>' : ''}
            `;

            if (isComplete) {
                card.style.cursor = 'pointer';
                card.onclick = () => CookingSystem.collectProduct(item.id);
            }

            content.appendChild(card);
        });
    },

    // 渲染产品仓库
    renderProductsTab(content) {
        content.innerHTML = '';
        const products = this.getProducts();

        // 一键出售按钮
        const hasProducts = Object.values(products).some(c => c > 0);
        if (hasProducts) {
            const sellAllBtn = document.createElement('button');
            sellAllBtn.className = 'btn-gold';
            sellAllBtn.style.cssText = 'width:100%;margin-bottom:15px;padding:10px';
            sellAllBtn.textContent = '💰 一键出售全部产品';
            sellAllBtn.onclick = () => CookingSystem.sellAllProducts();
            content.appendChild(sellAllBtn);
        }

        const grid = document.createElement('div');
        grid.className = 'inventory-grid';
        grid.style.gridTemplateColumns = 'repeat(3, 1fr)';
        content.appendChild(grid);

        let hasItems = false;
        Object.entries(products).forEach(([productId, count]) => {
            if (count <= 0) return;
            hasItems = true;

            const recipe = Object.values(RECIPES).find(r => Object.keys(r.output).includes(productId));
            if (!recipe) return;

            const slot = document.createElement('div');
            slot.className = 'inv-slot';
            slot.style.cssText = 'cursor:pointer;border-color:rgba(255,140,0,0.3)';
            slot.innerHTML = `
                <div class="slot-icon" style="font-size:28px">${recipe.resultIcon}</div>
                <div class="slot-name">${recipe.name}</div>
                <div class="slot-count" style="color:#ff8c00">×${count}</div>
                <div style="color:#ffd700;font-size:10px">💰${recipe.sellPrice}/个</div>
            `;
            slot.onclick = () => CookingSystem.sellProduct(productId, 1);
            slot.title = '点击出售1个';

            grid.appendChild(slot);
        });

        if (!hasItems) {
            grid.innerHTML = '<div style="color:#aaa;text-align:center;padding:20px;grid-column:1/-1">暂无加工产品<br><span style="font-size:12px">开始加工制作产品吧！</span></div>';
        }
    },

    // 辅助：获取物品名称
    getItemName(itemId) {
        // 先找作物
        if (CROPS_DATA[itemId]) return CROPS_DATA[itemId].icon + CROPS_DATA[itemId].name;
        // 找动物产品
        if (itemId.startsWith('animal_')) {
            const animalType = itemId.replace('animal_', '');
            if (ANIMALS_DATA[animalType]) return ANIMALS_DATA[animalType].product + ANIMALS_DATA[animalType].productName;
        }
        // 找加工产品
        const recipe = Object.values(RECIPES).find(r => Object.keys(r.output).includes(itemId));
        if (recipe) return recipe.resultIcon + recipe.name;
        return itemId;
    },

    // 打开加工面板
    openPanel() {
        CookingSystem.initState();
        showModal('cooking-modal');
    },

    // 切换标签页
    switchTab(tab) {
        this.currentTab = tab;
        document.querySelectorAll('#cooking-modal .tab-btn').forEach(btn => btn.classList.remove('active'));
        event.target.classList.add('active');
        this.renderPanel();
    }
};
