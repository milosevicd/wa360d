import type { Schema } from '../resource'
import type { PostConfirmationTriggerHandler } from "aws-lambda";
import { Amplify } from "aws-amplify";
import { generateClient } from "aws-amplify/data";
import { getAmplifyDataClientConfig } from '@aws-amplify/backend/function/runtime';
import { env } from "$amplify/env/newWaMsgHandler";

const { resourceConfig, libraryOptions } = await getAmplifyDataClientConfig(
  env as any
);

Amplify.configure(resourceConfig, libraryOptions);

const client = generateClient<Schema>();

export const handler: Schema["newWaMsg"]["functionHandler"] = async (event, context) => {
  const waMsg = JSON.parse(event.arguments.content);

  const waId = waMsg.entry[0].changes[0].value.contacts[0].wa_id;
  await client.models.Message.create({
    waId: waId,
    messageId: waMsg.entry[0].changes[0].value.messages[0].id,
    text: waMsg.entry[0].changes[0].value.messages[0].text.body,
    timestamp: waMsg.entry[0].changes[0].value.messages[0].timestamp,
    source: 'user'
  });

  const user = await client.models.User.get({id: waId});

  if (!user.data) {
    await client.models.User.create({
      id: waId,
      name: waMsg.entry[0].changes[0].value.contacts[0].profile.name
    });
  }

  let convoId = user.data?.convoId;
  let convo : any = null;

  if (!convoId) {
    convo = await client.conversations.waChat.create();
    convoId = convo.data?.id || '';
    await client.models.User.update({
      id: waId,
      convoId: convoId
    });
  } else {
    convo = await client.conversations.waChat.get({id: convoId});
  }

  await convo.sendMessage(waMsg.entry[0].changes[0].value.messages[0].text.body);

  return;
};