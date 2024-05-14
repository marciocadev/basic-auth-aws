import { APIGatewayTokenAuthorizerHandler } from "aws-lambda";

export const handler: APIGatewayTokenAuthorizerHandler = async (event) => {
  const token = event.authorizationToken;
  let effect = "Deny";

  if (token === `Basic ${Buffer.from("user:password").toString("base64")}`) {
    effect = "Allow";
  }

  return {
    principalId: "user",
    policyDocument: {
      Version: "2012-10-17",
      Statement: [
        {
          Action: "execute-api:Invoke",
          Effect: effect,
          Resource: "*",
        }
      ]
    }
  }
}