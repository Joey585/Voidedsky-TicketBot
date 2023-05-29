const {Guild} = require("../schemas/guild");

const getGuild = (id) => new Promise((resolve, reject) => {
    Guild.findOne({id: id}, (err, guild) => {
        if(err) reject(err);
        resolve(guild);
    });
})


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
    }),
    getLogChannel: (guildID) => new Promise(async (resolve, reject) => {
        const guild = await getGuild(guildID);

        if(guild.settings.logChannel === "0" || !guild.settings.logChannel){
            reject("No log channel")
        }

        resolve(guild.settings.logChannel);
    })
}
