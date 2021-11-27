# PentagonScript

コンパスと三角定規による作図を記述する言語。

[サイト](https://season1618.github.io/PentagonScript/)

.webmは何故か使えません。

[デモ](https://github.com/season1618/PentagonScript/public/demo.mp4)

## 構文

- 点: Point = (x, y);
- 線分: Line = (Point, Point);
- 円: Circle = (Point, Radius);
- 円: Circle = (Point, Line);
- 点と点の距離: distance = {Point, Point};
- 直線と直線の交点: Point = {Line, Line};
- 直線と円の交点: Point, Point = {Line, Circle};
- 円と直線の交点: Point, Point = {Circle, Line};
- 円と円の交点: Point, Point = {Circle, Circle};

交点が二つできる場合に一方の変数を省略しても良い。このときカンマは付けても付けなくても良い。省略された交点は変数に登録されない。
円の中心を直線が通るとき、その交点を通るような中心角180度以下の円弧は二つあるが、{Line, Circle}と{Circle, Line}で異なるものを選ぶ。

入れ子にして記述することはできない(再帰不可)。点・直線・円と距離には必ず変数を当てる。

未定義の変数であって、定義済みの2点の変数名が結合した変数名の場合はその二点を結ぶ線分と判断される。