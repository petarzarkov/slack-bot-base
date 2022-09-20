import { IncomingMessage, ServerResponse } from "http";
import { SERVICE_PORT, SERVICE_RESTART_ON_REJECTION_TIME } from "../../constants";
import { appHealth } from "../../";

export async function healthcheck(_req: IncomingMessage, res: ServerResponse) {
    const slackHealth = await appHealth();
    res.writeHead(200, { "Content-Type": "application/json" });
    res.write(JSON.stringify({
        status: slackHealth.ok ? "OK" : "ERROR",
        slackHealth
    }));
    res.end();
}

export function configcheck(_req: IncomingMessage, res: ServerResponse): void {
    res.writeHead(200, { "Content-Type": "application/json" });
    res.write(JSON.stringify({
        status: "OK",
        env: {
            SERVICE_PORT,
            SERVICE_RESTART_ON_REJECTION_TIME
        }
    }));
    res.end();
}

export function upcheck(_req: IncomingMessage, res: ServerResponse): void {
    res.writeHead(200);
    res.end();
}