// ===== 广告系统 AdSystem =====
// 支持：激励视频广告 / 横幅广告 / 插屏广告
// 默认使用模拟SDK，可替换为 Google AdSense / 穿山甲 / 广点通 等真实SDK

const AdSystem = {

    // ── 配置区（替换为你的真实广告ID）──────────────────────────────
    config: {
        provider: 'mock',           // 'mock' | 'adsense' | 'pangolin' | 'gdtmob'
        adsenseClientId: 'ca-pub-XXXXXXXXXXXXXXXX',   // Google AdSense 发布商ID
        adsenseSlots: {
            banner:       '1234567890',   // 横幅广告位ID
            interstitial: '0987654321',   // 插屏广告位ID
        },
        pangolinAppId:  'YOUR_PANGOLIN_APP_ID',       // 穿山甲AppID
        pangolinSlots: {
            rewarded:     'YOUR_REWARDED_SLOT_ID',
            banner:       'YOUR_BANNER_SLOT_ID',
            interstitial: 'YOUR_INTERSTITIAL_SLOT_ID',
        },
        // 广告冷却时间（秒）
        rewardedCooldown:     300,   // 激励广告：5分钟
        interstitialCooldown: 600,   // 插屏广告：10分钟
        // 激励广告奖励配置
        rewards: {
            energy:  { amount: 30,   icon: '⚡', label: '能量 +30'   },
            gold:    { amount: 500,  icon: '💰', label: '金币 +500'  },
            diamond: { amount: 5,    icon: '💎', label: '钻石 +5'    },
            speedup: { amount: 1,    icon: '⚡', label: '加速卡 ×1'  },
        },
    },

    // ── 内部状态 ────────────────────────────────────────────────────
    _lastRewardedTime:     0,
    _lastInterstitialTime: 0,
    _bannerVisible:        false,
    _adCount:              0,   // 累计展示次数（用于触发插屏）
    _initialized:          false,

    // ── 初始化 ──────────────────────────────────────────────────────
    init() {
        if (this._initialized) return;
        this._initialized = true;

        switch (this.config.provider) {
            case 'adsense':   this._initAdSense();   break;
            case 'pangolin':  this._initPangolin();  break;
            case 'gdtmob':    this._initGDTMob();    break;
            default:          this._initMock();      break;
        }

        // 注入横幅广告容器样式
        this._injectBannerStyles();
        console.log(`[AdSystem] 初始化完成，provider: ${this.config.provider}`);
    },

    // ── Google AdSense 接入 ─────────────────────────────────────────
    _initAdSense() {
        if (document.getElementById('adsense-script')) return;
        const s = document.createElement('script');
        s.id  = 'adsense-script';
        s.async = true;
        s.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${this.config.adsenseClientId}`;
        s.crossOrigin = 'anonymous';
        document.head.appendChild(s);
    },

    // ── 穿山甲（字节）接入 ──────────────────────────────────────────
    _initPangolin() {
        // 引入穿山甲Web SDK后，在此初始化
        // window.tt && tt.init({ appId: this.config.pangolinAppId });
        console.warn('[AdSystem] 穿山甲SDK需手动引入，请参考官方文档');
    },

    // ── 广点通（腾讯）接入 ──────────────────────────────────────────
    _initGDTMob() {
        console.warn('[AdSystem] 广点通SDK需手动引入，请参考官方文档');
    },

    // ── 模拟SDK（开发/演示用）──────────────────────────────────────
    _initMock() {
        console.log('[AdSystem] 使用模拟广告SDK（开发模式）');
    },

    // ── 横幅广告 ────────────────────────────────────────────────────
    showBanner() {
        if (this._bannerVisible) return;
        this._bannerVisible = true;

        const banner = document.getElementById('ad-banner');
        if (!banner) return;

        if (this.config.provider === 'adsense') {
            banner.innerHTML = `
                <ins class="adsbygoogle"
                     style="display:block;width:728px;height:90px"
                     data-ad-client="${this.config.adsenseClientId}"
                     data-ad-slot="${this.config.adsenseSlots.banner}"></ins>`;
            (window.adsbygoogle = window.adsbygoogle || []).push({});
        } else {
            // 模拟横幅
            banner.innerHTML = `
                <div class="ad-mock-banner">
                    <span class="ad-label">广告</span>
                    <span class="ad-mock-text">🌾 田园时光 × 广告合作伙伴 — 点击了解更多</span>
                    <button class="ad-close-btn" onclick="AdSystem.hideBanner()">✕</button>
                </div>`;
        }
        banner.style.display = 'flex';
    },

    hideBanner() {
        this._bannerVisible = false;
        const banner = document.getElementById('ad-banner');
        if (banner) banner.style.display = 'none';
    },

    // ── 插屏广告 ────────────────────────────────────────────────────
    showInterstitial(onClose) {
        const now = Date.now() / 1000;
        if (now - this._lastInterstitialTime < this.config.interstitialCooldown) {
            onClose && onClose();
            return;
        }
        this._lastInterstitialTime = now;

        if (this.config.provider === 'adsense') {
            // AdSense 插屏需要使用 Auto ads 或 Page-level ads
            onClose && onClose();
            return;
        }

        // 模拟插屏
        const overlay = document.getElementById('ad-interstitial');
        overlay.style.display = 'flex';
        let countdown = 5;
        const btn = document.getElementById('ad-interstitial-close');
        btn.textContent = `跳过(${countdown}s)`;
        btn.disabled = true;

        const timer = setInterval(() => {
            countdown--;
            if (countdown <= 0) {
                clearInterval(timer);
                btn.textContent = '关闭广告';
                btn.disabled = false;
                btn.onclick = () => {
                    overlay.style.display = 'none';
                    onClose && onClose();
                };
            } else {
                btn.textContent = `跳过(${countdown}s)`;
            }
        }, 1000);
    },

    // ── 激励视频广告 ────────────────────────────────────────────────
    showRewarded(rewardType, onRewarded, onFailed) {
        const now = Date.now() / 1000;
        const remaining = this.config.rewardedCooldown - (now - this._lastRewardedTime);
        if (remaining > 0) {
            showNotification(`广告冷却中，还需等待 ${Math.ceil(remaining)} 秒`, '⏳', 'warning');
            onFailed && onFailed();
            return;
        }

        const reward = this.config.rewards[rewardType];
        if (!reward) { onFailed && onFailed(); return; }

        if (this.config.provider === 'pangolin' && window.tt) {
            // 穿山甲激励广告
            tt.showRewardedVideoAd({
                adUnitId: this.config.pangolinSlots.rewarded,
                success: () => { this._grantReward(rewardType); onRewarded && onRewarded(reward); },
                fail: () => { onFailed && onFailed(); }
            });
            return;
        }

        // 模拟激励广告弹窗
        this._showMockRewarded(rewardType, reward, onRewarded, onFailed);
    },

    _showMockRewarded(rewardType, reward, onRewarded, onFailed) {
        const overlay = document.getElementById('ad-rewarded');
        const bar     = document.getElementById('ad-rewarded-bar');
        const btn     = document.getElementById('ad-rewarded-close');
        const rewardEl = document.getElementById('ad-rewarded-reward');

        rewardEl.textContent = `观看完成后获得：${reward.icon} ${reward.label}`;
        overlay.style.display = 'flex';
        bar.style.width = '0%';
        btn.style.display = 'none';

        let progress = 0;
        const duration = 5000; // 模拟5秒广告
        const start = Date.now();

        const tick = setInterval(() => {
            progress = Math.min(100, ((Date.now() - start) / duration) * 100);
            bar.style.width = progress + '%';
            if (progress >= 100) {
                clearInterval(tick);
                btn.style.display = 'block';
                btn.textContent = `领取 ${reward.icon} ${reward.label}`;
                btn.onclick = () => {
                    overlay.style.display = 'none';
                    this._lastRewardedTime = Date.now() / 1000;
                    this._grantReward(rewardType);
                    onRewarded && onRewarded(reward);
                };
            }
        }, 100);

        // 关闭按钮（提前关闭不给奖励）
        document.getElementById('ad-rewarded-skip').onclick = () => {
            clearInterval(tick);
            overlay.style.display = 'none';
            showNotification('广告未看完，未获得奖励', '😢', 'warning');
            onFailed && onFailed();
        };
    },

    // ── 发放奖励 ────────────────────────────────────────────────────
    _grantReward(rewardType) {
        this._adCount++;
        const reward = this.config.rewards[rewardType];
        switch (rewardType) {
            case 'energy':
                GameState.recoverEnergy(reward.amount);
                showNotification(`⚡ 广告奖励：能量 +${reward.amount}！`, 'gold');
                break;
            case 'gold':
                GameState.addGold(reward.amount);
                showNotification(`💰 广告奖励：金币 +${reward.amount}！`, 'gold');
                break;
            case 'diamond':
                GameState.addDiamond(reward.amount);
                showNotification(`💎 广告奖励：钻石 +${reward.amount}！`, 'gold');
                break;
            case 'speedup':
                if (!GameState.inventory.tools['speedUp']) GameState.inventory.tools['speedUp'] = 0;
                GameState.inventory.tools['speedUp'] += reward.amount;
                showNotification(`⚡ 广告奖励：加速卡 ×${reward.amount}！`, 'gold');
                break;
        }
        GameState.save();

        // 每5次广告触发一次插屏
        if (this._adCount % 5 === 0) {
            setTimeout(() => this.showInterstitial(), 2000);
        }
    },

    // ── 注入样式 ────────────────────────────────────────────────────
    _injectBannerStyles() {
        if (document.getElementById('ad-styles')) return;
        const style = document.createElement('style');
        style.id = 'ad-styles';
        style.textContent = `
            /* 横幅广告 */
            #ad-banner {
                position: fixed; bottom: 90px; left: 50%; transform: translateX(-50%);
                z-index: 110; display: none; align-items: center; justify-content: center;
            }
            .ad-mock-banner {
                background: rgba(0,0,0,0.85); border: 1px solid rgba(255,255,255,0.15);
                border-radius: 8px; padding: 8px 16px; display: flex; align-items: center;
                gap: 10px; max-width: 90vw; color: white;
            }
            .ad-label {
                background: #ff9800; color: white; font-size: 10px; padding: 2px 5px;
                border-radius: 3px; font-weight: bold; white-space: nowrap;
            }
            .ad-mock-text { font-size: 13px; color: #ddd; flex: 1; }
            .ad-close-btn {
                background: none; border: none; color: #aaa; cursor: pointer;
                font-size: 14px; padding: 2px 5px;
            }
            .ad-close-btn:hover { color: white; }

            /* 激励广告弹窗 */
            #ad-rewarded {
                position: fixed; inset: 0; background: rgba(0,0,0,0.85);
                z-index: 600; display: none; align-items: center; justify-content: center;
            }
            .ad-rewarded-box {
                background: linear-gradient(135deg, #1a1a2e, #16213e);
                border: 2px solid #ffd700; border-radius: 16px;
                padding: 30px; width: 340px; text-align: center; color: white;
            }
            .ad-rewarded-title { font-size: 20px; color: #ffd700; margin-bottom: 8px; }
            .ad-rewarded-desc  { font-size: 13px; color: #aaa; margin-bottom: 20px; }
            .ad-video-mock {
                background: #000; border-radius: 10px; height: 160px;
                display: flex; align-items: center; justify-content: center;
                font-size: 48px; margin-bottom: 15px; position: relative; overflow: hidden;
            }
            .ad-video-mock::after {
                content: 'AD'; position: absolute; top: 8px; right: 8px;
                background: #ff9800; color: white; font-size: 11px; padding: 2px 6px;
                border-radius: 3px; font-weight: bold;
            }
            #ad-rewarded-bar-bg {
                background: rgba(255,255,255,0.1); border-radius: 5px; height: 6px; margin-bottom: 12px;
            }
            #ad-rewarded-bar {
                background: linear-gradient(90deg, #ffd700, #ff9800);
                border-radius: 5px; height: 6px; transition: width 0.1s linear; width: 0%;
            }
            #ad-rewarded-reward { font-size: 15px; color: #4CAF50; margin-bottom: 15px; font-weight: bold; }
            #ad-rewarded-close {
                display: none; width: 100%; padding: 12px;
                background: linear-gradient(135deg, #ffd700, #ff8c00);
                border: none; border-radius: 8px; color: white;
                font-size: 15px; font-weight: bold; cursor: pointer; font-family: inherit;
            }
            #ad-rewarded-close:hover { opacity: 0.9; }
            #ad-rewarded-skip {
                margin-top: 10px; background: none; border: none;
                color: #666; font-size: 12px; cursor: pointer; font-family: inherit;
            }
            #ad-rewarded-skip:hover { color: #aaa; }

            /* 插屏广告弹窗 */
            #ad-interstitial {
                position: fixed; inset: 0; background: rgba(0,0,0,0.9);
                z-index: 600; display: none; align-items: center; justify-content: center;
            }
            .ad-interstitial-box {
                background: #111; border-radius: 12px; width: 360px;
                overflow: hidden; position: relative;
            }
            .ad-interstitial-content {
                height: 300px; display: flex; align-items: center; justify-content: center;
                font-size: 60px; background: linear-gradient(135deg, #1a2a1a, #0d1a0d);
                flex-direction: column; gap: 10px; color: white;
            }
            .ad-interstitial-content p { font-size: 14px; color: #aaa; }
            .ad-interstitial-content .ad-tag {
                position: absolute; top: 10px; left: 10px;
                background: #ff9800; color: white; font-size: 11px;
                padding: 2px 8px; border-radius: 3px; font-weight: bold;
            }
            #ad-interstitial-close {
                width: 100%; padding: 14px;
                background: #222; border: none; color: #aaa;
                font-size: 14px; cursor: pointer; font-family: inherit;
            }
            #ad-interstitial-close:not(:disabled):hover { background: #333; color: white; }
            #ad-interstitial-close:disabled { cursor: not-allowed; }

            /* 激励广告入口按钮 */
            #ad-reward-panel {
                position: fixed; left: 15px; bottom: 95px;
                z-index: 100; display: flex; flex-direction: column; gap: 6px;
            }
            .ad-reward-btn {
                display: flex; align-items: center; gap: 6px;
                background: rgba(0,0,0,0.75); border: 1px solid rgba(255,215,0,0.4);
                border-radius: 20px; padding: 6px 12px; cursor: pointer;
                color: white; font-size: 12px; transition: all 0.2s;
                white-space: nowrap;
            }
            .ad-reward-btn:hover { border-color: #ffd700; background: rgba(255,215,0,0.15); }
            .ad-reward-btn .ad-btn-icon { font-size: 16px; }
            .ad-reward-btn .ad-btn-ad { background: #ff9800; color: white; font-size: 9px; padding: 1px 4px; border-radius: 2px; font-weight: bold; }
            .ad-reward-btn.cooling { opacity: 0.5; cursor: not-allowed; }
        `;
        document.head.appendChild(style);
    },

    // ── 更新冷却状态显示 ────────────────────────────────────────────
    updateCooldownUI() {
        const now = Date.now() / 1000;
        const remaining = Math.max(0, this.config.rewardedCooldown - (now - this._lastRewardedTime));
        const btns = document.querySelectorAll('.ad-reward-btn');
        btns.forEach(btn => {
            if (remaining > 0) {
                btn.classList.add('cooling');
                const label = btn.querySelector('.ad-btn-label');
                if (label) label.textContent = `冷却 ${Math.ceil(remaining)}s`;
            } else {
                btn.classList.remove('cooling');
                const label = btn.querySelector('.ad-btn-label');
                const orig  = btn.dataset.origLabel;
                if (label && orig) label.textContent = orig;
            }
        });
    }
};
