<img src="./client/assets/images/logo.svg" alt="Geo Tool" width="200px">

## 本リポジトリについて

[Geo API](https://github.com/qazsato/geo-api) を利用した、地図可視化ツール。

下記 4 種類の表示が可能です。

1. 住所 (都道府県・市区町村など)
2. 地域メッシュ
3. ヒートマップ
4. マーカークラスタリング

![Geo Tool](https://user-images.githubusercontent.com/5030713/110241205-e478b200-7f92-11eb-9bf5-dfab40932b9d.png)

## ローカル環境

### セットアップ

.env を作成し、各 API キー情報を設定。

```
GOOGLE_MAPS_API_KEY={YOUR_API_KEY}
GEO_API_KEY={YOUR_API_KEY}
```

```bash
$ docker-compose build
$ docker-compose up -d
$ docker-compose exec geo_tool /bin/bash -c 'npm run dev:host'
```

http://localhost:3000 でアクセスして画面が表示されれば OK。

## サンプル

- [東京 23 区の交差点の交通事故分布](https://tool.geodig.jp/viewmap/04686590251afc9a64c7403c94e893b8)
