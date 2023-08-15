
# Introduction

POCA is ECMAScript-like but it's not ECMAScript at all. It has some differences and even some feature, which ECMAScript doesn't have.

# The basics

## Imperative and structured

POCA supports structured programming in the style of C. POCA supports function and block scoping with the keywords var, let and const. POCA requires explicit semicolons, as the idea of automatic semicolon insertion like ECMAScript is a very silly idea in my opinion.

Like C-style languages, control flow is done with the while, for, do / while, if / else, and switch statements. Functions are weakly typed and may accept and return any type. Arguments not provided default to undefined.

## Weakly typed

POCA, like ECMAScript/JavaScript, is weakly typed. This means that certain types are implicitly assigned based on the operation performed in most cases, but not all, to avoid some typical JavaScript/ECMAScript quirks.

## Dynamic

POCA is dynamically typed. Thus, a type is associated with a value rather than an expression. POCA supports various ways to test the type of objects, including duck typing.

## Everything is an expression

In POCA everything is an expression, even statements, declarations and definitions. So the following code is valid POCA code:

```
let a = block{let b = 0; for(let c = 0; c < 6; c++){ b++ }; b; };
let bla = if(a != 0){ 1 }else{ a ? 2 : 3 };
```

Thus, POCA is here essentially a math-expression 'something' that has been supercharged into a complete scripting language.

## How to create variables

```
var x;
let y;
```

## How to use variables

```
x = 5;
y = 6;
let z = x + y;
```

## Values

The POCA syntax defines two types of values:

- Fixed values
- Variable values

Fixed values are called Literals.

Variable values are called Variables.

## Literals

The two most important syntax rules for fixed values are:

Numbers are written with or without decimals:

```
10.50

1001
```

Strings are text, written within double or single quotes:

```  
"John Doe"

'John Doe'  
```
 
## Variables

In a programming language, variables are used to store data values.

POCA uses the keywords var, let and const to declare variables.

An equal sign is used to assign values to variables.

In this example, x is defined as a variable. Then, x is assigned (given) the value 6:

```  
let x;
x = 6;

// or 

let x = 6;
 
```

## Operators

POCA uses arithmetic operators ( + - * / ) to compute values:

```  
(5 + 6) * 10  
```

POCA uses an assignment operator ( = ) to assign values to variables:

```  
let x, y;
x = 5;
y = 6;  
```

## Expressions

An expression is a combination of values, variables, and operators, which computes to a value.

The computation is called an evaluation.

For example, 5 * 10 evaluates to 50:

```  
5 * 10  
```  

Expressions can also contain variable values:

```  
x * 10
```  

The values can be of various types, such as numbers and strings.

For example, `"John" ~ " " ~ "Doe"`, evaluates to `"John Doe"`, since `~` is using for string concatenation:

```  
"John" ~ " " ~ "Doe"  
```

## Keywords

POCA keywords are used to identify actions to be performed.

The `let` keyword is used to create variables:

```  
let x = 5 + 6;
let y = x * 10;  
```

The `var` keyword is also used to create variables:

```  
var x = 5 + 6;
var y = x * 10;  
```

However, the `const` keyword is also used to create constants:

```  
const x = 5 + 6;
const y = x * 10;  
```

## Comments

Not all POCA statements are "executed".

Code after double slashes `//` or between `/*` and `*/` is treated as a comment.

Comments are ignored, and will not be executed:

```
let x = 5;   // I will be executed

// x = 6;   I will NOT be executed
```

## Identifiers / Names

Identifiers are POCA names.

Identifiers are used to name variables and keywords, and functions.

The rules for legal names are the same in most programming languages.

A POCA name must begin with:

- A letter (A-Z or a-z)
- A dollar sign ($)
- Or an underscore (_)

Subsequent characters may be letters, digits, underscores, or dollar signs.

Numbers are not allowed as the first character in names.

This way POCA can easily distinguish identifiers from numbers.

## POCA is Case Sensitive

All POCA identifiers are case sensitive. 

The variables lastName and lastname, are two different variables:

```
let lastName = "Doe";
let lastname = "Peterson";
```

POCA does not interpret LET or Let as the keyword let.

## POCA Character Set

POCA uses the Unicode character set together with the UTF8 internal encoding.

Unicode covers (almost) all the characters, punctuations, and symbols in the world.


# Details

