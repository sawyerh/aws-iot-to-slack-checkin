# Context

At [Nava](http://navahq.com/) we have offices in DC, SF, and NYC. Lots of Navanauts also ocassionaly work from home. As a result we've found it useful to have a **`#whereabouts`** Slack channel where the team can communicate our comings, goings, schedule changes, and location-related heads ups. 

For fun, I've programed an [AWS IoT Button](https://aws.amazon.com/iotbutton/) to help automate my check-in and check-out notifications for the NYC office, letting people know when I'm in the office, heading to lunch, or heading home. Along with the check-in and check-out messages I'm experimenting with including the current weather to help build "commute-empathy".

![button](https://github.com/sawyerh/aws-iot-to-slack-checkin/raw/master/img/button-demo-1.gif)

# Usage

**Single click**: Check-in (Default message: `Checking in`)

![screenshot](https://github.com/sawyerh/aws-iot-to-slack-checkin/raw/master/img/check-in-2.png)

**Double click**: Check-out (Default message: `Checking out`)

![screenshot](https://github.com/sawyerh/aws-iot-to-slack-checkin/raw/master/img/check-out-1.png)

**Long click** (1.5+ second press): Lunch check-out (Message: `Grabbing lunch`)

![screenshot](https://github.com/sawyerh/aws-iot-to-slack-checkin/raw/master/img/lunch.png)

# Installation

![diagram](https://github.com/sawyerh/aws-iot-to-slack-checkin/raw/master/img/diagram.png)

## Setup your [AWS IoT Button](https://aws.amazon.com/iotbutton/)

1. Install the AWS IoT Button [iOS or Android app](https://aws.amazon.com/iotbutton/getting-started/)
3. Go through the steps to setup the button
4. When prompted to select an action, exit the setup process. Your button is configured for Wi-Fi but not a Lambda function yet and that’s fine. We’ll come back and set the action later.

## Get Dark Sky weather API access

_This step is optional and only necessary if you want to include weather info in your checkin/checkout messages._

1. [Register for a Dark Sky API key](https://darksky.net/dev/register)
2. Store the secret API key somewhere, you’ll use it soon.
3. [Get the lat/long of your office](https://support.google.com/maps/answer/18539?co=GENIE.Platform%3DDesktop&hl=en). Store this somewhere, you’ll use it soon.

## Create Slack Incoming Webhook

1. Visit your Slack team’s custom integrations page (`https://[TEAM_NAME].slack.com/apps/manage/custom-integrations`) and add a new Incoming Webook.
2. Copy the Webhook URL and store it somewhere, you’ll use it soon.
3. Select the channel you want your message posted to.
4. Upload your avatar as the icon (optional)

## Create Lambda function

1. [Create a new Lambda function](https://console.aws.amazon.com/lambda/home)
1. Select the "Blank Function" Blueprint
1. Enter a name for your function (ie. `slackIoTButton`)
1. Select the latest Node.js runtime (at the time of writing it was 4.3)
1. Edit the code inline and paste in the code from [`index.js`](https://github.com/sawyerh/aws-iot-to-slack-checkin/blob/master/index.js). Note: you’ll probably want to edit the `config` message variables.
1. Add the following environment variables:
  - `WEBHOOK` _(required)_
  - `DARK_SKY_KEY`
  - `LATITUDE`
  - `LONGITUDE`
  - `USERNAME` - This can be anything (I use my firstname).
1. You can stick with the remaining defaults (handler/memory/timeout)

If you’d like to test your function, use the following test event: 

```json
{
  "clickType": "SINGLE"
}
```

## Set the AWS IoT Button action

1. In the AWS IoT Button app, select your button and tap the lambda icon (`λ`)
1. Select the “Your functions” tab
1. Select the lambda function you just created. Note: If you don't see your lambda function, you may need to change the selected region in your app's settings.
1. Save and test. It should work.
