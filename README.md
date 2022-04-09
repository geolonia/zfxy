# zfxy デモ

これは、空間IDの仕様を検討するための PoC であるため、実際の ID は全く異なる仕様となる可能性があります。

![](https://www.evernote.com/l/ABVXpdgqPOVEibitac3gXk71ftO99It-pecB/image.png)

https://geolonia.github.io/zfxy/

* 飛行機のアイコンをクリックすると、その飛行機の座標及び高度に基づいた空間IDをポップアップで表示します。
* 空間IDは、ページの下の方にあるバーで調整可能です。

## ID の仕様

* 水平方向は、タイル番号を基準にしており、既存の GIS 関連のエコシステムと互換性があります。
* 垂直方向は、分解能 25（ズームレベル 25）で高さ 1m となるようにしたうえで、分解能が1上がるごとに2倍にしています。
* この空間 ID は、タイル番号 `/z/f/x/y` から専用の計算式でエンコードしており、最後の一桁をカットすることで、分解能が一つさがります。
* 空間 ID は、タイル番号に戻すこともできます。

## 開発

```
git clone git@github.com:geolonia/zfxy.git
npm install
npm start
```

To build:

```
npm run build
```
