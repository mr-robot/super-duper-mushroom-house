import { describe, it, expect, beforeEach } from 'vitest';
import { getGameTime, resetGameTime, setGameSpeed, getGameSpeed, formatGameTime } from './gameTime';

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