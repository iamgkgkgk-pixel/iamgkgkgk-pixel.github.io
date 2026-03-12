// ===== 天气视觉系统 =====
// 负责：8种天气粒子效果、昼夜光影、特殊天气事件（彩虹/流星/极光/雷暴）

const WeatherSystem = {
    scene: null,
    rainParticles: [],
    snowParticles: [],
    rainGroup: null,
    snowGroup: null,
    rainbowMesh: null,
    auroraGroup: null,
    lightningTimeout: null,
    currentWeather: 'sunny',
    // 复用Color对象，避免每帧new THREE.Color()
    _skyColor: null,
    _fogColor: null,
    _lastHour: -1,  // 上次更新的小时，用于跳过无变化帧


    // 8种天气类型
    WEATHER_TYPES: {
        sunny:        { name: '晴天', icon: '☀️',  fogDensity: 0.008, skyColor: [0.53, 0.81, 0.98], ambientMult: 1.0, sunMult: 1.2 },
        sunny_cloudy: { name: '晴间多云', icon: '⛅', fogDensity: 0.010, skyColor: [0.60, 0.82, 0.95], ambientMult: 0.9, sunMult: 1.0 },
        cloudy:       { name: '多云', icon: '☁️',  fogDensity: 0.012, skyColor: [0.65, 0.75, 0.85], ambientMult: 0.8, sunMult: 0.7 },
        overcast:     { name: '阴天', icon: '🌫️', fogDensity: 0.015, skyColor: [0.55, 0.60, 0.65], ambientMult: 0.6, sunMult: 0.4 },
        rainy:        { name: '小雨', icon: '🌧️', fogDensity: 0.018, skyColor: [0.40, 0.50, 0.60], ambientMult: 0.5, sunMult: 0.3 },
        heavy_rain:   { name: '大雨', icon: '⛈️', fogDensity: 0.025, skyColor: [0.30, 0.38, 0.48], ambientMult: 0.4, sunMult: 0.2 },
        snow:         { name: '小雪', icon: '🌨️', fogDensity: 0.015, skyColor: [0.80, 0.88, 0.95], ambientMult: 0.7, sunMult: 0.6 },
        blizzard:     { name: '大雪', icon: '❄️', fogDensity: 0.030, skyColor: [0.85, 0.90, 0.95], ambientMult: 0.5, sunMult: 0.3 },
        thunderstorm: { name: '雷暴', icon: '⚡', fogDensity: 0.022, skyColor: [0.25, 0.30, 0.40], ambientMult: 0.35, sunMult: 0.15 }
    },

    init(scene) {
        this.scene = scene;
        this._skyColor = new THREE.Color();
        this._fogColor = new THREE.Color();
        this._createRainGroup();
        this._createSnowGroup();
    },


    // ===== 切换天气 =====
    setWeather(weatherType, scene3d) {
        if (!this.WEATHER_TYPES[weatherType]) weatherType = 'sunny';
        const prev = this.currentWeather;
        this.currentWeather = weatherType;

        // 停止旧粒子
        this._stopRain();
        this._stopSnow();
        this._removeRainbow();
        this._removeAurora();
        if (this.lightningTimeout) clearTimeout(this.lightningTimeout);

        const cfg = this.WEATHER_TYPES[weatherType];

        // 更新雾效
        if (this.scene.fog) {
            this.scene.fog.near = 25;
            this.scene.fog.far = 80;
        }

        // 更新光照
        if (scene3d) {
            if (scene3d.ambientLight) scene3d.ambientLight.intensity = 0.6 * cfg.ambientMult;
            if (scene3d.sunLight) scene3d.sunLight.intensity = 1.2 * cfg.sunMult;
        }

        // 启动对应粒子
        if (weatherType === 'rainy') this._startRain(300);
        else if (weatherType === 'heavy_rain') this._startRain(400);   // 800→400
        else if (weatherType === 'thunderstorm') { this._startRain(500); this._startThunder(scene3d); } // 1000→500
        else if (weatherType === 'snow') this._startSnow(200);
        else if (weatherType === 'blizzard') this._startSnow(300);     // 600→300


        // 雨后彩虹
        const wasRainy = prev === 'rainy' || prev === 'heavy_rain';
        if (wasRainy && (weatherType === 'sunny' || weatherType === 'sunny_cloudy')) {
            setTimeout(() => this._createRainbow(), 2000);
        }
    },

    // ===== 雨粒子 =====
    _createRainGroup() {
        this.rainGroup = new THREE.Group();
        this.rainGroup.visible = false;
        this.scene.add(this.rainGroup);
    },

    _startRain(count) {
        this.rainGroup.visible = true;
        // 清空旧粒子（复用Group，不dispose共享geo/mat）
        while (this.rainGroup.children.length) this.rainGroup.remove(this.rainGroup.children[0]);
        this.rainParticles = [];

        // 共享同一份geo和mat，所有雨滴实例化
        const geo = new THREE.CylinderGeometry(0.01, 0.01, 0.3, 3);
        const mat = new THREE.MeshLambertMaterial({ color: 0x88aacc, transparent: true, opacity: 0.5 });
        this._rainGeo = geo;
        this._rainMat = mat;

        for (let i = 0; i < count; i++) {
            const drop = new THREE.Mesh(geo, mat);
            drop.position.set(
                (Math.random() - 0.5) * 40,
                Math.random() * 20,
                (Math.random() - 0.5) * 40
            );
            drop.rotation.x = 0.15;
            this.rainGroup.add(drop);
            this.rainParticles.push(drop);
        }
    },


    _stopRain() {
        if (this.rainGroup) {
            this.rainGroup.visible = false;
            while (this.rainGroup.children.length) this.rainGroup.remove(this.rainGroup.children[0]);
        }
        // dispose共享资源
        if (this._rainGeo) { this._rainGeo.dispose(); this._rainGeo = null; }
        if (this._rainMat) { this._rainMat.dispose(); this._rainMat = null; }
        this.rainParticles = [];
    },


    // ===== 雪粒子 =====
    _createSnowGroup() {
        this.snowGroup = new THREE.Group();
        this.snowGroup.visible = false;
        this.scene.add(this.snowGroup);
    },

    _startSnow(count) {
        this.snowGroup.visible = true;
        while (this.snowGroup.children.length) this.snowGroup.remove(this.snowGroup.children[0]);
        this.snowParticles = [];

        // 共享geo和mat
        const geo = new THREE.SphereGeometry(0.04, 4, 4);
        const mat = new THREE.MeshLambertMaterial({ color: 0xffffff, transparent: true, opacity: 0.85 });
        this._snowGeo = geo;
        this._snowMat = mat;

        for (let i = 0; i < count; i++) {
            const flake = new THREE.Mesh(geo, mat);
            flake.position.set(
                (Math.random() - 0.5) * 40,
                Math.random() * 20,
                (Math.random() - 0.5) * 40
            );
            flake.userData.drift = (Math.random() - 0.5) * 0.5;
            this.snowGroup.add(flake);
            this.snowParticles.push(flake);
        }
    },


    _stopSnow() {
        if (this.snowGroup) {
            this.snowGroup.visible = false;
            while (this.snowGroup.children.length) this.snowGroup.remove(this.snowGroup.children[0]);
        }
        if (this._snowGeo) { this._snowGeo.dispose(); this._snowGeo = null; }
        if (this._snowMat) { this._snowMat.dispose(); this._snowMat = null; }
        this.snowParticles = [];
    },


    // ===== 彩虹 =====
    _createRainbow() {
        if (this.rainbowMesh) this._removeRainbow();

        const group = new THREE.Group();
        const colors = [0xff0000, 0xff8800, 0xffff00, 0x00ff00, 0x0088ff, 0x4400ff, 0x8800ff];
        colors.forEach((color, i) => {
            const r = 12 + i * 0.6;
            const geo = new THREE.TorusGeometry(r, 0.12, 6, 40, Math.PI);
            const mat = new THREE.MeshLambertMaterial({ color, transparent: true, opacity: 0.5 });
            const arc = new THREE.Mesh(geo, mat);
            arc.rotation.x = Math.PI / 2;
            group.add(arc);
        });
        group.position.set(0, 2, -25);
        group.rotation.y = 0.3;
        this.scene.add(group);
        this.rainbowMesh = group;

        // 10分钟后消失（简化为30秒）
        setTimeout(() => this._removeRainbow(), 30000);

        if (typeof showNotification !== 'undefined') {
            showNotification('🌈 雨后彩虹出现了！', 'gold');
        }
    },

    _removeRainbow() {
        if (this.rainbowMesh) {
            this.scene.remove(this.rainbowMesh);
            // dispose彩虹的geo和mat
            this.rainbowMesh.children.forEach(arc => {
                if (arc.geometry) arc.geometry.dispose();
                if (arc.material) arc.material.dispose();
            });
            this.rainbowMesh = null;
        }
    },


    // ===== 极光（冬季深夜） =====
    createAurora() {
        if (this.auroraGroup) return;
        const group = new THREE.Group();
        const auroraColors = [0x00ff88, 0x0088ff, 0xff00ff, 0x00ffff];
        for (let i = 0; i < 4; i++) {
            const geo = new THREE.PlaneGeometry(30, 8);
            const mat = new THREE.MeshLambertMaterial({
                color: auroraColors[i],
                transparent: true,
                opacity: 0.15,
                side: THREE.DoubleSide
            });
            const plane = new THREE.Mesh(geo, mat);
            plane.position.set((i - 1.5) * 8, 20, -30);
            plane.rotation.y = (i - 1.5) * 0.2;
            plane.userData.auroraPhase = i * Math.PI / 2;
            group.add(plane);
        }
        this.scene.add(group);
        this.auroraGroup = group;
    },

    _removeAurora() {
        if (this.auroraGroup) {
            this.scene.remove(this.auroraGroup);
            this.auroraGroup = null;
        }
    },

    // ===== 流星雨 =====
    createMeteorShower() {
        if (typeof showNotification !== 'undefined') {
            showNotification('🌠 流星雨！许个愿吧！', 'gold');
        }
        for (let i = 0; i < 8; i++) {
            setTimeout(() => this._spawnMeteor(), i * 800);
        }
    },

    _spawnMeteor() {
        const geo = new THREE.CylinderGeometry(0.02, 0.02, 2, 4);
        const mat = new THREE.MeshLambertMaterial({ color: 0xffffaa, transparent: true, opacity: 0.9 });
        const meteor = new THREE.Mesh(geo, mat);
        meteor.position.set(
            (Math.random() - 0.5) * 40,
            25 + Math.random() * 10,
            (Math.random() - 0.5) * 40
        );
        meteor.rotation.z = Math.PI / 4;
        this.scene.add(meteor);

        const speed = 15 + Math.random() * 10;
        const startTime = Date.now();
        const anim = () => {
            const t = (Date.now() - startTime) / 1000;
            meteor.position.x -= speed * 0.016;
            meteor.position.y -= speed * 0.016;
            meteor.material.opacity = Math.max(0, 0.9 - t * 0.8);
            if (t < 1.2) {
                requestAnimationFrame(anim);
            } else {
                this.scene.remove(meteor);
                // 修复内存泄漏：dispose流星资源
                geo.dispose();
                mat.dispose();
            }
        };
        anim();
    },


    // ===== 雷暴闪电 =====
    _startThunder(scene3d) {
        const doLightning = () => {
            if (this.currentWeather !== 'thunderstorm') return;
            // 闪光效果：环境光瞬间变亮
            if (scene3d && scene3d.ambientLight) {
                const orig = scene3d.ambientLight.intensity;
                scene3d.ambientLight.intensity = 3.0;
                setTimeout(() => {
                    if (scene3d.ambientLight) scene3d.ambientLight.intensity = orig;
                }, 100);
                setTimeout(() => {
                    if (scene3d.ambientLight) scene3d.ambientLight.intensity = 3.0;
                }, 200);
                setTimeout(() => {
                    if (scene3d.ambientLight) scene3d.ambientLight.intensity = orig;
                }, 300);
            }
            // 屏幕震动
            if (typeof AnimalBehavior !== 'undefined') {
                AnimalBehavior.screenShake(8, 0.4);
            }
            if (typeof showNotification !== 'undefined') {
                showNotification('⚡ 雷电！', 'warning');
            }
            // 随机间隔再次触发
            this.lightningTimeout = setTimeout(doLightning, 8000 + Math.random() * 15000);
        };
        this.lightningTimeout = setTimeout(doLightning, 3000 + Math.random() * 8000);
    },

    // ===== 每帧更新 =====
    update(deltaTime, time) {
        // 雨滴下落
        if (this.rainGroup && this.rainGroup.visible) {
            this.rainParticles.forEach(drop => {
                drop.position.y -= 12 * deltaTime;
                if (drop.position.y < -1) {
                    drop.position.y = 20;
                    drop.position.x = (Math.random() - 0.5) * 40;
                    drop.position.z = (Math.random() - 0.5) * 40;
                }
            });
        }

        // 雪花飘落
        if (this.snowGroup && this.snowGroup.visible) {
            this.snowParticles.forEach(flake => {
                flake.position.y -= 1.5 * deltaTime;
                flake.position.x += flake.userData.drift * deltaTime;
                if (flake.position.y < 0) {
                    flake.position.y = 20;
                    flake.position.x = (Math.random() - 0.5) * 40;
                    flake.position.z = (Math.random() - 0.5) * 40;
                }
            });
        }

        // 极光波动
        if (this.auroraGroup) {
            this.auroraGroup.children.forEach(plane => {
                plane.userData.auroraPhase += deltaTime * 0.5;
                plane.material.opacity = 0.1 + Math.sin(plane.userData.auroraPhase) * 0.08;
                plane.position.y = 20 + Math.sin(plane.userData.auroraPhase * 0.7) * 2;
            });
        }
    },

    // ===== 昼夜光影更新（只在小时变化时更新，避免每帧重算） =====
    updateDayNight(scene3d, hour, skyBrightness) {
        if (!scene3d) return;

        // 极光波动和流星雨检测仍需每帧（但概率极低），其余只在hour变化时更新
        const hourChanged = (hour !== this._lastHour);
        this._lastHour = hour;

        const cfg = this.WEATHER_TYPES[this.currentWeather] || this.WEATHER_TYPES.sunny;

        if (hourChanged) {
            // 天空颜色（复用Color对象，用.set()而非new）
            let skyR, skyG, skyB;
            if (hour >= 5 && hour < 7) {
                skyR = 0.9 * skyBrightness; skyG = 0.5 * skyBrightness; skyB = 0.3 * skyBrightness;
            } else if (hour >= 17 && hour < 19) {
                skyR = 0.95 * skyBrightness; skyG = 0.65 * skyBrightness; skyB = 0.2 * skyBrightness;
            } else if (hour >= 19 || hour < 5) {
                skyR = 0.05; skyG = 0.08; skyB = 0.20;
            } else {
                skyR = cfg.skyColor[0] * skyBrightness;
                skyG = cfg.skyColor[1] * skyBrightness;
                skyB = cfg.skyColor[2] * skyBrightness;
            }

            if (scene3d.scene) {
                this._skyColor.setRGB(skyR, skyG, skyB);
                scene3d.scene.background = this._skyColor;
                if (scene3d.scene.fog) {
                    this._fogColor.setRGB(skyR, skyG, skyB);
                    scene3d.scene.fog.color = this._fogColor;
                }
            }

            // 光照强度
            const nightFactor = (hour >= 19 || hour < 5) ? 0.15 : skyBrightness;
            if (scene3d.ambientLight) {
                scene3d.ambientLight.intensity = (0.3 + nightFactor * 0.5) * cfg.ambientMult;
            }
            if (scene3d.sunLight) {
                scene3d.sunLight.intensity = 1.2 * nightFactor * cfg.sunMult;
                if (hour >= 19 || hour < 5) {
                    scene3d.sunLight.color.setHex(0xaabbff);
                } else if (hour >= 5 && hour < 7) {
                    scene3d.sunLight.color.setHex(0xff8844);
                } else if (hour >= 17 && hour < 19) {
                    scene3d.sunLight.color.setHex(0xffcc44);
                } else {
                    scene3d.sunLight.color.setHex(0xfff5e0);
                }
            }

            // 白天移除极光
            if (hour >= 6 && hour < 20 && this.auroraGroup) {
                this._removeAurora();
            }
        }

        // 冬季深夜极光（概率极低，每帧检测开销可忽略）
        const season = typeof GameState !== 'undefined' ? GameState.gameTime.season : 'spring';
        if (season === 'winter' && (hour >= 22 || hour < 4) && Math.random() < 0.0001) {
            this.createAurora();
        }

        // 特定夜晚流星雨（概率极低）
        if (hour === 22 && Math.random() < 0.00005) {
            this.createMeteorShower();
        }
    }

};
