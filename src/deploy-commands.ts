import { config } from 'dotenv';
config();

import { deployCommands } from './handlers/commandHandler';

deployCommands().then(() => {
    console.log('✅ Commands deployed successfully');
    process.exit(0);
}).catch((error) => {
    console.error('❌ Failed to deploy commands:', error);
    process.exit(1);
});
