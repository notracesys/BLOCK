'use client';

const AUDIO_PATH = '/audio/';

const soundMap = {
  selection: ['selection.wav', 'selection1.wav', 'selection2.wav'],
  encaixe: ['encaixe.wav', 'encaixe1.wav', 'encaixe2.wav', 'encaixe3.wav', 'encaixe4.wav'],
  broken: ['broken.wav', 'broken1.wav', 'broken2.wav'],
  clear: ['clear.wav'],
  derrota: ['derrota.wav', 'derrota2.wav'],
  win: ['win_chime.wav'],
  swtch: ['swtch.wav', 'swtch1.wav', 'swtch2.wav'],
};

let audioContext = null;
let masterGain = null;
const bufferCache = {};
let muted = false;
let bgMusic = null;

async function init() {
  if (typeof window === 'undefined') return;
  if (audioContext) return;
  try {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) return;
    audioContext = new AudioContextClass();
    masterGain = audioContext.createGain();
    masterGain.connect(audioContext.destination);

    const stored = localStorage.getItem('soundEnabled');
    muted = stored === 'false';
    masterGain.gain.value = muted ? 0 : 1;
  } catch (e) {}
}

async function getBuffer(filename) {
  if (!audioContext) await init();
  const url = AUDIO_PATH + filename;
  if (bufferCache[url]) return bufferCache[url];

  try {
    const response = await fetch(url);
    if (!response.ok) return null;
    
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('text/html')) return null;

    const arrayBuffer = await response.arrayBuffer();
    const buffer = await audioContext.decodeAudioData(arrayBuffer);
    bufferCache[url] = buffer;
    return buffer;
  } catch (e) {
    return null;
  }
}

export const GameAudio = {
  async preload() {
    if (typeof window === 'undefined') return;
    await init();
    if (!audioContext) return;
    const allFiles = Object.values(soundMap).flat();
    allFiles.forEach((file) => getBuffer(file));
  },

  async play(name, volume = 0.5) {
    if (typeof window === 'undefined') return;
    if (!audioContext) await init();
    if (muted || !audioContext) return;

    if (audioContext.state === 'suspended') {
      await audioContext.resume();
    }

    const files = soundMap[name];
    if (!files) return;

    const file = files[Math.floor(Math.random() * files.length)];
    const buffer = await getBuffer(file);

    if (buffer) {
      const source = audioContext.createBufferSource();
      source.buffer = buffer;
      const gain = audioContext.createGain();
      gain.gain.value = volume;
      source.connect(gain);
      gain.connect(masterGain);
      source.start(0);
    }
  },

  async playRandom(keys, volume = 0.5) {
    if (typeof window === 'undefined') return;
    const key = keys[Math.floor(Math.random() * keys.length)];
    return this.play(key, volume);
  },

  async playMusic() {
    if (typeof window === 'undefined') return;
    if (bgMusic) {
      if (bgMusic.paused && !muted) {
        bgMusic.play().catch(() => {});
      }
      return;
    }
    bgMusic = new Audio(AUDIO_PATH + 'tatamusic-game-gaming-video-game-music-482380.mp3');
    bgMusic.loop = true;
    bgMusic.volume = muted ? 0 : 0.25;
    bgMusic.play().catch(() => {});
  },

  stopMusic() {
    if (typeof window === 'undefined') return;
    if (bgMusic) {
      bgMusic.pause();
      bgMusic.currentTime = 0;
    }
  },

  setMuted(val) {
    if (typeof window === 'undefined') return;
    muted = val;
    if (masterGain) {
      masterGain.gain.value = muted ? 0 : 1;
    }
    if (bgMusic) {
      bgMusic.volume = muted ? 0 : 0.25;
      if (muted) {
        bgMusic.pause();
      } else {
        bgMusic.play().catch(() => {});
      }
    }
    localStorage.setItem('soundEnabled', !muted);
  },

  isMuted() {
    return muted;
  },

  unlock() {
    if (typeof window === 'undefined') return;
    if (!audioContext) init();
    if (audioContext && audioContext.state === 'suspended') {
      audioContext.resume();
    }
    this.playMusic();
  },
};
