import { LMStudioClient } from "@lmstudio/sdk";
import { serve, type ServerWebSocket } from "bun";
import { generateFinalReportTool, googleSearchTool, websiteContentTool } from "./tools";

const client = new LMStudioClient();

// HTMLテンプレート
const html = `
<!DOCTYPE html>
<html lang="ja">
<head>  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>DeepResearch AI</title>
  <script src="https://cdn.jsdelivr.net/npm/marked/marked.min.js"></script>
  <style>
    :root {
      --primary-color: #2563eb;
      --secondary-color: #1d4ed8;
      --bg-color: #f8fafc;
      --text-color: #1e293b;
      --accent-color: #3b82f6;
      --border-color: #e2e8f0;
      --report-bg: #f1f5f9;
      --system-msg-bg: #eef2ff;
      --border-radius: 8px;
      --box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
    }
    
    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }
    
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      background-color: var(--bg-color);
      color: var(--text-color);
      line-height: 1.6;
      max-width: 900px;
      margin: 0 auto;
      padding: 20px;
    }
    
    header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 2rem;
      padding-bottom: 1rem;
      border-bottom: 1px solid var(--border-color);
    }
    
    .logo {
      display: flex;
      align-items: center;
    }
    
    .logo-icon {
      font-size: 1.8rem;
      margin-right: 0.5rem;
      color: var(--primary-color);
    }
    
    h1 {
      color: var(--text-color);
      font-size: 1.8rem;
      font-weight: 700;
    }
    
    .search-container {
      display: flex;
      margin-bottom: 1.5rem;
      background: white;
      border-radius: var(--border-radius);
      overflow: hidden;
      box-shadow: var(--box-shadow);
      border: 1px solid var(--border-color);
    }
    
    input[type="text"] {
      flex-grow: 1;
      padding: 1rem 1.2rem;
      font-size: 1rem;
      border: none;
      outline: none;
    }
    
    button {
      padding: 0.8rem 1.5rem;
      background-color: var(--primary-color);
      color: white;
      border: none;
      font-weight: 600;
      cursor: pointer;
      transition: background-color 0.2s;
      font-size: 1rem;
    }
    
    button:hover {
      background-color: var(--secondary-color);
    }
    
    button:disabled {
      background-color: #94a3b8;
      cursor: not-allowed;
    }
    
    #status {
      margin: 1rem 0;
      padding: 1rem;
      background-color: white;
      border-radius: var(--border-radius);
      border-left: 4px solid var(--primary-color);
      display: none;
      box-shadow: var(--box-shadow);
    }
    
    .content-area {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
    }
    
    #result-container {
      background-color: white;
      border-radius: var(--border-radius);
      overflow: hidden;
      box-shadow: var(--box-shadow);
      border: 1px solid var(--border-color);
    }
    
    #result-header {
      display: flex;
      justify-content: space-between;
      padding: 1rem;
      background-color: #f1f5f9;
      border-bottom: 1px solid var(--border-color);
      font-weight: 600;
    }
    
    #tabs {
      display: flex;
      gap: 0.5rem;
    }
    
    .tab {
      padding: 0.5rem 1rem;
      cursor: pointer;
      border-radius: 4px;
      font-size: 0.9rem;
    }
    
    .tab.active {
      background-color: var(--primary-color);
      color: white;
    }
    
    #result {
      padding: 1.5rem;
      overflow-y: auto;
      max-height: 600px;
      white-space: pre-wrap;
      line-height: 1.6;
    }
    
    /* Markdown スタイル */
    #result.markdown-body {
      padding: 1.5rem;
    }
    
    .markdown-body h1,
    .markdown-body h2,
    .markdown-body h3,
    .markdown-body h4 {
      margin-top: 1.5rem;
      margin-bottom: 1rem;
      font-weight: 600;
    }
    
    .markdown-body h1 {
      font-size: 1.8rem;
      border-bottom: 1px solid var(--border-color);
      padding-bottom: 0.5rem;
    }
    
    .markdown-body h2 {
      font-size: 1.5rem;
    }
    
    .markdown-body h3 {
      font-size: 1.3rem;
    }
    
    .markdown-body p,
    .markdown-body ul,
    .markdown-body ol {
      margin-bottom: 1rem;
    }
    
    .markdown-body code {
      padding: 0.2rem 0.4rem;
      background-color: #f1f5f9;
      border-radius: 3px;
      font-family: SFMono-Regular, Consolas, "Liberation Mono", Menlo, monospace;
      font-size: 0.9rem;
    }
    
    .markdown-body pre {
      background-color: #f1f5f9;
      padding: 1rem;
      border-radius: 5px;
      overflow-x: auto;
      margin-bottom: 1rem;
    }
    
    .markdown-body pre code {
      padding: 0;
      background-color: transparent;
    }
    
    .markdown-body blockquote {
      padding: 0.5rem 1rem;
      border-left: 4px solid var(--border-color);
      background-color: #f8fafc;
      margin-bottom: 1rem;
    }
    
    .markdown-body table {
      border-collapse: collapse;
      width: 100%;
      margin-bottom: 1rem;
    }
    
    .markdown-body table th,
    .markdown-body table td {
      padding: 0.5rem;
      border: 1px solid var(--border-color);
    }
    
    .markdown-body table th {
      background-color: #f1f5f9;
      font-weight: 600;
    }
    
    .markdown-body a {
      color: var(--primary-color);
      text-decoration: none;
    }
    
    .markdown-body a:hover {
      text-decoration: underline;
    }
    
    .markdown-body img {
      max-width: 100%;
      border-radius: 4px;
    }
    
    .loading {
      display: inline-block;
      width: 20px;
      height: 20px;
      border: 3px solid rgba(0,0,0,.1);
      border-radius: 50%;
      border-top-color: var(--primary-color);
      animation: spin 1s ease-in-out infinite;
      margin-right: 10px;
      vertical-align: middle;
    }
    
    @keyframes spin {
      to { transform: rotate(360deg); }
    }
    
    .phases {
      margin-top: 1rem;
      font-size: 0.9rem;
      color: #64748b;
      display: flex;
      flex-wrap: wrap;
      gap: 0.5rem;
    }
    
    .phase {
      display: flex;
      align-items: center;
      padding: 0.3rem 0.8rem;
      background-color: #f1f5f9;
      border-radius: 1rem;
      opacity: 0.6;
    }
    
    .phase.active {
      opacity: 1;
      background-color: #dbeafe;
      font-weight: 500;
      color: var(--primary-color);
    }
    
    .phase-icon {
      margin-right: 0.3rem;
      font-size: 0.8rem;
    }
    
    .report-section {
      background-color: var(--report-bg);
      border-radius: var(--border-radius);
      padding: 1rem;
      margin: 1rem 0;
      border-left: 4px solid var(--accent-color);
    }
    
    .system-message {
      background-color: var(--system-msg-bg);
      color: #4338ca;
      font-size: 0.9rem;
      padding: 0.5rem 1rem;
      margin: 0.5rem 0;
      border-radius: 4px;
    }
    
    @media (max-width: 768px) {
      body {
        padding: 15px;
      }
      
      .search-container {
        flex-direction: column;
      }
      
      input[type="text"] {
        width: 100%;
      }
      
      button {
        width: 100%;
      }
    }
  </style>
</head>
<body>
  <header>
    <div class="logo">
      <span class="logo-icon">🔍</span>
      <h1>DeepResearch AI</h1>
    </div>
  </header>
  
  <div class="search-container">
    <input type="text" id="query" placeholder="調べたいことを入力してください..." autofocus>
    <button id="search-btn">調査開始</button>
  </div>
  
  <div id="status"></div>
  
  <div class="content-area">
    <div id="result-container">
      <div id="result-header">
        <span>調査結果</span>
        <div id="tabs">
          <div class="tab active" data-view="markdown">レポート</div>
          <div class="tab" data-view="raw">ログ</div>
        </div>
      </div>
      <div id="result" class="markdown-body"></div>
    </div>
  </div>
  <script>    const queryInput = document.getElementById('query');
    const searchBtn = document.getElementById('search-btn');
    const statusDiv = document.getElementById('status');
    const resultDiv = document.getElementById('result');
    const tabs = document.querySelectorAll('.tab');
    
    let socket = null;
    let currentPhase = 0;
    let rawContent = ''; // 生のテキストコンテンツを保存
    let currentView = 'markdown'; // 現在のビュー (markdown または raw)
    
    // 最終レポートのコンテンツを保存するためのグローバル変数を初期化
    window.finalReportContent = '';
    
    const phases = [
      {name: '要件分析', icon: '📝'},
      {name: '最適検索クエリ決定', icon: '🔎'},
      {name: 'ウェブ検索実行', icon: '🌐'},
      {name: 'ソース精査', icon: '📊'},
      {name: 'コンテンツ収集', icon: '📚'},
      {name: '重要情報抽出', icon: '✂️'},
      {name: 'データ整理', icon: '🗂️'},
      {name: '要約生成', icon: '📋'}
    ];
    
    // フェーズを表示するHTMLを生成
    function getPhasesHTML(currentPhase) {
      let html = '<div class="phases">';
      phases.forEach((phase, index) => {
        const className = index === currentPhase ? 'phase active' : 'phase';
        html += \`\\\`<div class="\\\${className}"><span class="phase-icon">\\\${phase.icon}</span>\\\${phase.name}</div>\\\`\`;
      });
      html += '</div>';
      return html;
    }
    
    // タブ切り替え処理
    tabs.forEach(tab => {
      tab.addEventListener('click', () => {
        const view = tab.dataset.view;
        
        // アクティブなタブを切り替え
        tabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        
        // ビューを切り替え
        currentView = view;
        updateResultView();
      });
    });
    // 結果ビューを更新
    function updateResultView() {
      if (currentView === 'markdown') {
        // マークダウンビュー - 保存されたレポートコンテンツを表示
        if (window.finalReportContent) {
          resultDiv.innerHTML = marked.parse(window.finalReportContent);
        } else if (rawContent) {
          // レポートがまだ生成されていない場合
          resultDiv.innerHTML = marked.parse('*調査中... レポートはまもなく生成されます*');
        } else {
          resultDiv.innerHTML = '';
        }
      } else {
        // 生のログビュー
        resultDiv.innerHTML = '';
        resultDiv.textContent = rawContent;
      }
    }
        // テキストを結果に追加
    function appendToResult(text) {
      try {
        // JSON形式のメッセージかどうかをチェック
        const data = JSON.parse(text);
        
        // 最終レポート型のメッセージを処理
        if (data.type === 'final_report') {
          // レポート内容を保存
          if (!window.finalReportContent) {
            window.finalReportContent = data.content;
          } else {
            window.finalReportContent += data.content;
          }
          
          // マークダウンビューに自動切り替え
          tabs.forEach(t => t.classList.remove('active'));
          tabs.find(t => t.dataset.view === 'markdown').classList.add('active');
          currentView = 'markdown';
          
          // レポート表示を更新
          updateResultView();
          return;
        }
      } catch (e) {
        // JSON解析エラー - 通常のテキストとして処理
      }
      
      // 通常のテキストとして処理
      rawContent += text;
      
      // 現在のビューに応じて表示を更新
      updateResultView();
      
      // 自動スクロール
      window.scrollTo(0, document.body.scrollHeight);
    }
    
    // WebSocketの接続をセットアップ
    function setupWebSocket() {
      // WebSocketの接続
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const wsUrl = \`\${protocol}//\${window.location.host}/ws\`;
      
      socket = new WebSocket(wsUrl);
      
      socket.onopen = () => {
        console.log('WebSocket接続が確立されました');
      };
      
      socket.onmessage = (event) => {
        try {
          // JSONメッセージかどうかを確認
          const data = JSON.parse(event.data);
          
          // フェーズ更新メッセージ
          if (data.type === 'phase_update') {
            currentPhase = data.phase;
            updateStatus();
          }
          
          // 検索完了メッセージ
          if (data.type === 'search_complete') {
            statusDiv.innerHTML = '✓ 調査完了';
            searchBtn.disabled = false;
            
            setTimeout(() => {
              statusDiv.style.display = 'none';
            }, 3000);
          }
        } catch (e) {
          // JSONでないメッセージはテキストとして扱う
          const message = event.data;
          
          // テキストを結果に追加
          appendToResult(message);
        }
      };
      
      socket.onclose = () => {
        console.log('WebSocket接続が閉じられました');
        // 再接続を試みる
        setTimeout(setupWebSocket, 3000);
      };
      
      socket.onerror = (error) => {
        console.error('WebSocketエラー:', error);
      };
    }
    
    // ステータス表示を更新
    function updateStatus() {
      statusDiv.innerHTML = \`\\\`<div class="loading"></div> 深層調査を実行中...<br>現在のステップ: \\\${phases[currentPhase].name}\\\${getPhasesHTML(currentPhase)}\\\`\`;
    }
      // 初期接続
    setupWebSocket();

    // Enterキーを押したときにも検索を実行
    queryInput.addEventListener('keyup', (event) => {
      if (event.key === 'Enter') {
        searchBtn.click();
      }
    });
    
    // 新しい検索を開始する前に既存のコンテンツをクリア
    searchBtn.addEventListener('click', async () => {
      const query = queryInput.value.trim();
      if (!query) return;
      
      // 検索ボタンを無効化
      searchBtn.disabled = true;
      
      // ステータス表示を初期化
      currentPhase = 0;
      updateStatus();
      statusDiv.style.display = 'block';
      
      // 結果をリセット
      rawContent = '';
      window.finalReportContent = ''; // 最終レポートの内容もリセット
      updateResultView();
      
      try {
        // WebSocketが接続されているか確認
        if (socket && socket.readyState === WebSocket.OPEN) {
          // 検索クエリをWebSocketで送信
          socket.send(JSON.stringify({ type: 'search', query }));
        } else {
          throw new Error('WebSocket接続がありません。ページをリロードしてください。');
        }
      } catch (error) {
        statusDiv.innerHTML = '❌ エラーが発生しました: ' + error.message;
        console.error(error);
        searchBtn.disabled = false;
      }
    });
  </script>
</body>
</html>
`;

// 接続情報を保持するための型定義
interface ConnectionInfo {
  ws: ServerWebSocket<unknown>;
  currentToolCall: 'search' | 'content';
}

// WebSocket接続を保持するMap
const wsConnections = new Map<string, ConnectionInfo>();

// モデルのロード
let modelPromise = client.llm.model("qwen3-4b");

// フェーズ定義
const PHASES = {
  ANALYSIS: 0,
  QUERY_GENERATION: 1,
  WEB_SEARCH: 2,
  SOURCE_EVALUATION: 3,
  CONTENT_GATHERING: 4,
  INFO_EXTRACTION: 5,
  DATA_ORGANIZATION: 6,
  SUMMARY_GENERATION: 7
};

// Bunのサーバー設定
serve({
  port: 3000,
  fetch(req, server) {
    const url = new URL(req.url);

    // WebSocketのアップグレードリクエスト
    if (url.pathname === "/ws") {
      if (server.upgrade(req)) {
        return; // アップグレードされた場合は何も返さない
      }
      return new Response("WebSocketのアップグレードに失敗しました", { status: 400 });
    }

    // 通常のHTTPリクエスト処理
    if (url.pathname === "/") {
      return new Response(html, {
        headers: { "Content-Type": "text/html" },
      });
    }

    // 404エラー
    return new Response("Not Found", { status: 404 });
  },
  // WebSocketの処理
  websocket: {
    async open(ws) {
      const id = crypto.randomUUID();
      wsConnections.set(id, {
        ws,
        currentToolCall: 'search' // 初期値
      });
      console.log(`新しいWebSocket接続: ${id}`);

      // モデルのロードが完了していることを確認
      await modelPromise;
    },
    async message(ws, message) {
      try {
        const data = JSON.parse(message.toString());

        // 接続情報を特定
        let connectionId = '';
        let connectionInfo: ConnectionInfo | undefined;

        for (const [id, connInfo] of wsConnections.entries()) {
          if (connInfo.ws === ws) {
            connectionId = id;
            connectionInfo = connInfo;
            break;
          }
        }

        if (!connectionInfo) {
          console.error('接続情報が見つかりません');
          return;
        }

        if (data.type === 'search' && data.query) {
          // モデルが準備できているか確認
          const model = await modelPromise;

          // 検索開始メッセージを送信
          ws.send("========== 深層調査を開始します ==========\n\n");

          // 分析フェーズ
          ws.send(JSON.stringify({ type: 'phase_update', phase: PHASES.ANALYSIS }));
          ws.send("クエリを分析中...\n");
          await new Promise(resolve => setTimeout(resolve, 1000));

          // クエリ生成フェーズ
          ws.send(JSON.stringify({ type: 'phase_update', phase: PHASES.QUERY_GENERATION }));
          ws.send("最適な検索クエリを生成中...\n");
          await new Promise(resolve => setTimeout(resolve, 1000));          // ウェブ検索フェーズ
          ws.send(JSON.stringify({ type: 'phase_update', phase: PHASES.WEB_SEARCH }));          // モデルの呼び出し
          await model.act(
            `${data.query}というものについてユーザーは調べたいようですが最適なクエリで検索してください(できる限り翻訳しないで考えてください)。
まず、必要な情報を収集してください。
次に、集めた情報を整理して、マークダウン形式の包括的なレポートを作成してください。
見出し、箇条書き、リンク、引用などのマークダウン記法を適切に使用してください。
情報源となるURLを必ず引用してください。
基本は日本語で検索してください。
詳しいサイトの情報が必要ならばそのサイトの内容も取得して確認してください。

最も重要な指示：レポートが完成したら、必ず generateFinalReport ツールを呼び出し、そのcontentパラメータにマークダウン形式のレポート全文を渡してください。
このツールは、レポートをJSON形式で返し、フロントエンドで特別な処理を行います。
この最終ステップは必須です。このツールを使わないとフロントエンドでレポートとして正しく表示されません。`,
            [googleSearchTool, websiteContentTool, generateFinalReportTool],
            {
              onMessage: (message) => {
                const text = message.toString();
                ws.send(text);
              },
              onFirstToken: () => {
                // 分析フェーズ
                ws.send(JSON.stringify({ type: 'phase_update', phase: PHASES.DATA_ORGANIZATION }));
                ws.send("\n収集したデータを整理しています...\n\n");
              },
              onToolCallRequestStart: () => {
                if (connectionInfo!.currentToolCall === 'search') {
                  ws.send(JSON.stringify({ type: 'phase_update', phase: PHASES.WEB_SEARCH }));
                  ws.send("\n[ウェブで情報を検索中...]\n");
                } else {
                  ws.send(JSON.stringify({ type: 'phase_update', phase: PHASES.CONTENT_GATHERING }));
                  ws.send("\n[コンテンツを収集中...]\n");
                }

                // 次のツール呼び出しがウェブサイト内容取得の場合を考慮
                connectionInfo!.currentToolCall = connectionInfo!.currentToolCall === 'search' ? 'content' : 'search';
              },
              onToolCallRequestEnd: () => {
                ws.send(JSON.stringify({ type: 'phase_update', phase: PHASES.SOURCE_EVALUATION }));
                ws.send("[情報源の評価完了]\n\n");
              }
            }
          );
          // 要約生成フェーズ
          ws.send(JSON.stringify({ type: 'phase_update', phase: PHASES.SUMMARY_GENERATION }));
          ws.send("\n\n最終レポートを生成中...\n");
          await new Promise(resolve => setTimeout(resolve, 1000));

          // クライアントに完了を通知
          ws.send(JSON.stringify({ type: 'search_complete' }));
        }
      } catch (error) {
        console.error("WebSocketメッセージ処理エラー:", error);
        const errorMessage = error instanceof Error ? error.message : String(error);
        ws.send(`エラーが発生しました: ${errorMessage}`);
      }
    },
    close(ws, code, message) {
      // 接続を切断する際に接続リストから削除
      for (const [id, connInfo] of wsConnections.entries()) {
        if (connInfo.ws === ws) {
          wsConnections.delete(id);
          console.log(`WebSocket接続が閉じられました: ${id}, コード: ${code}`);
          break;
        }
      }
    },
  },
  // タイムアウト時間を延長
  idleTimeout: 255
});

console.log("深層検索ツールGUIサーバーが起動しました: http://localhost:3000");
console.log("モデルを読み込み中...");

// モデルのロードが完了したらログを出力
modelPromise.then(() => {
  console.log("モデルの読み込みが完了しました。検索の準備ができました。");
});