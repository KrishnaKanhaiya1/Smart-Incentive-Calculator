import { describe, it, expect } from 'vitest';
import { validateIncentiveSlabs } from './validations';
import {
  sanitizeEmail,
  sanitizeNumber,
  sanitizeString,
  preventXSS,
} from './sanitize';

describe('validateIncentiveSlabs', () => {
  it('should validate correct slab configuration', () => {
    const slabs = [
      { minUnits: 1, maxUnits: 50, incentivePerCar: 1000 },
      { minUnits: 51, maxUnits: 100, incentivePerCar: 1500 },
    ];
    const result = validateIncentiveSlabs(slabs);
    expect(result.isValid).toBe(true);
    expect(result.error).toBeUndefined();
  });

  it('should detect gap between slabs', () => {
    const slabs = [
      { minUnits: 1, maxUnits: 50, incentivePerCar: 1000 },
      { minUnits: 52, maxUnits: 100, incentivePerCar: 1500 }, // Gap at 51
    ];
    const result = validateIncentiveSlabs(slabs);
    expect(result.isValid).toBe(false);
    expect(result.error).toContain('gap or overlap');
  });

  it('should detect overlapping slabs', () => {
    const slabs = [
      { minUnits: 1, maxUnits: 60, incentivePerCar: 1000 },
      { minUnits: 50, maxUnits: 100, incentivePerCar: 1500 }, // Overlaps at 50-60
    ];
    const result = validateIncentiveSlabs(slabs);
    expect(result.isValid).toBe(false);
    expect(result.error).toContain('gap or overlap');
  });

  it('should reject negative minimum units', () => {
    const slabs = [
      { minUnits: -5, maxUnits: 50, incentivePerCar: 1000 },
    ];
    const result = validateIncentiveSlabs(slabs);
    expect(result.isValid).toBe(false);
    expect(result.error).toContain('cannot be negative');
  });

  it('should reject min > max', () => {
    const slabs = [
      { minUnits: 1, maxUnits: 50, incentivePerCar: 1000 },
      { minUnits: 51, maxUnits: 20, incentivePerCar: 1500 }, // min 51 > max 20
    ];
    const result = validateIncentiveSlabs(slabs);
    expect(result.isValid).toBe(false);
    expect(result.error).toContain('cannot be less than Min');
  });

  it('should accept first tier starting at 1', () => {
    const slabs = [
      { minUnits: 1, maxUnits: 50, incentivePerCar: 1000 },
      { minUnits: 51, maxUnits: null, incentivePerCar: 1500 },
    ];
    const result = validateIncentiveSlabs(slabs);
    expect(result.isValid).toBe(true);
  });

  it('should reject first tier not starting at 1', () => {
    const slabs = [
      { minUnits: 2, maxUnits: 50, incentivePerCar: 1000 },
    ];
    const result = validateIncentiveSlabs(slabs);
    expect(result.isValid).toBe(false);
    expect(result.error).toContain('start at exactly 1');
  });

  it('should handle empty slab array', () => {
    const result = validateIncentiveSlabs([]);
    expect(result.isValid).toBe(false);
    expect(result.error).toContain('required');
  });

  it('should reject negative rates', () => {
    const slabs = [
      { minUnits: 1, maxUnits: 50, incentivePerCar: -1000 },
    ];
    const result = validateIncentiveSlabs(slabs);
    expect(result.isValid).toBe(false);
    expect(result.error).toContain('cannot be negative');
  });

  it('should accept zero rate (edge case)', () => {
    const slabs = [
      { minUnits: 1, maxUnits: 50, incentivePerCar: 0 },
      { minUnits: 51, maxUnits: null, incentivePerCar: 1000 },
    ];
    const result = validateIncentiveSlabs(slabs);
    expect(result.isValid).toBe(true);
  });
});

describe('sanitizeEmail', () => {
  it('should validate correct email', () => {
    const result = sanitizeEmail('user@example.com');
    expect(result).toBe('user@example.com');
  });

  it('should reject email without @', () => {
    expect(() => sanitizeEmail('userexample.com')).toThrow();
  });

  it('should reject email without domain', () => {
    expect(() => sanitizeEmail('user@')).toThrow();
  });

  it('should handle whitespace', () => {
    const result = sanitizeEmail('  user@example.com  ');
    expect(result).toBe('user@example.com');
  });

  it('should reject invalid email formats', () => {
    expect(() => sanitizeEmail('user@.com')).toThrow();
    expect(() => sanitizeEmail('@example.com')).toThrow();
    expect(() => sanitizeEmail('user@com')).toThrow();
  });
});

describe('sanitizeNumber', () => {
  it('should accept valid numbers in range', () => {
    const result = sanitizeNumber(50, 0, 100);
    expect(result).toBe(50);
  });

  it('should throw for numbers above max', () => {
    expect(() => sanitizeNumber(150, 0, 100)).toThrow();
  });

  it('should throw for numbers below min', () => {
    expect(() => sanitizeNumber(-10, 0, 100)).toThrow();
  });

  it('should handle decimal input (floor)', () => {
    const result = sanitizeNumber(50.7, 0, 100);
    expect(result).toBe(50);
  });

  it('should handle string numbers', () => {
    const result = sanitizeNumber('50' as any, 0, 100);
    expect(result).toBe(50);
  });
});

describe('sanitizeString', () => {
  it('should trim whitespace', () => {
    const result = sanitizeString('  hello  ', 100);
    expect(result).toBe('hello');
  });

  it('should truncate to max length', () => {
    const result = sanitizeString('hello world', 5);
    expect(result).toBe('hello');
  });

  it('should handle empty strings', () => {
    const result = sanitizeString('', 100);
    expect(result).toBe('');
  });

  it('should trim and truncate', () => {
    const result = sanitizeString('  hello world  ', 8);
    expect(result).toBe('hello wo');
  });
});

describe('preventXSS', () => {
  it('should encode HTML entities', () => {
    const input = '<script>alert("xss")</script>';
    const result = preventXSS(input);
    expect(result).not.toContain('<script>');
    expect(result).toContain('&lt;');
  });

  it('should encode quotes', () => {
    const input = 'He said "Hello"';
    const result = preventXSS(input);
    expect(result).toContain('&quot;');
  });

  it('should handle ampersands', () => {
    const input = 'Tom & Jerry';
    const result = preventXSS(input);
    expect(result).toContain('&amp;');
  });

  it('should preserve normal text', () => {
    const input = 'Hello World 123';
    const result = preventXSS(input);
    expect(result).toBe('Hello World 123');
  });

  it('should encode event handlers', () => {
    const input = '<img src=x onerror="alert(1)">';
    const result = preventXSS(input);
    expect(result).toContain('&lt;img');
    expect(result).toContain('onerror=&quot;');
  });
});
