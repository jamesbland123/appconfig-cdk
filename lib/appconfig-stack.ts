import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as fs from 'fs';
import * as path from 'path';

export class AppConfigStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // Define AppConfig application
    const application = new cdk.aws_appconfig.CfnApplication(this, 'DemoApplication', {
      name: 'demo2',
      description: 'Demo AppConfig application created with CDK',
    });

    // Define AppConfig environment
    const environment = new cdk.aws_appconfig.CfnEnvironment(this, 'DemoEnvironment', {
      applicationId: application.ref,
      name: 'demo-environment',
      description: 'Demo environment for AppConfig',
    });

    // Create feature flag configuration content with correct schema
    const featureFlagConfig = {
      version: "1",
      flags: {
        testFlag1: {
          name: "testFlag1",
          description: "Test feature flag 1",
          attributes: {
            userType: {
              constraints: {
                type: "string"
              }
            }
          }
        },
        testFlag2: {
          name: "testFlag2",
          description: "Test feature flag 2",
          attributes: {
            isPremium: {
              constraints: {
                type: "boolean"
              }
            }
          }
        }
      },
      values: {
        testFlag1: {
          _variants: [
            {
              name: "Default",
              enabled: true,
              attributeValues: {
                userType: "standard"
              },
              rule: ""
            }
          ]
        },
        testFlag2: {
          _variants: [
            {
              name: "A",
              enabled: true,
              attributeValues: {
                isPremium: true
              },
              rule: "(split by::$uniqueId pct::20 seed::\"seed_one\")"
            },
            {
              name: "B",
              enabled: true,
              attributeValues: {
                isPremium: false
              },
              rule: "(split by::$uniqueId pct::30 seed::\"seed_one\")"
            },
            {
              name: "Default",
              enabled: false,
              attributeValues: {
                isPremium: false
              },
              rule: ""
            }
          ]
        }
      }
    };

    // Write feature flag configuration to a file
    const configFilePath = path.join(__dirname, 'feature-flags.json');
    fs.writeFileSync(configFilePath, JSON.stringify(featureFlagConfig, null, 2));

    // Define AppConfig configuration profile for feature flags
    const configProfile = new cdk.aws_appconfig.CfnConfigurationProfile(this, 'FeatureFlagProfile', {
      applicationId: application.ref,
      name: 'feature-flags-profile',
      locationUri: 'hosted',
      type: 'AWS.AppConfig.FeatureFlags'
    });

    // Define AppConfig hosted configuration version
    const hostedConfig = new cdk.aws_appconfig.CfnHostedConfigurationVersion(this, 'FeatureFlagConfig', {
      applicationId: application.ref,
      configurationProfileId: configProfile.ref,
      content: JSON.stringify(featureFlagConfig),
      contentType: 'application/json',
    });

    // Define AppConfig deployment strategy
    const deploymentStrategy = new cdk.aws_appconfig.CfnDeploymentStrategy(this, 'DeploymentStrategy', {
      name: 'demo-deployment-strategy',
      deploymentDurationInMinutes: 0,
      growthFactor: 100,
      replicateTo: 'NONE',
      finalBakeTimeInMinutes: 0,
    });

    // Define AppConfig deployment
    new cdk.aws_appconfig.CfnDeployment(this, 'Deployment', {
      applicationId: application.ref,
      environmentId: environment.ref,
      configurationProfileId: configProfile.ref,
      configurationVersion: hostedConfig.ref,
      deploymentStrategyId: deploymentStrategy.ref,
    });

    // Create a freeform configuration with metadata for backend apps
    const appConfigMetadata = {
      applicationId: application.ref,
      environmentId: environment.ref,
      featureFlagsProfileId: configProfile.ref,
      region: this.region,
      serviceName: "demo2",
      retrievalInstructions: {
        sdkMethod: "getConfiguration",
        requiredParameters: {
          Application: "${applicationId}",
          Environment: "${environmentId}",
          Configuration: "${featureFlagsProfileId}",
          ClientId: "unique-client-identifier"
        }
      }
    };

    // Define AppConfig configuration profile for metadata
    const metadataProfile = new cdk.aws_appconfig.CfnConfigurationProfile(this, 'MetadataProfile', {
      applicationId: application.ref,
      name: 'app-metadata-profile',
      locationUri: 'hosted',
      type: 'AWS.Freeform'
    });

    // Define AppConfig hosted configuration version for metadata
    const metadataConfig = new cdk.aws_appconfig.CfnHostedConfigurationVersion(this, 'MetadataConfig', {
      applicationId: application.ref,
      configurationProfileId: metadataProfile.ref,
      content: JSON.stringify(appConfigMetadata),
      contentType: 'application/json',
    });

    // Deploy the metadata configuration
    new cdk.aws_appconfig.CfnDeployment(this, 'MetadataDeployment', {
      applicationId: application.ref,
      environmentId: environment.ref,
      configurationProfileId: metadataProfile.ref,
      configurationVersion: metadataConfig.ref,
      deploymentStrategyId: deploymentStrategy.ref,
    });

    // Output the AppConfig application ID
    new cdk.CfnOutput(this, 'AppConfigApplicationId', {
      value: application.ref,
      description: 'AppConfig Application ID',
    });

    // Output the AppConfig environment ID
    new cdk.CfnOutput(this, 'AppConfigEnvironmentId', {
      value: environment.ref,
      description: 'AppConfig Environment ID',
    });

    // Output the AppConfig configuration profile IDs
    new cdk.CfnOutput(this, 'AppConfigFeatureFlagsProfileId', {
      value: configProfile.ref,
      description: 'AppConfig Feature Flags Profile ID',
    });
    
    new cdk.CfnOutput(this, 'AppConfigMetadataProfileId', {
      value: metadataProfile.ref,
      description: 'AppConfig Metadata Profile ID',
    });
  }
}