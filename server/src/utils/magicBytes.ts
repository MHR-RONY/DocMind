type DetectedFileType = 'pdf' | 'docx' | 'txt';

const MIME_PDF = 'application/pdf';
const MIME_DOCX =
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
const MIME_TXT = 'text/plain';

// Magic byte signatures.
const PDF_SIGNATURE = [0x25, 0x50, 0x44, 0x46]; // %PDF
const DOCX_SIGNATURE = [0x50, 0x4b, 0x03, 0x04]; // PK\x03\x04 (ZIP)

const hasSignature = (buffer: Buffer, signature: number[]): boolean => {
  if (buffer.length < signature.length) {
    return false;
  }
  for (let i = 0; i < signature.length; i += 1) {
    if (buffer[i] !== signature[i]) {
      return false;
    }
  }
  return true;
};

const isValidUtf8Text = (buffer: Buffer): boolean => {
  if (buffer.length === 0) {
    return false;
  }
  // Reject null bytes — strong indicator of binary, not plain text.
  if (buffer.includes(0x00)) {
    return false;
  }
  // Round-trip through UTF-8 decode/encode; lossy decoding inserts U+FFFD.
  const decoded = buffer.toString('utf8');
  if (decoded.includes('�')) {
    return false;
  }
  return Buffer.byteLength(decoded, 'utf8') === buffer.length;
};

export const validateMagicBytes = (buffer: Buffer, mimetype: string): boolean => {
  switch (mimetype) {
    case MIME_PDF:
      return hasSignature(buffer, PDF_SIGNATURE);
    case MIME_DOCX:
      return hasSignature(buffer, DOCX_SIGNATURE);
    case MIME_TXT:
      return isValidUtf8Text(buffer);
    default:
      return false;
  }
};

export const detectFileType = (
  buffer: Buffer,
  mimetype: string
): DetectedFileType | null => {
  if (!validateMagicBytes(buffer, mimetype)) {
    return null;
  }
  switch (mimetype) {
    case MIME_PDF:
      return 'pdf';
    case MIME_DOCX:
      return 'docx';
    case MIME_TXT:
      return 'txt';
    default:
      return null;
  }
};
