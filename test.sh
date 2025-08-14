#!/bin/bash

# Expected JSON output
EXPECTED_JSON='''{
  "blocks": [
    {
      "type": "header",
      "text": {
        "type": "plain_text",
        "text": "Slack Notification",
        "emoji": true
      }
    },
    {
      "type": "section",
      "text": {
        "type": "mrkdwn",
        "text": "Hello, *Yamada-san*!"
      }
    },
    {
      "type": "section",
      "text": {
        "type": "mrkdwn",
        "text": "> This is an important notification.\n> `release-v1.2.3` has been deployed."
      }
    },
    {
      "type": "header",
      "text": {
        "type": "plain_text",
        "text": "Changes",
        "emoji": true
      }
    },
    {
      "type": "section",
      "text": {
        "type": "mrkdwn",
        "text": "• Added new feature A\n• Fixed bug B\n  • Nested item\n• See <https://example.com|here> for details."
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
                    "text": "Feature",
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
                    "text": "Status",
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
                    "text": "Login"
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
                    "text": "Post"
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
                    "text": "In Progress"
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
ACTUAL_JSON=$(node md-to-slack.js testfile.md)

# Compare the output
if diff -u <(echo "$EXPECTED_JSON") <(echo "$ACTUAL_JSON"); then
    echo "Test passed: Output matches expected JSON."
    exit 0
else
    echo "Test failed: Output does NOT match expected JSON."
    exit 1
fi