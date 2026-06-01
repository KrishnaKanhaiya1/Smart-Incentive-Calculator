interface SlabInput {
  id: string;
  minUnits: number;
  maxUnits: number | null;
  incentivePerCar: number;
}

interface CalculationResult {
  currentTier: SlabInput | null;
  nextTier: SlabInput | null;
  carsNeededForNextTier: number | null;
  totalIncentive: number;
}

/**
 * Computes the payout and tier metrics for a specific quantity of cars sold
 * based on the active dynamic slab configurations.
 */
export function calculatePayout(quantity: number, slabs: SlabInput[]): CalculationResult {
  const sortedSlabs = [...slabs].sort((a, b) => a.minUnits - b.minUnits);
  
  // Find the active tier the user currently falls into
  const currentTier = sortedSlabs.find(slab => {
    if (slab.maxUnits === null) return quantity >= slab.minUnits;
    return quantity >= slab.minUnits && quantity <= slab.maxUnits;
  }) || null;

  // Find the immediate next tier upward
  const currentTierIndex = currentTier ? sortedSlabs.indexOf(currentTier) : -1;
  const nextTier = currentTierIndex !== -1 && currentTierIndex + 1 < sortedSlabs.length 
    ? sortedSlabs[currentTierIndex + 1] 
    : currentTierIndex === -1 && sortedSlabs.length > 0 
      ? sortedSlabs[0] 
      : null;

  const carsNeededForNextTier = nextTier ? nextTier.minUnits - quantity : null;
  
  // Rule: Flat rate payout based on the highest achieved tier rate
  const rate = currentTier ? currentTier.incentivePerCar : 0;
  const totalIncentive = quantity * rate;

  return {
    currentTier,
    nextTier,
    carsNeededForNextTier,
    totalIncentive,
  };
}
