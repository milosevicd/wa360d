import { defineBackend } from '@aws-amplify/backend';
import { auth } from './auth/resource';
import { data } from './data/resource';
import { newWaMsgHandler } from './data/newWaMsgHandler/resource';
import { Effect } from 'aws-cdk-lib/aws-iam';
import { PolicyStatement } from 'aws-cdk-lib/aws-iam';
/**
 * @see https://docs.amplify.aws/react/build-a-backend/ to add storage, functions, and more
 */
export const backend = defineBackend({
  auth,
  data,
  newWaMsgHandler
});

backend.newWaMsgHandler.resources.lambda.addToRolePolicy(
  new PolicyStatement({
    effect: Effect.ALLOW,
    actions: ["cognito-idp:AdminInitiateAuth"],
    resources: [`arn:aws:cognito-idp:*:*:userpool/*`],
  })
);
