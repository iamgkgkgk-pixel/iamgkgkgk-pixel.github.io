// ═══════════════════════════════════════════════════════
// 🚀 ViralBoost — 爆品升级系统
// 金牌制作人方案：让每一秒都有反馈，让玩家欲罢不能
// ═══════════════════════════════════════════════════════

const ViralBoost = {

    // =============================================
    // 🔥 1. 离线收益弹窗（Welcome Back Dialog）
    // 痛点：原版离线只有一行通知，毫无惊喜感
    // 方案：全屏弹窗 + 逐行动画展示 + 观看广告双倍
    // =============================================
    showOfflineReward(elapsed) {
        if (elapsed < 300) return; // <5分钟不弹

        const minutes = Math.floor(elapsed / 60);
        const hours = Math.floor(minutes / 60);
        const mins = minutes % 60;
        const timeStr = hours > 0 ? `${hours}小时${mins}分钟` : `${mins}分钟`;

        // 计算离线收益
        let goldEarned = 0;
        let cropsReady = 0;
        let animalsReady = 0;
        let energyRecovered = Math.min(Math.floor(elapsed / 72), GameState.player.maxEnergy - GameState.player.energy);

        GameState.plots.forEach(plot => {
            if (plot.state === 'ready') cropsReady++;
        });
        GameState.animals.forEach(animal => {
            if (animal.hasProduct) animalsReady++;
        });

        // 基于时间的被动金币（每小时100基础）
        goldEarned = Math.floor((elapsed / 3600) * 100 * Math.max(1, GameState.player.level * 0.3));

        // 创建离线收益弹窗
        let overlay = document.getElementById('offline-reward-overlay');
        if (!overlay) {
            overlay = document.createElement('div');
            overlay.id = 'offline-reward-overlay';
            overlay.className = 'modal';
            document.body.appendChild(overlay);
        }

        const items = [];
        if (goldEarned > 0) items.push({ icon: '💰', label: '被动收入', value: `+${goldEarned} 金币`, delay: 0 });
        if (energyRecovered > 0) items.push({ icon: '⚡', label: '能量恢复', value: `+${energyRecovered}`, delay: 200 });
        if (cropsReady > 0) items.push({ icon: '🌾', label: '作物成熟', value: `${cropsReady} 块田`, delay: 400 });
        if (animalsReady > 0) items.push({ icon: '🥚', label: '动物产出', value: `${animalsReady} 只`, delay: 600 });

        overlay.innerHTML = `
            <div class="modal-box" style="position:relative;width:380px;text-align:center;border-color:#ffd700;overflow:visible">
                <div style="font-size:48px;margin-bottom:5px;animation:vb-bounce 0.6s ease">🌅</div>
                <div style="font-size:22px;font-weight:bold;color:#ffd700;margin-bottom:5px">欢迎回来！</div>
                <div style="font-size:13px;color:#aaa;margin-bottom:15px">你离开了 <strong style="color:#fff">${timeStr}</strong></div>
                
                <div style="background:rgba(255,215,0,0.06);border-radius:12px;padding:15px;margin-bottom:15px">
                    <div style="font-size:13px;color:#888;margin-bottom:10px">📦 离线收获</div>
                    ${items.map((item, i) => `
                        <div class="vb-reward-row" style="animation:vb-slideIn 0.4s ease ${item.delay}ms both">
                            <span style="font-size:22px">${item.icon}</span>
                            <span style="flex:1;text-align:left;color:#ccc;font-size:13px;margin-left:10px">${item.label}</span>
                            <span style="color:#ffd700;font-weight:bold;font-size:14px">${item.value}</span>
                        </div>
                    `).join('')}
                </div>
                
                <button class="btn-gold" style="width:100%;padding:14px;font-size:16px" onclick="ViralBoost.claimOfflineReward(${goldEarned},${energyRecovered},false)">
                    🎁 领取收益
                </button>
                <button class="btn-primary" style="width:100%;margin-top:8px;padding:12px;background:linear-gradient(135deg,#ff8c00,#ffa000);font-size:14px" 
                        onclick="ViralBoost.claimOfflineReward(${goldEarned * 2},${energyRecovered},true)">
                    📺 看广告领双倍 (💰${goldEarned * 2})
                </button>
            </div>
        `;
        overlay.classList.add('show');
    },

    claimOfflineReward(gold, energy, isDouble) {
        if (gold > 0) GameState.addGold(gold);
        if (energy > 0) GameState.recoverEnergy(energy);
        
        const msg = isDouble ? '双倍离线收益已领取！' : '离线收益已领取！';
        showNotification(`🎁 ${msg} +${gold}金币`, 'gold');
        
        if (isDouble && typeof AdSystem !== 'undefined') {
            AdSystem.showRewarded('custom');
        }
        
        const overlay = document.getElementById('offline-reward-overlay');
        if (overlay) overlay.classList.remove('show');
        
        GameState.save();
    },

    // =============================================
    // ⚡ 2. 连击Combo系统
    // 痛点：每次操作是独立的，没有连续操作的爽快感
    // 方案：连续操作触发combo计数+倍率加成+音效渐强
    // =============================================
    combo: {
        count: 0,
        timer: null,
        maxCombo: 0,
        lastAction: 0,
        TIMEOUT: 3000, // 3秒内继续操作保持combo
        
        _el: null
    },

    triggerCombo(actionType) {
        const now = Date.now();
        const combo = this.combo;
        
        if (now - combo.lastAction > combo.TIMEOUT) {
            combo.count = 0; // combo断了
        }
        
        combo.count++;
        combo.lastAction = now;
        combo.maxCombo = Math.max(combo.maxCombo, combo.count);
        
        // 清除之前的计时器
        clearTimeout(combo.timer);
        combo.timer = setTimeout(() => {
            if (combo.count >= 5) {
                const bonusGold = combo.count * 10;
                GameState.addGold(bonusGold);
                showNotification(`🔥 ${combo.count}连击结束！奖励 ${bonusGold} 金币！`, 'gold');
            }
            combo.count = 0;
            this._hideComboUI();
        }, combo.TIMEOUT);
        
        // 显示combo UI
        if (combo.count >= 2) {
            this._showComboUI(combo.count, actionType);
        }
        
        // combo经验加成
        if (combo.count >= 3) {
            const bonusXP = Math.floor(combo.count * 0.5);
            GameState.addXP(bonusXP);
        }
        
        // 音效加速
        if (typeof AudioSystem !== 'undefined' && combo.count >= 3) {
            AudioSystem.play('harvest');
        }
    },

    _showComboUI(count) {
        let el = this.combo._el;
        if (!el) {
            el = document.createElement('div');
            el.id = 'combo-display';
            document.body.appendChild(el);
            this.combo._el = el;
        }
        
        const colors = ['#fff', '#ffd700', '#ff8c00', '#ff4444', '#ff00ff'];
        const colorIdx = Math.min(count - 2, colors.length - 1);
        const scale = Math.min(1 + count * 0.05, 1.5);
        
        el.innerHTML = `
            <div style="font-size:${16 + count}px;font-weight:bold;color:${colors[colorIdx]};text-shadow:0 0 ${count * 3}px ${colors[colorIdx]};transform:scale(${scale})">
                ${count}x COMBO!
            </div>
            ${count >= 5 ? '<div style="font-size:11px;color:#ffd700;margin-top:2px">🔥 经验+' + Math.floor(count * 0.5) + '</div>' : ''}
        `;
        el.style.display = 'flex';
        
        // 弹跳动画
        el.style.animation = 'none';
        el.offsetHeight; // force reflow
        el.style.animation = 'vb-comboPop 0.3s ease';
    },

    _hideComboUI() {
        if (this.combo._el) {
            this.combo._el.style.display = 'none';
        }
    },

    // =============================================
    // 🎡 3. 每日幸运转盘
    // 痛点：签到太单调，缺少随机惊喜感
    // 方案：每天免费转一次，可花钻石多转
    // =============================================
    WHEEL_PRIZES: [
        { icon: '💰', name: '100金币', type: 'gold', value: 100, weight: 30, color: '#ffd700' },
        { icon: '💰', name: '500金币', type: 'gold', value: 500, weight: 15, color: '#ffaa00' },
        { icon: '💎', name: '5钻石', type: 'diamond', value: 5, weight: 10, color: '#00bfff' },
        { icon: '💎', name: '15钻石', type: 'diamond', value: 15, weight: 3, color: '#0088ff' },
        { icon: '⚡', name: '满能量', type: 'energy', value: 100, weight: 12, color: '#ff8c00' },
        { icon: '🌱', name: '稀有种子x3', type: 'rareSeed', value: 3, weight: 8, color: '#4CAF50' },
        { icon: '🪙', name: '扭蛋币x2', type: 'gachaToken', value: 2, weight: 8, color: '#b8860b' },
        { icon: '🎁', name: '神秘大奖', type: 'jackpot', value: 1, weight: 2, color: '#ff00ff' },
    ],

    wheelState: {
        lastFreeDate: null,
        totalSpins: 0,
    },

    showLuckyWheel() {
        // 加载状态
        const saved = localStorage.getItem('farm3d_wheel');
        if (saved) {
            try { Object.assign(this.wheelState, JSON.parse(saved)); } catch(e) {}
        }

        const today = new Date().toDateString();
        const hasFree = this.wheelState.lastFreeDate !== today;
        
        let overlay = document.getElementById('wheel-overlay');
        if (!overlay) {
            overlay = document.createElement('div');
            overlay.id = 'wheel-overlay';
            overlay.className = 'modal';
            document.body.appendChild(overlay);
        }

        // 生成转盘HTML
        const segCount = this.WHEEL_PRIZES.length;
        const segAngle = 360 / segCount;
        
        overlay.innerHTML = `
            <div class="modal-box" style="position:relative;width:400px;text-align:center;border-color:#ffd700;overflow:visible">
                <button class="modal-close" onclick="document.getElementById('wheel-overlay').classList.remove('show')">✕</button>
                <div style="font-size:22px;font-weight:bold;color:#ffd700;margin-bottom:5px">🎡 幸运转盘</div>
                <div style="font-size:12px;color:#aaa;margin-bottom:15px">每天免费转一次 · 试试你的运气！</div>
                
                <!-- 转盘容器 -->
                <div style="position:relative;width:280px;height:280px;margin:0 auto 20px">
                    <!-- 指针 -->
                    <div style="position:absolute;top:-15px;left:50%;transform:translateX(-50%);z-index:3;font-size:32px;filter:drop-shadow(0 2px 4px rgba(0,0,0,0.5))">📍</div>
                    
                    <!-- 转盘 -->
                    <div id="wheel-disc" style="width:280px;height:280px;border-radius:50%;position:relative;transition:transform 4s cubic-bezier(0.17,0.67,0.12,0.99);border:4px solid #ffd700;box-shadow:0 0 30px rgba(255,215,0,0.3)">
                        ${this.WHEEL_PRIZES.map((prize, i) => {
                            const rotation = i * segAngle;
                            return `
                                <div style="position:absolute;top:50%;left:50%;width:50%;height:2px;transform-origin:left center;transform:rotate(${rotation}deg)">
                                    <div style="position:absolute;right:20px;top:-20px;transform:rotate(-${rotation}deg);text-align:center;width:50px">
                                        <div style="font-size:24px">${prize.icon}</div>
                                        <div style="font-size:9px;color:#ccc;white-space:nowrap">${prize.name}</div>
                                    </div>
                                </div>
                            `;
                        }).join('')}
                        <!-- 段分隔线 -->
                        ${this.WHEEL_PRIZES.map((_, i) => `
                            <div style="position:absolute;top:50%;left:50%;width:50%;height:1px;background:rgba(255,215,0,0.3);transform-origin:left center;transform:rotate(${i * segAngle + segAngle / 2}deg)"></div>
                        `).join('')}
                        <!-- 中心圆 -->
                        <div style="position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);width:50px;height:50px;border-radius:50%;background:linear-gradient(135deg,#ffd700,#ff8c00);display:flex;align-items:center;justify-content:center;font-size:20px;box-shadow:0 0 15px rgba(255,215,0,0.5);z-index:2">🎯</div>
                    </div>
                </div>
                
                <!-- 按钮 -->
                <button id="wheel-spin-btn" class="btn-gold" style="width:100%;padding:14px;font-size:16px" onclick="ViralBoost.spinWheel()">
                    ${hasFree ? '🎡 免费转一次！' : '💎 花3钻石再转一次'}
                </button>
                <div id="wheel-status-text" style="font-size:11px;color:#666;margin-top:8px">
                    今日已转 ${this.wheelState.lastFreeDate === today ? '✅ 已用免费次数' : '🎁 免费次数可用'} · 累计 ${this.wheelState.totalSpins} 次
                </div>
            </div>
        `;
        
        overlay.classList.add('show');
    },

    // 记录转盘累计旋转角度，确保每次旋转都在前一次基础上继续
    _wheelCurrentAngle: 0,

    spinWheel() {
        const today = new Date().toDateString();
        const hasFree = this.wheelState.lastFreeDate !== today;
        
        // 防止连点：如果正在旋转中，直接返回
        if (this._wheelSpinning) return;
        
        if (!hasFree) {
            // 花钻石
            if (!GameState.spendDiamond(3)) {
                showNotification('钻石不足！需要3钻石', '💎', 'warning');
                return;
            }
        } else {
            this.wheelState.lastFreeDate = today;
        }
        
        this._wheelSpinning = true;
        this.wheelState.totalSpins++;
        
        // 加权随机
        const totalWeight = this.WHEEL_PRIZES.reduce((sum, p) => sum + p.weight, 0);
        let rand = Math.random() * totalWeight;
        let selectedIdx = 0;
        for (let i = 0; i < this.WHEEL_PRIZES.length; i++) {
            rand -= this.WHEEL_PRIZES[i].weight;
            if (rand <= 0) { selectedIdx = i; break; }
        }
        
        const prize = this.WHEEL_PRIZES[selectedIdx];
        const segAngle = 360 / this.WHEEL_PRIZES.length;
        
        // 计算旋转角度：在当前角度基础上再转 5 圈 + 停在目标扇区
        const stopAngle = 360 - selectedIdx * segAngle - segAngle / 2;
        // 先对齐到整圈，然后再加 5 整圈 + 目标偏移
        const extraRotation = 360 * 5 + stopAngle;
        this._wheelCurrentAngle += extraRotation;
        
        const disc = document.getElementById('wheel-disc');
        if (disc) {
            // 确保 transition 生效：先重置 transition 再设置新角度
            disc.style.transition = 'none';
            disc.offsetHeight; // force reflow
            disc.style.transition = 'transform 4s cubic-bezier(0.17, 0.67, 0.12, 0.99)';
            disc.style.transform = `rotate(${this._wheelCurrentAngle}deg)`;
        }
        
        // 禁用按钮
        const btn = document.getElementById('wheel-spin-btn');
        if (btn) { btn.disabled = true; btn.textContent = '🎡 转动中...'; }
        
        // 4秒后发奖
        setTimeout(() => {
            this._wheelSpinning = false;
            this._grantWheelPrize(prize);
            if (btn) {
                btn.disabled = false;
                btn.textContent = '💎 花3钻石再转一次';
                btn.innerHTML = '💎 花3钻石再转一次';
            }
            // 更新底部状态文字
            this._updateWheelStatus(today);
        }, 4200);
        
        // 保存状态
        localStorage.setItem('farm3d_wheel', JSON.stringify(this.wheelState));
    },

    _updateWheelStatus(today) {
        const statusEl = document.getElementById('wheel-status-text');
        if (statusEl) {
            statusEl.textContent = `今日已转 ✅ 已用免费次数 · 累计 ${this.wheelState.totalSpins} 次`;
        }
    },

    _grantWheelPrize(prize) {
        switch (prize.type) {
            case 'gold':
                GameState.addGold(prize.value);
                break;
            case 'diamond':
                GameState.addDiamond(prize.value);
                break;
            case 'energy':
                GameState.player.energy = GameState.player.maxEnergy;
                updateHUD();
                break;
            case 'rareSeed': {
                const rareSeeds = ['strawberry', 'blueberry'];
                rareSeeds.forEach(s => {
                    if (!GameState.inventory.seeds[s]) GameState.inventory.seeds[s] = 0;
                    GameState.inventory.seeds[s] += prize.value;
                });
                break;
            }
            case 'gachaToken':
                GameState.gacha.tokens = (GameState.gacha.tokens || 0) + prize.value;
                break;
            case 'jackpot':
                GameState.addGold(2000);
                GameState.addDiamond(20);
                GameState.gacha.tokens = (GameState.gacha.tokens || 0) + 3;
                break;
        }
        
        showNotification(`🎡 恭喜获得 ${prize.icon} ${prize.name}！`, 'gold');
        GameState.save();
    },

    // =============================================
    // 🌟 4. 收获特效增强 + 飘字
    // 痛点：收获只有一行通知，缺乏爽快感
    // 方案：飘字+金币飞向HUD+品质光效
    // =============================================
    showHarvestFloat(plotId, cropIcon, goldValue, quality, isGolden) {
        const el = document.createElement('div');
        el.className = 'vb-harvest-float';
        
        const qualityColors = {
            normal: '#fff',
            good: '#4CAF50',
            perfect: '#ffd700'
        };
        const color = isGolden ? '#ffd700' : (qualityColors[quality] || '#fff');
        
        el.innerHTML = `
            <div style="font-size:32px;animation:vb-floatIcon 0.5s ease">${cropIcon}</div>
            <div style="color:${color};font-size:16px;font-weight:bold;text-shadow:0 0 10px ${color}">
                ${isGolden ? '✨ 金色收获！' : ''}
                ${quality === 'perfect' ? '⭐ 完美品质！' : quality === 'good' ? '优质！' : ''}
            </div>
            <div style="color:#ffd700;font-size:18px;font-weight:bold;animation:vb-floatGold 1s ease 0.3s both">
                +${goldValue} 💰
            </div>
        `;
        
        // 放在屏幕中间偏上
        el.style.cssText = 'position:fixed;top:35%;left:50%;transform:translateX(-50%);z-index:450;text-align:center;pointer-events:none';
        document.body.appendChild(el);
        
        setTimeout(() => el.remove(), 2000);
    },

    // 金币飞向HUD动画
    flyGoldToHUD(startX, startY, amount) {
        const hudGold = document.getElementById('gold-display');
        if (!hudGold) return;
        
        const rect = hudGold.getBoundingClientRect();
        const targetX = rect.left + rect.width / 2;
        const targetY = rect.top + rect.height / 2;
        
        const count = Math.min(Math.ceil(amount / 50), 8);
        
        for (let i = 0; i < count; i++) {
            setTimeout(() => {
                const coin = document.createElement('div');
                coin.className = 'vb-fly-coin';
                coin.textContent = '💰';
                coin.style.cssText = `
                    position:fixed;
                    left:${startX + (Math.random() - 0.5) * 40}px;
                    top:${startY + (Math.random() - 0.5) * 40}px;
                    z-index:500;font-size:20px;pointer-events:none;
                    transition:all 0.8s cubic-bezier(0.4,0,0.2,1);
                `;
                document.body.appendChild(coin);
                
                requestAnimationFrame(() => {
                    coin.style.left = targetX + 'px';
                    coin.style.top = targetY + 'px';
                    coin.style.opacity = '0';
                    coin.style.transform = 'scale(0.3)';
                });
                
                setTimeout(() => coin.remove(), 900);
            }, i * 80);
        }
        
        // HUD弹跳
        setTimeout(() => {
            hudGold.style.animation = 'vb-hudBounce 0.3s ease';
            setTimeout(() => hudGold.style.animation = '', 300);
        }, count * 80 + 600);
    },

    // =============================================
    // 📊 5. 实时进度条（下一个里程碑）
    // 痛点：玩家不知道距离下一个目标有多远
    // 方案：屏幕底部显示"距离下一个成就/等级/解锁"
    // =============================================
    showProgressHint() {
        let hint = document.getElementById('vb-progress-hint');
        if (!hint) {
            hint = document.createElement('div');
            hint.id = 'vb-progress-hint';
            document.body.appendChild(hint);
        }
        
        // 计算最近的目标
        const targets = [];
        
        // 等级目标
        const xpPercent = (GameState.player.xp / GameState.player.xpToNext) * 100;
        if (xpPercent > 50) {
            targets.push({
                icon: '⭐',
                label: `Lv.${GameState.player.level + 1}`,
                percent: xpPercent,
                detail: `还需 ${GameState.player.xpToNext - GameState.player.xp} XP`
            });
        }
        
        // 最近的未解锁成就
        const nextAch = ACHIEVEMENTS_DATA.find(ach => {
            if (GameState.achievements.has(ach.id)) return false;
            // 简单检查进度
            if (ach.condition.includes('totalHarvest')) {
                const target = parseInt(ach.condition.split('>=')[1]);
                return GameState.player.totalHarvest >= target * 0.5;
            }
            return false;
        });
        if (nextAch) {
            const target = parseInt(nextAch.condition.split('>=')[1]);
            const progress = GameState.player.totalHarvest || 0;
            targets.push({
                icon: nextAch.icon,
                label: nextAch.name,
                percent: Math.min(99, (progress / target) * 100),
                detail: `${progress}/${target}`
            });
        }
        
        if (targets.length === 0) {
            hint.style.display = 'none';
            return;
        }
        
        // 选最接近完成的
        const best = targets.sort((a, b) => b.percent - a.percent)[0];
        
        hint.innerHTML = `
            <span style="font-size:14px">${best.icon}</span>
            <span style="font-size:11px;color:#aaa">${best.label}</span>
            <div style="flex:1;background:rgba(255,255,255,0.1);border-radius:3px;height:6px;margin:0 8px;min-width:60px">
                <div style="background:linear-gradient(90deg,#4CAF50,#ffd700);height:100%;width:${best.percent}%;border-radius:3px;transition:width 0.5s"></div>
            </div>
            <span style="font-size:10px;color:#666">${best.detail}</span>
        `;
        hint.style.display = 'flex';
        
        // 10秒后隐藏
        clearTimeout(this._progressTimer);
        this._progressTimer = setTimeout(() => { hint.style.display = 'none'; }, 10000);
    },

    // =============================================
    // 🏷️ 6. 每日惊喜红包
    // 痛点：登录没有即时奖励惊喜
    // 方案：每天首次登录弹出红包，点击领取+手气效果
    // =============================================
    showDailySurprise() {
        const today = new Date().toDateString();
        const lastSurprise = localStorage.getItem('farm3d_dailySurprise');
        if (lastSurprise === today) return;
        
        localStorage.setItem('farm3d_dailySurprise', today);
        
        // 随机红包金额
        const baseGold = 50 + GameState.player.level * 20;
        const luck = Math.random();
        let goldAmount;
        let luckText;
        
        if (luck > 0.95) {
            goldAmount = baseGold * 5;
            luckText = '🎉 超级幸运！';
        } else if (luck > 0.8) {
            goldAmount = baseGold * 2;
            luckText = '😊 运气不错！';
        } else {
            goldAmount = baseGold;
            luckText = '😄 手气一般~';
        }
        
        goldAmount = Math.floor(goldAmount);
        
        let overlay = document.getElementById('surprise-overlay');
        if (!overlay) {
            overlay = document.createElement('div');
            overlay.id = 'surprise-overlay';
            overlay.className = 'modal';
            document.body.appendChild(overlay);
        }
        
        overlay.innerHTML = `
            <div style="text-align:center;cursor:pointer" onclick="ViralBoost.claimDailySurprise(${goldAmount})">
                <div class="vb-red-packet" id="vb-red-packet">
                    <div style="font-size:60px;animation:vb-packetShake 1s ease infinite">🧧</div>
                    <div style="font-size:20px;color:#ffd700;font-weight:bold;margin-top:10px">每日惊喜红包</div>
                    <div style="font-size:13px;color:#ffaa00;margin-top:5px">点击领取</div>
                </div>
                <div id="vb-packet-result" style="display:none">
                    <div style="font-size:48px;animation:vb-bounce 0.6s ease">💰</div>
                    <div style="font-size:24px;font-weight:bold;color:#ffd700;margin-top:10px">${luckText}</div>
                    <div style="font-size:32px;font-weight:bold;color:#fff;margin-top:8px;text-shadow:0 0 20px rgba(255,215,0,0.5)">+${goldAmount} 金币</div>
                    <div style="font-size:13px;color:#aaa;margin-top:15px">点击关闭</div>
                </div>
            </div>
        `;
        
        // 延迟弹出
        setTimeout(() => overlay.classList.add('show'), 2000);
    },

    claimDailySurprise(goldAmount) {
        const packet = document.getElementById('vb-red-packet');
        const result = document.getElementById('vb-packet-result');
        
        if (packet && packet.style.display !== 'none') {
            // 第一次点击：打开红包
            packet.style.display = 'none';
            result.style.display = 'block';
            GameState.addGold(goldAmount);
            if (typeof AudioSystem !== 'undefined') AudioSystem.play('coin');
        } else {
            // 第二次点击：关闭
            const overlay = document.getElementById('surprise-overlay');
            if (overlay) overlay.classList.remove('show');
        }
    },

    // =============================================
    // 🔔 7. 红点驱动系统
    // 痛点：玩家不知道有什么可以做
    // 方案：智能红点提示可操作内容
    // =============================================
    updateRedDots() {
        // 有成熟作物 → 收获工具闪烁
        const hasReady = GameState.plots.some(p => p.state === 'ready');
        const harvestTool = document.getElementById('tool-harvest');
        if (harvestTool) {
            harvestTool.style.animation = hasReady ? 'vb-toolGlow 1.5s ease-in-out infinite' : '';
        }
        
        // 有动物产出 → 喂食工具闪烁
        const hasProduct = GameState.animals.some(a => a.hasProduct);
        const feedTool = document.getElementById('tool-feed');
        if (feedTool) {
            feedTool.style.animation = hasProduct ? 'vb-toolGlow 1.5s ease-in-out infinite' : '';
        }
        
        // 有未浇水的作物
        const hasUnwatered = GameState.plots.some(p => (p.state === 'planted' || p.state === 'fertilized') && !p.watered);
        const waterTool = document.getElementById('tool-water');
        if (waterTool) {
            waterTool.style.animation = hasUnwatered ? 'vb-toolGlow 1.5s ease-in-out infinite' : '';
        }
    },

    // =============================================
    // 🎯 8. 快速行动按钮（一键操作）
    // 痛点：有成熟作物/产出时要一个个点
    // 方案：浮动快速操作按钮
    // =============================================
    updateQuickActions() {
        let container = document.getElementById('vb-quick-actions');
        if (!container) {
            container = document.createElement('div');
            container.id = 'vb-quick-actions';
            document.body.appendChild(container);
        }
        
        const actions = [];
        
        // 一键收获
        const readyCount = GameState.plots.filter(p => p.state === 'ready').length;
        if (readyCount >= 2) {
            actions.push(`<button class="vb-quick-btn" onclick="ViralBoost.quickHarvestAll()">🌾 一键收获 (${readyCount})</button>`);
        }
        
        // 一键浇水
        const unwateredCount = GameState.plots.filter(p => (p.state === 'planted' || p.state === 'fertilized') && !p.watered).length;
        if (unwateredCount >= 2) {
            actions.push(`<button class="vb-quick-btn" onclick="ViralBoost.quickWaterAll()">💧 一键浇水 (${unwateredCount})</button>`);
        }
        
        // 一键收集动物产出
        const productCount = GameState.animals.filter(a => a.hasProduct && a.grown).length;
        if (productCount >= 2) {
            actions.push(`<button class="vb-quick-btn" onclick="ViralBoost.quickCollectAll()">🥚 一键收集 (${productCount})</button>`);
        }
        
        container.innerHTML = actions.join('');
        container.style.display = actions.length > 0 ? 'flex' : 'none';
    },

    quickHarvestAll() {
        let totalGold = 0;
        let count = 0;
        
        GameState.plots.forEach((plot, idx) => {
            if (plot.state !== 'ready') return;
            if (!GameState.spendEnergy(1)) return;
            
            const crop = CROPS_DATA[plot.crop];
            if (!crop) return;
            
            let quantity = 1;
            if (plot.quality === 'fertile') quantity = 2;
            if (plot.quality === 'magic') quantity = 3;
            if (plot.fertilized) quantity = Math.ceil(quantity * 1.5);
            
            if (!GameState.inventory.harvest[plot.crop]) GameState.inventory.harvest[plot.crop] = 0;
            GameState.inventory.harvest[plot.crop] += quantity;
            
            GameState.player.totalHarvest++;
            if (crop.type === 'rare') GameState.player.rareHarvest++;
            if (crop.type === 'legendary') GameState.player.legendaryHarvest++;
            
            GameState.addXP(crop.xp);
            GameState.updateQuestProgress('harvest');
            
            totalGold += crop.sellPrice * quantity;
            count++;
            
            // 重置土地
            plot.state = 'empty';
            plot.crop = null;
            plot.growProgress = 0;
            plot.watered = false;
            plot.fertilized = false;
            Scene3D.updatePlot(plot);
            Scene3D.createHarvestEffect(idx, crop.color);
        });
        
        if (count > 0) {
            showNotification(`🌾 一键收获 ${count} 块田地！`, 'gold');
            this.triggerCombo('harvest');
            GameState.checkAchievements();
            GameState.save();
        }
        
        this.updateQuickActions();
    },

    quickWaterAll() {
        let count = 0;
        
        GameState.plots.forEach((plot, idx) => {
            if (!((plot.state === 'planted' || plot.state === 'fertilized') && !plot.watered)) return;
            if (!GameState.spendEnergy(1)) return;
            
            plot.watered = true;
            if (plot.state === 'planted') plot.state = 'watered';
            Scene3D.createWaterEffect(idx);
            Scene3D.updatePlot(plot);
            count++;
        });
        
        if (count > 0) {
            showNotification(`💧 一键浇水 ${count} 块田地！`, 'gold');
            GameState.updateQuestProgress('water', count);
            GameState.save();
        }
        
        this.updateQuickActions();
    },

    quickCollectAll() {
        let totalGold = 0;
        let count = 0;
        
        GameState.animals.forEach(animal => {
            if (!animal.hasProduct || !animal.grown) return;
            
            const animalData = ANIMALS_DATA[animal.type];
            if (!animalData) return;
            
            let quantity = 1;
            if (animal.intimacy >= 50) quantity = 2;
            if (animal.intimacy >= 80) quantity = 3;
            
            const productKey = `animal_${animal.type}`;
            if (!GameState.inventory.harvest[productKey]) GameState.inventory.harvest[productKey] = 0;
            GameState.inventory.harvest[productKey] += quantity;
            
            const gold = animalData.productValue * quantity;
            GameState.addGold(gold);
            GameState.addXP(10 * quantity);
            totalGold += gold;
            
            animal.hasProduct = false;
            animal.productProgress = 0;
            count++;
        });
        
        if (count > 0) {
            showNotification(`🥚 一键收集 ${count} 只动物产出！+${totalGold}金币`, 'gold');
            GameState.updateQuestProgress('collect', count);
            GameState.save();
        }
        
        this.updateQuickActions();
    },

    // =============================================
    // 🔄 9. 定时器驱动 — 每秒更新
    // =============================================
    update(deltaTime) {
        // 每2秒刷新红点和快速操作
        if (!this._updateTimer) this._updateTimer = 0;
        this._updateTimer += deltaTime;
        if (this._updateTimer >= 2) {
            this._updateTimer = 0;
            this.updateRedDots();
            this.updateQuickActions();
        }
        
        // 每30秒显示进度提示
        if (!this._progressUpdateTimer) this._progressUpdateTimer = 0;
        this._progressUpdateTimer += deltaTime;
        if (this._progressUpdateTimer >= 30) {
            this._progressUpdateTimer = 0;
            this.showProgressHint();
        }
    },

    // =============================================
    // 🚀 10. 初始化 — Hook所有关键系统
    // =============================================
    init() {
        // Hook 收获函数 — 添加combo和特效
        const originalDoHarvest = window.doHarvest;
        if (originalDoHarvest) {
            window.doHarvest = (plotId) => {
                const plot = GameState.plots[plotId];
                const wasReady = plot && plot.state === 'ready';
                
                originalDoHarvest(plotId);
                
                if (wasReady) {
                    this.triggerCombo('harvest');
                }
            };
        }
        
        // Hook 浇水函数
        const originalDoWater = window.doWater;
        if (originalDoWater) {
            window.doWater = (plotId) => {
                originalDoWater(plotId);
                this.triggerCombo('water');
            };
        }
        
        // Hook 喂食函数
        const originalDoFeed = window.doFeedAnimal;
        if (originalDoFeed) {
            window.doFeedAnimal = (animalId) => {
                originalDoFeed(animalId);
                this.triggerCombo('feed');
            };
        }
        
        // Hook 离线收益 — 替换原始通知为弹窗
        const originalProcessOffline = GameState.processOfflineProgress.bind(GameState);
        GameState.processOfflineProgress = () => {
            const now = Date.now();
            const elapsed = Math.min((now - GameState.gameTime.lastUpdate) / 1000, 8 * 3600);
            
            // 调用原始逻辑（更新作物和动物）
            originalProcessOffline();
            
            // 用弹窗替代简单通知
            if (elapsed >= 300) {
                setTimeout(() => this.showOfflineReward(elapsed), 1500);
            }
        };
        
        // 每日惊喜红包
        setTimeout(() => this.showDailySurprise(), 3000);
        
        // 幸运转盘按钮（添加到签到旁）
        this._addWheelButton();
        
        // 初始红点检查
        setTimeout(() => {
            this.updateRedDots();
            this.updateQuickActions();
        }, 2000);
    },

    _addWheelButton() {
        // 在HUD顶部添加幸运转盘入口
        const hudTop = document.getElementById('hud-top');
        if (!hudTop) return;
        
        const wheelBtn = document.createElement('div');
        wheelBtn.className = 'hud-stat';
        wheelBtn.style.cssText = 'cursor:pointer;background:rgba(255,215,0,0.15);border-color:rgba(255,215,0,0.3)';
        wheelBtn.innerHTML = `
            <span class="icon" style="animation:vb-wheelSpin 3s linear infinite">🎡</span>
            <div>
                <div class="value" style="color:#ffd700;font-size:12px">转盘</div>
            </div>
        `;
        wheelBtn.onclick = () => this.showLuckyWheel();
        
        // 插入到签到按钮前面
        const checkinBtn = document.getElementById('checkin-hud-stat');
        if (checkinBtn) {
            hudTop.insertBefore(wheelBtn, checkinBtn);
        }
    }
};
