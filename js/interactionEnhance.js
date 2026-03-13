// ===== HUD布局交互函数 =====

// 左侧功能抽屉开关
let _leftDrawerOpen = false;
function toggleLeftDrawer() {
    _leftDrawerOpen = !_leftDrawerOpen;
    const items = document.getElementById('left-drawer-items');
    const icon = document.getElementById('drawer-toggle-icon');
    if (_leftDrawerOpen) {
        items.classList.remove('left-drawer-collapsed');
        items.classList.add('left-drawer-expanded');
        icon.textContent = '✕';
    } else {
        items.classList.remove('left-drawer-expanded');
        items.classList.add('left-drawer-collapsed');
        icon.textContent = '📦';
    }
}

// 右侧更多面板开关
let _sideMoreOpen = false;
function toggleSideMore() {
    _sideMoreOpen = !_sideMoreOpen;
    const panel = document.getElementById('side-more-panel');
    const toggleBtn = document.getElementById('side-more-toggle');
    const icon = document.getElementById('side-more-icon');
    if (_sideMoreOpen) {
        panel.classList.add('show');
        panel.style.display = 'flex';
        icon.textContent = '✕';
        // 计算位置：对齐到 "更多" 按钮的位置
        const btnRect = toggleBtn.getBoundingClientRect();
        panel.style.top = (btnRect.top - 10) + 'px';
    } else {
        panel.classList.remove('show');
        panel.style.display = 'none';
        icon.textContent = '⋯';
    }
}

// 广告奖励面板开关
let _adRewardOpen = false;
function toggleAdRewardPanel() {
    _adRewardOpen = !_adRewardOpen;
    const list = document.getElementById('ad-reward-list');
    if (_adRewardOpen) {
        list.classList.add('show');
        list.style.display = 'flex';
    } else {
        list.classList.remove('show');
        list.style.display = 'none';
    }
}

// 点击空白区域自动关闭所有展开面板
document.addEventListener('click', (e) => {
    // 左侧抽屉
    if (_leftDrawerOpen) {
        const drawer = document.getElementById('left-drawer');
        if (drawer && !drawer.contains(e.target)) {
            toggleLeftDrawer();
        }
    }
    // 右侧更多
    if (_sideMoreOpen) {
        const panel = document.getElementById('side-more-panel');
        const toggle = document.getElementById('side-more-toggle');
        if (panel && toggle && !panel.contains(e.target) && !toggle.contains(e.target)) {
            toggleSideMore();
        }
    }
    // 广告面板
    if (_adRewardOpen) {
        const adPanel = document.getElementById('ad-reward-panel');
        if (adPanel && !adPanel.contains(e.target)) {
            toggleAdRewardPanel();
        }
    }
});

// ===== 交互增强系统 =====
// 金牌交互设计师优化方案实现
// Phase 1-4: 菜单锚定、通知分级、相机增强、进度环、动物气泡、Juice动效、迷你地图

const InteractionEnhance = {

    // ============================
    // Phase 1: 3D锚定菜单系统
    // ============================
    _anchorPlotId: -1,
    _anchorAnimalId: -1,
    _menuVisible: false,
    _animalMenuVisible: false,

    // 将3D世界坐标投影到屏幕坐标
    worldToScreen(worldPos) {
        const vec = new THREE.Vector3(worldPos.x, worldPos.y + 1.5, worldPos.z);
        vec.project(Scene3D.camera);
        return {
            x: (vec.x * 0.5 + 0.5) * window.innerWidth,
            y: (-vec.y * 0.5 + 0.5) * window.innerHeight
        };
    },

    // 每帧更新菜单位置（锚定3D空间 + 安全区域检测）
    updateMenuAnchor() {
        if (this._menuVisible && this._anchorPlotId >= 0) {
            const plotMesh = Scene3D.plotMeshes[this._anchorPlotId];
            if (plotMesh) {
                const screen = this.worldToScreen(plotMesh.position);
                const menu = document.getElementById('land-menu');
                const menuW = menu.offsetWidth || 160;
                const menuH = menu.offsetHeight || 200;
                // 安全区域计算
                const safeZone = this._getSafeZone();
                let left = screen.x - menuW / 2;
                let top = screen.y - menuH - 20;
                // 边界保护 + 安全区域避让
                left = Math.max(safeZone.left, Math.min(window.innerWidth - menuW - safeZone.right, left));
                top = Math.max(safeZone.top, Math.min(window.innerHeight - menuH - safeZone.bottom, top));
                // 如果菜单在上方放不下，放到下方
                if (top < safeZone.top) {
                    top = screen.y + 20;
                }
                menu.style.left = left + 'px';
                menu.style.top = top + 'px';
            }
        }
        if (this._animalMenuVisible && this._anchorAnimalId >= 0) {
            const animalMesh = Scene3D.animalMeshes.find(m => m.userData.animalId === this._anchorAnimalId);
            if (animalMesh) {
                const screen = this.worldToScreen(animalMesh.position);
                const menu = document.getElementById('animal-menu');
                const menuW = menu.offsetWidth || 160;
                const menuH = menu.offsetHeight || 200;
                const safeZone = this._getSafeZone();
                let left = screen.x - menuW / 2;
                let top = screen.y - menuH - 20;
                left = Math.max(safeZone.left, Math.min(window.innerWidth - menuW - safeZone.right, left));
                top = Math.max(safeZone.top, Math.min(window.innerHeight - menuH - safeZone.bottom, top));
                if (top < safeZone.top) {
                    top = screen.y + 20;
                }
                menu.style.left = left + 'px';
                menu.style.top = top + 'px';
            }
        }
    },

    // 计算安全区域边距（避开各种HUD元素）
    _getSafeZone() {
        const isMobile = window.innerWidth <= 600;
        return {
            top: 70,      // 顶部HUD栏 + 等级条
            bottom: isMobile ? 80 : 100, // 底部工具栏 + 能量条
            left: 70,     // 左侧抽屉菜单
            right: 70     // 右侧面板按钮
        };
    },

    // 增强版showLandMenu - 带弹出动画和3D锚定
    enhanceShowLandMenu() {
        const origShowLandMenu = window.showLandMenu;
        window.showLandMenu = (plotId, x, y) => {
            this._anchorPlotId = plotId;
            this._menuVisible = true;
            origShowLandMenu(plotId, x, y);
            // 应用弹出动画
            const menu = document.getElementById('land-menu');
            menu.classList.remove('menu-exit');
            menu.classList.add('menu-enter');
            // 立即用3D投影修正位置
            this.updateMenuAnchor();
        };
    },

    // 增强版showAnimalMenu
    enhanceShowAnimalMenu() {
        const origShowAnimalMenu = window.showAnimalMenu;
        window.showAnimalMenu = (animalId, x, y) => {
            this._anchorAnimalId = animalId;
            this._animalMenuVisible = true;
            origShowAnimalMenu(animalId, x, y);
            const menu = document.getElementById('animal-menu');
            menu.classList.remove('menu-exit');
            menu.classList.add('menu-enter');
            this.updateMenuAnchor();
        };
    },

    // 增强版hideAllMenus - 带关闭动画
    enhanceHideAllMenus() {
        const origHide = window.hideAllMenus;
        window.hideAllMenus = () => {
            const landMenu = document.getElementById('land-menu');
            const animalMenu = document.getElementById('animal-menu');
            // 关闭动画
            if (landMenu.style.display === 'block') {
                landMenu.classList.remove('menu-enter');
                landMenu.classList.add('menu-exit');
                setTimeout(() => {
                    landMenu.style.display = 'none';
                    landMenu.classList.remove('menu-exit');
                }, 120);
            } else {
                landMenu.style.display = 'none';
            }
            if (animalMenu.style.display === 'block') {
                animalMenu.classList.remove('menu-enter');
                animalMenu.classList.add('menu-exit');
                setTimeout(() => {
                    animalMenu.style.display = 'none';
                    animalMenu.classList.remove('menu-exit');
                }, 120);
            } else {
                animalMenu.style.display = 'none';
            }
            document.getElementById('crop-info').style.display = 'none';
            this._menuVisible = false;
            this._animalMenuVisible = false;
        };
    },

    // ============================
    // Phase 1: 通知分级系统
    // ============================
    _notifQueue: [],         // 聚合队列
    _notifFlushTimer: null,
    _notifLog: [],           // 通知历史
    _MAX_LOG: 50,

    enhanceNotifications() {
        const origNotify = window.showNotification;
        window.showNotification = (text, icon = '📢', type = '') => {
            // 分级：gold → 重要级, warning/error → 普通级, 其他 → 普通级
            const level = type === 'gold' ? 'important' : (type === 'warning' || type === 'error') ? type : 'normal';

            // 添加到历史
            this._notifLog.unshift({ text, icon, type: level, time: Date.now() });
            if (this._notifLog.length > this._MAX_LOG) this._notifLog.pop();

            // 聚合：2秒内相同类型合并
            this._notifQueue.push({ text, icon, type, level });

            if (!this._notifFlushTimer) {
                this._notifFlushTimer = setTimeout(() => {
                    this._flushNotifications();
                    this._notifFlushTimer = null;
                }, 150); // 150ms聚合窗口
            }
        };
    },

    _flushNotifications() {
        const queue = this._notifQueue.splice(0);
        if (queue.length === 0) return;

        // 合并同类通知
        if (queue.length > 2) {
            // 多条通知合并为摘要
            const goldCount = queue.filter(n => n.level === 'important').length;
            const normalCount = queue.length - goldCount;
            const container = document.getElementById('notifications');

            if (goldCount > 0) {
                const first = queue.find(n => n.level === 'important');
                this._createNotifEl(first.text, first.icon, first.type, 'important');
            }
            if (normalCount > 1) {
                this._createNotifEl(`还有 ${normalCount} 条操作记录`, '📋', '', 'normal');
            } else if (normalCount === 1) {
                const n = queue.find(n => n.level !== 'important');
                this._createNotifEl(n.text, n.icon, n.type, n.level);
            }
        } else {
            queue.forEach(n => {
                this._createNotifEl(n.text, n.icon, n.type, n.level);
            });
        }
    },

    _createNotifEl(text, icon, type, level) {
        const container = document.getElementById('notifications');
        const notif = document.createElement('div');

        // 分级样式
        let extraClass = type;
        let duration = 3000;
        if (level === 'important') {
            extraClass = 'gold notif-important';
            duration = 4000;
        } else if (level === 'normal') {
            duration = 2000;
        }

        notif.className = `notification ${extraClass}`;
        notif.innerHTML = `<span>${icon}</span><span>${text}</span>`;
        container.appendChild(notif);

        // 限制最大叠加数
        while (container.children.length > 4) {
            container.removeChild(container.firstChild);
        }

        setTimeout(() => {
            notif.style.animation = 'slideOut 0.3s ease forwards';
            setTimeout(() => notif.remove(), 300);
        }, duration);
    },

    // ============================
    // Phase 2: 相机增强 (平移 + 聚焦 + 双指)
    // ============================
    _lookAtTarget: new THREE.Vector3(0, 0, 0),
    _lookAtCurrent: new THREE.Vector3(0, 0, 0),
    _isFocusing: false,
    _focusPlotId: -1,
    _lastClickTime: 0,
    _lastClickPlotId: -1,
    _pinchStartDist: 0,
    _panStartX: 0,
    _panStartZ: 0,

    enhanceCamera() {
        // 替换updateCamera，支持lookAt目标平滑过渡
        const origUpdate = Scene3D.updateCamera.bind(Scene3D);
        Scene3D.updateCamera = () => {
            const x = Math.sin(Scene3D.cameraAngle) * Scene3D.cameraDistance;
            const z = Math.cos(Scene3D.cameraAngle) * Scene3D.cameraDistance;
            Scene3D.camera.position.set(
                x + this._lookAtCurrent.x,
                Scene3D.cameraHeight,
                z + this._lookAtCurrent.z
            );
            Scene3D.camera.lookAt(this._lookAtCurrent);
        };

        // 增强触控手势：双指捏合缩放 + 双指平移
        const canvas = document.getElementById('gameCanvas');

        canvas.addEventListener('touchstart', (e) => {
            if (e.touches.length === 2) {
                e.preventDefault();
                const t1 = e.touches[0], t2 = e.touches[1];
                this._pinchStartDist = Math.hypot(t1.clientX - t2.clientX, t1.clientY - t2.clientY);
                this._panStartX = (t1.clientX + t2.clientX) / 2;
                this._panStartZ = (t1.clientY + t2.clientY) / 2;
                Scene3D.isDragging = true; // 阻止单指逻辑
            }
        }, { passive: false });

        canvas.addEventListener('touchmove', (e) => {
            if (e.touches.length === 2) {
                e.preventDefault();
                const t1 = e.touches[0], t2 = e.touches[1];
                // 捏合缩放
                const dist = Math.hypot(t1.clientX - t2.clientX, t1.clientY - t2.clientY);
                const scale = this._pinchStartDist / dist;
                Scene3D.cameraDistance = Math.max(8, Math.min(30, Scene3D.cameraDistance * scale));
                this._pinchStartDist = dist;

                // 双指平移
                const cx = (t1.clientX + t2.clientX) / 2;
                const cy = (t1.clientY + t2.clientY) / 2;
                const dx = cx - this._panStartX;
                const dy = cy - this._panStartZ;
                // 转换为世界空间平移（基于相机朝向）
                const angle = Scene3D.cameraAngle;
                this._lookAtTarget.x -= (dx * Math.cos(angle) + dy * Math.sin(angle)) * 0.03;
                this._lookAtTarget.z -= (-dx * Math.sin(angle) + dy * Math.cos(angle)) * 0.03;
                // 限制范围
                this._lookAtTarget.x = Math.max(-12, Math.min(12, this._lookAtTarget.x));
                this._lookAtTarget.z = Math.max(-12, Math.min(12, this._lookAtTarget.z));
                this._panStartX = cx;
                this._panStartZ = cy;

                Scene3D.updateCamera();
            }
        }, { passive: false });

        // 右键拖拽平移（桌面端）
        canvas.addEventListener('mousedown', (e) => {
            if (e.button === 2) {
                e.preventDefault();
                this._rightDragging = true;
                this._rightDragX = e.clientX;
                this._rightDragY = e.clientY;
            }
        });
        canvas.addEventListener('mousemove', (e) => {
            if (this._rightDragging) {
                const dx = e.clientX - this._rightDragX;
                const dy = e.clientY - this._rightDragY;
                const angle = Scene3D.cameraAngle;
                this._lookAtTarget.x -= (dx * Math.cos(angle) + dy * Math.sin(angle)) * 0.03;
                this._lookAtTarget.z -= (-dx * Math.sin(angle) + dy * Math.cos(angle)) * 0.03;
                this._lookAtTarget.x = Math.max(-12, Math.min(12, this._lookAtTarget.x));
                this._lookAtTarget.z = Math.max(-12, Math.min(12, this._lookAtTarget.z));
                this._rightDragX = e.clientX;
                this._rightDragY = e.clientY;
                Scene3D.updateCamera();
            }
        });
        canvas.addEventListener('mouseup', (e) => {
            if (e.button === 2) this._rightDragging = false;
        });
        canvas.addEventListener('contextmenu', (e) => e.preventDefault());

        // 双击聚焦 - 拦截 onPlotClick
        const origOnPlotClick = window.onPlotClick;
        window.onPlotClick = (plotId, mouseX, mouseY) => {
            const now = Date.now();
            if (this._lastClickPlotId === plotId && now - this._lastClickTime < 400) {
                // 双击！聚焦该土地
                this.focusOnPlot(plotId);
                this._lastClickTime = 0;
                return;
            }
            this._lastClickTime = now;
            this._lastClickPlotId = plotId;
            origOnPlotClick(plotId, mouseX, mouseY);
        };

        // 双击空白回到中心
        const origHandleClick = Scene3D.handleClick.bind(Scene3D);
        Scene3D.handleClick = (e) => {
            const now = Date.now();
            if (now - this._lastEmptyClickTime < 400) {
                // 双击空白 → 回到中心
                this._lookAtTarget.set(0, 0, 0);
                Scene3D.cameraDistance = 18;
                Scene3D.cameraHeight = 12;
                this._isFocusing = false;
                this._lastEmptyClickTime = 0;
                return;
            }
            this._lastEmptyClickTime = now;
            origHandleClick(e);
        };
        this._lastEmptyClickTime = 0;
    },

    focusOnPlot(plotId) {
        const plotMesh = Scene3D.plotMeshes[plotId];
        if (!plotMesh) return;
        this._lookAtTarget.copy(plotMesh.position);
        this._lookAtTarget.y = 0;
        Scene3D.cameraDistance = 10;
        Scene3D.cameraHeight = 8;
        this._isFocusing = true;
        this._focusPlotId = plotId;
    },

    // 平滑过渡lookAt目标
    updateCameraSmooth(dt) {
        const speed = 5 * dt;
        this._lookAtCurrent.lerp(this._lookAtTarget, Math.min(1, speed));
        Scene3D.updateCamera();
    },

    // ============================
    // Phase 2: 3D空间作物进度环 + 成熟光效
    // ============================
    _progressRings: [],
    _matureGlows: [],

    createProgressRing(plotId) {
        const plotMesh = Scene3D.plotMeshes[plotId];
        if (!plotMesh) return;

        // 环形进度 - RingGeometry
        const ringGeo = new THREE.RingGeometry(0.45, 0.55, 32, 1, 0, Math.PI * 2);
        const ringMat = new THREE.MeshBasicMaterial({
            color: 0x44ff44,
            side: THREE.DoubleSide,
            transparent: true,
            opacity: 0.7
        });
        const ring = new THREE.Mesh(ringGeo, ringMat);
        ring.rotation.x = -Math.PI / 2;
        ring.position.y = 2.0;
        ring.userData = { plotId, type: 'progressRing' };
        plotMesh.add(ring);
        this._progressRings[plotId] = ring;

        // 背景环
        const bgGeo = new THREE.RingGeometry(0.45, 0.55, 32);
        const bgMat = new THREE.MeshBasicMaterial({
            color: 0x333333,
            side: THREE.DoubleSide,
            transparent: true,
            opacity: 0.3
        });
        const bgRing = new THREE.Mesh(bgGeo, bgMat);
        bgRing.rotation.x = -Math.PI / 2;
        bgRing.position.y = 1.99;
        plotMesh.add(bgRing);
        ring.userData.bgRing = bgRing;
    },

    updateProgressRings() {
        GameState.plots.forEach((plot, i) => {
            const ring = this._progressRings[i];

            if (plot.state === 'empty') {
                if (ring) {
                    ring.visible = false;
                    if (ring.userData.bgRing) ring.userData.bgRing.visible = false;
                }
                // 移除成熟光效
                if (this._matureGlows[i]) {
                    const plotMesh = Scene3D.plotMeshes[i];
                    if (plotMesh) plotMesh.remove(this._matureGlows[i]);
                    this._matureGlows[i] = null;
                }
                return;
            }

            // 创建进度环（如果不存在）
            if (!ring) {
                this.createProgressRing(i);
            }

            const r = this._progressRings[i];
            if (!r) return;

            // 相机距离判断：远距离时隐藏
            const plotMesh = Scene3D.plotMeshes[i];
            const camDist = Scene3D.camera.position.distanceTo(plotMesh.position);
            const shouldShow = camDist < 20;

            if (plot.state === 'ready') {
                // 成熟：隐藏进度环，显示金色脉冲光效
                r.visible = false;
                if (r.userData.bgRing) r.userData.bgRing.visible = false;

                if (!this._matureGlows[i] && shouldShow) {
                    const glowGeo = new THREE.SphereGeometry(0.8, 12, 12);
                    const glowMat = new THREE.MeshBasicMaterial({
                        color: 0xffd700,
                        transparent: true,
                        opacity: 0.15
                    });
                    const glow = new THREE.Mesh(glowGeo, glowMat);
                    glow.position.y = 1.3;
                    plotMesh.add(glow);
                    this._matureGlows[i] = glow;
                }
                // 脉冲动画
                if (this._matureGlows[i]) {
                    this._matureGlows[i].visible = shouldShow;
                    const t = Date.now() * 0.003;
                    this._matureGlows[i].material.opacity = 0.1 + Math.sin(t) * 0.08;
                    const s = 0.8 + Math.sin(t) * 0.1;
                    this._matureGlows[i].scale.set(s, s, s);
                }
            } else {
                // 生长中：显示进度环
                r.visible = shouldShow;
                if (r.userData.bgRing) r.userData.bgRing.visible = shouldShow;

                // 更新进度
                const progress = plot.growProgress || 0;
                // 通过修改geometry实现进度效果
                const newGeo = new THREE.RingGeometry(0.45, 0.55, 32, 1, 0, Math.PI * 2 * progress);
                r.geometry.dispose();
                r.geometry = newGeo;

                // 颜色渐变：红→黄→绿
                const hue = progress * 0.33; // 0(红) → 0.33(绿)
                r.material.color.setHSL(hue, 1, 0.5);

                // 移除成熟光效
                if (this._matureGlows[i]) {
                    plotMesh.remove(this._matureGlows[i]);
                    this._matureGlows[i] = null;
                }
            }
        });
    },

    // ============================
    // Phase 2: 动物头顶状态气泡
    // ============================
    _animalBubbles: new Map(), // animalId -> { sprite, type }

    updateAnimalBubbles() {
        GameState.animals.forEach(animal => {
            const mesh = Scene3D.animalMeshes.find(m => m.userData.animalId === animal.id);
            if (!mesh) return;

            const camDist = Scene3D.camera.position.distanceTo(mesh.position);
            if (camDist > 20) {
                // 太远，隐藏气泡
                const existing = this._animalBubbles.get(animal.id);
                if (existing) existing.sprite.visible = false;
                return;
            }

            // 确定显示什么图标
            let bubbleType = '';
            let bubbleIcon = '';
            if (animal.hasProduct && animal.grown) {
                const animalData = ANIMALS_DATA[animal.type];
                bubbleType = 'product';
                bubbleIcon = animalData ? animalData.product : '🥚';
            } else if (!animal.fedToday) {
                bubbleType = 'hungry';
                bubbleIcon = '🍽️';
            } else if (animal.mood > 80) {
                bubbleType = 'happy';
                bubbleIcon = '❤️';
            }

            if (!bubbleType) {
                const existing = this._animalBubbles.get(animal.id);
                if (existing) existing.sprite.visible = false;
                return;
            }

            let bubble = this._animalBubbles.get(animal.id);
            if (!bubble || bubble.type !== bubbleType) {
                // 创建或更新canvas sprite
                if (bubble) mesh.remove(bubble.sprite);

                const canvas = document.createElement('canvas');
                canvas.width = 64;
                canvas.height = 64;
                const ctx = canvas.getContext('2d');
                // 背景圆
                ctx.beginPath();
                ctx.arc(32, 32, 28, 0, Math.PI * 2);
                ctx.fillStyle = bubbleType === 'product' ? 'rgba(255,215,0,0.8)' :
                               bubbleType === 'hungry' ? 'rgba(255,100,50,0.7)' :
                               'rgba(255,100,150,0.7)';
                ctx.fill();
                // emoji
                ctx.font = '28px serif';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText(bubbleIcon, 32, 32);

                const texture = new THREE.CanvasTexture(canvas);
                const spriteMat = new THREE.SpriteMaterial({ map: texture, transparent: true });
                const sprite = new THREE.Sprite(spriteMat);
                sprite.scale.set(0.6, 0.6, 1);
                const heights = { chicken: 1.4, duck: 1.3, sheep: 2.0, cow: 2.2, pig: 1.8 };
                sprite.position.y = (heights[animal.type] || 1.8) + 0.3;
                mesh.add(sprite);

                this._animalBubbles.set(animal.id, { sprite, type: bubbleType });
            }

            bubble = this._animalBubbles.get(animal.id);
            if (bubble) {
                bubble.sprite.visible = true;
                // 轻微上下浮动
                const t = Date.now() * 0.003;
                const baseY = bubble.sprite.position.y;
                bubble.sprite.position.y += Math.sin(t + animal.id * 0.5) * 0.001;
            }
        });
    },

    // 增强动物点击：单击快速操作
    enhanceAnimalClick() {
        const origOnAnimalClick = window.onAnimalClick;
        window.onAnimalClick = (animalId, mouseX, mouseY) => {
            const tool = GameState.currentTool;
            if (tool === 'feed') {
                doFeedAnimal(animalId);
                return;
            }

            const animal = GameState.animals.find(a => a.id === animalId);
            if (!animal) return;

            // 快速操作：有产物→收集，没产物+未喂→喂食，已喂→弹出菜单
            if (animal.hasProduct && animal.grown) {
                doCollectAnimal(animalId);
                return;
            }
            if (!animal.fedToday) {
                doFeedAnimal(animalId);
                return;
            }

            // 其他情况弹出完整菜单
            currentAnimalId = animalId;
            showAnimalMenu(animalId, mouseX, mouseY);
        };
    },

    // ============================
    // Phase 3: Juice动效系统
    // ============================

    // 收获飞金币动画
    createCoinFlyEffect(plotId, goldAmount) {
        const plotMesh = Scene3D.plotMeshes[plotId];
        if (!plotMesh) return;

        // 创建多个金币粒子飞向HUD
        const goldDisplay = document.getElementById('gold-display');
        if (!goldDisplay) return;

        const startScreen = this.worldToScreen(plotMesh.position);
        const endRect = goldDisplay.getBoundingClientRect();
        const endX = endRect.left + endRect.width / 2;
        const endY = endRect.top + endRect.height / 2;

        for (let i = 0; i < Math.min(5, goldAmount > 50 ? 5 : 3); i++) {
            setTimeout(() => {
                const coin = document.createElement('div');
                coin.className = 'flying-coin';
                coin.textContent = '💰';
                coin.style.cssText = `
                    position: fixed;
                    left: ${startScreen.x + (Math.random() - 0.5) * 40}px;
                    top: ${startScreen.y}px;
                    font-size: 24px;
                    z-index: 999;
                    pointer-events: none;
                    transition: all 0.6s cubic-bezier(0.2, 0.8, 0.2, 1);
                `;
                document.body.appendChild(coin);

                requestAnimationFrame(() => {
                    coin.style.left = endX + 'px';
                    coin.style.top = endY + 'px';
                    coin.style.opacity = '0.3';
                    coin.style.transform = 'scale(0.5)';
                });

                setTimeout(() => coin.remove(), 700);
            }, i * 100);
        }

        // "+XX" 数字弹跳
        setTimeout(() => {
            const numEl = document.createElement('div');
            numEl.className = 'gold-bounce';
            numEl.textContent = `+${goldAmount}`;
            numEl.style.cssText = `
                position: fixed;
                left: ${endX}px; top: ${endY - 20}px;
                color: #ffd700; font-size: 18px; font-weight: bold;
                z-index: 999; pointer-events: none;
                animation: goldBounce 0.8s ease forwards;
                text-shadow: 0 0 8px rgba(255,215,0,0.8);
            `;
            document.body.appendChild(numEl);
            setTimeout(() => numEl.remove(), 900);
        }, 400);
    },

    // 增强收获 - 加飞金币
    enhanceHarvest() {
        const origDoHarvest = window.doHarvest;
        window.doHarvest = (plotId) => {
            const plot = GameState.plots[plotId];
            if (plot.state !== 'ready') {
                origDoHarvest(plotId);
                return;
            }
            const crop = CROPS_DATA[plot.crop];
            const goldBefore = GameState.player.gold;
            origDoHarvest(plotId);
            // 收获后计算实际获得金币
            if (crop) {
                const sellPrice = crop.sellPrice || 10;
                this.createCoinFlyEffect(plotId, sellPrice);
            }
        };
    },

    // 增强浇水 - 水滴粒子+相机微震
    enhanceWater() {
        const origDoWater = window.doWater;
        window.doWater = (plotId) => {
            origDoWater(plotId);
            // 相机微震
            this._cameraShake = 0.3;
            this._cameraShakeIntensity = 0.5;
        };
    },

    // 增强加速卡 - 闪电特效
    enhanceSpeedUp() {
        const origUseSpeedUp = window.useSpeedUp;
        window.useSpeedUp = (plotId) => {
            const plot = GameState.plots[plotId];
            if (plot.state === 'empty' || plot.state === 'ready') {
                origUseSpeedUp(plotId);
                return;
            }
            const count = GameState.inventory.tools['speedUp'] || 0;
            if (count <= 0) {
                origUseSpeedUp(plotId);
                return;
            }

            // 闪电特效
            const plotMesh = Scene3D.plotMeshes[plotId];
            if (plotMesh) {
                this._createLightningEffect(plotMesh.position);
            }
            // 相机zoom脉冲
            const origDist = Scene3D.cameraDistance;
            Scene3D.cameraDistance = origDist - 2;
            Scene3D.updateCamera();
            setTimeout(() => {
                Scene3D.cameraDistance = origDist;
                Scene3D.updateCamera();
            }, 400);

            origUseSpeedUp(plotId);
        };
    },

    _createLightningEffect(worldPos) {
        // 闪电粒子
        for (let i = 0; i < 12; i++) {
            const geo = new THREE.SphereGeometry(0.05 + Math.random() * 0.05, 6, 6);
            const mat = new THREE.MeshBasicMaterial({
                color: 0xffff44,
                transparent: true,
                opacity: 1
            });
            const p = new THREE.Mesh(geo, mat);
            p.position.set(
                worldPos.x + (Math.random() - 0.5) * 1.5,
                3 + Math.random() * 3,
                worldPos.z + (Math.random() - 0.5) * 1.5
            );
            p.userData = {
                velocity: new THREE.Vector3((Math.random() - 0.5) * 2, -8 - Math.random() * 5, (Math.random() - 0.5) * 2),
                life: 0.5 + Math.random() * 0.3,
                type: 'particle'
            };
            Scene3D.scene.add(p);
            Scene3D.particles.push(p);
        }

        // 闪光
        const flash = new THREE.PointLight(0xffffaa, 5, 15);
        flash.position.set(worldPos.x, 3, worldPos.z);
        Scene3D.scene.add(flash);
        setTimeout(() => Scene3D.scene.remove(flash), 200);
    },

    // 相机震动
    updateCameraShake(dt) {
        if (this._cameraShake > 0) {
            this._cameraShake -= dt;
            const intensity = this._cameraShakeIntensity * (this._cameraShake / 0.3);
            Scene3D.camera.position.x += (Math.random() - 0.5) * intensity * 0.1;
            Scene3D.camera.position.y += (Math.random() - 0.5) * intensity * 0.05;
        }
    },

    // ============================
    // Phase 4: 农田概况迷你地图
    // ============================
    _miniMapCanvas: null,
    _miniMapCtx: null,

    createMiniMap() {
        const canvas = document.createElement('canvas');
        canvas.id = 'mini-map';
        canvas.width = 100;
        canvas.height = 100;
        canvas.style.cssText = `
            position: fixed; bottom: 88px; right: 15px;
            width: 100px; height: 100px;
            background: rgba(0,0,0,0.6); border-radius: 10px;
            border: 1px solid rgba(255,255,255,0.2);
            z-index: 99; cursor: pointer;
            opacity: 0.7; transition: opacity 0.3s;
        `;
        document.body.appendChild(canvas);
        this._miniMapCanvas = canvas;
        this._miniMapCtx = canvas.getContext('2d');

        // 点击迷你地图跳转相机
        canvas.addEventListener('click', (e) => {
            const rect = canvas.getBoundingClientRect();
            const x = ((e.clientX - rect.left) / rect.width - 0.5) * 24;
            const z = ((e.clientY - rect.top) / rect.height - 0.5) * 24;
            this._lookAtTarget.set(x, 0, z);
            Scene3D.updateCamera();
        });
    },

    updateMiniMap() {
        if (!this._miniMapCtx) return;
        const ctx = this._miniMapCtx;
        const w = 100, h = 100;
        ctx.clearRect(0, 0, w, h);

        // 背景
        ctx.fillStyle = 'rgba(90, 138, 60, 0.4)';
        ctx.fillRect(0, 0, w, h);

        // 土地格子
        const plotPositions = [
            [-5, -5], [0, -5], [5, -5],
            [-5, 0],  [0, 0],  [5, 0],
            [-5, 5],  [0, 5],  [5, 5]
        ];

        plotPositions.forEach(([px, pz], i) => {
            const plot = GameState.plots[i];
            if (!plot) return;
            const sx = (px / 24 + 0.5) * w;
            const sy = (pz / 24 + 0.5) * h;

            // 颜色标识状态
            if (plot.state === 'empty') {
                ctx.fillStyle = 'rgba(139, 69, 19, 0.5)';
            } else if (plot.state === 'ready') {
                ctx.fillStyle = '#ffd700';
                // 闪烁效果
                if (Math.sin(Date.now() * 0.005) > 0) {
                    ctx.fillStyle = '#ffaa00';
                }
            } else if (plot.watered) {
                ctx.fillStyle = '#4488ff';
            } else {
                ctx.fillStyle = '#44aa44';
            }

            ctx.fillRect(sx - 5, sy - 5, 10, 10);
            ctx.strokeStyle = 'rgba(255,255,255,0.3)';
            ctx.strokeRect(sx - 5, sy - 5, 10, 10);
        });

        // 动物位置（小点）
        Scene3D.animalMeshes.forEach(mesh => {
            const sx = (mesh.position.x / 24 + 0.5) * w;
            const sy = (mesh.position.z / 24 + 0.5) * h;
            ctx.fillStyle = '#ff9800';
            ctx.beginPath();
            ctx.arc(sx, sy, 2, 0, Math.PI * 2);
            ctx.fill();
        });

        // 相机朝向指示
        const camX = (this._lookAtCurrent.x / 24 + 0.5) * w;
        const camZ = (this._lookAtCurrent.z / 24 + 0.5) * h;
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(camX, camZ, 4, 0, Math.PI * 2);
        ctx.stroke();
    },

    // ============================
    // 一键收集按钮
    // ============================
    createCollectAllBtn() {
        const btn = document.createElement('button');
        btn.id = 'collect-all-btn';
        btn.innerHTML = '🧺 一键收集';
        btn.style.cssText = `
            position: fixed; bottom: 88px; left: 50%;
            transform: translateX(-50%);
            background: linear-gradient(135deg, #ff8c00, #ffd700);
            border: none; border-radius: 25px; padding: 8px 18px;
            color: #1a0a00; font-size: 13px; font-weight: bold;
            cursor: pointer; z-index: 100; display: none;
            box-shadow: 0 4px 15px rgba(255,140,0,0.4);
            transition: all 0.3s;
            font-family: inherit;
        `;
        btn.addEventListener('click', () => this.collectAllProducts());
        document.body.appendChild(btn);
        this._collectAllBtn = btn;
    },

    updateCollectAllBtn() {
        if (!this._collectAllBtn) return;
        const hasCollectable = GameState.animals.some(a => a.hasProduct && a.grown);
        this._collectAllBtn.style.display = hasCollectable ? 'block' : 'none';

        if (hasCollectable) {
            const count = GameState.animals.filter(a => a.hasProduct && a.grown).length;
            this._collectAllBtn.innerHTML = `🧺 一键收集 (${count})`;
        }
    },

    collectAllProducts() {
        const collectables = GameState.animals.filter(a => a.hasProduct && a.grown);
        if (collectables.length === 0) return;

        let totalGold = 0;
        let totalItems = 0;
        collectables.forEach(animal => {
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
            totalItems += quantity;

            animal.hasProduct = false;
            animal.productProgress = 0;
            Scene3D.updateAnimalProductMarker(animal.id, false);

            if (typeof BreedingSystem !== 'undefined') BreedingSystem.addIntimacy(animal.id, 2);
        });

        showNotification(`🧺 一键收集了 ${totalItems} 个产物，获得 ${totalGold} 金币！`, 'gold');
        GameState.save();
    },

    // ============================
    // 初始化
    // ============================
    init() {
        // Phase 1
        this.enhanceShowLandMenu();
        this.enhanceShowAnimalMenu();
        this.enhanceHideAllMenus();
        this.enhanceNotifications();

        // Phase 2
        this.enhanceCamera();
        this.enhanceAnimalClick();

        // Phase 3
        this.enhanceHarvest();
        this.enhanceWater();
        this.enhanceSpeedUp();

        // Phase 4
        this.createMiniMap();
        this.createCollectAllBtn();

        // 初始化内部状态
        this._cameraShake = 0;
        this._cameraShakeIntensity = 0;

        // HUD互斥：菜单显示时关闭抽屉和更多面板
        const origShowLandMenuFinal = window.showLandMenu;
        window.showLandMenu = (plotId, x, y) => {
            if (_leftDrawerOpen) toggleLeftDrawer();
            if (_sideMoreOpen) toggleSideMore();
            if (_adRewardOpen) toggleAdRewardPanel();
            origShowLandMenuFinal(plotId, x, y);
        };
        const origShowAnimalMenuFinal = window.showAnimalMenu;
        window.showAnimalMenu = (animalId, x, y) => {
            if (_leftDrawerOpen) toggleLeftDrawer();
            if (_sideMoreOpen) toggleSideMore();
            if (_adRewardOpen) toggleAdRewardPanel();
            origShowAnimalMenuFinal(animalId, x, y);
        };

        console.log('✨ InteractionEnhance: 交互增强系统已加载（含HUD优化）');
    },

    // 每帧更新
    update(dt) {
        this.updateMenuAnchor();
        this.updateCameraSmooth(dt);
        this.updateCameraShake(dt);
        this.updateProgressRings();
        this.updateAnimalBubbles();
        this.updateCollectAllBtn();
        this.updateDrawerBadge();

        // 迷你地图每10帧更新一次
        this._miniMapFrame = (this._miniMapFrame || 0) + 1;
        if (this._miniMapFrame % 10 === 0) {
            this.updateMiniMap();
        }
    },

    // 更新左侧抽屉的badge（显示红点数量）
    updateDrawerBadge() {
        const badge = document.getElementById('drawer-badge');
        if (!badge) return;
        let count = 0;
        // 检查各子系统是否有红点
        if (document.getElementById('cooking-red-dot')?.style.display !== 'none') count++;
        if (document.getElementById('social-red-dot')?.style.display !== 'none') count++;
        if (document.getElementById('order-red-dot')?.style.display !== 'none') count++;
        if (count > 0) {
            badge.textContent = count;
            badge.style.display = 'block';
        } else {
            badge.style.display = 'none';
        }
    }
};
