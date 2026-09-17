# POCA bytecode files

POCA compiles a source file into a tree of code objects and runs those. `POCASaveCodeToStream` writes such a tree into a self-contained file, `POCALoadCodeFromStream` reads it back, and the result runs exactly like freshly compiled code. The file extension is `.pbc`, but nothing goes by the name: a stored file is recognized by its first four bytes.

## Only load bytecode you trust

**Stored bytecode is treated like a shared library, not like input data.** The checksum, the version fields and the verifier catch damaged files, files from another build and files that do not follow the format. Loading itself never reads or writes outside of what belongs to it, whatever the data looks like. Running the loaded code is a different matter: the interpreter has no bounds checks of its own, and the typed opcodes (`ARRAYEXTRACT`, `ARRAYINSERT`, `HASHCOMBINE`, the fused `N_*` ones) rely on types that only the compiler guarantees. Bytecode that was made to do harm can therefore still take the runtime apart, which is why Lua has gone the same way since 5.2.

What follows from that:

- Load bytecode only from where you would also load a source file you would run.
- Scripts cannot load bytecode unless the host sets `TPOCAInstance.AllowByteCodeLoading`, which is off by default (`pocarun --allow-bytecode-loading`).
- The bytecode cache writes next to the sources, so whoever may write there could run code anyway.

## Working with it

On the command line:

```
pocarun -c file.poca [-o file.pbc] [--strip]   store the bytecode
pocarun file.pbc [parameters...]               run stored bytecode
pocarun --disasm file.poca|file.pbc            print the bytecode
pocarun --verify file.poca|file.pbc            check it without running it
pocarun --cache file.poca                      keep the bytecode in .poca-cache
```

From Pascal:

```pascal
procedure POCASaveCodeToStream(const aContext:PPOCAContext;const aStream:TStream;const aCode:TPOCAValue;
                               const aOptions:TPOCAByteCodeSaveOptions=[];
                               const aDependencies:TPOCAByteCodeDependencies=nil);
function POCALoadCodeFromStream(const aInstance:PPOCAInstance;const aContext:PPOCAContext;const aStream:TStream;
                                const aSourceFileName:TPOCARawByteString='<bytecode>'):TPOCAValue;
function POCAIsByteCodeStream(const aStream:TStream):Boolean;
function POCAIsByteCode(const aData:TPOCARawByteString):Boolean;
function POCALoadCodeFromString(...):TPOCAValue;
function POCASaveCodeToString(...):TPOCARawByteString;
function POCAReadByteCodeDependencies(const aStream:TStream;out aDependencies:TPOCAByteCodeDependencies):Boolean;
function POCACompileCached(const aInstance:PPOCAInstance;const aContext:PPOCAContext;
                           const aSource,aSourceFileName:TPOCARawByteString):TPOCAValue;
```

`aOptions` takes `pbsoSTRIPDEBUGINFO` (leaves the line tables out) and `pbsoSTRIPSOURCEINFO` (leaves the source file names out). Everything that goes wrong raises `EPOCAByteCodeError`, whose `Reason` says what kind of problem it was: `pbceMALFORMED`, `pbceTRUNCATED`, `pbceBADSIGNATURE`, `pbceUNSUPPORTEDCONTAINER`, `pbceABIMISMATCH`, `pbceFEATUREMISMATCH`, `pbceCHECKSUMMISMATCH`, `pbceVERIFICATIONFAILED` or `pbceUNSUPPORTEDCODE`.

From a script, the namespace `ByteCode` offers `compile(source[, name])`, `save(code[, strip])`, `load(data[, name])`, `isByteCode(data)` and `info(data)`.

Only code of the outermost level can be stored, which is what a whole source file or `compile` produces. A nested function depends on the frame values around it, so storing it on its own is refused.

## The container

Everything is little endian. Sizes and counts are read before they are used, and nothing that follows may reach past what the header claims.

### Header, 40 bytes

| Offset | Size | Meaning |
|---|---|---|
| 0 | 4 | `'PBCF'` |
| 4 | 2 | container major version, currently 1 |
| 6 | 2 | container minor version, currently 0 |
| 8 | 4 | `POCAByteCodeABIVersion`, currently 2 |
| 12 | 4 | `POCAByteCodeABIFingerprint` of the opcode table |
| 16 | 4 | `POCAByteCodeFeatureFlags` of the build |
| 20 | 4 | file flags: 1 = debug info stripped, 2 = source info stripped |
| 24 | 8 | size of the payload behind the header |
| 32 | 4 | CRC32 over the header, with this field counted as zero, and the payload |
| 36 | 4 | reserved, has to be zero |

A loader refuses anything whose major version, ABI version, fingerprint or feature flags differ from its own: such a file was made by a build that means something else by the same numbers. The minor version is free to grow, so a reader of 1.x reads 1.y.

The **fingerprint** is built in `InitializePOCA` from the ABI version, the feature flags, the number of opcodes and intrinsics, the kinds an argument can have, and the number, name, signature and flags of every opcode in `POCAOpcodeInfos`. It catches a changed opcode table when raising the ABI version was forgotten, but it cannot catch a changed *meaning* of an unchanged opcode.

The **feature flags** hold the build options that change the bytecode itself, currently only `pbffCLOSURECOPYONITERATION` for `POCAClosureCopyOnIteration`.

### Chunks

The payload is a sequence of chunks, each with a 16 byte header: four bytes of id, four reserved bytes and eight bytes of size, followed by that many bytes of content.

A chunk whose id starts with a capital letter is **critical**: a loader that does not know it refuses the file. A chunk starting with a small letter may be skipped, which is how files stay readable for older builds when something is added.

| Id | Kind | Content |
|---|---|---|
| `META` | critical | index of the outermost code object, string index of the POCA version that wrote it |
| `STRS` | critical | the string pool |
| `SRCF` | critical | the source file names |
| `CODE` | critical | the code objects |
| `line` | optional | the line tables, left out with `--strip` |
| `deps` | optional | what the code was compiled from, for the cache |

`META`, `SRCF` and `CODE` refer to strings by their index in `STRS`. Its content is put together last, since everything else adds to it while it is written.

### `STRS`

A count, then per entry one byte of flags (1 = the string is a symbol), a length and the bytes. Strings are stored once per content and flags, so a symbol and a plain string of the same text are two entries: the loader hands out the same symbol value for each use of the former and a string of its own for the latter.

### `SRCF`

A count, then per entry the string index of a file name. A code object refers to a source file by its index here, or `$ffffffff` when it has none, which is what `--strip` leaves behind. `POCALoadCodeFromStream` registers the names in the instance and falls back to the name it was called with.

### `CODE`

A count, then that many code objects. They come in post-order: a code object stands behind everything it refers to, so that references resolve as the loader goes. The outermost one is therefore the last, and `META` names its index.

Each code object is:

| Field | Size | Meaning |
|---|---|---|
| name | 4 | string index |
| level | 4 | how deeply the code is nested in frame values, 0 for the outermost |
| flags | 4 | see below |
| frame values | 4 | how many frame values the code sets up |
| registers | 4 | how many registers it uses |
| inline caches | 4 | how many inline cache slots it has |
| regexps | 4 | how many regular expression slots it has |
| source file | 4 | index in `SRCF`, or `$ffffffff` |
| rest argument symbol | 4 | string index of the rest argument, or `$ffffffff` |
| constants | 4 + n | see below |
| arguments | 4 + n | per argument: symbol, then kind, level and index |
| optional arguments | 4 + n | per argument: symbol, the register holding its default, then kind, level and index |
| bytecode | 4 + n·4 | number of words, then the words |

The flags are `1` uses frame values, `2` class function, `4` fast function, `8` empty, `16` locals as this object, `32` needs an argument array, `64` has rest arguments, `128` has argument locals.

A constant is one byte of kind followed by its value: `0` null and nothing, `1` number and eight bytes of its bit pattern, `2` string and a string index, `3` code and the index of a code object. A constant of any other type cannot be stored.

An instruction is one word of `opcode or (operands shl 8)` followed by that many operand words. What an operand means comes from `POCAOpcodeInfos`, the table the verifier and the disassembler use as well.

Two things are normalized on the way out and in:

- **Hash cache slots** (`pokHASHCACHE`) are written as `$ffffffff`, the state the compiler leaves them in, so that storing before and after a run gives the same bytes.
- **NaN payloads** are folded into `$7ff8000000000000`, keeping only the sign. A NaN with a payload of its own would otherwise look like a reference, see `POCAIsValueNumber`, or turn into one when negated.

Storing is deterministic: the same code gives the same bytes, before as well as after it has run.

### `line`

A count of tables, then per table the index of its code object, a count of entries and that many pairs of instruction position and line number. `--strip` leaves the whole chunk out, and code without it simply has no line numbers in error messages.

### `deps`

A count, then per entry the length and bytes of a file name and eight bytes with the bit pattern of its modification time as a `TDateTime`. The first entry is the source itself, the ones behind it are what it pulled in with `#include`. Only `POCACompileCached` writes this; `pocarun -c` leaves it out.

`POCAReadByteCodeDependencies` reads it without loading the code and says no to anything this build could not load anyway, so that a cache entry counts as out of date then.

## Loading

The loader checks the header, walks the chunks, and builds the code objects from the innermost outwards, each one protected from the garbage collector while it is being filled. Every count and index is checked against what is really there before it is used. Each finished code object goes through `POCACodeFinalize`, which sets up the inline caches and the other things the runtime expects, and through `POCAVerifyCode`.

`POCAVerifyCode` walks the instructions and checks that

- every instruction has the operands its opcode takes, and that nothing runs past the end,
- every register, constant, string, code, inline cache, regexp and frame value index is within what the code object sets aside,
- a code constant loaded with `LOADCONST` is of level 0,
- jumps land on the start of an instruction,
- the levels of frame values that are open at each point fit what the code says it sets up, and what a nested code object can be given at every place it is loaded from.

It checks the structure, not the types the typed opcodes expect, see the section on trust above.

## The cache

`POCACompileCached` keeps the bytecode of a source file in `<directory of the source>/.poca-cache/<name>.pbc`. It is only used when `TPOCAInstance.ByteCodeCache` is set, which `pocarun --cache` does; without it nothing is written and nothing is read.

The cache entry fits when every file in its `deps` chunk still has the modification time stored there. Otherwise the source is compiled again and the file is written anew: into a temporary file first, which is then renamed, so that a reader never sees half a file. A cache file that cannot be read, does not fit or was made by another build is simply replaced, and a cache that cannot be written at all is no reason to fail.

Since the check goes by modification times, a change within the same second that leaves the time as it was goes unnoticed. That is the price for not having to read and hash every file at startup.

A repository with sources that are run this way wants `.poca-cache/` in its `.gitignore`.

## Bytecode inside value data files

`POCASaveValueToStream` stores POCA values in the `PVDF` format. With its parameter `aSaveCode` a code value or a function of the outermost level is stored as well: the type byte `pvftCODE` or `pvftFUNCTION`, directly followed by the bytes of a whole `PBCF` file, which knows its own size.

Only then does the writer put version 2 in the header instead of version 1, so data without code stays byte for byte what older builds already read. The loader takes versions 1 and 2 but loads code only when it is called with `aAllowCode`. A stored function comes back bound to the loading context, the way `compile` hands one out.

## When does `POCAByteCodeABIVersion` have to go up?

Raise it whenever stored bytecode of the old number would mean something else to the new build:

- a new opcode, a removed opcode or a changed opcode number;
- a changed operand layout of an existing opcode, including a new optional operand;
- a changed meaning of an operand, for example another way of counting levels;
- a new or changed kind of constant;
- changed intrinsic ids (`piid*`), since they travel as plain operands;
- new or changed flags of a code object, or a new field in one;
- a new field in the format of an argument;
- anything else a loader of the old number would read as before and get wrong.

Not a reason to raise it: a new optional chunk, a new file flag that only says what has been left out, or a change that leaves the stored form alone. Those are what the minor version and the small-letter chunks are for.

A build option that changes the bytecode gets a **feature flag** instead, so that two builds of the same version do not read each other's files wrongly.

If the opcode table changes and the ABI version stays, the fingerprint still stops the file from being loaded. Do not rely on it: it says "compile it again" where a raised ABI version would have said what really changed.

There is no upgrader for old files. They are compiled again from the source, which is what the cache does on its own.

## Tests

- `tests/ByteCodeVerifierTest.dpr` bends verified bytecode in every way that has to be caught and checks that the verifier catches it.
- `tests/ByteCodeFileTest.dpr` checks that storing is deterministic, that loaded code behaves like compiled code, that the dependencies and the value data files come back as they went in, and that damaged, cut off, changed and fuzzed data always fails with an `EPOCAByteCodeError` and nothing else.
- `tests/ByteCodeRoundTripTest.dpr` runs the test suite, the unit test files and a set of examples twice, once from the source and once through storing and loading, and holds what they print and return against each other.
- The build defines `POCAVerifyByteCodeAfterCompile` and `POCAByteCodeRoundTripAfterCompile` put the verifier, or a whole store and load, behind every compilation, which is the widest net over the whole corpus.
