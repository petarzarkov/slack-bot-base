/* eslint-disable @typescript-eslint/restrict-template-expressions */
import { SayArguments } from "@slack/bolt";

const genBtn = ({ actionId, btnText, btnUrl, style }: {
    btnText: string;
    actionId: string;
    btnUrl?: string;
    style?: string;
}) => ({
    "type": "button",
    "action_id": actionId,
    "text": {
        "type": "plain_text",
        "text": btnText
    },
    ...style && { style },
    ...btnUrl && { "url": btnUrl }
});

export const buildButton = ({
    btnText,
    context,
    actionId,
    btnUrl
}: {
    btnText: string;
    context: string;
    actionId: string;
    btnUrl?: string;
}) => {
    const model: SayArguments = {
        text: "Button.", // Fallback text
        blocks: [
            {
                type: "context",
                elements: [{
                    type: "mrkdwn",
                    text: context
                }]
            },
            {
                type: "actions",
                block_id: `block_${actionId}`,
                elements: [genBtn({
                    actionId,
                    btnText,
                    btnUrl
                })]
            }
        ]
    };

    return model;
};

export const buildButtons = ({
    context,
    buttons,
    blockId
}: {
    context: string;
    blockId: string;
    buttons: {
        btnText: string;
        actionId: string;
        style?: string;
        btnUrl?: string;
    }[];
}) => {
    const model: SayArguments = {
        text: "Buttons.", // Fallback text
        blocks: [
            {
                type: "context",
                elements: [{
                    type: "mrkdwn",
                    text: context
                }]
            },
            {
                type: "actions",
                block_id: blockId,
                elements: buttons.map(genBtn)
            }
        ]
    };

    return model;
};