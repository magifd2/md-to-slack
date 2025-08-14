# MarkdownからSlack Block Kitへの変換ツール

このツールは、MarkdownテキストをSlack Block Kit JSONに変換し、Slack APIでの利用に適した形式にします。

## 機能

- 一般的なMarkdown要素をSlack Block Kitブロックに変換します。
  - 見出し (H1, H2) -> `header` ブロック
  - 段落 -> `mrkdwn` を含む `section` ブロック
  - リスト (順序付き、順序なし、ネストされたリストを含む) -> `mrkdwn` を含む `section` ブロック
  - 引用ブロック -> `mrkdwn` を含む `section` ブロック (`>` で始まる)
  - コードブロック -> `mrkdwn` を含む `section` ブロック (トリプルバッククォート)
  - 水平線 -> `divider` ブロック
  - 画像 -> `image` ブロック (単独) または `mrkdwn` 内のリンク (`section` ブロック内)
  - テーブル -> `rich_text` セルを含む `table` ブロック (セル内はプレーンテキストのみ)
- 標準入力または指定されたファイルからMarkdownを読み込みます。
- Slack Block Kit JSONを標準出力に出力します。

## 制限事項

- **テーブルセルの書式設定**: 現在、テーブル内の `rich_text` セルはプレーンテキストのみをサポートしています。テーブルセル内のインライン書式設定（太字、斜体、リンク）はBlock Kit出力では保持されません。
- **チェックボックスのレンダリング**: リスト内のチェックボックス（`[ ]`、`[x]`）は、Slackの `mrkdwn` がインタラクティブなチェックボックスをネイティブにサポートしていないため、`mrkdwn` フィールド内でプレーンテキストとしてレンダリングされます。

## インストール

1.  Node.jsとnpmがインストールされていることを確認してください。
2.  このリポジトリをクローンするか、`md-to-slack-block-kit.js` ファイルをダウンロードしてください。
3.  依存関係をインストールします。

    ```bash
    npm install
    ```

## 使用方法

### 標準入力から（パイプ）

```bash
cat your_markdown_file.md | md-to-slack
```

### ファイル引数から

```bash
md-to-slack your_markdown_file.md
```

### ヘルプ

```bash
md-to-slack --help
```

## 開発

### テストの実行

```bash
npm test
```

## プライベート利用のための配布

このツールはnpmに公開されていないため、Gitリポジトリを共有することで関係者に配布できます。ユーザーはローカルでインストールして使用できます。

1.  **リポジトリをクローンします。**

    ```bash
    git clone <repository_url>
    cd md-to-slack
    ```

2.  **依存関係をインストールします。**

    ```bash
    npm install
    ```

3.  **コマンドをグローバルに利用可能にします（任意ですが、利便性のために推奨）。**

    ```bash
    npm link
    ```

    これにより、どのディレクトリからでもコマンドを実行できるようになります。

    ```bash
    md-to-slack your_markdown_file.md
    ```

    または、プロジェクトディレクトリから直接実行することもできます。

    ```bash
    node md-to-slack-block-kit.js your_markdown_file.md
    ```

4.  **ツールの更新:**

    最新の変更を取得するには、クローンしたリポジトリディレクトリに移動して以下を実行します。

    ```bash
    git pull
    npm install # 依存関係が変更された場合
    ```

## ライセンス

[MIT License](LICENSE)

## 謝辞

本ツールの実装は、以下のQiita記事の知見に大きく助けられました。

- [MarkdownをSlackのBlock Kitに変換する](https://qiita.com/yhatt/items/ebe892f341ce03d6d23f)
