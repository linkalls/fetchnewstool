import { LMStudioClient } from "@lmstudio/sdk";
import { fetchNewsTool } from "./tools";
import { input } from '@inquirer/prompts';

const client = new LMStudioClient();

// モデルの読み込み
const model = await client.llm.model("qwen3-1.7b");

console.log("モデルの読み込み完了");
console.log("---------------------")



const searchQuery = await input({ message: 'なんのニュースについて調べたいですか？' });

console.log(`"${searchQuery}"についてのニュースを取得します。`);
console.log("---------------------")

// ニュース取得と要約
await model.act(
  `最新の${searchQuery}についてニュースを要約してください。要約には根拠となるurlをつけてください。基本は日本語で検索してください`,
  [fetchNewsTool],
  {
    onMessage: (message) => console.info(message.toString()),
  }
);

process.exit(1);
