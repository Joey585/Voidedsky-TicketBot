const {SlashCommandBuilder} = require("discord.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("add")
        .setDescription("adds a member to the ticket")
        .addUserOption(option =>
            option.setName("user")
                .setDescription("user to add")
                .setRequired(true)
        ),
    async execute(interaction){

        if(!(interaction.channel.topic.startsWith("ticket ID:") && interaction.channel.name.startsWith("ticket-"))){
            return interaction.reply({content: "This is not a ticket!", ephemeral: true})
        }

        const userAdd = interaction.options.getUser("user");
        await interaction.channel.permissionOverwrites.edit(userAdd.id, {ViewChannel: true}).then(() => {
            return interaction.reply({content: `You added ${userAdd.username} to ${interaction.channel.name}`, ephemeral: true})
        })

    }
}