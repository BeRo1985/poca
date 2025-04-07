# POCA

Yet another scripting language that is still in the design phase - for example, its syntax and built-in standard library are not finalized yet.

## Documentation

- [Syntax](./docs/syntax.adoc)
- [Stdlib](./docs/scriptapi.adoc)

You can also find many short examples of language features and various POCA idioms and  in the [examples](./examples/) directory.

## Dependencies

To build POCA the following dependencies are required:

- [FLRE](https://github.com/BeRo1985/flre) for regular expression support
- [PUCU](https://github.com/BeRo1985/pucu) for Unicode strings and conversions
- [PasMP](https://github.com/BeRo1985/pasmp) for multithreading support
- [PasJSON](https://github.com/BeRo1985/pasjson) for JSON support
- [pasdblstrutils](https://github.com/BeRo1985/pasdblstrutils) for double-precision floating point numbers and string conversions

## Compilation

Either Delphi >= 7 or FreePascal >= 3.0 is required to build POCA.

Here's how to clone the repo and build POCA using the FreePascal compiler:

```sh
# clone
git clone https://github.com/BeRo1985/poca.git
cd poca

# clone dependencies
git submodule init
git submodule update --remote --recursive

# build POCA
fpc -B -O3 -g -gl pocarun.dpr

# run a script (ctrl-c to abort)
bin/poca examples/donut.poca

# run POCA's REPL (ctrl-d to exit)
bin/poca
```

## License

Zlib-licensed as per [LICENSE](./LICENSE) file.
