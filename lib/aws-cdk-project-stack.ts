import * as cdk from '@aws-cdk/core';
import ec2 = require('@aws-cdk/aws-ec2');
import ecs = require('@aws-cdk/aws-ecs');
import ecs_patterns = require('@aws-cdk/aws-ecs-patterns');

export class AwsCdkProjectStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // The code that defines your stack goes here
    const vpc = new ec2.Vpc(this, "MyVpc", {
      maxAzs: 2 // Default is all AZs in region
    });

    const cluster = new ecs.Cluster(this, "MyCluster", {
      vpc: vpc
    });

    // Create a load-balanced Fargate service and make it public
    new ecs_patterns.ApplicationLoadBalancedFargateService(this, "MyFargateService", {
      cluster: cluster, // Required
      cpu: 256, // Default is 256
      desiredCount: 1, // Default is 1
      
      // Pull task from our DockerHub Image which should be updated in github actions
      taskImageOptions: { image: ecs.ContainerImage.fromRegistry("docker.io/adamcoppens/coding-test-app:latest"), containerPort: 8080 }, 
      memoryLimitMiB: 512, // Default is 512
      publicLoadBalancer: true, // Default is false
      assignPublicIp: true,
      openListener: true,
    });
}
}