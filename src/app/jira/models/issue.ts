/* eslint-disable @typescript-eslint/restrict-template-expressions */
import { JIRA_URL } from "../../../constants";
import { NestedJSON } from "../../../contracts";
import { buildContext } from "../../models";

export const buildIssue = ({
    taskId,
    payload,
    fieldsMap,
    reversedTeamsMap,
    headerAffix
}: {
    taskId: string;
    payload: NestedJSON;
    fieldsMap: Record<string, string>;
    reversedTeamsMap: Record<string, string>;
    headerAffix?: string;
}) => {
    const { summary, issuetype, assignee, reporter, creator, status, teamName } = payload.fields || {};

    return buildContext({
        color: "#5063f2",
        header: headerAffix ? `:jira-logo: ${headerAffix} ${taskId} ${summary as unknown as string}`: `:jira-logo: ${taskId} ${summary as unknown as string}`,
        data: {
            Task: `${JIRA_URL}/browse/${taskId}`,
            Type: issuetype?.name,
            Assignee: assignee?.name,
            Reporter: reporter?.name,
            Author: creator?.displayName,
            AuthorEmail: creator?.emailAddress,
            Team: reversedTeamsMap[payload.fields?.[fieldsMap.team]?.[0]?.value as unknown as string]
                || payload.fields?.[fieldsMap.team]?.[0]?.value as unknown as string
                || teamName,
            Account: payload.fields?.[fieldsMap.account]?.name,
            Status: status?.name,
        } as unknown as NestedJSON,
        button: {
            text: "Open in browser",
            url: `${JIRA_URL}/browse/${taskId}`
        }
    });
};