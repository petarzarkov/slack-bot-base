module.exports = {
    // these are for testing purposes
    appToken: "xapp-1-A0402AN0U57-3983134922214-46da88c651a45e1d3e2c531db10286db48d99aa132ce7710390bbade3076b814", // test socket token
    botToken: "xoxb-3917932950309-3992191069508-WCO43oSwP1iWr6yIkjVkLglp", // test token
    userToken: "xoxp-3917932950309-3920889611314-4004703763555-a8a3d5eebcea259fd470594dba58cb24", // test token
    signingSecret: "ecce87c2942a9c57ff771e1fe17ed3f8", // test secret
    servicePort: 3053,
    log: {
        "appType": "slack-bot-base",
        "appName": "slack-bot",
        "level": "TRACE",
        "filters": [{
            "key": "eventName",
            "values": [
                "JiraInit",
                "TrendingEmotes",
                "The top-level"
            ]
        }],
        serializers: [
            {
                key: "eventName",
                values: ["JiraGet"],
                modifiers: [
                    { properties: ["data.result.fields"] },
                ]
            }, {
                key: "eventName",
                values: ["WisdomGet"],
                modifiers: [
                    { properties: ["data.result.wisdom"] },
                ]
            }, {
                key: "eventName",
                values: ["NumberGet"],
                modifiers: [
                    { properties: ["data.result"] },
                ]
            }
        ]
    }
}
