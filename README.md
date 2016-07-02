# POCA

Yet another scripting language, which is still in the design phase - e.g. the syntax and the builtin standard library objects aren't finalized yet.

## License

zlib-licensed as per LICENSE file.

## Dependencies

To build POCA the following dependencies are required:

- [FLRE](https://github.com/BeRo1985/flre) for the regular expression support in POCA
- [PasMP](https://github.com/BeRo1985/pasmp) for the multithreading-related stuff in POCA
- [PUCU](https://github.com/BeRo1985/pucu) for the Unicode-support-related stuff in POCA

## Compiler

Either Delphi >= 7 or FreePascal >= 3.0 are needed to build POCA.

Here's how to build POCA with the FreePascal compiler:

    fpc -B -O3 -g -gl pocarun.dpr
    
