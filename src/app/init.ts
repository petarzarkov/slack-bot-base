import { App, GenericMessageEvent } from "@slack/bolt";
import { HotLogger } from "hot-utils";
import { BOT_NAME, CUSTOM_GROUPS } from "../constants";
import { AppContext } from "../index";
import { actions } from "./actions";
import { commandsMap } from "./commands";
import { getRandomFun } from "./fun";
import { jiraActions, reminderActions } from "./handlers";
import { helpBlock } from "./help";

const log = HotLogger.createLogger("app/init");

export const init = (app: App<AppContext>) => {
    // Match any command starting with /custom
    // Response is ephemeral and lists all the groups only to the user invoking the slash command
    app.command(/(\/)(custom*.+)/g, async ({ ack }) => {

        await ack({
            blocks: [
                {
                    type: "section",
                    text: {
                        "type": "mrkdwn",
                        "text": CUSTOM_GROUPS
                    }

                },
            ],
            response_type: "ephemeral", // change to "in_channel" to make it visible to others
        });
    });

    // This will match any message that contains hi|hello|hey|👋
    app.message(/^(hi|hello|hey|:wave:|yo|greetings).*/ig, async ({ message, say, context }) => {
        const greeting = context.matches[0];
        await say(`:slot_machine: ${greeting || "Hi"}, <@${(message as GenericMessageEvent).user}> \n ${getRandomFun()}`);
    });

    const botNameRgxr = new RegExp(`^(${BOT_NAME})(.*)`, "i");
    // This will match the messages for the all app commands
    app.message(botNameRgxr, async ({ message, say, context, client }) => {
        const matchedCommands = context.matches[2].split(" ").map(t => t.trim()).filter(Boolean);
        const matchCommand = matchedCommands[0];

        const msgEv = message as GenericMessageEvent;
        try {
            await client.chat.postEphemeral({
                channel: msgEv.channel,
                text: `<@${msgEv.user}>, handling your command:
                *requestId:* \`${context.requestId}\`
                ${matchCommand ? `*command:* ${matchCommand}` : ""}
                ${matchedCommands.length > 1 ? `*arguments:* ${matchedCommands.slice(1).join()}` : ""}
                `,
                user: msgEv.user
            });

            if (commandsMap[matchCommand]) {
                const msg = await commandsMap[matchCommand].handler(context.requestId, matchedCommands.slice(1));

                await say(msg);
                return;
            }

            await say(matchCommand ?
                `Unsupported command: \`${matchCommand}\`, <@${msgEv.user}>, sorry!`
                :
                helpBlock);
        } catch (error) {
            const errMsg = "Error on handling command";
            log.error(errMsg, { requestId: context.requestId, err: error as Error, event: matchCommand });
            await say(`
            ${errMsg}: \`${matchCommand || "help"}\`,
            <@${msgEv.user}>,
            please contact the developer!
            requestId: \`${context.requestId}\``
            );
        }
    });

    app.event("app_mention", async ({ say }) => {
        await say(helpBlock);
    });

    app.action({ action_id: actions.botAdd }, async ({ payload, ack, client, respond }) => {

        await ack();

        const selectedChannel = (payload as unknown as Record<string, string>).selected_channel;
        const joinResponse = await client.conversations.join({
            channel: selectedChannel
        });

        await respond({
            replace_original: false,
            text: joinResponse.ok ?
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion, @typescript-eslint/no-non-null-asserted-optional-chain
                joinResponse.warning ? `:crying_cat_face: ${joinResponse.warning}` : `:joy_cat: Successfully joined channel \`${joinResponse.channel?.name!}\``
                : "Couldn't join selected channel."
        });
    });

    app.action({ action_id: actions.openBrowser }, async ({ ack }) => {
        await ack();
    });

    // Acknowledge payload actions
    app.action({ action_id: /^remindee|reminder_time|reminder|assignee|type|team|title|description|status$/g }, async ({ ack }) => {
        await ack();
    });

    jiraActions(app);
    reminderActions(app);
};