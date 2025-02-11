import { defineBackend } from '@aws-amplify/backend';
import { auth } from './auth/resource';
import { data } from './data/resource';
import { newWaMsgHandler } from './functions/newWaMsgHandler/resource';
import { checkAiUpdates } from './functions/checkAiUpdates/resource';
import { Effect } from 'aws-cdk-lib/aws-iam';
import { PolicyStatement } from 'aws-cdk-lib/aws-iam';
/**
 * @see https://docs.amplify.aws/react/build-a-backend/ to add storage, functions, and more
 */
export const backend = defineBackend({
  auth,
  data,
  newWaMsgHandler,
  checkAiUpdates
});

backend.newWaMsgHandler.addEnvironment('USER_POOL_ID', backend.auth.resources.userPool.userPoolId);
backend.newWaMsgHandler.addEnvironment('USER_POOL_CLIENT_ID', backend.auth.resources.userPoolClient.userPoolClientId);

backend.newWaMsgHandler.resources.lambda.addToRolePolicy(
  new PolicyStatement({
    effect: Effect.ALLOW,
    actions: ["cognito-idp:AdminInitiateAuth"],
    resources: [`arn:aws:cognito-idp:*:*:userpool/*`],
  })
);

backend.checkAiUpdates.resources.lambda.addToRolePolicy(
  new PolicyStatement({
    effect: Effect.ALLOW,
    actions: ["cognito-idp:AdminInitiateAuth"],
    resources: [`arn:aws:cognito-idp:*:*:userpool/*`],
  })
);

backend.auth.resources.cfnResources.cfnUserPool.policies = {
  passwordPolicy: {
    minimumLength: 7,
    requireLowercase: false,
    requireUppercase: false,
    requireNumbers: false,
    requireSymbols: false,
  },
};
