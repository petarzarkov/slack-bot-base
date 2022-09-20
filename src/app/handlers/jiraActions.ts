import { App } from "@slack/bolt";
import { AppContext, jira } from "../../index";
import { actions } from "../actions";
import { buildJiraIssueModal } from "../jira";

export const jiraActions = (app: App<AppContext>) => {
    app.action({ action_id: actions.jiraCreate }, async ({ ack, client, body }) => {
        await ack();

        await client.views.open({
            trigger_id: (body as { trigger_id: string }).trigger_id,
            view: buildJiraIssueModal(actions.viewJiraCreate, body.user.id, body.channel?.id),
        });
    });

    app.view({ callback_id: actions.viewJiraCreate }, async ({ ack, payload, client, context, body }) => {
        await ack();

        const state = payload.state.values;
        const requestingUser = await client.users.profile.get({
            user: body.user.id
        });

        if (state.block_assignee.assignee.selected_user && body.user.id !== state.block_assignee.assignee.selected_user) {
            const assignee = await client.users.profile.get({
                user: state.block_assignee.assignee.selected_user
            });

            if (assignee.ok) {
                state.block_assignee.assignee.selected_user = assignee.profile?.email;
            }
        } else {
            if (requestingUser.ok) {
                state.block_assignee.assignee.selected_user = requestingUser.profile?.email;
            }
        }

        const info = {
            title: state?.block_title?.title?.value,
            description: state?.block_description?.description?.value,
            assignee: state?.block_assignee?.assignee?.selected_user,
            type: state?.block_type?.type?.selected_option?.value,
            team: state?.block_team?.team?.selected_option?.value,
            status: state?.block_status?.status?.selected_option?.value,
        };

        const create = await jira.createIssue(context.requestId, {
            title: info.title as string,
            description: info.description as string,
            issuetype: info.type,
            assignee: info.assignee as string,
            team: info.team as string,
            creator: {
                displayName: requestingUser.profile?.display_name as string || requestingUser.profile?.real_name as string,
                emailAddress: requestingUser.profile?.email as string
            },
            status: info.status as string
        });

        await client.chat.postMessage({
            channel: payload.private_metadata,
            ...typeof (create) === "string" ? { text: create } : create
        });
    });
};