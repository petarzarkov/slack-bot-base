import config from "config";

export const APP_SCOPES = process.env.APP_SCOPES ? process.env.APP_SCOPES.split(",") : [
    "app_mentions:read",
    "users.profile:read",
    "chat:write",
    "channels:history",
    "channels:read",
    "channels:write",
    "channels:join",
    "commands",
    "connections:write",
    "groups:read",
    "groups:write",
    "im:read",
    "im:write",
    "mpim:read",
    "mpim:write"
];

export const JIRA_URL = process.env.JIRA_URL || "https://jira.yourorg.com";
export const JIRA_USER = process.env.JIRA_USER;
export const JIRA_TOKEN = process.env.JIRA_TOKEN;

export const BOT_NAME = process.env.BOT_NAME || "pls";
export const IS_DEBUG = process.env.IS_DEBUG === "true" || false;

export const SLACK_APP_TOKEN: string = process.env.SLACK_APP_TOKEN || (config.has("appToken") ? config.get("appToken") : "appToken");
export const SLACK_BOT_TOKEN: string = process.env.SLACK_BOT_TOKEN || (config.has("botToken") ? config.get("botToken") : "botToken");
export const SLACK_USER_TOKEN: string = process.env.SLACK_USER_TOKEN || (config.has("userToken") ? config.get("userToken") : "userToken");
export const SLACK_SIGNING_SECRET: string = process.env.SLACK_SIGNING_SECRET || (config.has("signingSecret") ? config.get("signingSecret") : "signingSecret");

/**
 * @default 3053
 */
export const SERVICE_PORT: number = Number(process.env.PORT || process.env.SERVICE_PORT) || (config.has("servicePort") ? config.get("servicePort") : 3053);
/**
 * @default 45000 // ms
 */
export const SERVICE_RESTART_ON_REJECTION_TIME: number = Number(process.env.SERVICE_RESTART_ON_REJECTION_TIME) || (config.has("rejectionRestartTime") ? config.get("rejectionRestartTime") : 45000);

export const CUSTOM_GROUPS = process.env.CUSTOM_GROUPS || "@custom-group, @custom-group-two";

export const LOGS_URL = "https://kibana.yourorg.com/goto/your-custom-path";