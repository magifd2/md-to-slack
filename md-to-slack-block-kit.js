/**
 * Markdown to Slack Block Kit Converter
 * * このスクリプトは、標準入力からMarkdownテキストを読み込み、
 * Slack Block Kit APIで使用できるJSON形式に変換して標準出力に書き出します。
 * * 参考記事: https://qiita.com/yhatt/items/ebe892f341ce03d6d23f
 * * 使い方:
 * 1. Node.jsとnpmがインストールされていることを確認してください。
 * 2. `npm install marked` を実行して、依存ライブラリをインストールします。
 * 3. `cat your_markdown_file.md | node md-to-slack-block-kit.js` のように実行します。
 */

const fs = require('fs');
const { marked } = require('marked');

/**
 * markedのインライントークンを解析し、Slackのmrkdwn形式の文字列に変換します。
 * リンク、太字、斜体、取り消し線、インラインコードなどに対応します。
 * @param {marked.Token[]} tokens - markedによって生成されたインライントークンの配列。
 * @returns {string} Slackのmrkdwn形式にフォーマットされた文字列。
 */
function parseInline(tokens) {
    let text = '';
    if (!tokens) return '';

    for (const token of tokens) {
        switch (token.type) {
            case 'text':
                text += token.text;
                break;
            case 'link':
                text += `<${token.href}|${parseInline(token.tokens)}>`;
                break;
            case 'image':
                // Section Block内では画像はリンクとして表現するのが無難です。
                text += `<${token.href}|${token.text}>`;
                break;
            case 'strong':
                text += `*${parseInline(token.tokens)}*`;
                break;
            case 'em':
                text += `_${parseInline(token.tokens)}_`;
                break;
            case 'del':
                text += `~${parseInline(token.tokens)}~`;
                break;
            case 'codespan':
                text += `\`${token.text}\``;
                break;
            case 'br':
                text += '\n';
                break;
            default:
                // 未対応のトークンは元のテキストをそのまま利用します。
                text += token.raw || '';
        }
    }
    return text;
}

/**
 * ネストされたリストトークンを再帰的に解析し、インデント付きのmrkdwn文字列を生成します。
 * @param {marked.Tokens.List} listToken - markedのリストトークン。
 * @param {number} depth - 現在のリストのネスト深度。
 * @returns {string} Slackのmrkdwn形式にフォーマットされたリスト文字列。
 */
function renderList(listToken, depth = 0) {
    const indent = '  '.repeat(depth);
    return listToken.items.map((item, index) => {
        const prefix = listToken.ordered ? `${listToken.start + index}. ` : '• ';
        
        let textContent = '';
        let nestedListContent = '';

        for (const token of item.tokens) {
            if (token.type === 'list') {
                nestedListContent = renderList(token, depth + 1);
            } else {
                textContent += parseInline(token.tokens || [token]);
            }
        }
        return `${indent}${prefix}${textContent}${nestedListContent ? '\n' + nestedListContent : ''}`;
    }).join('\n');
}

/**
 * markedのトークンから書式を除いたプレーンテキストを抽出します。
 * @param {marked.Token[]} tokens - markedによって生成されたトークンの配列。
 * @returns {string} 抽出されたプレーンテキスト。
 */
function extractTextFromTokens(tokens) {
    if (!tokens) return '';
    return tokens.map(token => {
        if (token.type === 'text') return token.text;
        if (token.tokens) return extractTextFromTokens(token.tokens);
        return token.raw || '';
    }).join('');
}

/**
 * Slackのtableブロック用のrich_textセルオブジェクトを生成します。
 * @param {marked.Token[]} cellTokens - セルの内容を表すmarkedトークン。
 * @param {boolean} [isHeader=false] - ヘッダーセルかどうか。trueの場合、テキストが太字になります。
 * @returns {object} Slackのrich_textセルオブジェクト。
 */
function createRichTextCell(cellTokens, isHeader = false) {
    // rich_textはmrkdwnと書式が異なるため、ここではプレーンテキストのみ抽出します。
    // 将来的にはここを拡張して、rich_text内の書式（リンクなど）に対応することも可能です。
    const textContent = extractTextFromTokens(cellTokens);
    
    const textElement = {
        type: 'text',
        // セルのテキストが空だとAPIエラーになるため、空の場合は半角スペースを入れます。
        text: textContent.trim() || ' ',
    };

    if (isHeader) {
        textElement.style = { bold: true };
    }

    return {
        type: 'rich_text',
        elements: [{
            type: 'rich_text_section',
            elements: [textElement]
        }]
    };
}


/**
 * Markdown文字列をSlackのBlock Kit JSONオブジェクトに変換します。
 * @param {string} markdown - 変換対象のMarkdown文字列。
 * @returns {object} Slack Block KitのJSONオブジェクト { blocks: [...] }。
 */
function markdownToSlackBlocks(markdown) {
    const tokens = marked.lexer(markdown, { gfm: true, breaks: true });
    const blocks = [];

    for (const token of tokens) {
        switch (token.type) {
            case 'heading':
                blocks.push({
                    type: 'header',
                    text: {
                        type: 'plain_text',
                        text: parseInline(token.tokens),
                        emoji: true,
                    },
                });
                break;

            case 'list':
                blocks.push({
                    type: 'section',
                    text: {
                        type: 'mrkdwn',
                        text: renderList(token),
                    },
                });
                break;

            case 'paragraph':
                const paragraphText = parseInline(token.tokens);
                if (paragraphText.trim()) {
                    blocks.push({
                        type: 'section',
                        text: {
                            type: 'mrkdwn',
                            text: paragraphText,
                        },
                    });
                }
                break;

            case 'blockquote':
                const quoteContent = token.tokens.map(innerToken => {
                    switch (innerToken.type) {
                        case 'heading': return `*${parseInline(innerToken.tokens)}*`;
                        case 'paragraph': return parseInline(innerToken.tokens);
                        case 'list': return renderList(innerToken);
                        case 'code': return `\`\`\`${innerToken.lang || ''}\n${innerToken.text}\n\`\`\``;
                        default: return innerToken.raw;
                    }
                }).join('\n');
                const quoteText = quoteContent.split('\n').map(line => `> ${line}`).join('\n');
                blocks.push({
                    type: 'section',
                    text: {
                        type: 'mrkdwn',
                        text: quoteText,
                    },
                });
                break;

            case 'code':
                blocks.push({
                    type: 'section',
                    text: {
                        type: 'mrkdwn',
                        text: `\`\`\`${token.lang || ''}\n${token.text}\n\`\`\``,
                    },
                });
                break;

            case 'hr':
                blocks.push({ type: 'divider' });
                break;

            case 'image':
                blocks.push({
                    type: 'image',
                    image_url: token.href,
                    alt_text: token.text,
                    title: token.title ? { type: 'plain_text', text: token.title, emoji: true } : undefined,
                });
                break;
            
            case 'table':
                // ヘッダー行を生成 (太字)
                const headerRow = token.header.map(cell => createRichTextCell(cell.tokens, true));
                // データ行を生成
                const dataRows = token.rows.map(row => 
                    row.map(cell => createRichTextCell(cell.tokens, false))
                );

                blocks.push({
                    type: 'table',
                    rows: [headerRow, ...dataRows]
                });
                break;

            case 'space':
                // 複数の改行は無視します。
                break;

            default:
                // console.warn(`未対応のトークンタイプです: ${token.type}`);
                break;
        }
    }

    return {
        blocks: blocks,
    };
}


/**
 * メイン処理：標準入力または指定されたファイルからMarkdownを読み込み、変換して標準出力に書き出す
 */
function main() {
    const args = process.argv.slice(2); // 最初の2つの要素 (node, スクリプト名) を除く

    if (args.includes('--help') || args.includes('-h')) {
        console.log(`
Usage: node md-to-slack-block-kit.js [options] [file]

Convert Markdown to Slack Block Kit JSON.

Options:
  -h, --help    Show this help message and exit.

Arguments:
  file          Path to a Markdown file. If not provided, reads from stdin.

Examples:
  cat your_markdown_file.md | node md-to-slack-block-kit.js
  node md-to-slack-block-kit.js your_markdown_file.md
`);
        process.exit(0);
    }

    let markdownInput = '';
    try {
        if (args.length > 0) {
            // ファイルパスが指定された場合
            const filePath = args[0];
            markdownInput = fs.readFileSync(filePath, 'utf8');
        } else {
            // 標準入力から読み込む場合
            markdownInput = fs.readFileSync(0, 'utf8');
        }

        if (!markdownInput.trim()) {
            // 入力が空または空白のみの場合は何もしない
            return;
        }

        const slackBlockKitJson = markdownToSlackBlocks(markdownInput);
        console.log(JSON.stringify(slackBlockKitJson, null, 2));
    } catch (error) {
        if (error.code === 'ENOENT') {
            console.error(`Error: File not found at ${args[0]}`);
        } else {
            console.error("Markdownの処理中にエラーが発生しました:", error);
        }
        process.exit(1);
    }
}

if (require.main === module) {
    main();
}
