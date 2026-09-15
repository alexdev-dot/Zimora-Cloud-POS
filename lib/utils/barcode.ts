/**
 * Generate a valid random EAN-13 barcode
 * EAN-13 requires 13 digits where the last digit is a checksum
 */
export function generateEAN13(): string {
  // Generate first 12 digits randomly
  let barcode = "";
  for (let i = 0; i < 12; i++) {
    barcode += Math.floor(Math.random() * 10).toString();
  }
  
  // Calculate checksum for EAN-13
  const checksum = calculateEAN13Checksum(barcode);
  return barcode + checksum;
}

/**
 * Calculate EAN-13 checksum digit
 */
function calculateEAN13Checksum(barcode: string): string {
  let sum = 0;
  for (let i = 0; i < 12; i++) {
    const digit = parseInt(barcode[i]);
    // Multiply by 3 for odd positions (1, 3, 5, 7, 9, 11) and by 1 for even positions
    sum += (i % 2 === 0) ? digit * 1 : digit * 3;
  }
  const checksum = (10 - (sum % 10)) % 10;
  return checksum.toString();
}

/**
 * Generate a valid random UPC barcode
 * UPC requires 12 digits where the last digit is a checksum
 */
export function generateUPC(): string {
  // Generate first 11 digits randomly
  let barcode = "";
  for (let i = 0; i < 11; i++) {
    barcode += Math.floor(Math.random() * 10).toString();
  }
  
  // Calculate checksum for UPC
  const checksum = calculateUPCChecksum(barcode);
  return barcode + checksum;
}

/**
 * Calculate UPC checksum digit
 */
function calculateUPCChecksum(barcode: string): string {
  let sum = 0;
  for (let i = 0; i < 11; i++) {
    const digit = parseInt(barcode[i]);
    // Multiply by 3 for odd positions and by 1 for even positions
    sum += (i % 2 === 0) ? digit * 3 : digit * 1;
  }
  const checksum = (10 - (sum % 10)) % 10;
  return checksum.toString();
}

/**
 * Generate a valid random CODE128 barcode
 * CODE128 can encode alphanumeric characters
 */
export function generateCODE128(): string {
  const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789 ";
  const length = Math.floor(Math.random() * 8) + 8; // 8-16 characters
  let barcode = "";
  
  for (let i = 0; i < length; i++) {
    barcode += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  
  return barcode;
}

/**
 * Generate a valid random CODE39 barcode
 * CODE39 can encode uppercase letters A-Z, digits 0-9, and special characters
 */
export function generateCODE39(): string {
  const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789-.$/+%";
  const length = Math.floor(Math.random() * 6) + 6; // 6-12 characters
  let barcode = "";
  
  for (let i = 0; i < length; i++) {
    barcode += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  
  return barcode;
}

/**
 * Generate a random value for QR code
 * QR codes can encode any string
 */
export function generateQRCode(): string {
  const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  const length = Math.floor(Math.random() * 8) + 8; // 8-16 characters
  let code = "";
  
  for (let i = 0; i < length; i++) {
    code += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  
  return code;
}

/**
 * Generate a random barcode value based on format
 */
export function generateRandomBarcode(format: string): string {
  switch (format) {
    case "EAN13":
      return generateEAN13();
    case "UPC":
      return generateUPC();
    case "CODE128":
      return generateCODE128();
    case "CODE39":
      return generateCODE39();
    case "QRCODE":
      return generateQRCode();
    default:
      return generateCODE128(); // Default to CODE128
  }
}
