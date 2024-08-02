# Install project

`npm install`

# Configure Environment Variables

Create a .env file in the root directory of your project. You can use the provided .env.example file as a template.

`cp .env.example .env`

## Run project in local

`npm run local`

## Run tests

`npm run test`


## AWS Lambda Deployment Guide


### 1  Generate File Zip

`npm run zip`

### 2 Access AWS Lambda Console:

- Navigate to the AWS Lambda Console.
- Sign in with your AWS credentials.
- Create or Select a Lambda Function:

- Click on "Create function".
- Choose "Author from scratch".
- Provide a name for your function.
- Select the appropriate runtime (e.g., Node.js 16.x).
- Configure the execution role .
- Click on "Create function".


### 3 Upload the ZIP File:

- In the function configuration page, scroll down to the "Function code" section.
- Select "Upload from" and choose "ZIP file".
- Click on "Upload" and select the ZIP file you created.
- Click on "Save" to apply the changes.


### 4 Configure the Handler:

- In the function configuration page, locate the "Handler" setting. "dist/index.handler"


## Setting Up Discord Webhooks

 - Open Discord: Launch the Discord application and navigate to the server where you want to receive the alerts.
 - Select a Channel: Choose the text channel where you want the messages to appear.
 - Access Channel Settings: Click on the channel's name or the gear icon next to it to open the channel settings.
 - Navigate to Integrations: In the channel settings menu, find and click on the "Integrations" option.
 - Copy Webhook URL and paste in ENV file property DISCORD_WEBHOOK_URL
