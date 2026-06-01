import { describe, it, expect } from 'vitest';
import { calculatePayout } from './calc';

describe('calculatePayout', () => {
  const defaultSlabs = [
    { id: '1', minUnits: 1, maxUnits: 3, incentivePerCar: 1000 },
    { id: '2', minUnits: 4, maxUnits: 7, incentivePerCar: 2500 },
    { id: '3', minUnits: 8, maxUnits: 12, incentivePerCar: 5000 },
    { id: '4', minUnits: 13, maxUnits: 20, incentivePerCar: 8000 },
    { id: '5', minUnits: 21, maxUnits: null, incentivePerCar: 12000 },
  ];

  it('should calculate payout for quantity in first tier (flat rate)', () => {
    const result = calculatePayout(2, defaultSlabs);
    expect(result.totalIncentive).toBe(2000); // 2 * 1000
    expect(result.currentTier?.incentivePerCar).toBe(1000);
    expect(result.carsNeededForNextTier).toBe(2); // Next starts at 4, 4 - 2 = 2
  });

  it('should calculate payout for quantity in second tier (flat rate)', () => {
    const result = calculatePayout(5, defaultSlabs);
    expect(result.totalIncentive).toBe(12500); // 5 * 2500
    expect(result.currentTier?.incentivePerCar).toBe(2500);
    expect(result.carsNeededForNextTier).toBe(3); // Next starts at 8, 8 - 5 = 3
  });

  it('should calculate payout for quantity exactly at boundaries', () => {
    const resultMin = calculatePayout(8, defaultSlabs);
    expect(resultMin.totalIncentive).toBe(40000); // 8 * 5000
    expect(resultMin.currentTier?.incentivePerCar).toBe(5000);
    
    const resultMax = calculatePayout(12, defaultSlabs);
    expect(resultMax.totalIncentive).toBe(60000); // 12 * 5000
    expect(resultMax.currentTier?.incentivePerCar).toBe(5000);
  });

  it('should calculate payout for quantity in top tier (open ended)', () => {
    const result = calculatePayout(30, defaultSlabs);
    expect(result.totalIncentive).toBe(360000); // 30 * 12000
    expect(result.currentTier?.incentivePerCar).toBe(12000);
    expect(result.nextTier).toBeNull();
    expect(result.carsNeededForNextTier).toBeNull();
  });

  it('should handle zero quantity', () => {
    const result = calculatePayout(0, defaultSlabs);
    expect(result.totalIncentive).toBe(0);
    expect(result.currentTier).toBeNull();
    expect(result.nextTier?.minUnits).toBe(1);
    expect(result.carsNeededForNextTier).toBe(1);
  });

  it('should handle empty slabs list safely', () => {
    const result = calculatePayout(10, []);
    expect(result.totalIncentive).toBe(0);
    expect(result.currentTier).toBeNull();
    expect(result.nextTier).toBeNull();
  });

  it('should handle single slab configurations', () => {
    const singleSlab = [
      { id: '1', minUnits: 1, maxUnits: null, incentivePerCar: 500 },
    ];
    const result = calculatePayout(10, singleSlab);
    expect(result.totalIncentive).toBe(5000); // 10 * 500
  });

  it('should handle unsorted slabs by sorting internally', () => {
    const unsortedSlabs = [
      { id: '3', minUnits: 8, maxUnits: null, incentivePerCar: 5000 },
      { id: '1', minUnits: 1, maxUnits: 3, incentivePerCar: 1000 },
      { id: '2', minUnits: 4, maxUnits: 7, incentivePerCar: 2500 },
    ];
    const result = calculatePayout(6, unsortedSlabs);
    expect(result.totalIncentive).toBe(15000); // 6 * 2500
  });
});
