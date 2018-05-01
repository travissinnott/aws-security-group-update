# aws-security-group-update
Update security group(s) when IP address changes


# Running

For now:

> node lib/update.js


# Configuration

There are two parts:

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

