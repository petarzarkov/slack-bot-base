import { WebClient } from "@slack/web-api";

export type ConvoOrUser = {
    id: string;
    name: string;
    type: "channel" | "user";
};

export const getConvoOrUser = async (client: WebClient, id: string): Promise<ConvoOrUser | undefined> => {
    try {
        const convo = await client.conversations.info({
            channel: id
        });

        if (convo.ok) {
            return {
                id: convo.channel?.id as string,
                name: convo.channel?.name as string,
                type: "channel"
            };
        }

    } catch (error) {
        const user = await client.users.profile.get({
            user: id,
        });

        if (user.ok) {
            return {
                id,
                name: user.profile?.real_name as string,
                type: "user"
            };
        }
    }
};