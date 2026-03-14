export function convertYieldToKg(
  amount: number,
  unit: string,
  averageWeightKg?: number
): number {

  const u = unit.toLowerCase();

  // kg direct
  if (u.includes("kg")) {
    return amount;
  }

  // fruits
  if (u.includes("fruit")) {
    if (averageWeightKg) {
      return amount * averageWeightKg;
    }
    return amount * 0.1;
  }

  // bottes
  if (u.includes("botte")) {
    if (averageWeightKg) {
      return amount * averageWeightKg;
    }
    return amount * 0.25;
  }

  // têtes
  if (u.includes("tête")) {
    if (averageWeightKg) {
      return amount * averageWeightKg;
    }
    return amount * 0.4;
  }

  // arbre (pommiers, poiriers)
  if (u.includes("arbre")) {
    return amount;
  }

  // linéaire (framboises)
  if (u.includes("linéaire")) {
    return amount;
  }

  return amount;
}