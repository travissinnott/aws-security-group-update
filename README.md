# aws-security-group-update

Update security group(s) when IP address changes.


# Running

For now:

> node lib/update.js


# Configuration

There are three parts:

## config.json

The config.json specifes a list of regions and the Security Groups in those regions that are to be updated.  Example:

```
{
	"us-east-1": ["sg-yyyyyyyy", "sg-zzzzzzzz"],
	"us-east-2": [],
	"us-west-1": [],
	"us-west-2": ["sg-xxxxxxxx"],
	"ca-central-1": [],
	"eu-central-1": [],
	"eu-west-1": [],
	"eu-west-2": [],
	"eu-west-3": [],
	"ap-northeast-1": [],
	"ap-northeast-2": [],
	"ap-southeast-1": [],
	"ap-southeast-2": [],
	"ap-northeast-1": [],
	"ap-south-1": [],
	"sa-east-1": []
}
```

## .env

Environment variable control part of the behavior:

```
AWS_PROFILE="work"
SG_NOTE_REGEX="LOOK-FOR-THIS-STRING"
IPIFY="https://api.ipify.org"
```

## AWS Credentials File

This project uses the AWS module and leverages the default use of the credentials file.  To configure, use the `aws` command line application for your platform.  Assuming you specify a profile named "work" (as in the `.env` file above):

```
$ aws configure --profile work
AWS Access Key ID [None]: AKIAI44QH8DHBEXAMPLE
AWS Secret Access Key [None]: je7MtGbClwBF/2Zp9Utk/h3yCo8nvbEXAMPLEKEY
Default region name [None]: us-east-1
Default output format [None]: json
```

For details, see https://docs.aws.amazon.com/cli/latest/userguide/cli-chap-getting-started.html

For Access Key ID and Secret Access Key, be sure to use your IAM credentials and NOT THE MASTER ACCOUNT KEYS!!!!  This can be found in the IAM panel when logged in as your user.  Alternatively create specific credentials just for this app.


# TODO

* Create run script under /bin and support command line use when installed globally
