import {Reminder} from "./domain";
import SlackApi from "./SlackApi";

const slackApi: SlackApi = new SlackApi();

export const sendSlackReminder = async (reminder: Reminder, channelName: string) => {
    console.log(`reminder to pick user from ${JSON.stringify(reminder)}`);
    let userMention = "";
    reminder.assigned.map(user => (userMention += " <@" + user + ">"));
    const { data }  = await slackApi.sendSlackMessage(channelName, userMention + " " + reminder.task);
    if (data.ok) {
        console.log("Message sent successfully to channel");
    } else {
        console.error(data.error as string);
        const message = "Failed to send message to channel";
        throw new Error(message);
    }
};
