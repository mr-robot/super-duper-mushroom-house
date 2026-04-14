import { describe, it, expect, beforeEach, vi } from 'vitest';
import { getGameTime, resetGameTime, setGameSpeed, getGameSpeed, formatGameTime, pauseGameTime, resumeGameTime, reloadTime } from './gameTime';

const TIME_STORAGE_KEY = 'potion-mixer-game-time';

const store: Record<string, string> = {};
const localStorageMock = {
  getItem: vi.fn((key: string) => store[key] ?? null),
  setItem: vi.fn((key: string, value: string) => { store[key] = value; }),
  removeItem: vi.fn((key: string) => { delete store[key]; }),
  clear: vi.fn(() => { Object.keys(store).forEach(k => delete store[k]); }),
};

beforeEach(() => {
  store[TIME_STORAGE_KEY] = '';
  Object.defineProperty(globalThis, 'localStorage', {
    value: localStorageMock,
    writable: true,
    configurable: true,
  });
  localStorageMock.getItem.mockClear();
  localStorageMock.setItem.mockClear();
  localStorageMock.removeItem.mockClear();
  resetGameTime();
});

describe('GameTime localStorage Persistence', () => {
  it('should save time to localStorage when paused', () => {
    pauseGameTime();
    expect(localStorageMock.setItem).toHaveBeenCalledWith(TIME_STORAGE_KEY, expect.any(String));
  });

  it('should save time to localStorage when resumed', () => {
    resumeGameTime();
    expect(localStorageMock.setItem).toHaveBeenCalled();
  });

  it('should save time to localStorage when speed is changed', () => {
    setGameSpeed(2);
    expect(localStorageMock.setItem).toHaveBeenCalled();
  });

  it('should load time from localStorage on init', () => {
    const savedTime = { elapsedMs: 5000, isPaused: true };
    store[TIME_STORAGE_KEY] = JSON.stringify(savedTime);
    const time = reloadTime();
    expect(time.elapsedMs).toBe(5000);
    expect(time.isPaused).toBe(true);
  });

  it('should reset time and clear localStorage when resetGameTime is called', () => {
    store[TIME_STORAGE_KEY] = JSON.stringify({ elapsedMs: 9999, isPaused: false });
    localStorageMock.removeItem.mockClear();
    resetGameTime();
    expect(localStorageMock.removeItem).toHaveBeenCalledWith(TIME_STORAGE_KEY);
    expect(getGameTime().elapsedMs).toBe(0);
  });

  it('should handle corrupted localStorage gracefully', () => {
    store[TIME_STORAGE_KEY] = 'invalid-json{{';
    resetGameTime();
    expect(getGameTime().elapsedMs).toBe(0);
  });

  it('should handle localStorage errors gracefully', () => {
    localStorageMock.getItem.mockImplementationOnce(() => { throw new Error('storage error'); });
    expect(() => resetGameTime()).not.toThrow();
  });
});

describe('GameTime', () => {
  beforeEach(() => {
    resetGameTime();
  });

  it('should create initial game time with 0 elapsed time', () => {
    const time = getGameTime();
    expect(time.elapsedMs).toBe(0);
  });

  it('should start not paused', () => {
    const time = getGameTime();
    expect(time.isPaused).toBe(false);
  });

  it('should add elapsed time', () => {
    const time = getGameTime();
    time.elapsedMs += 1000;
    expect(time.elapsedMs).toBe(1000);
  });

  it('should format elapsed time as MM:SS', () => {
    const formatted = formatGameTime(65000); // 1 minute 5 seconds
    expect(formatted).toBe('01:05');
  });

  it('should format 0 time as 00:00', () => {
    const formatted = formatGameTime(0);
    expect(formatted).toBe('00:00');
  });

  it('should format large time correctly', () => {
    const formatted = formatGameTime(3661000); // 1 hour 1 minute 1 second
    expect(formatted).toBe('61:01');
  });

  it('should have default game speed of 1', () => {
    expect(getGameSpeed()).toBe(1);
  });

  it('should set game speed', () => {
    setGameSpeed(2);
    expect(getGameSpeed()).toBe(2);
  });

  it('should clamp game speed to minimum 0.1', () => {
    setGameSpeed(0);
    expect(getGameSpeed()).toBe(0.1);
  });

  it('should clamp game speed to maximum 5', () => {
    setGameSpeed(10);
    expect(getGameSpeed()).toBe(5);
  });
});