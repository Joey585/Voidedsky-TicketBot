const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle} = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName("setup")
        .setDescription("creates panel for making tickets")
        .addChannelOption(option =>
            option.setName("channel")
                .setDescription("channel for panel")
                .setRequired(true))
        .addStringOption(option =>
            option.setName("title")
                .setDescription("title for the panel")
                .setRequired(true))
        .addStringOption(option =>
            option.setName("desc")
                .setDescription("Description of panel")
                .setRequired(true))
        .addStringOption(option =>
            option.setName("button")
                .setDescription("Button content")
                .setRequired(true)
        )
        .addStringOption(option =>
            option.setName("type")
                .setDescription("the type of ticket")
                .addChoices(
                    { name: "minecraft support", value: "minecraft"},
                    { name: "discord support", value: "discord"}
                )
                .setRequired(true)
        )
    ,
    async execute(interaction){
        const channel = interaction.options.getChannel("channel");
        const title = interaction.options.getString("title");
        const desc = interaction.options.getString("desc");
        const buttonContent = interaction.options.getString("button");
        const type = interaction.options.getString("type");

        const panelEmbed = new EmbedBuilder()
            .setTitle(title)
            .setDescription(desc)
            .setColor("Random");
        const row = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId(type)
                    .setLabel(buttonContent)
                    .setStyle(3)
            );
        channel.send({ embeds: [panelEmbed], components: [row] }).then(() => {
            interaction.reply({content: "Successfully created panel!", ephemeral: true})
        })

    }
}