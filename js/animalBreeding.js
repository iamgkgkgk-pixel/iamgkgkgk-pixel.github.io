// ===== 动物培育系统 =====

const BreedingSystem = {
    _currentTab: 'status',
    _initialized: false,

    // 繁殖组合表
    BREED_PAIRS: {
        'chicken+chicken': { baby: 'chicken', time: 300, cost: 200, chance: 0.8 },
        'duck+duck': { baby: 'duck', time: 360, cost: 300, chance: 0.75 },
        'cow+cow': { baby: 'cow', time: 600, cost: 800, chance: 0.6 },
        'sheep+sheep': { baby: 'sheep', time: 480, cost: 600, chance: 0.65 },
        'pig+pig': { baby: 'pig', time: 420, cost: 500, chance: 0.7 },
        'chicken+duck': { baby: 'duck', time: 400, cost: 400, chance: 0.5 },
        'cow+sheep': { baby: 'alpaca', time: 900, cost: 2000, chance: 0.3 }
    },

    // 亲密度等级
    INTIMACY_LEVELS: [
        { level: 0, name: '陌生', icon: '💔', min: 0 },
        { level: 1, name: '认识', icon: '🤝', min: 20 },
        { level: 2, name: '友好', icon: '💛', min: 50 },
        { level: 3, name: '亲密', icon: '💕', min: 80 },
        { level: 4, name: '挚爱', icon: '❤️', min: 100 },
        { level: 5, name: '灵魂伴侣', icon: '💞', min: 150 }
    ],

    // 亲密度加成
    INTIMACY_BONUS: {
        20: '产出速度+10%',
        50: '产出数量+1',
        80: '解锁繁殖',
        100: '产出速度+25%',
        150: '产出金色品质概率+10%'
    },

    initState() {
        if (this._initialized) return;
        this._initialized = true;

        if (!GameState.breeding) {
            GameState.breeding = {
                active: null,       // 当前繁殖中 {parent1Id, parent2Id, startTime, duration, result}
                history: [],        // 繁殖历史
                totalBred: 0
            };
        }
    },

    // 获取亲密度等级
    getIntimacyLevel(intimacy) {
        let result = this.INTIMACY_LEVELS[0];
        for (const lv of this.INTIMACY_LEVELS) {
            if (intimacy >= lv.min) result = lv;
        }
        return result;
    },

    // 提升亲密度
    addIntimacy(animalId, amount) {
        const animal = GameState.animals.find(a => a.id === animalId);
        if (!animal) return;

        const oldLevel = this.getIntimacyLevel(animal.intimacy || 0);
        animal.intimacy = Math.min(200, (animal.intimacy || 0) + amount);
        const newLevel = this.getIntimacyLevel(animal.intimacy);

        if (newLevel.level > oldLevel.level) {
            const animalData = ANIMALS_DATA[animal.type];
            showNotification(`${newLevel.icon} ${animal.name}的亲密度提升到「${newLevel.name}」！`, 'gold');
            
            // 亲密度里程碑奖励
            if (newLevel.min === 50) {
                showNotification(`🎁 亲密度奖励：产出数量+1！`, 'gold');
            } else if (newLevel.min === 80) {
                showNotification(`🎁 解锁繁殖功能！`, 'gold');
            }
        }
    },

    // 检查是否可以繁殖
    canBreed(animal1Id, animal2Id) {
        if (GameState.breeding.active) return { ok: false, reason: '已有繁殖进行中' };

        const a1 = GameState.animals.find(a => a.id === animal1Id);
        const a2 = GameState.animals.find(a => a.id === animal2Id);

        if (!a1 || !a2) return { ok: false, reason: '动物不存在' };
        if (!a1.grown || !a2.grown) return { ok: false, reason: '动物需要先长大' };
        if ((a1.intimacy || 0) < 80 || (a2.intimacy || 0) < 80) return { ok: false, reason: '亲密度需≥80' };

        const key1 = `${a1.type}+${a2.type}`;
        const key2 = `${a2.type}+${a1.type}`;
        const pair = this.BREED_PAIRS[key1] || this.BREED_PAIRS[key2];

        if (!pair) return { ok: false, reason: '这两只动物不能繁殖' };
        if (!GameState.spendGold(pair.cost)) return { ok: false, reason: `金币不足（需要${pair.cost}）` };

        // 恢复金币（先检查，实际在startBreeding中扣）
        GameState.player.gold += pair.cost;
        return { ok: true, pair: pair, key: key1 in this.BREED_PAIRS ? key1 : key2 };
    },

    // 开始繁殖
    startBreeding(animal1Id, animal2Id) {
        const check = this.canBreed(animal1Id, animal2Id);
        if (!check.ok) {
            showNotification(`❌ ${check.reason}`, '🐣', 'warning');
            return;
        }

        const pair = check.pair;

        // 扣除金币
        if (!GameState.spendGold(pair.cost)) return;

        // 判断是否成功
        const success = Math.random() < pair.chance;

        GameState.breeding.active = {
            parent1Id: animal1Id,
            parent2Id: animal2Id,
            startTime: Date.now(),
            duration: pair.time * 1000,
            babyType: pair.baby,
            willSucceed: success
        };

        const a1 = GameState.animals.find(a => a.id === animal1Id);
        const a2 = GameState.animals.find(a => a.id === animal2Id);
        showNotification(`🐣 ${a1.name} 和 ${a2.name} 开始培育宝宝！`, 'gold');
        GameState.save();
        this.renderPanel();
    },

    // 检查繁殖完成
    checkBreedingComplete() {
        const breeding = GameState.breeding.active;
        if (!breeding) return;

        if (Date.now() >= breeding.startTime + breeding.duration) {
            if (breeding.willSucceed) {
                // 成功！添加新动物
                const animalData = ANIMALS_DATA[breeding.babyType];
                if (animalData) {
                    const baby = {
                        id: Date.now(),
                        type: breeding.babyType,
                        name: animalData.name + '宝宝',
                        grown: false,
                        growProgress: 0,
                        mood: 100,
                        intimacy: 20, // 宝宝出生就有基础亲密度
                        hasProduct: false,
                        productProgress: 0,
                        fedToday: false,
                        pettedToday: false,
                        isBred: true
                    };

                    GameState.animals.push(baby);
                    GameState.player.totalAnimals = GameState.animals.length;

                    if (typeof Scene3D !== 'undefined') {
                        Scene3D.addAnimalMesh(baby);
                    }

                    showNotification(`🎉 繁殖成功！${animalData.icon} ${baby.name} 诞生了！`, 'gold');
                }
            } else {
                showNotification('😢 繁殖失败了...下次一定会成功的！', '🐣', 'warning');
            }

            GameState.breeding.totalBred = (GameState.breeding.totalBred || 0) + 1;
            GameState.breeding.history.push({
                type: breeding.babyType,
                success: breeding.willSucceed,
                time: Date.now()
            });

            // 限制历史
            if (GameState.breeding.history.length > 20) {
                GameState.breeding.history = GameState.breeding.history.slice(-20);
            }

            GameState.breeding.active = null;
            GameState.save();
        }
    },

    // 打开面板
    openPanel() {
        this.initState();
        this.checkBreedingComplete();
        showModal('breeding-modal');
    },

    switchTab(tab) {
        this._currentTab = tab;
        document.querySelectorAll('#breeding-modal .tab-btn').forEach(b => b.classList.remove('active'));
        event.target.classList.add('active');
        this.renderPanel();
    },

    renderPanel() {
        const content = document.getElementById('breeding-content');
        if (!content) return;

        this.checkBreedingComplete();

        if (this._currentTab === 'status') this._renderStatus(content);
        else if (this._currentTab === 'breed') this._renderBreed(content);
        else this._renderHistory(content);
    },

    _renderStatus(el) {
        el.innerHTML = '';

        if (GameState.animals.length === 0) {
            el.innerHTML = '<div style="text-align:center;color:#aaa;padding:30px">🐾 还没有动物，去商店购买吧！</div>';
            return;
        }

        GameState.animals.forEach(animal => {
            const animalData = ANIMALS_DATA[animal.type];
            if (!animalData) return;

            const intimacy = animal.intimacy || 0;
            const level = this.getIntimacyLevel(intimacy);
            const nextLevel = this.INTIMACY_LEVELS.find(l => l.min > intimacy);
            const pct = nextLevel ? Math.min(100, ((intimacy - level.min) / (nextLevel.min - level.min)) * 100) : 100;

            const card = document.createElement('div');
            card.style.cssText = 'background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.1);border-radius:12px;padding:14px;margin-bottom:10px;display:flex;gap:12px;align-items:center';

            card.innerHTML = `
                <div style="font-size:36px">${animalData.icon}</div>
                <div style="flex:1">
                    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:4px">
                        <span style="font-size:14px;color:#ddd;font-weight:bold">${animal.name}</span>
                        <span style="font-size:12px;color:${level.min >= 80 ? '#ffd700' : '#aaa'}">${level.icon} ${level.name}</span>
                    </div>
                    <div style="font-size:11px;color:#aaa;margin-bottom:4px">亲密度: ${intimacy} ${nextLevel ? `(下一级: ${nextLevel.min})` : '(MAX)'}</div>
                    <div style="background:rgba(255,255,255,0.1);border-radius:5px;height:6px">
                        <div style="background:linear-gradient(90deg,#ff6b8a,#ff3366);border-radius:5px;height:6px;width:${pct}%;transition:width 0.3s"></div>
                    </div>
                    ${animal.isBred ? '<div style="font-size:10px;color:#ff6b8a;margin-top:3px">🐣 繁殖出生</div>' : ''}
                    ${intimacy >= 80 ? '<div style="font-size:10px;color:#4CAF50;margin-top:3px">✅ 可参与繁殖</div>' : '<div style="font-size:10px;color:#888;margin-top:3px">亲密度80以上可繁殖</div>'}
                </div>
            `;
            el.appendChild(card);
        });

        // 亲密度提升方法
        const tips = document.createElement('div');
        tips.style.cssText = 'margin-top:15px;padding:12px;background:rgba(255,255,255,0.03);border-radius:8px;font-size:12px;color:#888';
        tips.innerHTML = `
            <div style="font-weight:bold;margin-bottom:6px;color:#aaa">💡 提升亲密度的方法</div>
            <div>• 每日喂食 +5</div>
            <div>• 抚摸 +3</div>
            <div>• 收集产出 +2</div>
            <div>• 繁殖宝宝出生就有20基础亲密度</div>
        `;
        el.appendChild(tips);
    },

    _renderBreed(el) {
        el.innerHTML = '';

        // 当前繁殖状态
        const active = GameState.breeding.active;
        if (active) {
            const remaining = Math.max(0, (active.startTime + active.duration - Date.now()) / 1000);
            const pct = Math.min(100, ((Date.now() - active.startTime) / active.duration) * 100);
            const a1 = GameState.animals.find(a => a.id === active.parent1Id);
            const a2 = GameState.animals.find(a => a.id === active.parent2Id);

            el.innerHTML = `
                <div style="text-align:center;padding:20px">
                    <div style="font-size:48px;margin-bottom:10px">🐣</div>
                    <div style="font-size:18px;font-weight:bold;color:#ffd700;margin-bottom:8px">繁殖进行中...</div>
                    <div style="font-size:14px;color:#aaa;margin-bottom:15px">
                        ${a1 ? a1.name : '??'} ❤️ ${a2 ? a2.name : '??'}
                    </div>
                    <div style="background:rgba(255,255,255,0.1);border-radius:10px;height:12px;margin-bottom:8px">
                        <div style="background:linear-gradient(90deg,#ff6b8a,#ff3366);border-radius:10px;height:12px;width:${pct}%;transition:width 1s"></div>
                    </div>
                    <div style="font-size:13px;color:#aaa">${remaining > 0 ? `剩余 ${Math.floor(remaining/60)}分${Math.floor(remaining%60)}秒` : '即将完成！'}</div>
                </div>
            `;
            return;
        }

        // 选择繁殖对象
        const eligible = GameState.animals.filter(a => a.grown && (a.intimacy || 0) >= 80);

        if (eligible.length < 2) {
            el.innerHTML = `
                <div style="text-align:center;padding:30px;color:#aaa">
                    <div style="font-size:40px;margin-bottom:10px">🐣</div>
                    <div style="font-size:14px;margin-bottom:8px">需要至少2只亲密度≥80的成年动物</div>
                    <div style="font-size:12px">当前符合条件: ${eligible.length}只</div>
                </div>
            `;
            return;
        }

        el.innerHTML = '<div style="font-size:14px;color:#aaa;margin-bottom:12px;text-align:center">选择两只动物进行繁殖</div>';

        // 可用组合
        for (let i = 0; i < eligible.length; i++) {
            for (let j = i + 1; j < eligible.length; j++) {
                const a1 = eligible[i];
                const a2 = eligible[j];
                const key1 = `${a1.type}+${a2.type}`;
                const key2 = `${a2.type}+${a1.type}`;
                const pair = this.BREED_PAIRS[key1] || this.BREED_PAIRS[key2];
                if (!pair) continue;

                const d1 = ANIMALS_DATA[a1.type];
                const d2 = ANIMALS_DATA[a2.type];
                const babyData = ANIMALS_DATA[pair.baby];

                const card = document.createElement('div');
                card.style.cssText = 'background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.1);border-radius:12px;padding:14px;margin-bottom:10px';
                card.innerHTML = `
                    <div style="display:flex;align-items:center;justify-content:center;gap:10px;margin-bottom:8px">
                        <span style="font-size:28px">${d1.icon}</span>
                        <span style="font-size:14px;color:#ff6b8a">❤️</span>
                        <span style="font-size:28px">${d2.icon}</span>
                        <span style="font-size:14px;color:#aaa">→</span>
                        <span style="font-size:28px">${babyData ? babyData.icon : '❓'}</span>
                    </div>
                    <div style="text-align:center;font-size:13px;color:#ddd;margin-bottom:4px">${a1.name} × ${a2.name}</div>
                    <div style="text-align:center;font-size:12px;color:#aaa;margin-bottom:8px">
                        成功率: ${Math.floor(pair.chance * 100)}% | 耗时: ${Math.floor(pair.time/60)}分钟 | 费用: 💰${pair.cost}
                    </div>
                    <div style="text-align:center">
                        <button onclick="BreedingSystem.startBreeding(${a1.id}, ${a2.id})" style="background:linear-gradient(135deg,#ff6b8a,#ff3366);border:none;color:white;padding:8px 20px;border-radius:8px;font-size:13px;cursor:pointer">🐣 开始繁殖</button>
                    </div>
                `;
                el.appendChild(card);
            }
        }
    },

    _renderHistory(el) {
        const history = (GameState.breeding.history || []).slice(-10).reverse();
        el.innerHTML = '';

        const stats = document.createElement('div');
        stats.style.cssText = 'text-align:center;margin-bottom:15px;padding:12px;background:rgba(255,255,255,0.05);border-radius:10px';
        stats.innerHTML = `<div style="font-size:14px;color:#ffd700">累计繁殖 ${GameState.breeding.totalBred || 0} 次</div>`;
        el.appendChild(stats);

        if (history.length === 0) {
            el.innerHTML += '<div style="text-align:center;color:#aaa;padding:20px">暂无繁殖记录</div>';
            return;
        }

        history.forEach(h => {
            const animalData = ANIMALS_DATA[h.type];
            const div = document.createElement('div');
            div.style.cssText = 'background:rgba(255,255,255,0.03);border-radius:8px;padding:10px;margin-bottom:6px;display:flex;align-items:center;gap:10px';
            div.innerHTML = `
                <span style="font-size:24px">${animalData ? animalData.icon : '❓'}</span>
                <div style="flex:1;font-size:13px;color:#aaa">${animalData ? animalData.name : '未知'}</div>
                <span style="font-size:13px;color:${h.success ? '#4CAF50' : '#f44336'}">${h.success ? '✅ 成功' : '❌ 失败'}</span>
            `;
            el.appendChild(div);
        });
    }
};
