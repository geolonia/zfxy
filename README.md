# zfxy デモ

これは、空間IDの仕様を検討するための PoC であるため、実際の ID は全く異なる仕様となる可能性があります。

![](https://www.evernote.com/l/ABVXpdgqPOVEibitac3gXk71ftO99It-pecB/image.png)

https://geolonia.github.io/zfxy/

* 飛行機のアイコンをクリックすると、その飛行機の座標及び高度に基づいた空間IDをポップアップで表示します。
* 空間IDは実際のズームレベルよりも4つ多いズームレベルで算出しています。
* 地図上でマウスを動かすと空間IDに対応したバウンディングボックスが表示されます。地図のズームレベルにあわせて ID の詳細度が変わる様子が見られると思います。

```
git clone git@github.com:geolonia/zfxy.git
npm install
npm start
```

To build:

```
npm run build
```
