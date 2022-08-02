const fs = require("fs")
const { TicketChannel } = require("../buttonPress")
const moment = require("moment")


function updateLastTalked(doc, id){
    doc.updateOne({ lastTalked: id }, (e) => {
        if (e) console.log(e)
    })
    doc.save();
}


function cleanMessage(message) {

    const regexp = new RegExp('<@\\d+>', 'g');
    let messageContent = message.content
    const matches = messageContent.matchAll(regexp);

    String.prototype.insert = function (index, string) {
        if(index > 0) {
            return this.substring(0, index) + string + this.substr(index);
        }

        return string + this;
    };

    for (const match of matches) {

        const regex = /\D/g

        const username = message.mentions.members.get(match[0].replace(regex, "")).user.username;

        messageContent = messageContent.replace(match[0], "")
        messageContent = messageContent.insert(match.index, `<span class="mention">@${username}</span>`)
    }
    return messageContent
}

function fullMessage(message, id, formattedTimestamp) {
    fs.appendFile(`./webserver/tickets/${message.channel.name}-${id}.html`, `<div class="full-message"><img class="pfp" src="${message.author.displayAvatarURL()}" alt="${message.author.username}"><h2><span style="color: ${message.member.displayHexColor}" class="username">${message.member.nickname ? null : message.author.username}</span><span style="color: #A0A3A7" class="timestamp">${formattedTimestamp}</span></h2><p style="color: hsl(210,calc(var(--saturation-factor, 1)*2.9%),86.7%);" class="content">${cleanMessage(message)}</p></div>`, (e) => {
        if(e) throw e;
    })
}




module.exports = {
    name: "messageCreate",
    async execute(message) {

        if(message.content === "/close") {
            return;
        }
        if(message.author.bot) {
            return;
        }
        if(!(message.channel.name.startsWith("ticket-"))) {
            return;
        }

        const id = message.channel.topic.replace("ticket ID: ", "");
        const formattedTimestamp = moment().format("MM/DD/YY")

        TicketChannel.findOne({id: id}, async (err, ticketChannel) => {


            if(!ticketChannel.participants.has(message.author.id)){
                ticketChannel.participants.set(message.author.id, { messages: 1 })
            } else {
                let messages = ticketChannel.get(message.author.id)
                ticketChannel.participants.set(message.author.id, { messages: messages++ })
            }



            if(err) {
                console.log(err);
            }

            if(ticketChannel.lastTalked === null) {
                updateLastTalked(ticketChannel, message.author.id)
                fullMessage(message, id, formattedTimestamp)
                return;
            }

            if(ticketChannel.lastTalked !== message.author.id) {
                updateLastTalked(ticketChannel, message.author.id)
                fullMessage(message, id, formattedTimestamp)
            } else {

                const timeCurrently = moment().format("LT")

                fs.appendFile(`./webserver/tickets/${message.channel.name}-${id}.html`, `<div class="half-message"><span class="half-timestamp">${timeCurrently}</span><p style="color: hsl(210,calc(var(--saturation-factor, 1)*2.9%),86.7%);" class="content">${cleanMessage(message)}</p></div>`, (e) => {
                    if(e) throw e;
                })
            }
        })


    }
}