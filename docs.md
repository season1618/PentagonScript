# PentagonScript

## Syntax
```
prog = stmt*
stmt = expr ";"
     | "var" ident (":" type)? "=" expr ";"
     | "var" "(" ident (":" type)? "," ident (":" type)? ")" "=" expr ";"
     | "func" ident "(" (ident ":" type ("," ident ":" type)*)? ")" ":" type "{" stmt* "}"
     | "if" "(" expr ")" stmt ("else" stmt)?
     | "for" "(" ident "in" "[" num "," num "]" ")" stmt
     | "return" expr? ";"
     | "{" stmt* "}"
type = "Int" | "Point" | "Line" | "Circle"
expr = or
or   = and ("||" and)*
and  = relate ("&&" relate)*
relate = add ("==" add | "!=" add | "<" add | "<=" add | ">" add | ">=" add)?
add  = mul ("+" mul | "-" mul)*
mul  = unary ("*" unary| "/" unary | "%" unary)*
unary = "+" unary
      | "-" unary
      | "!" unary
      | prim
prim = "Point" "(" num "," num ")"
     | "Line" "(" expr "," expr ")"
     | "Circle" "(" expr "," expr ")"
     | "and" "(" expr "," expr ")"
     | ident ("[" expr "]")*
     | ident "(" (expr ("," expr)*)? ")"
     | num
```

## Semantics

- `Point(x: Int, y: Int): Point`: render a point in the Cartesian coodinates (x, y) and return it.
- `Line(a: Point, b: Point): Line`: render a line through two points and return it.
- `Circle(o: Point, r: Int): Circle`: render a circle with center o and radius r and return it.
- `Circle(o: Point, d: Line): Circle`: render a circle which center is o, radius is the length of d and return it.
- `and(l1: Line, l2: Line): Point`: return a point at which two lines intersect.
- `and(l: Line, c: Circle): (Point, Point)`: return a tuple of two points at which the line and the circle intersect.
- `and(c: Circle, l: Line): (Point, Point)`: return a tuple of two points at which the circle and the line intersect.
- `and(c1: Circle, c2: Circle): (Point, Point)`: return a tuple of two points at which two circles intersect.