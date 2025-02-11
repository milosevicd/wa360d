import { defineFunction, secret } from '@aws-amplify/backend';

export const newWaMsgHandler = defineFunction({
    name: 'newWaMsgHandler',
    entry: './handler.ts',
    environment: {
        ADMIN_USERNAME: secret('adminUsername'),
        ADMIN_PASSWORD: secret('adminPassword'),
    }
});