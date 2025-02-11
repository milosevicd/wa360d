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


  const {data: users, errors: usersErrors} = await client.models.User.list();
  if (usersErrors) {
    console.log("ERRORS 1.", usersErrors);
    return;
  }
  // create a map of convoId to user
  const convoIdToUser = new Map<string, string>();
  for (const user of users) {
    if (user.convoId) {
      convoIdToUser.set(user.convoId, user.id);
    }
  }


  const {data: convos, errors: convosErrors} = await client.conversations.waChat.list();
  if (convosErrors) {
    console.log("ERRORS 2.", convosErrors);
    return;
  }

  for (const convo of convos) {
    const userWaId = convoIdToUser.get(convo.id);
    if (!userWaId) {
      continue;
    }

    const {data: msgs, errors: msgsErrors} = await convo.listMessages();
    if (msgsErrors) {
      console.log("ERRORS 3.", msgsErrors);
      return;
    }
    for (const msg of msgs) {
      // check if msg in DB
      const {errors: dbMsgErrors, data: dbMsg} = await client.models.Message.get({id: msg.id});
      if (dbMsgErrors) {
        console.log("ERRORS 4.", dbMsgErrors);
        return;
      }
      if (!dbMsg) {
        await client.models.Message.create({
          waId: userWaId,
          messageId: msg.id,
          text: msg.content[0].text || '',
          timestamp: new Date(msg.createdAt).getTime() / 1000,
          source: 'AI'
        });
      }
      // if last msg from user < 24h ago, wap.sendMsg(convo().lastMsg())
    }
  }


  return;
};