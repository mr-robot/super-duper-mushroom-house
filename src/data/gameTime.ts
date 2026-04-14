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

let gameTime: GameTime = {
  elapsedMs: 0,
  isPaused: false,
};

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
}

export function tickGameTime(deltaMs: number): void {
  if (gameTime.isPaused) return;
  gameTime.elapsedMs += Math.floor(deltaMs * gameSpeed);
}

export function pauseGameTime(): void {
  gameTime.isPaused = true;
}

export function resumeGameTime(): void {
  gameTime.isPaused = false;
}

export function setGameSpeed(speed: number): void {
  gameSpeed = Math.max(
    TIME_CALIBRATION.SPEED_MULTIPLIER_MIN,
    Math.min(speed, TIME_CALIBRATION.SPEED_MULTIPLIER_MAX)
  );
}

export function getGameSpeed(): number {
  return gameSpeed;
}

export function formatGameTime(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}