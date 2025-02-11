import { defineFunction } from '@aws-amplify/backend';

export const newWaMsgHandler = defineFunction({
    entry: './newWaMsgHandler.ts'
});