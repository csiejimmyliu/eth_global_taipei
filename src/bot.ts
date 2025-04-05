import { Client, GatewayIntentBits, Events, Message } from 'discord.js';
import dotenv from 'dotenv';
import { handleRegistration } from './registration';

// Load environment variables
dotenv.config();

if (!process.env.DISCORD_TOKEN) {
    console.error('Missing DISCORD_TOKEN in .env file');
    process.exit(1);
}

// Initialize Discord client with minimal required intents
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages
    ]
});

// Command format: !mint "123 Main St, Los Angeles" 34.0522 -118.2437 "residential"
const MINT_COMMAND = /^!mint\s+"([^"]+)"\s+(-?\d+\.?\d*)\s+(-?\d+\.?\d*)\s+"([^"]+)"$/;

// Handle incoming messages
client.on(Events.MessageCreate, async (message: Message) => {
    // Ignore bot messages
    if (message.author.bot) return;

    // Handle mint command
    const match = message.content.match(MINT_COMMAND);
    if (match) {
        const [_, address, latitude, longitude, propertyType] = match;
        
        try {
            const result = await handleRegistration(
                message.author.id,
                address,
                parseFloat(latitude),
                parseFloat(longitude),
                propertyType
            );
            
            await message.reply(`✅ Successfully registered your property!\nNFT Contract Address: ${result.contractAddress}\nToken ID: ${result.tokenId}`);
        } catch (error: any) {
            await message.reply(`❌ Failed to register: ${error.message}`);
        }
    }

    // Help command
    if (message.content === '!help') {
        const helpMessage = `
Available commands:
\`!mint "address" latitude longitude "property_type"\`
Example: \`!mint "123 Main St, Los Angeles" 34.0522 -118.2437 "residential"\`

\`!help\` - Show this help message
        `;
        await message.reply(helpMessage);
    }
});

// Handle ready event
client.once(Events.ClientReady, (c: any) => {
    console.log(`✅ Discord bot ready! Logged in as ${c.user.tag}`);
});

// Login to Discord with better error handling
client.login(process.env.DISCORD_TOKEN).catch((error: Error) => {
    if (error.message.includes('disallowed intents')) {
        console.error('Error: The bot requires additional permissions in the Discord Developer Portal.');
        console.error('Please enable the following intents for your bot:');
        console.error('1. SERVER MEMBERS INTENT');
        console.error('2. MESSAGE CONTENT INTENT');
        console.error('Visit: https://discord.com/developers/applications');
    } else {
        console.error('Failed to login to Discord:', error);
    }
    process.exit(1);
}); 