// ===== 农场装饰布局系统 =====

const DecoSystem = {
    _currentTab: 'inventory',
    _initialized: false,
    _placingItem: null,

    initState() {
        if (this._initialized) return;
        this._initialized = true;

        if (!GameState.decoration) {
            GameState.decoration = {
                placed: [],         // 已放置装饰 [{id, itemId, x, z, rotation}]
                inventory: {},      // 装饰物库存 {itemId: count}
                beautyScore: 0,
                totalPlaced: 0
            };
        }

        this._calculateBeauty();
    },

    // 所有可放置的装饰品（含扭蛋获得的+商店购买的）
    getAllDecoItems() {
        const items = {};

        // 商店装饰
        Object.values(DECO_DATA).forEach(d => {
            items[d.id] = { id: d.id, name: d.name, icon: d.icon, source: 'shop', beauty: 5 };
        });

        // 扭蛋装饰
        if (typeof GACHA_ITEMS !== 'undefined') {
            Object.values(GACHA_ITEMS).forEach(g => {
                if (g.category === 'deco') {
                    items[g.id] = { id: g.id, name: g.name, icon: g.icon, source: 'gacha', beauty: g.rarity === 'legendary' ? 20 : g.rarity === 'rare' ? 10 : 5, rarity: g.rarity };
                }
            });
        }

        return items;
    },

    // 放置装饰
    placeDecoration(itemId) {
        const inv = GameState.decoration.inventory;
        if (!inv[itemId] || inv[itemId] <= 0) {
            showNotification('没有该装饰品！', '🎨', 'warning');
            return;
        }

        // 随机位置（3D场景范围）
        const x = (Math.random() - 0.5) * 16;
        const z = (Math.random() - 0.5) * 16;
        const rotation = Math.random() * Math.PI * 2;

        GameState.decoration.placed.push({
            id: Date.now().toString(36),
            itemId: itemId,
            x: x,
            z: z,
            rotation: rotation
        });

        inv[itemId]--;
        GameState.decoration.totalPlaced++;
        this._calculateBeauty();

        showNotification(`🎨 放置了装饰品！美观度: ${GameState.decoration.beautyScore}`, 'gold');
        GameState.save();
        this.renderPanel();
    },

    // 移除装饰
    removeDecoration(placeId) {
        const idx = GameState.decoration.placed.findIndex(p => p.id === placeId);
        if (idx === -1) return;

        const item = GameState.decoration.placed[idx];
        GameState.decoration.placed.splice(idx, 1);

        // 返还到库存
        if (!GameState.decoration.inventory[item.itemId]) GameState.decoration.inventory[item.itemId] = 0;
        GameState.decoration.inventory[item.itemId]++;

        this._calculateBeauty();
        showNotification('📦 装饰已收回到库存', '🎨');
        GameState.save();
        this.renderPanel();
    },

    // 计算美观度
    _calculateBeauty() {
        const allItems = this.getAllDecoItems();
        let score = 0;
        const uniqueTypes = new Set();

        GameState.decoration.placed.forEach(p => {
            const item = allItems[p.itemId];
            if (item) {
                score += item.beauty || 5;
                uniqueTypes.add(p.itemId);
            }
        });

        // 多样性加成
        score += uniqueTypes.size * 3;

        GameState.decoration.beautyScore = score;
        return score;
    },

    // 获取美观度等级
    _getBeautyLevel() {
        const score = GameState.decoration.beautyScore || 0;
        if (score >= 200) return { name: '仙境花园', icon: '🏰', color: '#ff44ff' };
        if (score >= 100) return { name: '美丽庄园', icon: '🌸', color: '#ffd700' };
        if (score >= 50) return { name: '温馨农场', icon: '🏡', color: '#4CAF50' };
        if (score >= 20) return { name: '朴素田园', icon: '🌿', color: '#aaa' };
        return { name: '空旷荒地', icon: '🌾', color: '#666' };
    },

    // 打开面板
    openPanel() {
        this.initState();
        showModal('deco-modal');
    },

    switchTab(tab) {
        this._currentTab = tab;
        document.querySelectorAll('#deco-modal .tab-btn').forEach(b => b.classList.remove('active'));
        event.target.classList.add('active');
        this.renderPanel();
    },

    renderPanel() {
        const content = document.getElementById('deco-content');
        if (!content) return;

        if (this._currentTab === 'inventory') this._renderInventory(content);
        else if (this._currentTab === 'placed') this._renderPlaced(content);
        else this._renderBeauty(content);
    },

    _renderInventory(el) {
        const allItems = this.getAllDecoItems();
        const inv = GameState.decoration.inventory || {};
        el.innerHTML = '';

        // 总览
        const summary = document.createElement('div');
        summary.style.cssText = 'text-align:center;margin-bottom:12px;padding:8px;background:rgba(255,255,255,0.05);border-radius:8px;font-size:13px;color:#aaa';
        summary.textContent = `装饰品库存 — 已放置 ${GameState.decoration.placed.length} 件`;
        el.appendChild(summary);

        const grid = document.createElement('div');
        grid.style.cssText = 'display:grid;grid-template-columns:repeat(3,1fr);gap:8px';
        el.appendChild(grid);

        let hasItems = false;

        Object.entries(inv).forEach(([itemId, count]) => {
            if (count <= 0) return;
            hasItems = true;
            const item = allItems[itemId];
            if (!item) return;

            const card = document.createElement('div');
            const rarityBorder = item.rarity === 'legendary' ? '#ff44ff' : item.rarity === 'rare' ? '#ffd700' : 'rgba(255,255,255,0.1)';
            card.style.cssText = `background:rgba(255,255,255,0.05);border:1px solid ${rarityBorder};border-radius:10px;padding:12px;text-align:center;cursor:pointer;transition:all 0.2s`;
            card.innerHTML = `
                <div style="font-size:28px;margin-bottom:4px">${item.icon}</div>
                <div style="font-size:12px;color:#ddd">${item.name}</div>
                <div style="font-size:11px;color:#ffd700">×${count}</div>
                <div style="font-size:10px;color:#4CAF50;margin-top:2px">美观+${item.beauty}</div>
            `;
            card.onclick = () => this.placeDecoration(itemId);
            grid.appendChild(card);
        });

        if (!hasItems) {
            grid.innerHTML = '<div style="grid-column:1/-1;text-align:center;color:#aaa;padding:20px">暂无装饰品<br><span style="font-size:12px">通过扭蛋机和商店获得</span></div>';
        }
    },

    _renderPlaced(el) {
        const allItems = this.getAllDecoItems();
        const placed = GameState.decoration.placed || [];
        el.innerHTML = '';

        if (placed.length === 0) {
            el.innerHTML = '<div style="text-align:center;color:#aaa;padding:30px">🎨 还没有放置任何装饰</div>';
            return;
        }

        placed.forEach(p => {
            const item = allItems[p.itemId] || { icon: '❓', name: '未知' };
            const div = document.createElement('div');
            div.style.cssText = 'display:flex;align-items:center;gap:10px;background:rgba(255,255,255,0.05);border-radius:8px;padding:10px;margin-bottom:6px';
            div.innerHTML = `
                <span style="font-size:24px">${item.icon}</span>
                <div style="flex:1">
                    <div style="font-size:13px;color:#ddd">${item.name}</div>
                    <div style="font-size:11px;color:#888">位置: (${p.x.toFixed(1)}, ${p.z.toFixed(1)})</div>
                </div>
                <button onclick="DecoSystem.removeDecoration('${p.id}')" style="background:rgba(255,0,0,0.2);border:1px solid rgba(255,0,0,0.3);border-radius:8px;padding:6px 10px;font-size:12px;color:#ff6666;cursor:pointer">收回</button>
            `;
            el.appendChild(div);
        });
    },

    _renderBeauty(el) {
        const level = this._getBeautyLevel();
        const score = GameState.decoration.beautyScore || 0;
        const placed = GameState.decoration.placed.length;

        el.innerHTML = `
            <div style="text-align:center;padding:20px">
                <div style="font-size:60px;margin-bottom:10px">${level.icon}</div>
                <div style="font-size:22px;font-weight:bold;color:${level.color};margin-bottom:5px">${level.name}</div>
                <div style="font-size:32px;color:#ffd700;font-weight:bold;margin:10px 0">${score}</div>
                <div style="font-size:13px;color:#aaa;margin-bottom:20px">美观度分数</div>
                <div style="display:grid;grid-template-columns:repeat(2,1fr);gap:10px">
                    <div style="background:rgba(255,255,255,0.05);border-radius:10px;padding:12px">
                        <div style="font-size:20px;font-weight:bold;color:#4CAF50">${placed}</div>
                        <div style="font-size:12px;color:#aaa">装饰品数量</div>
                    </div>
                    <div style="background:rgba(255,255,255,0.05);border-radius:10px;padding:12px">
                        <div style="font-size:20px;font-weight:bold;color:#4CAF50">${new Set(GameState.decoration.placed.map(p => p.itemId)).size}</div>
                        <div style="font-size:12px;color:#aaa">装饰种类</div>
                    </div>
                </div>
                <div style="margin-top:20px;font-size:12px;color:#888;text-align:left">
                    <div style="margin-bottom:8px;font-weight:bold;color:#aaa">🏆 美观等级</div>
                    <div style="margin-bottom:3px">🌾 空旷荒地 (0-19)</div>
                    <div style="margin-bottom:3px">🌿 朴素田园 (20-49)</div>
                    <div style="margin-bottom:3px">🏡 温馨农场 (50-99)</div>
                    <div style="margin-bottom:3px">🌸 美丽庄园 (100-199)</div>
                    <div>🏰 仙境花园 (200+)</div>
                </div>
            </div>
        `;
    }
};
