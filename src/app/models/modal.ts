import { Block, KnownBlock, ModalView } from "@slack/bolt";

export const buildModal = ({
    title,
    submitText = "Submit",
    blocks,
    callback_id,
    private_metadata
}: {
    title: string;
    private_metadata?: string;
    submitText?: string;
    callback_id?: string;
    blocks: (Block | KnownBlock)[];
}): ModalView => ({
    private_metadata,
    "type": "modal",
    callback_id,
    "title": {
        "type": "plain_text",
        "text": title
    },
    "submit": {
        "type": "plain_text",
        "text": submitText
    },
    "close": {
        "type": "plain_text",
        "text": "Cancel",
        "emoji": true
    },
    blocks,
});