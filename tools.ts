import { tool } from "@lmstudio/sdk";
import { extract, toHTML } from "@mizchi/readability";
import { GoogleNewsService } from "@potetotown/google_news_api";
import {
  DictionaryResult,
  OrganicResult,
  search
} from "google-sr";
import html2md from "html-to-md";
import { z } from "zod";
import path from 'path';
import fs from 'fs/promises';





//* Google検索ツールの定義
export const googleSearchTool = tool({
  name: "googleSearch",
  description: "Googleで検索を行い、結果を取得する。",
  parameters: {
    query: z.string().min(1).max(100), // 検索クエリ
  },
  implementation: async ({ query }) => {
    const result = await search({
      query,
      resultTypes: [OrganicResult, DictionaryResult],
    });

    // forEachではなくmapを使用し、結果を配列として返す
    const searchResults = result.map(item => {
      if (item.type === "ORGANIC") {
        return {
          title: item.title,
          url: item.link,
          description: item.description
        }
      } else if (item.type === "DICTIONARY") {
        return {
          title: item.word,
          url: item.meanings,
        }
      }
      return null;
    }).filter(item => item !== null); // nullの項目を除外

    return searchResults;
  }
})


//* websiteの内容を取得するツールの定義
export const websiteContentTool = tool({
  name: "websiteContentTool",
  description: "指定したURLのウェブサイトの内容を取得し、Markdown形式で返す。",
  parameters: {
    url: z.string().min(1).max(1000), // 検索クエリ
  },
  implementation: async ({ url }) => {
    const html = await fetch(url).then((res) => res.text());
    const extracted = extract(html, { charThreshold: 100 });
    // 結果を表示
    console.log(`Title: ${extracted.metadata.title}`);
    // console.log(`Author: ${extracted.byline}`);
    if (!extracted.root) {
      // process.exit(1);
      return "ウェブサイトの内容を取得できませんでした。URLが正しいか確認してください。";
    }
    const htmlContent = toHTML(extracted.root);
    const md = html2md(htmlContent);
    console.log(md);
    return {
      title: extracted.metadata.title,
      content: md, // Markdown形式のコンテンツ
      url: url, // 元のURL
    };
  }
})



// Google Newsのサービスを初期化
const newsService = new GoogleNewsService();

// ニュース取得ツールの定義
export const fetchNewsTool = tool({
  name: "fetchNews",
  description: "指定した国と言語の最新ニュースを取得する。",
  parameters: {
    country: z.string().min(2).max(2), // ISO 3166-1形式の国コード（例: 'jp'）
    // language: z.string().min(2).max(2), // ISO 639-1形式の言語コード（例: 'ja'）
    query: z.string().optional(), // 検索キーワード（オプション）
  },
  implementation: async ({ country, query }) => {
    try {
      const news = await newsService.getNews({
        country, // 国コード
        language: "ja", // 言語コード
        query, // キーワード検索（オプション）
      });

      // ニュースアイテムをフォーマットして返す
      // 最初の10個のニュースアイテムだけを返す
      return news.items.slice(0, 10).map((item) => ({
        title: item.title,
        // description: item.description,
        link: item.link,
        // pubDate: item.pubDate,
        // source: item.source,
      }));
    } catch (error) {
      console.error("Error fetching news:", error);
      throw new Error("Failed to fetch news.");
    }
  },
});

// 最終レポート生成ツール
export const generateFinalReportTool = tool({
  name: "generateFinalReport",
  description: "検索結果と情報をもとに構造化された最終レポートを生成する。",
  parameters: {
    content: z.string(), // レポートの内容（マークダウン形式）
  },
  implementation: async ({ content }) => {
    // JSON形式でレポートデータを返す
    return JSON.stringify({
      type: "final_report",
      content: content
    });
  }
});


export const saveFileTool = tool({
  name: "saveFile",
  description: "指定されたファイル名で指定された内容のファイルを作成または上書きします。出力はカレントワーキングディレクトリの 'generated_reports' サブディレクトリに保存されます。",
  parameters: {
    filename: z.string().describe("保存するファイルの名前(mdのみ) (例: 検索した内容のタイトル.md)"),
    content: z.string().describe("ファイルに書き込む内容"),
  },
  implementation: async ({ filename, content }) => {
    //* bunでファイルを保存するためのコード
    try {
      // path.joinを使用して、OSに依存しないパスを生成
      const reportsDir = path.join(process.cwd(), 'generated_reports');
      
      // generated_reportsディレクトリが存在することを確認
      await fs.mkdir(reportsDir, { recursive: true });
      
      // おんなじ名前のファイルがあったら
      const existingFiles = await fs.readdir(reportsDir);
      if (existingFiles.includes(filename)) {
        console.log(`[saveFileTool] 同名のファイルが既に存在します: ${filename}`);
      }

      // ファイルパスを生成
      const filePath = path.join(reportsDir, filename);
      
       // 通常のNode.js FSを使用
    await fs.writeFile(filePath, content);
    // console.log(`[test] ファイルが正常に保存されました(fs): ${filePath}`);
      console.log(`[saveFileTool] ファイルが正常に保存されました: ${filename}`);
      return `ファイルが正常に保存されました: filename: ${filename}, filepath: ${filePath}`;
    } catch (error: any) {
      console.error(`[saveFileTool] ${error.message}`);
      // エラーを返して上位の処理に通知
      return `ファイルの保存中にエラーが発生しました: ${error.message}`;
    }
  }
});