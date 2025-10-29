/**
 * Validates an ISBN-13 number.
 * An ISBN-13 must:
 * 1. Be 13 characters long.
 * 2. Contain only digits.
 * 3. Start with "978" or "979".
 * 4. Have a valid check digit.
 * @param isbn The string to validate.
 * @returns True if the string is a valid ISBN-13, false otherwise.
 */
export const isValidISBN = (isbn: string): boolean => {
  if (!isbn || isbn.length !== 13 || !/^\d{13}$/.test(isbn)) {
    return false;
  }

  if (!isbn.startsWith('978') && !isbn.startsWith('979')) {
    return false;
  }

  const digits = isbn.split('').map(Number);
  const checkDigit = digits.pop(); // Remove and get the last digit

  if (typeof checkDigit === 'undefined') {
      return false;
  }

  let sum = 0;
  for (let i = 0; i < 12; i++) {
    sum += digits[i] * (i % 2 === 0 ? 1 : 3);
  }

  const calculatedCheckDigit = (10 - (sum % 10)) % 10;

  return checkDigit === calculatedCheckDigit;
};
