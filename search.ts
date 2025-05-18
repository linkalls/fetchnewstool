import { input } from '@inquirer/prompts';
import { LMStudioClient } from "@lmstudio/sdk";
import path from 'path';
import { googleSearchTool, saveFileTool, websiteContentTool } from "./tools";

const client = new LMStudioClient();

// モデルの読み込み
const model = await client.llm.model("qwen3-4b");

console.log("モデルの読み込み完了");
console.log("---------------------")



const searchQuery = await input({ message: 'なにについて調べたいですか？' });

// console.log(`"${searchQuery}"についてのニュースを取得します。`);
// console.log("---------------------")

// await model.complete(`${searchQuery}というものについてユーザーは調べたいようですがどのようなクエリーで検索するのが最適化を教えてください。`);


// ニュース取得と要約
await model.act(
  `${searchQuery}というものについてユーザーは調べたいようですが最適なクエリで検索してください(できる限り翻訳しないで考えてください)。
回答には根拠となるurlをつけてください。日本語で検索してください。
詳しいサイトの情報がいるならばそのサイトの内容も取得して確認してください。
詳しいレポートを出力してください。あなたの知識ではなく調べたものにのみ基づいて回答してください。
markdown形式で出力してください、最後に必ずsaveFileToolを使用して「${searchQuery}_report.md」というファイル名でレポートを保存してください。
`,
  [googleSearchTool, websiteContentTool, saveFileTool],
  {
    onMessage: (message) => console.info(message.toString()),
    onFirstToken: () => console.info("応答を生成中..."),
    onToolCallRequestStart: () => console.info("ツール呼び出しを開始します..."),
    onToolCallRequestEnd: () => console.info("ツール呼び出しが完了しました。"),
  }
);

//* 処理が完了したからmdファイルから内容を引っ張ってくる
const reportsDir = path.join(process.cwd(), 'generated_reports');

console.log(await Bun.file(path.join(reportsDir, `${searchQuery}_report.md`)).text());
//* ファイルの内容を表示

process.exit(1);
