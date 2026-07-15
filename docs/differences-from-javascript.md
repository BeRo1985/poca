# Differences from JavaScript

POCA deliberately looks like JavaScript, so most JavaScript knowledge transfers directly: `let`/`const`, functions and closures, arrow functions, template strings, classes, `try`/`catch`/`finally`, `?.` and `??`, destructuring-style idioms, modules, JSON, regex literals. But POCA is its own language, not an ECMAScript implementation. This page lists the differences that most often surprise developers coming from JavaScript, roughly ordered by how likely they are to bite.

## `+` is always numeric, `~` concatenates

The `+` operator never concatenates. Strings are coerced to numbers, in every operand position:

```javascript
puts("3" + 5);     // 8, not "35"
puts("a" + "b");   // -Infinity (see string coercion below)
```

String (and array) concatenation uses the `~` operator, which coerces numbers to strings, or template strings:

```javascript
puts("John" ~ " " ~ "Doe");  // John Doe
puts("x" ~ 5);               // x5
puts([1, 2] ~ [3]);          // array with length 3
let s = "a"; s ~= "b";       // ab
let k = `key_${i}`;          // template strings work as in JavaScript
```

## String-to-number coercion is pervasive

Where JavaScript prefers string contexts, POCA prefers numeric contexts. Numeric strings behave as numbers in arithmetic and truthiness checks. Two consequences:

- `"0"` is **falsy** (in JavaScript it is truthy):

```javascript
puts("0" ? "t" : "f");  // f
puts("" ? "t" : "f");   // f (same as JavaScript)
puts([] ? "t" : "f");   // t (same as JavaScript)
```

- A string that does not parse as a number currently evaluates to `-Infinity` in numeric contexts (not `NaN`). Do not rely on this value, treat any `-Infinity` showing up in string-heavy code as a hint that a `+` should have been a `~`.

## There is no `undefined`, missing accesses throw

POCA has a single `null` value. Reading something that does not exist is an error, not a silent `undefined`:

```javascript
let h = {a: 1};
puts(h.missing);   // RuntimeError: No such member: missing
let arr = [1, 2, 3];
puts(arr[7]);      // RuntimeError: Out of bounds
puts(zzz);         // RuntimeError: Undefined symbol: zzz
```

This is deliberate: typos and stale keys fail at the access site instead of surfacing as `NaN` three expressions later. When a value is legitimately optional, say so in the code with the safe access operators, which yield `null` instead of throwing:

```javascript
puts(h?.missing);          // null
puts(arr?[7] ?? "oob");    // oob
puts(h?.missing ?? 42);    // 42
```

**Important nuance:** `??` alone does not protect a plain access. `h.missing ?? 42` still throws, because the missing-member error happens before `??` ever sees a value. Combine it with the safe access operators: `h?.missing ?? 42`.

## There is no separate boolean type

`true` and `false` are predefined constants for the numbers `1` and `0`. Comparisons return numbers, `typeof(true)` is `Number`, and boolean values take part in arithmetic:

```javascript
puts(typeof(true));  // Number
puts(true + true);   // 2
puts(1 === true);    // 1 (true, they are the same value)
puts(2 == true);     // 0 (false, 2 is not 1; write if (x) instead of x == true)
```

The distinction that matters, absence versus a legitimate zero/false value, is preserved by `??` and `===`:

```javascript
puts(null === 0);   // 0 (false, strict equality distinguishes them)
let count = 0;
puts(count ?? 10);  // 0 (?? only triggers on null)
```

**JSON round-trip:** `JSON.parse` turns `true`/`false` into `1`/`0`, and `JSON.stringify` writes them back as numbers. JSON booleans therefore do not survive a round-trip through POCA. This does not matter for POCA-internal data, but external APIs or schema validators that require real JSON booleans need explicit handling on the host side.

## Loose equality treats `null` numerically

`null == 0` and `null == false` are true in POCA (in JavaScript, `null == 0` is false). Use `===`/`!==` whenever the difference between "absent" and "zero" matters.

## Bitwise operators use the full 53-bit integer range

JavaScript truncates bitwise operands to 32 bits, POCA does not:

```javascript
puts(1 << 40);  // 1099511627776 (in JavaScript: 256)
```

All numbers are IEEE 754 doubles, so the usable integer range for bitwise operations is 53 bits. There is no BigInt.

## Scoping: declaration order instead of hoisting, and dynamic `var`

There is no hoisting and no temporal dead zone:

- `let`/`const` are statically scoped by declaration order. Referencing one before its textual declaration is a compile-time error, and they can be allocated to registers (which is why they are fast).
- `var` is dynamically scoped and resolved at runtime through the function's variable hash table. It can be referenced from code that runs before its textual declaration, and it is slower than `let`/`const`.
- `fastfunction` forbids `var` entirely so that all locals live in registers or frame storage.

See the "Static vs Dynamic Scoping" and "Fast Functions" sections in `syntax.adoc` for details.

## Classes: familiar surface, different body syntax and field semantics

POCA classes are syntactic sugar over the prototype-based `Hash` OOP model (`typeof` of a class is `Class`, `typeof` of an instance is `Hash`). `extends`, `constructor`, `super(...)` in constructors, `new` and `instanceof` all work as expected, and calling a class without `new` throws, just like in ES6. The differences:

**Declaration keywords.** Fields are declared with `var`, methods with `function`, and parameters with `let`:

```javascript
class Test extends BaseClass {
  var a = 0;
  constructor(let v){ this.a = v; }
  function getA(){ return this.a; }
}
```

**Field initializers live on the class, not on the instance.** In JavaScript, a class field initializer runs once per instance. In POCA, `var a = 0;` in a class body places the default value on the class hash, and instances only get their own member when it is assigned (for example in the constructor). For scalar defaults this is invisible, but a **mutable default is shared between all instances**, like a Python class attribute:

```javascript
class C {
  var arr = [];
}
let a = new C();
let b = new C();
a.arr.push(1);
puts(b.arr.length);   // 1, both instances see the same array
puts(a.arr == b.arr); // 1 (true)
```

Initialize mutable per-instance state in the constructor (`this.arr = [];`) instead of in a field initializer.

**No static/instance separation.** The class hash is at the same time the "constructor object" and the prototype of its instances. A member defined on the class is reachable both as `Test.member` and, through the prototype chain, as `instance.member`. There is no `static` keyword because everything on the class behaves that way.

**Methods can be added to an existing class after the fact**, in three equivalent ways:

```javascript
function Test.c(){ ... }
function Test::d(){ ... }
Test.e = function(){ ... };
```

**`super` also works inside ordinary methods.** In a constructor, `super(...)` calls the parent constructor as in JavaScript. Inside a method, a bare `super(...)` calls the same-named method of the parent class, and `super.name(...)` calls any other parent method. JavaScript has no bare-`super()` call outside of constructors.

**Operator overloading integrates with class syntax.** Defining hash event methods such as `__add` directly in a class body makes the operators work on instances:

```javascript
class V {
  var x = 0;
  constructor(let v){ this.x = v; }
  function __add(let a, let b){ return new V(a.x + b.x); }
}
puts(((new V(5)) + (new V(3))).x);  // 8
```

Note that inside such event handlers `this` can be `null`, use the explicit parameters instead.

**Built-in reflection.** Instances and classes expose `className` (the class name as a string) and `classType` (the class itself, usable as `new instance.classType(...)`), and `forkey(key; obj){ ... }` iterates over members. There is no accessor (`get`/`set`) syntax; property interception is done with the `__get`/`__set` hash events instead. There are also no private fields (`#name`), a POCA object is an open hash.

**Detached methods do not throw on `this`.** Extracting a method from an instance and calling it standalone does not raise a `this` error as in strict-mode JavaScript; the call falls back to the binding captured at definition time (the class hash), so it sees the class-level field defaults instead of any instance state. If you need a bound callback, wrap it in a closure: `let f = () => i.getX();`.

## Semicolons are required

Automatic semicolon insertion is off by default (`SyntaxError: Missed semicolon`). The embedding host can opt into ASI, but portable POCA code should always write semicolons.

## Regular expressions: FLRE, with methods on the regex object

Regex literals exist, but the engine is FLRE, not an ECMAScript regex engine, so syntax and flags differ in places. The operation direction is also reversed compared to JavaScript: methods live on the regex object and take the string as argument:

```javascript
puts(/\s+/.split("a b  c").length);  // 3 (in JavaScript: "a b  c".split(/\s+/))
```

There are also the regex match operators `=~` and `!~` and per-code-point versus per-code-unit string indexing, see `syntax.adoc` and the RegExp section of `scriptapi.adoc`.

## Exceptions: declare the catch binding, engine errors are arrays

Declare the catch variable with `let`:

```javascript
try {
  let h = {};
  h.missing;
} catch(let e) {
  puts(typeof(e));  // Array
  puts(e[0]);       // No such member: missing
}
```

`throw` accepts any value, exactly that value arrives at the catch site. Errors raised by the engine itself arrive as arrays of the form `[message, kind, sourceFile, line]`, not as `Error` objects.

## Everything is an expression

Statements, blocks and declarations yield values, so constructs that are statements in JavaScript can be used as expressions in POCA:

```javascript
let a = scope{ let b = 0; for(let c = 0; c < 6; c++){ b++; }; b; };
let bla = if(a != 0){ 1 }else{ a ? 2 : 3 };
```

## Features JavaScript does not have

Not differences to work around, but capabilities to be aware of, since idiomatic POCA uses them where JavaScript code would need workarounds:

- **Operator overloading** through hash events (`__add`, `__sub`, `__mul`, `__div`, `__get`, `__set`, ...), see "Hash events/Operator overloading" in `syntax.adoc`.
- **Real coroutines** (`Coroutine.create`/`resume`/`yield`), not just generators.
- **Threads, locks and semaphores** as language-level features.
- **A C-style preprocessor** (`#define`, `#ifdef`, `#include`, ...).
- **`fastfunction`** as an explicit performance escape hatch.
- **`when`** as an additional control-flow construct next to `switch`.
- **Integrated object graph serialization** (dump/load), suitable for savegames.
- **A scriptable garbage collector API** (`GarbageCollector.*`) with tunable incremental collection, see `garbagecollector.md`.
