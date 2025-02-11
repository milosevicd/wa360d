import { defineFunction, secret } from '@aws-amplify/backend';

export const checkAiUpdates = defineFunction({
    name: 'checkAiUpdates',
    entry: './handler.ts',
    environment: {
        ADMIN_USERNAME: secret('adminUsername'),
        ADMIN_PASSWORD: secret('adminPassword'),
    },
    schedule: "every 1m"
});