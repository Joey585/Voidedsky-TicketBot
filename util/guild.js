const {Guild} = require("../schemas/guild");

module.exports = {
    findTicket: (guildID, ticketChannel) => new Promise((resolve, reject) => {
        let index;
        const id = ticketChannel.topic.replace("ticket ID: ", "");

        Guild.findOne({id: guildID}, async (err, guild) => {
            if(err) reject(err);
            guild.tickets.forEach((ticket) => {
                if(ticket.name === `${ticketChannel.name}-${id}`){
                    index = guild.tickets.map(t => t.name).indexOf(ticket.name);
                }
            });
            resolve({index: index, ticket: guild.tickets[index], guild: guild});
        });
    })
}
