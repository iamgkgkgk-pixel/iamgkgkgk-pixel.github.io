// ═══════════════════════════════════════════════════════
// 🔓 渐进式解锁系统 — Progressive Unlock System
// 金牌游戏设计师方案：让玩家始终有目标感和探索欲
// ═══════════════════════════════════════════════════════

const UnlockSystem = {
    // ===== 功能模块解锁配置表 =====
    // 设计原则：
    // 1. 核心玩法（种植/收获）从1级就有
    // 2. 辅助系统按难度梯度解锁
    // 3. 高级系统需要前置条件（等级+成就/货币/其他系统）
    // 4. 每2-3级解锁一个新功能，保持玩家新鲜感
    
    UNLOCK_CONFIG: {
        // ─── 左侧抽屉菜单模块 ───
        'cooking': {
            name: '加工坊',
            icon: '🍳',
            desc: '将农产品加工为高价值商品',
            unlockLevel: 5,
            unlockHint: '达到 5 级解锁',
            category: 'drawer',
            order: 1,
            previewDesc: '购买磨坊、面包房等加工建筑，将原材料变为高价值商品出售！',
            rewards: '解锁后获得 💰500 启动资金'
        },
        'gacha': {
            name: '扭蛋机',
            icon: '🎰',
            desc: '消耗代币抽取珍藏品',
            unlockLevel: 8,
            unlockHint: '达到 8 级解锁',
            category: 'drawer',
            order: 2,
            previewDesc: '投入代币，转出各种稀有珍藏品！收集季节限定物品！',
            rewards: '解锁后赠送 🪙3 枚代币'
        },
        'order': {
            name: '订单板',
            icon: '📋',
            desc: '完成NPC订单赚取声望',
            unlockLevel: 6,
            unlockHint: '达到 6 级解锁',
            category: 'drawer',
            order: 3,
            previewDesc: '接收来自各地NPC的农产品订单，按时交付赢得声望和丰厚奖励！',
            rewards: '解锁后自动接到首批订单'
        },
        'social': {
            name: '社交中心',
            icon: '👥',
            desc: '访问好友农场互助',
            unlockLevel: 10,
            unlockHint: '达到 10 级解锁',
            category: 'drawer',
            order: 4,
            previewDesc: '添加好友、访问他们的农场、互相帮助浇水施肥，排行榜一较高下！',
            rewards: '解锁后获得 💎10 社交钻石'
        },
        'deco': {
            name: '农场装饰',
            icon: '🎨',
            desc: '美化你的农场',
            unlockLevel: 12,
            unlockHint: '达到 12 级解锁',
            category: 'drawer',
            order: 5,
            previewDesc: '放置各种装饰物美化农场，提升美观度获得额外加成！',
            rewards: '解锁后获得 🌸基础装饰礼包'
        },
        'seasonal': {
            name: '季节活动',
            icon: '🎪',
            desc: '参与限时季节活动',
            unlockLevel: 15,
            unlockHint: '达到 15 级解锁',
            category: 'drawer',
            order: 6,
            previewDesc: '每个季节独有的限时活动！完成活动任务兑换限定道具和装饰！',
            rewards: '解锁后获得当季活动入场券'
        },

        // ─── 右侧更多面板模块 ───
        'achievement': {
            name: '成就系统',
            icon: '🏆',
            desc: '追踪你的农场成就',
            unlockLevel: 3,
            unlockHint: '达到 3 级解锁',
            category: 'side',
            order: 1,
            previewDesc: '完成各种成就挑战，获得金币、钻石和经验值奖励！',
            rewards: '解锁后自动展示已达成的成就'
        },
        'fishing': {
            name: '钓鱼',
            icon: '🎣',
            desc: '在池塘钓鱼',
            unlockLevel: 4,
            unlockHint: '达到 4 级解锁',
            category: 'side',
            order: 2,
            previewDesc: '来到池塘边抛竿钓鱼！通过QTE小游戏捕获各种鱼类，包括稀有传说鱼！',
            rewards: '解锁后获得 🪱基础鱼饵 ×5'
        },
        'pokedex': {
            name: '图鉴馆',
            icon: '📖',
            desc: '收集所有农场图鉴',
            unlockLevel: 5,
            unlockHint: '达到 5 级解锁',
            category: 'side',
            order: 3,
            previewDesc: '记录你遇到的每一种作物、动物和鱼类！达成里程碑获得扭蛋代币！',
            rewards: '解锁后自动收录已有图鉴'
        },
        'ranking': {
            name: '排行榜',
            icon: '📊',
            desc: '与其他农场主竞争',
            unlockLevel: 7,
            unlockHint: '达到 7 级解锁',
            category: 'side',
            order: 4,
            previewDesc: '查看本周产值、等级排名和收藏度排行，看看谁是最强农场主！',
            rewards: '解锁后可查看全服排名'
        },
        'milestone': {
            name: '里程碑',
            icon: '🎖️',
            desc: '农场发展里程碑与周报',
            unlockLevel: 10,
            unlockHint: '达到 10 级解锁',
            category: 'side',
            order: 5,
            previewDesc: '记录你的农场发展历程，查看周报统计，达成里程碑获得特殊奖励！',
            rewards: '解锁后发放首份周报'
        },

        // ─── 底部工具栏模块 ───
        'tool_fertilize': {
            name: '施肥',
            icon: '🌿',
            desc: '为作物施肥加速生长',
            unlockLevel: 2,
            unlockHint: '达到 2 级解锁',
            category: 'toolbar',
            order: 3,
            previewDesc: '使用有机肥料，加速作物生长速度20%！',
            rewards: '解锁后获得 🌿有机肥料 ×3'
        },
        'tool_feed': {
            name: '喂食',
            icon: '🥕',
            desc: '喂养你的动物',
            unlockLevel: 3,
            unlockHint: '拥有第一只动物后解锁',
            category: 'toolbar',
            order: 5,
            previewDesc: '用饲料喂养动物，提升它们的心情和产出效率！',
            rewards: ''
        },
        'tool_build': {
            name: '建造',
            icon: '🏗️',
            desc: '建造农场设施',
            unlockLevel: 5,
            unlockHint: '达到 5 级解锁',
            category: 'toolbar',
            order: 6,
            previewDesc: '建造围栏、仓库、加工坊等设施，扩展农场功能！',
            rewards: ''
        },

        // ─── 特殊系统 ───
        'breeding': {
            name: '动物培育',
            icon: '🐣',
            desc: '繁殖培育新动物',
            unlockLevel: 15,
            unlockCondition: (gs) => gs.animals.length >= 3,
            unlockHint: '达到 15 级 且 拥有3只以上动物',
            category: 'special',
            order: 1,
            previewDesc: '配对两只动物进行繁殖，产出全新品种的后代！',
            rewards: '解锁后获得 💕繁殖许可证'
        },
        'diamond_shop': {
            name: '钻石商店',
            icon: '💎',
            desc: '使用钻石购买高级道具',
            unlockLevel: 8,
            unlockHint: '达到 8 级解锁',
            category: 'special',
            order: 2,
            previewDesc: '用钻石购买加速成长、幸运药水、自动浇水等高级增益道具！',
            rewards: '解锁后获得 💎5 钻石'
        }
    },

    // ===== 解锁状态检查 =====
    isUnlocked(featureId) {
        const config = this.UNLOCK_CONFIG[featureId];
        if (!config) return true; // 未配置的默认解锁
        
        // 检查等级
        if (GameState.player.level < config.unlockLevel) return false;
        
        // 检查额外条件
        if (config.unlockCondition && !config.unlockCondition(GameState)) return false;
        
        return true;
    },

    // 获取所有锁定的功能
    getLockedFeatures() {
        return Object.entries(this.UNLOCK_CONFIG)
            .filter(([id]) => !this.isUnlocked(id))
            .map(([id, config]) => ({ id, ...config }))
            .sort((a, b) => a.unlockLevel - b.unlockLevel);
    },

    // 获取即将解锁的功能（距离当前等级最近的）
    getNextUnlocks() {
        const level = GameState.player.level;
        return this.getLockedFeatures()
            .filter(f => f.unlockLevel <= level + 5) // 5级内即将解锁
            .slice(0, 3);
    },

    // 获取指定分类的所有功能（含锁定状态）
    getFeaturesOfCategory(category) {
        return Object.entries(this.UNLOCK_CONFIG)
            .filter(([, c]) => c.category === category)
            .map(([id, config]) => ({
                id,
                ...config,
                unlocked: this.isUnlocked(id),
                levelDiff: config.unlockLevel - GameState.player.level
            }))
            .sort((a, b) => a.order - b.order);
    },

    // ===== 升级时检查新解锁 =====
    checkNewUnlocks(oldLevel, newLevel) {
        const newlyUnlocked = [];
        Object.entries(this.UNLOCK_CONFIG).forEach(([id, config]) => {
            if (config.unlockLevel > oldLevel && config.unlockLevel <= newLevel) {
                // 还需要检查额外条件
                if (!config.unlockCondition || config.unlockCondition(GameState)) {
                    newlyUnlocked.push({ id, ...config });
                }
            }
        });
        
        if (newlyUnlocked.length > 0) {
            // 逐个播放解锁动画
            newlyUnlocked.forEach((feature, i) => {
                setTimeout(() => {
                    this.showUnlockAnimation(feature);
                }, i * 2500);
            });
            
            // 发放解锁奖励
            newlyUnlocked.forEach(feature => {
                this.grantUnlockReward(feature.id);
            });

            // 刷新菜单显示
            setTimeout(() => {
                this.refreshAllMenus();
            }, newlyUnlocked.length * 2500 + 500);
        }
        
        return newlyUnlocked;
    },

    // ===== 解锁奖励发放 =====
    grantUnlockReward(featureId) {
        switch (featureId) {
            case 'cooking':
                GameState.addGold(500);
                break;
            case 'social':
                GameState.addDiamond(10);
                break;
            case 'diamond_shop':
                GameState.addDiamond(5);
                break;
            case 'tool_fertilize':
                if (!GameState.inventory.tools['fertilizer']) GameState.inventory.tools['fertilizer'] = 0;
                GameState.inventory.tools['fertilizer'] += 3;
                break;
            case 'fishing':
                // 赠送鱼饵通过通知提示
                break;
        }
    },

    // ===== 解锁动画 =====
    showUnlockAnimation(feature) {
        // 创建全屏解锁遮罩
        let overlay = document.getElementById('unlock-anim-overlay');
        if (!overlay) {
            overlay = document.createElement('div');
            overlay.id = 'unlock-anim-overlay';
            document.body.appendChild(overlay);
        }
        
        overlay.innerHTML = `
            <div class="unlock-anim-bg"></div>
            <div class="unlock-anim-content">
                <div class="unlock-anim-rays"></div>
                <div class="unlock-anim-lock">🔓</div>
                <div class="unlock-anim-icon">${feature.icon}</div>
                <div class="unlock-anim-title">新功能解锁！</div>
                <div class="unlock-anim-name">${feature.name}</div>
                <div class="unlock-anim-desc">${feature.desc}</div>
                ${feature.rewards ? `<div class="unlock-anim-reward">${feature.rewards}</div>` : ''}
                <div class="unlock-anim-hint">点击任意位置关闭</div>
            </div>
        `;
        
        overlay.style.display = 'flex';
        
        // 播放音效
        if (typeof AudioSystem !== 'undefined') {
            AudioSystem.play('achievement');
        }
        
        // 点击关闭
        const closeHandler = () => {
            overlay.style.display = 'none';
            overlay.removeEventListener('click', closeHandler);
        };
        setTimeout(() => overlay.addEventListener('click', closeHandler), 500);
        
        // 自动关闭
        setTimeout(() => {
            overlay.style.display = 'none';
            overlay.removeEventListener('click', closeHandler);
        }, 5000);
    },

    // ===== 刷新所有菜单的锁定状态 =====
    refreshAllMenus() {
        this.renderLeftDrawer();
        this.renderSideMore();
        this.renderToolbar();
    },

    // ===== 左侧抽屉菜单渲染 =====
    renderLeftDrawer() {
        const container = document.getElementById('left-drawer-items');
        if (!container) return;
        
        const features = this.getFeaturesOfCategory('drawer');
        
        container.innerHTML = '';
        
        features.forEach(feature => {
            const btn = document.createElement('button');
            btn.className = 'drawer-item';
            
            if (feature.unlocked) {
                // ── 已解锁：正常功能按钮 ──
                btn.innerHTML = `
                    <span class="drawer-item-icon">${feature.icon}</span>
                    <span class="drawer-item-label">${feature.name}</span>
                    ${this._getDrawerBadge(feature.id)}
                `;
                btn.onclick = () => {
                    this._onDrawerItemClick(feature.id);
                    toggleLeftDrawer();
                };
            } else {
                // ── 未解锁：显示锁定态 ──
                const isNearUnlock = feature.levelDiff <= 3;
                btn.classList.add('drawer-item-locked');
                if (isNearUnlock) btn.classList.add('drawer-item-near');
                
                btn.innerHTML = `
                    <span class="drawer-item-icon" style="filter:grayscale(0.8) brightness(0.5)">${feature.icon}</span>
                    <span class="drawer-item-label" style="color:#666">${isNearUnlock ? feature.name : '???'}</span>
                    <span class="drawer-item-lock">🔒</span>
                    <span class="drawer-item-level-hint">Lv.${feature.unlockLevel}</span>
                `;
                btn.onclick = () => {
                    this.showFeaturePreview(feature);
                };
            }
            
            container.appendChild(btn);
        });
    },

    // ===== 右侧更多面板渲染 =====
    renderSideMore() {
        const panel = document.getElementById('side-more-panel');
        if (!panel) return;
        
        const features = this.getFeaturesOfCategory('side');
        
        panel.innerHTML = '';
        
        features.forEach(feature => {
            const btn = document.createElement('div');
            btn.className = 'side-btn';
            
            if (feature.unlocked) {
                btn.innerHTML = feature.icon;
                btn.title = feature.name;
                btn.onclick = () => {
                    this._onSideItemClick(feature.id);
                    toggleSideMore();
                };
            } else {
                const isNearUnlock = feature.levelDiff <= 3;
                btn.classList.add('side-btn-locked');
                btn.innerHTML = `
                    <span style="filter:grayscale(0.8) brightness(0.4)">${feature.icon}</span>
                    <span class="side-btn-lock-badge">🔒</span>
                `;
                btn.title = `${isNearUnlock ? feature.name : '???'} - Lv.${feature.unlockLevel} 解锁`;
                btn.onclick = () => {
                    this.showFeaturePreview(feature);
                    toggleSideMore();
                };
            }
            
            panel.appendChild(btn);
        });
        
        // 添加"解锁路线图"入口按钮
        const roadmapBtn = document.createElement('div');
        roadmapBtn.className = 'side-btn';
        roadmapBtn.style.cssText = 'background:rgba(255,215,0,0.15);border-color:rgba(255,215,0,0.3)';
        roadmapBtn.innerHTML = '🗺️';
        roadmapBtn.title = '解锁路线图';
        roadmapBtn.onclick = () => {
            this.showRoadmapPanel();
            toggleSideMore();
        };
        panel.appendChild(roadmapBtn);
    },

    // ===== 底部工具栏渲染 =====
    renderToolbar() {
        const toolbar = document.getElementById('toolbar');
        if (!toolbar) return;
        
        // 工具按钮ID映射
        const toolMap = {
            'tool_fertilize': 'tool-fertilize',
            'tool_feed': 'tool-feed',
            'tool_build': 'tool-build'
        };
        
        Object.entries(toolMap).forEach(([featureId, domId]) => {
            const el = document.getElementById(domId);
            if (!el) return;
            
            if (this.isUnlocked(featureId)) {
                el.style.display = '';
                el.style.opacity = '1';
                el.style.pointerEvents = 'auto';
                // 移除锁定覆盖层
                const lockOverlay = el.querySelector('.tool-lock-overlay');
                if (lockOverlay) lockOverlay.remove();
            } else {
                const config = this.UNLOCK_CONFIG[featureId];
                el.style.opacity = '0.35';
                el.style.pointerEvents = 'none';
                
                // 添加锁定覆盖层
                if (!el.querySelector('.tool-lock-overlay')) {
                    const lockEl = document.createElement('div');
                    lockEl.className = 'tool-lock-overlay';
                    lockEl.innerHTML = `🔒<br><span style="font-size:8px">Lv.${config.unlockLevel}</span>`;
                    el.style.position = 'relative';
                    el.appendChild(lockEl);
                    el.style.pointerEvents = 'auto';
                    // 重新绑定点击为预览
                    el.onclick = (e) => {
                        e.stopPropagation();
                        this.showFeaturePreview({ id: featureId, ...config, unlocked: false, levelDiff: config.unlockLevel - GameState.player.level });
                    };
                }
            }
        });
    },

    // ===== 功能预览弹窗 =====
    showFeaturePreview(feature) {
        let overlay = document.getElementById('feature-preview-overlay');
        if (!overlay) {
            overlay = document.createElement('div');
            overlay.id = 'feature-preview-overlay';
            overlay.className = 'modal';
            document.body.appendChild(overlay);
        }
        
        const levelDiff = feature.unlockLevel - GameState.player.level;
        const progressPercent = Math.min(100, Math.max(0, ((GameState.player.level / feature.unlockLevel) * 100)));
        const isNear = levelDiff <= 3;
        
        overlay.innerHTML = `
            <div class="modal-box" style="position:relative;width:380px;text-align:center;border-color:${isNear ? '#ffd700' : '#555'}">
                <button class="modal-close" onclick="document.getElementById('feature-preview-overlay').classList.remove('show')">✕</button>
                
                <div style="font-size:60px;margin:10px 0;${!isNear ? 'filter:grayscale(0.6) brightness(0.5);' : ''}">${feature.icon}</div>
                
                <div style="font-size:20px;font-weight:bold;color:${isNear ? '#ffd700' : '#888'};margin-bottom:8px">
                    ${isNear ? feature.name : '??? 未知系统'}
                </div>
                
                <div style="font-size:13px;color:#aaa;margin-bottom:15px;line-height:1.6">
                    ${isNear ? feature.previewDesc : '达到指定等级后解锁此神秘功能...'}
                </div>
                
                <!-- 解锁进度条 -->
                <div style="background:rgba(255,255,255,0.08);border-radius:10px;padding:12px;margin:15px 0">
                    <div style="display:flex;justify-content:space-between;margin-bottom:6px">
                        <span style="font-size:12px;color:#aaa">解锁进度</span>
                        <span style="font-size:12px;color:${isNear ? '#ffd700' : '#666'}">
                            Lv.${GameState.player.level} / Lv.${feature.unlockLevel}
                        </span>
                    </div>
                    <div style="background:rgba(255,255,255,0.1);border-radius:5px;height:10px;overflow:hidden">
                        <div style="background:linear-gradient(90deg,${isNear ? '#ffd700,#ff8c00' : '#555,#333'});height:100%;width:${progressPercent}%;border-radius:5px;transition:width 0.5s"></div>
                    </div>
                    <div style="font-size:11px;color:#666;margin-top:6px">
                        ${levelDiff > 0 ? `还需 ${levelDiff} 级` : '满足等级条件！'}
                        ${feature.unlockCondition && feature.unlockLevel <= GameState.player.level ? '<br><span style="color:#f44336">⚠️ 尚未满足特殊条件</span>' : ''}
                    </div>
                </div>
                
                ${feature.rewards && isNear ? `
                    <div style="background:rgba(255,215,0,0.08);border:1px solid rgba(255,215,0,0.2);border-radius:8px;padding:8px;margin-top:10px">
                        <div style="font-size:11px;color:#ffd700">🎁 解锁奖励</div>
                        <div style="font-size:12px;color:#ddd;margin-top:4px">${feature.rewards}</div>
                    </div>
                ` : ''}
                
                <div style="margin-top:15px">
                    <button class="btn-primary" style="width:100%;opacity:0.6;cursor:default" disabled>
                        🔒 ${levelDiff > 0 ? `还需 ${levelDiff} 级解锁` : '条件未满足'}
                    </button>
                </div>
            </div>
        `;
        
        overlay.classList.add('show');
        
        // 点击背景关闭
        overlay.onclick = (e) => {
            if (e.target === overlay) overlay.classList.remove('show');
        };
        
        // 音效
        if (typeof AudioSystem !== 'undefined') {
            AudioSystem.play('uiOpen');
        }
    },

    // ===== 解锁路线图面板 =====
    showRoadmapPanel() {
        let overlay = document.getElementById('roadmap-overlay');
        if (!overlay) {
            overlay = document.createElement('div');
            overlay.id = 'roadmap-overlay';
            overlay.className = 'modal';
            document.body.appendChild(overlay);
        }
        
        const allFeatures = Object.entries(this.UNLOCK_CONFIG)
            .map(([id, config]) => ({
                id,
                ...config,
                unlocked: this.isUnlocked(id),
                levelDiff: config.unlockLevel - GameState.player.level
            }))
            .sort((a, b) => a.unlockLevel - b.unlockLevel);
        
        const unlockedCount = allFeatures.filter(f => f.unlocked).length;
        const totalCount = allFeatures.length;
        const overallPercent = Math.floor((unlockedCount / totalCount) * 100);
        
        // 按等级分组
        const levelGroups = {};
        allFeatures.forEach(f => {
            const key = f.unlockLevel;
            if (!levelGroups[key]) levelGroups[key] = [];
            levelGroups[key].push(f);
        });
        
        let roadmapHTML = '';
        Object.keys(levelGroups).sort((a, b) => a - b).forEach(level => {
            const features = levelGroups[level];
            const allUnlocked = features.every(f => f.unlocked);
            const currentLevel = GameState.player.level;
            const isPast = parseInt(level) <= currentLevel;
            const isCurrent = parseInt(level) > currentLevel && parseInt(level) <= currentLevel + 3;
            
            roadmapHTML += `
                <div class="roadmap-level-group ${allUnlocked ? 'roadmap-unlocked' : ''} ${isCurrent ? 'roadmap-current' : ''}" style="position:relative">
                    <!-- 等级标记 -->
                    <div class="roadmap-level-marker" style="background:${allUnlocked ? '#4CAF50' : isCurrent ? '#ffd700' : '#333'}">
                        <span style="font-size:11px;font-weight:bold;color:${allUnlocked ? '#fff' : isCurrent ? '#1a0a00' : '#666'}">
                            Lv.${level}
                        </span>
                    </div>
                    <!-- 功能卡片 -->
                    <div class="roadmap-features">
                        ${features.map(f => `
                            <div class="roadmap-feature-card ${f.unlocked ? 'roadmap-card-unlocked' : ''}" 
                                 onclick="UnlockSystem.${f.unlocked ? '_onFeatureCardClick' : 'showFeaturePreview'}(${f.unlocked ? `'${f.id}'` : JSON.stringify(f).replace(/"/g, '&quot;')})">
                                <span class="roadmap-feature-icon" style="${!f.unlocked && !isCurrent ? 'filter:grayscale(0.8) brightness(0.3)' : ''}">${f.icon}</span>
                                <span class="roadmap-feature-name" style="color:${f.unlocked ? '#4CAF50' : isCurrent ? '#ffd700' : '#555'}">
                                    ${f.unlocked || isCurrent || isPast ? f.name : '???'}
                                </span>
                                <span style="font-size:12px">${f.unlocked ? '✅' : '🔒'}</span>
                            </div>
                        `).join('')}
                    </div>
                </div>
            `;
        });
        
        overlay.innerHTML = `
            <div class="modal-box" style="position:relative;width:500px;max-height:85vh;overflow-y:auto">
                <button class="modal-close" onclick="document.getElementById('roadmap-overlay').classList.remove('show')">✕</button>
                <div class="modal-title">🗺️ 系统解锁路线图</div>
                
                <!-- 总进度 -->
                <div style="text-align:center;margin-bottom:20px">
                    <div style="font-size:28px;font-weight:bold;color:#ffd700">${overallPercent}%</div>
                    <div style="font-size:12px;color:#aaa;margin-bottom:8px">已解锁 ${unlockedCount}/${totalCount} 个系统</div>
                    <div style="background:rgba(255,255,255,0.1);border-radius:5px;height:8px;margin:0 20px">
                        <div style="background:linear-gradient(90deg,#4CAF50,#ffd700);height:100%;width:${overallPercent}%;border-radius:5px;transition:width 0.5s"></div>
                    </div>
                </div>
                
                <!-- 当前等级指示 -->
                <div style="text-align:center;margin-bottom:15px;padding:8px;background:rgba(76,175,80,0.1);border-radius:8px;border:1px solid rgba(76,175,80,0.2)">
                    <span style="color:#4CAF50;font-size:13px">📍 当前等级: <strong>Lv.${GameState.player.level}</strong> ${GameState.getLevelTitle()}</span>
                </div>
                
                <!-- 路线图时间轴 -->
                <div class="roadmap-timeline">
                    ${roadmapHTML}
                </div>
                
                <!-- 底部提示 -->
                <div style="text-align:center;margin-top:15px;font-size:11px;color:#555">
                    💡 点击锁定的系统可预览详情 · 继续升级解锁更多功能
                </div>
            </div>
        `;
        
        overlay.classList.add('show');
        overlay.onclick = (e) => {
            if (e.target === overlay) overlay.classList.remove('show');
        };
        
        // 音效
        if (typeof AudioSystem !== 'undefined') {
            AudioSystem.play('uiOpen');
        }
    },

    // ===== 升级时的 HUD 提示条 =====
    showUpcomingUnlockHint() {
        const nextUnlocks = this.getNextUnlocks();
        if (nextUnlocks.length === 0) return;
        
        // 在等级条旁边显示"即将解锁"提示
        let hint = document.getElementById('unlock-hint-bar');
        if (!hint) {
            hint = document.createElement('div');
            hint.id = 'unlock-hint-bar';
            document.body.appendChild(hint);
        }
        
        const next = nextUnlocks[0];
        const diff = next.unlockLevel - GameState.player.level;
        
        hint.innerHTML = `
            <span class="unlock-hint-icon">${next.icon}</span>
            <span class="unlock-hint-text">
                还差 <strong>${diff}</strong> 级解锁 <strong>${next.name}</strong>
            </span>
        `;
        hint.style.display = 'flex';
        
        // 8秒后隐藏
        clearTimeout(this._hintTimer);
        this._hintTimer = setTimeout(() => {
            hint.style.display = 'none';
        }, 8000);
    },

    // ===== 内部辅助方法 =====
    
    // 抽屉按钮的badge（红点/数字）
    _getDrawerBadge(featureId) {
        switch (featureId) {
            case 'gacha':
                return `<span id="gacha-token-badge" class="drawer-item-badge">${GameState.gacha?.tokens || 0}</span>`;
            case 'cooking':
                return `<span class="red-dot" id="cooking-red-dot" style="display:none"></span>`;
            case 'social':
                return `<span class="red-dot" id="social-red-dot" style="display:none"></span>`;
            case 'order':
                return `<span class="red-dot" id="order-red-dot" style="display:none"></span>`;
            default:
                return '';
        }
    },
    
    // 抽屉菜单项点击事件
    _onDrawerItemClick(featureId) {
        switch (featureId) {
            case 'gacha':
                if (typeof GachaSystem !== 'undefined') GachaSystem.showGachaPanel();
                break;
            case 'cooking':
                if (typeof CookingSystem !== 'undefined') CookingSystem.openPanel();
                break;
            case 'social':
                if (typeof SocialSystem !== 'undefined') SocialSystem.openPanel();
                break;
            case 'order':
                if (typeof OrderSystem !== 'undefined') OrderSystem.openPanel();
                break;
            case 'deco':
                if (typeof DecoSystem !== 'undefined') DecoSystem.openPanel();
                break;
            case 'seasonal':
                if (typeof SeasonalEvents !== 'undefined') SeasonalEvents.openPanel();
                break;
        }
    },
    
    // 右侧面板项点击事件
    _onSideItemClick(featureId) {
        switch (featureId) {
            case 'achievement': showModal('achievement-modal'); break;
            case 'ranking': showModal('rank-modal'); break;
            case 'pokedex': showModal('pokedex-modal'); break;
            case 'fishing': showModal('fishing-modal'); break;
            case 'milestone':
                if (typeof CelebrationSystem !== 'undefined') CelebrationSystem.openPanel();
                break;
        }
    },

    // 路线图中已解锁功能卡片点击
    _onFeatureCardClick(featureId) {
        const config = this.UNLOCK_CONFIG[featureId];
        if (!config) return;
        
        // 关闭路线图
        const overlay = document.getElementById('roadmap-overlay');
        if (overlay) overlay.classList.remove('show');
        
        // 根据分类打开对应面板
        if (config.category === 'drawer') {
            this._onDrawerItemClick(featureId);
        } else if (config.category === 'side') {
            this._onSideItemClick(featureId);
        }
    },

    // ===== 初始化 =====
    init() {
        // 首次渲染所有菜单
        this.refreshAllMenus();
        
        // Hook 升级检查：拦截 GameState.addXP
        const originalAddXP = GameState.addXP.bind(GameState);
        GameState.addXP = (amount) => {
            const oldLevel = GameState.player.level;
            originalAddXP(amount);
            const newLevel = GameState.player.level;
            
            if (newLevel > oldLevel) {
                // 检查新解锁
                this.checkNewUnlocks(oldLevel, newLevel);
                // 显示即将解锁提示
                setTimeout(() => this.showUpcomingUnlockHint(), 3000);
                // 刷新菜单
                this.refreshAllMenus();
            }
        };

        // 显示即将解锁提示（游戏启动后延迟）
        setTimeout(() => this.showUpcomingUnlockHint(), 6000);
    }
};
