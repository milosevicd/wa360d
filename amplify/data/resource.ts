import { type ClientSchema, a, defineData, defineFunction } from '@aws-amplify/backend';
import * as iam from "aws-cdk-lib/aws-iam"
import { newWaMsgHandler } from '../functions/newWaMsgHandler/resource';
import { checkAiUpdates } from '../functions/checkAiUpdates/resource';

const schema = a.schema({
  User: a.model({
      id: a.id().required(),
      name: a.string().required(),
      convoId: a.string()
    })
    .authorization((allow) => [allow.guest(), allow.authenticated()]),

  Message: a.model({
      waId: a.string().required(),
      messageId: a.string().required(),
      text: a.string().required(),
      timestamp: a.timestamp().required(),
      source: a.enum(['user', 'AI']),
    })
    .authorization((allow) => [allow.guest(), allow.authenticated()]),

  newWaMsgHandler: a.mutation()
      .arguments({
        content: a.string().required(),
      })
      .handler(a.handler.function(newWaMsgHandler).async())
      .authorization((allow) => [allow.guest(), allow.authenticated()]),

  checkAiUpdates: a.mutation()
    .handler(a.handler.function(checkAiUpdates).async())
    .authorization((allow) => [allow.guest(), allow.authenticated()]),

  waChat: a.conversation({
      aiModel: a.ai.model('Claude 3 Haiku'),
      systemPrompt: `When you receive the first message, treat it as a message from the admin, setting the topic of the conversation and the name of the user you'll be talking to. All other messages are between you and the user, not the admin anymore.
        You are admin's personal assistant, Alisa, talking to the user on his behalf. 
        Reply on the first message by greeting the user (not the admin), presenting yourself, and initiating the conversation about the topic set by admin in the first message. Offer all knowledge about the topic and be as helpful as possible. Use emojis and positive, cheerful tone.`,
      })
      .authorization((allow) => allow.owner()),
    
    
}).authorization((allow) => [allow.resource(newWaMsgHandler)]);



export type Schema = ClientSchema<typeof schema>;

export const data = defineData({
  schema,
  authorizationModes: {
    defaultAuthorizationMode: 'userPool',
  }
});
