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
prim = "point" "(" num "," num ")"
     | "line" "(" expr "," expr ")"
     | "circle" "(" expr "," expr ")"
     | "and" "(" expr "," expr ")"
     | ident ("[" expr "]")*
     | ident "(" (expr ("," expr)*)? ")"
     | num
```

## Type Inference
```
point: (Int, Int) -> Point
line: (Point, Point) -> Line
circle: (Point, Int) -> Circle
        (Point, Line) -> Circle
and: (Line, Line) -> Point
     (Line, Circle) -> (Point, Point)
     (Circle, Line) -> (Point, Point)
     (Circle, Circle) -> (Point, Point)
```