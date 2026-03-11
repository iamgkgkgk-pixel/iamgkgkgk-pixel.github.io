// ===== 3D农场植物外观系统 =====
// 基于Three.js程序化几何体实现，支持5个生长阶段、随风摇摆动画、收获特效

// ===== 植物配置管理器 =====
const PlantConfig = {
    radish: {
        id: 'radish', name: '萝卜',
        colors: { leaf: 0x228B22, fruit: 0xFF6B35, stem: 0x3CB371 },
        animation: { swayAmplitude: 4, swayFrequency: 1.2, type: 'short' },
        dimensions: { width: 0.3, height: 0.5, depth: 0.3 }
    },
    lettuce: {
        id: 'lettuce', name: '生菜',
        colors: { leaf: 0x2E8B57, fruit: 0xF0E68C, stem: 0x3CB371 },
        animation: { swayAmplitude: 3, swayFrequency: 1.0, type: 'short' },
        dimensions: { width: 0.5, height: 0.4, depth: 0.5 }
    },
    tomato: {
        id: 'tomato', name: '番茄',
        colors: { leaf: 0x3CB371, fruit: 0xFF4444, stem: 0x228B22, calyx: 0x228B22 },
        animation: { swayAmplitude: 8, swayFrequency: 0.8, type: 'vine' },
        dimensions: { width: 0.4, height: 1.2, depth: 0.4 }
    },
    corn: {
        id: 'corn', name: '玉米',
        colors: { leaf: 0x3CB371, fruit: 0xFFCC00, stem: 0x3CB371, husk: 0x98FB98, silk: 0xCD853F },
        animation: { swayAmplitude: 8, swayFrequency: 0.5, type: 'tall' },
        dimensions: { width: 0.3, height: 1.8, depth: 0.3 }
    },
    wheat: {
        id: 'wheat', name: '小麦',
        colors: { leaf: 0x6B8E23, fruit: 0xFFD700, stem: 0xDAA520 },
        animation: { swayAmplitude: 15, swayFrequency: 1.5, type: 'grain' },
        dimensions: { width: 0.2, height: 1.2, depth: 0.2 }
    },
    strawberry: {
        id: 'strawberry', name: '草莓',
        colors: { leaf: 0x2E8B57, fruit: 0xFF1744, stem: 0x228B22, seed: 0xFFD700 },
        animation: { swayAmplitude: 3, swayFrequency: 1.0, type: 'short' },
        dimensions: { width: 0.4, height: 0.4, depth: 0.4 }
    },
    blueberry: {
        id: 'blueberry', name: '蓝莓',
        colors: { leaf: 0x2E8B57, fruit: 0x4444CC, stem: 0x8B4513 },
        animation: { swayAmplitude: 4, swayFrequency: 0.9, type: 'short' },
        dimensions: { width: 0.5, height: 0.6, depth: 0.5 }
    },
    pumpkin: {
        id: 'pumpkin', name: '南瓜',
        colors: { leaf: 0x006400, fruit: 0xFF8C00, stem: 0x228B22, groove: 0xCC6600 },
        animation: { swayAmplitude: 5, swayFrequency: 0.8, type: 'vine' },
        dimensions: { width: 0.8, height: 0.6, depth: 0.8 }
    },
    sunflower: {
        id: 'sunflower', name: '向日葵',
        colors: { leaf: 0x228B22, petal: 0xFFD700, center: 0x8B4513, stem: 0x228B22 },
        animation: { swayAmplitude: 8, swayFrequency: 0.5, type: 'tall' },
        dimensions: { width: 0.4, height: 1.8, depth: 0.4 }
    },
    goldApple: {
        id: 'goldApple', name: '金苹果',
        colors: { leaf: 0x32CD32, fruit: 0xFFD700, stem: 0x8B4513, trunk: 0x8B4513 },
        animation: { swayAmplitude: 6, swayFrequency: 0.6, type: 'tree' },
        dimensions: { width: 0.8, height: 1.6, depth: 0.8 }
    },
    rainbowRose: {
        id: 'rainbowRose', name: '彩虹玫瑰',
        colors: { leaf: 0x006400, petal: 0xFF007F, stem: 0x228B22, thorn: 0x006400 },
        animation: { swayAmplitude: 6, swayFrequency: 0.7, type: 'vine' },
        dimensions: { width: 0.3, height: 1.0, depth: 0.3 }
    }
};

// ===== 植物构建器 =====
const PlantBuilder = {

    // 通用：创建幼苗（阶段1-2）
    buildSeedling(group, config, scale) {
        const stemMat = new THREE.MeshLambertMaterial({ color: config.colors.stem || 0x44aa44 });
        const leafMat = new THREE.MeshLambertMaterial({ color: config.colors.leaf || 0x44aa44 });

        // 茎
        const stemGeo = new THREE.CylinderGeometry(0.03 * scale, 0.05 * scale, 0.5 * scale, 5);
        const stem = new THREE.Mesh(stemGeo, stemMat);
        stem.position.y = 0.25 * scale;
        stem.castShadow = true;
        group.add(stem);

        // 两片子叶
        for (let i = 0; i < 2; i++) {
            const leafGeo = new THREE.SphereGeometry(0.12 * scale, 6, 5);
            const leaf = new THREE.Mesh(leafGeo, leafMat);
            leaf.scale.set(1.2, 0.4, 0.8);
            leaf.position.set((i === 0 ? -1 : 1) * 0.12 * scale, 0.5 * scale, 0);
            leaf.rotation.z = (i === 0 ? 0.3 : -0.3);
            group.add(leaf);
        }
        group.userData.swayPivot = 0;
    },

    // 萝卜
    buildRadish(group, config, stage) {
        const leafMat = new THREE.MeshLambertMaterial({ color: config.colors.leaf });
        const rootMat = new THREE.MeshLambertMaterial({ color: config.colors.fruit });
        const scale = [0, 0.15, 0.4, 0.7, 1.0][stage] || 1.0;

        if (stage <= 1) { this.buildSeedling(group, config, scale * 1.5); return; }

        // 羽状复叶丛 - 细长向外散开
        const leafCount = stage >= 4 ? 8 : 5;
        for (let i = 0; i < leafCount; i++) {
            const angle = (i / leafCount) * Math.PI * 2;
            const leafGroup = new THREE.Group();
            leafGroup.position.set(0, 0, 0);
            leafGroup.rotation.y = angle;

            // 叶柄
            const stalkGeo = new THREE.CylinderGeometry(0.015 * scale, 0.02 * scale, 0.5 * scale, 4);
            const stalkMat = new THREE.MeshLambertMaterial({ color: 0x3CB371 });
            const stalk = new THREE.Mesh(stalkGeo, stalkMat);
            stalk.rotation.z = 0.6;
            stalk.position.set(0.15 * scale, 0.3 * scale, 0);
            leafGroup.add(stalk);

            // 羽叶片
            for (let j = 0; j < 3; j++) {
                const fGeo = new THREE.SphereGeometry(0.06 * scale, 5, 4);
                const f = new THREE.Mesh(fGeo, leafMat);
                f.scale.set(0.6, 0.3, 1.0);
                f.position.set(0.1 * scale + j * 0.1 * scale, 0.35 * scale + j * 0.08 * scale, 0);
                leafGroup.add(f);
            }
            group.add(leafGroup);
        }

        // 橙色圆锥根茎（地面以下微露）
        if (stage >= 3) {
            const rootGeo = new THREE.ConeGeometry(0.12 * scale, 0.35 * scale, 8);
            const root = new THREE.Mesh(rootGeo, rootMat);
            root.rotation.x = Math.PI;
            root.position.y = -0.05 * scale;
            root.castShadow = true;
            group.add(root);

            // 横向纹理环
            for (let r = 0; r < 3; r++) {
                const ringGeo = new THREE.TorusGeometry(0.1 * scale - r * 0.025 * scale, 0.012 * scale, 4, 12);
                const ring = new THREE.Mesh(ringGeo, new THREE.MeshLambertMaterial({ color: 0xCC5500 }));
                ring.rotation.x = Math.PI / 2;
                ring.position.y = -0.08 * scale - r * 0.08 * scale;
                group.add(ring);
            }
        }
        group.userData.swayPivot = 0;
    },

    // 生菜
    buildLettuce(group, config, stage) {
        const outerMat = new THREE.MeshLambertMaterial({ color: config.colors.leaf });
        const innerMat = new THREE.MeshLambertMaterial({ color: config.colors.fruit });
        const scale = [0, 0.15, 0.4, 0.7, 1.0][stage] || 1.0;

        if (stage <= 1) { this.buildSeedling(group, config, scale * 1.5); return; }

        // 层层包裹的叶片
        const layerCount = stage >= 4 ? 4 : 2;
        for (let layer = 0; layer < layerCount; layer++) {
            const r = (0.35 - layer * 0.07) * scale;
            const leafCount = 6 - layer;
            const mat = layer >= 2 ? innerMat : outerMat;
            for (let i = 0; i < leafCount; i++) {
                const angle = (i / leafCount) * Math.PI * 2 + layer * 0.3;
                const leafGeo = new THREE.SphereGeometry(r * 0.6, 6, 5);
                const leaf = new THREE.Mesh(leafGeo, mat);
                leaf.scale.set(1.0, 0.35, 1.3);
                leaf.position.set(
                    Math.cos(angle) * r * 0.7,
                    layer * 0.08 * scale + 0.05,
                    Math.sin(angle) * r * 0.7
                );
                leaf.rotation.y = angle;
                leaf.rotation.z = 0.3 + layer * 0.1;
                leaf.castShadow = true;
                group.add(leaf);
            }
        }
        group.userData.swayPivot = 0;
    },

    // 番茄
    buildTomato(group, config, stage) {
        const leafMat = new THREE.MeshLambertMaterial({ color: config.colors.leaf });
        const stemMat = new THREE.MeshLambertMaterial({ color: config.colors.stem });
        const fruitMat = new THREE.MeshLambertMaterial({ color: config.colors.fruit });
        const calyxMat = new THREE.MeshLambertMaterial({ color: config.colors.calyx });
        const scale = [0, 0.15, 0.4, 0.7, 1.0][stage] || 1.0;

        if (stage <= 1) { this.buildSeedling(group, config, scale * 1.5); return; }

        // 主茎 - 藤蔓攀爬型
        const stemH = 1.2 * scale;
        const stemGeo = new THREE.CylinderGeometry(0.04 * scale, 0.06 * scale, stemH, 6);
        const stem = new THREE.Mesh(stemGeo, stemMat);
        stem.position.y = stemH / 2;
        stem.castShadow = true;
        group.add(stem);

        // 锯齿卵形叶片（对生排列）
        const leafPairs = stage >= 3 ? 3 : 2;
        for (let i = 0; i < leafPairs; i++) {
            const h = 0.3 * scale + i * 0.3 * scale;
            [-1, 1].forEach(side => {
                const lGeo = new THREE.SphereGeometry(0.15 * scale, 6, 5);
                const l = new THREE.Mesh(lGeo, leafMat);
                l.scale.set(1.5, 0.35, 1.0);
                l.position.set(side * 0.25 * scale, h, 0);
                l.rotation.z = side * 0.4;
                group.add(l);
            });
        }

        // 果实（成熟阶段）
        if (stage >= 3) {
            const fruitCount = stage >= 4 ? 3 : 1;
            for (let f = 0; f < fruitCount; f++) {
                const angle = (f / fruitCount) * Math.PI * 2;
                const fGeo = new THREE.SphereGeometry(0.18 * scale, 10, 8);
                const fruit = new THREE.Mesh(fGeo, fruitMat);
                fruit.position.set(
                    Math.cos(angle) * 0.2 * scale,
                    stemH * 0.75,
                    Math.sin(angle) * 0.2 * scale
                );
                fruit.castShadow = true;
                group.add(fruit);

                // 绿色五角星萼片
                for (let s = 0; s < 5; s++) {
                    const sa = (s / 5) * Math.PI * 2;
                    const sGeo = new THREE.ConeGeometry(0.04 * scale, 0.08 * scale, 3);
                    const sep = new THREE.Mesh(sGeo, calyxMat);
                    sep.position.set(
                        Math.cos(angle) * 0.2 * scale + Math.cos(sa) * 0.1 * scale,
                        stemH * 0.75 + 0.18 * scale,
                        Math.sin(angle) * 0.2 * scale + Math.sin(sa) * 0.1 * scale
                    );
                    sep.rotation.x = Math.PI;
                    group.add(sep);
                }
            }
        }
        group.userData.swayPivot = 0;
    },

    // 玉米
    buildCorn(group, config, stage) {
        const leafMat = new THREE.MeshLambertMaterial({ color: config.colors.leaf });
        const stemMat = new THREE.MeshLambertMaterial({ color: config.colors.stem });
        const huskMat = new THREE.MeshLambertMaterial({ color: config.colors.husk });
        const fruitMat = new THREE.MeshLambertMaterial({ color: config.colors.fruit });
        const silkMat = new THREE.MeshLambertMaterial({ color: config.colors.silk });
        const scale = [0, 0.15, 0.4, 0.7, 1.0][stage] || 1.0;

        if (stage <= 1) { this.buildSeedling(group, config, scale * 1.5); return; }

        // 粗壮直立茎，节间明显
        const stemH = 1.8 * scale;
        const stemGeo = new THREE.CylinderGeometry(0.06 * scale, 0.09 * scale, stemH, 7);
        const stem = new THREE.Mesh(stemGeo, stemMat);
        stem.position.y = stemH / 2;
        stem.castShadow = true;
        group.add(stem);

        // 节间标记
        const nodeCount = 3;
        for (let n = 0; n < nodeCount; n++) {
            const nodeGeo = new THREE.CylinderGeometry(0.08 * scale, 0.08 * scale, 0.04 * scale, 7);
            const node = new THREE.Mesh(nodeGeo, new THREE.MeshLambertMaterial({ color: 0x2E8B57 }));
            node.position.y = (0.4 + n * 0.45) * scale;
            group.add(node);
        }

        // 大型叶片互生
        const leafCount = stage >= 3 ? 5 : 3;
        for (let i = 0; i < leafCount; i++) {
            const h = (0.3 + i * 0.3) * scale;
            const side = i % 2 === 0 ? 1 : -1;
            const lGeo = new THREE.SphereGeometry(0.22 * scale, 6, 4);
            const l = new THREE.Mesh(lGeo, leafMat);
            l.scale.set(0.5, 0.2, 2.0);
            l.position.set(side * 0.3 * scale, h, 0);
            l.rotation.z = side * 0.5;
            l.rotation.y = i * 0.5;
            group.add(l);
        }

        // 玉米棒（成熟阶段）
        if (stage >= 3) {
            // 苞叶
            const huskGeo = new THREE.CylinderGeometry(0.12 * scale, 0.08 * scale, 0.45 * scale, 8);
            const husk = new THREE.Mesh(huskGeo, huskMat);
            husk.position.set(0.15 * scale, stemH * 0.55, 0);
            husk.rotation.z = 0.3;
            group.add(husk);

            // 玉米棒本体
            const cobGeo = new THREE.CylinderGeometry(0.09 * scale, 0.07 * scale, 0.4 * scale, 8);
            const cob = new THREE.Mesh(cobGeo, fruitMat);
            cob.position.set(0.15 * scale, stemH * 0.55, 0);
            cob.rotation.z = 0.3;
            group.add(cob);

            // 顶部红棕色须
            for (let s = 0; s < 6; s++) {
                const silkGeo = new THREE.CylinderGeometry(0.008 * scale, 0.004 * scale, 0.15 * scale, 3);
                const silk = new THREE.Mesh(silkGeo, silkMat);
                const sa = (s / 6) * Math.PI * 2;
                silk.position.set(
                    0.15 * scale + Math.cos(sa) * 0.05 * scale,
                    stemH * 0.55 + 0.25 * scale,
                    Math.sin(sa) * 0.05 * scale
                );
                silk.rotation.z = Math.cos(sa) * 0.3;
                group.add(silk);
            }

            // 顶部雄穗
            const tassleGeo = new THREE.ConeGeometry(0.05 * scale, 0.25 * scale, 5);
            const tassle = new THREE.Mesh(tassleGeo, silkMat);
            tassle.position.y = stemH + 0.12 * scale;
            group.add(tassle);
        }
        group.userData.swayPivot = 0.2 * scale;
    },

    // 小麦
    buildWheat(group, config, stage) {
        const stemMat = new THREE.MeshLambertMaterial({ color: stage >= 4 ? config.colors.fruit : config.colors.leaf });
        const earMat = new THREE.MeshLambertMaterial({ color: config.colors.fruit });
        const scale = [0, 0.15, 0.4, 0.7, 1.0][stage] || 1.0;

        if (stage <= 1) { this.buildSeedling(group, config, scale * 1.5); return; }

        // 丛生细茎（3-5根）
        const stalkCount = stage >= 3 ? 5 : 3;
        for (let i = 0; i < stalkCount; i++) {
            const offset = (i - Math.floor(stalkCount / 2)) * 0.08 * scale;
            const h = (0.9 + Math.random() * 0.2) * scale;
            const sGeo = new THREE.CylinderGeometry(0.02 * scale, 0.03 * scale, h, 4);
            const s = new THREE.Mesh(sGeo, stemMat);
            s.position.set(offset, h / 2, (Math.random() - 0.5) * 0.08 * scale);
            s.rotation.z = (Math.random() - 0.5) * 0.1;
            s.castShadow = true;
            group.add(s);

            // 顶部麦穗
            if (stage >= 3) {
                const earGeo = new THREE.SphereGeometry(0.07 * scale, 6, 5);
                const ear = new THREE.Mesh(earGeo, earMat);
                ear.scale.set(0.7, 1.8, 0.7);
                ear.position.set(offset, h + 0.1 * scale, (Math.random() - 0.5) * 0.08 * scale);
                // 成熟时弯垂
                if (stage >= 4) ear.rotation.z = 0.2 + Math.random() * 0.1;
                group.add(ear);

                // 长芒刺
                if (stage >= 4) {
                    for (let a = 0; a < 4; a++) {
                        const awnGeo = new THREE.CylinderGeometry(0.005 * scale, 0.002 * scale, 0.18 * scale, 3);
                        const awn = new THREE.Mesh(awnGeo, earMat);
                        awn.position.set(offset + (a - 1.5) * 0.03 * scale, h + 0.2 * scale, 0);
                        awn.rotation.z = (a - 1.5) * 0.15;
                        group.add(awn);
                    }
                }
            }
        }
        group.userData.swayPivot = 0.1 * scale;
    },

    // 草莓
    buildStrawberry(group, config, stage) {
        const leafMat = new THREE.MeshLambertMaterial({ color: config.colors.leaf });
        const fruitMat = new THREE.MeshLambertMaterial({ color: config.colors.fruit });
        const seedMat = new THREE.MeshLambertMaterial({ color: config.colors.seed });
        const stemMat = new THREE.MeshLambertMaterial({ color: config.colors.stem });
        const scale = [0, 0.15, 0.4, 0.7, 1.0][stage] || 1.0;

        if (stage <= 1) { this.buildSeedling(group, config, scale * 1.5); return; }

        // 短茎贴地，三叶复叶
        const leafCount = stage >= 3 ? 6 : 3;
        for (let i = 0; i < leafCount; i++) {
            const angle = (i / leafCount) * Math.PI * 2;
            const lGeo = new THREE.SphereGeometry(0.15 * scale, 6, 5);
            const l = new THREE.Mesh(lGeo, leafMat);
            l.scale.set(1.0, 0.3, 1.3);
            l.position.set(Math.cos(angle) * 0.22 * scale, 0.08 * scale, Math.sin(angle) * 0.22 * scale);
            l.rotation.y = angle;
            group.add(l);
        }

        // 心形/圆锥形红果
        if (stage >= 3) {
            const fruitCount = stage >= 4 ? 3 : 1;
            for (let f = 0; f < fruitCount; f++) {
                const fa = (f / fruitCount) * Math.PI * 2;
                const fGeo = new THREE.ConeGeometry(0.1 * scale, 0.2 * scale, 8);
                const fruit = new THREE.Mesh(fGeo, fruitMat);
                fruit.rotation.x = Math.PI;
                fruit.position.set(
                    Math.cos(fa) * 0.15 * scale,
                    0.22 * scale,
                    Math.sin(fa) * 0.15 * scale
                );
                fruit.castShadow = true;
                group.add(fruit);

                // 表面黄色籽点
                for (let s = 0; s < 8; s++) {
                    const sa = (s / 8) * Math.PI * 2;
                    const seedGeo = new THREE.SphereGeometry(0.015 * scale, 4, 4);
                    const seed = new THREE.Mesh(seedGeo, seedMat);
                    seed.position.set(
                        Math.cos(fa) * 0.15 * scale + Math.cos(sa) * 0.07 * scale,
                        0.22 * scale + Math.sin(sa) * 0.07 * scale,
                        Math.sin(fa) * 0.15 * scale
                    );
                    group.add(seed);
                }

                // 绿色萼片
                const sGeo = new THREE.ConeGeometry(0.06 * scale, 0.06 * scale, 5);
                const sep = new THREE.Mesh(sGeo, leafMat);
                sep.position.set(Math.cos(fa) * 0.15 * scale, 0.32 * scale, Math.sin(fa) * 0.15 * scale);
                group.add(sep);
            }
        }
        group.userData.swayPivot = 0;
    },

    // 蓝莓
    buildBlueberry(group, config, stage) {
        const leafMat = new THREE.MeshLambertMaterial({ color: config.colors.leaf });
        const fruitMat = new THREE.MeshLambertMaterial({ color: config.colors.fruit });
        const stemMat = new THREE.MeshLambertMaterial({ color: config.colors.stem });
        const scale = [0, 0.15, 0.4, 0.7, 1.0][stage] || 1.0;

        if (stage <= 1) { this.buildSeedling(group, config, scale * 1.5); return; }

        // 灌木枝条
        const branchCount = stage >= 3 ? 5 : 3;
        for (let i = 0; i < branchCount; i++) {
            const angle = (i / branchCount) * Math.PI * 2;
            const bGeo = new THREE.CylinderGeometry(0.02 * scale, 0.03 * scale, 0.5 * scale, 4);
            const b = new THREE.Mesh(bGeo, stemMat);
            b.position.set(Math.cos(angle) * 0.15 * scale, 0.25 * scale, Math.sin(angle) * 0.15 * scale);
            b.rotation.z = Math.cos(angle) * 0.4;
            b.rotation.x = Math.sin(angle) * 0.4;
            group.add(b);

            // 叶片
            const lGeo = new THREE.SphereGeometry(0.1 * scale, 5, 4);
            const l = new THREE.Mesh(lGeo, leafMat);
            l.scale.set(1.0, 0.3, 1.2);
            l.position.set(Math.cos(angle) * 0.28 * scale, 0.45 * scale, Math.sin(angle) * 0.28 * scale);
            group.add(l);

            // 果实串
            if (stage >= 3) {
                const berryCount = stage >= 4 ? 4 : 2;
                for (let b2 = 0; b2 < berryCount; b2++) {
                    const bGeo2 = new THREE.SphereGeometry(0.06 * scale, 7, 6);
                    const berry = new THREE.Mesh(bGeo2, fruitMat);
                    berry.position.set(
                        Math.cos(angle) * 0.28 * scale + (Math.random() - 0.5) * 0.1 * scale,
                        0.5 * scale + b2 * 0.1 * scale,
                        Math.sin(angle) * 0.28 * scale + (Math.random() - 0.5) * 0.1 * scale
                    );
                    berry.castShadow = true;
                    group.add(berry);
                }
            }
        }
        group.userData.swayPivot = 0;
    },

    // 南瓜
    buildPumpkin(group, config, stage) {
        const leafMat = new THREE.MeshLambertMaterial({ color: config.colors.leaf });
        const fruitMat = new THREE.MeshLambertMaterial({ color: config.colors.fruit });
        const grooveMat = new THREE.MeshLambertMaterial({ color: config.colors.groove });
        const stemMat = new THREE.MeshLambertMaterial({ color: config.colors.stem });
        const scale = [0, 0.15, 0.4, 0.7, 1.0][stage] || 1.0;

        if (stage <= 1) { this.buildSeedling(group, config, scale * 1.5); return; }

        // 粗壮藤蔓贴地
        const vineCount = stage >= 3 ? 4 : 2;
        for (let i = 0; i < vineCount; i++) {
            const angle = (i / vineCount) * Math.PI * 2;
            const vGeo = new THREE.CylinderGeometry(0.03 * scale, 0.04 * scale, 0.5 * scale, 5);
            const vine = new THREE.Mesh(vGeo, stemMat);
            vine.rotation.z = Math.PI / 2;
            vine.position.set(Math.cos(angle) * 0.3 * scale, 0.03, Math.sin(angle) * 0.3 * scale);
            vine.rotation.y = angle;
            group.add(vine);

            // 大型掌状叶
            const lGeo = new THREE.SphereGeometry(0.2 * scale, 6, 5);
            const l = new THREE.Mesh(lGeo, leafMat);
            l.scale.set(1.2, 0.25, 1.2);
            l.position.set(Math.cos(angle) * 0.55 * scale, 0.05, Math.sin(angle) * 0.55 * scale);
            group.add(l);
        }

        // 扁球形南瓜主体（8-10条纵向凹槽）
        if (stage >= 3) {
            const pumpkinGeo = new THREE.SphereGeometry(0.35 * scale, 10, 8);
            const pumpkin = new THREE.Mesh(pumpkinGeo, fruitMat);
            pumpkin.scale.set(1.2, 0.85, 1.2);
            pumpkin.position.y = 0.28 * scale;
            pumpkin.castShadow = true;
            group.add(pumpkin);

            // 纵向凹槽（用深色细条模拟）
            const grooveCount = 8;
            for (let g = 0; g < grooveCount; g++) {
                const ga = (g / grooveCount) * Math.PI * 2;
                const gGeo = new THREE.CylinderGeometry(0.02 * scale, 0.02 * scale, 0.55 * scale, 3);
                const groove = new THREE.Mesh(gGeo, grooveMat);
                groove.position.set(
                    Math.cos(ga) * 0.32 * scale,
                    0.28 * scale,
                    Math.sin(ga) * 0.32 * scale
                );
                groove.rotation.x = Math.PI / 2;
                groove.rotation.y = ga;
                group.add(groove);
            }

            // 顶部茎
            const topStemGeo = new THREE.CylinderGeometry(0.03 * scale, 0.04 * scale, 0.15 * scale, 5);
            const topStem = new THREE.Mesh(topStemGeo, stemMat);
            topStem.position.y = 0.58 * scale;
            group.add(topStem);
        }
        group.userData.swayPivot = 0;
    },

    // 向日葵
    buildSunflower(group, config, stage) {
        const leafMat = new THREE.MeshLambertMaterial({ color: config.colors.leaf });
        const stemMat = new THREE.MeshLambertMaterial({ color: config.colors.stem });
        const petalMat = new THREE.MeshLambertMaterial({ color: config.colors.petal });
        const centerMat = new THREE.MeshLambertMaterial({ color: config.colors.center });
        const scale = [0, 0.15, 0.4, 0.7, 1.0][stage] || 1.0;

        if (stage <= 1) { this.buildSeedling(group, config, scale * 1.5); return; }

        // 粗壮直立茎
        const stemH = 1.8 * scale;
        const stemGeo = new THREE.CylinderGeometry(0.06 * scale, 0.09 * scale, stemH, 7);
        const stem = new THREE.Mesh(stemGeo, stemMat);
        stem.position.y = stemH / 2;
        stem.castShadow = true;
        group.add(stem);

        // 大型心形叶互生
        const leafCount = stage >= 3 ? 4 : 2;
        for (let i = 0; i < leafCount; i++) {
            const h = (0.4 + i * 0.35) * scale;
            const side = i % 2 === 0 ? 1 : -1;
            const lGeo = new THREE.SphereGeometry(0.22 * scale, 6, 5);
            const l = new THREE.Mesh(lGeo, leafMat);
            l.scale.set(1.0, 0.3, 1.4);
            l.position.set(side * 0.3 * scale, h, 0);
            l.rotation.z = side * 0.5;
            group.add(l);
        }

        // 大圆盘花序（成熟阶段）
        if (stage >= 3) {
            const flowerGroup = new THREE.Group();
            flowerGroup.position.y = stemH + 0.05 * scale;

            // 花盘中心（螺旋种子）
            const diskGeo = new THREE.CylinderGeometry(0.28 * scale, 0.28 * scale, 0.06 * scale, 16);
            const disk = new THREE.Mesh(diskGeo, centerMat);
            flowerGroup.add(disk);

            // 螺旋种子纹理
            for (let s = 0; s < 20; s++) {
                const sa = s * 2.4;
                const sr = Math.sqrt(s / 20) * 0.22 * scale;
                const sGeo = new THREE.SphereGeometry(0.025 * scale, 4, 4);
                const seed = new THREE.Mesh(sGeo, new THREE.MeshLambertMaterial({ color: 0x5C3317 }));
                seed.position.set(Math.cos(sa) * sr, 0.04 * scale, Math.sin(sa) * sr);
                flowerGroup.add(seed);
            }

            // 外围舌状花瓣（16片）
            const petalCount = 16;
            for (let p = 0; p < petalCount; p++) {
                const pa = (p / petalCount) * Math.PI * 2;
                const pGeo = new THREE.SphereGeometry(0.12 * scale, 5, 4);
                const petal = new THREE.Mesh(pGeo, petalMat);
                petal.scale.set(0.5, 0.2, 1.8);
                petal.position.set(Math.cos(pa) * 0.38 * scale, 0, Math.sin(pa) * 0.38 * scale);
                petal.rotation.y = pa;
                flowerGroup.add(petal);
            }

            group.add(flowerGroup);
            group.userData.flowerGroup = flowerGroup;
        }
        group.userData.swayPivot = 0.3 * scale;
    },

    // 金苹果树
    buildGoldApple(group, config, stage) {
        const leafMat = new THREE.MeshLambertMaterial({ color: config.colors.leaf });
        const trunkMat = new THREE.MeshLambertMaterial({ color: config.colors.trunk });
        const fruitMat = new THREE.MeshLambertMaterial({ color: config.colors.fruit });
        const scale = [0, 0.15, 0.4, 0.7, 1.0][stage] || 1.0;

        if (stage <= 1) { this.buildSeedling(group, config, scale * 1.5); return; }

        // 棕色粗壮主干
        const trunkH = 1.0 * scale;
        const trunkGeo = new THREE.CylinderGeometry(0.1 * scale, 0.14 * scale, trunkH, 8);
        const trunk = new THREE.Mesh(trunkGeo, trunkMat);
        trunk.position.y = trunkH / 2;
        trunk.castShadow = true;
        group.add(trunk);

        // 分叉枝条
        const branchCount = stage >= 3 ? 4 : 2;
        for (let i = 0; i < branchCount; i++) {
            const angle = (i / branchCount) * Math.PI * 2;
            const bGeo = new THREE.CylinderGeometry(0.04 * scale, 0.07 * scale, 0.5 * scale, 6);
            const b = new THREE.Mesh(bGeo, trunkMat);
            b.position.set(Math.cos(angle) * 0.2 * scale, trunkH + 0.15 * scale, Math.sin(angle) * 0.2 * scale);
            b.rotation.z = Math.cos(angle) * 0.5;
            b.rotation.x = Math.sin(angle) * 0.5;
            group.add(b);
        }

        // 圆球形树冠
        const crownGeo = new THREE.SphereGeometry(0.55 * scale, 10, 8);
        const crown = new THREE.Mesh(crownGeo, leafMat);
        crown.position.y = trunkH + 0.45 * scale;
        crown.castShadow = true;
        group.add(crown);

        // 金色苹果果实
        if (stage >= 3) {
            const appleCount = stage >= 4 ? 5 : 2;
            for (let a = 0; a < appleCount; a++) {
                const angle = (a / appleCount) * Math.PI * 2;
                const r = 0.35 * scale;
                const aGeo = new THREE.SphereGeometry(0.1 * scale, 8, 7);
                const apple = new THREE.Mesh(aGeo, fruitMat);
                apple.position.set(
                    Math.cos(angle) * r,
                    trunkH + 0.4 * scale + (Math.random() - 0.5) * 0.2 * scale,
                    Math.sin(angle) * r
                );
                apple.castShadow = true;
                group.add(apple);

                // 顶部凹陷短柄
                const stalkGeo = new THREE.CylinderGeometry(0.01 * scale, 0.01 * scale, 0.06 * scale, 3);
                const stalk = new THREE.Mesh(stalkGeo, trunkMat);
                stalk.position.set(
                    Math.cos(angle) * r,
                    trunkH + 0.5 * scale + (Math.random() - 0.5) * 0.2 * scale,
                    Math.sin(angle) * r
                );
                group.add(stalk);
            }
        }
        group.userData.swayPivot = 0.4 * scale;
    },

    // 彩虹玫瑰
    buildRainbowRose(group, config, stage) {
        const leafMat = new THREE.MeshLambertMaterial({ color: config.colors.leaf });
        const stemMat = new THREE.MeshLambertMaterial({ color: config.colors.stem });
        const petalMat = new THREE.MeshLambertMaterial({ color: config.colors.petal });
        const thornMat = new THREE.MeshLambertMaterial({ color: config.colors.thorn });
        const scale = [0, 0.15, 0.4, 0.7, 1.0][stage] || 1.0;

        if (stage <= 1) { this.buildSeedling(group, config, scale * 1.5); return; }

        // 带刺木质茎
        const stemH = 1.0 * scale;
        const stemGeo = new THREE.CylinderGeometry(0.04 * scale, 0.06 * scale, stemH, 6);
        const stem = new THREE.Mesh(stemGeo, stemMat);
        stem.position.y = stemH / 2;
        stem.castShadow = true;
        group.add(stem);

        // 刺
        for (let t = 0; t < 4; t++) {
            const tGeo = new THREE.ConeGeometry(0.02 * scale, 0.06 * scale, 3);
            const thorn = new THREE.Mesh(tGeo, thornMat);
            thorn.position.set((t % 2 === 0 ? 0.05 : -0.05) * scale, (0.2 + t * 0.2) * scale, 0);
            thorn.rotation.z = (t % 2 === 0 ? -1 : 1) * Math.PI / 3;
            group.add(thorn);
        }

        // 羽状复叶
        const leafPairs = stage >= 3 ? 3 : 2;
        for (let i = 0; i < leafPairs; i++) {
            [-1, 1].forEach(side => {
                const lGeo = new THREE.SphereGeometry(0.1 * scale, 5, 4);
                const l = new THREE.Mesh(lGeo, leafMat);
                l.scale.set(1.2, 0.3, 0.9);
                l.position.set(side * 0.15 * scale, (0.25 + i * 0.25) * scale, 0);
                l.rotation.z = side * 0.4;
                group.add(l);
            });
        }

        // 螺旋层叠花瓣（成熟阶段）
        if (stage >= 3) {
            const flowerGroup = new THREE.Group();
            flowerGroup.position.y = stemH + 0.05 * scale;

            // 多层花瓣由内向外
            const layerColors = [0xFF007F, 0xFF4499, 0xFF66AA, 0xFF88BB, 0xFFAACC];
            for (let layer = 0; layer < (stage >= 4 ? 5 : 3); layer++) {
                const petalCount = 5 + layer;
                const r = (0.05 + layer * 0.07) * scale;
                const layerColor = layerColors[layer] || config.colors.petal;
                const lMat = new THREE.MeshLambertMaterial({ color: layerColor });
                for (let p = 0; p < petalCount; p++) {
                    const pa = (p / petalCount) * Math.PI * 2 + layer * 0.3;
                    const pGeo = new THREE.SphereGeometry(0.08 * scale, 5, 4);
                    const petal = new THREE.Mesh(pGeo, lMat);
                    petal.scale.set(0.6, 0.4, 1.2);
                    petal.position.set(Math.cos(pa) * r, layer * 0.04 * scale, Math.sin(pa) * r);
                    petal.rotation.y = pa;
                    flowerGroup.add(petal);
                }
            }
            group.add(flowerGroup);
        }
        group.userData.swayPivot = 0.2 * scale;
    },

    // 主入口：根据作物ID和阶段构建模型
    build(group, cropId, stage, config) {
        const cfg = config || PlantConfig[cropId];
        if (!cfg) {
            // 未知作物使用通用模型
            this.buildSeedling(group, { colors: { stem: 0x44aa44, leaf: 0x33bb33 } }, [0, 0.15, 0.4, 0.7, 1.0][stage] || 1.0);
            return;
        }

        switch (cropId) {
            case 'radish':    this.buildRadish(group, cfg, stage); break;
            case 'lettuce':   this.buildLettuce(group, cfg, stage); break;
            case 'tomato':    this.buildTomato(group, cfg, stage); break;
            case 'corn':      this.buildCorn(group, cfg, stage); break;
            case 'wheat':     this.buildWheat(group, cfg, stage); break;
            case 'strawberry':this.buildStrawberry(group, cfg, stage); break;
            case 'blueberry': this.buildBlueberry(group, cfg, stage); break;
            case 'pumpkin':   this.buildPumpkin(group, cfg, stage); break;
            case 'sunflower': this.buildSunflower(group, cfg, stage); break;
            case 'goldApple': this.buildGoldApple(group, cfg, stage); break;
            case 'rainbowRose':this.buildRainbowRose(group, cfg, stage); break;
            default:
                this.buildSeedling(group, cfg, [0, 0.15, 0.4, 0.7, 1.0][stage] || 1.0);
        }
    }
};

// ===== 植物动画控制器 =====
const PlantAnimator = {
    // 更新单个作物的随风摇摆动画
    updateSway(cropGroup, cropId, time) {
        if (!cropGroup) return;
        const cfg = PlantConfig[cropId];
        if (!cfg) return;

        const { swayAmplitude, swayFrequency, type } = cfg.animation;
        const amp = THREE.MathUtils.degToRad(swayAmplitude);
        const pivot = cropGroup.userData.swayPivot || 0;

        // 随机相位偏移（每株植物不同）
        const phase = cropGroup.userData.swayPhase || 0;
        const sway = Math.sin(time * swayFrequency * Math.PI * 2 + phase) * amp;

        switch (type) {
            case 'grain':
                // 谷物：整体波浪式起伏
                cropGroup.rotation.z = sway;
                cropGroup.rotation.x = sway * 0.3;
                break;
            case 'tall':
                // 高茎：顶部为主，基部稳定（通过整体旋转模拟）
                cropGroup.rotation.z = sway * 0.6;
                break;
            case 'short':
                // 矮生：叶片轻微颤动
                cropGroup.rotation.z = sway * 0.4;
                cropGroup.rotation.x = sway * 0.2;
                break;
            case 'vine':
                // 藤蔓：藤蔓晃动
                cropGroup.rotation.z = sway * 0.7;
                cropGroup.rotation.x = Math.sin(time * swayFrequency * Math.PI * 2 * 0.7 + phase) * amp * 0.4;
                break;
            case 'tree':
                // 树：轻微摇摆
                cropGroup.rotation.z = sway * 0.3;
                break;
            default:
                cropGroup.rotation.z = sway * 0.5;
        }

        // 向日葵花盘朝向太阳（轻微追踪）
        if (cropId === 'sunflower' && cropGroup.userData.flowerGroup) {
            cropGroup.userData.flowerGroup.rotation.y = Math.sin(time * 0.1) * 0.3;
        }
    },

    // 成熟作物跳动动画
    updateBounce(cropGroup, time) {
        if (!cropGroup || !cropGroup.userData.bouncing) return;
        const bt = cropGroup.userData.bounceTime || 0;
        const bounce = Math.abs(Math.sin((time + bt) * 1.5)) * 0.04;
        cropGroup.position.y = 0.3 + bounce;
    },

    // 生长弹性过渡动画（调用时传入目标scale和当前进度）
    applyGrowthScale(cropGroup, targetScale, progress) {
        // 弹性缓出：overshoot后回弹
        const t = Math.min(progress, 1.0);
        const elastic = t < 1 ? Math.pow(2, -10 * t) * Math.sin((t * 10 - 0.75) * (2 * Math.PI) / 3) + 1 : 1;
        const s = targetScale * elastic;
        cropGroup.scale.setScalar(s);
    }
};

// 获取作物生长阶段（0-4）
function getCropStage(growProgress, state) {
    if (state === 'ready') return 4;
    if (growProgress < 0.15) return 0;
    if (growProgress < 0.35) return 1;
    if (growProgress < 0.6) return 2;
    if (growProgress < 0.85) return 3;
    return 3;
}
