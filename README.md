# Glueproj

Glueproj is a CDK project that automates the setup of AWS Glue components for data processing.

## Installation

To install Glueproj, clone the repository and run the following commands:

```bash
git clone github.com/richardokonicha/glueproj
cd glueproj
npm install
```

## Usage

To deploy the project, ensure you have the AWS CLI configured with appropriate credentials. Then, run the following command:

```bash
cdk deploy
```

This command will deploy the Glue components to your AWS account.

## Examples

Below is an example of how to use Glueproj in your CDK stack:

```typescript
import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as glue from 'aws-cdk-lib/aws-glue';
import * as iam from 'aws-cdk-lib/aws-iam';

export class GlueprojStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);
    const dbname = "mydatabase"

    // Create Glue database
    const database = new glue.CfnDatabase(this, 'MyDatabase', {
      catalogId: cdk.Stack.of(this).account,
      databaseInput: {
        name: dbname
      }
    })

    // Create Role
    const glueRole = new iam.Role(this, 'GlueCrawlerRole', {
      assumedBy: new iam.ServicePrincipal('glue.amazonaws.com')
    })
    glueRole.addToPolicy(new iam.PolicyStatement({
      actions: ['s3:GetObject',
        "s3:ListBucket",
        "s3:GetObject",
        "s3:GetBucketLocation",
        "s3:ListMultipartUploadParts",
        "logs:PutLogEvents",
        "glue:*"
      ],
      resources: ['*']
    }))

    // Create Glue crawler 
    const crawler = new glue.CfnCrawler(this, 'MyCrawler', {
      databaseName: dbname,
      role: glueRole.roleArn,
      targets: {
        s3Targets: [
          {
            path: 's3://listbucketlistbucket12345/data/'
          }
        ]
      },
      // Update new and existing partitions with metadata from the table
      configuration: JSON.stringify({
        Version: 1.0,
        Grouping: {
          TableGroupingPolicy: 'CombineCompatibleSchemas'
        },
        CrawlerOutput: {
          Partitions: {
            AddOrUpdateBehavior: 'InheritFromTable'
          }
        }
      }),
      schemaChangePolicy: {
        updateBehavior: 'LOG',
      },
    })

    console.log('Crawler Name: ' + crawler.logicalId)
  }
}
```

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
