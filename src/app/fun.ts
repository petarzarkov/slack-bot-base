import { SayArguments } from "@slack/bolt";
import { HotRequests } from "hot-utils";
import { buildImage } from "./models";

export type Emote = { emote?: { id: string; code: string; imageType?: string }; total?: number };
export const trendingEmotes: { intervalId: NodeJS.Timer | null; emotes: Emote[] | null; interval: number } = {
    intervalId: null,
    emotes: null,
    interval: 60000 * 30 // 30 mins
};

export const FunCache = new Map<string, string>();

export const getRandomFun = () => {
    const funCache = [ ...FunCache.values() ];
    const randomFun = funCache?.[Math.floor(Math.random() * Math.floor(funCache.length))];

    return randomFun;
};

export const getTrendingEmotes = async () => {
    const getTrendingEmotes = await HotRequests.get<unknown, Emote[]>({
        url: "https://api.betterttv.net/3/emotes/shared/trending",
        options: {
            eventName: "TrendingEmotes",
            queryParams: {
                offset: 0,
                limit: 50
            }
        }
    });

    if (!getTrendingEmotes.success || !getTrendingEmotes.result.length) {
        return null;
    }

    return getTrendingEmotes.result;
};

export const trendingEmotesCache = {
    start: async () => {
        const emotes = await getTrendingEmotes();
        if (emotes) trendingEmotes.emotes = emotes;
        trendingEmotes.intervalId = setInterval(() => {
            void getTrendingEmotes().then((r) => {
                if (r) trendingEmotes.emotes = r;
            });
        }, trendingEmotes.interval);
    },
    stop: () => trendingEmotes.intervalId && clearInterval(trendingEmotes.intervalId)
};

export const getRandomEmote = (size = "1x"): SayArguments => {
    const random = trendingEmotes.emotes?.[Math.floor(Math.random() * Math.floor(trendingEmotes.emotes.length))];
    if (random?.emote?.id) {
        FunCache.set(random.emote.id, `https://cdn.betterttv.net/emote/${random.emote.id}/${size}`);
    }

    // return defSay;
    return buildImage({
        title: random?.emote?.code || "Please enjoy this moji",
        url: random?.emote?.id ? `https://cdn.betterttv.net/emote/${random.emote.id}/${size}` : `https://static-cdn.jtvnw.net/emoticons/v1/${Math.floor(Math.random() * 2000) + 1}/1.0`
    });
};

export const getRandomWisdom = async (_requestId: string, lang = "en") => {
    const getWisdom = await HotRequests.get<unknown, { wisdom: string }>({
        url: "https://wisdoms-app.herokuapp.com/api/getWisdom",
        options: {
            eventName: "WisdomGet",
            queryParams: {
                lang
            }
        }
    });

    if (!getWisdom.success || !getWisdom.result.wisdom) {
        return "Lying down you can't eat an apple, help yourself and god help you, mind to the ankles.";
    }

    FunCache.set(getWisdom.result.wisdom, getWisdom.result.wisdom);
    return getWisdom.result.wisdom;
};

export const getRandomNumberTrivia = async (_requestId: string,number?: string) => {
    const getNumberTrivia = await HotRequests.get<unknown, string>({
        url: number ? "http://numbersapi.com/{number}/trivia" : "http://numbersapi.com/random/trivia",
        options: {
            eventName: "NumberGet",
            ...number && {
                pathParams: {
                    number: number
                }
            }
        }
    });

    if (!getNumberTrivia.success || !getNumberTrivia.result) {
        return "1000000 is the number of colors that can be distinguished by the trichromatic color vision of the human eye.";
    }

    FunCache.set(getNumberTrivia.result, getNumberTrivia.result);
    return getNumberTrivia.result;
};

export type TriviaQuestion = {
    correctAnswer: string;
    incorrectAnswers: string[];
};

// TODO may be one day
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const getRandomTrivia = async (_requestId: string) => {
    const getTrivia = await HotRequests.get<unknown, TriviaQuestion[]>({
        url: "https://trivia-art.herokuapp.com/api/questions",
        options: {
            eventName: "GetTrivia"
        }
    });

    if (!getTrivia.success || !getTrivia.result) {
        return null;
    }

    return getTrivia.result;
};