import { Laptop, getLaptopPerforma } from '../db';

export interface TopsisRankedItem {
  laptop: Laptop;
  laptop_id: number;
  nama: string;
  merek: string;
  harga: number;
  kondisi: string;
  ram: number;
  storage: number;
  baterai: number;
  berat: number;
  performa: number;
  d_pos: number;
  d_neg: number;
  nilai_v: number;
  skor_persen: number;
  peringkat: number;
}

export interface TopsisResult {
  ranked: TopsisRankedItem[];
  matrix_x: Record<number, Record<string, number>>;
  matrix_r: Record<number, Record<string, number>>;
  matrix_y: Record<number, Record<string, number>>;
  ideal_positive: Record<string, number>;
  ideal_negative: Record<string, number>;
}

export function calculateTopsis(
  laptops: Laptop[],
  rocWeights: Record<string, number>,
  criteriaTypes?: Record<string, 'benefit' | 'cost'>
): TopsisResult {
  if (!laptops || laptops.length === 0) {
    return {
      ranked: [],
      matrix_x: {},
      matrix_r: {},
      matrix_y: {},
      ideal_positive: {},
      ideal_negative: {},
    };
  }

  const criteriaMap: Record<
    string,
    {
      name: string;
      attribute: (l: Laptop) => number;
      type: 'benefit' | 'cost';
    }
  > = {
    C1: {
      name: 'Harga',
      attribute: (l) => Number(l.price || 10000000),
      type: criteriaTypes?.C1 ?? 'cost',
    },
    C2: {
      name: 'Performa',
      attribute: (l) => getLaptopPerforma(l),
      type: criteriaTypes?.C2 ?? 'benefit',
    },
    C3: {
      name: 'RAM',
      attribute: (l) => Number(l.ram_gb || 8),
      type: criteriaTypes?.C3 ?? 'benefit',
    },
    C4: {
      name: 'Storage',
      attribute: (l) => Number(l.storage_gb || 512),
      type: criteriaTypes?.C4 ?? 'benefit',
    },
    C5: {
      name: 'Baterai',
      attribute: (l) => Number(l.battery_hours || 6.0),
      type: criteriaTypes?.C5 ?? 'benefit',
    },
    C6: {
      name: 'Portabilitas',
      attribute: (l) => Number(l.weight_kg || 1.6),
      type: criteriaTypes?.C6 ?? 'cost', // Semakin ringan semakin baik
    },
  };

  const criterionCodes = Object.keys(criteriaMap);

  // 1. Matriks Keputusan X
  const matrixX: Record<number, Record<string, number>> = {};
  for (const laptop of laptops) {
    const row: Record<string, number> = {};
    for (const code of criterionCodes) {
      row[code] = criteriaMap[code].attribute(laptop);
    }
    matrixX[laptop.id] = row;
  }

  // 2. Normalisasi Vektor r_ij = x_ij / sqrt(sum(x_kj^2))
  const divider: Record<string, number> = {};
  for (const code of criterionCodes) {
    let sumSquares = 0.0;
    for (const laptop of laptops) {
      sumSquares += Math.pow(matrixX[laptop.id][code], 2);
    }
    divider[code] = Math.sqrt(sumSquares) || 1.0;
  }

  const matrixR: Record<number, Record<string, number>> = {};
  for (const laptop of laptops) {
    const rRow: Record<string, number> = {};
    for (const code of criterionCodes) {
      rRow[code] = matrixX[laptop.id][code] / divider[code];
    }
    matrixR[laptop.id] = rRow;
  }

  // 3. Matriks Ternormalisasi Terbobot y_ij = W_j * r_ij
  const matrixY: Record<number, Record<string, number>> = {};
  for (const laptop of laptops) {
    const yRow: Record<string, number> = {};
    for (const code of criterionCodes) {
      const w = rocWeights[code] ?? 1.0 / criterionCodes.length;
      yRow[code] = matrixR[laptop.id][code] * w;
    }
    matrixY[laptop.id] = yRow;
  }

  // 4. Menentukan Solusi Ideal Positif (A+) dan Solusi Ideal Negatif (A-)
  const idealPositive: Record<string, number> = {};
  const idealNegative: Record<string, number> = {};

  for (const code of criterionCodes) {
    const values = laptops.map((l) => matrixY[l.id][code]);
    const maxVal = values.length ? Math.max(...values) : 0;
    const minVal = values.length ? Math.min(...values) : 0;

    if (criteriaMap[code].type === 'benefit') {
      idealPositive[code] = maxVal;
      idealNegative[code] = minVal;
    } else {
      idealPositive[code] = minVal;
      idealNegative[code] = maxVal;
    }
  }

  // 5. Menghitung Jarak Euclidean (D+ dan D-) & Nilai Preferensi V_i
  const results: TopsisRankedItem[] = [];
  for (const laptop of laptops) {
    const yRow = matrixY[laptop.id];

    let sumDPos = 0.0;
    let sumDNeg = 0.0;

    for (const code of criterionCodes) {
      sumDPos += Math.pow(yRow[code] - idealPositive[code], 2);
      sumDNeg += Math.pow(yRow[code] - idealNegative[code], 2);
    }

    const dPos = Math.sqrt(sumDPos);
    const dNeg = Math.sqrt(sumDNeg);
    const sumDist = dPos + dNeg;
    const nilaiV = sumDist > 0 ? dNeg / sumDist : 0.0;

    results.push({
      laptop,
      laptop_id: laptop.id,
      nama: laptop.name,
      merek: laptop.brand,
      harga: laptop.price,
      kondisi: laptop.condition || 'baru',
      ram: laptop.ram_gb,
      storage: laptop.storage_gb,
      baterai: laptop.battery_hours,
      berat: laptop.weight_kg,
      performa: getLaptopPerforma(laptop),
      d_pos: Number(dPos.toFixed(5)),
      d_neg: Number(dNeg.toFixed(5)),
      nilai_v: Number(nilaiV.toFixed(6)),
      skor_persen: Number((nilaiV * 100).toFixed(2)),
      peringkat: 0,
    });
  }

  // 6. Urutkan berdasarkan Nilai V terbesar ke terkecil
  results.sort((a, b) => b.nilai_v - a.nilai_v);

  // 7. Berikan nomor peringkat
  results.forEach((item, index) => {
    item.peringkat = index + 1;
  });

  return {
    ranked: results,
    matrix_x: matrixX,
    matrix_r: matrixR,
    matrix_y: matrixY,
    ideal_positive: idealPositive,
    ideal_negative: idealNegative,
  };
}
