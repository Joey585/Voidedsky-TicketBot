const {SlashCommandBuilder, EmbedBuilder} = require("discord.js");
const { Guild } = require("../schemas/guild");
const guildUtil = require("../util/guild");
const fs = require("fs");

async function gatherEndHTML(ticketChannel, interaction) {
    let html = `</div><div id="member-list"><h2>Members Participated — ${ticketChannel.participants.size}</h2>`

    await ticketChannel.participants.filter(person => person.userID !== undefined).forEach((person) => {
        interaction.guild.members.fetch(person.userID).then((member) => {
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
        if(!(interaction.channel.topic.startsWith("ticket ID:") && interaction.channel.name.startsWith("ticket-"))) {
            return interaction.reply("This is not a ticket channel!")
        }

        const reason = interaction.options.getString("reason")
        const id = interaction.channel.topic.replace("ticket ID: ", "");


        const ticketData = await guildUtil.findTicket(interaction.guild.id, interaction.channel);

        if(!ticketData) return interaction.reply({content: "I'm sorry but this ticket does not exist in the database! Please contact support.", ephemeral: true})



        await fs.appendFile(`./tickets/${interaction.channel.name}-${id}.html`, `${await gatherEndHTML(ticketData.ticket, interaction)}</div></body></html>`, (e) => { if(e) throw e; })

        ticketData.ticket.ticketObj.closed = true;
        ticketData.ticket.ticketObj.reason = reason ? reason : "Not Stated."
        ticketData.ticket.ticketObj.closeUserId = interaction.user.id
        ticketData.guild.markModified("tickets");
        ticketData.guild.save();

        interaction.channel.delete()

        const logChannel = await guildUtil.getLogChannel(interaction.guild.id);

        if(logChannel === "0") {
            return;
        }

        const creatorID = ticketData.ticket.ticketObj.creatorID.toString();
        const channel = interaction.client.channels.cache.get(logChannel);
        const creator = await interaction.client.users.fetch(creatorID);

        console.log(ticketData.ticket.participants.map(person => `<@${person.userID}>: ${person.messages}`).join("\n"));

        const finishTicketEmbed = new EmbedBuilder()
            .setTitle("Ticket Closed")
            .setURL(`https://localhost:3000/tickets/${ticketData.ticket.name}.html`)
            .setDescription(`**Closed by** <@${interaction.user.id}>\n**__Participants__**\n${ticketData.ticket.participants.filter(person => person.userID !== undefined).map(person => `<@${person.userID}>: ${person.messages}`).join("\n")}`)
            .addFields(
                {name: "Created by", value: `<@${creator.id}>`},
                {name: "Reason", value: reason ? reason : "Not Stated."},
                {name: "Opened at", value: `<t:${ticketData.ticket.ticketObj.timeCreated}:F>`},
                {name: "ID", value: id}
            )

        channel.send({embeds: [finishTicketEmbed]})
    }
}