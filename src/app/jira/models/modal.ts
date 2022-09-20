import { buildModal } from "../../models";
import { jira } from "../../../index";

export const buildJiraIssueModal = (modalId: string, user: string, private_metadata?: string) => {
    return buildModal({
        private_metadata,
        callback_id: modalId,
        title: "Create Jira Issue",
        submitText: "Create",
        blocks: [
            {
                "type": "input",
                "block_id": "block_title",
                "element": {
                    "type": "plain_text_input",
                    "action_id": "title",
                    "placeholder": {
                        "type": "plain_text",
                        "text": "Placeholder text for title"
                    }
                },
                "label": {
                    "type": "plain_text",
                    "text": "Title"
                }
            },
            {
                "type": "input",
                "block_id": "block_description",
                "element": {
                    "type": "plain_text_input",
                    "action_id": "description",
                    "multiline": true,
                    "placeholder": {
                        "type": "plain_text",
                        "text": "Input your description."
                    }
                },
                "label": {
                    "type": "plain_text",
                    "text": "Description"
                }
            },
            {
                "type": "input",
                dispatch_action: true,
                "block_id": "block_team",
                "label": {
                    "type": "plain_text",
                    "text": "Team"
                },
                "element": {
                    "type": "static_select",
                    action_id: "team",
                    initial_option: {
                        text: {
                            "type": "plain_text",
                            "text": "[SomeTeam] Team",
                            "emoji": true
                        },
                        value: "[SomeTeam] Team"
                    },
                    "placeholder": {
                        "type": "plain_text",
                        "text": "Select team",
                        "emoji": true
                    },
                    "options": jira.metadata.allowedTeamsArray?.map(r => ({
                        "text": {
                            "type": "plain_text",
                            "text": r,
                            "emoji": true
                        },
                        "value": r
                    }))
                }
            },
            {
                "type": "input",
                "block_id": "block_type",
                "optional": false,
                dispatch_action: true,
                "element": {
                    "type": "static_select",
                    "action_id": "type",
                    initial_option: {
                        text: {
                            "type": "plain_text",
                            "text": "TechOps Task",
                            "emoji": true
                        },
                        value: "TechOps Task"
                    },
                    "placeholder": {
                        "type": "plain_text",
                        "text": "Pick a type",
                        "emoji": true,
                    },
                    "options": jira.metadata.issueTypesArray?.map(r => ({
                        "text": {
                            "type": "plain_text",
                            "text": r,
                            "emoji": true
                        },
                        "value": r
                    }))
                },
                "label": {
                    "type": "plain_text",
                    "text": "Type"
                }
            },
            {
                "type": "input",
                "block_id": "block_assignee",
                "optional": true,
                dispatch_action: true,
                hint: {
                    type: "plain_text",
                    text: "Please select valid users only",
                    emoji: true
                },
                "element": {
                    "type": "users_select",
                    "action_id": "assignee",
                    initial_user: user,
                    "placeholder": {
                        "type": "plain_text",
                        "text": "Select assignee",
                        "emoji": true,
                    }
                },
                "label": {
                    "type": "plain_text",
                    "text": "Assignee"
                }
            },
            {
                "type": "section",
                "block_id": "block_status",
                "text": {
                    "type": "mrkdwn",
                    "text": "Pick a status"
                },
                "accessory": {
                    "type": "static_select",
                    action_id: "status",
                    initial_option: {
                        text: {
                            "type": "plain_text",
                            "text": "Open",
                            "emoji": true
                        },
                        value: "Open"
                    },
                    "placeholder": {
                        "type": "plain_text",
                        "text": "Select a status",
                        "emoji": true
                    },
                    "options": ["Open", "In Progress"].map(r => ({
                        "text": {
                            "type": "plain_text",
                            "text": r,
                            "emoji": true
                        },
                        "value": r
                    }))
                }
            },
            // {
            //     "block_id": "block_post_create_channel",
            //     "type": "input",
            //     "optional": true,
            //     "label": {
            //         "type": "plain_text",
            //         "text": "Select a channel to post the result on (optional)",
            //     },
            //     "element": {
            //         "action_id": "post_create_channel",
            //         "type": "conversations_select",
            //         "response_url_enabled": true,
            //         default_to_current_conversation: true
            //     },
            // },
        ],
    });
};