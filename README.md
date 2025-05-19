# AWS AppConfig CDK Project

This project creates an AWS AppConfig application with feature flags using AWS CDK.

## Resources Created

- AppConfig Application named "demo2"
- AppConfig Environment
- AppConfig Configuration Profile for feature flags
- AppConfig Configuration Profile for application metadata (freeform)
- Two feature flags with attributes and variants
- AppConfig Deployment Strategy
- AppConfig Deployments for both configurations

## Getting Started

### Prerequisites

- Node.js 14.x or later
- AWS CLI configured with appropriate credentials
- AWS CDK installed (`npm install -g aws-cdk`)

### Installation

1. Install dependencies:
   ```
   npm install
   ```

2. Bootstrap your AWS environment (if not already done):
   ```
   cdk bootstrap
   ```

3. Deploy the stack:
   ```
   cdk deploy
   ```

### Feature Flags

The application includes two feature flags with attributes and variants:

1. `testFlag1`: 
   - Attribute: `userType` (string)
   - Default variant enabled with `userType: "standard"`

2. `testFlag2`: 
   - Attribute: `isPremium` (boolean)
   - Variant A: Enabled for 20% of users with `isPremium: true`
   - Variant B: Enabled for 30% of users with `isPremium: false`
   - Default variant: Disabled with `isPremium: false`

### Application Metadata

A freeform configuration is included that provides all necessary information for backend applications to retrieve feature flags:

- Application ID
- Environment ID
- Feature Flags Profile ID
- AWS Region
- Service name
- SDK retrieval instructions

## Useful Commands

* `npm run build`   compile typescript to js
* `npm run watch`   watch for changes and compile
* `npm run test`    perform the jest unit tests
* `cdk deploy`      deploy this stack to your default AWS account/region
* `cdk diff`        compare deployed stack with current state
* `cdk synth`       emits the synthesized CloudFormation template