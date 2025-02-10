import type { Schema } from '../resource'
import type { PostConfirmationTriggerHandler } from "aws-lambda";
import { Amplify } from "aws-amplify";
import { generateClient } from "aws-amplify/data";
import { getAmplifyDataClientConfig } from '@aws-amplify/backend/function/runtime';
import { env } from "$amplify/env/newWaMsg";

const { resourceConfig, libraryOptions } = await getAmplifyDataClientConfig(
  env as any
);

Amplify.configure(resourceConfig, libraryOptions);

const client = generateClient<Schema>();

export const handler: Schema["newWaMsg"]["functionHandler"] = async (event, context) => {
  await client.models.Webhook.create({
    content: event.arguments.content,
    fromFunction: "YES!"
  });
  return;
};