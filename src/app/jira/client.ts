import { HotRequests } from "hot-utils";
import { NestedJSON } from "../../contracts";
import { JIRA_USER, JIRA_TOKEN, JIRA_URL } from "../../constants";
import { buildIssue } from "./models";

export class JiraAPI {
    private jiraTeamsMap = {
        "@some-custom-team": "[CustomTeam] CustomTeam"
    };
    private jiraTeamsMapReversed = Object.fromEntries(Object.entries(this.jiraTeamsMap).map(a => a.reverse())) as Record<string, string>;
    private jiraCustomFieldsMap = {
        status: "customfield_18212",
        team: "customfield_10721",
        account: "customfield_16000",
        fixVersions: "customfield_13802"
    };
    private jiraAuthToken: string;

    public metadata: {
        issueTypes: NestedJSON;
        issueTypesArray: string[] | null;
        allowedTeams: NestedJSON;
        allowedTeamsArray: string[] | null;
    } = {
            issueTypes: {},
            issueTypesArray: [],
            allowedTeams: {},
            allowedTeamsArray: []
        };

    private host: string;
    private apiPath: string;

    constructor({
        token = JIRA_TOKEN,
        user = JIRA_USER,
        host = JIRA_URL,
        apiPath = "/rest/api/latest"
    }: { token?: string; user?: string; host?: string; apiPath?: string } = {}) {
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        this.jiraAuthToken = Buffer.from(`${user!}:${token!}`).toString("base64");
        this.host = host;
        this.apiPath = apiPath;
    }

    public init = async () => {
        const issueTypes = await HotRequests.get<unknown, NestedJSON>({
            url: this.host,
            options: {
                eventName: "JiraInit",
                path: "{apiPath}/issue/createmeta/CAS/issuetypes",
                pathParams: {
                    apiPath: this.apiPath
                },
                headers: {
                    Authorization: `Basic ${this.jiraAuthToken}`
                }
            },
        });

        if (issueTypes.success && issueTypes.result) {
            this.metadata.issueTypes = issueTypes.result;
            this.metadata.issueTypesArray = (issueTypes.result.values as unknown as Record<string, string>[]).map(r => r.name);
        }

        const availableTeams = await HotRequests.get<unknown, NestedJSON>({
            url: this.host,
            options: {
                eventName: "JiraInit",
                path: "{apiPath}/issue/CAS-36314/editmeta",
                pathParams: {
                    apiPath: this.apiPath
                },
                headers: {
                    Authorization: `Basic ${this.jiraAuthToken}`
                }
            }
        });

        if (availableTeams.success && availableTeams.result) {
            this.metadata.allowedTeams = availableTeams.result.fields?.[this.jiraCustomFieldsMap.team].allowedValues;
            this.metadata.allowedTeamsArray = (this.metadata.allowedTeams as unknown as Record<string, string>[])
                .map(r => r.value)
                .filter(r => r.startsWith("[CustomTeam]"));
        }
    };

    public getIssue = async (_requestId: string, taskId = "CAS-36314") => {
        const res = await HotRequests.get<unknown, NestedJSON>({
            url: this.host,
            options: {
                eventName: "JiraGet",
                path: "{apiPath}/issue/{taskId}",
                pathParams: {
                    taskId,
                    apiPath: this.apiPath
                },
                headers: {
                    Authorization: `Basic ${this.jiraAuthToken}`
                }
            }
        });

        if (!res.success || !res.result) {
            return `:jira-logo: Failed retrieving JIRA ticket: ${taskId}, ${res.result ? `Err: ${JSON.stringify(res.result)}` : ""}`;
        }

        return buildIssue({
            taskId,
            payload: res.result,
            fieldsMap: this.jiraCustomFieldsMap,
            reversedTeamsMap: this.jiraTeamsMapReversed
        });
    };

    public createIssue = async (_requestId: string, {
        title,
        description,
        issuetype,
        assignee,
        team,
        creator,
        status = "Open"
    }: {
        title: string;
        assignee?: string;
        team: string;
        description?: string;
        issuetype?: string;
        creator: {
            displayName: string;
            emailAddress: string;
        };
        status?: string;
    }) => {
        const request = {
            fields: {
                project: {
                    key: "CAS"
                },
                summary: title,
                description: description,
                issuetype: {
                    name: issuetype
                },
                ...assignee && {
                    assignee: {
                        name: !assignee.includes("@draftkings.com") ? null : assignee
                    }
                },
                labels: [
                    "casbot-create"
                ],
                [this.jiraCustomFieldsMap.team]: [
                    (this.metadata.allowedTeams as unknown as Record<string, string>[]).find(t => t.value === team) || {
                        "self": `${JIRA_URL}/rest/api/2/customFieldOption/35200`,
                        "value": "[Casino] TechOps",
                        "id": "35200",
                        "disabled": false
                    }],
                [this.jiraCustomFieldsMap.account]: "397"
            }
        };

        const res = await HotRequests.post<typeof request, NestedJSON>({
            url: this.host,
            options: {
                eventName: "JiraCreate",
                path: "{apiPath}/issue",
                pathParams: {
                    apiPath: this.apiPath
                },
                headers: {
                    Authorization: `Basic ${this.jiraAuthToken}`
                }
            },
            payload: request
        });

        if (!res.success || !res.result) {
            return `:jira-logo: Failed creating JIRA ticket, ${res.result ? `Err: ${JSON.stringify(res.result)}` : ""}`;
        }

        const finalFields = {
            ...request.fields,
            creator,
            status: {
                name: status
            },
            [this.jiraCustomFieldsMap.account]: {
                name: "[CAS] Casino Dev Support (344)"
            }
        };

        return buildIssue({
            taskId: res.result.key as unknown as string,
            headerAffix: "Created",
            payload: {
                // teamName: (request.fields?.[this.jiraCustomFieldsMap.team] as unknown as Record<string, string>)?.value,
                fields: finalFields
            } as unknown as NestedJSON,
            fieldsMap: this.jiraCustomFieldsMap,
            reversedTeamsMap: this.jiraTeamsMapReversed
        });
    };
}

