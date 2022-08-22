const fs = require('node:fs');
const path = require('node:path');
const { Client, Collection, GatewayIntentBits } = require('discord.js');
const { token, mongoCLI } = require('./config.json');
const { createTicket } = require('./buttonPress');
const mongoose = require('mongoose');
const { stringTest } = require('./testFunction')
const { app } = require("./webserver/api/app")

const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent] });

client.commands = new Collection();
const commandsPath = path.join(__dirname, 'commands');
const eventsPath = path.join(__dirname, 'events');

const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
const eventFiles = fs.readdirSync(eventsPath).filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
    const filePath = path.join(commandsPath, file);
    const command = require(filePath);
    client.commands.set(command.data.name, command);
}

for (const file of eventFiles) {
    const filePath = path.join(eventsPath, file);
    const event = require(filePath);
    if (event.once) {
        client.once(event.name, (...args) => event.execute(...args));
    } else {
        client.on(event.name, (...args) => event.execute(...args));
    }
}

client.once('ready', () => {
    console.log('Ready!');

    stringTest("Hello there, <@620813044246642689>")
});

client.on('interactionCreate', async interaction => {
    if(interaction.isButton()){
        createTicket(interaction)
    }

    const command = client.commands.get(interaction.commandName);

    if (!command) return;

    try {
        await command.execute(interaction, client);
    } catch (error) {
        console.error(error);
        await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
    }
});

main().catch(err => console.log(err));

async function main() {
    await mongoose.connect(mongoCLI);
}

client.login(token);