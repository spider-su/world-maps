/** MIT-licensed Kazuhiko Arase QR encoder (qrcodeVendor.js). */
declare function qrcode(typeNumber: number, errorCorrectionLevel: 'L' | 'M' | 'Q' | 'H'): {
  addData(data: string): void;
  make(): void;
  getModuleCount(): number;
  isDark(row: number, column: number): boolean;
};
export = qrcode;
