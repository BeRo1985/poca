class Fib {
  static get(n) {
    if (n < 2) return n
    return get(n - 1) + get(n - 2)
  }
}

var start = IO.clock
IO.print(Fib.get(28))
IO.print(Fib.get(28))
IO.print(Fib.get(28))
IO.print(Fib.get(28))
IO.print(Fib.get(28))
IO.print("elapsed: ", IO.clock - start)
