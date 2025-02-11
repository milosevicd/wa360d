import type { Schema } from '../../data/resource'
import type { Handler, PostConfirmationTriggerHandler } from "aws-lambda";
import { Amplify } from "aws-amplify";
import { generateClient } from "aws-amplify/data";
import { getAmplifyDataClientConfig } from '@aws-amplify/backend/function/runtime';
import { env } from "$amplify/env/newWaMsgHandler";
import { CognitoIdentityProviderClient, AdminInitiateAuthCommand, AuthFlowType  } from "@aws-sdk/client-cognito-identity-provider"; // ES Modules import
import { backend } from '../../backend';

const { resourceConfig, libraryOptions } = await getAmplifyDataClientConfig(
  env
);

Amplify.configure(resourceConfig, libraryOptions);



// sched function

    // 1. fetch all convos

    // 2. for each convo / user:

        // fetch all convo().listMsgs()

        // if not all convo msgs in DB.msgs:
            // add them
            // if last msg from user < 24h ago, wap.sendMsg(convo().lastMsg())

    


export const handler: Handler = async () => {

  const initAuthCommand = new AdminInitiateAuthCommand({ 
    AuthFlow: AuthFlowType.ADMIN_NO_SRP_AUTH,
    UserPoolId: backend.auth.resources.userPool.userPoolId,
    ClientId: backend.auth.resources.userPoolClient.userPoolClientId,
    AuthParameters: {
      "USERNAME": env.ADMIN_USERNAME,
      "PASSWORD": env.ADMIN_PASSWORD,
    }
  });

  const cognitoClient = new CognitoIdentityProviderClient({});
  const cognitoResponse = await cognitoClient.send(initAuthCommand);
  const idToken = cognitoResponse.AuthenticationResult?.IdToken;

  console.log("ACCESS TOKEN", idToken);

  const client = generateClient<Schema>({authMode: 'identityPool', authToken: idToken});


  const users = await client.models.User.list({limit: 250});
  // create a map of convoId to user
  const convoIdToUser = new Map<string, string>();
  for (const user of users.data) {
    if (user.convoId) {
      convoIdToUser.set(user.convoId, user.id);
    }
  }


  const convos = await client.conversations.waChat.list({limit: 250});

  for (const convo of convos.data) {
    const userWaId = convoIdToUser.get(convo.id);
    if (!userWaId) {
      continue;
    }

    const msgs = await convo.listMessages({limit: 1000});
    for (const msg of msgs.data) {
      // check if msg in DB
      const { errors, data: dbMsg } = await client.models.Message.get({id: msg.id});
      if (errors) {
        console.log("ERRORS 1.", errors);
        return;
      }
      if (!dbMsg) {
        await client.models.Message.create({
          waId: userWaId,
          messageId: msg.id,
          text: msg.content[0].text || '',
          timestamp: parseInt(msg.createdAt),
          source: 'user'
        });
      }
      // if not, add it
      // if last msg from user < 24h ago, wap.sendMsg(convo().lastMsg())
    }
  }


  return;
};