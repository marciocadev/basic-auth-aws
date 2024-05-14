import { Duration, Stack, StackProps } from 'aws-cdk-lib';
import { LambdaIntegration, RestApi, TokenAuthorizer } from 'aws-cdk-lib/aws-apigateway';
import { Runtime } from 'aws-cdk-lib/aws-lambda';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';
import { Construct } from 'constructs';
import { join } from 'path';

export class BasicAuthAwsStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    const authorizeFn = new NodejsFunction(this, "BasicAuthFunction", {
      runtime: Runtime.NODEJS_20_X,
      entry: join(__dirname, "functions", "basic-auth", "index.ts"),
      handler: "handler"
    })

    const authorizer = new TokenAuthorizer(this, "BasicAuth", {
      handler: authorizeFn,
      identitySource: "method.request.header.Authorization",
      resultsCacheTtl: Duration.seconds(60)
    })

    const endpointFn = new NodejsFunction(this, "EndpointFunction", {
      runtime: Runtime.NODEJS_20_X,
      timeout: Duration.seconds(20),
      entry: join(__dirname, "functions", "endpoint", "index.ts"),
      handler: "handler"
    })

    const api = new RestApi(this, "BasicAuthApi", {
      restApiName: "basic-auth"
    })
    api.root
      .resourceForPath("authorization/basicAuth")
      .addMethod("POST", new LambdaIntegration(endpointFn), {
        authorizer: authorizer
      })
  }
}
