// ===== 3D农场 热带岛屿天地融合模块 =====
// 将农场变为一座热带小岛：草地→沙滩→海洋的自然过渡，波涛起伏的无边海洋

const SceneHorizon = {

    // 动态元素引用
    birds: [],           // 飞鸟群
    horizonClouds: [],   // 地平线云雾带
    oceanMesh: null,     // 海洋网格（动态波浪）
    foamRings: [],       // 浪花环
    palmTrees: [],       // 椰子树
    beachProps: [],      // 沙滩装饰物

    // 颜色配置
    colors: {
        day:     { sky: 0x55B0E8, fog: 0xC0E4FF, horizon: 0xD0F0FF },
        sunset:  { sky: 0xFF7043, fog: 0xFFB347, horizon: 0xFFCC80 },
        night:   { sky: 0x1A237E, fog: 0x2C3E50, horizon: 0x37474F },
    },

    // 岛屿参数
    ISLAND_RADIUS: 18,       // 草地岛屿半径（与围栏12对齐+缓冲）
    BEACH_WIDTH: 5,          // 沙滩宽度
    OCEAN_SIZE: 200,         // 海洋平面尺寸
    OCEAN_SEGMENTS: 80,      // 海洋细分数（波浪精度）

    // ===== 1. 初始化雾效 =====
    setupFog(scene) {
        // 海洋场景使用更柔和的蓝色雾
        scene.fog = new THREE.FogExp2(0xB0D8F0, 0.005);
    },

    updateFogColor(scene, skyBrightness) {
        if (!scene.fog) return;
        // 日间蓝调→夜间深蓝
        const r = 0.45 * skyBrightness + 0.08 * (1 - skyBrightness);
        const g = 0.72 * skyBrightness + 0.15 * (1 - skyBrightness);
        const b = 0.92 * skyBrightness + 0.30 * (1 - skyBrightness);
        scene.fog.color.setRGB(r, g, b);
    },

    // ===== 2. 岛屿地形（圆形草地+沙滩过渡+地形起伏） =====
    createIslandTerrain(scene) {
        const totalRadius = this.ISLAND_RADIUS + this.BEACH_WIDTH;
        const size = totalRadius * 2.5; // 略大于岛屿直径
        const segments = 60;
        const geo = new THREE.PlaneGeometry(size, size, segments, segments);
        const posAttr = geo.attributes.position;
        const colors = [];
        const halfSize = size / 2;

        // 草地颜色
        const grassColors = [
            new THREE.Color(0x48A828),
            new THREE.Color(0x2E7518),
            new THREE.Color(0x80C840),
            new THREE.Color(0x5A9030),
        ];
        // 沙滩颜色
        const sandColor = new THREE.Color(0xF0DCA0);
        const sandDarkColor = new THREE.Color(0xD4B878);
        const wetSandColor = new THREE.Color(0xC0A060);

        // Perlin-like 简单噪声（用多个sin叠加模拟起伏）
        const noise = (x, z) => {
            return Math.sin(x * 0.3) * Math.cos(z * 0.25) * 0.4
                 + Math.sin(x * 0.7 + z * 0.5) * 0.2
                 + Math.cos(x * 0.15 - z * 0.3) * 0.3;
        };

        for (let i = 0; i < posAttr.count; i++) {
            const x = posAttr.getX(i);
            const y = posAttr.getY(i);

            // 到中心的距离
            const dist = Math.sqrt(x * x + y * y);
            const normDist = dist / totalRadius; // 归一化（1.0 = 岛屿+沙滩边缘）

            // 岛屿区域划分
            const grassEnd = this.ISLAND_RADIUS / totalRadius;    // ~0.78
            const beachStart = grassEnd - 0.05;                    // 草地→沙滩过渡开始
            const beachEnd = 1.0;                                  // 沙滩结束

            let height = 0;
            let color;

            if (normDist < beachStart) {
                // === 纯草地区域 ===
                // 核心农田+动物区(距中心<10)几乎全平，仅外围有微弱起伏
                const distFromCenter = Math.sqrt(x * x + y * y);
                const coreRadius = 10; // 核心区域半径（农田+动物活动范围）
                const coreFlatFactor = distFromCenter < coreRadius 
                    ? Math.max(0, (distFromCenter - 7) / 3) // 7以内完全平，7-10渐变
                    : 1.0;
                const centerBump = Math.max(0, 1 - normDist / beachStart) * 0.15 * coreFlatFactor;
                height = centerBump + noise(x, y) * 0.15 * coreFlatFactor;

                // 草地顶点色
                const r = Math.random();
                if (r < 0.50) color = grassColors[0].clone();
                else if (r < 0.72) color = grassColors[1].clone();
                else if (r < 0.88) color = grassColors[2].clone();
                else color = grassColors[3].clone();

                // 微小抖动
                const jitter = (Math.random() - 0.5) * 0.05;
                color.r += jitter; color.g += jitter; color.b += jitter;

            } else if (normDist < beachEnd) {
                // === 沙滩区域（含草地→沙滩过渡） ===
                const beachFactor = (normDist - beachStart) / (beachEnd - beachStart);

                // 高度：从草地边缘缓降到海平面
                const grassEdgeHeight = noise(x, y) * 0.3;
                height = grassEdgeHeight * (1 - beachFactor) + (-0.1) * beachFactor;

                // 颜色：草地→沙滩渐变
                if (beachFactor < 0.15) {
                    // 草沙过渡
                    const t = beachFactor / 0.15;
                    const gc = grassColors[0];
                    color = new THREE.Color(
                        gc.r + (sandColor.r - gc.r) * t,
                        gc.g + (sandColor.g - gc.g) * t,
                        gc.b + (sandColor.b - gc.b) * t
                    );
                } else if (beachFactor < 0.85) {
                    // 干沙
                    const t = Math.random();
                    color = t > 0.6 ? sandColor.clone() : sandDarkColor.clone();
                    color.r += (Math.random() - 0.5) * 0.03;
                    color.g += (Math.random() - 0.5) * 0.03;
                } else {
                    // 湿沙（靠近水边）
                    const t = (beachFactor - 0.85) / 0.15;
                    color = sandDarkColor.clone().lerp(wetSandColor, t);
                }
            } else {
                // === 岛外（下沉到水面以下） ===
                const overFactor = (normDist - beachEnd);
                height = -0.1 - overFactor * overFactor * 8;
                color = wetSandColor.clone();
                color.multiplyScalar(0.7);
            }

            posAttr.setZ(i, height);
            colors.push(color.r, color.g, color.b);
        }

        geo.setAttribute('color', new THREE.BufferAttribute(new Float32Array(colors), 3));
        geo.computeVertexNormals();

        const mat = new THREE.MeshStandardMaterial({
            vertexColors: true,
            roughness: 0.85,
            metalness: 0.0,
            fog: true
        });
        const mesh = new THREE.Mesh(geo, mat);
        mesh.rotation.x = -Math.PI / 2;
        mesh.receiveShadow = true;
        mesh.position.y = 0;
        scene.add(mesh);

        this._islandMesh = mesh;
    },

    // ===== 3. 动态海洋 =====
    createOcean(scene) {
        const size = this.OCEAN_SIZE;
        const segments = this.OCEAN_SEGMENTS;
        const geo = new THREE.PlaneGeometry(size, size, segments, segments);

        // 存储初始位置用于波浪动画
        const posAttr = geo.attributes.position;
        this._oceanOrigY = new Float32Array(posAttr.count);
        for (let i = 0; i < posAttr.count; i++) {
            this._oceanOrigY[i] = posAttr.getZ(i);
        }

        // 海洋材质：半透明蓝绿色
        const mat = new THREE.MeshStandardMaterial({
            color: 0x1A8CAA,
            transparent: true,
            opacity: 0.85,
            roughness: 0.15,
            metalness: 0.1,
            fog: true,
            side: THREE.DoubleSide
        });

        this.oceanMesh = new THREE.Mesh(geo, mat);
        this.oceanMesh.rotation.x = -Math.PI / 2;
        this.oceanMesh.position.y = -0.25; // 海平面略低于沙滩
        this.oceanMesh.receiveShadow = true;
        scene.add(this.oceanMesh);

        // 海洋颜色渐变（近岸浅色→远处深色）
        this._applyOceanVertexColors(geo);
    },

    _applyOceanVertexColors(geo) {
        const posAttr = geo.attributes.position;
        const colors = [];
        const shallowColor = new THREE.Color(0x40C8D0); // 浅海
        const midColor = new THREE.Color(0x1A8CAA);      // 中海
        const deepColor = new THREE.Color(0x0A5E7A);     // 深海

        const islandR = this.ISLAND_RADIUS + this.BEACH_WIDTH;

        for (let i = 0; i < posAttr.count; i++) {
            const x = posAttr.getX(i);
            const y = posAttr.getY(i);
            const dist = Math.sqrt(x * x + y * y);

            let color;
            if (dist < islandR + 5) {
                // 近岸浅海
                const t = Math.max(0, (dist - islandR) / 5);
                color = shallowColor.clone().lerp(midColor, t);
            } else if (dist < islandR + 30) {
                // 中海
                const t = (dist - islandR - 5) / 25;
                color = midColor.clone().lerp(deepColor, t);
            } else {
                // 深海
                color = deepColor.clone();
            }

            // 微小抖动
            color.r += (Math.random() - 0.5) * 0.02;
            color.g += (Math.random() - 0.5) * 0.02;
            color.b += (Math.random() - 0.5) * 0.02;

            colors.push(color.r, color.g, color.b);
        }

        geo.setAttribute('color', new THREE.BufferAttribute(new Float32Array(colors), 3));
        this.oceanMesh.material.vertexColors = true;
        this.oceanMesh.material.needsUpdate = true;
    },

    // ===== 4. 浪花环（沙滩边缘泡沫） =====
    createFoamRings(scene) {
        this.foamRings = [];
        const islandR = this.ISLAND_RADIUS + this.BEACH_WIDTH;

        // 3层浪花环，半径递增
        [0.5, 2.5, 5.0].forEach((offset, idx) => {
            const radius = islandR + offset;
            const ringSegments = 96;
            const tubeRadius = 0.15 + idx * 0.1;

            const curve = new THREE.EllipseCurve(0, 0, radius, radius, 0, Math.PI * 2, false, 0);
            const points = curve.getPoints(ringSegments);
            const ringGeo = new THREE.BufferGeometry().setFromPoints(
                points.map(p => new THREE.Vector3(p.x, 0, p.y))
            );

            const ringMat = new THREE.LineBasicMaterial({
                color: 0xE8F8FF,
                transparent: true,
                opacity: 0.5 - idx * 0.12,
                fog: true
            });

            const ring = new THREE.Line(ringGeo, ringMat);
            ring.position.y = -0.15 + idx * 0.02;
            ring.userData = {
                baseRadius: radius,
                phase: idx * Math.PI * 0.6,
                speed: 0.8 + idx * 0.2,
                baseOpacity: 0.5 - idx * 0.12
            };
            scene.add(ring);
            this.foamRings.push(ring);
        });

        // 散碎浪花点（Points）
        this._createFoamParticles(scene, islandR);
    },

    _createFoamParticles(scene, islandR) {
        const count = 200;
        const positions = new Float32Array(count * 3);

        for (let i = 0; i < count; i++) {
            const angle = Math.random() * Math.PI * 2;
            const r = islandR + Math.random() * 6 - 0.5;
            positions[i * 3]     = Math.cos(angle) * r;
            positions[i * 3 + 1] = -0.1 + Math.random() * 0.1;
            positions[i * 3 + 2] = Math.sin(angle) * r;
        }

        const geo = new THREE.BufferGeometry();
        geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));

        const mat = new THREE.PointsMaterial({
            color: 0xF0FFFF,
            size: 0.3,
            transparent: true,
            opacity: 0.6,
            depthWrite: false,
            sizeAttenuation: true,
            fog: true
        });

        this._foamPoints = new THREE.Points(geo, mat);
        this._foamPositions = positions;
        this._foamCount = count;
        this._foamBaseR = islandR;
        scene.add(this._foamPoints);
    },

    // ===== 5. 椰子树 =====
    createPalmTrees(scene) {
        this.palmTrees = [];
        const islandR = this.ISLAND_RADIUS;
        const beachW = this.BEACH_WIDTH;

        // 在沙滩区域和岛屿边缘种植椰子树
        const treePositions = [];

        // 沙滩内圈（靠近草地边缘的椰子树）
        for (let i = 0; i < 10; i++) {
            const angle = (i / 10) * Math.PI * 2 + (Math.random() - 0.5) * 0.3;
            const r = islandR - 1 + Math.random() * (beachW - 1);
            treePositions.push({
                x: Math.cos(angle) * r,
                z: Math.sin(angle) * r,
                height: 3.5 + Math.random() * 2.5,
                lean: 0.15 + Math.random() * 0.25,
                leanAngle: angle + Math.PI * 0.3 + (Math.random() - 0.5) * 0.5
            });
        }

        // 沙滩外圈（近海的椰子树，稍矮）
        for (let i = 0; i < 6; i++) {
            const angle = (i / 6) * Math.PI * 2 + 0.4;
            const r = islandR + beachW * 0.6 + Math.random() * 1.5;
            treePositions.push({
                x: Math.cos(angle) * r,
                z: Math.sin(angle) * r,
                height: 2.5 + Math.random() * 2,
                lean: 0.2 + Math.random() * 0.3,
                leanAngle: angle + (Math.random() - 0.5) * 0.8
            });
        }

        treePositions.forEach(tp => {
            const palm = this._createPalmTree(tp.height, tp.lean, tp.leanAngle);
            palm.position.set(tp.x, 0, tp.z);
            scene.add(palm);
            this.palmTrees.push(palm);
        });
    },

    _createPalmTree(height, lean, leanAngle) {
        const group = new THREE.Group();

        // 树干（弯曲效果：多段拼接）
        const trunkSegments = 6;
        const segHeight = height / trunkSegments;
        const trunkMat = new THREE.MeshStandardMaterial({
            color: 0x8A6030,
            roughness: 0.8,
            metalness: 0.0
        });

        let prevPos = new THREE.Vector3(0, 0, 0);
        let cumLean = 0;

        for (let s = 0; s < trunkSegments; s++) {
            const t = (s + 0.5) / trunkSegments;
            cumLean += lean / trunkSegments;

            const bottomR = 0.18 - s * 0.015;
            const topR = Math.max(0.06, bottomR - 0.02);
            const segGeo = new THREE.CylinderGeometry(topR, bottomR, segHeight, 6);
            const seg = new THREE.Mesh(segGeo, trunkMat);

            // 每段偏移模拟弯曲
            const offsetX = Math.cos(leanAngle) * cumLean * segHeight;
            const offsetZ = Math.sin(leanAngle) * cumLean * segHeight;

            seg.position.set(
                prevPos.x + offsetX * 0.5,
                prevPos.y + segHeight * 0.5,
                prevPos.z + offsetZ * 0.5
            );

            // 轻微倾斜
            seg.rotation.z = Math.cos(leanAngle) * cumLean * 0.3;
            seg.rotation.x = -Math.sin(leanAngle) * cumLean * 0.3;

            seg.castShadow = true;
            group.add(seg);

            prevPos = new THREE.Vector3(
                prevPos.x + offsetX,
                prevPos.y + segHeight,
                prevPos.z + offsetZ
            );
        }

        // 树环纹理（每段一个深色环）
        for (let s = 0; s < trunkSegments - 1; s++) {
            const ringY = (s + 1) * segHeight;
            const ringGeo = new THREE.TorusGeometry(0.16 - s * 0.012, 0.015, 4, 8);
            const ringMat = new THREE.MeshStandardMaterial({
                color: 0x6A4820,
                roughness: 0.9,
                metalness: 0.0
            });
            const ring = new THREE.Mesh(ringGeo, ringMat);
            ring.position.set(
                Math.cos(leanAngle) * (s + 1) * lean / trunkSegments * segHeight * 0.5,
                ringY,
                Math.sin(leanAngle) * (s + 1) * lean / trunkSegments * segHeight * 0.5
            );
            ring.rotation.x = Math.PI / 2;
            group.add(ring);
        }

        // 椰子叶冠（6-8片大叶，向四周下垂）
        const leafMat = new THREE.MeshStandardMaterial({
            color: 0x30A028,
            roughness: 0.65,
            metalness: 0.0,
            side: THREE.DoubleSide
        });

        const leafCount = 6 + Math.floor(Math.random() * 3);
        const crownPos = prevPos.clone();

        for (let l = 0; l < leafCount; l++) {
            const leafAngle = (l / leafCount) * Math.PI * 2 + Math.random() * 0.3;
            const leafLen = 2.0 + Math.random() * 1.5;
            const leafW = 0.35 + Math.random() * 0.15;

            // 叶片形状（梭形，用BufferGeometry手动构建）
            const leafShape = new THREE.Shape();
            leafShape.moveTo(0, 0);
            leafShape.quadraticCurveTo(leafLen * 0.3, leafW * 0.5, leafLen * 0.6, leafW * 0.3);
            leafShape.lineTo(leafLen, 0);
            leafShape.quadraticCurveTo(leafLen * 0.6, -leafW * 0.3, leafLen * 0.3, -leafW * 0.5);
            leafShape.lineTo(0, 0);

            const leafGeo = new THREE.ShapeGeometry(leafShape, 4);
            const leaf = new THREE.Mesh(leafGeo, leafMat);

            leaf.position.copy(crownPos);
            // 绕Y轴旋转到对应角度
            leaf.rotation.y = leafAngle;
            // 向下弯曲（X轴旋转）
            leaf.rotation.x = -0.3 - Math.random() * 0.5;
            // 轻微Z轴旋转增加自然感
            leaf.rotation.z = (Math.random() - 0.5) * 0.2;

            leaf.castShadow = true;
            leaf.userData = {
                baseRotX: leaf.rotation.x,
                windPhase: Math.random() * Math.PI * 2,
                leafIndex: l
            };
            group.add(leaf);
        }

        // 椰子果（2-4个）
        const cocoCount = 2 + Math.floor(Math.random() * 3);
        const cocoMat = new THREE.MeshStandardMaterial({
            color: 0x60A030,
            roughness: 0.7,
            metalness: 0.0
        });

        for (let c = 0; c < cocoCount; c++) {
            const cocoAngle = Math.random() * Math.PI * 2;
            const cocoGeo = new THREE.SphereGeometry(0.12, 6, 5);
            const coco = new THREE.Mesh(cocoGeo, cocoMat);
            coco.position.set(
                crownPos.x + Math.cos(cocoAngle) * 0.25,
                crownPos.y - 0.3 - Math.random() * 0.2,
                crownPos.z + Math.sin(cocoAngle) * 0.25
            );
            coco.castShadow = true;
            group.add(coco);
        }

        return group;
    },

    // ===== 6. 沙滩装饰（贝壳、礁石、漂流木、海星） =====
    createBeachProps(scene) {
        this.beachProps = [];
        const islandR = this.ISLAND_RADIUS;
        const beachW = this.BEACH_WIDTH;

        // 礁石（沙滩外缘和近海）
        for (let i = 0; i < 12; i++) {
            const angle = Math.random() * Math.PI * 2;
            const r = islandR + beachW * 0.4 + Math.random() * beachW * 0.8;
            const rockSize = 0.3 + Math.random() * 0.6;

            const rockGeo = new THREE.DodecahedronGeometry(rockSize, 0);
            const rockMat = new THREE.MeshStandardMaterial({
                color: new THREE.Color(0x808080).lerp(new THREE.Color(0x606050), Math.random()),
                roughness: 0.9,
                metalness: 0.05
            });
            const rock = new THREE.Mesh(rockGeo, rockMat);
            rock.position.set(
                Math.cos(angle) * r,
                rockSize * 0.3 - 0.1,
                Math.sin(angle) * r
            );
            rock.rotation.set(Math.random(), Math.random(), Math.random());
            rock.scale.y = 0.5 + Math.random() * 0.3; // 扁平化
            rock.castShadow = true;
            rock.receiveShadow = true;
            scene.add(rock);
            this.beachProps.push(rock);
        }

        // 贝壳（小装饰）
        const shellMat = new THREE.MeshStandardMaterial({
            color: 0xF0C8B8,
            roughness: 0.5,
            metalness: 0.1
        });
        for (let i = 0; i < 15; i++) {
            const angle = Math.random() * Math.PI * 2;
            const r = islandR + Math.random() * beachW;

            const shellGeo = new THREE.SphereGeometry(0.06 + Math.random() * 0.05, 5, 4);
            const shell = new THREE.Mesh(shellGeo, shellMat);
            shell.position.set(
                Math.cos(angle) * r,
                0.02,
                Math.sin(angle) * r
            );
            shell.scale.y = 0.3;
            shell.rotation.y = Math.random() * Math.PI;
            scene.add(shell);
        }

        // 漂流木（2-3块）
        const dwMat = new THREE.MeshStandardMaterial({
            color: 0x9A8060,
            roughness: 0.85,
            metalness: 0.0
        });
        for (let i = 0; i < 3; i++) {
            const angle = Math.random() * Math.PI * 2;
            const r = islandR + beachW * 0.5 + Math.random() * 2;

            const dwGeo = new THREE.CylinderGeometry(0.05, 0.08, 1.5 + Math.random(), 5);
            const dw = new THREE.Mesh(dwGeo, dwMat);
            dw.position.set(
                Math.cos(angle) * r,
                0.04,
                Math.sin(angle) * r
            );
            dw.rotation.z = Math.PI / 2;
            dw.rotation.y = angle + Math.random();
            dw.castShadow = true;
            scene.add(dw);
        }

        // 海星（1-2个，鲜艳颜色）
        for (let i = 0; i < 2; i++) {
            const angle = Math.random() * Math.PI * 2;
            const r = islandR + beachW * 0.3 + Math.random() * 2;
            this._createStarfish(scene,
                Math.cos(angle) * r,
                Math.sin(angle) * r,
                i === 0 ? 0xE08870 : 0xD04028
            );
        }
    },

    _createStarfish(scene, x, z, color) {
        const group = new THREE.Group();
        const mat = new THREE.MeshStandardMaterial({
            color, roughness: 0.6, metalness: 0.0
        });

        // 5个臂
        for (let arm = 0; arm < 5; arm++) {
            const angle = (arm / 5) * Math.PI * 2;
            const armGeo = new THREE.ConeGeometry(0.06, 0.25, 4);
            const armMesh = new THREE.Mesh(armGeo, mat);
            armMesh.position.set(
                Math.cos(angle) * 0.1,
                0.02,
                Math.sin(angle) * 0.1
            );
            armMesh.rotation.z = -Math.PI / 2;
            armMesh.rotation.y = -angle;
            group.add(armMesh);
        }

        // 中心身体
        const bodyGeo = new THREE.SphereGeometry(0.07, 6, 4);
        const body = new THREE.Mesh(bodyGeo, mat);
        body.position.y = 0.02;
        body.scale.y = 0.3;
        group.add(body);

        group.position.set(x, 0.01, z);
        group.rotation.y = Math.random() * Math.PI;
        scene.add(group);
    },

    // ===== 7. 地平线云雾带 =====
    createHorizonClouds(scene) {
        this.horizonClouds = [];
        for (let i = 0; i < 8; i++) {
            const cloud = this._createHorizonCloud(scene, i);
            this.horizonClouds.push(cloud);
        }
    },

    _createHorizonCloud(scene, index) {
        const group = new THREE.Group();
        const angle = (index / 8) * Math.PI * 2;
        const r = 50 + Math.random() * 20;
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
            height: y
        };

        const cloudMat = new THREE.MeshStandardMaterial({
            color: 0xEEF5FF,
            transparent: true,
            opacity: 0.7,
            fog: true,
            roughness: 1.0, metalness: 0.0
        });
        const sizes = [3.5, 2.8, 2.2, 3.0, 2.5];
        const offsets = [[0,0,0],[3,-0.5,0],[-3,-0.5,0],[1.5,0.8,0],[-1.5,0.8,0]];
        sizes.forEach((s, i) => {
            const geo = new THREE.SphereGeometry(s, 7, 5);
            const mesh = new THREE.Mesh(geo, cloudMat);
            mesh.scale.y = 0.45;
            mesh.position.set(...offsets[i]);
            group.add(mesh);
        });

        scene.add(group);
        return group;
    },

    // ===== 8. 飞鸟群（海鸥） =====
    createBirds(scene) {
        this.birds = [];
        for (let flock = 0; flock < 2; flock++) {
            const flockGroup = new THREE.Group();
            const startAngle = Math.random() * Math.PI * 2;
            const r = 25 + Math.random() * 25;
            flockGroup.position.set(
                Math.cos(startAngle) * r,
                14 + Math.random() * 10,
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

            // 海鸥（白色身体）
            const birdMat = new THREE.MeshStandardMaterial({ color: 0xF8F8F0, roughness: 0.7, metalness: 0.0 });
            const wingMat = new THREE.MeshStandardMaterial({ color: 0xE8E8E0, roughness: 0.7, metalness: 0.0 });
            const birdPositions = [
                [0, 0, 0],
                [-1.2, -0.3, -1.0], [1.2, -0.3, -1.0],
                [-2.4, -0.6, -2.0], [2.4, -0.6, -2.0],
                [-3.6, -0.9, -3.0], [3.6, -0.9, -3.0],
            ];
            birdPositions.forEach(([bx, by, bz]) => {
                const bird = new THREE.Group();
                bird.position.set(bx, by, bz);

                const bodyGeo = new THREE.SphereGeometry(0.12, 5, 4);
                const body = new THREE.Mesh(bodyGeo, birdMat);
                body.scale.set(0.7, 0.6, 1.5);
                bird.add(body);

                [-1, 1].forEach(side => {
                    const wingGeo = new THREE.SphereGeometry(0.25, 5, 3);
                    const wing = new THREE.Mesh(wingGeo, wingMat);
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

    // ===== 9. 动画更新 =====
    update(scene, deltaTime, time, skyBrightness) {
        this.updateFogColor(scene, skyBrightness);

        // 海洋波浪动画
        this._updateOceanWaves(time);

        // 浪花环脉动
        this._updateFoamRings(time);

        // 浪花粒子
        this._updateFoamParticles(time);

        // 椰子树叶微风摆动
        this._updatePalmWind(time, deltaTime);

        // 云朵轨道运动
        this.horizonClouds.forEach(cloud => {
            const ud = cloud.userData;
            ud.orbitAngle += ud.orbitSpeed * deltaTime * 60;
            cloud.position.x = Math.cos(ud.orbitAngle) * ud.orbitRadius;
            cloud.position.z = Math.sin(ud.orbitAngle) * ud.orbitRadius;
            cloud.position.y = ud.height + Math.sin(time * 0.3 + ud.orbitAngle) * 1.5;
            cloud.rotation.y = ud.orbitAngle + Math.PI / 2;
        });

        // 飞鸟群
        this.birds.forEach(flock => {
            const ud = flock.userData;
            ud.orbitAngle += ud.orbitSpeed * deltaTime * 60;
            flock.position.x = Math.cos(ud.orbitAngle) * ud.orbitRadius;
            flock.position.z = Math.sin(ud.orbitAngle) * ud.orbitRadius;
            flock.position.y = ud.height + Math.sin(time * 0.5 + ud.orbitAngle) * 2;
            flock.rotation.y = -ud.orbitAngle + Math.PI / 2;

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

    _updateOceanWaves(time) {
        if (!this.oceanMesh) return;
        const posAttr = this.oceanMesh.geometry.attributes.position;
        const islandR = this.ISLAND_RADIUS + this.BEACH_WIDTH;

        for (let i = 0; i < posAttr.count; i++) {
            const x = posAttr.getX(i);
            const y = posAttr.getY(i);
            const dist = Math.sqrt(x * x + y * y);

            // 岛屿内部不做波浪
            if (dist < islandR - 2) {
                posAttr.setZ(i, -2); // 岛下方深压
                continue;
            }

            // 波浪：多层sin叠加
            const wave1 = Math.sin(x * 0.15 + time * 0.8) * 0.4;
            const wave2 = Math.sin(y * 0.2 - time * 0.6) * 0.3;
            const wave3 = Math.sin((x + y) * 0.1 + time * 1.2) * 0.15;
            const wave4 = Math.cos(x * 0.25 - y * 0.15 + time * 0.4) * 0.2;

            // 近岸波浪更小
            let waveScale = 1.0;
            if (dist < islandR + 5) {
                waveScale = Math.max(0, (dist - islandR + 2) / 7);
            }

            const totalWave = (wave1 + wave2 + wave3 + wave4) * waveScale;
            posAttr.setZ(i, this._oceanOrigY[i] + totalWave);
        }

        posAttr.needsUpdate = true;
        this.oceanMesh.geometry.computeVertexNormals();
    },

    _updateFoamRings(time) {
        this.foamRings.forEach(ring => {
            const ud = ring.userData;
            // 浪花脉动（半径伸缩模拟潮汐）
            const pulse = Math.sin(time * ud.speed + ud.phase) * 0.5;
            const scale = 1 + pulse * 0.03;
            ring.scale.set(scale, 1, scale);
            // 透明度脉动
            ring.material.opacity = ud.baseOpacity * (0.7 + Math.sin(time * ud.speed * 1.5 + ud.phase) * 0.3);
        });
    },

    _updateFoamParticles(time) {
        if (!this._foamPoints) return;
        const pos = this._foamPositions;
        const count = this._foamCount;
        const baseR = this._foamBaseR;

        for (let i = 0; i < count; i++) {
            const base = i * 3;
            const x = pos[base];
            const z = pos[base + 2];
            const angle = Math.atan2(z, x);
            const dist = Math.sqrt(x * x + z * z);

            // 径向呼吸运动
            const breath = Math.sin(time * 0.6 + angle * 2 + i * 0.1) * 0.8;
            const newR = baseR + breath + (i % 5) * 0.5;

            pos[base] = Math.cos(angle + time * 0.01) * newR;
            pos[base + 2] = Math.sin(angle + time * 0.01) * newR;
            pos[base + 1] = -0.1 + Math.sin(time + i) * 0.05;
        }
        this._foamPoints.geometry.attributes.position.needsUpdate = true;
    },

    _updatePalmWind(time, deltaTime) {
        this.palmTrees.forEach((palm, idx) => {
            // 树叶微风摆动
            palm.children.forEach(child => {
                if (child.userData && child.userData.leafIndex !== undefined) {
                    const phase = child.userData.windPhase;
                    const windSway = Math.sin(time * 1.5 + phase + idx) * 0.08;
                    child.rotation.x = child.userData.baseRotX + windSway;
                }
            });
        });
    },

    // ===== 10. 一键初始化 =====
    init(scene) {
        this.setupFog(scene);
        this.createIslandTerrain(scene);  // 岛屿地形（替换原下沉地形）
        this.createOcean(scene);           // 无边海洋
        this.createFoamRings(scene);       // 浪花环
        this.createPalmTrees(scene);       // 椰子树
        this.createBeachProps(scene);      // 沙滩装饰
        this.createHorizonClouds(scene);   // 云朵
        this.createBirds(scene);           // 海鸥
    }
};
