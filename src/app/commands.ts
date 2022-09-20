
import { Context, SayArguments } from "@slack/bolt";
import { AppContext, appHealth, jira } from "../index";
import { BOT_NAME, LOGS_URL } from "../constants";
import { getRandomEmote, getRandomNumberTrivia, getRandomWisdom } from "./fun";
import { helpBlock } from "./help";
import { actions } from "./actions";
import { buildContext, buildButton, buildButtons } from "./models";
import { NestedJSON } from "../contracts";

export type Command = {
    description: string;
    handler: (requestId: string, args: unknown[], context?: Context & AppContext) => (string | SayArguments | Promise<string | SayArguments>);
};

export const baseCommands: Record<string, Command> = {
    help: {
        description: "lists this",
        handler: () => helpBlock
    },
    health: {
        description: "Check my health status",
        handler: async () => {
            const authHealth = await appHealth();

            return buildContext({
                header: `Health Status ${authHealth.ok ? ":white_check_mark:" : ":x:"}`,
                data: authHealth as NestedJSON,
                color: authHealth.ok ? "#388a45" : "#eb4d4d",
                button: {
                    text: "See my app logs here",
                    url: LOGS_URL
                }
            });
        }
    }
};

export const funCommands: Record<string, Command> = {
    emoji: {
        description: "",
        handler: (_r, d) => getRandomEmote(d?.[0] as string)
    },
    dice: {
        description: `supply optional number, e.g. \`${BOT_NAME} dice 12\` or just \`${BOT_NAME} dice\``,
        handler: (_r, d) => {
            const n = Number(d?.[0] as string) || 6;
            return (Math.floor(Math.random() * n) + 1).toString();
        }
    },
    wisdom: {
        description: `gets you a cool wisdom, supported params: en|bg e.g. \`${BOT_NAME} wisdom bg\` or just \`${BOT_NAME} wisdom\``,
        handler: (r, a) => getRandomWisdom(r, a?.[0] as string) },
    numberTrivia: {
        description: `gets you a number trivia, supported params: [1-**] e.g. \`${BOT_NAME} numberTrivia 23\` or just \`${BOT_NAME} numberTrivia\``,
        handler: (r, a) => getRandomNumberTrivia(r, a?.[0] as string)
    }
};

export const commands: Record<string, Command> = {
    jiraGet: {
        description: `fetches a jira ticket, supported params: ticketId e.g. \`${BOT_NAME} jiraGet CAS-36314\``,
        handler: (r, a) => jira.getIssue(r, a?.[0] as string) },
    jiraCreate: {
        description: "",
        handler: () => {
            return buildButton({
                actionId: actions.jiraCreate,
                btnText: "Create",
                context: "Click on the create button to begin"
            });
        }
    },
    remind: {
        description: "Sets up a reminder for you or somebody else",
        handler: () => {
            return buildButtons({
                context: "Click on the Remind to start creating a reminder",
                blockId: `block_${actions.reminder}`,
                buttons: [{
                    actionId: actions.reminder,
                    btnText: "Remind",
                    style: "primary"
                }, {
                    actionId: actions.remindersShow,
                    btnText: "Show Reminders",
                }, {
                    actionId: actions.remindersDel,
                    btnText: "Delete Reminders",
                    style: "danger"
                }]
            });
        }
    },
};

export const commandsMap: Record<string, Command> = {
    ...baseCommands,
    ...funCommands,
    ...commands
};
