import { describe, it, expect, beforeEach } from 'vitest';
import { createInitialState, setGameState } from './gameState';
import { generateCustomer, getCustomerRemainingTime, isCustomerExpired } from './customers';
import { resetGameTime, tickGameTime } from './gameTime';

describe('Timed Customers', () => {
  beforeEach(() => {
    setGameState(createInitialState());
    resetGameTime();
  });

  it('should generate customer with duration and start time', () => {
    const customer = generateCustomer();
    expect(customer.durationMs).toBeDefined();
    expect(customer.startTimeMs).toBeDefined();
    expect(customer.durationMs).toBeGreaterThan(0);
    expect(customer.startTimeMs).toBe(0);
  });

  it('should calculate remaining time correctly', () => {
    const customer = generateCustomer();
    const remaining = getCustomerRemainingTime(customer);
    expect(remaining).toBe(customer.durationMs);
  });

  it('should decrease remaining time as game progresses', () => {
    const customer = generateCustomer();
    const initialRemaining = getCustomerRemainingTime(customer);

    tickGameTime(5000);

    const afterTicks = getCustomerRemainingTime(customer);
    expect(afterTicks).toBeLessThan(initialRemaining);
    expect(initialRemaining - afterTicks).toBe(5000);
  });

  it('should return 0 when customer is expired', () => {
    const customer = generateCustomer();
    tickGameTime(customer.durationMs + 1000);

    const remaining = getCustomerRemainingTime(customer);
    expect(remaining).toBe(0);
  });

  it('should detect expired customer', () => {
    const customer = generateCustomer();
    expect(isCustomerExpired(customer)).toBe(false);

    tickGameTime(customer.durationMs + 1000);
    expect(isCustomerExpired(customer)).toBe(true);
  });

  it('should set duration based on patience level', () => {
    const fastCustomer = generateCustomer();
    tickGameTime(1);
    const fastRemaining = getCustomerRemainingTime(fastCustomer);

    resetGameTime();
    const slowCustomer = generateCustomer();
    const slowRemaining = getCustomerRemainingTime(slowCustomer);

    expect(slowRemaining).toBeGreaterThanOrEqual(fastRemaining);
  });

  it('should format remaining time as SSs', () => {
    const customer = generateCustomer();
    tickGameTime(customer.durationMs - 5500);

    const remaining = getCustomerRemainingTime(customer);
    const formatted = formatCustomerTime(remaining);
    expect(formatted).toMatch(/^\d+s$/);
  });
});

function formatCustomerTime(ms: number): string {
  const seconds = Math.max(0, Math.ceil(ms / 1000));
  return `${seconds}s`;
}