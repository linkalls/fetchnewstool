import path from 'path';
import fs from 'fs/promises';

async function testFileSave() {
  try {
    // ディレクトリが存在するか確認
    const reportsDir = path.join(process.cwd(), 'generated_reports');
    
    // ディレクトリ作成（既に存在していても問題ない）
    await fs.mkdir(reportsDir, { recursive: true });
    console.log(`[test] ディレクトリの確認/作成完了: ${reportsDir}`);
    
    // テストファイル作成
    const testFilePath = path.join(reportsDir, 'test_file.md');
    
    // ファイル内容
    const content = "# テストファイル\n\nこれはテスト用のファイルです。\n\n";
    
    // 通常のNode.js FSを使用
    await fs.writeFile(testFilePath, content);
    console.log(`[test] ファイルが正常に保存されました(fs): ${testFilePath}`);
    
    // Bunを使用
    const bunFilePath = path.join(reportsDir, 'test_bun_file.md');
    await Bun.write(bunFilePath, content);
    console.log(`[test] ファイルが正常に保存されました(Bun): ${bunFilePath}`);
    
    // ファイル一覧の確認
    const files = await fs.readdir(reportsDir);
    console.log(`[test] ディレクトリ内のファイル: ${files.join(', ')}`);
    
    return `ファイルの保存テスト成功`;
  } catch (error) {
    console.error(`[test] エラー詳細: ${error.stack || error}`);
    return `テスト失敗: ${error.message}`;
  }
}

// テストを実行
console.log(await testFileSave());