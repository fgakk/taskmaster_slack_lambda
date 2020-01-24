import * as aws from 'aws-sdk';
import {parseReminders, toCSVString, ReadableString} from './helper';
import {sendSlackReminder} from "./ReminderGenerator";
import {pickUser} from "./UserPicker";
import {ManagedUpload} from "aws-sdk/lib/s3/managed_upload";
import SendData = ManagedUpload.SendData;
import {Reminder} from "./domain";
import {PutObjectOutput} from "aws-sdk/clients/s3";

console.log('Loading function');

const s3 = new aws.S3({apiVersion: '2006-03-01'});

export const handler = async (event: any = {}): Promise<any> => {
    //console.log('Received event:', JSON.stringify(event, null, 2));

    // TODO Get the object from the event and show its content type
    const bucket = process.env.BUCKET_NAME as string;
    const key = process.env.OBJECT_KEY as string;

    const downloadParams = {
        Bucket: bucket,
        Key: key,
    };

    const {Body} = await s3.getObject(downloadParams).promise();
    if (!Body) {
        console.log("Missing configure file. Upload required config file to s3");
        throw new Error("missing config file at s3");
    }
    const remindersAsString = Body.toString('utf-8');
    const reminders: Reminder[] = JSON.parse(remindersAsString);
    const channelName = process.env.SLACK_CHANNEL as string;
    const updatedReminders = reminders.map(reminder => {
        const reminderToUpdate = pickUser(reminder);
        sendSlackReminder(reminderToUpdate, channelName); // Sending message as side effect
        return reminderToUpdate;
    });
    const uploadParams = {
        Bucket: downloadParams.Bucket,
        Key: downloadParams.Key,
        Body: JSON.stringify(updatedReminders)
    };
    console.log("Uploading to S3");
    const {$response} = await s3.putObject(uploadParams).promise();
    if ($response.error) {
        console.error("Error", $response.error);
        const message = "Failed to update reminder";
        throw new Error(message);
    }
    if ($response.data) {
        console.log("Upload Success", $response.data);
    }
};
