import { GoogleNewsService } from "@potetotown/google_news_api";

const newsService = new GoogleNewsService();

// 日本のニュースを取得
const news = await newsService.getNews({
  country: "jp",
  language: "ja",
});

console.log(news.items[0]); // 最新のニュースの説明を表示

