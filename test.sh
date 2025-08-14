#!/bin/bash

# Expected JSON output
EXPECTED_JSON='''{
  "blocks": [
    {
      "type": "header",
      "text": {
        "type": "plain_text",
        "text": "Slack通知",
        "emoji": true
      }
    },
    {
      "type": "section",
      "text": {
        "type": "mrkdwn",
        "text": "こんにちは、*山田さん*！"
      }
    },
    {
      "type": "section",
      "text": {
        "type": "mrkdwn",
        "text": "> これは重要な通知です。\n> `release-v1.2.3` がデプロイされました。"
      }
    },
    {
      "type": "header",
      "text": {
        "type": "plain_text",
        "text": "変更点",
        "emoji": true
      }
    },
    {
      "type": "section",
      "text": {
        "type": "mrkdwn",
        "text": "• 新機能Aの追加\n• バグBの修正\n  • ネストされた項目\n• 詳細は<https://example.com|こちら>を参照してください。"
      }
    },
    {
      "type": "table",
      "rows": [
        [
          {
            "type": "rich_text",
            "elements": [
              {
                "type": "rich_text_section",
                "elements": [
                  {
                    "type": "text",
                    "text": "機能",
                    "style": {
                      "bold": true
                    }
                  }
                ]
              }
            ]
          },
          {
            "type": "rich_text",
            "elements": [
              {
                "type": "rich_text_section",
                "elements": [
                  {
                    "type": "text",
                    "text": "ステータス",
                    "style": {
                      "bold": true
                    }
                  }
                ]
              }
            ]
          }
        ],
        [
          {
            "type": "rich_text",
            "elements": [
              {
                "type": "rich_text_section",
                "elements": [
                  {
                    "type": "text",
                    "text": "ログイン"
                  }
                ]
              }
            ]
          },
          {
            "type": "rich_text",
            "elements": [
              {
                "type": "rich_text_section",
                "elements": [
                  {
                    "type": "text",
                    "text": "✅"
                  }
                ]
              }
            ]
          }
        ],
        [
          {
            "type": "rich_text",
            "elements": [
              {
                "type": "rich_text_section",
                "elements": [
                  {
                    "type": "text",
                    "text": "投稿"
                  }
                ]
              }
            ]
          },
          {
            "type": "rich_text",
            "elements": [
              {
                "type": "rich_text_section",
                "elements": [
                  {
                    "type": "text",
                    "text": "進行中"
                  }
                ]
              }
            ]
          }
        ]
      ]
    },
    {
      "type": "divider"
    },
    {
      "type": "section",
      "text": {
        "type": "mrkdwn",
        "text": "<https://placehold.co/100x30/f8f9fa/343a40?text=LOGO|logo>"
      }
    }
  ]
}'''

# Run the script and capture its output
ACTUAL_JSON=$(node md-to-slack-block-kit.js testfile.md)

# Compare the output
if diff -u <(echo "$EXPECTED_JSON") <(echo "$ACTUAL_JSON"); then
    echo "Test passed: Output matches expected JSON."
    exit 0
else
    echo "Test failed: Output does NOT match expected JSON."
    exit 1
fi
