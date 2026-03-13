// ===== 成就庆典 & 数据回顾系统 =====

const CelebrationSystem = {
    _initialized: false,

    // 里程碑定义
    MILESTONES: [
        { id: 'first_day', name: '初入田园', icon: '🌅', desc: '第一天来到农场', condition: () => true, reward: { gold: 100, diamond: 1 } },
        { id: 'harvest_10', name: '小有成就', icon: '🌾', desc: '累计收获10次', condition: () => GameState.player.totalHarvest >= 10, reward: { gold: 300, diamond: 2 } },
        { id: 'harvest_50', name: '丰收达人', icon: '🏆', desc: '累计收获50次', condition: () => GameState.player.totalHarvest >= 50, reward: { gold: 800, diamond: 5 } },
        { id: 'harvest_200', name: '农业之王', icon: '👑', desc: '累计收获200次', condition: () => GameState.player.totalHarvest >= 200, reward: { gold: 2000, diamond: 10 } },
        { id: 'gold_5000', name: '小康生活', icon: '💰', desc: '累计获得5000金币', condition: () => GameState.player.totalGoldEarned >= 5000, reward: { gold: 500, diamond: 3 } },
        { id: 'gold_50000', name: '富甲一方', icon: '🏦', desc: '累计获得50000金币', condition: () => GameState.player.totalGoldEarned >= 50000, reward: { gold: 2000, diamond: 8 } },
        { id: 'level_10', name: '初露锋芒', icon: '⭐', desc: '达到10级', condition: () => GameState.player.level >= 10, reward: { gold: 500, diamond: 3 } },
        { id: 'level_25', name: '农场大师', icon: '🌟', desc: '达到25级', condition: () => GameState.player.level >= 25, reward: { gold: 1500, diamond: 8 } },
        { id: 'animals_5', name: '小型牧场', icon: '🐾', desc: '同时拥有5只动物', condition: () => GameState.animals.length >= 5, reward: { gold: 500, diamond: 3 } },
        { id: 'animals_10', name: '动物乐园', icon: '🦁', desc: '同时拥有10只动物', condition: () => GameState.animals.length >= 10, reward: { gold: 1000, diamond: 5 } },
        { id: 'streak_7', name: '坚持一周', icon: '🔥', desc: '连续签到7天', condition: () => GameState.player.maxStreak >= 7, reward: { gold: 500, diamond: 5 } },
        { id: 'streak_30', name: '持之以恒', icon: '💪', desc: '连续签到30天', condition: () => GameState.player.maxStreak >= 30, reward: { gold: 2000, diamond: 15 } },
        { id: 'order_10', name: '可靠商人', icon: '📦', desc: '完成10笔订单', condition: () => (GameState.orders?.totalCompleted || 0) >= 10, reward: { gold: 800, diamond: 5 } },
        { id: 'beauty_50', name: '美丽花园', icon: '🌸', desc: '美观度达到50', condition: () => (GameState.decoration?.beautyScore || 0) >= 50, reward: { gold: 500, diamond: 3 } }
    ],

    initState() {
        if (this._initialized) return;
        this._initialized = true;

        if (!GameState.celebration) {
            GameState.celebration = {
                unlockedMilestones: [],
                weeklyData: {
                    startDate: null,
                    harvests: 0,
                    goldEarned: 0,
                    animalsProduced: 0,
                    ordersCompleted: 0,
                    fishCaught: 0,
                    gachaRolled: 0
                },
                lastWeekReport: null
            };
        }

        this._checkWeeklyReset();
    },

    // 检查周报重置
    _checkWeeklyReset() {
        const today = new Date();
        const startDate = GameState.celebration.weeklyData.startDate;

        if (!startDate || this._daysBetween(new Date(startDate), today) >= 7) {
            // 保存上周数据
            if (startDate && GameState.celebration.weeklyData.harvests > 0) {
                GameState.celebration.lastWeekReport = { ...GameState.celebration.weeklyData };
            }
            // 重置
            GameState.celebration.weeklyData = {
                startDate: today.toISOString(),
                harvests: 0,
                goldEarned: 0,
                animalsProduced: 0,
                ordersCompleted: 0,
                fishCaught: 0,
                gachaRolled: 0
            };
        }
    },

    _daysBetween(d1, d2) {
        return Math.floor((d2 - d1) / (1000 * 60 * 60 * 24));
    },

    // 记录周报数据
    trackWeekly(type, amount = 1) {
        if (!GameState.celebration || !GameState.celebration.weeklyData) return;
        const w = GameState.celebration.weeklyData;
        switch (type) {
            case 'harvest': w.harvests += amount; break;
            case 'gold': w.goldEarned += amount; break;
            case 'collect': w.animalsProduced += amount; break;
            case 'order_complete': w.ordersCompleted += amount; break;
            case 'fish': w.fishCaught += amount; break;
            case 'gacha': w.gachaRolled += amount; break;
        }
    },

    // 检查里程碑
    checkMilestones() {
        if (!GameState.celebration) return;

        this.MILESTONES.forEach(m => {
            if (GameState.celebration.unlockedMilestones.includes(m.id)) return;

            if (m.condition()) {
                GameState.celebration.unlockedMilestones.push(m.id);
                this._showMilestoneAnimation(m);

                // 发放奖励
                if (m.reward.gold) GameState.addGold(m.reward.gold);
                if (m.reward.diamond) GameState.addDiamond(m.reward.diamond);

                GameState.save();
            }
        });
    },

    // 里程碑动画
    _showMilestoneAnimation(milestone) {
        const overlay = document.getElementById('celebration-overlay');
        if (!overlay) return;

        document.getElementById('celeb-icon').textContent = milestone.icon;
        document.getElementById('celeb-title').textContent = milestone.name;
        document.getElementById('celeb-desc').textContent = milestone.desc;

        let rewardText = [];
        if (milestone.reward.gold) rewardText.push(`💰${milestone.reward.gold}`);
        if (milestone.reward.diamond) rewardText.push(`💎${milestone.reward.diamond}`);
        document.getElementById('celeb-reward').textContent = `奖励: ${rewardText.join(' + ')}`;

        overlay.style.display = 'flex';

        // 自动关闭
        setTimeout(() => {
            overlay.style.display = 'none';
        }, 4000);
    },

    // 打开面板
    openPanel() {
        this.initState();
        this.checkMilestones();
        showModal('celebration-modal');
    },

    renderPanel() {
        const content = document.getElementById('celebration-content');
        if (!content) return;
        content.innerHTML = '';

        // 周报
        this._renderWeeklyReport(content);

        // 里程碑列表
        this._renderMilestones(content);
    },

    _renderWeeklyReport(el) {
        const w = GameState.celebration.weeklyData;
        const lastWeek = GameState.celebration.lastWeekReport;

        const section = document.createElement('div');
        section.style.cssText = 'margin-bottom:20px;padding:15px;background:rgba(0,191,255,0.05);border:1px solid rgba(0,191,255,0.2);border-radius:12px';

        const days = w.startDate ? Math.min(7, this._daysBetween(new Date(w.startDate), new Date()) + 1) : 0;

        section.innerHTML = `
            <div style="text-align:center;font-size:16px;color:#00bfff;font-weight:bold;margin-bottom:12px">📊 本周数据回顾 (第${days}天)</div>
            <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:8px">
                <div style="background:rgba(255,255,255,0.05);border-radius:8px;padding:10px;text-align:center">
                    <div style="font-size:20px;font-weight:bold;color:#ffd700">${w.harvests}</div>
                    <div style="font-size:11px;color:#aaa">🌾 收获次数</div>
                </div>
                <div style="background:rgba(255,255,255,0.05);border-radius:8px;padding:10px;text-align:center">
                    <div style="font-size:20px;font-weight:bold;color:#ffd700">${w.goldEarned}</div>
                    <div style="font-size:11px;color:#aaa">💰 赚取金币</div>
                </div>
                <div style="background:rgba(255,255,255,0.05);border-radius:8px;padding:10px;text-align:center">
                    <div style="font-size:20px;font-weight:bold;color:#ffd700">${w.ordersCompleted}</div>
                    <div style="font-size:11px;color:#aaa">📦 完成订单</div>
                </div>
                <div style="background:rgba(255,255,255,0.05);border-radius:8px;padding:10px;text-align:center">
                    <div style="font-size:20px;font-weight:bold;color:#ffd700">${w.animalsProduced}</div>
                    <div style="font-size:11px;color:#aaa">🥚 动物产出</div>
                </div>
                <div style="background:rgba(255,255,255,0.05);border-radius:8px;padding:10px;text-align:center">
                    <div style="font-size:20px;font-weight:bold;color:#ffd700">${w.fishCaught}</div>
                    <div style="font-size:11px;color:#aaa">🐟 钓鱼次数</div>
                </div>
                <div style="background:rgba(255,255,255,0.05);border-radius:8px;padding:10px;text-align:center">
                    <div style="font-size:20px;font-weight:bold;color:#ffd700">${w.gachaRolled}</div>
                    <div style="font-size:11px;color:#aaa">🎰 扭蛋次数</div>
                </div>
            </div>
            ${lastWeek ? `
                <div style="margin-top:12px;padding:10px;background:rgba(255,255,255,0.03);border-radius:8px;font-size:12px;color:#888">
                    <div style="margin-bottom:4px;color:#aaa">📅 上周回顾</div>
                    <span>收获${lastWeek.harvests}次</span> · 
                    <span>赚了${lastWeek.goldEarned}金</span> · 
                    <span>完成${lastWeek.ordersCompleted}单</span>
                </div>
            ` : ''}
        `;
        el.appendChild(section);
    },

    _renderMilestones(el) {
        const titleDiv = document.createElement('div');
        titleDiv.style.cssText = 'font-size:16px;color:#ffd700;font-weight:bold;margin-bottom:12px;text-align:center';
        const unlocked = GameState.celebration.unlockedMilestones.length;
        titleDiv.textContent = `🏆 里程碑 (${unlocked}/${this.MILESTONES.length})`;
        el.appendChild(titleDiv);

        this.MILESTONES.forEach(m => {
            const isUnlocked = GameState.celebration.unlockedMilestones.includes(m.id);
            const div = document.createElement('div');
            div.style.cssText = `display:flex;align-items:center;gap:12px;background:rgba(255,255,255,0.05);border-radius:10px;padding:12px;margin-bottom:8px;${isUnlocked ? 'border-left:3px solid #ffd700' : 'opacity:0.5'}`;

            let rewardText = [];
            if (m.reward.gold) rewardText.push(`💰${m.reward.gold}`);
            if (m.reward.diamond) rewardText.push(`💎${m.reward.diamond}`);

            div.innerHTML = `
                <div style="font-size:28px">${isUnlocked ? m.icon : '🔒'}</div>
                <div style="flex:1">
                    <div style="font-size:13px;color:#ddd;font-weight:bold">${m.name}</div>
                    <div style="font-size:11px;color:#aaa">${m.desc}</div>
                    <div style="font-size:11px;color:#ffd700;margin-top:2px">${rewardText.join(' + ')}</div>
                </div>
                <div style="font-size:16px">${isUnlocked ? '✅' : ''}</div>
            `;
            el.appendChild(div);
        });
    }
};
