const {SlashCommandBuilder, EmbedBuilder} = require("discord.js");
const { TicketChannel } = require("../buttonPress")
const { logChannel } = require("../config.json")
const fs = require("fs");

async function gatherEndHTML(ticketChannel, interaction) {

    let html = `</div><div id="member-list"><h2>Members Participated — ${ticketChannel.participants.size}</h2>`

    await ticketChannel.participants.forEach((key, value) => {
        interaction.guild.members.fetch(value).then((member) => {
            const str = `<div class="member"><img class="list-pfp" src="${member.user.displayAvatarURL()}" alt="${member.user.username}"><span class="member-list-username" style="color: ${member.displayHexColor}">${member.nickname ? null : member.user.username}</span></div>`
            html += str;
        })
    })
    return html;
}


module.exports = {
    data: new SlashCommandBuilder()
        .setName("close")
        .setDescription("closes the ticket you are in")
        .addStringOption(option =>
            option.setName("reason")
                .setDescription("reason for ticket closing")
        ),
    async execute(interaction){
        console.log("running")
        if(!(interaction.channel.topic.startsWith("ticket ID:") && interaction.channel.name.startsWith("ticket-"))) {
            return interaction.reply("This is not a ticket channel!")
        }

        const reason = interaction.options.getString("reason")
        const id = interaction.channel.topic.replace("ticket ID: ", "");


        TicketChannel.findOne({ id: interaction.channel.topic.replace("ticket ID: ", "") }, async (err, ticketChannel) => {
            if(err) {
                console.log(err)
            }

            await fs.appendFile(`./webserver/tickets/${interaction.channel.name}-${id}.html`, `${await gatherEndHTML(ticketChannel, interaction)}</div></body></html>`, (e) => { if(e) throw e; })

            ticketChannel.delete();
            interaction.channel.delete()

            if(!logChannel) {
                return;
            }

            const creatorID = ticketChannel.creatorID.toString();
            const channel = interaction.client.channels.cache.get(logChannel);
            const creator = await interaction.client.users.fetch(creatorID);

            const finishTicketEmbed = new EmbedBuilder()
                .setTitle("Ticket Closed")
                .setDescription(`Closed by <@${interaction.user.id}>`)
                .addFields(
                    {name: "Created by", value: `<@${creator.id}>`},
                    {name: "Reason", value: reason ? reason : "undefined"},
                    {name: "Opened at", value: `<t:${ticketChannel.timeCreated}:F>`},
                    {name: "ID", value: id}
                )

            channel.send({embeds: [finishTicketEmbed]})
        })



    }
}