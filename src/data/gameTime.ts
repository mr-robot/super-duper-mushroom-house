export interface GameTime {
  elapsedMs: number;
  isPaused: boolean;
}

const TIME_CALIBRATION = {
  BASE_TICK_MS: 100,
  SPEED_MULTIPLIER_MIN: 0.1,
  SPEED_MULTIPLIER_MAX: 5,
  DEFAULT_SPEED: 1,
};

const TIME_STORAGE_KEY = 'potion-mixer-game-time';

function loadTime(): GameTime {
  try {
    if (typeof localStorage === 'undefined' || localStorage === null) {
      return createGameTime();
    }
    const saved = localStorage.getItem(TIME_STORAGE_KEY);
    if (saved) {
      return JSON.parse(saved) as GameTime;
    }
  } catch (e) {
    console.warn('Failed to load game time from localStorage:', e);
  }
  return createGameTime();
}

function saveTime(time: GameTime): void {
  try {
    if (typeof localStorage === 'undefined' || localStorage === null) {
      return;
    }
    localStorage.setItem(TIME_STORAGE_KEY, JSON.stringify(time));
  } catch (e) {
    console.warn('Failed to save game time to localStorage:', e);
  }
}

let gameTime: GameTime = loadTime();

let gameSpeed: number = TIME_CALIBRATION.DEFAULT_SPEED;

export function createGameTime(): GameTime {
  return {
    elapsedMs: 0,
    isPaused: false,
  };
}

export function getGameTime(): GameTime {
  return gameTime;
}

export function resetGameTime(): void {
  gameTime = createGameTime();
  gameSpeed = TIME_CALIBRATION.DEFAULT_SPEED;
  if (typeof localStorage !== 'undefined' && localStorage !== null) {
    localStorage.removeItem(TIME_STORAGE_KEY);
  }
}

export function tickGameTime(deltaMs: number): void {
  if (gameTime.isPaused) return;
  gameTime.elapsedMs += Math.floor(deltaMs * gameSpeed);
}

export function pauseGameTime(): void {
  gameTime.isPaused = true;
  saveTime(gameTime);
}

export function resumeGameTime(): void {
  gameTime.isPaused = false;
  saveTime(gameTime);
}

export function setGameSpeed(speed: number): void {
  gameSpeed = Math.max(
    TIME_CALIBRATION.SPEED_MULTIPLIER_MIN,
    Math.min(speed, TIME_CALIBRATION.SPEED_MULTIPLIER_MAX)
  );
  saveTime(gameTime);
}

export function getGameSpeed(): number {
  return gameSpeed;
}

export function reloadTime(): GameTime {
  gameTime = loadTime();
  return gameTime;
}

export function formatGameTime(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}