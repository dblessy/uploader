# Uploader

URL:

University:[SJSU](https://www.sjsu.edu/)

Course:[Cloud Technologies](https://catalog.sjsu.edu/)

Professor:[Sanjay Garje](https://www.sjsu.edu/people/sanjay.garje/)

Student:[Blessy Dickson](https://www.linkedin.com/in/blessy-dickson-348a31133)

## Introduction
Uploader is a full stack web application which uses aws cloud resources to store and manage your files.It has all the features to upload,list,delete and modify files.It leverages the aws resources to make the application highly available,scalable and secure.Uploader provides simple REST APIs to manage all your files.

## Features List
The list of features provided by this application are:
User registration by using OAuth:New User can register to the application.

User Login: Existing users can login by using their Oauth credentials.

Upload files:For the user to upload files to S3.

List files:This feature lists all the files uploaded by the user with details about the first name,last name,file name,file description,Upload time,Update time and a link to download the file.

Delete file:This allows the user to delete the file.

Modify file:This allows the user to modify the contents of the file.

Admin panel:Admin panel lets the admin view all the files in the application and lets the admin delete the files.

## Architecture Diagram:

![arch diag]()

## Technologies used:
### Aws Resources to set up:
* Elastic Beanstalk: It provides an environment to deploy EC2 instances across regions,deploy ELB and autoscaling.
* EC2: The EC2 instance is the virtual compute environment where the application is deployed.
* AutoScaling group: It is used to autoscale the EC2 instances for higher scalability and availability.
* Elastic Load Balancer: It is configured to help distribute the traffic across EC2 instances.
* S3: It is used to store the files.S3 buckets are replicated CRR and versioning is enabled to make it highly available.
* S3-IA: When the files are in S3 more than 75 days they are moved to S3-IA.
* S3 Glacier: After 365 days the files are archived here.
* CloudFront: This is used to offload the traffic from the origin S3 bucket.
* SNS: SNS is used to publish messages when certain events occur.
* Lambda: Lambda is triggered when it receives SNS and writes to RDS.
* R53: R53 provides the DNS service to resolve the application domain name.
* RDS: It provides the database to store info about files and users.
* Cloudwatch: Alarms are set up to check the health of the application.

### Softwares Required:
* React JS,Bootstrap
* NodeJs
* AWS SDK
* JetBrains IDE
* MySQL WorkBench

### Steps to setup project locally:
* Clone the above project to the local directory.
* Create an AWS account and retrieve the access keys.Add the access credentials to the .env file.
* Create a S3 bucket with lifecycle policies and CRR enabled. 
* Create another S3 bucket in another region to which the objects are replicated to make the solution highly available.
* Create cloudfront distribution and link it to the S3 bucket to offload traffic.
* Create a RDS instance and create the tables required using MYSQL workbench.
* Create a lambda function and upload the code from lambdatords directory to lambda and deploy it.
* Install nodeJs and reactJS. Run npm install to install all the dependencies.
* Run npm start and the server will be listening on port 8080.
