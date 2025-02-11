import type { Schema } from '../resource'
import type { PostConfirmationTriggerHandler } from "aws-lambda";
import { Amplify } from "aws-amplify";
import { generateClient } from "aws-amplify/data";
import { getAmplifyDataClientConfig } from '@aws-amplify/backend/function/runtime';
import { env } from "$amplify/env/newWaMsgHandler";
import { CognitoIdentityProviderClient, AdminInitiateAuthCommand, AuthFlowType  } from "@aws-sdk/client-cognito-identity-provider"; // ES Modules import

const { resourceConfig, libraryOptions } = await getAmplifyDataClientConfig(
  env as any
);

Amplify.configure(resourceConfig, libraryOptions);
// buggysecr1A"


export const handler: Schema["newWaMsg"]["functionHandler"] = async (event, context) => {
  const waMsg = JSON.parse(event.arguments.content);


  const input = { // AdminInitiateAuthRequest
    AuthFlow: AuthFlowType.ADMIN_NO_SRP_AUTH,
    UserPoolId: "us-west-2_fUuxzcMKO", // required
    ClientId: "3vbmm66gtpfl0v6etvst497o97", // required
    AuthParameters: { // AuthParametersType
      "USERNAME": "milosevic.d+360d3@gmail.com",
      "PASSWORD": "RPu..PNuVQbPzr2",
    }
  };
  const command = new AdminInitiateAuthCommand(input);

  const cognito = new CognitoIdentityProviderClient({});
  const cognitoResponse = await cognito.send(command);
  const accessToken = cognitoResponse.AuthenticationResult?.IdToken;

  console.log("ACCESS TOKEN", accessToken);

  const client = generateClient<Schema>({authMode: 'identityPool', authToken: accessToken});

  const waId = waMsg.entry[0].changes[0].value.contacts[0].wa_id;

  const { errors, data: newMessage } =  await client.models.Message.create({
    waId: waId,
    messageId: waMsg.entry[0].changes[0].value.messages[0].id,
    text: waMsg.entry[0].changes[0].value.messages[0].text.body,
    timestamp: parseInt(waMsg.entry[0].changes[0].value.messages[0].timestamp),
    source: 'user'
  });

  if (errors) {
    console.log("ERRORS 1.", errors);
    return;
  }

  const user = await client.models.User.get({id: waId});

  if (!user.data) {
    await client.models.User.create({
      id: waId,
      name: waMsg.entry[0].changes[0].value.contacts[0].profile.name
    });
  }

  let convoId = user.data?.convoId;
  let convorRef : any = null;

  if (!convoId) {
    const { errors, data: convo } = await client.conversations.waChat.create();
    if (errors) { 
      console.log("ERRORS 2.", errors);
      return;
    }
    convoId = convo?.id || '';
    await client.models.User.update({
      id: waId,
      convoId: convoId
    });
    convorRef = convo;
  } else {
    const { errors, data: convo } = await client.conversations.waChat.get({id: convoId});
    if (errors) { 
      console.log("ERRORS 3.", errors);
      return;
    }
    convorRef = convo;
  }

  const { errors: errors2, data: msg2 }  = await convorRef.sendMessage(waMsg.entry[0].changes[0].value.messages[0].text.body);

  console.log("MSG2", msg2);
  if (errors2) {
    console.log("ERRORS 4.", errors2);
    return;
  }

  return;
};