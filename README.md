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

Set your AWS credentials on the file 'credentials.json.sample' and rename it to 'credentials.json'.

Into the file 'config.json' you have to set the values:
* CycleExpression: The expresion that defines how much time will wait Statham to do another attempt.
* TriesNum: Number of times that Statham tries to send a message before sending a repórt to the email into *EmailNotification* parameter.
* OriginFilters: An array of origins that Statham accept.
* EmailNotification: A e-mail direction to send the report when statham reached the max number of attempts (*TriesNum*).

### Sending a message

Statham provides an API Endpoint to send a message through a HTTP POST method, the body have to be as follows:

```json
{
  "method": "POST | GET",
  "url": "https://your-destination-direction/resource",
  "body": JSON_OBJECT
}
```
## Statham AWS Structure

The services used by Statham are: lambda functions, Message Queue Service (SQS database), Monitor Resourses and Application (CloudWach Alarm) and finally Simple Email Service (SES), the relationship and behavior of each of these is detailed below.

![Image not available](https://s3-us-west-2.amazonaws.com/statham-img/DIAGRAMA+STATHAM.png)
