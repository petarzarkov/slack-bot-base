import { buildModal } from "../models";

export const buildReminderModal = (modalId: string, user: string, private_metadata?: string) => {
    const date = new Date();
    // Needed because slack validates the hours "input must match regex pattern: ^([0-1][0-9]|2[0-3]):[0-5][0-9]$"
    const hours = date.getHours().toString().length < 2 ? `0${date.getHours()}` : date.getHours();
    const minutes = date.getMinutes().toString().length < 2 ? `0${date.getMinutes()}` : date.getMinutes();
    return buildModal({
        private_metadata,
        callback_id: modalId,
        title: "Create Reminder",
        submitText: "Create",
        blocks: [
            {
                "type": "input",
                "block_id": "block_reminder",
                "element": {
                    "type": "plain_text_input",
                    "action_id": "reminder",
                    "multiline": true,
                    "placeholder": {
                        "type": "plain_text",
                        "text": "Input your reminder."
                    }
                },
                "label": {
                    "type": "plain_text",
                    emoji: true,
                    "text": "Reminder"
                }
            },
            {
                "type": "section",
                "block_id": "block_reminder_time",
                "text": {
                    "type": "mrkdwn",
                    "text": "Pick a time for the reminder."
                },
                "accessory": {
                    "type": "timepicker",
                    "action_id": "reminder_time",
                    "initial_time": `${hours}:${minutes}`,
                    "placeholder": {
                        "type": "plain_text",
                        "text": "Select a time for the reminder"
                    }
                }
            },
            {
                "type": "section",
                "block_id": "block_reminder_date",
                "text": {
                    "type": "mrkdwn",
                    "text": "Pick a day for the reminder."
                },
                "accessory": {
                    "type": "datepicker",
                    "action_id": "reminder_date",
                    "initial_date": `${date.getUTCFullYear()}-${date.getMonth() + 1}-${date.getDate()}`,
                    "placeholder": {
                        "type": "plain_text",
                        "text": "Select a day for the reminder"
                    }
                }
            },
            {
                "type": "input",
                "block_id": "block_remindee",
                "optional": true,
                dispatch_action: true,
                hint: {
                    type: "plain_text",
                    text: "Whom to remind",
                    emoji: true
                },
                "element": {
                    "type": "conversations_select",
                    "action_id": "remindee",
                    initial_conversation: user,
                    "placeholder": {
                        "type": "plain_text",
                        "text": "Select remindee",
                        "emoji": true,
                    }
                },
                "label": {
                    "type": "plain_text",
                    "text": "Remindee"
                }
            }
        ],
    });
};