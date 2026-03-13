// ===== 游戏主入口 =====

let lastTime = 0;
let gameRunning = false;

// 游戏主循环
function gameLoop(timestamp) {
    if (!gameRunning) return;
    
    const deltaTime = Math.min((timestamp - lastTime) / 1000, 0.1); // 最大0.1秒
    lastTime = timestamp;
    
    // 更新游戏状态
    GameState.update(deltaTime);
    
    // 更新3D场景
    Scene3D.update(deltaTime);

    // 更新交互增强系统
    if (typeof InteractionEnhance !== 'undefined') {
        InteractionEnhance.update(deltaTime);
    }
    
    // 渲染
    Scene3D.render();
    
    requestAnimationFrame(gameLoop);
}

// 加载进度模拟
function simulateLoading() {
    return new Promise(resolve => {
        const bar = document.getElementById('loading-bar');
        const text = document.getElementById('loading-text');
        const steps = [
            { progress: 20, text: '初始化3D引擎...' },
            { progress: 40, text: '加载农场地形...' },
            { progress: 60, text: '生成作物数据...' },
            { progress: 80, text: '初始化游戏系统...' },
            { progress: 100, text: '准备就绪！' }
        ];
        
        let i = 0;
        const interval = setInterval(() => {
            if (i >= steps.length) {
                clearInterval(interval);
                resolve();
                return;
            }
            bar.style.width = steps[i].progress + '%';
            text.textContent = steps[i].text;
            i++;
        }, 400);
    });
}

// 初始化游戏
async function initGame() {
    try {
        // 显示加载界面
        await simulateLoading();
        
        // 初始化游戏状态
        GameState.init();
        
        // 初始化3D场景
        Scene3D.init();
        
        // 恢复已有的动物到场景
        GameState.animals.forEach(animal => {
            Scene3D.addAnimalMesh(animal);
        });
        
        // 恢复土地状态
        GameState.plots.forEach(plot => {
            if (plot.state !== 'empty') {
                Scene3D.updatePlot(plot);
            }
        });
        
        // 更新UI
        updateHUD();
        updateWeatherDisplay();
        updateSeasonDisplay();

        // 更新扭蛋机代币HUD
        const gachaBadge = document.getElementById('gacha-token-badge');
        if (gachaBadge) gachaBadge.textContent = GameState.gacha?.tokens || 0;

        
        // 隐藏加载界面
        const loading = document.getElementById('loading');
        loading.style.transition = 'opacity 0.5s';
        loading.style.opacity = '0';
        setTimeout(() => { loading.style.display = 'none'; }, 500);
        
        // 启动游戏循环
        gameRunning = true;
        lastTime = performance.now();
        requestAnimationFrame(gameLoop);
        
        // 自动保存（每30秒）
        setInterval(() => {
            GameState.save();
        }, 30000);
        
        // 每日重置检查
        checkDailyReset();
        
        // 初始化新版每日任务
        GameState.refreshDailyTasks();
        
        // 初始化广告系统
        AdSystem.init();
        // 延迟2秒显示横幅广告
        setTimeout(() => AdSystem.showBanner(), 2000);
        // 每秒刷新广告冷却状态
        setInterval(() => AdSystem.updateCooldownUI(), 1000);

        // 初始化加工系统
        if (typeof CookingSystem !== 'undefined') {
            CookingSystem.initState();
        }

        // 初始化社交系统
        if (typeof SocialSystem !== 'undefined') {
            SocialSystem.initState();
        }

        // 初始化订单系统
        if (typeof OrderSystem !== 'undefined') {
            OrderSystem.initState();
        }

        // 初始化装饰系统
        if (typeof DecoSystem !== 'undefined') {
            DecoSystem.initState();
        }

        // 初始化季节活动系统
        if (typeof SeasonalEvents !== 'undefined') {
            SeasonalEvents.initState();
        }

        // 初始化动物培育系统
        if (typeof BreedingSystem !== 'undefined') {
            BreedingSystem.initState();
        }

        // 初始化庆典系统
        if (typeof CelebrationSystem !== 'undefined') {
            CelebrationSystem.initState();
        }

        // 初始化交互增强系统
        if (typeof InteractionEnhance !== 'undefined') {
            InteractionEnhance.init();
        }

        // 初始化音效系统
        if (typeof AudioSystem !== 'undefined') {
            AudioSystem.init();
            AudioSystem.createHUD();
            AudioSystem.hookGameFunctions();
            // 延迟启动BGM和环境音（等待用户首次交互激活AudioContext）
            const startAudio = () => {
                AudioSystem.resume();
                AudioSystem.startBGM();
                AudioSystem.startAmbience(GameState.gameTime.weather, GameState.gameTime.hour);
                document.removeEventListener('click', startAudio);
                document.removeEventListener('touchstart', startAudio);
            };
            document.addEventListener('click', startAudio, { once: false });
            document.addEventListener('touchstart', startAudio, { once: false });
        }

        // 初始化渐进式解锁系统（在所有子系统初始化之后）
        if (typeof UnlockSystem !== 'undefined') {
            UnlockSystem.init();
        }

        // 初始化爆品升级系统（在解锁系统之后）
        if (typeof ViralBoost !== 'undefined') {
            ViralBoost.init();
        }

        // 初始化新手引导系统（放在最后，等其他系统初始化完成）
        if (typeof TutorialSystem !== 'undefined') {
            TutorialSystem.init();
        }

        // 欢迎消息
        setTimeout(() => {
            showNotification('🌾 欢迎来到田园时光！点击土地开始种植吧！', '🌱');
        }, 1000);
        
        setTimeout(() => {
            showNotification('📺 提示：左侧广告按钮可免费获取奖励！', '💡');
        }, 5000);

        
    } catch(e) {
        console.error('游戏初始化失败:', e);
        document.getElementById('loading-text').textContent = '加载失败，请刷新页面重试';
    }
}

// 每日重置
function checkDailyReset() {
    const today = new Date().toDateString();
    const lastReset = localStorage.getItem('farm3d_lastReset');
    
    if (lastReset !== today) {
        localStorage.setItem('farm3d_lastReset', today);
        
        // 重置每日任务
        DAILY_QUESTS.forEach(q => {
            GameState.quests.daily[q.id] = { progress: 0, completed: false, claimed: false };
        });
        
        // 重置动物每日状态
        GameState.animals.forEach(animal => {
            animal.fedToday = false;
            animal.pettedToday = false;
        });

        // 刷新新版每日任务
        GameState.dailyTaskSystem.date = null;
        GameState.refreshDailyTasks();

        // 刷新订单
        if (typeof OrderSystem !== 'undefined' && GameState.orders) {
            GameState.orders.lastRefresh = null;
            OrderSystem.refreshOrders();
        }
        
        // 每周重置（周一）
        const dayOfWeek = new Date().getDay();
        if (dayOfWeek === 1) {
            WEEKLY_QUESTS.forEach(q => {
                GameState.quests.weekly[q.id] = { progress: 0, completed: false, claimed: false };
            });
        }
        
        GameState.save();
        
        if (lastReset) {
            showNotification('🌅 新的一天开始了！每日任务已重置！', '🌅');
        }
    }
}

// 键盘快捷键
document.addEventListener('keydown', (e) => {
    switch(e.key) {
        case '1': selectTool('seed'); break;
        case '2': selectTool('water'); break;
        case '3': selectTool('fertilize'); break;
        case '4': selectTool('harvest'); break;
        case '5': selectTool('feed'); break;
        case '6': selectTool('build'); break;
        case 'Escape': 
            hideAllMenus();
            document.querySelectorAll('.modal.show').forEach(m => m.classList.remove('show'));
            break;
        case 's': case 'S':
            if (e.ctrlKey) { e.preventDefault(); GameState.save(); showNotification('💾 游戏已保存！', '💾'); }
            break;
    }
});

// 页面关闭前保存
window.addEventListener('beforeunload', () => {
    GameState.save();
});

// 页面可见性变化（切换标签页）
document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
        GameState.save();
        gameRunning = false;
    } else {
        gameRunning = true;
        lastTime = performance.now();
        requestAnimationFrame(gameLoop);
        GameState.processOfflineProgress();
        updateHUD();
    }
});

// 启动游戏
window.addEventListener('load', initGame);
