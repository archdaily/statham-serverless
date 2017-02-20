![Statham](https://s3-us-west-2.amazonaws.com/statham-img/bannerGitHub.png)

# Statham Serverless

Statham is an application made in Node.js over Lambda of AWS, this means that the application runs on the cloud of amazon so its cost is only the time and the memory that takes the execution of the code in real time.

Statham acts as a sender of HTTP POST requests, with an algorithm that **tries** a determinated amount of attempts to send a message.  
When it reaches that number of attempts, Statham will notify to a given email the failure.

## Requirement

- Account AWS
- [Node.js](https://nodejs.org/en/)
- [NPM](https://docs.npmjs.com/cli/install)
- Serverless Framework ```npm install -g serverless```

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

->Created with &#x2665; in Chile, by Interns of ArchDaily.<-
