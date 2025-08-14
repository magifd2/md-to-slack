# Markdown to Slack Block Kit Converter

This tool converts Markdown text into Slack Block Kit JSON, suitable for use with the Slack API.

## Features

- Converts common Markdown elements to Slack Block Kit blocks:
  - Headings (H1, H2) -> `header` block
  - Paragraphs -> `section` block with `mrkdwn`
  - Lists (ordered and unordered, including nested lists) -> `section` block with `mrkdwn`
  - Blockquotes -> `section` block with `mrkdwn` (prefixed with `>`)
  - Code Blocks -> `section` block with `mrkdwn` (triple backticks)
  - Horizontal Rules -> `divider` block
  - Images -> `image` block (standalone) or link in `mrkdwn` (within `section` blocks)
  - Tables -> `table` block with `rich_text` cells (plain text only within cells)
- Reads Markdown from standard input or a specified file.
- Outputs Slack Block Kit JSON to standard output.

## Limitations

- **Table Cell Formatting**: Currently, `rich_text` cells in tables only support plain text. Inline formatting (bold, italic, links) within table cells is not preserved in the Block Kit output.
- **Checkbox Rendering**: Checkboxes in lists (`[ ]`, `[x]`) are rendered as plain text within `mrkdwn` fields, as Slack's `mrkdwn` does not natively support interactive checkboxes.

## Installation

1.  Ensure Node.js and npm are installed.
2.  Clone this repository or download the `md-to-slack-block-kit.js` file.
3.  Install dependencies:

    ```bash
    npm install
    ```

## Usage

### From Standard Input (Pipe)

```bash
cat your_markdown_file.md | md-to-slack
```

### From a File Argument

```bash
md-to-slack your_markdown_file.md
```

### Help

```bash
md-to-slack --help
```

## Development

### Running Tests

```bash
npm test
```

## Distribution for Private Use

Since this tool is not published to npm, you can distribute it to your stakeholders by sharing the Git repository. Users can then install and use it locally:

1.  **Clone the repository:**

    ```bash
    git clone <repository_url>
    cd md-to-slack
    ```

2.  **Install dependencies:**

    ```bash
    npm install
    ```

3.  **Make the command globally available (optional, but recommended for convenience):**

    ```bash
    npm link
    ```

    After this, you can run the command from any directory:

    ```bash
    md-to-slack-block-kit your_markdown_file.md
    ```

    Alternatively, you can run it directly from the project directory:

    ```bash
    node md-to-slack.js your_markdown_file.md
    ```

4.  **Updating the tool:**

    To get the latest changes, navigate to the cloned repository directory and run:

    ```bash
    git pull
    npm install # if dependencies have changed
    ```

## License

[MIT License](LICENSE)

## Acknowledgements

This tool's implementation was greatly aided by the insights from the following Qiita article:

- [MarkdownをSlackのBlock Kitに変換する](https://qiita.com/yhatt/items/ebe892f341ce03d6d23f)
