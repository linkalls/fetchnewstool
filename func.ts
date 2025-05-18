import { extract, toHTML } from "@mizchi/readability";
import html2md from "html-to-md";


export async function fetchWebsiteContent(url: string): Promise<{ title: string; content: string; url: string } | string> {
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