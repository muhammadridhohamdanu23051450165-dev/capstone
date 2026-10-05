export interface RocResult {
  [kode: string]: {
    prioritas: number;
    bobot: number;
  };
}

export function calculateRocWeights(orderedCriterionCodes: string[]): RocResult {
  const k = orderedCriterionCodes.length;
  if (k === 0) return {};

  const result: RocResult = {};
  let rank = 1;

  for (const code of orderedCriterionCodes) {
    let sum = 0.0;
    for (let j = rank; j <= k; j++) {
      sum += 1.0 / j;
    }

    const weight = sum / k;
    result[code] = {
      prioritas: rank,
      bobot: Number(weight.toFixed(4)),
    };

    rank++;
  }

  // Normalisasi presisi agar jumlah tepat 1.0000
  const totalWeight = Object.values(result).reduce((acc, curr) => acc + curr.bobot, 0);
  if (totalWeight > 0 && Math.abs(totalWeight - 1.0) > 0.0001) {
    const diff = 1.0 - totalWeight;
    const firstKey = orderedCriterionCodes[0];
    if (result[firstKey]) {
      result[firstKey].bobot = Number((result[firstKey].bobot + diff).toFixed(4));
    }
  }

  return result;
}
