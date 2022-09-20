import { SayArguments } from "@slack/bolt";

export const buildImage = ({
    title,
    url,
    altText
}: {
    title: string;
    url: string;
    altText?: string;
}): SayArguments => ({
    text: "No image for you.",
    "blocks": [
        {
            "type": "image",
            "title": {
                "type": "plain_text",
                "text": title
            },
            "block_id": `img_${title}`,
            "image_url": url,
            "alt_text": altText || `An incredibly cute ${title}.`
        }
    ]
});