import axios, { AxiosPromise } from "axios";
import * as qs from "querystring";

const apiUrl = "https://slack.com/api";
const username = "taskmaster";

class SlackApi {
  public sendSlackMessage(channel: string, text: string): AxiosPromise<SlackResponse> {
    const token = process.env.SLACK_ACCESS_TOKEN;
    const request = { token, channel, text, username };
    console.log(`sending message to ${channel} users with text ${text}`);
    return axios.post(`${apiUrl}/chat.postMessage`, qs.stringify(request));
  }
}

interface SlackResponse {
    ok: boolean,
    error?: string;
}

export default SlackApi
