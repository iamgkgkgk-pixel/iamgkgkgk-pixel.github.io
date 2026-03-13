// ===== 动物行为差异化系统 =====
// 负责：特殊行为（沙浴/拱地/剪毛）、情感系统、情绪符号、天气响应、Juice反馈

const AnimalBehavior = {

    // ===== 情感系统常量 =====
    FRIENDSHIP_MAX: 1000,
    MOOD_MAX: 255,

    // ===== 情绪符号池 =====
    EMOTION_SYMBOLS: {
        happy:   ['♪', '❤', '♫'],
        hungry:  ['...', '🍽'],
        sick:    ['~', '💫'],
        stress:  ['⚡', '💦'],
        love:    ['❤', '💕'],
        none:    []
    },

    // ===== 特殊行为计时器（每只动物独立） =====
    // 存储在 mesh.userData.specialBehavior 中

    // ===== 初始化动物情感数据 =====
    initAnimalEmotion(animal) {
        if (animal.friendship === undefined) animal.friendship = 200;
        if (animal.mood === undefined) animal.mood = 180;
        if (animal.sick === undefined) animal.sick = false;
        if (animal.woolGrown === undefined) animal.woolGrown = true; // 羊毛是否蓬松
        if (animal.woolTimer === undefined) animal.woolTimer = 0;    // 羊毛再生计时
        if (animal.specialCooldown === undefined) animal.specialCooldown = 0;
    },

    // ===== 动物Map缓存（避免每帧find，O(n)→O(1)） =====
    _animalMap: null,
    _buildAnimalMap(gameAnimals) {
        this._animalMap = new Map();
        gameAnimals.forEach(a => this._animalMap.set(a.id, a));
    },

    // ===== 每帧更新（由scene3d.update调用） =====
    update(deltaTime, animalMeshes, gameAnimals, weather, hour) {
        // 每帧重建Map（动物数量少，开销极小）
        if (!this._animalMap || this._animalMap.size !== gameAnimals.length) {
            this._buildAnimalMap(gameAnimals);
        }

        animalMeshes.forEach(mesh => {
            const ud = mesh.userData;
            const animal = this._animalMap.get(ud.animalId);
            if (!animal) return;

            this.initAnimalEmotion(animal);

            // 1. 天气行为响应
            this._updateWeatherBehavior(mesh, animal, weather, ud);

            // 2. 特殊行为触发
            this._updateSpecialBehavior(mesh, animal, deltaTime, weather, ud);

            // 3. 好感度分级响应（影响移动目标选择）
            this._updateFriendshipResponse(mesh, animal, ud);

            // 4. 羊毛再生
            if (animal.type === 'sheep' && !animal.woolGrown) {
                animal.woolTimer += deltaTime;
                // 3游戏天 = 3*24*60秒 → 简化为3*60秒（3分钟）
                if (animal.woolTimer >= 180) {
                    animal.woolGrown = true;
                    animal.woolTimer = 0;
                    this._restoreSheepWool(mesh);
                }
            }

            // 5. 特殊行为冷却
            if (animal.specialCooldown > 0) {
                animal.specialCooldown -= deltaTime;
            }
        });
    },


    // 情绪符号系统已移除（性能优化）


    // ===== 天气行为响应 =====
    _updateWeatherBehavior(mesh, animal, weather, ud) {
        const isRainy = weather === 'rainy' || weather === 'heavy_rain' || weather === 'thunderstorm';
        const isSnowy = weather === 'snow' || weather === 'blizzard';

        if (animal.type === 'duck') {
            // 鸭子雨天更活跃，优先进池塘
            if (isRainy) {
                ud.weatherBoost = 1.5; // 移动速度加成
                ud.preferPond = true;
            } else {
                ud.weatherBoost = 1.0;
                ud.preferPond = false;
            }
            return;
        }

        // 其他动物雨天/雪天躲避
        if (isRainy || isSnowy) {
            // 只在刚进入避雨状态时设置一次目标，避免每帧覆盖导致抽搐
            if (!ud.seekShelter) {
                ud.seekShelter = true;
                ud.shelterReached = false;
                // 目标设为农场中心附近（模拟畜棚），只设置一次
                ud.targetX = (Math.random() - 0.5) * 4;
                ud.targetZ = (Math.random() - 0.5) * 4;
                ud.state = 'wandering';
                ud.moveTimer = 0;
            } else if (!ud.shelterReached) {
                // 检查是否已到达遮蔽处（距目标2单位内视为到达）
                const dx = (ud.targetX || 0) - mesh.position.x;
                const dz = (ud.targetZ || 0) - mesh.position.z;
                if (dx * dx + dz * dz < 4) {
                    ud.shelterReached = true;
                    ud.state = 'resting'; // 到达后静止等待，不再乱跑
                }
            }
        } else {
            ud.seekShelter = false;
            ud.shelterReached = false;
        }


        // 雷暴：动物惊恐，心情大幅下降（添加冷却，避免每帧触发）
        if (weather === 'thunderstorm' && Math.random() < 0.001 && !(ud.thunderCooldown > 0)) {
            animal.mood = Math.max(0, animal.mood - 20);
            ud.state = 'wandering';
            ud.stateTimer = 3;
            // 惊恐时快速乱跑
            ud.targetX = (Math.random() - 0.5) * 18;
            ud.targetZ = (Math.random() - 0.5) * 18;
            ud.moveTimer = 0;
            ud.thunderCooldown = 5 + Math.random() * 5; // 5-10秒冷却
        }
        if (ud.thunderCooldown > 0) ud.thunderCooldown -= 0.016; // 约每帧减少

    },

    // ===== 特殊行为触发 =====
    _updateSpecialBehavior(mesh, animal, deltaTime, weather, ud) {
        if (animal.specialCooldown > 0) return;
        if (ud.specialActive) {
            this._updateActiveSpecial(mesh, animal, deltaTime, ud);
            return;
        }

        const isSunny = weather === 'sunny' || weather === 'sunny_cloudy';
        const isRainy = weather === 'rainy' || weather === 'heavy_rain';

        switch (animal.type) {
            case 'chicken':
                // 沙浴：晴天15%概率
                if (isSunny && ud.state === 'resting' && Math.random() < 0.003) {
                    this._startSandBath(mesh, animal, ud);
                }
                // 抖动羽毛：随机
                if (Math.random() < 0.001) {
                    this._startFeatherShake(mesh, ud);
                }
                break;

            case 'pig':
                // 拱地寻宝：随机漫步时20%概率
                if (ud.state === 'foraging' && Math.random() < 0.002) {
                    this._startRooting(mesh, animal, ud);
                }
                // 泥浴：雨后
                if (isRainy && Math.random() < 0.001) {
                    this._startMudBath(mesh, animal, ud);
                }
                break;

            case 'sheep':
                // 剪毛后害羞：更频繁躲避
                if (!animal.woolGrown && ud.state !== 'resting' && Math.random() < 0.003) {
                    ud.state = 'wandering';
                    ud.targetX = (Math.random() - 0.5) * 16;
                    ud.targetZ = (Math.random() - 0.5) * 16;
                    ud.moveTimer = 0;
                }
                break;

            case 'cow':
                // 群体跟随：领头牛逻辑
                this._updateCowHerd(mesh, animal, ud);
                break;

            case 'duck':
                // 水中觅食：头部扎入水中
                if (ud.isSwimming && Math.random() < 0.002) {
                    this._startDuckDive(mesh, ud);
                }
                break;
        }
    },

    // ===== 沙浴行为 =====
    _startSandBath(mesh, animal, ud) {
        ud.specialActive = 'sandBath';
        ud.specialTimer = 5 + Math.random() * 3;
        ud.state = 'resting';
        animal.specialCooldown = 60 + Math.random() * 120;

        const parts = ud.parts || {};
        // 蹲下
        if (parts.body) {
            parts.body.position.y = (ud.baseBodyY || 0.28) - 0.12;
        }
        // 翅膀展开模拟扑打
        if (parts.leftWing) parts.leftWing.rotation.z = -0.8;
        if (parts.rightWing) parts.rightWing.rotation.z = 0.8;
    },

    _updateActiveSpecial(mesh, animal, deltaTime, ud) {
        ud.specialTimer -= deltaTime;
        const parts = ud.parts || {};

        if (ud.specialActive === 'sandBath') {
            // 身体左右翻滚
            if (parts.body) {
                parts.body.rotation.z = Math.sin(Date.now() * 0.01) * 0.4;
            }
            if (ud.specialTimer <= 0) {
                // 结束：产生尘土粒子
                this._createDustParticles(mesh.position);
                if (parts.body) {
                    parts.body.rotation.z = 0;
                    parts.body.position.y = ud.baseBodyY || 0.28;
                }
                if (parts.leftWing) parts.leftWing.rotation.z = 0;
                if (parts.rightWing) parts.rightWing.rotation.z = 0;
                ud.specialActive = null;
            }

        } else if (ud.specialActive === 'featherShake') {
            if (parts.body) {
                parts.body.rotation.z = Math.sin(Date.now() * 0.03) * 0.15;
            }
            if (ud.specialTimer <= 0) {
                if (parts.body) parts.body.rotation.z = 0;
                ud.specialActive = null;
            }

        } else if (ud.specialActive === 'rooting') {
            // 猪拱地：头部前后拱动
            if (parts.headGroup) {
                parts.headGroup.rotation.x = 0.6 + Math.abs(Math.sin(Date.now() * 0.008)) * 0.3;
                parts.headGroup.position.z = (ud.baseHeadPos ? ud.baseHeadPos.z : 0.38) - 0.05;
            }
            if (ud.specialTimer <= 0) {
                // 发现物品！
                this._pigFindTreasure(mesh, animal);
                if (parts.headGroup) {
                    parts.headGroup.rotation.x = 0;
                    if (ud.baseHeadPos) parts.headGroup.position.z = ud.baseHeadPos.z;
                }
                ud.specialActive = null;
            }

        } else if (ud.specialActive === 'mudBath') {
            if (parts.body) {
                parts.body.rotation.z = Math.sin(Date.now() * 0.008) * 0.5;
            }
            if (ud.specialTimer <= 0) {
                // 皮肤变深色（泥浆效果）
                if (parts.body && parts.body.material) {
                    parts.body.material.color.setHex(0xaa7755);
                    // 30秒后恢复
                    setTimeout(() => {
                        if (parts.body && parts.body.material) {
                            parts.body.material.color.setHex(0xffaaaa);
                        }
                    }, 30000);
                }
                if (parts.body) parts.body.rotation.z = 0;
                ud.specialActive = null;
            }

        } else if (ud.specialActive === 'duckDive') {
            // 鸭子扎水：头部下沉，尾巴上翘
            if (parts.headGroup) {
                parts.headGroup.rotation.x = 1.2;
                parts.headGroup.position.y = (ud.baseHeadPos ? ud.baseHeadPos.y : 0.48) - 0.15;
            }
            if (parts.tail) {
                parts.tail.rotation.x = -Math.PI / 1.5;
            }
            if (ud.specialTimer <= 0) {
                if (parts.headGroup) {
                    parts.headGroup.rotation.x = 0;
                    if (ud.baseHeadPos) parts.headGroup.position.y = ud.baseHeadPos.y;
                }
                if (parts.tail) parts.tail.rotation.x = -Math.PI / 2.5;
                ud.specialActive = null;
            }
        }
    },

    _startFeatherShake(mesh, ud) {
        ud.specialActive = 'featherShake';
        ud.specialTimer = 0.5;
    },

    _startRooting(mesh, animal, ud) {
        ud.specialActive = 'rooting';
        ud.specialTimer = 3 + Math.random() * 2;
        ud.state = 'resting';
        animal.specialCooldown = 30 + Math.random() * 60;
    },

    _startMudBath(mesh, animal, ud) {
        ud.specialActive = 'mudBath';
        ud.specialTimer = 4 + Math.random() * 3;
        ud.state = 'resting';
        animal.specialCooldown = 60;
    },

    _startDuckDive(mesh, ud) {
        ud.specialActive = 'duckDive';
        ud.specialTimer = 2 + Math.random() * 1;
    },

    // ===== 猪拱地发现宝物 =====
    _pigFindTreasure(mesh, animal) {
        const treasures = [
            { name: '松露', icon: '🍄', gold: 50, rare: false },
            { name: '虫子', icon: '🐛', gold: 5, rare: false },
            { name: '硬币', icon: '💰', gold: 20, rare: false },
            { name: '稀有种子', icon: '🌟', gold: 0, rare: true, seed: 'mystery_rare' }
        ];
        const weights = [0.3, 0.4, 0.25, 0.05];
        let r = Math.random(), idx = 0, acc = 0;
        for (let i = 0; i < weights.length; i++) {
            acc += weights[i];
            if (r < acc) { idx = i; break; }
        }
        const treasure = treasures[idx];

        // 猪兴奋跳跃
        mesh.userData.jumpTimer = 0.5;

        if (treasure.gold > 0 && typeof GameState !== 'undefined') {
            GameState.addGold(treasure.gold);
        }
        if (treasure.rare && typeof GameState !== 'undefined') {
            GameState.inventory.seeds[treasure.seed] = (GameState.inventory.seeds[treasure.seed] || 0) + 1;
        }
        if (typeof showNotification !== 'undefined') {
            showNotification(`🐷 ${animal.name || '小猪'} 拱出了 ${treasure.icon} ${treasure.name}！`, 'gold');
        }
        // 粒子喷发
        this._createJoyParticles(mesh.position);
    },

    // ===== 牛群跟随 =====
    _updateCowHerd(mesh, animal, ud) {
        if (!this._cowLeader) return;
        if (mesh === this._cowLeader) return;
        // 只在移动计时器到期时才更新目标，避免每帧覆盖状态机
        if (ud.moveTimer > 0) return;

        // 非领头牛跟随领头牛
        const leader = this._cowLeader;
        const dx = leader.position.x - mesh.position.x;
        const dz = leader.position.z - mesh.position.z;
        const dist = Math.sqrt(dx * dx + dz * dz);

        if (dist > 5) {
            // 距离太远，向领头牛靠近
            ud.targetX = leader.position.x + (Math.random() - 0.5) * 3;
            ud.targetZ = leader.position.z + (Math.random() - 0.5) * 3;
            ud.moveTimer = 0;
        }
    },


    // 每天早晨随机指定领头牛
    assignCowLeader(animalMeshes) {
        const cows = animalMeshes.filter(m => m.userData.animalType === 'cow');
        if (cows.length > 0) {
            this._cowLeader = cows[Math.floor(Math.random() * cows.length)];
        }
    },

    // ===== 好感度分级响应 =====
    _updateFriendshipResponse(mesh, animal, ud) {
        if (animal.friendship < 300) {
            // 低好感：玩家靠近时躲避（通过增大逃跑倾向实现）
            ud.fleeFromPlayer = true;
        } else {
            ud.fleeFromPlayer = false;
        }

        if (animal.friendship >= 700) {
            // 高好感：偶尔主动靠近玩家（农场中心），只在空闲时触发，不打断当前移动
            if (ud.state !== 'resting' && ud.moveTimer <= 0 && Math.random() < 0.0005) {
                ud.targetX = (Math.random() - 0.5) * 3;
                ud.targetZ = (Math.random() - 0.5) * 3;
                ud.moveTimer = 0;
            }
        }

    },

    // ===== 抚摸动物（玩家交互） =====
    petAnimal(mesh, animal) {
        if (!animal) return;
        this.initAnimalEmotion(animal);

        const gain = 15 + Math.floor(Math.random() * 16); // +15~+30
        animal.friendship = Math.min(this.FRIENDSHIP_MAX, animal.friendship + gain);
        animal.mood = Math.min(this.MOOD_MAX, animal.mood + 10);

        // 高好感：撒娇动画（身体蹭向玩家方向）
        if (animal.friendship >= 700) {
            const ud = mesh.userData;
            const parts = ud.parts || {};
            if (parts.body) {
                parts.body.rotation.z = 0.15;
                setTimeout(() => { if (parts.body) parts.body.rotation.z = 0; }, 500);
            }
            this._createLoveParticles(mesh.position);
        } else {
            this._createStarParticles(mesh.position);
        }

        if (typeof showNotification !== 'undefined') {
            showNotification(`💕 友谊值 +${gain}`, 'gold');
        }
    },

    // ===== 剪羊毛 =====
    shearSheep(mesh, animal) {
        if (!animal || animal.type !== 'sheep') return;
        if (!animal.woolGrown) {
            if (typeof showNotification !== 'undefined') {
                showNotification('羊毛还没长好！', 'warning');
            }
            return false;
        }
        animal.woolGrown = false;
        animal.woolTimer = 0;
        this._applySheepSheared(mesh);
        return true;
    },

    _applySheepSheared(mesh) {
        const parts = mesh.userData.parts || {};
        // 缩小羊毛球体（露出皮肤）
        if (parts.woolGroup) {
            parts.woolGroup.scale.set(0.3, 0.3, 0.3);
            // 改为粉色皮肤色
            parts.woolGroup.traverse(child => {
                if (child.isMesh && child.material) {
                    child.material.color.setHex(0xffccbb);
                }
            });
        }
        if (parts.body && parts.body.material) {
            parts.body.material.color.setHex(0xffccbb);
        }
    },

    _restoreSheepWool(mesh) {
        const parts = mesh.userData.parts || {};
        if (parts.woolGroup) {
            parts.woolGroup.scale.set(1, 1, 1);
            parts.woolGroup.traverse(child => {
                if (child.isMesh && child.material) {
                    child.material.color.setHex(0xf0ede8);
                }
            });
        }
        if (parts.body && parts.body.material) {
            parts.body.material.color.setHex(0xf0ede8);
        }
    },

    // ===== 粒子效果 =====
    // ===== 共享粒子几何体/材质（避免每次new，减少GPU上传） =====
    _sharedGeos: {},
    _getSharedGeo(key, factory) {
        if (!this._sharedGeos[key]) this._sharedGeos[key] = factory();
        return this._sharedGeos[key];
    },

    _createDustParticles(pos) {
        if (typeof Scene3D === 'undefined') return;
        const geo = this._getSharedGeo('dust', () => new THREE.SphereGeometry(0.04, 4, 4));
        for (let i = 0; i < 12; i++) {
            const mat = new THREE.MeshStandardMaterial({ color: 0xccaa88, transparent: true, opacity: 0.7, roughness: 0.5, metalness: 0.0 });
            const p = new THREE.Mesh(geo, mat);
            p.position.set(
                pos.x + (Math.random() - 0.5) * 0.8,
                pos.y + 0.1,
                pos.z + (Math.random() - 0.5) * 0.8
            );
            p.userData = {
                velocity: new THREE.Vector3(
                    (Math.random() - 0.5) * 1.5,
                    0.5 + Math.random() * 1.0,
                    (Math.random() - 0.5) * 1.5
                ),
                life: 0.8,
                type: 'particle'
            };
            Scene3D.scene.add(p);
            Scene3D.particles.push(p);
        }
    },


    _createJoyParticles(pos) {
        if (typeof Scene3D === 'undefined') return;
        const colors = [0xffd700, 0xff88aa, 0x88ffaa, 0x88aaff];
        const geo = this._getSharedGeo('joy', () => new THREE.SphereGeometry(0.05, 4, 4));
        for (let i = 0; i < 15; i++) {
            const mat = new THREE.MeshStandardMaterial({ color: colors[i % colors.length], transparent: true, opacity: 0.9, roughness: 0.5, metalness: 0.0 });
            const p = new THREE.Mesh(geo, mat);
            p.position.set(pos.x, pos.y + 0.5, pos.z);
            const angle = (i / 15) * Math.PI * 2;
            p.userData = {
                velocity: new THREE.Vector3(
                    Math.cos(angle) * 1.5,
                    1.5 + Math.random() * 1.5,
                    Math.sin(angle) * 1.5
                ),
                life: 1.0,
                type: 'particle'
            };
            Scene3D.scene.add(p);
            Scene3D.particles.push(p);
        }
    },


    _createLoveParticles(pos) {
        if (typeof Scene3D === 'undefined') return;
        const geo = this._getSharedGeo('love', () => new THREE.SphereGeometry(0.06, 4, 4));
        for (let i = 0; i < 8; i++) {
            const mat = new THREE.MeshStandardMaterial({ color: 0xff4488, transparent: true, opacity: 0.9, roughness: 0.5, metalness: 0.0 });
            const p = new THREE.Mesh(geo, mat);
            p.position.set(pos.x + (Math.random()-0.5)*0.5, pos.y + 0.8, pos.z + (Math.random()-0.5)*0.5);
            p.userData = {
                velocity: new THREE.Vector3((Math.random()-0.5)*0.8, 1.2 + Math.random()*0.8, (Math.random()-0.5)*0.8),
                life: 1.2,
                type: 'particle'
            };
            Scene3D.scene.add(p);
            Scene3D.particles.push(p);
        }
    },


    _createStarParticles(pos) {
        if (typeof Scene3D === 'undefined') return;
        const geo = this._getSharedGeo('star', () => new THREE.SphereGeometry(0.04, 4, 4));
        for (let i = 0; i < 6; i++) {
            const mat = new THREE.MeshStandardMaterial({ color: 0xffdd00, transparent: true, opacity: 0.9, roughness: 0.5, metalness: 0.0 });
            const p = new THREE.Mesh(geo, mat);
            p.position.set(pos.x + (Math.random()-0.5)*0.4, pos.y + 0.6, pos.z + (Math.random()-0.5)*0.4);
            p.userData = {
                velocity: new THREE.Vector3((Math.random()-0.5)*1.0, 1.0 + Math.random()*0.5, (Math.random()-0.5)*1.0),
                life: 0.8,
                type: 'particle'
            };
            Scene3D.scene.add(p);
            Scene3D.particles.push(p);
        }
    },


    // ===== 屏幕震动（Juice反馈） =====
    screenShake(intensity, duration) {
        const canvas = document.getElementById('gameCanvas');
        if (!canvas) return;
        const startTime = Date.now();
        const shake = () => {
            const elapsed = (Date.now() - startTime) / 1000;
            if (elapsed >= duration) {
                canvas.style.transform = '';
                return;
            }
            const decay = 1 - elapsed / duration;
            const dx = (Math.random() - 0.5) * intensity * decay;
            const dy = (Math.random() - 0.5) * intensity * decay;
            canvas.style.transform = `translate(${dx}px, ${dy}px)`;
            requestAnimationFrame(shake);
        };
        shake();
    },

    // ===== 挤压拉伸动画（Juice反馈） =====
    squashStretch(mesh, squashY = 0.7, duration = 0.15) {
        if (!mesh) return;
        const startTime = Date.now();
        const origScale = mesh.scale.clone();
        const anim = () => {
            const t = (Date.now() - startTime) / 1000;
            const progress = Math.min(1, t / duration);
            // 弹性缓动
            const elastic = progress < 0.5
                ? 1 - (1 - squashY) * (1 - progress * 2)
                : squashY + (1 - squashY) * ((progress - 0.5) * 2);
            mesh.scale.set(origScale.x * (2 - elastic), origScale.y * elastic, origScale.z * (2 - elastic));
            if (progress < 1) requestAnimationFrame(anim);
            else mesh.scale.copy(origScale);
        };
        anim();
    },

    // ===== 产出品质计算 =====
    calcProductQuality(animal) {
        this.initAnimalEmotion(animal);
        const f = animal.friendship / this.FRIENDSHIP_MAX;
        const moodMod = animal.mood > 200 ? animal.mood * 2 : animal.mood * (-2);
        const qualityScore = f - (1 - animal.mood / 225);
        const largeProbability = (animal.friendship + moodMod) / 1200;

        if (qualityScore > 0.6) return 'perfect';
        if (qualityScore > 0.2) return 'good';
        return 'normal';
    },

    // ===== 每日重置（心情衰减） =====
    dailyUpdate(gameAnimals) {
        gameAnimals.forEach(animal => {
            this.initAnimalEmotion(animal);
            // 未喂食：心情-100，友谊-20
            if (!animal.fedToday) {
                animal.mood = Math.max(0, animal.mood - 100);
                animal.friendship = Math.max(0, animal.friendship - 20);
            }
            animal.fedToday = false;
        });
    },

    // ===== 喂食动物 =====
    feedAnimal(animal) {
        this.initAnimalEmotion(animal);
        animal.fedToday = true;
        animal.mood = Math.min(this.MOOD_MAX, animal.mood + 30);
        animal.friendship = Math.min(this.FRIENDSHIP_MAX, animal.friendship + 5);
    }
};
