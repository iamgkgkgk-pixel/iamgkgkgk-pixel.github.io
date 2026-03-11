// ===== 3D场景管理 =====

const Scene3D = {
    scene: null,
    camera: null,
    renderer: null,
    
    // 场景对象
    plotMeshes: [],
    cropMeshes: [],
    animalMeshes: [],
    
    // 相机控制
    cameraAngle: 0,
    cameraDistance: 18,
    cameraHeight: 12,
    isDragging: false,
    lastMouseX: 0,
    lastMouseY: 0,
    
    // 光照
    sunLight: null,
    ambientLight: null,
    
    // 粒子系统
    particles: [],
    
    // 初始化
    init() {
        const canvas = document.getElementById('gameCanvas');
        
        // 创建场景
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x87CEEB);
        this.scene.fog = new THREE.Fog(0x87CEEB, 30, 80);
        
        // 创建相机
        this.camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 200);
        this.updateCamera();
        
        // 创建渲染器
        this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        
        // 光照
        this.setupLighting();
        
        // 创建地形
        this.createTerrain();
        
        // 创建农场土地
        this.createPlots();
        
        // 创建装饰物
        this.createDecorations();
        
        // 创建天空
        this.createSky();
        
        // 事件监听
        this.setupEvents();
        
        // 窗口大小变化
        window.addEventListener('resize', () => {
            this.camera.aspect = window.innerWidth / window.innerHeight;
            this.camera.updateProjectionMatrix();
            this.renderer.setSize(window.innerWidth, window.innerHeight);
        });
    },
    
    // 设置光照
    setupLighting() {
        // 环境光
        this.ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
        this.scene.add(this.ambientLight);
        
        // 太阳光
        this.sunLight = new THREE.DirectionalLight(0xfff5e0, 1.2);
        this.sunLight.position.set(20, 30, 20);
        this.sunLight.castShadow = true;
        this.sunLight.shadow.mapSize.width = 2048;
        this.sunLight.shadow.mapSize.height = 2048;
        this.sunLight.shadow.camera.near = 0.5;
        this.sunLight.shadow.camera.far = 100;
        this.sunLight.shadow.camera.left = -30;
        this.sunLight.shadow.camera.right = 30;
        this.sunLight.shadow.camera.top = 30;
        this.sunLight.shadow.camera.bottom = -30;
        this.scene.add(this.sunLight);
        
        // 半球光（天空/地面）
        const hemiLight = new THREE.HemisphereLight(0x87CEEB, 0x4a7c59, 0.4);
        this.scene.add(hemiLight);
    },
    
    // 创建地形
    createTerrain() {
        // 主地面
        const groundGeo = new THREE.PlaneGeometry(60, 60, 20, 20);
        const groundMat = new THREE.MeshLambertMaterial({ color: 0x5a8a3c });
        const ground = new THREE.Mesh(groundGeo, groundMat);
        ground.rotation.x = -Math.PI / 2;
        ground.receiveShadow = true;
        this.scene.add(ground);
        
        // 路径
        const pathGeo = new THREE.PlaneGeometry(2, 20);
        const pathMat = new THREE.MeshLambertMaterial({ color: 0xc4a265 });
        const path = new THREE.Mesh(pathGeo, pathMat);
        path.rotation.x = -Math.PI / 2;
        path.position.set(0, 0.01, 0);
        this.scene.add(path);
        
        // 横向路径
        const pathH = new THREE.Mesh(new THREE.PlaneGeometry(20, 2), pathMat);
        pathH.rotation.x = -Math.PI / 2;
        pathH.position.set(0, 0.01, 0);
        this.scene.add(pathH);
        
        // 围栏
        this.createFence();
    },
    
    // 创建围栏
    createFence() {
        const fenceColor = 0x8B6914;
        const postGeo = new THREE.BoxGeometry(0.2, 1.2, 0.2);
        const postMat = new THREE.MeshLambertMaterial({ color: fenceColor });
        const railGeo = new THREE.BoxGeometry(2.5, 0.15, 0.1);
        const railMat = new THREE.MeshLambertMaterial({ color: fenceColor });
        
        const positions = [];
        for (let i = -12; i <= 12; i += 2.5) {
            positions.push([i, -12], [i, 12], [-12, i], [12, i]);
        }
        
        positions.forEach(([x, z]) => {
            const post = new THREE.Mesh(postGeo, postMat);
            post.position.set(x, 0.6, z);
            post.castShadow = true;
            this.scene.add(post);
        });
        
        // 横向栏杆
        for (let i = -12; i <= 12; i += 2.5) {
            const rail1 = new THREE.Mesh(railGeo, railMat);
            rail1.position.set(i + 1.25, 0.8, -12);
            this.scene.add(rail1);
            const rail2 = new THREE.Mesh(railGeo, railMat);
            rail2.position.set(i + 1.25, 0.4, -12);
            this.scene.add(rail2);
            
            const rail3 = new THREE.Mesh(railGeo, railMat);
            rail3.position.set(i + 1.25, 0.8, 12);
            this.scene.add(rail3);
            const rail4 = new THREE.Mesh(railGeo, railMat);
            rail4.position.set(i + 1.25, 0.4, 12);
            this.scene.add(rail4);
        }
        
        // 纵向栏杆
        const railV = new THREE.BoxGeometry(0.1, 0.15, 2.5);
        for (let i = -12; i <= 12; i += 2.5) {
            const rail1 = new THREE.Mesh(railV, railMat);
            rail1.position.set(-12, 0.8, i + 1.25);
            this.scene.add(rail1);
            const rail2 = new THREE.Mesh(railV, railMat);
            rail2.position.set(-12, 0.4, i + 1.25);
            this.scene.add(rail2);
            
            const rail3 = new THREE.Mesh(railV, railMat);
            rail3.position.set(12, 0.8, i + 1.25);
            this.scene.add(rail3);
            const rail4 = new THREE.Mesh(railV, railMat);
            rail4.position.set(12, 0.4, i + 1.25);
            this.scene.add(rail4);
        }
    },
    
    // 创建农场土地（3x3布局）
    createPlots() {
        const plotPositions = [
            [-5, -5], [0, -5], [5, -5],
            [-5, 0],  [0, 0],  [5, 0],
            [-5, 5],  [0, 5],  [5, 5]
        ];
        
        plotPositions.forEach((pos, i) => {
            const group = new THREE.Group();
            group.position.set(pos[0], 0, pos[1]);
            group.userData = { plotId: i, type: 'plot' };
            
            // 土地底座
            const soilGeo = new THREE.BoxGeometry(3.5, 0.3, 3.5);
            const soilMat = new THREE.MeshLambertMaterial({ color: 0x8B4513 });
            const soil = new THREE.Mesh(soilGeo, soilMat);
            soil.position.y = 0.15;
            soil.receiveShadow = true;
            soil.castShadow = true;
            group.add(soil);
            
            // 土地边框
            const borderGeo = new THREE.BoxGeometry(3.8, 0.1, 3.8);
            const borderMat = new THREE.MeshLambertMaterial({ color: 0x5C3317 });
            const border = new THREE.Mesh(borderGeo, borderMat);
            border.position.y = 0.05;
            group.add(border);
            
            // 土地编号标记（小石头）
            const stoneGeo = new THREE.SphereGeometry(0.1, 6, 6);
            const stoneMat = new THREE.MeshLambertMaterial({ color: 0x888888 });
            const stone = new THREE.Mesh(stoneGeo, stoneMat);
            stone.position.set(1.5, 0.35, 1.5);
            group.add(stone);
            
            this.scene.add(group);
            this.plotMeshes.push(group);
            this.cropMeshes.push(null);
        });
    },
    
    // 创建装饰物
    createDecorations() {
        // 谷仓
        this.createBarn(-9, -9);
        
        // 风车
        this.createWindmill(9, -9);
        
        // 树木
        const treePositions = [[-10, 5], [-10, -2], [10, 5], [10, -2], [-7, 10], [7, 10], [-7, -10], [7, -10]];
        treePositions.forEach(([x, z]) => this.createTree(x, z));
        
        // 水井
        this.createWell(9, 9);
        
        // 花朵装饰
        for (let i = 0; i < 20; i++) {
            const x = (Math.random() - 0.5) * 20 + (Math.random() > 0.5 ? 10 : -10);
            const z = (Math.random() - 0.5) * 20;
            this.createFlower(x, z);
        }
    },
    
    // 创建谷仓
    createBarn(x, z) {
        const group = new THREE.Group();
        group.position.set(x, 0, z);
        
        // 主体
        const bodyGeo = new THREE.BoxGeometry(3, 2.5, 3);
        const bodyMat = new THREE.MeshLambertMaterial({ color: 0xcc3333 });
        const body = new THREE.Mesh(bodyGeo, bodyMat);
        body.position.y = 1.25;
        body.castShadow = true;
        group.add(body);
        
        // 屋顶
        const roofGeo = new THREE.ConeGeometry(2.5, 1.5, 4);
        const roofMat = new THREE.MeshLambertMaterial({ color: 0x8B0000 });
        const roof = new THREE.Mesh(roofGeo, roofMat);
        roof.position.y = 3.25;
        roof.rotation.y = Math.PI / 4;
        roof.castShadow = true;
        group.add(roof);
        
        // 门
        const doorGeo = new THREE.BoxGeometry(0.8, 1.5, 0.1);
        const doorMat = new THREE.MeshLambertMaterial({ color: 0x5C3317 });
        const door = new THREE.Mesh(doorGeo, doorMat);
        door.position.set(0, 0.75, 1.55);
        group.add(door);
        
        this.scene.add(group);
    },
    
    // 创建风车
    createWindmill(x, z) {
        const group = new THREE.Group();
        group.position.set(x, 0, z);
        group.userData = { type: 'windmill' };
        
        // 塔身
        const towerGeo = new THREE.CylinderGeometry(0.3, 0.5, 4, 8);
        const towerMat = new THREE.MeshLambertMaterial({ color: 0xdddddd });
        const tower = new THREE.Mesh(towerGeo, towerMat);
        tower.position.y = 2;
        tower.castShadow = true;
        group.add(tower);
        
        // 风叶
        const bladeGroup = new THREE.Group();
        bladeGroup.position.y = 4;
        bladeGroup.userData = { isWindmill: true };
        
        for (let i = 0; i < 4; i++) {
            const bladeGeo = new THREE.BoxGeometry(0.2, 2, 0.05);
            const bladeMat = new THREE.MeshLambertMaterial({ color: 0xffffff });
            const blade = new THREE.Mesh(bladeGeo, bladeMat);
            blade.position.y = 1;
            blade.rotation.z = (i * Math.PI) / 2;
            bladeGroup.add(blade);
        }
        
        group.add(bladeGroup);
        this.scene.add(group);
        this.windmillBlades = bladeGroup;
    },
    
    // 创建树
    createTree(x, z) {
        const group = new THREE.Group();
        group.position.set(x, 0, z);
        
        // 树干
        const trunkGeo = new THREE.CylinderGeometry(0.2, 0.3, 1.5, 8);
        const trunkMat = new THREE.MeshLambertMaterial({ color: 0x5C3317 });
        const trunk = new THREE.Mesh(trunkGeo, trunkMat);
        trunk.position.y = 0.75;
        trunk.castShadow = true;
        group.add(trunk);
        
        // 树冠（多层）
        const colors = [0x2d8a2d, 0x3aaa3a, 0x4ccc4c];
        [2.5, 2, 1.5].forEach((size, i) => {
            const leafGeo = new THREE.ConeGeometry(size * 0.6, size * 0.8, 8);
            const leafMat = new THREE.MeshLambertMaterial({ color: colors[i] });
            const leaf = new THREE.Mesh(leafGeo, leafMat);
            leaf.position.y = 1.5 + i * 0.8;
            leaf.castShadow = true;
            group.add(leaf);
        });
        
        this.scene.add(group);
    },
    
    // 创建水井
    createWell(x, z) {
        const group = new THREE.Group();
        group.position.set(x, 0, z);
        
        // 井身
        const wellGeo = new THREE.CylinderGeometry(0.6, 0.6, 0.8, 12);
        const wellMat = new THREE.MeshLambertMaterial({ color: 0x888888 });
        const well = new THREE.Mesh(wellGeo, wellMat);
        well.position.y = 0.4;
        well.castShadow = true;
        group.add(well);
        
        // 井架
        const postGeo = new THREE.BoxGeometry(0.1, 1.5, 0.1);
        const postMat = new THREE.MeshLambertMaterial({ color: 0x5C3317 });
        [-0.5, 0.5].forEach(x => {
            const post = new THREE.Mesh(postGeo, postMat);
            post.position.set(x, 1.15, 0);
            group.add(post);
        });
        
        const topGeo = new THREE.BoxGeometry(1.2, 0.1, 0.1);
        const top = new THREE.Mesh(topGeo, postMat);
        top.position.y = 1.9;
        group.add(top);
        
        this.scene.add(group);
    },
    
    // 创建花朵
    createFlower(x, z) {
        const group = new THREE.Group();
        group.position.set(x, 0, z);
        
        const stemGeo = new THREE.CylinderGeometry(0.03, 0.03, 0.4, 6);
        const stemMat = new THREE.MeshLambertMaterial({ color: 0x44aa44 });
        const stem = new THREE.Mesh(stemGeo, stemMat);
        stem.position.y = 0.2;
        group.add(stem);
        
        const colors = [0xff6688, 0xffaa00, 0xff4444, 0xaa44ff, 0xffff44];
        const flowerGeo = new THREE.SphereGeometry(0.12, 8, 8);
        const flowerMat = new THREE.MeshLambertMaterial({ color: colors[Math.floor(Math.random() * colors.length)] });
        const flower = new THREE.Mesh(flowerGeo, flowerMat);
        flower.position.y = 0.45;
        group.add(flower);
        
        this.scene.add(group);
    },
    
    // 创建天空
    createSky() {
        // 云朵
        for (let i = 0; i < 8; i++) {
            this.createCloud(
                (Math.random() - 0.5) * 60,
                15 + Math.random() * 10,
                (Math.random() - 0.5) * 60
            );
        }
    },
    
    // 创建云朵
    createCloud(x, y, z) {
        const group = new THREE.Group();
        group.position.set(x, y, z);
        group.userData = { type: 'cloud', speed: 0.5 + Math.random() * 0.5 };
        
        const cloudMat = new THREE.MeshLambertMaterial({ color: 0xffffff, transparent: true, opacity: 0.9 });
        const sizes = [1.5, 1, 1.2, 0.8];
        const offsets = [[0, 0, 0], [1.2, -0.3, 0], [-1.2, -0.3, 0], [0.6, 0.3, 0]];
        
        sizes.forEach((size, i) => {
            const geo = new THREE.SphereGeometry(size, 8, 8);
            const mesh = new THREE.Mesh(geo, cloudMat);
            mesh.position.set(...offsets[i]);
            group.add(mesh);
        });
        
        this.scene.add(group);
        this.clouds = this.clouds || [];
        this.clouds.push(group);
    },
    
    // 更新相机
    updateCamera() {
        const x = Math.sin(this.cameraAngle) * this.cameraDistance;
        const z = Math.cos(this.cameraAngle) * this.cameraDistance;
        this.camera.position.set(x, this.cameraHeight, z);
        this.camera.lookAt(0, 0, 0);
    },
    
    // 更新土地显示
    updatePlot(plot) {
        const group = this.plotMeshes[plot.id];
        if (!group) return;
        
        // 移除旧的作物模型
        if (this.cropMeshes[plot.id]) {
            group.remove(this.cropMeshes[plot.id]);
            this.cropMeshes[plot.id] = null;
        }
        
        // 更新土地颜色
        const soil = group.children[0];
        if (plot.quality === 'fertile') {
            soil.material.color.setHex(0x6B3A2A);
        } else if (plot.quality === 'magic') {
            soil.material.color.setHex(0x4a2a6B);
        } else {
            soil.material.color.setHex(0x8B4513);
        }
        
        if (plot.state === 'empty') return;
        
        const crop = CROPS_DATA[plot.crop];
        if (!crop) return;
        
        // 创建作物模型
        const cropGroup = new THREE.Group();
        const progress = plot.growProgress;
        
        if (plot.state === 'ready') {
            // 成熟状态 - 完整作物
            this.createMatureCrop(cropGroup, crop, plot);
        } else {
            // 生长中
            const scale = 0.3 + progress * 0.7;
            this.createGrowingCrop(cropGroup, crop, scale, plot);
        }
        
        cropGroup.position.y = 0.3;
        group.add(cropGroup);
        this.cropMeshes[plot.id] = cropGroup;
    },
    
    // 创建生长中的作物
    createGrowingCrop(group, crop, scale, plot) {
        // 茎
        const stemGeo = new THREE.CylinderGeometry(0.05 * scale, 0.08 * scale, 0.8 * scale, 6);
        const stemMat = new THREE.MeshLambertMaterial({ color: 0x44aa44 });
        const stem = new THREE.Mesh(stemGeo, stemMat);
        stem.position.y = 0.4 * scale;
        stem.castShadow = true;
        group.add(stem);
        
        // 叶子
        const leafGeo = new THREE.SphereGeometry(0.3 * scale, 8, 8);
        const leafMat = new THREE.MeshLambertMaterial({ color: crop.color });
        const leaf = new THREE.Mesh(leafGeo, leafMat);
        leaf.position.y = 0.8 * scale;
        leaf.scale.y = 0.6;
        leaf.castShadow = true;
        group.add(leaf);
        
        // 浇水效果
        if (plot.watered) {
            const waterGeo = new THREE.SphereGeometry(0.05, 6, 6);
            const waterMat = new THREE.MeshLambertMaterial({ color: 0x4488ff, transparent: true, opacity: 0.7 });
            for (let i = 0; i < 3; i++) {
                const drop = new THREE.Mesh(waterGeo, waterMat);
                drop.position.set((Math.random() - 0.5) * 0.5, 0.1 + Math.random() * 0.3, (Math.random() - 0.5) * 0.5);
                group.add(drop);
            }
        }
    },
    
    // 创建成熟作物
    createMatureCrop(group, crop, plot) {
        // 茎
        const stemGeo = new THREE.CylinderGeometry(0.06, 0.1, 1.2, 6);
        const stemMat = new THREE.MeshLambertMaterial({ color: 0x44aa44 });
        const stem = new THREE.Mesh(stemGeo, stemMat);
        stem.position.y = 0.6;
        stem.castShadow = true;
        group.add(stem);
        
        // 果实/花朵
        const fruitGeo = new THREE.SphereGeometry(0.4, 10, 10);
        const fruitMat = new THREE.MeshLambertMaterial({ color: crop.color });
        const fruit = new THREE.Mesh(fruitGeo, fruitMat);
        fruit.position.y = 1.3;
        fruit.castShadow = true;
        group.add(fruit);
        
        // 叶子
        for (let i = 0; i < 4; i++) {
            const leafGeo = new THREE.SphereGeometry(0.25, 6, 6);
            const leafMat = new THREE.MeshLambertMaterial({ color: 0x33aa33 });
            const leaf = new THREE.Mesh(leafGeo, leafMat);
            const angle = (i / 4) * Math.PI * 2;
            leaf.position.set(Math.cos(angle) * 0.4, 0.8, Math.sin(angle) * 0.4);
            leaf.scale.y = 0.4;
            group.add(leaf);
        }
        
        // 完美品质光效
        if (plot.cropQuality === 'perfect') {
            const glowGeo = new THREE.SphereGeometry(0.6, 8, 8);
            const glowMat = new THREE.MeshLambertMaterial({ color: 0xffd700, transparent: true, opacity: 0.3 });
            const glow = new THREE.Mesh(glowGeo, glowMat);
            glow.position.y = 1.3;
            group.add(glow);
        }
        
        // 成熟跳动动画标记
        group.userData = { bouncing: true, bounceTime: Math.random() * Math.PI * 2 };
    },
    
    // 添加动物到场景
    addAnimalMesh(animal) {
        const animalData = ANIMALS_DATA[animal.type];
        if (!animalData) return;
        
        const group = new THREE.Group();
        const angle = (this.animalMeshes.length / 8) * Math.PI * 2;
        const radius = 8;
        group.position.set(Math.cos(angle) * radius, 0, Math.sin(angle) * radius);
        group.userData = { animalId: animal.id, type: 'animal' };
        
        // 动物身体
        const bodyGeo = new THREE.BoxGeometry(0.8, 0.6, 1.2);
        const bodyMat = new THREE.MeshLambertMaterial({ color: animalData.color });
        const body = new THREE.Mesh(bodyGeo, bodyMat);
        body.position.y = 0.5;
        body.castShadow = true;
        group.add(body);
        
        // 头部
        const headGeo = new THREE.BoxGeometry(0.6, 0.6, 0.6);
        const head = new THREE.Mesh(headGeo, bodyMat);
        head.position.set(0, 0.9, 0.5);
        head.castShadow = true;
        group.add(head);
        
        // 腿
        const legGeo = new THREE.BoxGeometry(0.15, 0.4, 0.15);
        const legMat = new THREE.MeshLambertMaterial({ color: new THREE.Color(animalData.color).multiplyScalar(0.8) });
        [[-0.25, -0.4], [0.25, -0.4], [-0.25, 0.4], [0.25, 0.4]].forEach(([lx, lz]) => {
            const leg = new THREE.Mesh(legGeo, legMat);
            leg.position.set(lx, 0.2, lz);
            group.add(leg);
        });
        
        // 眼睛
        const eyeGeo = new THREE.SphereGeometry(0.06, 6, 6);
        const eyeMat = new THREE.MeshLambertMaterial({ color: 0x000000 });
        [-0.15, 0.15].forEach(ex => {
            const eye = new THREE.Mesh(eyeGeo, eyeMat);
            eye.position.set(ex, 1.0, 0.8);
            group.add(eye);
        });
        
        // 产出标记
        if (animal.hasProduct) {
            const markerGeo = new THREE.SphereGeometry(0.2, 8, 8);
            const markerMat = new THREE.MeshLambertMaterial({ color: 0xffd700 });
            const marker = new THREE.Mesh(markerGeo, markerMat);
            marker.position.y = 1.8;
            marker.userData = { isProductMarker: true };
            group.add(marker);
        }
        
        group.userData.walkAngle = Math.random() * Math.PI * 2;
        group.userData.walkSpeed = 0.3 + Math.random() * 0.3;
        
        this.scene.add(group);
        this.animalMeshes.push(group);
        return group;
    },
    
    // 移除动物
    removeAnimalMesh(animalId) {
        const idx = this.animalMeshes.findIndex(m => m.userData.animalId === animalId);
        if (idx !== -1) {
            this.scene.remove(this.animalMeshes[idx]);
            this.animalMeshes.splice(idx, 1);
        }
    },
    
    // 更新动物产出标记
    updateAnimalProductMarker(animalId, hasProduct) {
        const mesh = this.animalMeshes.find(m => m.userData.animalId === animalId);
        if (!mesh) return;
        
        const existing = mesh.children.find(c => c.userData.isProductMarker);
        if (hasProduct && !existing) {
            const markerGeo = new THREE.SphereGeometry(0.2, 8, 8);
            const markerMat = new THREE.MeshLambertMaterial({ color: 0xffd700 });
            const marker = new THREE.Mesh(markerGeo, markerMat);
            marker.position.y = 1.8;
            marker.userData = { isProductMarker: true };
            mesh.add(marker);
        } else if (!hasProduct && existing) {
            mesh.remove(existing);
        }
    },
    
    // 创建收获粒子特效
    createHarvestEffect(plotId, color) {
        const plot = this.plotMeshes[plotId];
        if (!plot) return;
        
        for (let i = 0; i < 15; i++) {
            const geo = new THREE.SphereGeometry(0.08, 6, 6);
            const mat = new THREE.MeshLambertMaterial({ color: color || 0xffd700 });
            const particle = new THREE.Mesh(geo, mat);
            particle.position.copy(plot.position);
            particle.position.y = 1;
            particle.userData = {
                velocity: new THREE.Vector3(
                    (Math.random() - 0.5) * 3,
                    2 + Math.random() * 3,
                    (Math.random() - 0.5) * 3
                ),
                life: 1.0,
                type: 'particle'
            };
            this.scene.add(particle);
            this.particles.push(particle);
        }
    },
    
    // 创建浇水特效
    createWaterEffect(plotId) {
        const plot = this.plotMeshes[plotId];
        if (!plot) return;
        
        for (let i = 0; i < 8; i++) {
            const geo = new THREE.SphereGeometry(0.06, 6, 6);
            const mat = new THREE.MeshLambertMaterial({ color: 0x4488ff, transparent: true, opacity: 0.8 });
            const drop = new THREE.Mesh(geo, mat);
            drop.position.copy(plot.position);
            drop.position.y = 2;
            drop.position.x += (Math.random() - 0.5) * 2;
            drop.position.z += (Math.random() - 0.5) * 2;
            drop.userData = {
                velocity: new THREE.Vector3(0, -2, 0),
                life: 0.8,
                type: 'particle'
            };
            this.scene.add(drop);
            this.particles.push(drop);
        }
    },
    
    // 设置事件
    setupEvents() {
        const canvas = document.getElementById('gameCanvas');
        
        // 鼠标点击
        canvas.addEventListener('click', (e) => {
            if (this.isDragging) return;
            this.handleClick(e);
        });
        
        // 鼠标拖拽（旋转相机）
        canvas.addEventListener('mousedown', (e) => {
            this.isDragging = false;
            this.lastMouseX = e.clientX;
            this.lastMouseY = e.clientY;
            this._mouseDown = true;
        });
        
        canvas.addEventListener('mousemove', (e) => {
            if (!this._mouseDown) return;
            const dx = e.clientX - this.lastMouseX;
            const dy = e.clientY - this.lastMouseY;
            if (Math.abs(dx) > 3 || Math.abs(dy) > 3) this.isDragging = true;
            
            if (this.isDragging) {
                this.cameraAngle -= dx * 0.01;
                this.cameraHeight = Math.max(5, Math.min(25, this.cameraHeight - dy * 0.05));
                this.updateCamera();
            }
            this.lastMouseX = e.clientX;
            this.lastMouseY = e.clientY;
        });
        
        canvas.addEventListener('mouseup', () => { this._mouseDown = false; });
        
        // 滚轮缩放
        canvas.addEventListener('wheel', (e) => {
            this.cameraDistance = Math.max(8, Math.min(30, this.cameraDistance + e.deltaY * 0.02));
            this.updateCamera();
        });
        
        // 触摸支持
        let lastTouchX = 0, lastTouchY = 0, touchStartX = 0, touchStartY = 0;
        canvas.addEventListener('touchstart', (e) => {
            touchStartX = lastTouchX = e.touches[0].clientX;
            touchStartY = lastTouchY = e.touches[0].clientY;
            this.isDragging = false;
        });
        canvas.addEventListener('touchmove', (e) => {
            e.preventDefault();
            const dx = e.touches[0].clientX - lastTouchX;
            const dy = e.touches[0].clientY - lastTouchY;
            if (Math.abs(e.touches[0].clientX - touchStartX) > 5) this.isDragging = true;
            this.cameraAngle -= dx * 0.01;
            this.cameraHeight = Math.max(5, Math.min(25, this.cameraHeight - dy * 0.05));
            this.updateCamera();
            lastTouchX = e.touches[0].clientX;
            lastTouchY = e.touches[0].clientY;
        }, { passive: false });
        canvas.addEventListener('touchend', (e) => {
            if (!this.isDragging) {
                const touch = e.changedTouches[0];
                this.handleClick({ clientX: touch.clientX, clientY: touch.clientY });
            }
        });
    },
    
    // 处理点击
    handleClick(e) {
        const raycaster = new THREE.Raycaster();
        const mouse = new THREE.Vector2(
            (e.clientX / window.innerWidth) * 2 - 1,
            -(e.clientY / window.innerHeight) * 2 + 1
        );
        raycaster.setFromCamera(mouse, this.camera);
        
        // 检测土地点击
        const plotObjects = this.plotMeshes.map(g => g.children[0]);
        const plotIntersects = raycaster.intersectObjects(plotObjects);
        if (plotIntersects.length > 0) {
            const plotGroup = plotIntersects[0].object.parent;
            const plotId = plotGroup.userData.plotId;
            onPlotClick(plotId, e.clientX, e.clientY);
            return;
        }
        
        // 检测动物点击
        const animalObjects = this.animalMeshes.map(g => g.children[0]);
        const animalIntersects = raycaster.intersectObjects(animalObjects);
        if (animalIntersects.length > 0) {
            const animalGroup = animalIntersects[0].object.parent;
            const animalId = animalGroup.userData.animalId;
            onAnimalClick(animalId, e.clientX, e.clientY);
            return;
        }
        
        // 关闭菜单
        hideAllMenus();
    },
    
    // 高亮土地
    highlightPlot(plotId, highlight) {
        const group = this.plotMeshes[plotId];
        if (!group) return;
        const soil = group.children[0];
        if (highlight) {
            soil.material.emissive = new THREE.Color(0x224422);
        } else {
            soil.material.emissive = new THREE.Color(0x000000);
        }
    },
    
    // 更新场景
    update(deltaTime) {
        const time = Date.now() * 0.001;
        
        // 风车旋转
        if (this.windmillBlades) {
            this.windmillBlades.rotation.z += deltaTime * 1.5;
        }
        
        // 云朵移动
        if (this.clouds) {
            this.clouds.forEach(cloud => {
                cloud.position.x += cloud.userData.speed * deltaTime;
                if (cloud.position.x > 40) cloud.position.x = -40;
            });
        }
        
        // 作物跳动动画
        this.cropMeshes.forEach((mesh, i) => {
            if (mesh && mesh.userData.bouncing) {
                mesh.userData.bounceTime += deltaTime * 2;
                mesh.position.y = 0.3 + Math.sin(mesh.userData.bounceTime) * 0.05;
            }
        });
        
        // 动物移动
        this.animalMeshes.forEach(mesh => {
            if (mesh.userData.walkAngle !== undefined) {
                mesh.userData.walkAngle += deltaTime * mesh.userData.walkSpeed;
                const radius = 7 + Math.sin(mesh.userData.walkAngle * 0.3) * 1;
                const baseAngle = (this.animalMeshes.indexOf(mesh) / this.animalMeshes.length) * Math.PI * 2;
                mesh.position.x = Math.cos(baseAngle + mesh.userData.walkAngle * 0.1) * radius;
                mesh.position.z = Math.sin(baseAngle + mesh.userData.walkAngle * 0.1) * radius;
                mesh.rotation.y = -baseAngle - mesh.userData.walkAngle * 0.1 + Math.PI / 2;
                
                // 腿部摆动
                const legSwing = Math.sin(mesh.userData.walkAngle * 4) * 0.3;
                if (mesh.children[3]) mesh.children[3].rotation.x = legSwing;
                if (mesh.children[4]) mesh.children[4].rotation.x = -legSwing;
                if (mesh.children[5]) mesh.children[5].rotation.x = -legSwing;
                if (mesh.children[6]) mesh.children[6].rotation.x = legSwing;
            }
        });
        
        // 粒子更新
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const p = this.particles[i];
            p.userData.life -= deltaTime * 1.5;
            p.position.add(p.userData.velocity.clone().multiplyScalar(deltaTime));
            p.userData.velocity.y -= 5 * deltaTime;
            p.material.opacity = p.userData.life;
            p.material.transparent = true;
            if (p.userData.life <= 0) {
                this.scene.remove(p);
                this.particles.splice(i, 1);
            }
        }
        
        // 太阳光角度（昼夜变化）
        const sunAngle = time * 0.05;
        this.sunLight.position.set(
            Math.cos(sunAngle) * 30,
            Math.abs(Math.sin(sunAngle)) * 30 + 5,
            Math.sin(sunAngle) * 20
        );
        
        // 天空颜色变化
        const skyBrightness = Math.max(0.3, Math.abs(Math.sin(sunAngle)));
        this.scene.background = new THREE.Color(
            0.53 * skyBrightness,
            0.81 * skyBrightness,
            0.98 * skyBrightness
        );
        this.ambientLight.intensity = 0.3 + skyBrightness * 0.5;
    },
    
    // 渲染
    render() {
        this.renderer.render(this.scene, this.camera);
    }
};
