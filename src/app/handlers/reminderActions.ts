import { App } from "@slack/bolt";
import { NestedJSON } from "src/contracts";
import { AppContext } from "../../index";
import { actions } from "../actions";
import { buildContext } from "../models";
import { buildReminderModal, deleteReminders, scheduleReminder, showReminders } from "../reminders";
import { ConvoOrUser, getConvoOrUser } from "../utils";

export const reminderActions = (app: App<AppContext>) => {
    app.action({ action_id: actions.reminder }, async ({ ack, client, body }) => {
        await ack();

        await client.views.open({
            trigger_id: (body as { trigger_id: string }).trigger_id,
            view: buildReminderModal(actions.viewReminder, body.user.id, body.channel?.id),
        });
    });

    app.action({ action_id: actions.remindersShow }, async ({ ack, client, body }) => {
        await ack();

        void showReminders({ userId: body.user.id, client });
    });

    app.action({ action_id: actions.remindersDel }, async ({ ack, client, body }) => {
        await ack();

        void deleteReminders({ userId: body.user.id, client });
    });

    app.view({ callback_id: actions.viewReminder }, async ({ ack, payload, client, body }) => {
        await ack();

        const state = payload.state.values;
        const requestingUser = await client.users.profile.get({
            user: body.user.id
        });

        const remindeeData: ConvoOrUser = {
            id: body.user.id,
            name: requestingUser.profile?.real_name || body.user.name,
            type: "user"
        };

        if (state.block_remindee.remindee.selected_conversation && body.user.id !== state.block_remindee.remindee.selected_conversation) {
            const convoUser = await getConvoOrUser(client, state.block_remindee.remindee.selected_conversation);
            if (convoUser) {
                remindeeData.id = convoUser.id;
                remindeeData.name = convoUser.name;
                remindeeData.type = convoUser.type;
            }
        }

        const info = {
            reminder: state?.block_reminder?.reminder?.value,
            remindee: remindeeData.name,
            reminderTime: state?.block_reminder_time?.reminder_time?.selected_time,
            reminderDate: state?.block_reminder_date?.reminder_date?.selected_date,
            reminderRequester: requestingUser.profile?.email
        };

        void scheduleReminder({
            requestingUserId: body.user.id,
            remindee: remindeeData,
            reminder: info.reminder as string,
            date: info.reminderDate as string,
            time: info.reminderTime as string,
            requestingUser: requestingUser.profile,
            client
        });

        await client.chat.postMessage({
            channel: payload.private_metadata,
            ...buildContext({
                header: `I will remind ${info.remindee}`,
                data: info as unknown as NestedJSON,
                color: "#a8a69e"
            })
        });
    });
};