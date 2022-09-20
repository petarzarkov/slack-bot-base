import { SayArguments } from "@slack/bolt";
import { BOT_NAME } from "../constants";
import { actions } from "./actions";
import { baseCommands, Command, commands, funCommands } from "./commands";

const commandsFormat = (c: Record<string, Command>) => {
    return `
${Object.keys(c).map(commandKey => {
        const commandBase = `${BOT_NAME} ${commandKey}`;
        if (c[commandKey].description) {
            return `• \`${commandBase}\` - ${c[commandKey].description}`;
        }

        return `• \`${commandBase}\``;
    }).join("\n")}
`;
};

export const helpBlock: SayArguments = {
    text: "Help unavailable.", // Fallback text
    "blocks": [
        {
            "type": "section",
            "text": {
                "type": "mrkdwn",
                "text": `Hey there :eyes: I'm ${BOT_NAME}. I'm here to help you with anything.`
            }
        },
        {
            "type": "section",
            "text": {
                "type": "mrkdwn",
                "text": "*:slot_machine: Use the `/custom` command* to get more info. Try it out by using the `/custom` command in this channel."
            }
        },
        {
            "type": "section",
            "text": {
                "type": "mrkdwn",
                "text": `*:crossed_swords: Commands* ${commandsFormat({ ...baseCommands, ...commands })}`
            }
        },
        {
            "type": "section",
            "text": {
                "type": "mrkdwn",
                "text": `*:tada: Fun commands* ${commandsFormat(funCommands)}`
            }
        },
        {
            "type": "section",
            "text": {
                "type": "mrkdwn",
                // eslint-disable-next-line max-len
                "text": "➕ To have me helping, *add me to a channel* and I'll introduce myself. I'm usually added to a team or project channel. Type `/invite @BotDisplayName` from the channel or pick a channel on the right."
            },
            "accessory": {
                "type": "channels_select",
                "action_id": actions.botAdd,
                "placeholder": {
                    "type": "plain_text",
                    "text": "Select a channel...",
                    "emoji": true
                }
            }
        },
        {
            "type": "divider"
        },
        {
            "type": "context",
            "elements": [
                {
                    "type": "mrkdwn",
                    "text": `❓Get help at any time with \`/custom\` or type ${BOT_NAME} in a DM with me or in a channel I'm invited in`
                }
            ]
        },
        {
            "type": "divider"
        },
        {
            "type": "section",
            "text": {
                "type": "mrkdwn",
                "text": ":information_source: More info here."
            },
            "accessory": {
                "type": "button",
                "text": {
                    "type": "plain_text",
                    "text": "Info",
                    "emoji": true
                },
                "value": "bot_info",
                "url": "https://github.com/petarzarkov/slack-bot-base/README.md",
                "action_id": actions.openBrowser
            }
        }
    ]
};