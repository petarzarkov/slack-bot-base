import { AllMiddlewareArgs } from "@slack/bolt";
import { SLACK_USER_TOKEN } from "../../constants";
import { v4 } from "uuid";

export async function obtainRequestId({ context, next }: AllMiddlewareArgs<{ requestId: string }>) {
    context["requestId"] = v4();
    context.userToken = SLACK_USER_TOKEN;

    return await next();
}