![Statham](https://statham.adsttc.com/bannerGitHubPublic1.png)

[![node.js](https://img.shields.io/badge/Node.js-4.3-green.svg)](https://nodejs.org/es/download/)
[![serverless](https://img.shields.io/badge/SERVERLESS-1.5.0-yellow.svg)](https://serverless.com/)
[![aws](https://img.shields.io/badge/AWS-Services-orange.svg)](https://aws.amazon.com/es/)
[![docker](https://img.shields.io/badge/Docker-1.12.2+-blue.svg)](https://github.com/PNet/statham-serverless/tree/develop#testing-statham-on-development)
[![mocha](https://img.shields.io/badge/Mocha-testing-red.svg)](https://github.com/PNet/statham-serverless/wiki/Testing)


# Statham Serverless

Statham is an application made in Node.js over AWS Lambda. This means that the application runs on the cloud of Amazon, so the costs are only the time and memory that takes the execution of the code in real time.

Statham acts as a middleware between HTTP POST requests/responses, with an algorithm that **tries** a specified amount of attempts to send a particular message. If the message can't be delivered after all the attemps, Statham will notify the failure to a given email.

## Presentation of Statham

- [Slide](https://docs.google.com/presentation/d/1uC2IiNbX9xUxYNr6KMt2A_5CrRqRB9vg0epeTP1KPVw/edit?usp=sharing)

## Requirement

- An AWS account.
- [Node.js](https://nodejs.org/en/)
- [NPM](https://docs.npmjs.com/cli/install)
- Serverless Framework: `npm install -g serverless`
- An authorized email address

## Installation

### Clone the repo then cd into that folder

* `git clone https://github.com/PNet/statham-serverless`
* `cd statham-serverless`

### Download dependencies

On statham-serverless folder open a terminal:

* ```npm install```

After that, npm should have created a folder named node_modules with all the libraries listed in the `packages.json` file.

### Setting Statham

Set your AWS credentials and secret token on the file 'credentials.json.sample' and rename it to 'credentials.json'.

In the file 'config.json' you have to set the values:
* CycleExpression: The expresion that defines how much time will Statham wait to do another attempt. For more info about scheduler expressions visit [here](http://docs.aws.amazon.com/AmazonCloudWatch/latest/events/ScheduledEvents.html).
* TriesNum: Number of times that Statham tries to send a message before sending a report to the email specified in the *EmailNotification* parameter.
* EmailNotification: An email address to send the report when statham reached the max number of attempts (*TriesNum*). This email has to be configured in SES.

### Config Email in SES

In order to use the SES service of Amazon it is necessary to authenticate an e-mail address. For this, you need to integrate the SNS and DKIM for the correct functioning of the messaging.

This step can not be performed using statham deploy, so it is required to perform manually.

[Configurate Email SES](https://us-west-2.console.aws.amazon.com/ses/home?region=us-west-2#verified-senders-email:)

[Help with the configuration of SNS](http://docs.aws.amazon.com/ses/latest/DeveloperGuide/configure-sns-notifications.html#configure-feedback-notifications-console)

[Help with the configuration of DKIM](http://docs.aws.amazon.com/ses/latest/DeveloperGuide/easy-dkim.html)

## Deploying

On a terminal into statham-serverless folder:

* `serverless deploy` or `sls deploy`

Now you will have three endpoints availables to make requests to Statham, more info [here](https://github.com/PNet/statham-serverless/wiki)

## Testing Statham on development

Statham integrates all the necessary modules to work in an automatic fashion into a virtualized environment, so you can test their functionality between your applications in a development environment. This functionality is done thanks to Docker, so We make sure that regardless of the environment, the software is always executed in the same way.
When installed locally, the SQS and SES service will not be working. This will not generate any errors but the "tries" functionality will not work.

Dependencies in development mode:

- Docker 1.12.2+
- Docker Compose 1.8.1+

#### Proxy

You need to run an instance of [nginx-proxy](https://github.com/PNet/nginx-proxy).
Then add `statham.dev.archdaily.com` to your `/etc/hosts` file pointing to your
docker host.

### Installation

- Run the project with:

* `docker-compose up --build -d`

For more details on how to send/receive messages see the [wiki](https://github.com/PNet/statham-serverless/wiki).

<p align="center">
  <br>
  <img src="https://statham.adsttc.com/logo-ad.png" style="width: 100%; max-width: 100px; height: auto;">
</p>

