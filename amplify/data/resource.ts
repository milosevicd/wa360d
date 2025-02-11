import { type ClientSchema, a, defineData, defineFunction } from '@aws-amplify/backend';
import * as iam from "aws-cdk-lib/aws-iam"
import { newWaMsgHandler } from './newWaMsgHandler/resource';

/*== STEP 1 ===============================================================
The section below creates a Todo database table with a "content" field. Try
adding a new "isDone" field as a boolean. The authorization rule below
specifies that any unauthenticated user can "create", "read", "update", 
and "delete" any "Todo" records.
=========================================================================*/



const statement = new iam.PolicyStatement({
  sid: "AllowAccessToCognito",
  actions: ["cognito-idp:AdminInitiateAuth"],
  resources: ["arn:aws:cognito-idp:us-west-2:123456789012:userpool/us-west-2_fUuxzcMKO"],
})


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

  newWaMsg: a.mutation()
      .arguments({
        content: a.string().required(),
      })
      .handler(a.handler.function(newWaMsgHandler).async())
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
    defaultAuthorizationMode: 'iam',
  }
});

/*== STEP 2 ===============================================================
Go to your frontend source code. From your client-side code, generate a
Data client to make CRUDL requests to your table. (THIS SNIPPET WILL ONLY
WORK IN THE FRONTEND CODE FILE.)

Using JavaScript or Next.js React Server Components, Middleware, Server 
Actions or Pages Router? Review how to generate Data clients for those use
cases: https://docs.amplify.aws/gen2/build-a-backend/data/connect-to-API/
=========================================================================*/

/*
"use client"
import { generateClient } from "aws-amplify/data";
import type { Schema } from "@/amplify/data/resource";

const client = generateClient<Schema>() // use this Data client for CRUDL requests
*/

/*== STEP 3 ===============================================================
Fetch records from the database and use them in your frontend component.
(THIS SNIPPET WILL ONLY WORK IN THE FRONTEND CODE FILE.)
=========================================================================*/

/* For example, in a React component, you can use this snippet in your
  function's RETURN statement */
// const { data: todos } = await client.models.Todo.list()

// return <ul>{todos.map(todo => <li key={todo.id}>{todo.content}</li>)}</ul>
