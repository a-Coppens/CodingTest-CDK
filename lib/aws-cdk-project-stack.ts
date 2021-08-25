import cdk = require('@aws-cdk/core');
import ec2 = require('@aws-cdk/aws-ec2');
import ecs = require('@aws-cdk/aws-ecs');
import ecs_patterns = require('@aws-cdk/aws-ecs-patterns');
import ecr = require('@aws-cdk/aws-ecr');

export class AwsCdkProjectStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    /// The code that defines your stack goes here
    const vpc = new ec2.Vpc(this, "MyVpc", {
      maxAzs: 2, // Default is all AZs in region
    });

    const cluster = new ecs.Cluster(this, "MyCluster", {
      vpc: vpc
    });

    /// Create a ECR Repository
    const test_code_repo = new ecr.Repository(this, "test_code_repo", {
      repositoryName: "test_code_repo",
    });

    /// Clean Repository of old images after 5 days of not using them
    test_code_repo.addLifecycleRule({ tagPrefixList: ['release'], maxImageCount: 1});
    test_code_repo.addLifecycleRule({maxImageAge: cdk.Duration.days(5)});


    /// Create a load-balanced Fargate service and make it public
    const loadBalancedFargateService = new ecs_patterns.ApplicationLoadBalancedFargateService(this, "MyFargateService", {
      cluster: cluster, // Required
      cpu: 256, // Default is 256
      desiredCount: 1, // Default is 1

      // Pull task from our DockerHub Image which should be updated in github actions
      taskImageOptions: { image: ecs.ContainerImage.fromEcrRepository(test_code_repo, "latest",), containerPort: 8080}, 
      memoryLimitMiB: 512, // Default is 512
      publicLoadBalancer: true, // Default is false
      assignPublicIp: true,
      openListener: true,
    });
    
    /// TEST
    /*loadBalancedFargateService.targetGroup.configureHealthCheck({
      path: "/",
      enabled: true,
    });*/
   
}
}