import { LMStudioClient } from "@lmstudio/sdk";
import { input } from '@inquirer/prompts';
import { tool } from "@lmstudio/sdk";
import { z } from "zod";
import { search, parse } from "llm-search";


const results = await search("最新のAI技術についてのニュース");
console.log(results);





// export const search = tool({
//   name: "web-search",
//   description: "web検索を行う",
//   parameters: {
//     query: z.string().min(1).max(100), // 検索クエリ
//   },
//   implementation: async ({query }) => {
//     try {
//       const news = await newsService.getNews({
//         country, // 国コード
//         language: "ja", // 言語コード
//         query, // キーワード検索（オプション）
//       });

//       // ニュースアイテムをフォーマットして返す
//       // 最初の10個のニュースアイテムだけを返す
//       return news.items.slice(0, 10).map((item) => ({
//         title: item.title,
//         // description: item.description,
//         link: item.link,
//         // pubDate: item.pubDate,
//         // source: item.source,
//       }));
//     } catch (error) {
//       console.error("Error fetching news:", error);
//       throw new Error("Failed to fetch news.");
//     }
//   },
// });


// const client = new LMStudioClient();

// // モデルの読み込み
// const model = await client.llm.model("qwen3-1.7b");

// console.log("モデルの読み込み完了");
// console.log("---------------------")



// const searchQuery = await input({ message: 'なんのことついて調べたいですか？' });

// console.log(`"${searchQuery}"についてのニュースを取得します。`);
// console.log("---------------------")

// // ニュース取得と要約
// await model.act(
//   `最新の${searchQuery}についてニュースを要約してください。要約には根拠となるurlをつけてください。基本は日本語で検索してください`,
//   [fetchNewsTool],
//   {
//     onMessage: (message) => console.info(message.toString()),
//   }
// );

// process.exit(1);
