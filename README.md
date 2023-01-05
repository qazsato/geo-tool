<img src="./client/assets/images/logo.svg" alt="Geo Tool" width="200px">

## 本リポジトリについて

地図上の緯度経度可視化ツール。

下記 4 種類の表示が可能。

1. 住所 (都道府県・市区町村など)
2. 地域メッシュ
3. ヒートマップ
4. マーカークラスタリング

![Geo Tool](https://user-images.githubusercontent.com/5030713/110241205-e478b200-7f92-11eb-9bf5-dfab40932b9d.png)

## ローカル環境

### セットアップ

```bash
$ docker-compose build
$ docker-compose up -d
$ docker-compose exec geo_tool /bin/bash -c 'npm run dev:host'
```

http://localhost:3000 でアクセスして画面が表示されれば OK。

## サンプル

- [東京 23 区の交差点の交通事故分布](https://tool.geo.qazsato.com/viewmap/04686590251afc9a64c7403c94e893b8)
