export const generateEAN13Code = (baseCode) => {
  if (baseCode.length !== 12) {
    throw new Error("Base code must be 12 digits.");
  }
  const oddSum = baseCode
    .split("")
    .filter((_, i) => i % 2 === 0)
    .reduce((sum, digit) => sum + parseInt(digit), 0);

  const evenSum = baseCode
    .split("")
    .filter((_, i) => i % 2 !== 0)
    .reduce((sum, digit) => sum + parseInt(digit) * 3, 0);

  const total = oddSum + evenSum;

  const checkDigit = (10 - (total % 10)) % 10;

  return baseCode + checkDigit;
};

// // Жишээ хэрэглээ
// const code = generateEAN13Code("865123456789"); // Base code (12 оронтой)
// console.log("EAN-13 Бар код:", code); // Үр дүн: 8651234567894
