// ===== 3D农场 天地融合模块 =====
// 解决地表边缘锐利、天地接缝生硬问题，营造无边界沉浸感

const SceneHorizon = {

    // 动态元素引用
    birds: [],          // 飞鸟群
    horizonClouds: [],  // 地平线云雾带
    distantTrees: [],   // 远景树林

    // 颜色配置（与天空盒地平线色保持一致）
    colors: {
        day:     { sky: 0x87CEEB, fog: 0xB0D8F0, horizon: 0xC8E8F8 },
        sunset:  { sky: 0xFF7043, fog: 0xFFB347, horizon: 0xFFCC80 },
        night:   { sky: 0x1A237E, fog: 0x2C3E50, horizon: 0x37474F },
    },

    // ===== 1. 初始化指数雾效 =====
    setupFog(scene) {
        // 用指数平方雾替换线性雾：近处清晰，远处自然消隐
        scene.fog = new THREE.FogExp2(0xB0D8F0, 0.018);
    },

    // 根据天空亮度实时同步雾色
    updateFogColor(scene, skyBrightness) {
        if (!scene.fog) return;
        // 日间→黄昏→夜晚 颜色插值
        const r = 0.53 * skyBrightness + 0.18 * (1 - skyBrightness);
        const g = 0.81 * skyBrightness + 0.24 * (1 - skyBrightness);
        const b = 0.98 * skyBrightness + 0.31 * (1 - skyBrightness);
        scene.fog.color.setRGB(r * 1.1, g * 1.05, b);
    },

    // ===== 2. 地形边缘下沉处理 =====
    // 修改地面几何体，边缘最后15%区域逐渐下沉，打破方形感
    createSunkenTerrain(scene) {
        const size = 80;       // 地面总尺寸（比原来更大，延伸到雾中）
        const segments = 40;
        const groundGeo = new THREE.PlaneGeometry(size, size, segments, segments);
        const posAttr = groundGeo.attributes.position;
        const colors = [];

        const halfSize = size / 2;
        const fadeStart = 0.55;  // 从55%半径开始下沉和颜色渐变
        const maxDrop = 6;       // 最大下沉深度

        // 草地颜色
        const grassColors = [
            new THREE.Color(0x4A7C23),
            new THREE.Color(0x2D5016),
            new THREE.Color(0x7CB342),
            new THREE.Color(0xA68B5B),
        ];
        // 雾色（边缘渐变目标色）
        const fogColor = new THREE.Color(0xB0D8F0);

        for (let i = 0; i < posAttr.count; i++) {
            const x = posAttr.getX(i);
            const y = posAttr.getY(i); // PlaneGeometry在XY平面，旋转后Y变Z

            // 到中心的归一化距离
            const dist = Math.sqrt(x * x + y * y) / halfSize;
            const fadeFactor = Math.max(0, (dist - fadeStart) / (1 - fadeStart));

            // 边缘下沉（Z轴，旋转前）
            const drop = -fadeFactor * fadeFactor * maxDrop;
            posAttr.setZ(i, drop);

            // 顶点颜色：草地色 → 雾色渐变
            const r = Math.random();
            let baseColor;
            if (r < 0.70) baseColor = grassColors[0];
            else if (r < 0.85) baseColor = grassColors[1];
            else if (r < 0.95) baseColor = grassColors[2];
            else baseColor = grassColors[3];

            // 边缘区域草地密度衰减（颜色向雾色靠拢）
            const cr = baseColor.r + (fogColor.r - baseColor.r) * fadeFactor * fadeFactor;
            const cg = baseColor.g + (fogColor.g - baseColor.g) * fadeFactor * fadeFactor;
            const cb = baseColor.b + (fogColor.b - baseColor.b) * fadeFactor * fadeFactor;
            const jitter = (Math.random() - 0.5) * 0.04 * (1 - fadeFactor);
            colors.push(cr + jitter, cg + jitter, cb + jitter);
        }

        groundGeo.setAttribute('color', new THREE.BufferAttribute(new Float32Array(colors), 3));
        groundGeo.computeVertexNormals();

        const groundMat = new THREE.MeshStandardMaterial({
            vertexColors: true,
            fog: true,
            roughness: 0.9, metalness: 0.0
        });
        const ground = new THREE.Mesh(groundGeo, groundMat);
        ground.rotation.x = -Math.PI / 2;
        ground.receiveShadow = true;
        ground.position.y = -0.01; // 略低于原地面，避免Z-fighting
        scene.add(ground);
    },

    // ===== 3. 远景层系统 =====
    createDistantLayers(scene) {
        // 第1层：近景树林轮廓（场景边缘外15单位，透明度80%）
        this._createForestSilhouette(scene, 38, 0.80, 0x2D5A3D, 6, 10);

        // 第2层：远山剪影（40单位，透明度50%，偏蓝灰）
        this._createMountainLayer(scene, 55, 0.50, 0x6B8E9F, 3.5, 8);

        // 第3层：最远山脉（75单位，透明度30%，接近天空色）
        this._createMountainLayer(scene, 72, 0.28, 0x9BB8CC, 2.5, 5);

        // 远方农田色块（平原方向）
        this._createDistantFields(scene);

        // 建筑剪影（点缀于树林间）
        this._createDistantBuildings(scene);
    },

    _createForestSilhouette(scene, radius, opacity, color, minH, maxH) {
        const mat = new THREE.MeshStandardMaterial({
            color, transparent: true, opacity,
            fog: true, side: THREE.FrontSide,
            roughness: 0.9, metalness: 0.0
        });
        const count = 48; // 连续树冠带
        for (let i = 0; i < count; i++) {
            const angle = (i / count) * Math.PI * 2;
            const r = radius + (Math.random() - 0.5) * 6;
            const x = Math.cos(angle) * r;
            const z = Math.sin(angle) * r;
            const h = minH + Math.random() * (maxH - minH);
            const w = 2.5 + Math.random() * 3;

            // 锯齿状树冠（圆锥+球体组合）
            const group = new THREE.Group();
            group.position.set(x, 0, z);

            // 树干
            const trunkGeo = new THREE.CylinderGeometry(0.2, 0.35, h * 0.4, 5);
            const trunk = new THREE.Mesh(trunkGeo, new THREE.MeshStandardMaterial({
                color: 0x3E2723, transparent: true, opacity: opacity * 0.8, fog: true,
                roughness: 0.9, metalness: 0.0
            }));
            trunk.position.y = h * 0.2;
            group.add(trunk);

            // 树冠（2-3层锥形）
            const layers = 2 + Math.floor(Math.random() * 2);
            for (let l = 0; l < layers; l++) {
                const lh = h * (0.5 - l * 0.12);
                const lw = w * (1 - l * 0.25);
                const coneGeo = new THREE.ConeGeometry(lw * 0.5, lh, 6);
                const cone = new THREE.Mesh(coneGeo, mat);
                cone.position.y = h * 0.4 + l * h * 0.15 + lh * 0.5;
                group.add(cone);
            }

            scene.add(group);
            this.distantTrees.push(group);
        }
    },

    _createMountainLayer(scene, radius, opacity, color, minH, maxH) {
        const mat = new THREE.MeshStandardMaterial({
            color, transparent: true, opacity,
            fog: true, side: THREE.FrontSide,
            roughness: 0.9, metalness: 0.0
        });
        const count = 12 + Math.floor(Math.random() * 6);
        for (let i = 0; i < count; i++) {
            const angle = (i / count) * Math.PI * 2 + (Math.random() - 0.5) * 0.3;
            const r = radius + (Math.random() - 0.5) * 10;
            const x = Math.cos(angle) * r;
            const z = Math.sin(angle) * r;
            const h = minH + Math.random() * (maxH - minH);
            const w = h * (1.5 + Math.random() * 1.5);

            // 山体：三角形/梯形
            const shape = Math.random() > 0.4 ? 'cone' : 'trapezoid';
            let geo;
            if (shape === 'cone') {
                geo = new THREE.ConeGeometry(w * 0.5, h, 5 + Math.floor(Math.random() * 3));
            } else {
                // 梯形山（用BoxGeometry模拟）
                geo = new THREE.CylinderGeometry(w * 0.15, w * 0.5, h, 5);
            }
            const mesh = new THREE.Mesh(geo, mat);
            mesh.position.set(x, h * 0.5 - 1, z);
            // 轻微随机旋转，打破规则感
            mesh.rotation.y = Math.random() * Math.PI * 2;
            scene.add(mesh);
        }
    },

    _createDistantFields(scene) {
        const fieldColors = [0x9ACD32, 0xDAA520, 0x8FBC8F, 0xF4A460];
        for (let i = 0; i < 8; i++) {
            const angle = (i / 8) * Math.PI * 2 + 0.2;
            const r = 45 + Math.random() * 10;
            const x = Math.cos(angle) * r;
            const z = Math.sin(angle) * r;
            const w = 8 + Math.random() * 10;
            const d = 6 + Math.random() * 8;
            const color = fieldColors[Math.floor(Math.random() * fieldColors.length)];
            const geo = new THREE.PlaneGeometry(w, d);
            const mat = new THREE.MeshStandardMaterial({
                color, transparent: true, opacity: 0.5, fog: true,
                roughness: 0.9, metalness: 0.0
            });
            const mesh = new THREE.Mesh(geo, mat);
            mesh.rotation.x = -Math.PI / 2;
            mesh.position.set(x, -0.5, z);
            this.scene_ref = this.scene_ref; // 占位
            scene.add(mesh);
        }
    },

    _createDistantBuildings(scene) {
        const buildingColor = 0x5D6D7E;
        const mat = new THREE.MeshStandardMaterial({
            color: buildingColor, transparent: true, opacity: 0.45, fog: true,
            roughness: 0.9, metalness: 0.0
        });
        // 2-3个建筑剪影（塔尖/风车/谷仓轮廓）
        const positions = [
            [42, 0, 18], [-38, 0, 30], [30, 0, -42]
        ];
        positions.forEach(([x, y, z]) => {
            const group = new THREE.Group();
            group.position.set(x, 0, z);

            // 谷仓主体
            const bodyGeo = new THREE.BoxGeometry(3, 4, 2.5);
            const body = new THREE.Mesh(bodyGeo, mat);
            body.position.y = 2;
            group.add(body);

            // 屋顶
            const roofGeo = new THREE.ConeGeometry(2.5, 2, 4);
            const roof = new THREE.Mesh(roofGeo, new THREE.MeshStandardMaterial({
                color: 0x4A3728, transparent: true, opacity: 0.4, fog: true,
                roughness: 0.9, metalness: 0.0
            }));
            roof.rotation.y = Math.PI / 4;
            roof.position.y = 5;
            group.add(roof);

            // 塔尖
            const towerGeo = new THREE.CylinderGeometry(0.3, 0.5, 3, 6);
            const tower = new THREE.Mesh(towerGeo, mat);
            tower.position.set(1.5, 5.5, 0);
            group.add(tower);

            scene.add(group);
        });
    },

    // ===== 4. 地平线云雾带 =====
    createHorizonClouds(scene) {
        this.horizonClouds = [];
        // 6朵低空云带，覆盖地平线，高度15-25单位
        for (let i = 0; i < 8; i++) {
            const cloud = this._createHorizonCloud(scene, i);
            this.horizonClouds.push(cloud);
        }
    },

    _createHorizonCloud(scene, index) {
        const group = new THREE.Group();
        const angle = (index / 8) * Math.PI * 2;
        const r = 35 + Math.random() * 15;
        const x = Math.cos(angle) * r;
        const z = Math.sin(angle) * r;
        const y = 12 + Math.random() * 10;

        group.position.set(x, y, z);
        group.userData = {
            type: 'horizonCloud',
            speed: (Math.random() - 0.5) * 0.3,
            orbitRadius: r,
            orbitAngle: angle,
            orbitSpeed: 0.003 + Math.random() * 0.003,
        };

        // 大型扁平云朵（遮挡天地接缝）
        const cloudMat = new THREE.MeshStandardMaterial({
            color: 0xEEF5FF,
            transparent: true,
            opacity: 0.75,
            fog: true,
            roughness: 1.0, metalness: 0.0
        });
        const sizes = [3.5, 2.8, 2.2, 3.0, 2.5];
        const offsets = [[0,0,0],[3,-0.5,0],[-3,-0.5,0],[1.5,0.8,0],[-1.5,0.8,0]];
        sizes.forEach((s, i) => {
            const geo = new THREE.SphereGeometry(s, 7, 5);
            const mesh = new THREE.Mesh(geo, cloudMat);
            mesh.scale.y = 0.45; // 扁平化
            mesh.position.set(...offsets[i]);
            group.add(mesh);
        });

        scene.add(group);
        return group;
    },

    // ===== 5. 飞鸟群 =====
    createBirds(scene) {
        this.birds = [];
        // 1-2群飞鸟，V字形
        for (let flock = 0; flock < 2; flock++) {
            const flockGroup = new THREE.Group();
            const startAngle = Math.random() * Math.PI * 2;
            const r = 30 + Math.random() * 20;
            flockGroup.position.set(
                Math.cos(startAngle) * r,
                18 + Math.random() * 12,
                Math.sin(startAngle) * r
            );
            flockGroup.userData = {
                type: 'birdFlock',
                orbitAngle: startAngle,
                orbitRadius: r,
                orbitSpeed: 0.008 + Math.random() * 0.005,
                wingPhase: Math.random() * Math.PI * 2,
                height: flockGroup.position.y,
            };

            // V字形排列 7只鸟
            const birdMat = new THREE.MeshStandardMaterial({ color: 0x2C2C2C, roughness: 0.85, metalness: 0.0 });
            const birdPositions = [
                [0, 0, 0],
                [-1.2, -0.3, -1.0], [1.2, -0.3, -1.0],
                [-2.4, -0.6, -2.0], [2.4, -0.6, -2.0],
                [-3.6, -0.9, -3.0], [3.6, -0.9, -3.0],
            ];
            birdPositions.forEach(([bx, by, bz]) => {
                const bird = new THREE.Group();
                bird.position.set(bx, by, bz);

                // 身体
                const bodyGeo = new THREE.SphereGeometry(0.12, 5, 4);
                const body = new THREE.Mesh(bodyGeo, birdMat);
                body.scale.set(0.7, 0.6, 1.5);
                bird.add(body);

                // 翅膀（左右各一片）
                [-1, 1].forEach(side => {
                    const wingGeo = new THREE.SphereGeometry(0.25, 5, 3);
                    const wing = new THREE.Mesh(wingGeo, birdMat);
                    wing.scale.set(1.8, 0.1, 0.8);
                    wing.position.x = side * 0.28;
                    wing.userData.side = side;
                    bird.add(wing);
                });

                flockGroup.add(bird);
            });

            scene.add(flockGroup);
            this.birds.push(flockGroup);
        }
    },

    // ===== 6. 动画更新（在animate循环中调用）=====
    update(scene, deltaTime, time, skyBrightness) {
        // 同步雾色与天空色
        this.updateFogColor(scene, skyBrightness);

        // 地平线云朵轨道运动
        this.horizonClouds.forEach(cloud => {
            const ud = cloud.userData;
            ud.orbitAngle += ud.orbitSpeed * deltaTime * 60;
            cloud.position.x = Math.cos(ud.orbitAngle) * ud.orbitRadius;
            cloud.position.z = Math.sin(ud.orbitAngle) * ud.orbitRadius;
            // 轻微上下浮动
            cloud.position.y = ud.height + Math.sin(time * 0.3 + ud.orbitAngle) * 1.5;
            // 始终面向中心（让扁平面朝上）
            cloud.rotation.y = ud.orbitAngle + Math.PI / 2;
        });

        // 飞鸟群轨道飞行 + 翅膀扇动
        this.birds.forEach(flock => {
            const ud = flock.userData;
            ud.orbitAngle += ud.orbitSpeed * deltaTime * 60;
            flock.position.x = Math.cos(ud.orbitAngle) * ud.orbitRadius;
            flock.position.z = Math.sin(ud.orbitAngle) * ud.orbitRadius;
            flock.position.y = ud.height + Math.sin(time * 0.5 + ud.orbitAngle) * 2;
            // 朝向飞行方向
            flock.rotation.y = -ud.orbitAngle + Math.PI / 2;

            // 翅膀扇动
            ud.wingPhase += deltaTime * 4;
            const wingAngle = Math.sin(ud.wingPhase) * 0.5;
            flock.children.forEach(bird => {
                bird.children.forEach(part => {
                    if (part.userData.side) {
                        part.rotation.z = part.userData.side * wingAngle;
                    }
                });
            });
        });
    },

    // ===== 7. 一键初始化（在scene3d.js的createSky后调用）=====
    init(scene) {
        this.setupFog(scene);
        this.createSunkenTerrain(scene);
        this.createDistantLayers(scene);
        this.createHorizonClouds(scene);
        this.createBirds(scene);
    }
};
