// ===== 田园时光 · 音乐音效系统 =====
// 100% Web Audio API 程序化合成 —— 无需外部音频文件

const AudioSystem = {

    // ── 核心引擎 ──
    ctx: null,             // AudioContext
    masterGain: null,      // 总音量节点
    bgmGain: null,         // BGM音量节点
    sfxGain: null,         // 音效音量节点
    ambGain: null,         // 环境音音量节点
    _inited: false,
    _muted: false,
    _bgmPlaying: false,
    _bgmNodes: [],         // 当前BGM振荡器引用
    _ambNodes: [],         // 当前环境音节点
    _bgmInterval: null,    // BGM调度定时器
    _ambInterval: null,    // 环境音定时器

    // 音量配置
    volumes: {
        master: 0.6,
        bgm: 0.25,
        sfx: 0.5,
        amb: 0.2
    },

    // ── 初始化 ──
    init() {
        if (this._inited) return;
        try {
            this.ctx = new (window.AudioContext || window.webkitAudioContext)();

            // 音量链：source -> sfxGain/bgmGain/ambGain -> masterGain -> destination
            this.masterGain = this.ctx.createGain();
            this.masterGain.gain.value = this.volumes.master;
            this.masterGain.connect(this.ctx.destination);

            this.bgmGain = this.ctx.createGain();
            this.bgmGain.gain.value = this.volumes.bgm;
            this.bgmGain.connect(this.masterGain);

            this.sfxGain = this.ctx.createGain();
            this.sfxGain.gain.value = this.volumes.sfx;
            this.sfxGain.connect(this.masterGain);

            this.ambGain = this.ctx.createGain();
            this.ambGain.gain.value = this.volumes.amb;
            this.ambGain.connect(this.masterGain);

            this._inited = true;

            // 加载用户音量偏好
            this._loadPrefs();

            console.log('🎵 AudioSystem: 音效系统初始化完成');
        } catch(e) {
            console.warn('AudioSystem: Web Audio API 不可用', e);
        }
    },

    // 确保AudioContext已启动（需要用户交互后调用）
    resume() {
        if (this.ctx && this.ctx.state === 'suspended') {
            this.ctx.resume();
        }
    },

    // ── 音量控制 ──
    setMasterVolume(v) {
        this.volumes.master = Math.max(0, Math.min(1, v));
        if (this.masterGain) this.masterGain.gain.value = this.volumes.master;
        this._savePrefs();
    },
    setBGMVolume(v) {
        this.volumes.bgm = Math.max(0, Math.min(1, v));
        if (this.bgmGain) this.bgmGain.gain.value = this.volumes.bgm;
        this._savePrefs();
    },
    setSFXVolume(v) {
        this.volumes.sfx = Math.max(0, Math.min(1, v));
        if (this.sfxGain) this.sfxGain.gain.value = this.volumes.sfx;
        this._savePrefs();
    },
    setAmbVolume(v) {
        this.volumes.amb = Math.max(0, Math.min(1, v));
        if (this.ambGain) this.ambGain.gain.value = this.volumes.amb;
        this._savePrefs();
    },

    toggleMute() {
        this._muted = !this._muted;
        if (this.masterGain) {
            this.masterGain.gain.value = this._muted ? 0 : this.volumes.master;
        }
        this._savePrefs();
        return this._muted;
    },

    _savePrefs() {
        try {
            localStorage.setItem('farm3d_audio', JSON.stringify({
                volumes: this.volumes,
                muted: this._muted
            }));
        } catch(e) {}
    },
    _loadPrefs() {
        try {
            const d = JSON.parse(localStorage.getItem('farm3d_audio'));
            if (d) {
                if (d.volumes) {
                    Object.assign(this.volumes, d.volumes);
                    if (this.masterGain) this.masterGain.gain.value = this.volumes.master;
                    if (this.bgmGain) this.bgmGain.gain.value = this.volumes.bgm;
                    if (this.sfxGain) this.sfxGain.gain.value = this.volumes.sfx;
                    if (this.ambGain) this.ambGain.gain.value = this.volumes.amb;
                }
                if (d.muted) {
                    this._muted = true;
                    if (this.masterGain) this.masterGain.gain.value = 0;
                }
            }
        } catch(e) {}
    },

    // ══════════════════════════════════════
    //  辅助工具：音符合成
    // ══════════════════════════════════════

    // 播放简单音调
    _playTone(freq, duration, type, gainNode, volume = 0.3, detune = 0) {
        if (!this.ctx || !this._inited) return null;
        const t = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const g = this.ctx.createGain();
        osc.type = type || 'sine';
        osc.frequency.value = freq;
        if (detune) osc.detune.value = detune;
        g.gain.setValueAtTime(volume, t);
        g.gain.exponentialRampToValueAtTime(0.001, t + duration);
        osc.connect(g);
        g.connect(gainNode || this.sfxGain);
        osc.start(t);
        osc.stop(t + duration);
        return osc;
    },

    // 播放带ADSR包络的音调
    _playNote(freq, duration, type, gainNode, opts = {}) {
        if (!this.ctx || !this._inited) return;
        const t = this.ctx.currentTime + (opts.delay || 0);
        const osc = this.ctx.createOscillator();
        const g = this.ctx.createGain();
        osc.type = type || 'sine';
        osc.frequency.value = freq;
        if (opts.detune) osc.detune.value = opts.detune;

        const vol = opts.volume || 0.3;
        const attack = opts.attack || 0.02;
        const decay = opts.decay || 0.1;
        const sustain = opts.sustain || 0.5;
        const release = opts.release || (duration * 0.3);

        g.gain.setValueAtTime(0, t);
        g.gain.linearRampToValueAtTime(vol, t + attack);
        g.gain.linearRampToValueAtTime(vol * sustain, t + attack + decay);
        g.gain.setValueAtTime(vol * sustain, t + duration - release);
        g.gain.exponentialRampToValueAtTime(0.001, t + duration);

        osc.connect(g);
        g.connect(gainNode || this.sfxGain);
        osc.start(t);
        osc.stop(t + duration + 0.05);
    },

    // 噪声生成器
    _createNoise(duration, gainNode, volume = 0.1) {
        if (!this.ctx) return;
        const t = this.ctx.currentTime;
        const bufSize = this.ctx.sampleRate * duration;
        const buf = this.ctx.createBuffer(1, bufSize, this.ctx.sampleRate);
        const data = buf.getChannelData(0);
        for (let i = 0; i < bufSize; i++) {
            data[i] = (Math.random() * 2 - 1) * volume;
        }
        const src = this.ctx.createBufferSource();
        src.buffer = buf;
        const g = this.ctx.createGain();
        g.gain.setValueAtTime(volume, t);
        g.gain.exponentialRampToValueAtTime(0.001, t + duration);
        src.connect(g);
        g.connect(gainNode || this.sfxGain);
        src.start(t);
        return src;
    },

    // 音阶定义（C大调五声音阶，田园风格）
    PENTATONIC: {
        C4: 261.63, D4: 293.66, E4: 329.63, G4: 392.00, A4: 440.00,
        C5: 523.25, D5: 587.33, E5: 659.25, G5: 783.99, A5: 880.00,
        C3: 130.81, G3: 196.00, A3: 220.00
    },

    // 频率查找
    _noteFreq(note) {
        const noteMap = {
            'C3': 130.81, 'D3': 146.83, 'E3': 164.81, 'F3': 174.61, 'G3': 196.00, 'A3': 220.00, 'B3': 246.94,
            'C4': 261.63, 'D4': 293.66, 'E4': 329.63, 'F4': 349.23, 'G4': 392.00, 'A4': 440.00, 'B4': 493.88,
            'C5': 523.25, 'D5': 587.33, 'E5': 659.25, 'F5': 698.46, 'G5': 783.99, 'A5': 880.00, 'B5': 987.77,
            'C6': 1046.50
        };
        return noteMap[note] || 440;
    },

    // ══════════════════════════════════════
    //  1. BGM 背景音乐 —— 程序化田园风旋律
    // ══════════════════════════════════════

    startBGM() {
        if (!this.ctx || this._bgmPlaying) return;
        this.resume();
        this._bgmPlaying = true;
        this._bgmMeasure = 0;
        this._scheduleBGM();
    },

    stopBGM() {
        this._bgmPlaying = false;
        if (this._bgmInterval) {
            clearTimeout(this._bgmInterval);
            this._bgmInterval = null;
        }
    },

    _scheduleBGM() {
        if (!this._bgmPlaying) return;

        // 田园风格五声音阶旋律片段（每小节4拍，每拍0.5秒）
        const melodies = [
            ['C5','E5','G5','E5', 'D5','G4','A4','C5'],
            ['E5','D5','C5','A4', 'G4','A4','C5','D5'],
            ['G5','E5','D5','C5', 'A4','C5','D5','E5'],
            ['C5','D5','E5','G5', 'A5','G5','E5','C5'],
            ['A4','C5','D5','E5', 'G5','E5','D5','C5'],
            ['D5','E5','G5','A5', 'G5','E5','D5','C5'],
        ];

        // 和弦进行（根音 + 五度）
        const chords = [
            ['C3','G3'], ['G3','D4'], ['A3','E4'], ['C3','G3'],
            ['F3','C4'], ['G3','D4'], ['A3','E4'], ['C3','G3']
        ];

        const melody = melodies[this._bgmMeasure % melodies.length];
        const chord = chords[this._bgmMeasure % chords.length];
        const beatDur = 0.45; // 每拍时长

        // 播放旋律（正弦波 + 三角波叠加，模拟竖笛/长笛）
        melody.forEach((note, i) => {
            const freq = this._noteFreq(note);
            this._playNote(freq, beatDur * 0.8, 'sine', this.bgmGain, {
                delay: i * beatDur,
                volume: 0.12,
                attack: 0.05,
                sustain: 0.6,
                release: beatDur * 0.3
            });
            // 叠加一层三角波增加温暖度
            this._playNote(freq, beatDur * 0.7, 'triangle', this.bgmGain, {
                delay: i * beatDur + 0.01,
                volume: 0.06,
                attack: 0.08,
                sustain: 0.4
            });
        });

        // 播放和弦低音（方波 + 三角波，模拟手风琴/风琴）
        chord.forEach((note) => {
            const freq = this._noteFreq(note);
            this._playNote(freq, beatDur * 7.5, 'triangle', this.bgmGain, {
                volume: 0.06,
                attack: 0.1,
                sustain: 0.7,
                release: 0.5
            });
        });

        // 节奏层：轻柔的拍手/木块声
        for (let i = 0; i < 8; i++) {
            if (i % 2 === 0) { // 每两拍一次低音鼓
                setTimeout(() => {
                    this._playTone(80, 0.15, 'sine', this.bgmGain, 0.08);
                }, i * beatDur * 1000);
            }
            if (i % 4 === 2) { // 每小节中间一次高频敲击
                setTimeout(() => {
                    this._createNoise(0.05, this.bgmGain, 0.03);
                }, i * beatDur * 1000);
            }
        }

        this._bgmMeasure++;
        // 每小节结束后调度下一小节
        this._bgmInterval = setTimeout(() => this._scheduleBGM(), beatDur * 8 * 1000);
    },

    // ══════════════════════════════════════
    //  2. 农场操作音效
    // ══════════════════════════════════════

    // 🌱 种植音效：清脆的"叮"音 + 泥土声
    playPlant() {
        if (!this.ctx) return;
        this.resume();
        // 泥土声（噪声 + 低频）
        this._createNoise(0.15, this.sfxGain, 0.08);
        this._playTone(120, 0.12, 'sine', this.sfxGain, 0.15);
        // 种子落地的"叮"
        setTimeout(() => {
            this._playTone(880, 0.15, 'sine', this.sfxGain, 0.2);
            this._playTone(1100, 0.12, 'sine', this.sfxGain, 0.12);
        }, 80);
        // 生长暗示的上升音
        setTimeout(() => {
            this._playTone(660, 0.2, 'triangle', this.sfxGain, 0.1);
            this._playTone(880, 0.15, 'triangle', this.sfxGain, 0.08);
        }, 200);
    },

    // 💧 浇水音效：水滴溅落声
    playWater() {
        if (!this.ctx) return;
        this.resume();
        // 水流声（滤波噪声）
        const t = this.ctx.currentTime;
        const bufSize = this.ctx.sampleRate * 0.4;
        const buf = this.ctx.createBuffer(1, bufSize, this.ctx.sampleRate);
        const data = buf.getChannelData(0);
        for (let i = 0; i < bufSize; i++) {
            data[i] = (Math.random() * 2 - 1) * 0.15;
        }
        const src = this.ctx.createBufferSource();
        src.buffer = buf;
        const filter = this.ctx.createBiquadFilter();
        filter.type = 'bandpass';
        filter.frequency.value = 2000;
        filter.Q.value = 3;
        const g = this.ctx.createGain();
        g.gain.setValueAtTime(0.15, t);
        g.gain.exponentialRampToValueAtTime(0.001, t + 0.4);
        src.connect(filter);
        filter.connect(g);
        g.connect(this.sfxGain);
        src.start(t);

        // 水滴声（高频正弦衰减）
        [0, 0.08, 0.15].forEach((d, i) => {
            setTimeout(() => {
                const freq = 1200 + Math.random() * 800;
                this._playTone(freq, 0.1, 'sine', this.sfxGain, 0.15 - i * 0.04);
            }, d * 1000);
        });
    },

    // 🌿 施肥音效：粉末撒落声
    playFertilize() {
        if (!this.ctx) return;
        this.resume();
        // 洒落的沙沙声
        this._createNoise(0.3, this.sfxGain, 0.06);
        // 正面反馈音
        setTimeout(() => {
            this._playTone(523.25, 0.15, 'triangle', this.sfxGain, 0.12);
            this._playTone(659.25, 0.12, 'triangle', this.sfxGain, 0.1);
        }, 100);
    },

    // 🌾 收获音效：丰收喜悦感
    playHarvest() {
        if (!this.ctx) return;
        this.resume();
        // 拔起声
        this._playTone(200, 0.1, 'sawtooth', this.sfxGain, 0.08);
        // 上升琶音（五声音阶）
        const notes = [523.25, 659.25, 783.99, 880, 1046.5];
        notes.forEach((freq, i) => {
            this._playNote(freq, 0.2, 'sine', this.sfxGain, {
                delay: 0.08 + i * 0.07,
                volume: 0.18 - i * 0.02,
                attack: 0.01
            });
        });
        // "叮铃"金币暗示
        setTimeout(() => {
            this._playTone(1318.5, 0.3, 'sine', this.sfxGain, 0.12);
            this._playTone(1568, 0.25, 'sine', this.sfxGain, 0.08);
        }, 400);
    },

    // ✨ 金色收获（稀有丰收）
    playGoldenHarvest() {
        if (!this.ctx) return;
        this.resume();
        // 闪亮的金色音效
        const chord = [523.25, 659.25, 783.99, 1046.5, 1318.5];
        chord.forEach((freq, i) => {
            this._playNote(freq, 0.6, 'sine', this.sfxGain, {
                delay: i * 0.05,
                volume: 0.15,
                attack: 0.01,
                sustain: 0.8
            });
            // 叠加泛音
            this._playNote(freq * 2, 0.4, 'sine', this.sfxGain, {
                delay: i * 0.05 + 0.02,
                volume: 0.05,
                attack: 0.01
            });
        });
        // 加一层闪烁的高频
        setTimeout(() => {
            [2093, 2349, 2637, 2093].forEach((f, i) => {
                this._playTone(f, 0.08, 'sine', this.sfxGain, 0.06);
            });
        }, 350);
    },

    // ⚡ 加速卡音效：能量涌动感
    playSpeedUp() {
        if (!this.ctx) return;
        this.resume();
        // 低频蓄力
        this._playTone(100, 0.3, 'sawtooth', this.sfxGain, 0.1);
        // 快速上升扫频
        const t = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const g = this.ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(200, t);
        osc.frequency.exponentialRampToValueAtTime(2000, t + 0.3);
        g.gain.setValueAtTime(0.12, t);
        g.gain.exponentialRampToValueAtTime(0.001, t + 0.35);
        osc.connect(g);
        g.connect(this.sfxGain);
        osc.start(t);
        osc.stop(t + 0.4);
        // 完成确认音
        setTimeout(() => {
            this._playTone(880, 0.15, 'square', this.sfxGain, 0.1);
            this._playTone(1174.66, 0.12, 'square', this.sfxGain, 0.08);
        }, 300);
    },

    // 🏗️ 升级土地
    playUpgradeLand() {
        if (!this.ctx) return;
        this.resume();
        // 锤击声
        this._createNoise(0.08, this.sfxGain, 0.12);
        this._playTone(200, 0.1, 'square', this.sfxGain, 0.1);
        setTimeout(() => {
            this._createNoise(0.06, this.sfxGain, 0.1);
            this._playTone(250, 0.08, 'square', this.sfxGain, 0.08);
        }, 150);
        // 升级完成音
        setTimeout(() => {
            this._playTone(523.25, 0.15, 'sine', this.sfxGain, 0.15);
            this._playTone(659.25, 0.12, 'sine', this.sfxGain, 0.12);
            this._playTone(783.99, 0.2, 'sine', this.sfxGain, 0.15);
        }, 300);
    },

    // ══════════════════════════════════════
    //  3. 动物互动音效
    // ══════════════════════════════════════

    // 🥕 喂食
    playFeed() {
        if (!this.ctx) return;
        this.resume();
        // 倒食物的声音
        this._createNoise(0.2, this.sfxGain, 0.06);
        // 咀嚼声（低频脉冲）
        [0, 120, 240, 360].forEach((d) => {
            setTimeout(() => {
                this._playTone(100 + Math.random() * 50, 0.06, 'square', this.sfxGain, 0.08);
            }, d);
        });
        // 开心音效
        setTimeout(() => {
            this._playTone(659.25, 0.12, 'triangle', this.sfxGain, 0.1);
            this._playTone(783.99, 0.15, 'triangle', this.sfxGain, 0.12);
        }, 400);
    },

    // 🤝 抚摸
    playPet() {
        if (!this.ctx) return;
        this.resume();
        // 温暖的上行三度
        this._playNote(392, 0.25, 'sine', this.sfxGain, {
            volume: 0.12, attack: 0.05, sustain: 0.7
        });
        this._playNote(493.88, 0.25, 'sine', this.sfxGain, {
            delay: 0.12, volume: 0.12, attack: 0.05, sustain: 0.7
        });
        this._playNote(587.33, 0.3, 'sine', this.sfxGain, {
            delay: 0.24, volume: 0.14, attack: 0.05, sustain: 0.8
        });
        // 轻柔的心跳声
        setTimeout(() => {
            this._playTone(200, 0.08, 'sine', this.sfxGain, 0.06);
        }, 400);
    },

    // 🥚 收集产出
    playCollectProduct() {
        if (!this.ctx) return;
        this.resume();
        // 拿起的声音
        this._playTone(400, 0.08, 'sine', this.sfxGain, 0.1);
        // 金币叮当
        setTimeout(() => {
            this._playTone(1046.5, 0.12, 'sine', this.sfxGain, 0.15);
            this._playTone(1318.5, 0.1, 'sine', this.sfxGain, 0.1);
        }, 100);
        // 满足音
        setTimeout(() => {
            this._playTone(783.99, 0.18, 'triangle', this.sfxGain, 0.1);
        }, 250);
    },

    // ✂️ 剪羊毛
    playShear() {
        if (!this.ctx) return;
        this.resume();
        // 剪刀声（高频噪声脉冲）
        [0, 80, 160].forEach((d) => {
            setTimeout(() => {
                this._createNoise(0.04, this.sfxGain, 0.1);
                this._playTone(3000 + Math.random() * 1000, 0.03, 'square', this.sfxGain, 0.05);
            }, d);
        });
        // 确认音
        setTimeout(() => {
            this._playTone(880, 0.12, 'sine', this.sfxGain, 0.1);
        }, 250);
    },

    // 动物叫声（根据类型）
    playAnimalSound(type) {
        if (!this.ctx) return;
        this.resume();
        switch(type) {
            case 'cow': // 牛叫：低沉的"哞"
                this._playNote(130, 0.6, 'sawtooth', this.sfxGain, {
                    volume: 0.08, attack: 0.1, sustain: 0.6, release: 0.2
                });
                this._playNote(140, 0.5, 'sawtooth', this.sfxGain, {
                    delay: 0.05, volume: 0.05, attack: 0.1, sustain: 0.5
                });
                break;
            case 'chicken': // 鸡叫：尖锐的"咯咯"
                [0, 0.1, 0.2].forEach((d) => {
                    this._playNote(800 + Math.random() * 200, 0.08, 'square', this.sfxGain, {
                        delay: d, volume: 0.06, attack: 0.01
                    });
                });
                break;
            case 'sheep': // 羊叫："咩"
                this._playNote(350, 0.4, 'triangle', this.sfxGain, {
                    volume: 0.08, attack: 0.05, sustain: 0.5
                });
                this._playNote(380, 0.3, 'triangle', this.sfxGain, {
                    delay: 0.1, volume: 0.06, attack: 0.05
                });
                break;
            case 'duck': // 鸭叫："嘎嘎"
                [0, 0.12].forEach((d) => {
                    this._playNote(500 + Math.random() * 100, 0.1, 'sawtooth', this.sfxGain, {
                        delay: d, volume: 0.06, attack: 0.01
                    });
                });
                break;
            default: // 通用可爱音效
                this._playTone(600, 0.1, 'triangle', this.sfxGain, 0.08);
                break;
        }
    },

    // ══════════════════════════════════════
    //  4. UI 交互音效
    // ══════════════════════════════════════

    // 🔘 按钮点击（轻柔的"嗒"）
    playClick() {
        if (!this.ctx) return;
        this.resume();
        this._playTone(800, 0.05, 'sine', this.sfxGain, 0.12);
        this._playTone(1200, 0.04, 'sine', this.sfxGain, 0.06);
    },

    // 📖 菜单/面板打开
    playMenuOpen() {
        if (!this.ctx) return;
        this.resume();
        this._playTone(400, 0.08, 'sine', this.sfxGain, 0.08);
        setTimeout(() => {
            this._playTone(600, 0.06, 'sine', this.sfxGain, 0.06);
        }, 40);
    },

    // 📕 菜单/面板关闭
    playMenuClose() {
        if (!this.ctx) return;
        this.resume();
        this._playTone(500, 0.06, 'sine', this.sfxGain, 0.06);
        setTimeout(() => {
            this._playTone(350, 0.08, 'sine', this.sfxGain, 0.05);
        }, 30);
    },

    // 📢 通知弹出
    playNotification() {
        if (!this.ctx) return;
        this.resume();
        this._playTone(880, 0.08, 'sine', this.sfxGain, 0.08);
        this._playTone(1046.5, 0.06, 'sine', this.sfxGain, 0.06);
    },

    // ⚠️ 警告通知
    playWarning() {
        if (!this.ctx) return;
        this.resume();
        this._playTone(300, 0.15, 'square', this.sfxGain, 0.08);
        setTimeout(() => {
            this._playTone(250, 0.15, 'square', this.sfxGain, 0.06);
        }, 150);
    },

    // ❌ 错误/失败
    playError() {
        if (!this.ctx) return;
        this.resume();
        this._playTone(200, 0.2, 'sawtooth', this.sfxGain, 0.08);
        setTimeout(() => {
            this._playTone(150, 0.25, 'sawtooth', this.sfxGain, 0.06);
        }, 100);
    },

    // 💰 金币获得
    playCoinGet() {
        if (!this.ctx) return;
        this.resume();
        this._playTone(1046.5, 0.08, 'sine', this.sfxGain, 0.12);
        setTimeout(() => {
            this._playTone(1318.5, 0.06, 'sine', this.sfxGain, 0.1);
        }, 60);
        setTimeout(() => {
            this._playTone(1568, 0.1, 'sine', this.sfxGain, 0.08);
        }, 120);
    },

    // 🏪 购买
    playPurchase() {
        if (!this.ctx) return;
        this.resume();
        // 收银机声
        this._playTone(500, 0.06, 'square', this.sfxGain, 0.06);
        setTimeout(() => {
            this._playTone(700, 0.04, 'square', this.sfxGain, 0.05);
        }, 50);
        // "叮"
        setTimeout(() => {
            this._playTone(1568, 0.15, 'sine', this.sfxGain, 0.1);
        }, 120);
    },

    // 📅 签到
    playCheckin() {
        if (!this.ctx) return;
        this.resume();
        const notes = [523.25, 659.25, 783.99, 1046.5];
        notes.forEach((f, i) => {
            this._playNote(f, 0.2, 'sine', this.sfxGain, {
                delay: i * 0.1,
                volume: 0.12,
                attack: 0.02
            });
        });
    },

    // 🔧 工具切换
    playToolSwitch() {
        if (!this.ctx) return;
        this.resume();
        this._playTone(600, 0.05, 'triangle', this.sfxGain, 0.08);
        this._playTone(800, 0.04, 'triangle', this.sfxGain, 0.06);
    },

    // ══════════════════════════════════════
    //  5. 特殊系统音效
    // ══════════════════════════════════════

    // 🎰 扭蛋：投币
    playGachaCoin() {
        if (!this.ctx) return;
        this.resume();
        // 金属碰撞声
        this._playTone(2000, 0.1, 'sine', this.sfxGain, 0.15);
        this._playTone(3000, 0.08, 'sine', this.sfxGain, 0.1);
        setTimeout(() => {
            this._playTone(1500, 0.08, 'sine', this.sfxGain, 0.08);
        }, 80);
        // 机械转动声
        setTimeout(() => {
            [0, 40, 80, 120].forEach((d) => {
                setTimeout(() => {
                    this._playTone(400 + Math.random() * 200, 0.03, 'square', this.sfxGain, 0.05);
                }, d);
            });
        }, 200);
    },

    // 🎰 扭蛋：揭晓（根据稀有度）
    playGachaReveal(rarity) {
        if (!this.ctx) return;
        this.resume();
        if (rarity === 'legendary') {
            // 史诗级揭晓：壮丽和弦
            const chord = [261.63, 329.63, 392, 523.25, 659.25, 783.99, 1046.5];
            chord.forEach((f, i) => {
                this._playNote(f, 1.2, 'sine', this.sfxGain, {
                    delay: i * 0.04,
                    volume: 0.12,
                    attack: 0.02,
                    sustain: 0.9
                });
            });
            // 闪烁高频
            setTimeout(() => {
                [2093, 2637, 3136, 2637, 2093].forEach((f, i) => {
                    this._playNote(f, 0.15, 'sine', this.sfxGain, {
                        delay: i * 0.08, volume: 0.08
                    });
                });
            }, 500);
        } else if (rarity === 'rare') {
            // 稀有揭晓：愉悦琶音
            [523.25, 659.25, 783.99, 1046.5].forEach((f, i) => {
                this._playNote(f, 0.3, 'sine', this.sfxGain, {
                    delay: i * 0.08, volume: 0.12
                });
            });
        } else {
            // 普通揭晓
            this._playTone(523.25, 0.2, 'sine', this.sfxGain, 0.12);
            this._playTone(659.25, 0.15, 'sine', this.sfxGain, 0.1);
        }
    },

    // 🎣 钓鱼：抛竿
    playFishCast() {
        if (!this.ctx) return;
        this.resume();
        // 嗖~飞线声（下降扫频）
        const t = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const g = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(1500, t);
        osc.frequency.exponentialRampToValueAtTime(200, t + 0.3);
        g.gain.setValueAtTime(0.1, t);
        g.gain.exponentialRampToValueAtTime(0.001, t + 0.35);
        osc.connect(g);
        g.connect(this.sfxGain);
        osc.start(t);
        osc.stop(t + 0.4);
        // 入水声
        setTimeout(() => {
            this._createNoise(0.15, this.sfxGain, 0.08);
            this._playTone(300, 0.1, 'sine', this.sfxGain, 0.06);
        }, 250);
    },

    // 🎣 钓鱼：鱼咬钩
    playFishBite() {
        if (!this.ctx) return;
        this.resume();
        // 急促的"叮叮叮"
        [0, 80, 160, 240].forEach((d) => {
            setTimeout(() => {
                this._playTone(1200, 0.06, 'sine', this.sfxGain, 0.15);
            }, d);
        });
    },

    // 🎣 钓鱼：QTE成功
    playFishQTEHit() {
        if (!this.ctx) return;
        this.resume();
        this._playTone(880, 0.1, 'sine', this.sfxGain, 0.15);
        this._playTone(1174.66, 0.08, 'sine', this.sfxGain, 0.1);
    },

    // 🎣 钓鱼：钓到鱼
    playFishCatch() {
        if (!this.ctx) return;
        this.resume();
        // 水花声
        this._createNoise(0.2, this.sfxGain, 0.1);
        // 胜利音
        setTimeout(() => {
            [523.25, 659.25, 783.99, 1046.5].forEach((f, i) => {
                this._playNote(f, 0.2, 'sine', this.sfxGain, {
                    delay: i * 0.07, volume: 0.12
                });
            });
        }, 150);
    },

    // 🎣 钓鱼：失败
    playFishFail() {
        if (!this.ctx) return;
        this.resume();
        this._playTone(400, 0.2, 'sawtooth', this.sfxGain, 0.08);
        setTimeout(() => {
            this._playTone(300, 0.25, 'sawtooth', this.sfxGain, 0.06);
        }, 150);
    },

    // 🎉 升级
    playLevelUp() {
        if (!this.ctx) return;
        this.resume();
        // 华丽的上行琶音
        const notes = [261.63, 329.63, 392, 523.25, 659.25, 783.99, 1046.5, 1318.5];
        notes.forEach((f, i) => {
            this._playNote(f, 0.4, 'sine', this.sfxGain, {
                delay: i * 0.06,
                volume: 0.12,
                attack: 0.01,
                sustain: 0.8
            });
            this._playNote(f, 0.35, 'triangle', this.sfxGain, {
                delay: i * 0.06 + 0.02,
                volume: 0.06,
                attack: 0.01
            });
        });
        // 结束和弦
        setTimeout(() => {
            [523.25, 659.25, 783.99, 1046.5].forEach((f) => {
                this._playNote(f, 0.8, 'sine', this.sfxGain, {
                    volume: 0.1, sustain: 0.9
                });
            });
        }, 600);
    },

    // 🏆 成就解锁
    playAchievement() {
        if (!this.ctx) return;
        this.resume();
        // 号角式上行
        this._playNote(392, 0.15, 'square', this.sfxGain, { volume: 0.08 });
        this._playNote(523.25, 0.15, 'square', this.sfxGain, { delay: 0.12, volume: 0.1 });
        this._playNote(659.25, 0.15, 'square', this.sfxGain, { delay: 0.24, volume: 0.1 });
        this._playNote(783.99, 0.4, 'square', this.sfxGain, { delay: 0.36, volume: 0.12, sustain: 0.8 });
        // 叠加正弦波柔化
        this._playNote(783.99, 0.5, 'sine', this.sfxGain, { delay: 0.36, volume: 0.08, sustain: 0.9 });
    },

    // 一键出售
    playSellAll() {
        if (!this.ctx) return;
        this.resume();
        // 连续金币声
        [0, 60, 120, 180, 240].forEach((d, i) => {
            setTimeout(() => {
                this._playTone(1046.5 + i * 100, 0.08, 'sine', this.sfxGain, 0.1 - i * 0.01);
            }, d);
        });
        // 收银机"叮"
        setTimeout(() => {
            this._playTone(2093, 0.2, 'sine', this.sfxGain, 0.12);
        }, 300);
    },

    // ══════════════════════════════════════
    //  6. 环境音 —— 天气 & 昼夜
    // ══════════════════════════════════════

    // 开始环境音循环
    startAmbience(weather, hour) {
        this.stopAmbience();
        if (!this.ctx || !this._inited) return;

        // 根据天气选择环境音
        this._currentWeather = weather;
        this._currentHour = hour;
        this._playAmbience();
    },

    stopAmbience() {
        if (this._ambInterval) {
            clearInterval(this._ambInterval);
            this._ambInterval = null;
        }
        this._ambNodes.forEach(n => { try { n.stop(); } catch(e) {} });
        this._ambNodes = [];
    },

    _playAmbience() {
        if (!this.ctx) return;
        const weather = this._currentWeather || 'sunny';
        const hour = this._currentHour || 8;
        const isNight = hour >= 20 || hour < 6;

        // 基础环境：鸟鸣/虫鸣
        if (!isNight) {
            // 白天：鸟叫（随机高频脉冲）
            this._ambInterval = setInterval(() => {
                if (Math.random() < 0.3) {
                    const birdFreq = 2000 + Math.random() * 2000;
                    this._playNote(birdFreq, 0.15, 'sine', this.ambGain, {
                        volume: 0.04 + Math.random() * 0.03,
                        attack: 0.02
                    });
                    if (Math.random() < 0.5) {
                        this._playNote(birdFreq * 1.2, 0.1, 'sine', this.ambGain, {
                            delay: 0.1, volume: 0.03
                        });
                    }
                }
            }, 2000);
        } else {
            // 夜晚：蟋蟀声（高频连续脉冲）
            this._ambInterval = setInterval(() => {
                if (Math.random() < 0.4) {
                    const cricketFreq = 4000 + Math.random() * 1000;
                    for (let i = 0; i < 6; i++) {
                        this._playNote(cricketFreq, 0.03, 'sine', this.ambGain, {
                            delay: i * 0.05,
                            volume: 0.02
                        });
                    }
                }
            }, 1500);
        }

        // 天气相关环境音
        if (weather === 'rainy' || weather === 'heavy_rain') {
            // 雨声（连续噪声）
            this._startRainLoop();
        } else if (weather === 'thunderstorm') {
            this._startRainLoop();
            // 偶尔雷声
            this._thunderInterval = setInterval(() => {
                if (Math.random() < 0.15) {
                    this._playThunder();
                }
            }, 8000);
        } else if (weather === 'snow' || weather === 'blizzard') {
            // 风声
            this._startWindLoop();
        }
    },

    _startRainLoop() {
        if (!this.ctx) return;
        const loop = () => {
            if (!this._ambInterval) return;
            const duration = 2;
            const bufSize = this.ctx.sampleRate * duration;
            const buf = this.ctx.createBuffer(1, bufSize, this.ctx.sampleRate);
            const data = buf.getChannelData(0);
            for (let i = 0; i < bufSize; i++) {
                data[i] = (Math.random() * 2 - 1) * 0.08;
            }
            const src = this.ctx.createBufferSource();
            src.buffer = buf;
            const filter = this.ctx.createBiquadFilter();
            filter.type = 'lowpass';
            filter.frequency.value = this._currentWeather === 'heavy_rain' ? 3000 : 2000;
            const g = this.ctx.createGain();
            g.gain.value = this._currentWeather === 'heavy_rain' ? 0.15 : 0.08;
            src.connect(filter);
            filter.connect(g);
            g.connect(this.ambGain);
            src.start();
            this._ambNodes.push(src);
            src.onended = loop;
        };
        loop();
    },

    _startWindLoop() {
        if (!this.ctx) return;
        const loop = () => {
            if (!this._ambInterval) return;
            const duration = 3;
            const bufSize = this.ctx.sampleRate * duration;
            const buf = this.ctx.createBuffer(1, bufSize, this.ctx.sampleRate);
            const data = buf.getChannelData(0);
            for (let i = 0; i < bufSize; i++) {
                data[i] = (Math.random() * 2 - 1) * 0.05;
            }
            const src = this.ctx.createBufferSource();
            src.buffer = buf;
            const filter = this.ctx.createBiquadFilter();
            filter.type = 'bandpass';
            filter.frequency.value = 400;
            filter.Q.value = 1;
            const g = this.ctx.createGain();
            g.gain.value = this._currentWeather === 'blizzard' ? 0.12 : 0.06;
            src.connect(filter);
            filter.connect(g);
            g.connect(this.ambGain);
            src.start();
            this._ambNodes.push(src);
            src.onended = loop;
        };
        loop();
    },

    _playThunder() {
        if (!this.ctx) return;
        // 低频隆隆声
        const t = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const g = this.ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(60, t);
        osc.frequency.linearRampToValueAtTime(30, t + 1.5);
        g.gain.setValueAtTime(0.15, t);
        g.gain.exponentialRampToValueAtTime(0.001, t + 1.5);
        osc.connect(g);
        g.connect(this.ambGain);
        osc.start(t);
        osc.stop(t + 1.6);
        // 噪声爆裂
        this._createNoise(0.3, this.ambGain, 0.12);
    },

    // ══════════════════════════════════════
    //  7. 全局音效触发点（monkey-patch挂载）
    // ══════════════════════════════════════

    // 挂载到游戏函数，自动触发音效
    hookGameFunctions() {
        const self = this;

        // ── 农场操作 ──
        // 种植
        if (typeof window.doPlant === 'function') {
            const origDoPlant = window.doPlant;
            window.doPlant = function() {
                const result = origDoPlant.apply(this, arguments);
                self.playPlant();
                return result;
            };
        }
        // 浇水
        if (typeof window.doWater === 'function') {
            const origDoWater = window.doWater;
            window.doWater = function() {
                const result = origDoWater.apply(this, arguments);
                self.playWater();
                return result;
            };
        }
        // 施肥
        if (typeof window.doFertilize === 'function') {
            const origDoFertilize = window.doFertilize;
            window.doFertilize = function() {
                const result = origDoFertilize.apply(this, arguments);
                self.playFertilize();
                return result;
            };
        }
        // 收获
        if (typeof window.doHarvest === 'function') {
            const origDoHarvest = window.doHarvest;
            window.doHarvest = function() {
                const result = origDoHarvest.apply(this, arguments);
                self.playHarvest();
                return result;
            };
        }
        // 加速卡
        if (typeof window.useSpeedUp === 'function') {
            const origSpeedUp = window.useSpeedUp;
            window.useSpeedUp = function() {
                const result = origSpeedUp.apply(this, arguments);
                self.playSpeedUp();
                return result;
            };
        }
        // 升级土地
        if (typeof window.doUpgradeLand === 'function') {
            const origUpgrade = window.doUpgradeLand;
            window.doUpgradeLand = function() {
                const result = origUpgrade.apply(this, arguments);
                self.playUpgradeLand();
                return result;
            };
        }

        // ── 动物操作 ──
        if (typeof window.doFeedAnimal === 'function') {
            const origFeed = window.doFeedAnimal;
            window.doFeedAnimal = function(animalId) {
                const result = origFeed.apply(this, arguments);
                self.playFeed();
                // 播放对应动物叫声
                const animal = GameState.animals.find(a => a.id === animalId);
                if (animal) {
                    setTimeout(() => self.playAnimalSound(animal.type), 300);
                }
                return result;
            };
        }
        if (typeof window.doPetAnimal === 'function') {
            const origPet = window.doPetAnimal;
            window.doPetAnimal = function() {
                const result = origPet.apply(this, arguments);
                self.playPet();
                return result;
            };
        }
        if (typeof window.doCollectAnimal === 'function') {
            const origCollect = window.doCollectAnimal;
            window.doCollectAnimal = function() {
                const result = origCollect.apply(this, arguments);
                self.playCollectProduct();
                return result;
            };
        }
        if (typeof window.doShearSheep === 'function') {
            const origShear = window.doShearSheep;
            window.doShearSheep = function() {
                const result = origShear.apply(this, arguments);
                self.playShear();
                return result;
            };
        }

        // ── UI操作 ──
        // 弹窗打开
        if (typeof window.showModal === 'function') {
            const origShowModal = window.showModal;
            window.showModal = function() {
                self.playMenuOpen();
                return origShowModal.apply(this, arguments);
            };
        }
        // 弹窗关闭
        if (typeof window.hideModal === 'function') {
            const origHideModal = window.hideModal;
            window.hideModal = function() {
                self.playMenuClose();
                return origHideModal.apply(this, arguments);
            };
        }
        // 通知（区分类型）
        if (typeof window.showNotification === 'function') {
            const origNotif = window.showNotification;
            window.showNotification = function(msg, icon, type) {
                if (type === 'warning') {
                    self.playWarning();
                } else if (type === 'error') {
                    self.playError();
                }
                // 普通通知不播放音效以避免频繁
                return origNotif.apply(this, arguments);
            };
        }
        // 工具切换
        if (typeof window.selectTool === 'function') {
            const origSelectTool = window.selectTool;
            window.selectTool = function() {
                self.playToolSwitch();
                return origSelectTool.apply(this, arguments);
            };
        }
        // 购买种子
        if (typeof window.buySeed === 'function') {
            const origBuySeed = window.buySeed;
            window.buySeed = function() {
                const result = origBuySeed.apply(this, arguments);
                self.playPurchase();
                return result;
            };
        }
        // 购买动物
        if (typeof window.buyAnimal === 'function') {
            const origBuyAnimal = window.buyAnimal;
            window.buyAnimal = function() {
                const result = origBuyAnimal.apply(this, arguments);
                self.playPurchase();
                return result;
            };
        }
        // 购买工具
        if (typeof window.buyTool === 'function') {
            const origBuyTool = window.buyTool;
            window.buyTool = function() {
                const result = origBuyTool.apply(this, arguments);
                self.playPurchase();
                return result;
            };
        }
        // 一键出售
        if (typeof window.sellAll === 'function') {
            const origSellAll = window.sellAll;
            window.sellAll = function() {
                const result = origSellAll.apply(this, arguments);
                self.playSellAll();
                return result;
            };
        }
        // 签到
        if (typeof window.doCheckin === 'function') {
            const origCheckin = window.doCheckin;
            window.doCheckin = function() {
                const result = origCheckin.apply(this, arguments);
                self.playCheckin();
                return result;
            };
        }

        // ── 升级 ──
        const origOnLevelUp = GameState.onLevelUp.bind(GameState);
        GameState.onLevelUp = function() {
            origOnLevelUp();
            self.playLevelUp();
        };

        // ── 成就 ──
        const origCheckAch = GameState.checkAchievements.bind(GameState);
        const achBefore = new Set(GameState.achievements);
        GameState.checkAchievements = function() {
            const before = GameState.achievements.size;
            origCheckAch();
            if (GameState.achievements.size > before) {
                self.playAchievement();
            }
        };

        // ── 金色收获 ──
        if (typeof window.showGoldenHarvest === 'function') {
            const origGolden = window.showGoldenHarvest;
            window.showGoldenHarvest = function() {
                self.playGoldenHarvest();
                return origGolden.apply(this, arguments);
            };
        }

        // ── 钓鱼系统 ──
        if (typeof FishingSystem !== 'undefined') {
            if (typeof FishingSystem.startFishing === 'function') {
                const origStartFish = FishingSystem.startFishing.bind(FishingSystem);
                FishingSystem.startFishing = function() {
                    self.playFishCast();
                    return origStartFish();
                };
            }
            if (typeof FishingSystem.onPlayerClick === 'function') {
                const origPlayerClick = FishingSystem.onPlayerClick.bind(FishingSystem);
                FishingSystem.onPlayerClick = function() {
                    if (FishingSystem.state === 'idle') {
                        self.playFishCast();
                    }
                    return origPlayerClick();
                };
            }
        }

        // ── 扭蛋系统 ──
        if (typeof GachaSystem !== 'undefined' && typeof GachaSystem.doGacha === 'function') {
            const origDoGacha = GachaSystem.doGacha.bind(GachaSystem);
            GachaSystem.doGacha = function() {
                self.playGachaCoin();
                return origDoGacha();
            };
        }

        // ── 天气变化时切换环境音 ──
        const origChangeWeather = GameState.changeWeather.bind(GameState);
        GameState.changeWeather = function() {
            origChangeWeather();
            self.startAmbience(GameState.gameTime.weather, GameState.gameTime.hour);
        };

        // ── 抽屉、面板音效 ──
        if (typeof window.toggleLeftDrawer === 'function') {
            const origDrawer = window.toggleLeftDrawer;
            window.toggleLeftDrawer = function() {
                self.playClick();
                return origDrawer.apply(this, arguments);
            };
        }
        if (typeof window.toggleSideMore === 'function') {
            const origSideMore = window.toggleSideMore;
            window.toggleSideMore = function() {
                self.playClick();
                return origSideMore.apply(this, arguments);
            };
        }
        if (typeof window.toggleAdRewardPanel === 'function') {
            const origAdPanel = window.toggleAdRewardPanel;
            window.toggleAdRewardPanel = function() {
                self.playClick();
                return origAdPanel.apply(this, arguments);
            };
        }

        console.log('🎵 AudioSystem: 音效Hook已全部挂载');
    },

    // ══════════════════════════════════════
    //  8. HUD 音效控制面板
    // ══════════════════════════════════════

    createHUD() {
        // 创建音效控制按钮（右下角）
        const wrapper = document.createElement('div');
        wrapper.id = 'audio-hud';
        wrapper.innerHTML = `
            <button id="audio-toggle-btn" title="音效设置">
                <span id="audio-toggle-icon">🔊</span>
            </button>
            <div id="audio-panel" style="display:none">
                <div class="audio-panel-title">🎵 音效设置</div>
                <div class="audio-slider-row">
                    <span>🔊 总音量</span>
                    <input type="range" id="audio-master" min="0" max="100" value="${this.volumes.master * 100}">
                    <span class="audio-val" id="audio-master-val">${Math.round(this.volumes.master * 100)}%</span>
                </div>
                <div class="audio-slider-row">
                    <span>🎵 音乐</span>
                    <input type="range" id="audio-bgm" min="0" max="100" value="${this.volumes.bgm * 100}">
                    <span class="audio-val" id="audio-bgm-val">${Math.round(this.volumes.bgm * 100)}%</span>
                </div>
                <div class="audio-slider-row">
                    <span>🔔 音效</span>
                    <input type="range" id="audio-sfx" min="0" max="100" value="${this.volumes.sfx * 100}">
                    <span class="audio-val" id="audio-sfx-val">${Math.round(this.volumes.sfx * 100)}%</span>
                </div>
                <div class="audio-slider-row">
                    <span>🌿 环境</span>
                    <input type="range" id="audio-amb" min="0" max="100" value="${this.volumes.amb * 100}">
                    <span class="audio-val" id="audio-amb-val">${Math.round(this.volumes.amb * 100)}%</span>
                </div>
                <div class="audio-btn-row">
                    <button id="audio-mute-btn" class="audio-ctrl-btn">${this._muted ? '🔇 已静音' : '🔊 静音'}</button>
                    <button id="audio-bgm-toggle" class="audio-ctrl-btn">${this._bgmPlaying ? '⏸ 暂停BGM' : '▶ 播放BGM'}</button>
                </div>
            </div>
        `;
        document.body.appendChild(wrapper);

        // 开关面板
        document.getElementById('audio-toggle-btn').addEventListener('click', () => {
            const panel = document.getElementById('audio-panel');
            panel.style.display = panel.style.display === 'none' ? 'block' : 'none';
            this.playClick();
        });

        // 滑块事件
        const bindSlider = (id, setter, valId) => {
            const el = document.getElementById(id);
            el.addEventListener('input', () => {
                const v = el.value / 100;
                setter.call(this, v);
                document.getElementById(valId).textContent = el.value + '%';
            });
        };
        bindSlider('audio-master', this.setMasterVolume, 'audio-master-val');
        bindSlider('audio-bgm', this.setBGMVolume, 'audio-bgm-val');
        bindSlider('audio-sfx', this.setSFXVolume, 'audio-sfx-val');
        bindSlider('audio-amb', this.setAmbVolume, 'audio-amb-val');

        // 静音按钮
        document.getElementById('audio-mute-btn').addEventListener('click', () => {
            const muted = this.toggleMute();
            document.getElementById('audio-mute-btn').textContent = muted ? '🔇 已静音' : '🔊 静音';
            document.getElementById('audio-toggle-icon').textContent = muted ? '🔇' : '🔊';
        });

        // BGM切换
        document.getElementById('audio-bgm-toggle').addEventListener('click', () => {
            if (this._bgmPlaying) {
                this.stopBGM();
                document.getElementById('audio-bgm-toggle').textContent = '▶ 播放BGM';
            } else {
                this.startBGM();
                document.getElementById('audio-bgm-toggle').textContent = '⏸ 暂停BGM';
            }
        });

        // 点击外部关闭面板
        document.addEventListener('click', (e) => {
            const hud = document.getElementById('audio-hud');
            const panel = document.getElementById('audio-panel');
            if (hud && panel && !hud.contains(e.target) && panel.style.display !== 'none') {
                panel.style.display = 'none';
            }
        });
    }
};
