
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

$ pocarun primes.poca
time: 0.017 seconds, primes: 17984
time: 6.829 seconds, primes: 17984
time: 6.776 seconds, primes: 17984

$ lua primes.lua 
time: 0.05735200 seconds, primes: 17984.000000
time: 13.15466300 seconds, primes: 17984.000000
time: 13.93256000 seconds, primes: 17984.000000

$ luajit primes.lua 
time: 0.00898900 seconds, primes: 17984.000000
time: 2.29475500 seconds, primes: 17984.000000
time: 2.29416200 seconds, primes: 17984.000000

$ python3 primes.py
time: 0.32981652 seconds, primes: 17984
time: 87.46743209 seconds, primes: 17984
time: 88.29283157 seconds, primes: 17984

$ wren primes.wren
17984
elapsed: 0.191021
17984
elapsed: 84.853918
17984
elapsed: 84.732204

$ ruby primes.rb
time: 0.193192386 seconds, primes: 17984
time: 89.643707621 seconds, primes: 17984
time: 88.132770525 seconds, primes: 17984

~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
