![Statham](https://s3-us-west-2.amazonaws.com/statham-img/bannerGitHub.png)

[![node.js](https://img.shields.io/badge/Node.js-4.3-green.svg)](https://nodejs.org/es/download/)
[![serverless](https://img.shields.io/badge/SERVERLESS-1.5.0-yellow.svg)](https://serverless.com/)
[![aws](https://img.shields.io/badge/AWS-Services-orange.svg)](https://aws.amazon.com/es/)
[![docker](https://img.shields.io/badge/Docker-testing-blue.svg)](https://github.com/PNet/statham-serverless/wiki#testing-statham-on-development)


# Statham Serverless

Statham is an application made in Node.js over Lambda of AWS, this means that the application runs on the cloud of amazon so its cost is only the time and the memory that takes the execution of the code in real time.

Statham acts as a sender of HTTP POST requests, with an algorithm that **tries** a determinated amount of attempts to send a message.  
When it reaches that number of attempts, Statham will notify to a given email the failure.

## Requirement

- Account AWS
- [Node.js](https://nodejs.org/en/)
- [NPM](https://docs.npmjs.com/cli/install)
- Serverless Framework ```npm install -g serverless```
- Authorized email address

## Instalantion

### Clone the repo then cd into that folder

* ```git clone https://github.com/PNet/statham-serverless```
* ```cd statham-serverless```

### Download dependencies

On statham-serverless folder open a terminal:

* ```npm install```

After that, npm should have created a folder named node_modules with all the libraries listed in the `packages.json` file.

### Setting Statham

Set your AWS credentials and secret token on the file 'credentials.json.sample' and rename it to 'credentials.json'.

Into the file 'config.json' you have to set the values:
* CycleExpression: The expresion that defines how much time will wait Statham to do another attempt. For more info about scheduler expressions visit [here](http://docs.aws.amazon.com/AmazonCloudWatch/latest/events/ScheduledEvents.html).
* TriesNum: Number of times that Statham tries to send a message before sending a repórt to the email into *EmailNotification* parameter.
* EmailNotification: A e-mail direction to send the report when statham reached the max number of attempts (*TriesNum*).

### Deploying

On a terminal into statham-serverless folder:

* `serverless deploy` or `sls deploy`

Now you will have three endpoints availables to make requests to Statham, more info [here](https://github.com/PNet/statham-serverless/wiki)

#### Statham in Docker

- Docker 1.12.2+
- Docker Compose 1.8.1+

#### Proxy

You need to run an instance of [nginx-proxy](https://github.com/PNet/nginx-proxy).
Then add `statham.dev.archdaily.com` to your `/etc/hosts` file pointing to your
docker host.

### Installation

Run the project with:

    $ docker-compose up --build -d

That's going to run the migrations automatically.

### Running docker

* `docker-compose build`
* `docker-compose up`

<p align="center">
  <br>
  <br>
  <b>->Created with &#x2665; in Chile, by Interns of ArchDaily.<-</b><br>
</p>

