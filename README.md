# POCA

A yet another scripting language, which's still in the in-progress phase, i.e. the syntax and the builtin standard library objects aren't finalized yet.

## License

zlib-licensed

## Dependencies

You need for to build POCA following dependencies:

- (FLRE)[https://github.com/BeRo1985/flre] for the regular expression support in POCA
- (PasMP)[https://github.com/BeRo1985/pasmp] for the multithreading-related stuff in POCA
- (PUCU)[https://github.com/BeRo1985/pucu] for the Unicode-support-related stuff in POCA

## Compiler

You need for to build POCA either Delphi >= 7 or FreePascal >= 3.0 as the compiler.

And here a example how you can build POCA with the FreePascal compiler:#

    fpc -B -O3 -g -gl pocarun.dpr
    
    



