import "dotenv/config";
import { App, LogLevel, Logger } from "@slack/bolt";
import { HotLogger } from "hot-utils";
import { init, JiraAPI } from "./app";
import { SLACK_APP_TOKEN, SLACK_BOT_TOKEN, SERVICE_PORT, SLACK_SIGNING_SECRET, SERVICE_RESTART_ON_REJECTION_TIME, IS_DEBUG, APP_SCOPES } from "./constants";
import { configcheck, healthcheck, upcheck } from "./http";
import { delay } from "./utils";
import { trendingEmotesCache, obtainRequestId } from "./app";

const log = HotLogger.createLogger("slack-bot");

log.info("Starting slack bot...", { eventName: "Init" });

// Wrap our logger to match slack bolt's logger
const slackLogger: Logger = {
    getLevel: log.getLogLevel as () => LogLevel,
    setLevel: (l: LogLevel) => {
        log.setLogLevel(l);
    },
    setName: (n: string) => log.child(n),
    info: (...d: [string, Record<string, string | number | boolean | object | undefined>]) => {
        log.info(d?.[0].slice(0, 50) || "Slackbot info", { eventName: d?.[0].slice(0, 13) || "Slackbot info", data: d?.[0] });
    },
    warn: (...d: [string, Record<string, string | number | boolean | object | undefined>]) => {
        log.warn(d?.[0].slice(0, 50) || "Slackbot warn", { eventName: d?.[0].slice(0, 13) || "Slackbot warn", data: d?.[0] });
    },
    error: (...d: [string, Record<string, string | number | boolean | object | undefined>]) => {
        log.error(d?.[0].slice(0, 50) || "Slackbot error", { eventName: d?.[0].slice(0, 13) || "Slackbot error", err: new Error(d?.[0]) });
    },
    debug: (...d: [string, Record<string, string | number | boolean | object | undefined>]) => {
        if (IS_DEBUG) {
            log.info(d?.[0].slice(0, 50) || "Slackbot debug", { eventName: d?.[0].slice(0, 13) || "Slackbot debug", data: d?.[0] });
        }
    },
};

export type AppContext = { requestId: string; matches: string[] };
export const app = new App<AppContext>({
    logLevel: LogLevel.INFO,
    appToken: SLACK_APP_TOKEN,
    token: SLACK_BOT_TOKEN,
    signingSecret: SLACK_SIGNING_SECRET,
    socketMode: true,
    logger: slackLogger,
    port: SERVICE_PORT,
    scopes: APP_SCOPES,
    installerOptions: {
        stateVerification: false,
    },
    customRoutes: [{
        path: "/_healthcheck",
        method: ["GET"],
        // eslint-disable-next-line @typescript-eslint/no-misused-promises
        handler: healthcheck
    }, {
        path: "/_config",
        method: ["GET"],
        handler: configcheck
    }, {
        path: "/_upcheck",
        method: ["GET"],
        handler: upcheck
    }],
});

app.use(obtainRequestId);

// init jira api
export const jira = new JiraAPI();

// eslint-disable-next-line @typescript-eslint/require-await
app.error(async (error) => {
    log.error("App Error occured.", { err: error?.original || error, errors: error?.originals });
});

// Handle and log unhandled promise rejections
process.on("unhandledRejection", (reason: Error | string, promise) => {
    log.error("Rejection error", { err: reason as Error, promise });

    if (reason?.toString()?.includes("An API error occurred: invalid_auth")) {
        // restart the app after some time to reauthenticate
        void delay(SERVICE_RESTART_ON_REJECTION_TIME).then(async () => {
            await appStop();

            void appStart();
        });
    }

});

const appStop = async () => {
    await app.stop();
    trendingEmotesCache.stop();
};

const appStart = async () => {
    const server = await app.start();

    log.info("Websocket server started", { eventName: "Init", data: { server } });
    // Register handlers
    init(app);

    void jira.init();
    void trendingEmotesCache.start();
};

export const appHealth = async () => {
    const testAuth = await app.client.auth.test();

    return testAuth;
};

void appStart();