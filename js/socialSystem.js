// ===== 社交系统 =====
// 好友访问、互助、排行榜

const SocialSystem = {

    // ── 模拟好友数据（AI好友池） ──────────────────────────────
    FRIEND_POOL: [
        { id: 'f1', name: '小花花', avatar: '👩‍🌾', title: '花园精灵', level: 28, farmStyle: 'flower', motto: '种花是最幸福的事！', online: true },
        { id: 'f2', name: '老王头', avatar: '👨‍🌾', title: '庄园主', level: 35, farmStyle: 'classic', motto: '种地30年经验', online: true },
        { id: 'f3', name: '牧场主', avatar: '🤠', title: '动物专家', level: 32, farmStyle: 'ranch', motto: '动物是最好的朋友', online: false },
        { id: 'f4', name: '钓鱼佬', avatar: '🎣', title: '垂钓大师', level: 25, farmStyle: 'fishing', motto: '今天又是钓鱼的好日子', online: true },
        { id: 'f5', name: '甜心', avatar: '🧁', title: '烘焙达人', level: 30, farmStyle: 'bakery', motto: '来尝尝我的蛋糕！', online: false },
        { id: 'f6', name: '阳光少年', avatar: '☀️', title: '农业专家', level: 38, farmStyle: 'classic', motto: '每天都是丰收日', online: true },
        { id: 'f7', name: '兔兔妈', avatar: '🐰', title: '小牧场', level: 18, farmStyle: 'cute', motto: '我家兔兔最可爱啦', online: false },
        { id: 'f8', name: '雷克斯', avatar: '🦖', title: '传说收藏家', level: 42, farmStyle: 'rare', motto: '传说作物才是正道', online: true },
        { id: 'f9', name: '樱桃小丸', avatar: '🍒', title: '初级农夫', level: 12, farmStyle: 'classic', motto: '刚开始种地好开心', online: true },
        { id: 'f10', name: '大地之子', avatar: '🌍', title: '庄园主', level: 36, farmStyle: 'eco', motto: '可持续农业万岁', online: false }
    ],

    // 好友农场模拟数据
    FARM_TEMPLATES: {
        flower: {
            crops: ['rainbowRose', 'sunflower', 'strawberry'],
            animals: ['peacock', 'chicken'],
            deco: ['🌸', '🌺', '🌷', '🌹'],
            desc: '花海缤纷，四季如春'
        },
        classic: {
            crops: ['wheat', 'corn', 'tomato', 'radish'],
            animals: ['cow', 'chicken', 'pig'],
            deco: ['🌾', '🏡', '🪵'],
            desc: '经典田园风光'
        },
        ranch: {
            crops: ['corn', 'wheat'],
            animals: ['cow', 'sheep', 'pig', 'alpaca', 'chicken'],
            deco: ['🐑', '🤠', '🌵'],
            desc: '广袤的牧场，牛羊成群'
        },
        fishing: {
            crops: ['lettuce', 'radish'],
            animals: ['duck'],
            deco: ['🎣', '🏞️', '🐟'],
            desc: '临水而居，悠然自得'
        },
        bakery: {
            crops: ['wheat', 'strawberry', 'blueberry'],
            animals: ['cow', 'chicken'],
            deco: ['🧁', '🍰', '🥐'],
            desc: '飘着面包香的田园'
        },
        cute: {
            crops: ['strawberry', 'lettuce', 'radish'],
            animals: ['chicken', 'duck', 'sheep'],
            deco: ['🐰', '💕', '🎀'],
            desc: '萌萌哒小农场'
        },
        rare: {
            crops: ['goldApple', 'rainbowRose', 'strawberry', 'blueberry'],
            animals: ['unicorn', 'peacock', 'alpaca'],
            deco: ['✨', '🌟', '💎'],
            desc: '传说级别的梦幻农场'
        },
        eco: {
            crops: ['wheat', 'corn', 'tomato', 'pumpkin', 'sunflower'],
            animals: ['cow', 'sheep', 'pig', 'chicken', 'duck'],
            deco: ['🌍', '♻️', '🌱'],
            desc: '绿色生态农业典范'
        }
    },

    // 互助类型
    HELP_TYPES: [
        { id: 'water', name: '浇水', icon: '💧', xpReward: 5, goldReward: 20, friendXp: 10, desc: '帮好友浇水' },
        { id: 'fertilize', name: '施肥', icon: '🌿', xpReward: 8, goldReward: 30, friendXp: 15, desc: '帮好友施肥' },
        { id: 'pest', name: '除虫', icon: '🐛', xpReward: 10, goldReward: 40, friendXp: 20, desc: '帮好友除虫' },
        { id: 'gift', name: '送礼', icon: '🎁', xpReward: 15, goldReward: 0, friendXp: 25, desc: '赠送小礼物' }
    ],

    // 每日互助上限
    DAILY_HELP_LIMIT: 10,

    // ── 当前标签页 ──
    _currentTab: 'friends',

    // ── 初始化 ──────────────────────────────────────────────
    initState() {
        if (!GameState.social) {
            GameState.social = {
                friends: [],           // 好友列表（id数组）
                friendData: {},        // 好友亲密度等数据
                helpLog: [],           // 互助记录
                helpToday: 0,          // 今日已互助次数
                helpDate: null,        // 上次互助日期
                visitLog: [],          // 访问记录
                receivedHelp: [],      // 收到的互助
                friendRequests: [],    // 好友申请
                totalHelps: 0,         // 总互助次数
                totalVisits: 0,        // 总访问次数
                socialXp: 0            // 社交经验
            };
        }

        // 确保有初始好友（首次自动添加3个）
        if (GameState.social.friends.length === 0) {
            this._autoAddFriends();
        }

        // 重置每日限制
        this._checkDailyReset();

        // 模拟好友活动（每30秒模拟一次好友互助）
        if (!this._simulateInterval) {
            this._simulateInterval = setInterval(() => this._simulateFriendActivity(), 30000);
        }
    },

    // 自动添加初始好友
    _autoAddFriends() {
        const shuffled = [...this.FRIEND_POOL].sort(() => Math.random() - 0.5);
        const initial = shuffled.slice(0, 3);
        initial.forEach(f => {
            GameState.social.friends.push(f.id);
            GameState.social.friendData[f.id] = {
                intimacy: 10,
                lastHelp: null,
                lastVisit: null,
                helpCount: 0,
                addedAt: Date.now()
            };
        });
    },

    // 检查每日重置
    _checkDailyReset() {
        const today = new Date().toDateString();
        if (GameState.social.helpDate !== today) {
            GameState.social.helpDate = today;
            GameState.social.helpToday = 0;
            // 清理旧的接收记录
            GameState.social.receivedHelp = [];
        }
    },

    // 模拟好友活动
    _simulateFriendActivity() {
        if (!GameState.social || GameState.social.friends.length === 0) return;

        // 10%概率有好友来帮忙
        if (Math.random() < 0.1) {
            const friendId = GameState.social.friends[Math.floor(Math.random() * GameState.social.friends.length)];
            const friend = this.FRIEND_POOL.find(f => f.id === friendId);
            const helpType = this.HELP_TYPES[Math.floor(Math.random() * this.HELP_TYPES.length)];

            if (friend && !GameState.social.receivedHelp.find(h => h.friendId === friendId && h.type === helpType.id)) {
                GameState.social.receivedHelp.push({
                    friendId: friendId,
                    friendName: friend.name,
                    friendAvatar: friend.avatar,
                    type: helpType.id,
                    icon: helpType.icon,
                    reward: helpType.goldReward,
                    time: Date.now()
                });

                showNotification(`${friend.avatar} ${friend.name} 帮你${helpType.name}了！+${helpType.goldReward}金币`, 'gold');
                GameState.addGold(helpType.goldReward);
                GameState.addXP(helpType.friendXp);
            }
        }

        // 更新好友在线状态
        this.FRIEND_POOL.forEach(f => {
            if (Math.random() < 0.05) {
                f.online = !f.online;
            }
        });
    },

    // ── 打开社交面板 ──────────────────────────────────────
    openPanel() {
        this.initState();
        showModal('social-modal');
    },

    // 切换标签
    switchTab(tab) {
        this._currentTab = tab;
        document.querySelectorAll('#social-modal .tab-btn').forEach(btn => btn.classList.remove('active'));
        event.target.classList.add('active');
        this.renderPanel();
    },

    // ── 渲染面板 ────────────────────────────────────────
    renderPanel() {
        const content = document.getElementById('social-content');
        if (!content) return;

        switch (this._currentTab) {
            case 'friends': this._renderFriends(content); break;
            case 'visit': this._renderVisit(content); break;
            case 'help': this._renderHelp(content); break;
            case 'ranking': this._renderRanking(content); break;
        }
    },

    // ── 好友列表 ────────────────────────────────────────
    _renderFriends(content) {
        const social = GameState.social;
        const friends = social.friends.map(id => this.FRIEND_POOL.find(f => f.id === id)).filter(Boolean);

        let html = '';

        // 社交统计
        html += `<div style="display:flex;gap:10px;margin-bottom:15px;justify-content:center;flex-wrap:wrap">
            <div style="background:rgba(76,175,80,0.1);border:1px solid rgba(76,175,80,0.3);border-radius:10px;padding:8px 15px;text-align:center">
                <div style="font-size:18px;color:#4CAF50;font-weight:bold">${friends.length}</div>
                <div style="font-size:11px;color:#aaa">好友</div>
            </div>
            <div style="background:rgba(255,215,0,0.1);border:1px solid rgba(255,215,0,0.3);border-radius:10px;padding:8px 15px;text-align:center">
                <div style="font-size:18px;color:#ffd700;font-weight:bold">${social.totalHelps}</div>
                <div style="font-size:11px;color:#aaa">互助次数</div>
            </div>
            <div style="background:rgba(0,191,255,0.1);border:1px solid rgba(0,191,255,0.3);border-radius:10px;padding:8px 15px;text-align:center">
                <div style="font-size:18px;color:#00bfff;font-weight:bold">${social.totalVisits}</div>
                <div style="font-size:11px;color:#aaa">访问次数</div>
            </div>
        </div>`;

        // 收到的互助通知
        if (social.receivedHelp.length > 0) {
            html += `<div style="background:rgba(255,215,0,0.08);border:1px solid rgba(255,215,0,0.2);border-radius:10px;padding:10px;margin-bottom:12px">
                <div style="font-size:13px;color:#ffd700;margin-bottom:6px">📨 收到的互助</div>`;
            social.receivedHelp.forEach(h => {
                html += `<div style="font-size:12px;color:#ddd;margin:3px 0">${h.friendAvatar} ${h.friendName} ${h.icon}${this.HELP_TYPES.find(t=>t.id===h.type)?.name || ''} +${h.reward}💰</div>`;
            });
            html += `</div>`;
        }

        // 添加好友按钮
        html += `<div style="text-align:center;margin-bottom:12px">
            <button class="btn-primary" style="font-size:13px;padding:8px 16px" onclick="SocialSystem.showAddFriend()">➕ 添加好友</button>
        </div>`;

        // 好友列表
        if (friends.length === 0) {
            html += `<div style="color:#aaa;text-align:center;padding:30px">还没有好友，点击上方添加吧！</div>`;
        } else {
            friends.forEach(friend => {
                const data = social.friendData[friend.id] || {};
                const intimacyLevel = this._getIntimacyLevel(data.intimacy || 0);
                const onlineClass = friend.online ? 'color:#4CAF50' : 'color:#666';

                html += `<div class="social-friend-card" onclick="SocialSystem.showFriendDetail('${friend.id}')">
                    <div class="social-friend-avatar">${friend.avatar}</div>
                    <div class="social-friend-info">
                        <div class="social-friend-name">
                            ${friend.name}
                            <span style="font-size:10px;${onlineClass};margin-left:4px">${friend.online ? '●在线' : '○离线'}</span>
                        </div>
                        <div class="social-friend-title">Lv.${friend.level} ${friend.title}</div>
                        <div class="social-friend-motto">"${friend.motto}"</div>
                        <div style="display:flex;align-items:center;gap:6px;margin-top:4px">
                            <span style="font-size:11px;color:#ff69b4">${intimacyLevel.icon} ${intimacyLevel.name}</span>
                            <div style="flex:1;background:rgba(255,255,255,0.1);height:4px;border-radius:2px">
                                <div style="width:${Math.min(100, (data.intimacy || 0))}%;height:4px;background:#ff69b4;border-radius:2px"></div>
                            </div>
                        </div>
                    </div>
                    <div class="social-friend-actions">
                        <button class="social-action-btn" onclick="event.stopPropagation();SocialSystem.visitFriend('${friend.id}')" title="访问">🏠</button>
                        <button class="social-action-btn" onclick="event.stopPropagation();SocialSystem.quickHelp('${friend.id}')" title="互助">🤝</button>
                    </div>
                </div>`;
            });
        }

        content.innerHTML = html;
    },

    // ── 访问好友农场 ────────────────────────────────────
    _renderVisit(content) {
        const social = GameState.social;
        const friends = social.friends.map(id => this.FRIEND_POOL.find(f => f.id === id)).filter(Boolean);

        let html = `<div style="text-align:center;margin-bottom:15px;color:#aaa;font-size:13px">
            访问好友农场，欣赏风景并获得灵感奖励！
        </div>`;

        // 今日已访问
        const todayVisited = (social.visitLog || []).filter(v => {
            return new Date(v.time).toDateString() === new Date().toDateString();
        }).map(v => v.friendId);

        friends.forEach(friend => {
            const farm = this.FARM_TEMPLATES[friend.farmStyle] || this.FARM_TEMPLATES.classic;
            const visited = todayVisited.includes(friend.id);

            html += `<div style="background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.1);border-radius:12px;padding:15px;margin-bottom:10px;${visited ? 'opacity:0.6;' : ''}">
                <div style="display:flex;align-items:center;gap:10px;margin-bottom:8px">
                    <span style="font-size:28px">${friend.avatar}</span>
                    <div style="flex:1">
                        <div style="font-size:14px;color:#ddd;font-weight:bold">${friend.name} 的农场</div>
                        <div style="font-size:11px;color:#aaa">Lv.${friend.level} · ${farm.desc}</div>
                    </div>
                    <span style="font-size:10px;color:${friend.online ? '#4CAF50' : '#666'}">${friend.online ? '🟢在线' : '⚫离线'}</span>
                </div>
                <div style="display:flex;gap:6px;margin-bottom:8px;flex-wrap:wrap">
                    ${farm.crops.map(c => CROPS_DATA[c] ? `<span style="font-size:18px" title="${CROPS_DATA[c].name}">${CROPS_DATA[c].icon}</span>` : '').join('')}
                    <span style="color:#555;font-size:11px;padding-top:4px">|</span>
                    ${farm.animals.map(a => ANIMALS_DATA[a] ? `<span style="font-size:18px" title="${ANIMALS_DATA[a].name}">${ANIMALS_DATA[a].icon}</span>` : '').join('')}
                    <span style="color:#555;font-size:11px;padding-top:4px">|</span>
                    ${farm.deco.map(d => `<span style="font-size:16px">${d}</span>`).join('')}
                </div>
                ${visited 
                    ? `<div style="text-align:center;color:#4CAF50;font-size:12px">✅ 今日已访问</div>` 
                    : `<button class="btn-primary" style="width:100%;font-size:13px;padding:8px" onclick="SocialSystem.visitFriend('${friend.id}')">🏠 去访问 (+20金币 +10XP)</button>`
                }
            </div>`;
        });

        if (friends.length === 0) {
            html += `<div style="color:#aaa;text-align:center;padding:30px">还没有好友，先去添加好友吧！</div>`;
        }

        content.innerHTML = html;
    },

    // ── 互助面板 ────────────────────────────────────────
    _renderHelp(content) {
        const social = GameState.social;
        const friends = social.friends.map(id => this.FRIEND_POOL.find(f => f.id === id)).filter(Boolean);
        const remaining = this.DAILY_HELP_LIMIT - social.helpToday;

        let html = `<div style="text-align:center;margin-bottom:15px">
            <div style="font-size:14px;color:#ffd700;margin-bottom:4px">🤝 今日互助额度</div>
            <div style="display:flex;gap:4px;justify-content:center;margin-bottom:8px">
                ${Array(this.DAILY_HELP_LIMIT).fill(0).map((_, i) => 
                    `<div style="width:20px;height:20px;border-radius:50%;background:${i < social.helpToday ? '#4CAF50' : 'rgba(255,255,255,0.1)'};display:flex;align-items:center;justify-content:center;font-size:10px">${i < social.helpToday ? '✓' : ''}</div>`
                ).join('')}
            </div>
            <div style="font-size:12px;color:#aaa">剩余 ${remaining} 次互助机会</div>
        </div>`;

        // 互助类型说明
        html += `<div style="display:flex;gap:8px;margin-bottom:15px;justify-content:center;flex-wrap:wrap">
            ${this.HELP_TYPES.map(h => `
                <div style="background:rgba(255,255,255,0.05);border-radius:8px;padding:6px 10px;text-align:center;min-width:70px">
                    <div style="font-size:18px">${h.icon}</div>
                    <div style="font-size:11px;color:#ddd">${h.name}</div>
                    <div style="font-size:10px;color:#ffd700">+${h.xpReward}XP</div>
                </div>
            `).join('')}
        </div>`;

        // 好友列表 + 互助操作
        friends.forEach(friend => {
            const data = social.friendData[friend.id] || {};
            const todayHelped = (social.helpLog || []).filter(h => 
                h.friendId === friend.id && new Date(h.time).toDateString() === new Date().toDateString()
            );

            html += `<div style="background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.1);border-radius:10px;padding:12px;margin-bottom:8px">
                <div style="display:flex;align-items:center;gap:10px;margin-bottom:8px">
                    <span style="font-size:24px">${friend.avatar}</span>
                    <div style="flex:1">
                        <div style="font-size:13px;color:#ddd;font-weight:bold">${friend.name}</div>
                        <div style="font-size:11px;color:#aaa">累计互助: ${data.helpCount || 0}次</div>
                    </div>
                </div>
                <div style="display:flex;gap:6px;flex-wrap:wrap">
                    ${this.HELP_TYPES.map(h => {
                        const alreadyHelped = todayHelped.find(th => th.type === h.id);
                        return `<button class="btn-primary" style="font-size:11px;padding:5px 10px;flex:1;min-width:60px;${alreadyHelped ? 'opacity:0.4;cursor:not-allowed;' : ''}" 
                            ${alreadyHelped || remaining <= 0 ? 'disabled' : ''} 
                            onclick="SocialSystem.doHelp('${friend.id}','${h.id}')">${h.icon} ${h.name}</button>`;
                    }).join('')}
                </div>
            </div>`;
        });

        if (friends.length === 0) {
            html += `<div style="color:#aaa;text-align:center;padding:30px">还没有好友，先去添加好友吧！</div>`;
        }

        content.innerHTML = html;
    },

    // ── 排行榜 ────────────────────────────────────────
    _renderRanking(content) {
        // 合并模拟好友和玩家数据
        const allPlayers = [];

        // 添加模拟好友
        this.FRIEND_POOL.forEach(f => {
            const isFriend = GameState.social.friends.includes(f.id);
            allPlayers.push({
                name: f.name,
                avatar: f.avatar,
                level: f.level,
                score: Math.floor(f.level * f.level * 80 + Math.random() * 5000),
                helpCount: Math.floor(Math.random() * 50 + 10),
                isFriend: isFriend,
                isPlayer: false
            });
        });

        // 添加玩家
        allPlayers.push({
            name: GameState.player.name,
            avatar: '🧑‍🌾',
            level: GameState.player.level,
            score: GameState.player.totalGoldEarned,
            helpCount: GameState.social.totalHelps,
            isFriend: false,
            isPlayer: true
        });

        let html = `<div class="tabs" style="margin-bottom:12px;justify-content:center">
            <button class="tab-btn ${this._rankTab === 'wealth' || !this._rankTab ? 'active' : ''}" onclick="SocialSystem._rankTab='wealth';SocialSystem._renderRanking(document.getElementById('social-content'))">💰 财富榜</button>
            <button class="tab-btn ${this._rankTab === 'level' ? 'active' : ''}" onclick="SocialSystem._rankTab='level';SocialSystem._renderRanking(document.getElementById('social-content'))">⭐ 等级榜</button>
            <button class="tab-btn ${this._rankTab === 'help' ? 'active' : ''}" onclick="SocialSystem._rankTab='help';SocialSystem._renderRanking(document.getElementById('social-content'))">🤝 互助榜</button>
        </div>`;

        // 排序
        const tab = this._rankTab || 'wealth';
        let sorted;
        if (tab === 'level') {
            sorted = [...allPlayers].sort((a, b) => b.level - a.level);
        } else if (tab === 'help') {
            sorted = [...allPlayers].sort((a, b) => b.helpCount - a.helpCount);
        } else {
            sorted = [...allPlayers].sort((a, b) => b.score - a.score);
        }

        // 找到玩家排名
        const playerRank = sorted.findIndex(p => p.isPlayer) + 1;

        html += `<div style="text-align:center;margin-bottom:12px;font-size:13px;color:#aaa">
            你的排名: <span style="color:#ffd700;font-weight:bold">#${playerRank}</span> / ${sorted.length}
        </div>`;

        sorted.forEach((entry, i) => {
            const rankIcon = i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `${i + 1}`;
            const rankClass = i === 0 ? 'color:#ffd700' : i === 1 ? 'color:#c0c0c0' : i === 2 ? 'color:#cd7f32' : 'color:#aaa';

            let valueText = '';
            if (tab === 'level') valueText = `Lv.${entry.level}`;
            else if (tab === 'help') valueText = `🤝 ${entry.helpCount}次`;
            else valueText = `💰 ${formatNumber(entry.score)}`;

            html += `<div class="rank-item" style="${entry.isPlayer ? 'background:rgba(76,175,80,0.15);border:1px solid rgba(76,175,80,0.3);' : ''}">
                <div class="rank-num" style="${rankClass};font-size:${i < 3 ? '20px' : '14px'}">${rankIcon}</div>
                <div class="rank-avatar">${entry.avatar}</div>
                <div class="rank-info">
                    <div class="rank-name">${entry.name}${entry.isPlayer ? ' <span style="color:#4CAF50">(你)</span>' : ''}${entry.isFriend ? ' <span style="color:#ff69b4;font-size:10px">♥好友</span>' : ''}</div>
                    <div class="rank-score">${valueText}</div>
                </div>
                ${i < 3 ? `<div style="font-size:20px">${['🏆','🎖️','🏅'][i]}</div>` : ''}
            </div>`;
        });

        content.innerHTML = html;
    },

    // ── 操作方法 ────────────────────────────────────────

    // 访问好友
    visitFriend(friendId) {
        const friend = this.FRIEND_POOL.find(f => f.id === friendId);
        if (!friend) return;

        const social = GameState.social;
        const today = new Date().toDateString();
        const todayVisited = (social.visitLog || []).filter(v => 
            v.friendId === friendId && new Date(v.time).toDateString() === today
        );

        if (todayVisited.length > 0) {
            showNotification('今天已经访问过这位好友了！', '🏠', 'warning');
            return;
        }

        // 记录访问
        social.visitLog.push({ friendId, time: Date.now() });
        social.totalVisits++;

        // 增加亲密度
        if (!social.friendData[friendId]) social.friendData[friendId] = { intimacy: 0, helpCount: 0 };
        social.friendData[friendId].intimacy = Math.min(100, (social.friendData[friendId].intimacy || 0) + 3);
        social.friendData[friendId].lastVisit = Date.now();

        // 奖励
        GameState.addGold(20);
        GameState.addXP(10);

        // 显示访问动画
        this._showVisitAnimation(friend);

        showNotification(`🏠 访问了 ${friend.avatar}${friend.name} 的农场！+20金币 +10XP`, 'gold');
        GameState.save();

        // 刷新面板
        this.renderPanel();
    },

    // 显示访问动画
    _showVisitAnimation(friend) {
        const farm = this.FARM_TEMPLATES[friend.farmStyle] || this.FARM_TEMPLATES.classic;

        const overlay = document.createElement('div');
        overlay.style.cssText = 'position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.85);z-index:600;display:flex;align-items:center;justify-content:center;animation:fadeIn 0.3s ease';
        overlay.innerHTML = `
            <div style="text-align:center;color:white;max-width:350px;padding:30px">
                <div style="font-size:60px;margin-bottom:10px">${friend.avatar}</div>
                <div style="font-size:20px;font-weight:bold;color:#4CAF50;margin-bottom:5px">${friend.name} 的农场</div>
                <div style="font-size:13px;color:#aaa;margin-bottom:15px">${farm.desc}</div>
                <div style="display:flex;gap:8px;justify-content:center;margin-bottom:15px;flex-wrap:wrap">
                    ${farm.crops.map(c => CROPS_DATA[c] ? `<span style="font-size:28px">${CROPS_DATA[c].icon}</span>` : '').join('')}
                    ${farm.animals.map(a => ANIMALS_DATA[a] ? `<span style="font-size:28px">${ANIMALS_DATA[a].icon}</span>` : '').join('')}
                </div>
                <div style="display:flex;gap:6px;justify-content:center;margin-bottom:20px">
                    ${farm.deco.map(d => `<span style="font-size:24px">${d}</span>`).join('')}
                </div>
                <div style="font-size:14px;color:#ffd700;margin-bottom:15px">+20 💰 +10 XP</div>
                <button class="btn-primary" style="padding:10px 30px" onclick="this.parentElement.parentElement.remove()">👋 返回我的农场</button>
            </div>
        `;
        overlay.onclick = (e) => { if (e.target === overlay) overlay.remove(); };
        document.body.appendChild(overlay);

        // 5秒后自动关闭
        setTimeout(() => { if (overlay.parentElement) overlay.remove(); }, 8000);
    },

    // 快速互助
    quickHelp(friendId) {
        // 随机选一种互助类型
        const helpType = this.HELP_TYPES[Math.floor(Math.random() * this.HELP_TYPES.length)];
        this.doHelp(friendId, helpType.id);
    },

    // 执行互助
    doHelp(friendId, helpTypeId) {
        const social = GameState.social;
        this._checkDailyReset();

        if (social.helpToday >= this.DAILY_HELP_LIMIT) {
            showNotification('今日互助次数已用完！', '🤝', 'warning');
            return;
        }

        const friend = this.FRIEND_POOL.find(f => f.id === friendId);
        const helpType = this.HELP_TYPES.find(h => h.id === helpTypeId);
        if (!friend || !helpType) return;

        // 检查是否今天已对该好友做过该类型互助
        const today = new Date().toDateString();
        const alreadyHelped = (social.helpLog || []).find(h => 
            h.friendId === friendId && h.type === helpTypeId && new Date(h.time).toDateString() === today
        );
        if (alreadyHelped) {
            showNotification(`今天已经帮 ${friend.name} ${helpType.name}过了！`, helpType.icon, 'warning');
            return;
        }

        // 记录互助
        social.helpLog.push({ friendId, type: helpTypeId, time: Date.now() });
        social.helpToday++;
        social.totalHelps++;

        // 增加亲密度
        if (!social.friendData[friendId]) social.friendData[friendId] = { intimacy: 0, helpCount: 0 };
        social.friendData[friendId].intimacy = Math.min(100, (social.friendData[friendId].intimacy || 0) + 5);
        social.friendData[friendId].helpCount = (social.friendData[friendId].helpCount || 0) + 1;
        social.friendData[friendId].lastHelp = Date.now();

        // 自己获得奖励
        GameState.addXP(helpType.xpReward);
        if (helpType.goldReward > 0) GameState.addGold(helpType.goldReward);

        // 社交经验
        social.socialXp = (social.socialXp || 0) + helpType.xpReward;

        showNotification(`${helpType.icon} 帮 ${friend.avatar}${friend.name} ${helpType.name}了！+${helpType.xpReward}XP${helpType.goldReward > 0 ? ` +${helpType.goldReward}💰` : ''}`, 'gold');

        // 更新每日任务进度
        GameState.updateQuestProgress('social_help');

        GameState.save();
        this.renderPanel();
    },

    // 显示添加好友面板
    showAddFriend() {
        const social = GameState.social;
        const available = this.FRIEND_POOL.filter(f => !social.friends.includes(f.id));

        if (available.length === 0) {
            showNotification('已经添加了所有好友！', '👥', 'warning');
            return;
        }

        // 推荐3个
        const recommended = available.sort(() => Math.random() - 0.5).slice(0, 3);

        let html = `<div style="text-align:center;margin-bottom:15px">
            <div style="font-size:16px;color:#4CAF50;font-weight:bold;margin-bottom:5px">🔍 推荐好友</div>
            <div style="font-size:12px;color:#aaa">点击添加为好友</div>
        </div>`;

        recommended.forEach(friend => {
            html += `<div style="background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.1);border-radius:10px;padding:12px;margin-bottom:8px;display:flex;align-items:center;gap:12px">
                <span style="font-size:32px">${friend.avatar}</span>
                <div style="flex:1">
                    <div style="font-size:14px;color:#ddd;font-weight:bold">${friend.name}</div>
                    <div style="font-size:11px;color:#aaa">Lv.${friend.level} ${friend.title}</div>
                    <div style="font-size:11px;color:#888;font-style:italic">"${friend.motto}"</div>
                </div>
                <button class="btn-primary" style="font-size:12px;padding:6px 12px" onclick="SocialSystem.addFriend('${friend.id}')">➕ 添加</button>
            </div>`;
        });

        // 替换面板内容
        const content = document.getElementById('social-content');
        content.innerHTML = html + `<div style="text-align:center;margin-top:10px">
            <button class="btn-primary" style="background:rgba(255,255,255,0.1);font-size:12px;padding:6px 14px" onclick="SocialSystem.renderPanel()">← 返回好友列表</button>
        </div>`;
    },

    // 添加好友
    addFriend(friendId) {
        const social = GameState.social;
        if (social.friends.includes(friendId)) {
            showNotification('已经是好友了！', '👥', 'warning');
            return;
        }

        const friend = this.FRIEND_POOL.find(f => f.id === friendId);
        if (!friend) return;

        social.friends.push(friendId);
        social.friendData[friendId] = {
            intimacy: 5,
            lastHelp: null,
            lastVisit: null,
            helpCount: 0,
            addedAt: Date.now()
        };

        showNotification(`🎉 ${friend.avatar} ${friend.name} 成为了你的好友！`, 'gold');
        GameState.save();
        this.renderPanel();
    },

    // 显示好友详情
    showFriendDetail(friendId) {
        const friend = this.FRIEND_POOL.find(f => f.id === friendId);
        const data = GameState.social.friendData[friendId] || {};
        const farm = this.FARM_TEMPLATES[friend.farmStyle] || this.FARM_TEMPLATES.classic;
        const intimacyLevel = this._getIntimacyLevel(data.intimacy || 0);

        const content = document.getElementById('social-content');
        content.innerHTML = `
            <div style="text-align:center;padding:10px">
                <div style="font-size:60px;margin-bottom:8px">${friend.avatar}</div>
                <div style="font-size:20px;font-weight:bold;color:#ddd">${friend.name}</div>
                <div style="font-size:13px;color:#aaa;margin:4px 0">Lv.${friend.level} · ${friend.title}</div>
                <div style="font-size:12px;color:#888;font-style:italic;margin-bottom:15px">"${friend.motto}"</div>
                
                <div style="display:flex;gap:10px;justify-content:center;margin-bottom:15px">
                    <div style="background:rgba(255,105,180,0.1);border:1px solid rgba(255,105,180,0.3);border-radius:10px;padding:10px 15px;text-align:center">
                        <div style="font-size:16px">${intimacyLevel.icon}</div>
                        <div style="font-size:12px;color:#ff69b4">${intimacyLevel.name}</div>
                        <div style="font-size:10px;color:#aaa">亲密度 ${data.intimacy || 0}</div>
                    </div>
                    <div style="background:rgba(255,215,0,0.1);border:1px solid rgba(255,215,0,0.3);border-radius:10px;padding:10px 15px;text-align:center">
                        <div style="font-size:16px">🤝</div>
                        <div style="font-size:12px;color:#ffd700">${data.helpCount || 0}次</div>
                        <div style="font-size:10px;color:#aaa">互助次数</div>
                    </div>
                </div>

                <div style="background:rgba(255,255,255,0.05);border-radius:10px;padding:12px;margin-bottom:15px;text-align:left">
                    <div style="font-size:13px;color:#4CAF50;margin-bottom:8px">🏡 农场概览 · ${farm.desc}</div>
                    <div style="display:flex;gap:6px;flex-wrap:wrap">
                        ${farm.crops.map(c => CROPS_DATA[c] ? `<span style="font-size:22px" title="${CROPS_DATA[c].name}">${CROPS_DATA[c].icon}</span>` : '').join('')}
                        ${farm.animals.map(a => ANIMALS_DATA[a] ? `<span style="font-size:22px" title="${ANIMALS_DATA[a].name}">${ANIMALS_DATA[a].icon}</span>` : '').join('')}
                        ${farm.deco.map(d => `<span style="font-size:20px">${d}</span>`).join('')}
                    </div>
                </div>

                <div style="display:flex;gap:8px;justify-content:center">
                    <button class="btn-primary" onclick="SocialSystem.visitFriend('${friendId}')">🏠 访问农场</button>
                    <button class="btn-gold" onclick="SocialSystem.quickHelp('${friendId}')">🤝 互助</button>
                </div>
                <div style="margin-top:12px">
                    <button class="btn-primary" style="background:rgba(255,255,255,0.1);font-size:12px;padding:6px 14px" onclick="SocialSystem._currentTab='friends';SocialSystem.renderPanel()">← 返回好友列表</button>
                    <button style="background:rgba(255,0,0,0.2);border:1px solid rgba(255,0,0,0.3);color:#f44336;border-radius:8px;padding:6px 14px;cursor:pointer;font-size:12px;margin-left:8px;font-family:inherit" onclick="SocialSystem.removeFriend('${friendId}')">删除好友</button>
                </div>
            </div>
        `;
    },

    // 删除好友
    removeFriend(friendId) {
        const friend = this.FRIEND_POOL.find(f => f.id === friendId);
        if (!friend) return;

        if (!confirm(`确定要删除好友 ${friend.name} 吗？`)) return;

        const social = GameState.social;
        social.friends = social.friends.filter(id => id !== friendId);
        delete social.friendData[friendId];

        showNotification(`已删除好友 ${friend.name}`, '👥');
        GameState.save();

        this._currentTab = 'friends';
        this.renderPanel();
    },

    // ── 工具方法 ────────────────────────────────────────

    // 获取亲密度等级
    _getIntimacyLevel(intimacy) {
        if (intimacy >= 80) return { icon: '💕', name: '挚友', color: '#ff1493' };
        if (intimacy >= 50) return { icon: '❤️', name: '好友', color: '#ff69b4' };
        if (intimacy >= 20) return { icon: '💛', name: '朋友', color: '#ffd700' };
        return { icon: '🤍', name: '初识', color: '#aaa' };
    },

    // 获取未读互助数
    getUnreadCount() {
        return (GameState.social?.receivedHelp || []).length;
    }
};
