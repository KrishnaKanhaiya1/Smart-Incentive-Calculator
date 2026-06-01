export interface SlabInput {
  minUnits: number;
  maxUnits: number | null;
  incentivePerCar: number;
}

/**
 * Validates an array of incentive slabs for structural integrity:
 * - No empty arrays
 * - No negative values
 * - No fractional unit bounds (must be whole integers)
 * - No inverted ranges (max < min)
 * - No gaps or overlaps between adjacent tiers
 * - Open-ended tier (maxUnits=null) must be the final tier
 * - First tier must start at 1
 */
export function validateIncentiveSlabs(
  slabs: SlabInput[]
): { isValid: boolean; error?: string } {
  if (!Array.isArray(slabs) || slabs.length === 0) {
    return { isValid: false, error: "At least one incentive slab is required." };
  }

  // Sort ascending by lower bound
  const sorted = [...slabs].sort((a, b) => a.minUnits - b.minUnits);

  for (let i = 0; i < sorted.length; i++) {
    const current = sorted[i];

    // Reject non-finite or NaN values
    if (!Number.isFinite(current.minUnits) || !Number.isFinite(current.incentivePerCar)) {
      return { isValid: false, error: "All values must be valid finite numbers." };
    }
    if (current.maxUnits !== null && !Number.isFinite(current.maxUnits)) {
      return { isValid: false, error: "Max units must be a valid number or empty (for open-ended tier)." };
    }

    // Reject fractional unit bounds
    if (!Number.isInteger(current.minUnits)) {
      return { isValid: false, error: `Min units must be a whole number. Got: ${current.minUnits}` };
    }
    if (current.maxUnits !== null && !Number.isInteger(current.maxUnits)) {
      return { isValid: false, error: `Max units must be a whole number. Got: ${current.maxUnits}` };
    }

    // Reject negative values
    if (current.minUnits < 0 || current.incentivePerCar < 0) {
      return { isValid: false, error: "Values cannot be negative." };
    }
    if (current.maxUnits !== null && current.maxUnits < 0) {
      return { isValid: false, error: "Max units cannot be negative." };
    }

    // First slab must start at exactly 1
    if (i === 0 && current.minUnits !== 1) {
      return { isValid: false, error: "The first slab must start at exactly 1." };
    }

    // Reject inverted ranges
    if (current.maxUnits !== null && current.maxUnits < current.minUnits) {
      return {
        isValid: false,
        error: `Invalid bounds: Max units (${current.maxUnits}) cannot be less than Min units (${current.minUnits}).`,
      };
    }

    // Adjacency checks for sequential tiers
    if (i > 0) {
      const previous = sorted[i - 1];

      // Open-ended slab must be the final tier
      if (previous.maxUnits === null) {
        return {
          isValid: false,
          error: "An open-ended slab (e.g., 8+) must be the final tier. No subsequent tiers allowed.",
        };
      }

      // Detect gaps or overlaps: next tier must start exactly at previous.maxUnits + 1
      if (current.minUnits !== previous.maxUnits + 1) {
        const expected = previous.maxUnits + 1;
        return {
          isValid: false,
          error: `Slab gap or overlap detected. Tier starting at ${current.minUnits} must start exactly at ${expected}.`,
        };
      }
    }
  }

  return { isValid: true };
}