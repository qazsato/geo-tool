FROM node:20

WORKDIR /usr/src/app

# serverless の モジュールのインストール
COPY package*.json ./
RUN npm install

COPY . .

EXPOSE 3000
