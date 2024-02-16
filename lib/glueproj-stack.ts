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
      // schedule: {
      //   scheduleExpression: 'cron(0 0 * * ? *)'
      // }
    })

    console.log('Crawler Name: ' + crawler.logicalId)
  }
}
