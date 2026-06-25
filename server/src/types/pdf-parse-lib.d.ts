// The pdf-parse package root (index.js) runs a debug self-test that reads a
// sample PDF from disk whenever `module.parent` is falsy (true under tsx/ESM),
// crashing on load. Importing the lib implementation directly avoids that block.
// This declaration re-exposes the upstream types for the deep import path.
declare module 'pdf-parse/lib/pdf-parse.js' {
  import pdfParse = require('pdf-parse');
  export = pdfParse;
}
