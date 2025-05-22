import { input } from '@inquirer/prompts';
import { LMStudioClient } from "@lmstudio/sdk";
import path from 'path';
import { googleSearchTool, saveFileTool, websiteContentTool } from "./tools";
import { randomUUIDv7 } from "bun";
import { existsSync, mkdirSync } from 'fs';

const client = new LMStudioClient();

// generated_reportsディレクトリの存在確認と作成
const reportsDir = path.join(process.cwd(), 'generated_reports');
if (!existsSync(reportsDir)) {
  console.log("レポート保存用ディレクトリを作成します...");
  mkdirSync(reportsDir, { recursive: true });
}

// モデルの読み込み - より大きいモデルを使用
const model = await client.llm.model("qwen3-4b");

console.log("モデルの読み込み完了");
const id = randomUUIDv7();

console.log("---------------------")

const searchQuery = await input({ message: 'なにについて調べたいですか？' });

// より詳細な指示を与える
await model.act(
  `${searchQuery}について詳細な調査を行い、包括的なレポートを作成してください。

調査手順:
1. まず、${searchQuery}に関する最適な検索クエリを考え、googleSearchToolを使用して検索してください。
2. 検索結果から最も信頼性が高く詳細な情報源を複数選び、websiteContentToolを使って各ソースの詳細コンテンツを取得してください。
3. 少なくとも3つ以上の異なる情報源から情報を収集し、それらを比較・統合してください。
4. 矛盾する情報がある場合は、その点も明記してください。

レポートの構成:
- タイトル・概要
- 主要な事実と詳細情報（最低でも5つのセクションに分けて整理）
- 歴史的背景（該当する場合）
- 現状分析
- 主要な論点や見解（複数の視点を含める）
- 参考資料（すべての情報源のURLを明記）

レポート形式:
- マークダウン形式で、見出し、箇条書き、表、引用などを適切に使用してください
- レポートの長さは少なくとも2000単語以上を目指してください
- すべての情報に出典を明記してください

最後に必ずsaveFileToolを使用して「${id}_${searchQuery}_report.md」というファイル名でレポートを保存してください。
`,
  [googleSearchTool, websiteContentTool, saveFileTool],
  {
    onMessage: (message) => console.info(message.toString()),
    onFirstToken: () => console.info("応答を生成中..."),
    onToolCallRequestStart: () => console.info("ツール呼び出しを開始します..."),
    onToolCallRequestEnd: () => console.info("ツール呼び出しが完了しました。"),
  }
);

// ファイルの存在確認
const reportFilePath = path.join(reportsDir, `${id}_${searchQuery}_report.md`);
if (existsSync(reportFilePath)) {
  console.log(`レポートファイルを生成しました: ${reportFilePath}`);
  // ファイルが大きい可能性があるので、最初の1000文字だけ表示
  const reportContent = await Bun.file(reportFilePath).text();
  console.log(reportContent.substring(0, 1000) + "...(省略)");
  console.log(`\n詳細は ${reportFilePath} を確認してください。`);
} else {
  console.error(`エラー: レポートファイルが見つかりません: ${reportFilePath}`);
  console.error("saveFileToolが正しく機能していない可能性があります。");
}

process.exit(0);