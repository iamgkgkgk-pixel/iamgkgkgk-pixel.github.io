// ===== 3D场景管理 =====

// ===== 统一调色板系统 =====
const PALETTE = {
    // 暖色田园调色板 - 高饱和、高对比、鲜活明亮
    sky:       0x55B0E8,   // 清澈天蓝（高饱和）
    skyWarm:   0xE0A870,   // 暖橙天空（黄昏用）
    
    // 草地/自然（鲜绿高饱和）
    grassBase: 0x3CA030,   // 翠绿草地基础色
    grassDark: 0x287018,   // 深翠绿
    grassLight:0x7CC040,   // 明亮草色
    grassDry:  0xC0A050,   // 枯黄色
    
    // 土壤（深暖棕，与绿色形成对比）
    soilBase:  0x8A5838,   // 深暖棕土
    soilDark:  0x604020,   // 深色湿润土
    soilLight: 0xA87850,   // 浅色干土
    soilWet:   0x402818,   // 浇水后深色
    
    // 木材（暖红棕）
    woodDark:  0x603818,   // 深木色
    woodBase:  0x7A4C28,   // 基础木色
    woodLight: 0x9A7448,   // 浅木色
    woodRed:   0x8A4510,   // 红棕木
    
    // 建筑（高饱和对比色）
    barnRed:   0xD04028,   // 谷仓红（鲜明高饱和）
    barnRedDark:0x982818,  // 谷仓深红
    roofBrown: 0x5A3018,   // 深屋顶棕
    roofTile:  0x8A5830,   // 瓦片色
    stoneGray: 0x908878,   // 暖灰石色
    stoneDark: 0x605850,   // 深石色
    
    // 风车（亮白对比）
    millWhite: 0xF5F0E0,   // 风车白
    millMetal: 0x787068,   // 氧化铁色
    millBlade: 0xE8E0D0,   // 风叶色
    
    // 金属
    metalRust: 0x907040,   // 锈铁色
    metalDark: 0x484848,   // 深铁色
    
    // 围栏
    fenceBase: 0x6A4820,   // 围栏基础色
    fenceDark: 0x483010,   // 围栏深色
    fenceLight:0x8A6838,   // 围栏浅色
    
    // 水体（清澈蓝绿）
    waterSurface: 0x40B8A8, // 水面色（鲜明蓝绿）
    waterDeep:    0x206868, // 深水色
    
    // 叶色（翠绿高饱和）
    leafDark:  0x1A7020,   // 深叶绿
    leafBase:  0x2A9030,   // 基础叶绿
    leafLight: 0x48B848,   // 浅叶绿
    leafYellow:0x88B028,   // 黄绿叶
    
    // 花色（鲜艳明快）
    flowerPink:  0xF07878, // 鲜粉红
    flowerYellow:0xF0B820, // 明黄
    flowerPurple:0xA068C0, // 鲜紫
    flowerWhite: 0xF8F0E0, // 米白花
    
    // 海洋/沙滩/热带
    oceanDeep:   0x0A5E7A,   // 深海色
    oceanMid:    0x1A8CAA,   // 中海色
    oceanShallow:0x40C8D0,   // 浅海色（近岸）
    oceanFoam:   0xE8F8FF,   // 浪花白
    sandLight:   0xF0DCA0,   // 浅沙色
    sandDark:    0xD4B878,   // 深沙色
    sandWet:     0xC0A060,   // 湿沙色
    cocoTrunk:   0x8A6030,   // 椰子树干色
    cocoLeaf:    0x30A028,   // 椰子叶色
    cocoFruit:   0x60A030,   // 椰子果色
    coral:       0xE08870,   // 珊瑚色
    shellPink:   0xF0C8B8,   // 贝壳粉
    driftwood:   0x9A8060,   // 漂流木色
    
    // 特殊
    gold:      0xF0B820,   // 金色
    highlight: 0xFFF088,   // 高亮暖黄
};

// ===== 材质工厂（统一管理所有材质创建） =====
const MatFactory = {
    _cache: {},
    
    // 木质材质（中高粗糙度，纹理感强）
    wood(color = PALETTE.woodBase) {
        return new THREE.MeshStandardMaterial({ 
            color, roughness: 0.75, metalness: 0.0 
        });
    },
    
    // 石材材质
    stone(color = PALETTE.stoneGray) {
        return new THREE.MeshStandardMaterial({ 
            color, roughness: 0.85, metalness: 0.02 
        });
    },
    
    // 金属材质（低粗糙度）
    metal(color = PALETTE.millMetal) {
        return new THREE.MeshStandardMaterial({ 
            color, roughness: 0.3, metalness: 0.65 
        });
    },
    
    // 锈铁材质
    rustMetal(color = PALETTE.metalRust) {
        return new THREE.MeshStandardMaterial({ 
            color, roughness: 0.65, metalness: 0.4 
        });
    },
    
    // 土壤材质（高粗糙度）
    soil(color = PALETTE.soilBase) {
        return new THREE.MeshStandardMaterial({ 
            color, roughness: 0.9, metalness: 0.0 
        });
    },
    
    // 叶/草材质（中粗糙度，让颜色更鲜活）
    foliage(color = PALETTE.leafBase) {
        return new THREE.MeshStandardMaterial({ 
            color, roughness: 0.65, metalness: 0.0
        });
    },
    
    // 卡通动物材质（低粗糙度=丝滑光泽，色彩鲜明）
    toon(color) {
        return new THREE.MeshStandardMaterial({ 
            color, roughness: 0.4, metalness: 0.0 
        });
    },
    
    // 建筑墙体材质
    wall(color = PALETTE.barnRed) {
        return new THREE.MeshStandardMaterial({ 
            color, roughness: 0.7, metalness: 0.02 
        });
    },
    
    // 屋顶瓦片材质
    roof(color = PALETTE.roofTile) {
        return new THREE.MeshStandardMaterial({ 
            color, roughness: 0.65, metalness: 0.05 
        });
    },
    
    // 玻璃材质（改用Standard，省去Physical的clearcoat开销）
    glass(color = 0x88CCEE, opacity = 0.4) {
        return new THREE.MeshStandardMaterial({ 
            color, transparent: true, opacity,
            roughness: 0.05, metalness: 0.15
        });
    },
    
    // 发光材质
    emissive(color, intensity = 0.8) {
        return new THREE.MeshStandardMaterial({ 
            color, emissive: color, emissiveIntensity: intensity,
            roughness: 0.5, metalness: 0.0
        });
    },
};

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
    nightLights: [],  // 夜间点光源
    
    // 粒子系统
    particles: [],
    
    // 初始化
    init() {
        const canvas = document.getElementById('gameCanvas');
        
        // 创建场景
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(PALETTE.sky);
        this.scene.fog = new THREE.Fog(PALETTE.sky, 50, 120);
        
        // 创建相机
        this.camera = new THREE.PerspectiveCamera(55, window.innerWidth / window.innerHeight, 0.1, 200);
        this.updateCamera();
        
        // 创建渲染器 - 性能优化配置
        this.renderer = new THREE.WebGLRenderer({ canvas, antialias: false, alpha: false, powerPreference: 'low-power' });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.BasicShadowMap; // 硬阴影：GPU开销最低，视觉风格化
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5)); // 限制1.5x，大幅降低填充率
        // AgX色调映射：色彩饱和度更高，高光不洗白，对比度强
        this.renderer.toneMapping = THREE.AgXToneMapping;
        this.renderer.toneMappingExposure = 0.9;
        this.renderer.outputColorSpace = THREE.SRGBColorSpace;
        // 扩大远裁面，确保远景层可见
        this.camera.far = 300;
        this.camera.updateProjectionMatrix();

        
        // 光照
        this.setupLighting();
        
        // 创建地形
        this.createTerrain();
        
        // 创建农场土地
        this.createPlots();
        
        // 创建装饰物
        this.createDecorations();
        
        // 创建池塘
        if (typeof PondSystem !== 'undefined') {
            PondSystem.init(this.scene);
        }

        // 初始化扭蛋机
        if (typeof GachaSystem !== 'undefined') {
            GachaSystem.init(this.scene);
        }


        // 初始化天气视觉系统
        if (typeof WeatherSystem !== 'undefined') {
            WeatherSystem.init(this.scene);
        }

        
        // 创建天空
        this.createSky();

        
        // 天地融合：远景层、地平线云雾、飞鸟
        if (typeof SceneHorizon !== 'undefined') {
            SceneHorizon.init(this.scene);
        }
        
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
        // 环境光 - 柔和暖白，保证暗部不死黑
        this.ambientLight = new THREE.AmbientLight(0xFFF0E0, 0.35);
        this.scene.add(this.ambientLight);
        
        // 太阳光 - 暖白直射光，强度控制在合理范围
        this.sunLight = new THREE.DirectionalLight(0xFFF4E0, 1.0);
        this.sunLight.position.set(20, 30, 20);
        this.sunLight.castShadow = true;
        // 阴影贴图降至1024：视觉差异极小，GPU负载降4倍
        this.sunLight.shadow.mapSize.width = 1024;
        this.sunLight.shadow.mapSize.height = 1024;
        this.sunLight.shadow.camera.near = 0.5;
        this.sunLight.shadow.camera.far = 60;
        this.sunLight.shadow.camera.left = -18;
        this.sunLight.shadow.camera.right = 18;
        this.sunLight.shadow.camera.top = 18;
        this.sunLight.shadow.camera.bottom = -18;
        this.sunLight.shadow.bias = -0.002;
        this.sunLight.shadow.normalBias = 0.04;
        this.scene.add(this.sunLight);
        
        // 半球光（天蓝/草绿）- 让受光面偏蓝、背光面偏绿，增强色彩丰富度
        const hemiLight = new THREE.HemisphereLight(0x80C0E8, 0x40A030, 0.35);
        this.scene.add(hemiLight);
        
        // 补光 - 偏暖黄，填充暗部同时增加暖感
        const fillLight = new THREE.DirectionalLight(0xFFE8C0, 0.15);
        fillLight.position.set(-15, 10, -15);
        this.scene.add(fillLight);
        
        // 夜间点光源系统
        this.nightLights = [];
        this._createNightLights();
    },
    
    // 创建夜间点光源
    _createNightLights() {
        // 谷仓窗户暖光
        const barnLight = new THREE.PointLight(0xFFA040, 0, 6, 2);
        barnLight.position.set(-9, 1.5, -7.5);
        this.scene.add(barnLight);
        this.nightLights.push({ light: barnLight, maxIntensity: 0.8, type: 'window' });
        
        // 谷仓门口灯笼
        const lantern1 = new THREE.PointLight(0xFFAA30, 0, 5, 2);
        lantern1.position.set(-9, 2.8, -7);
        this.scene.add(lantern1);
        this.nightLights.push({ light: lantern1, maxIntensity: 0.6, type: 'lantern' });
        
        // 风车顶部信号灯
        const millLight = new THREE.PointLight(0xFF6633, 0, 8, 2);
        millLight.position.set(9, 5, -9);
        this.scene.add(millLight);
        this.nightLights.push({ light: millLight, maxIntensity: 0.5, type: 'signal' });
        
        // 水井旁路灯
        const wellLight = new THREE.PointLight(0xFFCC60, 0, 5, 2);
        wellLight.position.set(8, 2, 8);
        this.scene.add(wellLight);
        this.nightLights.push({ light: wellLight, maxIntensity: 0.5, type: 'lantern' });
    },
    
    // 更新夜间灯光
    _updateNightLights(hour, time) {
        const isNight = hour >= 19 || hour < 5;
        const isDusk = hour >= 17 && hour < 19;
        const isDawn = hour >= 5 && hour < 7;
        
        let factor = 0;
        if (isNight) factor = 1.0;
        else if (isDusk) factor = (hour - 17) / 2.0;
        else if (isDawn) factor = 1.0 - (hour - 5) / 2.0;
        
        this.nightLights.forEach(nl => {
            let intensity = nl.maxIntensity * factor;
            // 灯笼类微微闪烁
            if (nl.type === 'lantern' && factor > 0) {
                intensity *= 0.85 + Math.sin(time * 3 + Math.random() * 0.1) * 0.15;
            }
            // 信号灯闪烁
            if (nl.type === 'signal' && factor > 0) {
                intensity *= Math.sin(time * 1.5) > 0 ? 1.0 : 0.3;
            }
            nl.light.intensity = intensity;
        });
    },
    
    // 创建地形
    createTerrain() {
        // 使用美化模块创建多层次草地
        if (typeof SceneBeautify !== 'undefined') {
            SceneBeautify.createRichTerrain(this.scene);
            SceneBeautify.createPaths(this.scene);
            SceneBeautify.createBeautifulFence(this.scene);
        } else {
            // 降级：圆形岛屿地面
            const groundGeo = new THREE.CircleGeometry(18, 32);
            const groundMat = new THREE.MeshStandardMaterial({ color: PALETTE.grassBase, roughness: 0.85, metalness: 0.0 });
            const ground = new THREE.Mesh(groundGeo, groundMat);
            ground.rotation.x = -Math.PI / 2;
            ground.receiveShadow = true;
            this.scene.add(ground);
            this.createFence();
        }
    },

    
    // 创建围栏
    createFence() {
        const postGeo = new THREE.BoxGeometry(0.2, 1.2, 0.2);
        const postMat = MatFactory.wood(PALETTE.fenceBase);
        const railGeo = new THREE.BoxGeometry(2.5, 0.15, 0.1);
        const railMat = MatFactory.wood(PALETTE.fenceLight);
        
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
        // 地块布局：3行3列，间距5单位，土壤尺寸3.0，空隙2.0单位
        const plotPositions = [
            [-5, -5], [0, -5], [5, -5],
            [-5, 0],  [0, 0],  [5, 0],
            [-5, 5],  [0, 5],  [5, 5]
        ];


        
        plotPositions.forEach((pos, i) => {
            const group = new THREE.Group();
            group.position.set(pos[0], 0, pos[1]);
            group.userData = { plotId: i, type: 'plot' };
            
            // 使用美化模块创建土地
            if (typeof SceneBeautify !== 'undefined') {
                SceneBeautify.createBeautifulPlot(group, i);
            } else {
                const soilGeo = new THREE.BoxGeometry(3.0, 0.3, 3.0);

                const soilMat = MatFactory.soil(PALETTE.soilBase);
                const soil = new THREE.Mesh(soilGeo, soilMat);
                soil.position.y = 0.15;
                soil.receiveShadow = true;
                soil.castShadow = true;
                group.add(soil);
                group.userData.soilMesh = soil;
                const borderGeo = new THREE.BoxGeometry(3.3, 0.1, 3.3);

                const borderMat = MatFactory.wood(PALETTE.woodDark);
                const border = new THREE.Mesh(borderGeo, borderMat);
                border.position.y = 0.05;
                group.add(border);
            }
            
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
        
        // 树木（湖泊已移至左上角(-14,11)，树木位置无冲突）
        const treePositions = [[-10, 5], [-10, -2], [10, 5], [10, -2], [-3, 10], [7, 10], [-7, -10], [7, -10]];

        treePositions.forEach(([x, z]) => this.createTree(x, z));

        
        // 使用美化模块添加地面装饰、农场道具、氛围粒子
        if (typeof SceneBeautify !== 'undefined') {
            SceneBeautify.createGroundDecorations(this.scene);
            SceneBeautify.createFarmProps(this.scene);
            SceneBeautify.createAtmosphereParticles(this.scene);
        } else {
            // 降级：原始花朵
            for (let i = 0; i < 20; i++) {
                const x = (Math.random() - 0.5) * 20 + (Math.random() > 0.5 ? 10 : -10);
                const z = (Math.random() - 0.5) * 20;
                this.createFlower(x, z);
            }
        }
    },

    
    // 创建谷仓（精致建筑模型）
    createBarn(x, z) {
        const group = new THREE.Group();
        group.position.set(x, 0, z);
        
        const wallMat = MatFactory.wall(PALETTE.barnRed);
        const wallDarkMat = MatFactory.wall(PALETTE.barnRedDark);
        const woodMat = MatFactory.wood(PALETTE.woodBase);
        const woodDarkMat = MatFactory.wood(PALETTE.woodDark);
        const roofMat = MatFactory.roof(PALETTE.roofBrown);
        const stoneMat = MatFactory.stone(PALETTE.stoneDark);
        const glassMat = MatFactory.glass(0xFFE8A0, 0.5);
        
        // 石基座
        const baseGeo = new THREE.BoxGeometry(3.6, 0.3, 3.6);
        const base = new THREE.Mesh(baseGeo, stoneMat);
        base.position.y = 0.15;
        base.receiveShadow = true;
        base.castShadow = true;
        group.add(base);
        
        // 主体墙壁
        const bodyGeo = new THREE.BoxGeometry(3.2, 2.6, 3.2);
        const body = new THREE.Mesh(bodyGeo, wallMat);
        body.position.y = 1.6;
        body.castShadow = true;
        body.receiveShadow = true;
        group.add(body);
        
        // 墙面木板纹理条（横向装饰线）
        for (let i = 0; i < 5; i++) {
            const plankGeo = new THREE.BoxGeometry(3.25, 0.04, 0.06);
            const plank = new THREE.Mesh(plankGeo, wallDarkMat);
            plank.position.set(0, 0.6 + i * 0.5, 1.62);
            group.add(plank);
            const plankB = new THREE.Mesh(plankGeo, wallDarkMat);
            plankB.position.set(0, 0.6 + i * 0.5, -1.62);
            group.add(plankB);
        }
        for (let i = 0; i < 5; i++) {
            const plankGeo = new THREE.BoxGeometry(0.06, 0.04, 3.25);
            const plank = new THREE.Mesh(plankGeo, wallDarkMat);
            plank.position.set(1.62, 0.6 + i * 0.5, 0);
            group.add(plank);
            const plankB = new THREE.Mesh(plankGeo, wallDarkMat);
            plankB.position.set(-1.62, 0.6 + i * 0.5, 0);
            group.add(plankB);
        }
        
        // 屋顶（四棱锥+屋檐）
        const roofGeo = new THREE.ConeGeometry(2.7, 1.8, 4);
        const roof = new THREE.Mesh(roofGeo, roofMat);
        roof.position.y = 3.8;
        roof.rotation.y = Math.PI / 4;
        roof.castShadow = true;
        group.add(roof);
        
        // 屋檐（扁平的四棱锥，比屋顶略大）
        const eaveGeo = new THREE.ConeGeometry(3.0, 0.2, 4);
        const eave = new THREE.Mesh(eaveGeo, MatFactory.roof(PALETTE.roofTile));
        eave.position.y = 2.95;
        eave.rotation.y = Math.PI / 4;
        eave.castShadow = true;
        group.add(eave);
        
        // 大门（双开谷仓门）
        const doorFrameGeo = new THREE.BoxGeometry(1.2, 2.0, 0.12);
        const doorFrame = new THREE.Mesh(doorFrameGeo, woodDarkMat);
        doorFrame.position.set(0, 1.3, 1.65);
        group.add(doorFrame);
        // 左门板
        const doorLGeo = new THREE.BoxGeometry(0.55, 1.85, 0.08);
        const doorL = new THREE.Mesh(doorLGeo, woodMat);
        doorL.position.set(-0.28, 1.3, 1.7);
        group.add(doorL);
        // 右门板
        const doorR = new THREE.Mesh(doorLGeo, woodMat);
        doorR.position.set(0.28, 1.3, 1.7);
        group.add(doorR);
        // 门上交叉木条
        const crossGeo = new THREE.BoxGeometry(0.06, 1.6, 0.04);
        const crossL = new THREE.Mesh(crossGeo, woodDarkMat);
        crossL.position.set(-0.28, 1.3, 1.75);
        crossL.rotation.z = 0.35;
        group.add(crossL);
        const crossR = new THREE.Mesh(crossGeo, woodDarkMat);
        crossR.position.set(0.28, 1.3, 1.75);
        crossR.rotation.z = -0.35;
        group.add(crossR);
        
        // 窗户（两侧各一个）
        [-1, 1].forEach(side => {
            // 窗框
            const winFrameGeo = new THREE.BoxGeometry(0.08, 0.8, 0.7);
            const winFrame = new THREE.Mesh(winFrameGeo, woodDarkMat);
            winFrame.position.set(side * 1.65, 2.0, 0);
            group.add(winFrame);
            // 窗玻璃
            const winGlassGeo = new THREE.BoxGeometry(0.04, 0.65, 0.55);
            const winGlass = new THREE.Mesh(winGlassGeo, glassMat);
            winGlass.position.set(side * 1.66, 2.0, 0);
            group.add(winGlass);
            // 窗台
            const sillGeo = new THREE.BoxGeometry(0.15, 0.06, 0.8);
            const sill = new THREE.Mesh(sillGeo, woodMat);
            sill.position.set(side * 1.65, 1.55, 0);
            group.add(sill);
        });
        
        // 烟囱
        const chimneyGeo = new THREE.BoxGeometry(0.5, 1.2, 0.5);
        const chimney = new THREE.Mesh(chimneyGeo, stoneMat);
        chimney.position.set(0.8, 4.2, -0.6);
        chimney.castShadow = true;
        group.add(chimney);
        const chimneyTopGeo = new THREE.BoxGeometry(0.6, 0.15, 0.6);
        const chimneyTop = new THREE.Mesh(chimneyTopGeo, stoneMat);
        chimneyTop.position.set(0.8, 4.85, -0.6);
        group.add(chimneyTop);
        
        // 门口灯笼挂架
        const hookGeo = new THREE.CylinderGeometry(0.02, 0.02, 0.4, 4);
        const hook = new THREE.Mesh(hookGeo, MatFactory.rustMetal());
        hook.position.set(0.8, 2.7, 1.68);
        hook.rotation.z = -Math.PI / 4;
        group.add(hook);
        // 灯笼体
        const lanternGeo = new THREE.CylinderGeometry(0.08, 0.1, 0.2, 8);
        const lantern = new THREE.Mesh(lanternGeo, MatFactory.emissive(0xFFA040, 0.3));
        lantern.position.set(1.0, 2.5, 1.68);
        group.add(lantern);
        
        this.scene.add(group);
    },
    
    // 创建风车（精致模型）
    createWindmill(x, z) {
        const group = new THREE.Group();
        group.position.set(x, 0, z);
        group.userData = { type: 'windmill' };
        
        const millWallMat = MatFactory.wall(PALETTE.millWhite);
        const metalMat = MatFactory.metal(PALETTE.millMetal);
        const woodMat = MatFactory.wood(PALETTE.woodBase);
        const roofMat = MatFactory.roof(PALETTE.roofBrown);
        const stoneMat = MatFactory.stone(PALETTE.stoneDark);
        
        // 石基座
        const baseGeo = new THREE.CylinderGeometry(0.9, 1.1, 0.4, 12);
        const base = new THREE.Mesh(baseGeo, stoneMat);
        base.position.y = 0.2;
        base.receiveShadow = true;
        base.castShadow = true;
        group.add(base);
        
        // 塔身（下粗上细的圆台）
        const towerGeo = new THREE.CylinderGeometry(0.4, 0.75, 4.2, 10);
        const tower = new THREE.Mesh(towerGeo, millWallMat);
        tower.position.y = 2.5;
        tower.castShadow = true;
        tower.receiveShadow = true;
        group.add(tower);
        
        // 塔身装饰环（两道石环）
        [1.5, 3.0].forEach(h => {
            const ringGeo = new THREE.TorusGeometry(0.62 - h * 0.04, 0.04, 6, 16);
            const ring = new THREE.Mesh(ringGeo, stoneMat);
            ring.position.y = h;
            ring.rotation.x = Math.PI / 2;
            group.add(ring);
        });
        
        // 塔身门
        const doorGeo = new THREE.BoxGeometry(0.45, 1.0, 0.1);
        const door = new THREE.Mesh(doorGeo, woodMat);
        door.position.set(0, 0.9, 0.72);
        group.add(door);
        // 门框
        const doorFrameGeo = new THREE.BoxGeometry(0.55, 1.1, 0.06);
        const doorFrame = new THREE.Mesh(doorFrameGeo, MatFactory.wood(PALETTE.woodDark));
        doorFrame.position.set(0, 0.95, 0.73);
        group.add(doorFrame);
        
        // 小窗口
        const winGeo = new THREE.CircleGeometry(0.12, 8);
        const winMat = MatFactory.glass(0xFFE8A0, 0.6);
        [0, Math.PI / 2, Math.PI].forEach(angle => {
            const win = new THREE.Mesh(winGeo, winMat);
            const r = 0.52;
            win.position.set(Math.sin(angle) * r, 3.2, Math.cos(angle) * r);
            win.lookAt(0, 3.2, 0);
            group.add(win);
        });
        
        // 圆锥屋顶
        const capGeo = new THREE.ConeGeometry(0.55, 0.8, 10);
        const cap = new THREE.Mesh(capGeo, roofMat);
        cap.position.y = 5.0;
        cap.castShadow = true;
        group.add(cap);
        
        // 屋顶尖顶装饰
        const finialGeo = new THREE.SphereGeometry(0.06, 6, 6);
        const finial = new THREE.Mesh(finialGeo, metalMat);
        finial.position.y = 5.45;
        group.add(finial);
        
        // 风叶轴心
        const hubGeo = new THREE.CylinderGeometry(0.1, 0.1, 0.15, 8);
        const hub = new THREE.Mesh(hubGeo, metalMat);
        hub.position.set(0, 4.2, 0.5);
        hub.rotation.x = Math.PI / 2;
        group.add(hub);
        
        // 风叶组
        const bladeGroup = new THREE.Group();
        bladeGroup.position.set(0, 4.2, 0.55);
        bladeGroup.userData = { isWindmill: true };
        
        const bladeMat = MatFactory.wood(PALETTE.millBlade);
        const bladeFrameMat = MatFactory.wood(PALETTE.woodLight);
        
        for (let i = 0; i < 4; i++) {
            const bladeArm = new THREE.Group();
            bladeArm.rotation.z = (i * Math.PI) / 2;
            
            // 主臂杆
            const armGeo = new THREE.BoxGeometry(0.06, 2.2, 0.04);
            const arm = new THREE.Mesh(armGeo, bladeFrameMat);
            arm.position.y = 1.1;
            bladeArm.add(arm);
            
            // 风帆面（梯形近似，用两段扁方块）
            const sailGeo1 = new THREE.BoxGeometry(0.5, 1.4, 0.02);
            const sail1 = new THREE.Mesh(sailGeo1, bladeMat);
            sail1.position.set(0.15, 1.2, 0);
            bladeArm.add(sail1);
            
            const sailGeo2 = new THREE.BoxGeometry(0.35, 0.6, 0.02);
            const sail2 = new THREE.Mesh(sailGeo2, bladeMat);
            sail2.position.set(0.1, 2.05, 0);
            bladeArm.add(sail2);
            
            bladeGroup.add(bladeArm);
        }
        
        group.add(bladeGroup);
        this.scene.add(group);
        this.windmillBlades = bladeGroup;
    },
    
    // 创建树（多样化模型）
    createTree(x, z) {
        const group = new THREE.Group();
        group.position.set(x, 0, z);
        
        // 随机变化参数
        const scale = 0.8 + Math.random() * 0.5;
        const treeType = Math.random();
        
        // 树干
        const trunkH = (1.2 + Math.random() * 0.6) * scale;
        const trunkR1 = (0.12 + Math.random() * 0.06) * scale;
        const trunkR2 = (0.22 + Math.random() * 0.08) * scale;
        const trunkGeo = new THREE.CylinderGeometry(trunkR1, trunkR2, trunkH, 7);
        const trunk = new THREE.Mesh(trunkGeo, MatFactory.wood(PALETTE.woodDark));
        trunk.position.y = trunkH / 2;
        trunk.castShadow = true;
        group.add(trunk);
        
        // 暴露根系
        for (let i = 0; i < 3; i++) {
            const rootAngle = (i / 3) * Math.PI * 2 + Math.random() * 0.5;
            const rootGeo = new THREE.CylinderGeometry(0.02 * scale, 0.05 * scale, 0.4 * scale, 4);
            const root = new THREE.Mesh(rootGeo, MatFactory.wood(PALETTE.woodDark));
            root.position.set(Math.cos(rootAngle) * 0.18 * scale, 0.08, Math.sin(rootAngle) * 0.18 * scale);
            root.rotation.z = (Math.random() - 0.5) * 0.6;
            root.rotation.x = (Math.random() - 0.5) * 0.6;
            group.add(root);
        }
        
        if (treeType < 0.5) {
            // 类型A：圆形阔叶树（多球叠加）
            const leafColors = [PALETTE.leafDark, PALETTE.leafBase, PALETTE.leafLight];
            const crownCenterY = trunkH + 0.6 * scale;
            const crownR = (0.9 + Math.random() * 0.4) * scale;
            
            // 主冠
            const mainGeo = new THREE.SphereGeometry(crownR, 8, 7);
            const mainLeaf = new THREE.Mesh(mainGeo, MatFactory.foliage(leafColors[1]));
            mainLeaf.position.y = crownCenterY;
            mainLeaf.scale.set(1, 0.8, 1);
            mainLeaf.castShadow = true;
            group.add(mainLeaf);
            
            // 副冠（2-3个偏移球体增加蓬松感）
            const subCount = 2 + Math.floor(Math.random() * 2);
            for (let i = 0; i < subCount; i++) {
                const angle = (i / subCount) * Math.PI * 2 + Math.random();
                const r = crownR * 0.5;
                const subR = crownR * (0.5 + Math.random() * 0.2);
                const subGeo = new THREE.SphereGeometry(subR, 7, 6);
                const subLeaf = new THREE.Mesh(subGeo, MatFactory.foliage(leafColors[Math.floor(Math.random() * 3)]));
                subLeaf.position.set(
                    Math.cos(angle) * r,
                    crownCenterY + (Math.random() - 0.3) * crownR * 0.4,
                    Math.sin(angle) * r
                );
                subLeaf.castShadow = true;
                group.add(subLeaf);
            }
        } else {
            // 类型B：锥形针叶树（多层锥体）
            const coneColors = [PALETTE.leafDark, PALETTE.leafBase, PALETTE.leafYellow];
            const layers = 3 + Math.floor(Math.random() * 2);
            for (let i = 0; i < layers; i++) {
                const layerScale = 1 - i * 0.18;
                const coneR = (0.7 * layerScale + Math.random() * 0.1) * scale;
                const coneH = (0.7 + Math.random() * 0.2) * scale;
                const coneGeo = new THREE.ConeGeometry(coneR, coneH, 7);
                const cone = new THREE.Mesh(coneGeo, MatFactory.foliage(coneColors[i % 3]));
                cone.position.y = trunkH + i * 0.55 * scale;
                cone.castShadow = true;
                group.add(cone);
            }
        }
        
        this.scene.add(group);
    },
    
    // 创建水井
    createWell(x, z) {
        const group = new THREE.Group();
        group.position.set(x, 0, z);
        
        // 井身
        const wellGeo = new THREE.CylinderGeometry(0.6, 0.6, 0.8, 12);
        const well = new THREE.Mesh(wellGeo, MatFactory.stone());
        well.position.y = 0.4;
        well.castShadow = true;
        group.add(well);
        
        // 井架
        const postGeo = new THREE.BoxGeometry(0.1, 1.5, 0.1);
        const postMat = MatFactory.wood(PALETTE.woodDark);
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
        const stem = new THREE.Mesh(stemGeo, MatFactory.foliage(0x44aa44));
        stem.position.y = 0.2;
        group.add(stem);
        
        const colors = [PALETTE.flowerPink, PALETTE.flowerYellow, PALETTE.flowerPurple, PALETTE.flowerWhite];
        const flowerGeo = new THREE.SphereGeometry(0.12, 8, 8);
        const flowerMat = MatFactory.foliage(colors[Math.floor(Math.random() * colors.length)]);
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
        
        const cloudMat = new THREE.MeshStandardMaterial({ 
            color: 0xffffff, transparent: true, opacity: 0.88,
            roughness: 1.0, metalness: 0.0
        });
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
        // 使用新植物外观系统
        const stage = getCropStage(plot.growProgress, plot.state);
        if (typeof PlantBuilder !== 'undefined') {
            PlantBuilder.build(group, crop.id, stage);
            // 设置随机摇摆相位
            group.userData.swayPhase = Math.random() * Math.PI * 2;
            group.userData.cropId = crop.id;
        } else {
            // 降级：通用幼苗
            const stemGeo = new THREE.CylinderGeometry(0.05 * scale, 0.08 * scale, 0.8 * scale, 6);
            const stemMat = MatFactory.foliage(0x44aa44);
            const stem = new THREE.Mesh(stemGeo, stemMat);
            stem.position.y = 0.4 * scale;
            stem.castShadow = true;
            group.add(stem);
            const leafGeo = new THREE.SphereGeometry(0.3 * scale, 8, 8);
            const leafMat = MatFactory.foliage(crop.color);
            const leaf = new THREE.Mesh(leafGeo, leafMat);
            leaf.position.y = 0.8 * scale;
            leaf.scale.y = 0.6;
            leaf.castShadow = true;
            group.add(leaf);
        }
        
        // 浇水效果
        if (plot.watered) {
            const waterGeo = new THREE.SphereGeometry(0.05, 6, 6);
            const waterMat = new THREE.MeshStandardMaterial({ color: 0x4488ff, transparent: true, opacity: 0.7, roughness: 0.2, metalness: 0.0 });
            for (let i = 0; i < 3; i++) {
                const drop = new THREE.Mesh(waterGeo, waterMat);
                drop.position.set((Math.random() - 0.5) * 0.5, 0.1 + Math.random() * 0.3, (Math.random() - 0.5) * 0.5);
                group.add(drop);
            }
        }
    },

    
    // 创建成熟作物
    createMatureCrop(group, crop, plot) {
        // 使用新植物外观系统（阶段4=成熟）
        if (typeof PlantBuilder !== 'undefined') {
            PlantBuilder.build(group, crop.id, 4);
            group.userData.swayPhase = Math.random() * Math.PI * 2;
            group.userData.cropId = crop.id;
        } else {
            // 降级：通用成熟模型
            const stemGeo = new THREE.CylinderGeometry(0.06, 0.1, 1.2, 6);
            const stemMat = MatFactory.foliage(0x44aa44);
            const stem = new THREE.Mesh(stemGeo, stemMat);
            stem.position.y = 0.6;
            stem.castShadow = true;
            group.add(stem);
            const fruitGeo = new THREE.SphereGeometry(0.4, 10, 10);
            const fruitMat = MatFactory.foliage(crop.color);
            const fruit = new THREE.Mesh(fruitGeo, fruitMat);
            fruit.position.y = 1.3;
            fruit.castShadow = true;
            group.add(fruit);
        }
        
        // 完美品质光效
        if (plot.cropQuality === 'perfect') {
            const glowGeo = new THREE.SphereGeometry(0.6, 8, 8);
            const glowMat = MatFactory.emissive(0xffd700, 0.5);
            glowMat.transparent = true;
            glowMat.opacity = 0.3;
            const glow = new THREE.Mesh(glowGeo, glowMat);
            glow.position.y = 1.3;
            group.add(glow);
        }
        
        // 成熟跳动动画标记
        group.userData.bouncing = true;
        group.userData.bounceTime = Math.random() * Math.PI * 2;
    },

    
    // ===== 动物外观构建系统 =====

    // 创建鸡模型
    _buildChicken(group, color) {
        const bodyMat = MatFactory.toon(color || 0xf5f0e0);
        const legMat = MatFactory.toon(0xf5a623);
        const combMat = MatFactory.toon(0xcc2200);
        const beakMat = MatFactory.toon(0xf5a623);
        const eyeMat = MatFactory.toon(0x111111);

        // 身体 - 圆润椭球形，前胸挺起
        const bodyGeo = new THREE.SphereGeometry(0.22, 10, 8);
        const body = new THREE.Mesh(bodyGeo, bodyMat);
        body.scale.set(1.0, 0.9, 1.2);
        body.position.set(0, 0.28, 0);
        body.castShadow = true;
        group.add(body);

        // 头部 - 小型椭圆
        const headGroup = new THREE.Group();
        headGroup.position.set(0, 0.52, 0.22);
        const headGeo = new THREE.SphereGeometry(0.13, 8, 8);
        const head = new THREE.Mesh(headGeo, bodyMat);
        head.castShadow = true;
        headGroup.add(head);

        // 鸡冠 - 红色锯齿状（5个齿）
        for (let i = 0; i < 5; i++) {
            const combGeo = new THREE.ConeGeometry(0.025, 0.06 + (i === 2 ? 0.03 : 0), 4);
            const comb = new THREE.Mesh(combGeo, combMat);
            comb.position.set((i - 2) * 0.04, 0.13 + (i === 2 ? 0.015 : 0), 0);
            headGroup.add(comb);
        }

        // 肉垂 - 下方红色
        const wattleGeo = new THREE.SphereGeometry(0.04, 6, 6);
        const wattle = new THREE.Mesh(wattleGeo, combMat);
        wattle.scale.set(1, 1.3, 0.8);
        wattle.position.set(0, -0.1, 0.06);
        headGroup.add(wattle);

        // 喙 - 尖锐三角形，黄色
        const beakGeo = new THREE.ConeGeometry(0.03, 0.1, 4);
        const beak = new THREE.Mesh(beakGeo, beakMat);
        beak.rotation.x = Math.PI / 2;
        beak.position.set(0, -0.02, 0.14);
        headGroup.add(beak);

        // 眼睛
        const eyeGeo = new THREE.SphereGeometry(0.025, 6, 6);
        [-0.07, 0.07].forEach(ex => {
            const eye = new THREE.Mesh(eyeGeo, eyeMat);
            eye.position.set(ex, 0.03, 0.1);
            headGroup.add(eye);
        });

        group.add(headGroup);

        // 翅膀 - 短小贴合身体两侧
        [-1, 1].forEach(side => {
            const wingGeo = new THREE.SphereGeometry(0.1, 6, 6);
            const wing = new THREE.Mesh(wingGeo, bodyMat);
            wing.scale.set(0.5, 0.7, 1.1);
            wing.position.set(side * 0.22, 0.3, 0);
            wing.castShadow = true;
            group.add(wing);
        });

        // 尾羽 - 短翘羽毛束
        const tailGeo = new THREE.ConeGeometry(0.08, 0.2, 5);
        const tail = new THREE.Mesh(tailGeo, bodyMat);
        tail.rotation.x = -Math.PI / 3;
        tail.position.set(0, 0.38, -0.22);
        group.add(tail);

        // 腿 - 细长黄色，关节后弯
        const legGeo = new THREE.CylinderGeometry(0.025, 0.02, 0.22, 5);
        const leftLegGroup = new THREE.Group();
        leftLegGroup.position.set(-0.08, 0.1, 0.02);
        const leftLeg = new THREE.Mesh(legGeo, legMat);
        leftLeg.position.y = -0.11;
        leftLegGroup.add(leftLeg);
        // 爪子
        const clawGeo = new THREE.CylinderGeometry(0.015, 0.01, 0.08, 4);
        [-1, 0, 1].forEach(dir => {
            const claw = new THREE.Mesh(clawGeo, legMat);
            claw.rotation.x = Math.PI / 2;
            claw.rotation.z = dir * 0.4;
            claw.position.set(dir * 0.04, -0.22, 0.03);
            leftLegGroup.add(claw);
        });
        group.add(leftLegGroup);

        const rightLegGroup = new THREE.Group();
        rightLegGroup.position.set(0.08, 0.1, 0.02);
        const rightLeg = new THREE.Mesh(legGeo, legMat);
        rightLeg.position.y = -0.11;
        rightLegGroup.add(rightLeg);
        [-1, 0, 1].forEach(dir => {
            const claw = new THREE.Mesh(clawGeo, legMat);
            claw.rotation.x = Math.PI / 2;
            claw.rotation.z = dir * 0.4;
            claw.position.set(dir * 0.04, -0.22, 0.03);
            rightLegGroup.add(claw);
        });
        group.add(rightLegGroup);

        // 存储动画部件引用
        group.userData.parts = {
            body, headGroup,
            leftLeg: leftLegGroup, rightLeg: rightLegGroup,
            tail
        };
        group.userData.baseHeadPos = headGroup.position.clone();
        group.userData.baseBodyY = body.position.y;
    },

    // 创建羊模型
    _buildSheep(group, color) {
        const woolMat = MatFactory.toon(color || 0xf0ede8);
        const skinMat = MatFactory.toon(0xd4c5a9);
        const legMat = MatFactory.toon(0x888880);
        const eyeMat = MatFactory.toon(0x111111);
        const pupilMat = MatFactory.toon(0x222200);

        // 身体 - 厚实圆筒形，覆盖蓬松羊毛
        const bodyGeo = new THREE.SphereGeometry(0.38, 10, 8);
        const body = new THREE.Mesh(bodyGeo, woolMat);
        body.scale.set(1.0, 0.85, 1.3);
        body.position.set(0, 0.42, 0);
        body.castShadow = true;
        group.add(body);

        // 羊毛蓬松效果 - 多个球形叠加
        const woolGroup = new THREE.Group();
        woolGroup.position.set(0, 0.42, 0);
        const woolPositions = [
            [0.2, 0.15, 0.2], [-0.2, 0.15, 0.2], [0, 0.2, 0.3],
            [0.25, 0.1, -0.1], [-0.25, 0.1, -0.1], [0, 0.18, -0.25],
            [0.15, 0.2, 0], [-0.15, 0.2, 0]
        ];
        woolPositions.forEach(([wx, wy, wz]) => {
            const wGeo = new THREE.SphereGeometry(0.14 + Math.random() * 0.05, 6, 6);
            const w = new THREE.Mesh(wGeo, woolMat);
            w.position.set(wx, wy, wz);
            woolGroup.add(w);
        });
        group.add(woolGroup);

        // 头部 - 窄长脸型
        const headGroup = new THREE.Group();
        headGroup.position.set(0, 0.62, 0.42);
        const headGeo = new THREE.BoxGeometry(0.22, 0.26, 0.32);
        const head = new THREE.Mesh(headGeo, skinMat);
        head.castShadow = true;
        headGroup.add(head);

        // 鼻吻部
        const snoutGeo = new THREE.BoxGeometry(0.16, 0.14, 0.12);
        const snout = new THREE.Mesh(snoutGeo, skinMat);
        snout.position.set(0, -0.06, 0.18);
        headGroup.add(snout);

        // 耳朵 - 水平向两侧
        [-1, 1].forEach(side => {
            const earGeo = new THREE.SphereGeometry(0.07, 6, 6);
            const ear = new THREE.Mesh(earGeo, skinMat);
            ear.scale.set(0.5, 0.8, 1.2);
            ear.position.set(side * 0.16, 0.06, -0.05);
            ear.rotation.z = side * 0.3;
            headGroup.add(ear);
        });

        // 眼睛 - 横向瞳孔（关键特征）
        [-0.08, 0.08].forEach(ex => {
            const eyeGeo = new THREE.SphereGeometry(0.04, 8, 8);
            const eye = new THREE.Mesh(eyeGeo, eyeMat);
            eye.position.set(ex, 0.04, 0.14);
            headGroup.add(eye);
            // 横向瞳孔
            const pupilGeo = new THREE.BoxGeometry(0.06, 0.015, 0.01);
            const pupil = new THREE.Mesh(pupilGeo, pupilMat);
            pupil.position.set(ex, 0.04, 0.175);
            headGroup.add(pupil);
        });

        group.add(headGroup);

        // 四条腿 - 细长直立
        const legGeo = new THREE.CylinderGeometry(0.055, 0.045, 0.38, 6);
        const legPositions = [
            { name: 'frontLeft', x: -0.16, z: 0.22 },
            { name: 'frontRight', x: 0.16, z: 0.22 },
            { name: 'backLeft', x: -0.16, z: -0.22 },
            { name: 'backRight', x: 0.16, z: -0.22 }
        ];
        const legGroups = {};
        legPositions.forEach(({ name, x, z }) => {
            const lg = new THREE.Group();
            lg.position.set(x, 0.19, z);
            const leg = new THREE.Mesh(legGeo, legMat);
            leg.position.y = 0;
            lg.add(leg);
            // 蹄子（偶蹄）
            const hoofGeo = new THREE.BoxGeometry(0.08, 0.06, 0.1);
            const hoofMat = MatFactory.toon(0x333333);
            const hoof = new THREE.Mesh(hoofGeo, hoofMat);
            hoof.position.y = -0.2;
            lg.add(hoof);
            group.add(lg);
            legGroups[name] = lg;
        });

        // 尾巴 - 短小下垂
        const tailGeo = new THREE.SphereGeometry(0.08, 6, 6);
        const tail = new THREE.Mesh(tailGeo, woolMat);
        tail.position.set(0, 0.42, -0.42);
        group.add(tail);

        group.userData.parts = {
            body, headGroup, woolGroup,
            frontLeft: legGroups.frontLeft, frontRight: legGroups.frontRight,
            backLeft: legGroups.backLeft, backRight: legGroups.backRight,
            tail
        };
        group.userData.baseWoolScale = woolGroup.scale.clone();
        group.userData.baseHeadPos = headGroup.position.clone();
    },

    // 创建牛模型
    _buildCow(group, color) {
        // ===== 高辨识度卡通奶牛 =====
        // 参考 CowModel 设计：BoxGeometry 身体 + CircleGeometry 斑块 + 独立鼻镜 + 水平耳朵
        // 坐标系：z 正方向为头部，z 负方向为尾部，y 为高度
        // 整体缩放：身体 BoxGeometry(2.0,1.0,1.0) → 实际约 0.8×0.4×0.4（乘以0.4缩放）

        const SCALE = 0.42; // 整体缩放系数，适配游戏场景

        // --- 材质定义 ---
        const whiteMat    = MatFactory.toon(0xF5F5F0); // 奶白色
        const blackMat    = new THREE.MeshStandardMaterial({ color: 0x1A1A1A, side: THREE.DoubleSide, roughness: 0.6, metalness: 0.0 }); // 黑色斑块
        const pinkMat     = MatFactory.toon(0xFFB6C1); // 粉色（鼻子/乳房）
        const brownMat    = MatFactory.toon(0x4A3728); // 深棕（眼睛）
        const hornMat     = MatFactory.toon(0xF5DEB3); // 米黄（犄角）
        const hoofMat     = MatFactory.toon(0x3D3D3D); // 深灰（蹄子）
        const whiteSolid  = MatFactory.toon(0xFFFFFF); // 纯白（眼白/高光）
        const darkPinkMat = MatFactory.toon(0xCC7788); // 深粉（鼻孔）

        // ===== 整体朝向修正 =====
        // 游戏移动方向用 atan2(dx, dz)，z正方向为前进方向
        // 所以奶牛头部朝 z 正方向，尾部朝 z 负方向
        // 身体 BoxGeometry 长轴沿 z 轴（depth = 2.0*SCALE）

        // ===== 根节点 - 所有部件挂在此节点下，统一抬高 =====
        const cowRoot = new THREE.Group();
        cowRoot.position.set(0, 0.55, 0);
        group.add(cowRoot);

        // ===== 身体 - 长方体，长轴沿 z 轴（头→尾方向） =====
        // BoxGeometry(width, height, depth): x=宽, y=高, z=长
        // 身体: 宽0.42, 高0.42, 长0.84
        const bodyGroup = new THREE.Group();
        cowRoot.add(bodyGroup);

        const bodyGeo = new THREE.BoxGeometry(1.0 * SCALE, 1.0 * SCALE, 2.0 * SCALE);
        const body = new THREE.Mesh(bodyGeo, whiteMat);
        body.castShadow = true;
        bodyGroup.add(body);

        // ===== 黑色斑块 - CircleGeometry 贴在身体两侧面（x轴两侧） =====
        // 身体侧面 x = ±0.5*SCALE = ±0.21
        const spotDefs = [
            // 右侧面（x正方向）
            { x:  0.505 * SCALE, y:  0.3 * SCALE, z:  0.3 * SCALE, size: 0.35 * SCALE, rz:  0.3 },
            { x:  0.505 * SCALE, y:  0.2 * SCALE, z: -0.2 * SCALE, size: 0.40 * SCALE, rz: -0.5 },
            { x:  0.505 * SCALE, y: -0.1 * SCALE, z:  0.5 * SCALE, size: 0.28 * SCALE, rz:  0.8 },
            { x:  0.505 * SCALE, y:  0.1 * SCALE, z: -0.6 * SCALE, size: 0.32 * SCALE, rz:  0.2 },
            // 左侧面（x负方向）
            { x: -0.505 * SCALE, y:  0.3 * SCALE, z:  0.3 * SCALE, size: 0.35 * SCALE, rz: -0.3 },
            { x: -0.505 * SCALE, y:  0.2 * SCALE, z: -0.2 * SCALE, size: 0.40 * SCALE, rz:  0.5 },
            { x: -0.505 * SCALE, y: -0.1 * SCALE, z:  0.5 * SCALE, size: 0.28 * SCALE, rz: -0.8 },
            { x: -0.505 * SCALE, y:  0.1 * SCALE, z: -0.6 * SCALE, size: 0.32 * SCALE, rz: -0.2 },
        ];
        spotDefs.forEach(({ x, y, z, size, rz }) => {
            const sGeo = new THREE.CircleGeometry(size, 16);
            const spot = new THREE.Mesh(sGeo, blackMat);
            spot.position.set(x, y, z);
            // 旋转使圆面朝向侧面（x轴方向）
            spot.rotation.y = x > 0 ? Math.PI / 2 : -Math.PI / 2;
            spot.rotation.z = rz;
            bodyGroup.add(spot);
        });

        // ===== 颈部 - 连接身体与头部，沿 z 正方向延伸 =====
        const neckGeo = new THREE.CylinderGeometry(0.10, 0.13, 0.22, 8);
        const neck = new THREE.Mesh(neckGeo, whiteMat);
        // 颈部位于身体前端（z = 1.0*SCALE = 0.42），向前倾斜
        neck.position.set(0, 0.08 * SCALE, 1.05 * SCALE);
        neck.rotation.x = -Math.PI / 2.2; // 前倾（绕x轴）
        bodyGroup.add(neck);

        // ===== 头部 - 挂在 bodyGroup 下，紧贴身体前端 =====
        // 身体前端 z = 1.0*SCALE = 0.42，头部中心再向前 0.4*SCALE
        const headGroup = new THREE.Group();
        headGroup.position.set(0, 0.3 * SCALE, 1.0 * SCALE + 0.4 * SCALE);
        bodyGroup.add(headGroup);  // ← 挂在 bodyGroup 下，随身体一起运动

        // 头部主体
        const headGeo = new THREE.BoxGeometry(0.7 * SCALE, 0.7 * SCALE, 0.8 * SCALE);
        const headMesh = new THREE.Mesh(headGeo, whiteMat);
        headMesh.castShadow = true;
        headGroup.add(headMesh);

        // 头部黑斑（右眼周围）
        const headSpotGeo = new THREE.CircleGeometry(0.25 * SCALE, 16);
        const headSpot = new THREE.Mesh(headSpotGeo, blackMat);
        headSpot.position.set(0.36 * SCALE, 0.2 * SCALE, 0.1 * SCALE);
        headSpot.rotation.y = Math.PI / 2; // 朝右侧
        headGroup.add(headSpot);

        // ===== 鼻镜 - 宽大矩形，粉色，突出于头部前方（z正方向） =====
        const noseGeo = new THREE.BoxGeometry(0.4 * SCALE, 0.3 * SCALE, 0.5 * SCALE);
        const noseMesh = new THREE.Mesh(noseGeo, pinkMat);
        noseMesh.position.set(0, -0.3 * SCALE, 0.5 * SCALE);
        headGroup.add(noseMesh);

        // 鼻孔（朝前，用 CylinderGeometry，rotation.x = Math.PI/2 使轴朝 z 方向）
        [-0.1 * SCALE, 0.1 * SCALE].forEach(nx => {
            const nGeo = new THREE.CylinderGeometry(0.06 * SCALE, 0.06 * SCALE, 0.1 * SCALE, 8);
            const n = new THREE.Mesh(nGeo, darkPinkMat);
            n.position.set(nx, -0.35 * SCALE, 0.72 * SCALE);
            n.rotation.x = Math.PI / 2; // 轴朝 z 方向（朝前）
            headGroup.add(n);
        });

        // ===== 眼睛 - 大而温和，位于头部两侧（x轴两侧） =====
        const earGroups = [];
        [0.36 * SCALE, -0.36 * SCALE].forEach(ex => {
            // 眼白
            const ewGeo = new THREE.SphereGeometry(0.10 * SCALE, 16, 16);
            const ew = new THREE.Mesh(ewGeo, whiteSolid);
            ew.position.set(ex, 0.15 * SCALE, 0.3 * SCALE);
            headGroup.add(ew);
            // 深棕瞳孔
            const pupilGeo = new THREE.SphereGeometry(0.07 * SCALE, 12, 12);
            const pupil = new THREE.Mesh(pupilGeo, brownMat);
            pupil.position.set(ex, 0.15 * SCALE, 0.32 * SCALE);
            headGroup.add(pupil);
            // 高光
            const hlGeo = new THREE.SphereGeometry(0.025 * SCALE, 8, 8);
            const hl = new THREE.Mesh(hlGeo, whiteSolid);
            hl.position.set(ex + (ex > 0 ? 0.02 : -0.02) * SCALE, 0.20 * SCALE, 0.35 * SCALE);
            headGroup.add(hl);
        });

        // ===== 犄角 - 短小弯曲向上，米黄色 =====
        [0.25 * SCALE, -0.25 * SCALE].forEach(hx => {
            const hornGeo = new THREE.CylinderGeometry(0.05 * SCALE, 0.08 * SCALE, 0.3 * SCALE, 8);
            const horn = new THREE.Mesh(hornGeo, hornMat);
            horn.position.set(hx, 0.5 * SCALE, -0.2 * SCALE);
            horn.rotation.x = 0.3; // 略向前倾
            headGroup.add(horn);
        });

        // ===== 耳朵 - 水平向外伸展，ConeGeometry 叶片形，内侧粉色 =====
        [0.5 * SCALE, -0.5 * SCALE].forEach((ex, i) => {
            const earGroup = new THREE.Group();
            earGroup.position.set(ex, 0.3 * SCALE, -0.1 * SCALE);
            // 外层白色耳朵（水平朝外）
            const earGeo = new THREE.ConeGeometry(0.15 * SCALE, 0.3 * SCALE, 8);
            const ear = new THREE.Mesh(earGeo, whiteMat);
            ear.rotation.z = ex > 0 ? -Math.PI / 2 : Math.PI / 2; // 水平朝外
            earGroup.add(ear);
            // 内侧粉色
            const earInGeo = new THREE.ConeGeometry(0.09 * SCALE, 0.22 * SCALE, 8);
            const earIn = new THREE.Mesh(earInGeo, pinkMat);
            earIn.rotation.z = ex > 0 ? -Math.PI / 2 : Math.PI / 2;
            earGroup.add(earIn);
            headGroup.add(earGroup);
            earGroups.push(earGroup);
        });

        // ===== 四条腿 - 中等长度，直立有力 =====
        // 腿长 0.8*SCALE = 0.336，腿挂在 cowRoot 下
        // 身体底部 y = -0.5*SCALE = -0.21（相对 cowRoot）
        // 腿顶部与身体底部对齐：腿组 y = -0.5*SCALE，腿中心 y = -0.4*SCALE（相对腿组）
        const legGeo = new THREE.CylinderGeometry(0.12 * SCALE, 0.10 * SCALE, 0.8 * SCALE, 8);
        const legDefs = [
            { name: 'frontLeft',  x:  0.4 * SCALE, z:  0.6 * SCALE },
            { name: 'frontRight', x: -0.4 * SCALE, z:  0.6 * SCALE },
            { name: 'backLeft',   x:  0.4 * SCALE, z: -0.6 * SCALE },
            { name: 'backRight',  x: -0.4 * SCALE, z: -0.6 * SCALE },
        ];
        const legGroups = {};
        legDefs.forEach(({ name, x, z }) => {
            const lg = new THREE.Group();
            lg.position.set(x, -0.5 * SCALE, z);
            const leg = new THREE.Mesh(legGeo, whiteMat);
            leg.position.y = -0.4 * SCALE;
            lg.add(leg);
            // 偶蹄 - 深灰色 BoxGeometry
            const hoofGeo = new THREE.BoxGeometry(0.15 * SCALE, 0.10 * SCALE, 0.20 * SCALE);
            const hoof = new THREE.Mesh(hoofGeo, hoofMat);
            hoof.position.y = -0.85 * SCALE;
            lg.add(hoof);
            cowRoot.add(lg);
            legGroups[name] = lg;
        });

        // ===== 乳房 - 位于后腿之间腹下，粉色明显可见 =====
        const udderGeo = new THREE.SphereGeometry(0.20 * SCALE, 16, 16);
        const udder = new THREE.Mesh(udderGeo, pinkMat);
        udder.scale.set(1.0, 0.8, 1.2);
        udder.position.set(0, -0.7 * SCALE, -0.5 * SCALE);
        cowRoot.add(udder);
        // 4个乳头
        [
            { x:  0.08 * SCALE, z: -0.42 * SCALE },
            { x: -0.08 * SCALE, z: -0.42 * SCALE },
            { x:  0.08 * SCALE, z: -0.58 * SCALE },
            { x: -0.08 * SCALE, z: -0.58 * SCALE },
        ].forEach(({ x, z }) => {
            const tGeo = new THREE.CylinderGeometry(0.03 * SCALE, 0.04 * SCALE, 0.15 * SCALE, 8);
            const t = new THREE.Mesh(tGeo, pinkMat);
            t.position.set(x, -0.85 * SCALE, z);
            cowRoot.add(t);
        });

        // ===== 尾巴 - 细长 + 末端黑色毛球，位于身体后端（z负方向） =====
        const tailGroup = new THREE.Group();
        tailGroup.position.set(0, 0.2 * SCALE, -1.2 * SCALE);
        cowRoot.add(tailGroup);
        // 尾杆（向后下方延伸）
        const tailGeo = new THREE.CylinderGeometry(0.04 * SCALE, 0.06 * SCALE, 0.8 * SCALE, 8);
        const tailStick = new THREE.Mesh(tailGeo, whiteMat);
        tailStick.rotation.x = -Math.PI / 4; // 向后下方
        tailStick.position.set(0, -0.3 * SCALE, -0.3 * SCALE);
        tailGroup.add(tailStick);
        // 末端毛球（黑色）
        const tuftGeo = new THREE.SphereGeometry(0.12 * SCALE, 8, 8);
        const tuft = new THREE.Mesh(tuftGeo, blackMat);
        tuft.position.set(0, -0.65 * SCALE, -0.55 * SCALE);
        tailGroup.add(tuft);

        // ===== 存储部件引用，供动画系统使用 =====
        group.userData.parts = {
            body: bodyGroup, headGroup,
            frontLeft:  legGroups.frontLeft,
            frontRight: legGroups.frontRight,
            backLeft:   legGroups.backLeft,
            backRight:  legGroups.backRight,
            tail: tailGroup,
            leftEar:  earGroups[0],
            rightEar: earGroups[1]
        };
        group.userData.baseBodyPos = bodyGroup.position.clone();
        group.userData.baseHeadPos = headGroup.position.clone();
    },





    // 创建猪模型
    _buildPig(group, color) {
        const bodyMat = MatFactory.toon(color || 0xffb6c1);
        const snoutMat = MatFactory.toon(0xff9aaa);
        const eyeMat = MatFactory.toon(0x111111);
        const legMat = MatFactory.toon(0xffaabb);

        // 身体 - 滚圆桶形
        const bodyGeo = new THREE.SphereGeometry(0.38, 10, 8);
        const body = new THREE.Mesh(bodyGeo, bodyMat);
        body.scale.set(1.1, 0.85, 1.4);
        body.position.set(0, 0.38, 0);
        body.castShadow = true;
        group.add(body);

        // 头部 - 大型，与身体比例约1:3
        const headGroup = new THREE.Group();
        headGroup.position.set(0, 0.5, 0.46);
        const headGeo = new THREE.SphereGeometry(0.26, 10, 8);
        const head = new THREE.Mesh(headGeo, bodyMat);
        head.scale.set(1, 0.9, 1);
        head.castShadow = true;
        headGroup.add(head);

        // 鼻子 - 扁平圆盘状（关键特征）
        const snoutGeo = new THREE.CylinderGeometry(0.12, 0.12, 0.06, 12);
        const snout = new THREE.Mesh(snoutGeo, snoutMat);
        snout.rotation.x = Math.PI / 2;
        snout.position.set(0, -0.04, 0.24);
        headGroup.add(snout);
        // 鼻孔
        const nostrilGeo = new THREE.CylinderGeometry(0.03, 0.03, 0.04, 8);
        const nostrilMat = MatFactory.toon(0xcc7788);
        [-0.05, 0.05].forEach(nx => {
            const nostril = new THREE.Mesh(nostrilGeo, nostrilMat);
            nostril.rotation.x = Math.PI / 2;
            nostril.position.set(nx, -0.04, 0.27);
            headGroup.add(nostril);
        });

        // 耳朵 - 大型三角形，前倾
        [-1, 1].forEach(side => {
            const earGeo = new THREE.ConeGeometry(0.1, 0.18, 4);
            const ear = new THREE.Mesh(earGeo, bodyMat);
            ear.position.set(side * 0.2, 0.2, -0.05);
            ear.rotation.z = side * 0.3;
            ear.rotation.x = 0.3;
            headGroup.add(ear);
        });

        // 眼睛
        const eyeGeo = new THREE.SphereGeometry(0.04, 8, 8);
        [-0.1, 0.1].forEach(ex => {
            const eye = new THREE.Mesh(eyeGeo, eyeMat);
            eye.position.set(ex, 0.06, 0.22);
            headGroup.add(eye);
        });

        group.add(headGroup);

        // 四条腿 - 短粗
        const legGeo = new THREE.CylinderGeometry(0.075, 0.065, 0.28, 6);
        const legPositions = [
            { name: 'frontLeft', x: -0.18, z: 0.26 },
            { name: 'frontRight', x: 0.18, z: 0.26 },
            { name: 'backLeft', x: -0.18, z: -0.26 },
            { name: 'backRight', x: 0.18, z: -0.26 }
        ];
        const legGroups = {};
        legPositions.forEach(({ name, x, z }) => {
            const lg = new THREE.Group();
            lg.position.set(x, 0.14, z);
            const leg = new THREE.Mesh(legGeo, legMat);
            lg.add(leg);
            const hoofGeo = new THREE.BoxGeometry(0.1, 0.06, 0.1);
            const hoofMat = MatFactory.toon(0x333333);
            const hoof = new THREE.Mesh(hoofGeo, hoofMat);
            hoof.position.y = -0.17;
            lg.add(hoof);
            group.add(lg);
            legGroups[name] = lg;
        });

        // 尾巴 - 卷曲螺旋状（关键特征）
        const tailGroup = new THREE.Group();
        tailGroup.position.set(0, 0.42, -0.5);
        // 用多段模拟螺旋卷尾
        for (let i = 0; i < 6; i++) {
            const tGeo = new THREE.SphereGeometry(0.03 - i * 0.003, 5, 5);
            const tMesh = new THREE.Mesh(tGeo, bodyMat);
            const angle = i * 1.2;
            const r = 0.06 - i * 0.005;
            tMesh.position.set(Math.cos(angle) * r, -i * 0.03, Math.sin(angle) * r);
            tailGroup.add(tMesh);
        }
        group.add(tailGroup);

        group.userData.parts = {
            body, headGroup,
            frontLeft: legGroups.frontLeft, frontRight: legGroups.frontRight,
            backLeft: legGroups.backLeft, backRight: legGroups.backRight,
            tail: tailGroup, snout
        };
        group.userData.baseBodyRot = 0;
        group.userData.baseSnoutPos = snout.position.clone();
        group.userData.baseHeadPos = headGroup.position.clone();
    },

    // 创建鸭子模型
    _buildDuck(group, color) {
        const bodyMat = MatFactory.toon(color || 0x88aaff);
        const billMat = MatFactory.toon(0xffaa00);
        const legMat  = MatFactory.toon(0xffaa00);
        const eyeMat  = MatFactory.toon(0x111111);
        const whiteMat = MatFactory.toon(0xffffff);

        // 身体 - 圆润椭球，尾部上翘
        const bodyGeo = new THREE.SphereGeometry(0.22, 10, 8);
        const body = new THREE.Mesh(bodyGeo, bodyMat);
        body.scale.set(1.0, 0.85, 1.3);
        body.position.set(0, 0.26, 0);
        body.castShadow = true;
        group.add(body);

        // 胸部白色斑块（关键识别特征）
        const chestGeo = new THREE.SphereGeometry(0.14, 8, 8);
        const chest = new THREE.Mesh(chestGeo, whiteMat);
        chest.scale.set(0.9, 0.8, 0.5);
        chest.position.set(0, 0.22, 0.2);
        group.add(chest);

        // 头部 - 圆润
        const headGroup = new THREE.Group();
        headGroup.position.set(0, 0.48, 0.22);
        const headGeo = new THREE.SphereGeometry(0.14, 8, 8);
        const head = new THREE.Mesh(headGeo, bodyMat);
        head.castShadow = true;
        headGroup.add(head);

        // 扁平鸭嘴（关键识别特征）
        const billGeo = new THREE.BoxGeometry(0.12, 0.04, 0.12);
        const bill = new THREE.Mesh(billGeo, billMat);
        bill.position.set(0, -0.02, 0.15);
        headGroup.add(bill);

        // 眼睛
        const eyeGeo = new THREE.SphereGeometry(0.025, 6, 6);
        [-0.07, 0.07].forEach(ex => {
            const eye = new THREE.Mesh(eyeGeo, eyeMat);
            eye.position.set(ex, 0.04, 0.1);
            headGroup.add(eye);
        });

        group.add(headGroup);

        // 翅膀
        [-1, 1].forEach(side => {
            const wingGeo = new THREE.SphereGeometry(0.1, 6, 6);
            const wing = new THREE.Mesh(wingGeo, bodyMat);
            wing.scale.set(0.45, 0.65, 1.1);
            wing.position.set(side * 0.22, 0.28, 0);
            group.add(wing);
        });

        // 尾羽 - 上翘（鸭子特征）
        const tailGeo = new THREE.ConeGeometry(0.07, 0.18, 5);
        const tail = new THREE.Mesh(tailGeo, bodyMat);
        tail.rotation.x = -Math.PI / 2.5;
        tail.position.set(0, 0.36, -0.22);
        group.add(tail);

        // 腿 - 橙黄色短腿
        const legGeo = new THREE.CylinderGeometry(0.025, 0.02, 0.18, 5);
        const leftLegGroup = new THREE.Group();
        leftLegGroup.position.set(-0.07, 0.09, 0.02);
        const leftLeg = new THREE.Mesh(legGeo, legMat);
        leftLeg.position.y = -0.09;
        leftLegGroup.add(leftLeg);
        // 蹬足
        const webGeo = new THREE.ConeGeometry(0.07, 0.04, 3);
        const webL = new THREE.Mesh(webGeo, billMat);
        webL.rotation.x = Math.PI / 2;
        webL.position.set(0, -0.19, 0.03);
        leftLegGroup.add(webL);
        group.add(leftLegGroup);

        const rightLegGroup = new THREE.Group();
        rightLegGroup.position.set(0.07, 0.09, 0.02);
        const rightLeg = new THREE.Mesh(legGeo, legMat);
        rightLeg.position.y = -0.09;
        rightLegGroup.add(rightLeg);
        const webR = new THREE.Mesh(webGeo, billMat);
        webR.rotation.x = Math.PI / 2;
        webR.position.set(0, -0.19, 0.03);
        rightLegGroup.add(webR);
        group.add(rightLegGroup);

        group.userData.parts = {
            body, headGroup,
            leftLeg: leftLegGroup, rightLeg: rightLegGroup,
            tail
        };
        group.userData.baseHeadPos = headGroup.position.clone();
        group.userData.baseBodyY = body.position.y;
    },

    // 添加动物到场景

    addAnimalMesh(animal) {
        const animalData = ANIMALS_DATA[animal.type];
        if (!animalData) return;

        const group = new THREE.Group();
        // 初始位置：螺旋扩散搜索，确保不落在种植地块/池塘上，且与已有动物不重叠
        const _animalRadiusInit = { chicken: 0.5, duck: 0.5, sheep: 0.8, cow: 1.0, pig: 0.8 };
        const myRadius = _animalRadiusInit[animal.type] || 0.6;
        let initX = 0, initZ = 0;
        let placed = false;
        // 在多个候选半径上搜索，从近到远
        const candidateRadii = [6, 7, 8, 9, 10, 5, 11];
        outer: for (const r of candidateRadii) {
            const steps = Math.max(12, Math.ceil(r * 2));
            for (let t = 0; t < steps; t++) {
                const angle = (t / steps) * Math.PI * 2 + (this.animalMeshes.length * 0.37);
                const cx = Math.cos(angle) * r;
                const cz = Math.sin(angle) * r;
                // 不在障碍物上
                if (this._isObstacle(cx, cz, animal.type)) continue;
                // 不与已有动物重叠
                let overlap = false;
                for (const existing of this.animalMeshes) {
                    const er = _animalRadiusInit[existing.userData.animalType] || 0.6;
                    const minD = myRadius + er + 0.3; // 额外0.3间距
                    const dx = cx - existing.position.x;
                    const dz = cz - existing.position.z;
                    if (dx * dx + dz * dz < minD * minD) { overlap = true; break; }
                }
                if (!overlap) { initX = cx; initZ = cz; placed = true; break outer; }
            }
        }
        // 兜底：随机位置（极少情况）
        if (!placed) {
            initX = (Math.random() - 0.5) * 16;
            initZ = (Math.random() - 0.5) * 16;
        }
        group.position.set(initX, 0, initZ);


        group.userData = { animalId: animal.id, type: 'animal' };

        // 根据动物类型构建对应模型
        switch (animal.type) {
            case 'chicken': this._buildChicken(group, animalData.color); break;
            case 'duck':    this._buildDuck(group, animalData.color);    break;
            case 'sheep':   this._buildSheep(group, animalData.color);   break;
            case 'cow':     this._buildCow(group, animalData.color);     break;
            case 'pig':     this._buildPig(group, animalData.color);     break;
            default:        this._buildChicken(group, animalData.color); break;
        }


        // 产出标记
        if (animal.hasProduct) {
            const markerGeo = new THREE.SphereGeometry(0.2, 8, 8);
            const markerMat = MatFactory.emissive(0xffd700, 0.6);
            const marker = new THREE.Mesh(markerGeo, markerMat);
            // 根据动物大小调整标记高度
            const heights = { chicken: 1.2, duck: 1.1, sheep: 1.8, cow: 1.1, pig: 1.6 };

            marker.position.y = heights[animal.type] || 1.8;

            marker.userData = { isProductMarker: true };
            group.add(marker);
        }

        // ===== 行为状态机初始化 =====
        const speeds = { chicken: 2.0, duck: 1.8, sheep: 1.5, cow: 1.0, pig: 1.2 };
        const stepFreqs = { chicken: 4.0, duck: 3.5, sheep: 2.0, cow: 1.5, pig: 2.5 };


        group.userData.animalType = animal.type;
        group.userData.animPhase = Math.random() * Math.PI * 2;
        group.userData.walkSpeed = speeds[animal.type] || 1.5;
        group.userData.stepFreq = stepFreqs[animal.type] || 2.0;

        // 行为状态
        group.userData.state = 'wandering';   // idle / wandering / foraging / resting / social
        group.userData.stateTimer = 5 + Math.random() * 10;
        group.userData.restTimer = 0;

        // 移动目标
        group.userData.targetX = group.position.x;
        group.userData.targetZ = group.position.z;
        // 初始moveTimer随机错开（0.5~3秒），避免所有动物同帧寻路触发碰撞
        group.userData.moveTimer = 0.5 + Math.random() * 2.5;
        group.userData.blockedCooldown = 0; // 碰撞冷却计时器


        // 朝向
        group.userData.facingAngle = Math.random() * Math.PI * 2;

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

    /**
     * 检测坐标 (x, z) 是否落在种植地块范围内
     * 地块中心：[-5,-5],[0,-5],[5,-5],[-5,0],[0,0],[5,0],[-5,5],[0,5],[5,5]
     * 每块大小 3.5x3.5，加 0.3 安全边距
     */
    _isOnFarmPlot(x, z) {
        const plotPositions = [
            [-5, -5], [0, -5], [5, -5],
            [-5,  0], [0,  0], [5,  0],
            [-5,  5], [0,  5], [5,  5]
        ];

        const halfSize = 1.5 + 0.65; // 地块半宽(3.0/2=1.5) + 安全边距（覆盖最大动物半径）


        for (const [px, pz] of plotPositions) {
            if (Math.abs(x - px) < halfSize && Math.abs(z - pz) < halfSize) {
                return true;
            }
        }
        return false;
    },

    /**
     * 检测坐标是否为障碍区域（地块 + 池塘）
     * animalType: 鸭子不受池塘限制
     */
    _isObstacle(x, z, animalType) {
        if (this._isOnFarmPlot(x, z)) return true;
        // 鸭子可以进入池塘
        if (animalType === 'duck') return false;
        // 其他动物检测池塘（含缓冲区）
        if (typeof PondSystem !== 'undefined' && PondSystem.isInPond(x, z, POND_BUFFER)) return true;
        return false;
    },


    // 更新动物产出标记

    updateAnimalProductMarker(animalId, hasProduct) {
        const mesh = this.animalMeshes.find(m => m.userData.animalId === animalId);
        if (!mesh) return;

        const existing = mesh.children.find(c => c.userData.isProductMarker);
        if (hasProduct && !existing) {
            const markerGeo = new THREE.SphereGeometry(0.2, 8, 8);
            const markerMat = MatFactory.emissive(0xffd700, 0.6);
            const marker = new THREE.Mesh(markerGeo, markerMat);
            const heights = { chicken: 1.2, duck: 1.1, sheep: 1.8, cow: 1.1, pig: 1.6 };
            marker.position.y = heights[mesh.userData.animalType] || 1.8;

            marker.userData = { isProductMarker: true };
            mesh.add(marker);
        } else if (!hasProduct && existing) {
            mesh.remove(existing);
        }
    },

    
    // 共享粒子几何体（避免每次收获/浇水都new）
    _particleGeo: null,
    _getParticleGeo() {
        if (!this._particleGeo) this._particleGeo = new THREE.SphereGeometry(0.08, 4, 4);
        return this._particleGeo;
    },

    // 创建收获粒子特效（共享geometry，减少GC）
    createHarvestEffect(plotId, color) {
        const plot = this.plotMeshes[plotId];
        if (!plot) return;
        
        const geo = this._getParticleGeo();
        for (let i = 0; i < 10; i++) { // 15→10个粒子
            const mat = new THREE.MeshStandardMaterial({ color: color || 0xffd700, roughness: 0.4, metalness: 0.3 });
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
    
    // 创建浇水特效（共享geometry）
    createWaterEffect(plotId) {
        const plot = this.plotMeshes[plotId];
        if (!plot) return;
        
        // 土地颜色变深（湿润效果）
        if (typeof SceneBeautify !== 'undefined') {
            SceneBeautify.updatePlotWater(plot, true);
            // 30秒后渐变恢复干燥
            plot.userData.waterTimer = 30;
        }
        
        const geo = this._getParticleGeo();
        for (let i = 0; i < 6; i++) { // 8→6个水滴
            const mat = new THREE.MeshStandardMaterial({ color: 0x4488ff, transparent: true, opacity: 0.8, roughness: 0.2, metalness: 0.0 });
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
        
        // 检测钓鱼点点击
        if (typeof PondSystem !== 'undefined') {
            if (PondSystem.checkFishingSpotClick(raycaster)) return;
        }

        // 检测动物点击（递归检测所有子mesh，因为动物模型是多层Group结构）
        const animalIntersects = raycaster.intersectObjects(this.animalMeshes, true);
        if (animalIntersects.length > 0) {
            // 向上找到 animalMeshes 中的顶层 Group
            let obj = animalIntersects[0].object;
            while (obj.parent && !this.animalMeshes.includes(obj)) {
                obj = obj.parent;
            }
            const animalId = obj.userData.animalId;
            if (animalId !== undefined) {
                onAnimalClick(animalId, e.clientX, e.clientY);
                return;
            }
        }

        // 检测扭蛋机点击
        if (typeof GachaSystem !== 'undefined' && GachaSystem.machine) {
            const gachaHits = raycaster.intersectObjects(GachaSystem.machine.children, true);
            if (gachaHits.length > 0) {
                GachaSystem.onMachineClick();
                return;
            }
        }


        
        // 检测湖面点击，生成涟漪
        if (typeof PondSystem !== 'undefined' && PondSystem.pondMesh) {
            const pondHits = raycaster.intersectObject(PondSystem.pondMesh);
            if (pondHits.length > 0) {
                const pt = pondHits[0].point;
                PondSystem.createRipple(pt.x, pt.z);
                return;
            }
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
        // 帧计数器（用于碰撞检测降频）
        this._frameCount = (this._frameCount || 0) + 1;
        
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
        
        // 氛围粒子动画（蝴蝶/蜜蜂/花瓣）
        if (typeof SceneBeautify !== 'undefined') {
            SceneBeautify.updateParticles(deltaTime, time);
        }

        // 池塘系统更新（涥漪/鱼影/蚕蚀/青蛙）
        if (typeof PondSystem !== 'undefined') {
            PondSystem.update(deltaTime);
        }

        // 扭蛋机待机动画
        if (typeof GachaSystem !== 'undefined') {
            GachaSystem.update(deltaTime);
        }

        // 作物动画：随风摇摆 + 成熟跳动
        this.cropMeshes.forEach((mesh, i) => {

            if (!mesh) return;
            // 随风摇摆
            if (typeof PlantAnimator !== 'undefined' && mesh.userData.cropId) {
                PlantAnimator.updateSway(mesh, mesh.userData.cropId, time);
            }
            // 成熟跳动
            if (mesh.userData.bouncing) {
                mesh.userData.bounceTime += deltaTime * 2;
                mesh.position.y = 0.3 + Math.sin(mesh.userData.bounceTime) * 0.05;
            }
        });

        
        // 动物行为状态机 + 四肢动画
        this.animalMeshes.forEach(mesh => {
            const ud = mesh.userData;
            if (!ud.animalType) return;

            const parts = ud.parts || {};

            // ---- 行为状态机 ----
            ud.stateTimer -= deltaTime;
            ud.moveTimer -= deltaTime;
            if (ud.blockedCooldown > 0) ud.blockedCooldown -= deltaTime;


            if (ud.stateTimer <= 0) {
                // 随机切换行为意图
                const roll = Math.random();
                const weights = {
                    chicken: { foraging: 0.35, wandering: 0.35, resting: 0.15, social: 0.15 },
                    duck:    { foraging: 0.35, wandering: 0.35, resting: 0.15, social: 0.15 },
                    sheep:   { foraging: 0.40, wandering: 0.25, resting: 0.20, social: 0.15 },
                    cow:     { foraging: 0.45, wandering: 0.20, resting: 0.25, social: 0.10 },
                    pig:     { foraging: 0.40, wandering: 0.30, resting: 0.15, social: 0.15 }
                };
                const w = weights[ud.animalType] || weights.chicken;

                if (roll < w.resting) {
                    ud.state = 'resting';
                    ud.stateTimer = 8 + Math.random() * 15;
                } else if (roll < w.resting + w.foraging) {
                    ud.state = 'foraging';
                    ud.stateTimer = 10 + Math.random() * 20;
                } else if (roll < w.resting + w.foraging + w.social) {
                    ud.state = 'social';
                    ud.stateTimer = 6 + Math.random() * 10;
                } else {
                    ud.state = 'wandering';
                    ud.stateTimer = 8 + Math.random() * 15;
                }
            }

            // ---- 移动目标更新 ----
            const isMoving = (ud.state !== 'resting');
            if (isMoving && ud.moveTimer <= 0) {
                // 根据行为选择移动模式
                let newX, newZ;
                if (ud.state === 'foraging') {
                    // 之字形觅食：小幅随机偏移
                    newX = mesh.position.x + (Math.random() - 0.5) * 4;
                    newZ = mesh.position.z + (Math.random() - 0.5) * 4;
                } else if (ud.state === 'social') {
                    // 向附近同类靠近
                    const sameKind = this.animalMeshes.filter(m => m !== mesh && m.userData.animalType === ud.animalType);
                    if (sameKind.length > 0) {
                        const target = sameKind[Math.floor(Math.random() * sameKind.length)];
                        newX = target.position.x + (Math.random() - 0.5) * 2;
                        newZ = target.position.z + (Math.random() - 0.5) * 2;
                    } else {
                        newX = mesh.position.x + (Math.random() - 0.5) * 5;
                        newZ = mesh.position.z + (Math.random() - 0.5) * 5;
                    }
                } else {
                    // 随机漫步：较大范围
                    newX = (Math.random() - 0.5) * 18;
                    newZ = (Math.random() - 0.5) * 18;
                }
                // 限制在围栏内
                newX = Math.max(-10, Math.min(10, newX));
                newZ = Math.max(-10, Math.min(10, newZ));
                // 鸭子特殊寻路：优先在池塘内游泳
                if (ud.animalType === 'duck' && typeof PondSystem !== 'undefined') {
                    const inPond = PondSystem.isInPond(mesh.position.x, mesh.position.z);
                    // 60%概率在池塘内巡游（若已在水中）
                    if (inPond && Math.random() < 0.6) {
                        const pt = PondSystem.randomPointInPond();
                        newX = pt.x; newZ = pt.z;
                    }
                    // 30%概率从陆地游向池塘
                    else if (!inPond && Math.random() < 0.3) {
                        const pt = PondSystem.randomPointInPond();
                        newX = pt.x; newZ = pt.z;
                    }
                }

                // 避开障碍物（地块 + 池塘）：若目标落在障碍上则重新采样（最多10次）
                for (let attempt = 0; attempt < 10; attempt++) {
                    if (!this._isObstacle(newX, newZ, ud.animalType)) break;
                    // 全局随机重采样，确保能找到安全位置
                    newX = (Math.random() - 0.5) * 18;
                    newZ = (Math.random() - 0.5) * 18;
                    newX = Math.max(-10, Math.min(10, newX));
                    newZ = Math.max(-10, Math.min(10, newZ));
                }
                // 最终兜底：若仍在障碍上，强制移到当前位置（原地等待）
                if (this._isObstacle(newX, newZ, ud.animalType)) {
                    newX = mesh.position.x;
                    newZ = mesh.position.z;
                }

                ud.targetX = newX;
                ud.targetZ = newZ;

                ud.moveTimer = 2 + Math.random() * 4;
            }

            // ---- 移动执行 ----
            let actualSpeed = 0;
            if (isMoving) {
                const dx = ud.targetX - mesh.position.x;
                const dz = ud.targetZ - mesh.position.z;
                const dist = Math.sqrt(dx * dx + dz * dz);

                if (dist > 0.15) {
                    // 速度：觅食时慢，漫步时正常
                    const speedMult = ud.state === 'foraging' ? 0.6 : 1.0;
                    actualSpeed = ud.walkSpeed * speedMult * 0.5;
                    const moveX = (dx / dist) * actualSpeed * deltaTime;
                    const moveZ = (dz / dist) * actualSpeed * deltaTime;
                    let nextX = mesh.position.x + moveX;
                    let nextZ = mesh.position.z + moveZ;

                    // 若下一步踩入障碍（地块/池塘），则停止并重置目标
                    if (this._isObstacle(nextX, nextZ, ud.animalType)) {
                        ud.targetX = mesh.position.x;
                        ud.targetZ = mesh.position.z;
                        ud.moveTimer = 1 + Math.random() * 2;
                        actualSpeed = 0;
                    } else {
                        const wasInPond = typeof PondSystem !== 'undefined' && PondSystem.isInPond(mesh.position.x, mesh.position.z);
                        const willInPond = typeof PondSystem !== 'undefined' && PondSystem.isInPond(nextX, nextZ);

                        mesh.position.x = nextX;
                        mesh.position.z = nextZ;

                        // 鸭子入水/出水处理
                        if (ud.animalType === 'duck' && typeof PondSystem !== 'undefined') {
                            if (!wasInPond && willInPond) {
                                // 入水：产生涟漪，身体下沉
                                PondSystem.createRipple(nextX, nextZ);
                                ud.isSwimming = true;
                                if (ud.parts && ud.parts.body) {
                                    ud.parts.body.position.y = 0.08; // 下沉至水线
                                }
                                if (ud.parts && ud.parts.leftLeg) ud.parts.leftLeg.visible = false;
                                if (ud.parts && ud.parts.rightLeg) ud.parts.rightLeg.visible = false;
                            } else if (wasInPond && !willInPond) {
                                // 出水：甩水效果，身体恢复
                                ud.isSwimming = false;
                                ud.shakeTimer = 1.0; // 甩水计时
                                if (ud.parts && ud.parts.body) {
                                    ud.parts.body.position.y = ud.baseBodyY || 0.26;
                                }
                                if (ud.parts && ud.parts.leftLeg) ud.parts.leftLeg.visible = true;
                                if (ud.parts && ud.parts.rightLeg) ud.parts.rightLeg.visible = true;
                            } else if (willInPond && actualSpeed > 0.01) {
                                // 游泳中：产生划水尾波
                                ud.wakeTimer = (ud.wakeTimer || 0) - deltaTime;
                                if (ud.wakeTimer <= 0) {
                                    PondSystem.createDuckWake(nextX, nextZ, ud.facingAngle);
                                    ud.wakeTimer = 0.3;
                                }
                            }
                        }

                        // 平滑转向
                        const targetAngle = Math.atan2(dx, dz);
                        let angleDiff = targetAngle - ud.facingAngle;
                        while (angleDiff > Math.PI) angleDiff -= Math.PI * 2;
                        while (angleDiff < -Math.PI) angleDiff += Math.PI * 2;
                        ud.facingAngle += angleDiff * Math.min(1, deltaTime * 5);
                        mesh.rotation.y = ud.facingAngle;
                    }

                }
            }

            // ---- 四肢动画 ----
            // resting状态下animPhase不累积，避免idle时四肢持续微动（抽搐）
            if (ud.state !== 'resting') {
                ud.animPhase += deltaTime * ud.stepFreq * (actualSpeed > 0 ? 1 : 0.05);
            }


            const phase = ud.animPhase;
            const isWalking = actualSpeed > 0.05;

            if (ud.animalType === 'chicken') {
                // 鸡：高频小碎步 + 头部前后点动
                const legSwing = isWalking ? Math.sin(phase * Math.PI * 2) * 0.7 : 0;
                if (parts.leftLeg) parts.leftLeg.rotation.x = legSwing;
                if (parts.rightLeg) parts.rightLeg.rotation.x = -legSwing;
                // 头部点动（鸡的标志性动作）
                if (parts.headGroup) {
                    const bob = isWalking
                        ? Math.sin((phase + 0.5) * Math.PI * 2) * 0.06
                        : 0;
                    parts.headGroup.position.z = ud.baseHeadPos.z + bob;
                    // 觅食时低头啄地
                    if (ud.state === 'foraging') {
                        parts.headGroup.rotation.x = 0.3 + Math.abs(Math.sin(phase * Math.PI * 3)) * 0.3;
                    } else {
                        parts.headGroup.rotation.x = 0;
                    }
                }
                // 身体微微上下起伏
                if (parts.body) {
                    parts.body.position.y = ud.baseBodyY + (isWalking ? Math.abs(Math.sin(phase * Math.PI * 4)) * 0.03 : 0);
                }

            } else if (ud.animalType === 'duck') {
                // 鸭子：游泳模式 vs 陆地模式
                if (ud.isSwimming) {
                    // 游泳动画：身体前后点头，尾羽左右摆
                    if (parts.body) {
                        parts.body.position.y = 0.08 + Math.sin(phase * Math.PI * 4) * 0.015;
                        parts.body.rotation.z = Math.sin(phase * Math.PI * 2) * 0.05;
                    }
                    if (parts.headGroup) {
                        parts.headGroup.position.z = ud.baseHeadPos.z + Math.sin(phase * Math.PI * 4) * 0.03;
                        parts.headGroup.rotation.x = 0;
                    }
                    if (parts.tail) {
                        parts.tail.rotation.y = Math.sin(phase * Math.PI * 4) * 0.2;
                    }
                    // 游泳速度稍慢
                    ud.walkSpeed = 1.2;
                } else {
                    // 甩水动画
                    if (ud.shakeTimer > 0) {
                        ud.shakeTimer -= deltaTime;
                        if (parts.body) {
                            parts.body.rotation.z = Math.sin(ud.shakeTimer * 20) * 0.25 * (ud.shakeTimer / 1.0);
                        }
                    } else {
                        // 陆地行走动画
                        const legSwing = isWalking ? Math.sin(phase * Math.PI * 2) * 0.6 : 0;
                        if (parts.leftLeg)  parts.leftLeg.rotation.x  = legSwing;
                        if (parts.rightLeg) parts.rightLeg.rotation.x = -legSwing;
                        if (parts.body && isWalking) {
                            parts.body.rotation.z = Math.sin(phase * Math.PI * 2) * 0.1;
                        }
                        if (parts.body) {
                            parts.body.position.y = ud.baseBodyY || 0.26;
                        }
                        ud.walkSpeed = 1.8;
                    }
                    // 头部点动
                    if (parts.headGroup) {
                        const bob = isWalking ? Math.sin((phase + 0.5) * Math.PI * 2) * 0.05 : 0;
                        parts.headGroup.position.z = ud.baseHeadPos.z + bob;
                        parts.headGroup.rotation.x = ud.state === 'foraging' ? 0.25 : 0;
                    }
                    // 尾羽随步伐轻微抖动
                    if (parts.tail && isWalking) {
                        parts.tail.rotation.y = Math.sin(phase * Math.PI * 4) * 0.15;
                    }
                }


            } else if (ud.animalType === 'sheep') {

                // 羊：四足对角步态
                const legSwingRad = isWalking ? 0.45 : 0;
                const d1 = Math.sin(phase * Math.PI * 2) * legSwingRad;
                const d2 = Math.sin((phase + 0.5) * Math.PI * 2) * legSwingRad;
                if (parts.frontLeft)  parts.frontLeft.rotation.x  = d1;
                if (parts.backRight)  parts.backRight.rotation.x  = d1 * 0.8;
                if (parts.frontRight) parts.frontRight.rotation.x = d2;
                if (parts.backLeft)   parts.backLeft.rotation.x   = d2 * 0.8;
                // 羊毛弹动
                if (parts.woolGroup && isWalking) {
                    const bounce = 1 + Math.abs(Math.sin(phase * Math.PI * 4)) * 0.04;
                    parts.woolGroup.scale.set(bounce, bounce, bounce);
                }
                // 尾巴左右摆动
                if (parts.tail) {
                    parts.tail.rotation.y = Math.sin(phase * Math.PI * 4) * 0.18;
                }
                // 吃草时低头
                if (parts.headGroup) {
                    parts.headGroup.rotation.x = ud.state === 'foraging' ? 0.5 : 0;
                }

            } else if (ud.animalType === 'cow') {
                // 牛：沉稳四足对角步态
                const legSwingRad = isWalking ? 0.35 : 0;
                const fp = Math.sin(phase * Math.PI * 2) * legSwingRad;
                const bp = Math.sin((phase + 0.5) * Math.PI * 2) * legSwingRad; // 对角步态偏移0.5
                if (parts.frontLeft)  parts.frontLeft.rotation.x  = fp;
                if (parts.frontRight) parts.frontRight.rotation.x = -fp;
                if (parts.backLeft)   parts.backLeft.rotation.x   = -fp; // 对角同步
                if (parts.backRight)  parts.backRight.rotation.x  = fp;
                // 身体轻微侧倾（用rotation.z，不改变position，避免头身分离）
                if (parts.body && isWalking) {
                    parts.body.rotation.z = Math.sin(phase * Math.PI * 2) * 0.04;
                }
                // 尾巴自然摆动
                if (parts.tail) {
                    parts.tail.rotation.y = Math.sin(phase * Math.PI * 3) * 0.25;
                }
                // 偶尔耳朵扇动（通过头部轻微晃动模拟）
                if (parts.headGroup && Math.random() < 0.002) {
                    parts.headGroup.rotation.z = (Math.random() - 0.5) * 0.15;
                    setTimeout(() => { if (parts.headGroup) parts.headGroup.rotation.z = 0; }, 300);
                }


            } else if (ud.animalType === 'pig') {
                // 猪：短腿快速 + 身体左右摇摆
                const legSwingRad = isWalking ? 0.55 : 0;
                const lp = Math.sin(phase * Math.PI * 2) * legSwingRad;
                if (parts.frontLeft)  parts.frontLeft.rotation.x  = lp;
                if (parts.frontRight) parts.frontRight.rotation.x = -lp;
                if (parts.backLeft)   parts.backLeft.rotation.x   = -lp * 0.9;
                if (parts.backRight)  parts.backRight.rotation.x  = lp * 0.9;
                // 身体明显左右摇摆（猪的特征）
                if (parts.body && isWalking) {
                    parts.body.rotation.z = Math.sin(phase * Math.PI * 2) * 0.08;
                }
                // 鼻子上下嗅动
                if (parts.snout && ud.baseSnoutPos) {
                    parts.snout.position.y = ud.baseSnoutPos.y + Math.sin(phase * Math.PI * 6) * 0.025;
                }
                // 卷尾轻微晃动
                if (parts.tail) {
                    parts.tail.rotation.y = Math.sin(phase * Math.PI * 4) * 0.3;
                }
                // 拱地时鼻子贴地
                if (parts.headGroup) {
                    parts.headGroup.rotation.x = ud.state === 'foraging' ? 0.35 : 0;
                }
            }
        });

        // ---- 动物间碰撞检测（每8帧执行一次，降低CPU开销）----
        if (this._frameCount % 8 === 0) {
        const _animalRadius = { chicken: 0.5, duck: 0.5, sheep: 0.8, cow: 1.0, pig: 0.8 };
        const _meshes = this.animalMeshes;
        // 先收集本帧需要停止的动物
        const _blockedSet = new Set();
        for (let ai = 0; ai < _meshes.length; ai++) {
            const ma = _meshes[ai];
            const ra = _animalRadius[ma.userData.animalType] || 0.6;
            for (let bi = ai + 1; bi < _meshes.length; bi++) {
                const mb = _meshes[bi];
                const rb = _animalRadius[mb.userData.animalType] || 0.6;
                const minDist = ra + rb;
                const sepX = ma.position.x - mb.position.x;
                const sepZ = ma.position.z - mb.position.z;
                const sepDistSq = sepX * sepX + sepZ * sepZ;
                if (sepDistSq < minDist * minDist) {
                    // 两只动物重叠：都停止当前移动行为，切换为idle等待
                    _blockedSet.add(ai);
                    _blockedSet.add(bi);
                }
            }
        }
        // 对被阻挡的动物：扫描周围方向，找到空旷方向立即移动，解决聚集卡死问题
        _blockedSet.forEach(idx => {
            const mesh = _meshes[idx];
            const ud = mesh.userData;
            if (ud.state === 'resting') return;

            // 只在冷却结束后才重新寻路，避免每帧反复触发
            ud.blockedCooldown = (ud.blockedCooldown || 0);
            if (ud.blockedCooldown > 0) return;

            const ra = _animalRadius[ud.animalType] || 0.6;
            const cx = mesh.position.x;
            const cz = mesh.position.z;

            // 扫描8个方向，统计每个方向的阻挡数量
            const DIRS = 8;
            const PROBE_DIST = (ra + 1.2); // 探测距离：自身半径 + 1.2
            const dirBlocked = new Array(DIRS).fill(0);

            for (let bi = 0; bi < _meshes.length; bi++) {
                if (bi === idx) continue;
                const mb = _meshes[bi];
                const rb = _animalRadius[mb.userData.animalType] || 0.6;
                const bx = mb.position.x - cx;
                const bz = mb.position.z - cz;
                const distSq = bx * bx + bz * bz;
                const checkDist = ra + rb + 1.5;
                if (distSq > checkDist * checkDist) continue; // 太远，不影响

                // 计算这只动物在哪些方向上造成阻挡
                const angle = Math.atan2(bz, bx); // -π ~ π
                for (let d = 0; d < DIRS; d++) {
                    const dirAngle = (d / DIRS) * Math.PI * 2;
                    let diff = Math.abs(angle - dirAngle);
                    if (diff > Math.PI) diff = Math.PI * 2 - diff;
                    if (diff < Math.PI * 0.4) { // 约72度范围内算阻挡
                        dirBlocked[d]++;
                    }
                }
            }

            // 找阻挡最少的方向（优先完全空旷的方向）
            let bestDir = -1;
            let minBlocked = Infinity;
            // 加入随机偏移避免所有动物选同一方向
            const startD = Math.floor(Math.random() * DIRS);
            for (let d = 0; d < DIRS; d++) {
                const dd = (d + startD) % DIRS;
                if (dirBlocked[dd] < minBlocked) {
                    minBlocked = dirBlocked[dd];
                    bestDir = dd;
                }
            }

            if (bestDir >= 0 && minBlocked < 3) {
                // 找到相对空旷的方向，立即朝该方向移动
                const escapeAngle = (bestDir / DIRS) * Math.PI * 2;
                const escapeDist = 2.5 + Math.random() * 2.0; // 逃离距离
                let newX = cx + Math.cos(escapeAngle) * escapeDist;
                let newZ = cz + Math.sin(escapeAngle) * escapeDist;
                // 限制在围栏内
                newX = Math.max(-10, Math.min(10, newX));
                newZ = Math.max(-10, Math.min(10, newZ));
                // 确保目标不在障碍物上
                if (!this._isObstacle(newX, newZ, ud.animalType)) {
                    ud.targetX = newX;
                    ud.targetZ = newZ;
                    ud.moveTimer = 0; // 立即开始移动
                    ud.blockedCooldown = 1.0 + Math.random() * 0.5;
                } else {
                    // 目标在障碍上，原地短暂等待
                    ud.targetX = cx;
                    ud.targetZ = cz;
                    ud.moveTimer = 0.5 + Math.random() * 0.5;
                    ud.blockedCooldown = ud.moveTimer;
                }
            } else {
                // 四面都被堵死（极少情况），短暂等待后重试
                ud.targetX = cx;
                ud.targetZ = cz;
                ud.moveTimer = 0.3 + Math.random() * 0.3;
                ud.blockedCooldown = ud.moveTimer;
            }
        });
        } // 碰撞检测降频 end




        // 浇水土地颜色渐变恢复

        if (typeof SceneBeautify !== 'undefined') {
            this.plotMeshes.forEach(plot => {
                if (plot.userData.waterTimer > 0) {
                    plot.userData.waterTimer -= deltaTime;
                    if (plot.userData.waterTimer <= 0) {
                        SceneBeautify.updatePlotWater(plot, false);
                    }
                }
            });
        }

        // 粒子更新（直接修改position，避免velocity.clone()每帧创建Vector3）
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const p = this.particles[i];
            const vel = p.userData.velocity;
            p.userData.life -= deltaTime * 1.5;
            p.position.x += vel.x * deltaTime;
            p.position.y += vel.y * deltaTime;
            p.position.z += vel.z * deltaTime;
            vel.y -= 5 * deltaTime;
            p.material.opacity = p.userData.life;
            if (p.userData.life <= 0) {
                this.scene.remove(p);
                // dispose material释放GPU内存（geometry为共享，不dispose）
                if (p.material) p.material.dispose();
                this.particles.splice(i, 1);
            }
        }

        
        // 太阳光角度（昼夜变化）
        const hour = typeof GameState !== 'undefined' ? GameState.gameTime.hour : 12;
        const sunAngle = (hour / 24) * Math.PI * 2 - Math.PI / 2;
        this.sunLight.position.set(
            Math.cos(sunAngle) * 30,
            Math.abs(Math.sin(sunAngle)) * 30 + 5,
            Math.sin(sunAngle) * 20
        );
        const skyBrightness = Math.max(0.15, Math.abs(Math.sin(sunAngle)));

        // 夜间点光源更新（灯笼/窗户/信号灯）
        this._updateNightLights(hour, time);

        // 天气视觉系统更新（昼夜光影 + 雨雪粒子）
        if (typeof WeatherSystem !== 'undefined') {
            WeatherSystem.update(deltaTime, time);
            WeatherSystem.updateDayNight(this, hour, skyBrightness);
        } else {
            // 降级：原始天空颜色变化
            this.scene.background = new THREE.Color(
                0.53 * skyBrightness,
                0.81 * skyBrightness,
                0.98 * skyBrightness
            );
            this.ambientLight.intensity = 0.2 + skyBrightness * 0.3;
        }


        // 天地融合动画更新（雾色同步、云朵飘移、飞鸟飞行）
        if (typeof SceneHorizon !== 'undefined') {
            SceneHorizon.update(this.scene, deltaTime, time, skyBrightness);
        }
    },

    
    // 渲染
    render() {
        this.renderer.render(this.scene, this.camera);
    }
};
