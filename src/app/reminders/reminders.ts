import { UsersProfileGetResponse, WebClient } from "@slack/web-api";
import { NestedJSON } from "../../contracts";
import { buildContext } from "../models";
import { ConvoOrUser } from "../utils";

export const reminders: Map<string, Record<string, string | NodeJS.Timeout | Record<string, string> | undefined>> = new Map();

export const scheduleReminder = ({ requestingUserId, remindee, reminder, date, time, client, requestingUser }: {
    remindee: ConvoOrUser;
    reminder: string;
    date: string;
    time: string;
    requestingUser: UsersProfileGetResponse["profile"];
    requestingUserId: string;
    client: WebClient;
}) => {
    const { id } = remindee || {};
    const reminderDate =`${date}-${time}`;
    const reminderData: Record<string, string | NodeJS.Timeout | Record<string, string> | undefined> = {
        Reminder: reminder,
        ReminderBy: requestingUser?.email || requestingUser?.real_name,
        ReminderFor: remindee,
        ReminderDate: reminderDate,
        IsComplete: "No",
    };
    const context = buildContext({
        header: `Hey, ${remindee.name}, I'm reminding you the following:`,
        data: reminderData as unknown as NestedJSON,
        color: "#a77df0"
    });

    const timestamp = new Date(reminderDate).getTime();
    const diff = timestamp - Date.now();
    const reminderMs = diff >= 0 ? diff : 1000;

    const reminderTimeout = setTimeout(() => {
        void client.chat.postMessage({
            channel: id,
            ...context
        });

        reminders.set(`${requestingUserId}_${reminderDate}`, {
            ...reminderData,
            IsComplete: "Yes"
        });

    }, reminderMs);
    reminderData.reminderTimeout = reminderTimeout;

    reminders.set(`${requestingUserId}_${reminderDate}`, reminderData);
};

export const showReminders = ({ userId, client }: {
    userId: string;
    client: WebClient;
}) => {
    const remindersList = [...reminders.entries()]
        .filter(r => typeof(r[1]?.ReminderFor) === "object" && r?.[1]?.ReminderFor && "id" in r[1].ReminderFor && r[1]?.ReminderFor?.id === userId);

    if (!remindersList.length) {
        void client.chat.postMessage({
            channel: userId,
            text: "You have no reminders set up."
        });

        return;
    }

    void client.chat.postMessage({
        channel: userId,
        ...buildContext({
            header: "Here's your reminders:",
            data: Object.fromEntries(remindersList) as unknown as NestedJSON
        })
    });

};

export const deleteReminders = ({ userId, client }: {
    userId: string;
    client: WebClient;
}) => {

    void client.chat.postMessage({
        channel: userId,
        text: "RemindersDelete not yet implemented."
    });
};