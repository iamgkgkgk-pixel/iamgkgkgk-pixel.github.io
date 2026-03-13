// ===== 新手引导系统 =====

const TutorialSystem = {
    currentStep: -1,
    isActive: false,
    completed: false,
    letterShown: false,
    _overlay: null,
    _bubble: null,
    _letterOverlay: null,

    // 教程步骤
    STEPS: [
        {
            id: 'welcome_letter',
            type: 'letter',
            title: '一封来自爷爷的信',
            content: `亲爱的孩子：\n\n当你读到这封信的时候，爷爷已经搬到海边的小屋享清福去了。\n\n这片农场是爷爷一生的心血，现在交给你了。\n从一颗小萝卜开始，好好打理它吧！\n\n记住：每一粒种子都有无限可能。\n\n—— 爷爷留 🌾`,
            icon: '📜'
        },
        {
            id: 'plant_seed',
            type: 'action',
            message: '🌱 点击任意一块空地，种下你的第一颗萝卜！',
            highlight: 'plots',
            waitFor: 'plant',
            icon: '🌱'
        },
        {
            id: 'water_crop',
            type: 'action',
            message: '💧 很好！现在切换到浇水工具，给萝卜浇水吧！',
            highlight: 'tool-water',
            waitFor: 'water',
            icon: '💧'
        },
        {
            id: 'use_speedup',
            type: 'action',
            message: '⚡ 太棒了！点击刚种下的作物，在弹出菜单中选择「使用加速卡」，让萝卜立刻成熟！',
            highlight: 'plots',
            waitFor: 'speedup_used',
            autoGiveSpeedUp: true,
            icon: '⚡'
        },
        {
            id: 'harvest_crop',
            type: 'action',
            message: '🌾 萝卜熟了！切换到收获工具，收获你的第一颗萝卜！',
            highlight: 'tool-harvest',
            waitFor: 'harvest',
            icon: '🌾'
        },
        {
            id: 'sell_crop',
            type: 'tip',
            message: '💰 恭喜第一次收获！去背包出售收获物赚取金币吧~',
            highlight: 'side-btns',
            duration: 4000,
            icon: '💰'
        },
        {
            id: 'explore_shop',
            type: 'tip',
            message: '🏪 用金币去商店购买更多种子和动物，扩大你的农场！',
            highlight: 'side-btns',
            duration: 4000,
            icon: '🏪'
        },
        {
            id: 'tutorial_complete',
            type: 'celebration',
            message: '🎉 教程完成！田园时光的冒险正式开始！\n\n解锁奖励：💰500金币 + 💎10钻石 + ⚡3加速卡',
            icon: '🎉'
        }
    ],

    // 初始化
    init() {
        const saved = localStorage.getItem('farm3d_tutorial');
        if (saved) {
            const data = JSON.parse(saved);
            this.completed = data.completed || false;
            this.letterShown = data.letterShown || false;
            this.currentStep = data.currentStep || -1;
        }

        if (!this.completed) {
            this._createOverlayElements();
            // 延迟启动让游戏先加载
            setTimeout(() => this.start(), 1500);
        }
    },

    // 创建覆盖层DOM
    _createOverlayElements() {
        // 信件覆盖层
        if (!document.getElementById('tutorial-letter-overlay')) {
            const letter = document.createElement('div');
            letter.id = 'tutorial-letter-overlay';
            letter.style.cssText = 'position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.9);z-index:800;display:none;align-items:center;justify-content:center;flex-direction:column';
            letter.innerHTML = `
                <div id="tutorial-letter-box" style="background:linear-gradient(135deg,#f5e6c8,#e8d5a3);border-radius:12px;padding:30px 35px;max-width:380px;color:#4a3520;font-size:15px;line-height:1.8;box-shadow:0 10px 40px rgba(0,0,0,0.5);position:relative;transform:rotate(-1deg)">
                    <div id="tutorial-letter-title" style="font-size:20px;font-weight:bold;color:#8B4513;margin-bottom:15px;text-align:center"></div>
                    <div id="tutorial-letter-content" style="white-space:pre-line;font-family:cursive,'KaiTi',serif"></div>
                    <div style="text-align:center;margin-top:20px">
                        <button onclick="TutorialSystem.closeLetter()" style="background:linear-gradient(135deg,#4CAF50,#2E7D32);border:none;color:white;padding:12px 30px;border-radius:8px;font-size:15px;cursor:pointer;font-family:inherit">开始新的旅程 🌾</button>
                    </div>
                </div>
            `;
            document.body.appendChild(letter);
            this._letterOverlay = letter;
        }

        // 气泡提示
        if (!document.getElementById('tutorial-bubble')) {
            const bubble = document.createElement('div');
            bubble.id = 'tutorial-bubble';
            bubble.style.cssText = 'position:fixed;z-index:700;display:none;pointer-events:none';
            bubble.innerHTML = `
                <div style="background:linear-gradient(135deg,#1a3a1a,#0d2a0d);border:2px solid #4CAF50;border-radius:16px;padding:15px 20px;max-width:320px;color:white;font-size:14px;line-height:1.6;box-shadow:0 8px 25px rgba(0,0,0,0.5)">
                    <div id="tutorial-bubble-icon" style="font-size:24px;margin-bottom:5px"></div>
                    <div id="tutorial-bubble-text"></div>
                </div>
                <div style="width:0;height:0;border-left:12px solid transparent;border-right:12px solid transparent;border-top:12px solid #4CAF50;margin-left:30px"></div>
            `;
            document.body.appendChild(bubble);
            this._bubble = bubble;
        }

        // 庆祝层
        if (!document.getElementById('tutorial-celebration')) {
            const celeb = document.createElement('div');
            celeb.id = 'tutorial-celebration';
            celeb.style.cssText = 'position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.85);z-index:800;display:none;align-items:center;justify-content:center;flex-direction:column';
            celeb.innerHTML = `
                <div style="text-align:center;animation:tutorialCelebPop 0.6s ease">
                    <div style="font-size:80px;margin-bottom:15px">🎉</div>
                    <div style="font-size:28px;font-weight:bold;color:#ffd700;margin-bottom:10px">教程完成！</div>
                    <div id="tutorial-celeb-text" style="font-size:15px;color:#ddd;line-height:1.8;white-space:pre-line;margin-bottom:20px"></div>
                    <button onclick="TutorialSystem.finishCelebration()" style="background:linear-gradient(135deg,#ffd700,#ff8c00);border:none;color:#1a0a00;padding:14px 40px;border-radius:12px;font-size:16px;font-weight:bold;cursor:pointer;font-family:inherit">开启冒险！</button>
                </div>
            `;
            document.body.appendChild(celeb);
        }

        // CSS动画
        if (!document.getElementById('tutorial-css')) {
            const style = document.createElement('style');
            style.id = 'tutorial-css';
            style.textContent = `
                @keyframes tutorialCelebPop { 0%{transform:scale(0);opacity:0} 60%{transform:scale(1.1)} 100%{transform:scale(1);opacity:1} }
                @keyframes tutorialPulse { 0%,100%{box-shadow:0 0 0 0 rgba(76,175,80,0.4)} 50%{box-shadow:0 0 0 15px rgba(76,175,80,0)} }
                .tutorial-highlight { animation: tutorialPulse 1.5s infinite !important; outline: 3px solid #4CAF50 !important; outline-offset: 3px !important; }
            `;
            document.head.appendChild(style);
        }
    },

    // 开始教程
    start() {
        if (this.completed) return;
        this.isActive = true;
        this.currentStep = 0;
        this.executeStep();
    },

    // 执行当前步骤
    executeStep() {
        if (this.currentStep >= this.STEPS.length) {
            this.complete();
            return;
        }

        const step = this.STEPS[this.currentStep];

        switch (step.type) {
            case 'letter':
                this.showLetter(step);
                break;
            case 'action':
                this.showActionStep(step);
                break;
            case 'tip':
                this.showTip(step);
                break;
            case 'celebration':
                this.showCelebration(step);
                break;
        }

        this._save();
    },

    // 显示信件
    showLetter(step) {
        const overlay = document.getElementById('tutorial-letter-overlay');
        document.getElementById('tutorial-letter-title').textContent = step.title;
        document.getElementById('tutorial-letter-content').textContent = step.content;
        overlay.style.display = 'flex';
    },

    closeLetter() {
        const overlay = document.getElementById('tutorial-letter-overlay');
        overlay.style.display = 'none';
        this.letterShown = true;
        this.currentStep++;
        this.executeStep();
    },

    // 显示操作步骤
    showActionStep(step) {
        // 给免费加速卡
        if (step.autoGiveSpeedUp) {
            if (!GameState.inventory.tools['speedUp']) GameState.inventory.tools['speedUp'] = 0;
            GameState.inventory.tools['speedUp'] += 1;
            showNotification('🎁 获得免费加速卡×1！', 'gold');
        }

        this._showBubble(step.message, step.icon);

        // 高亮目标
        if (step.highlight === 'plots') {
            // 不高亮特定DOM，气泡会指向画布中央
        } else if (step.highlight) {
            const el = document.getElementById(step.highlight);
            if (el) el.classList.add('tutorial-highlight');
        }
    },

    // 显示提示
    showTip(step) {
        this._showBubble(step.message, step.icon);
        setTimeout(() => {
            this._hideBubble();
            this.currentStep++;
            this.executeStep();
        }, step.duration || 3000);
    },

    // 显示庆祝
    showCelebration(step) {
        this._hideBubble();
        const overlay = document.getElementById('tutorial-celebration');
        document.getElementById('tutorial-celeb-text').textContent = step.message.replace('🎉 教程完成！', '');
        overlay.style.display = 'flex';

        // 发放奖励
        GameState.addGold(500);
        GameState.addDiamond(10);
        if (!GameState.inventory.tools['speedUp']) GameState.inventory.tools['speedUp'] = 0;
        GameState.inventory.tools['speedUp'] += 3;
    },

    finishCelebration() {
        document.getElementById('tutorial-celebration').style.display = 'none';
        this.complete();
    },

    // 气泡显示/隐藏 - 优化为顶部横幅式，不遮挡操作区
    _showBubble(text, icon) {
        const bubble = document.getElementById('tutorial-bubble');
        if (!bubble) return;
        document.getElementById('tutorial-bubble-text').textContent = text;
        document.getElementById('tutorial-bubble-icon').textContent = icon || '';
        bubble.style.display = 'block';
        bubble.style.left = '50%';
        bubble.style.top = '120px';
        bubble.style.transform = 'translateX(-50%)';
        bubble.style.bottom = 'auto';
    },

    _hideBubble() {
        const bubble = document.getElementById('tutorial-bubble');
        if (bubble) bubble.style.display = 'none';
        // 移除所有高亮
        document.querySelectorAll('.tutorial-highlight').forEach(el => el.classList.remove('tutorial-highlight'));
    },

    // 通知系统某操作已完成
    notifyAction(action) {
        if (!this.isActive || this.completed) return;

        const step = this.STEPS[this.currentStep];
        if (!step || step.type !== 'action') return;

        if (step.waitFor === action) {
            this._hideBubble();
            this.currentStep++;
            setTimeout(() => this.executeStep(), 800);
        }
    },

    // 完成教程
    complete() {
        this.completed = true;
        this.isActive = false;
        this._hideBubble();
        this._save();
        showNotification('🎓 新手教程已完成！享受田园时光吧！', 'gold');
    },

    // 保存
    _save() {
        localStorage.setItem('farm3d_tutorial', JSON.stringify({
            completed: this.completed,
            letterShown: this.letterShown,
            currentStep: this.currentStep
        }));
    }
};
