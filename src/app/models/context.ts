/* eslint-disable @typescript-eslint/restrict-template-expressions */
import { SayArguments } from "@slack/bolt";
import { HotObj } from "hot-utils";
import { NestedJSON } from "../../contracts";
import { actions } from "../actions";

export const buildContext = ({
    data,
    header,
    button,
    color = "good"
}: {
    header: string;
    data: NestedJSON;
    button?: {
        text: string;
        url?: string;
        block_id?: string;
        action_id?: string;
    };
    color?: string;
}) => {
    const payloadClean = HotObj.cleanUpNullables(data || {});

    const model: SayArguments = {
        attachments: [
            {
                color: color,
                fallback: header,
                blocks: [
                    {
                        type: "header",
                        text: {
                            type: "plain_text",
                            text: header
                        }
                    },
                    {
                        type: "divider"
                    },
                    payloadClean && {
                        type: "context",
                        elements: buildContextElements(payloadClean)
                    },
                    button ? {
                        type: "actions",
                        block_id: button.block_id || `block_${actions.openBrowser}`,
                        elements: [
                            {
                                "type": "button",
                                action_id: actions.openBrowser,
                                "text": {
                                    "type": "plain_text",
                                    "emoji": true,
                                    "text": button.text
                                },
                                ...button.url && { "url": button.url }
                            }
                        ]
                    } : {
                        type: "divider"
                    }
                ]
            }
        ]
    };

    return model;
};

const buildContextElements = (payload: Partial<NestedJSON>) => {
    try {
        return Object.keys(payload).map(key => ({
            type: "mrkdwn",
            // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
            text: `*${key}:* ${typeof(payload[key]) === "string" ?
                payload[key] : JSON.stringify(payload[key], getCircularReplacer())}`
        }));
    } catch (error) {
        return [{
            type: "mrkdwn",
            text: (error as Error).toString()
        }];
    }

};

const getCircularReplacer = () => {
    const seen = new WeakSet();
    return (_key: string, value: object | null) => {
        if (typeof value === "object" && value !== null) {
            if (seen.has(value)) {
                return;
            }
            seen.add(value);
        }
        return value;
    };
};