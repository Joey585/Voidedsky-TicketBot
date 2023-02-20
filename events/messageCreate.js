const fs = require("fs");
const moment = require("moment");
const { containsLink } = require("../util/containsLink");
const isImageUrl = require("is-image-url");
const {Schema} = require("mongoose");
const mongoose = require("mongoose");
const {Guild, guildSchema} = require("../schemas/guild");



// custom string method to insert a string into a string
String.prototype.insert = function (index, string) {
    if(index > 0) {
        return this.substring(0, index) + string + this.substr(index);
    }

    return string + this;
};


// parse the entire message, emojis, images, mentions, links, images
function cleanMessage(message) {

    const mentionRegexp = new RegExp('<@\\d+>', 'g');
    const linkRegexp = new RegExp('(?:\\b[a-z\\d.-]+:\\/\\/[^<>\\s]+|\\b(?:(?:(?:[^\\s!@#$%^&*()_=+[\\]{}\\|;:\'",.<>/?]+)\\.)+(?:ac|ad|aero|ae|af|ag|ai|al|am|an|ao|aq|arpa|ar|asia|as|at|au|aw|ax|az|ba|bb|bd|be|bf|bg|bh|biz|bi|bj|bm|bn|bo|br|bs|bt|bv|bw|by|bz|cat|ca|cc|cd|cf|cg|ch|ci|ck|cl|cm|cn|coop|com|co|cr|cu|cv|cx|cy|cz|de|dj|dk|dm|do|dz|ec|edu|ee|eg|er|es|et|eu|fi|fj|fk|fm|fo|fr|ga|gb|gd|ge|gf|gg|gh|gi|gl|gm|gn|gov|gp|gq|gr|gs|gt|gu|gw|gy|hk|hm|hn|hr|ht|hu|id|ie|il|im|info|int|in|io|iq|ir|is|it|je|jm|jobs|jo|jp|ke|kg|kh|ki|km|kn|kp|kr|kw|ky|kz|la|lb|lc|li|lk|lr|ls|lt|lu|lv|ly|ma|mc|md|me|mg|mh|mil|mk|ml|mm|mn|mobi|mo|mp|mq|mr|ms|mt|museum|mu|mv|mw|mx|my|mz|name|na|nc|net|ne|nf|ng|ni|nl|no|np|nr|nu|nz|om|org|pa|pe|pf|pg|ph|pk|pl|pm|pn|pro|pr|ps|pt|pw|py|qa|re|ro|rs|ru|rw|sa|sb|sc|sd|se|sg|sh|si|sj|sk|sl|sm|sn|so|sr|st|su|sv|sy|sz|tc|td|tel|tf|tg|th|tj|tk|tl|tm|tn|to|tp|travel|tr|tt|tv|tw|tz|ua|ug|uk|um|us|uy|uz|va|vc|ve|vg|vi|vn|vu|wf|ws|xn--0zwm56d|xn--11b5bs3a9aj6g|xn--80akhbyknj4f|xn--9t4b11yi5a|xn--deba0ad|xn--g6w251d|xn--hgbk6aj7f53bba|xn--hlcj6aya9esc7a|xn--jxalpdlp|xn--kgbechtv|xn--zckzah|ye|yt|yu|za|zm|zw)|(?:(?:[0-9]|[1-9]\\d|1\\d{2}|2[0-4]\\d|25[0-5])\\.){3}(?:[0-9]|[1-9]\\d|1\\d{2}|2[0-4]\\d|25[0-5]))(?:[;/][^#?<>\\s]*)?(?:\\?[^#<>\\s]*)?(?:#[^<>\\s]*)?(?!\\w))', 'g');
    const emojiRegexp = new RegExp('(<a?)?:\\w+:(\\d{18}>)?', "g");
    const imgEmojiRegexp = new RegExp('<img class="emoji-small" src="https:\\/\\/cdn.discordapp.com\\/emojis\\/\\d{18,20}.webp\\?size=44&quality=lossless" alt="emoji">', 'g');
    const htmlRegexp = new RegExp("(<script(\\s|\\S)*?<\\/script>)|(<style(\\s|\\S)*?<\\/style>)|(<!--(\\s|\\S)*?-->)|(<\\/?(\\s|\\S)*?>)", "g");

    let messageContent = message.content

    const mentionMatches = messageContent.matchAll(mentionRegexp);
    for (const match of mentionMatches) {

        const regex = /\D/g

        const username = message.mentions.members.get(match[0].replace(regex, "")).user.username;

        messageContent = messageContent.replace(match[0], `<span class="mention">@${username}</span>`)
    }



    const linkMatches = messageContent.matchAll(linkRegexp);
    for (const match of linkMatches) {
        messageContent = messageContent.replace(match[0], `<a class="imageLink" href="${match[0]}" target="_blank">${match[0]}</a>`)
        if(isImageUrl(match[0])){
            messageContent += `<div class="half-message"><img class="discordImage" src="${match[0]}" alt="${match[0]}"></div>`
        }
    }
    const emojiMatches = messageContent.matchAll(emojiRegexp);
    for (const match of emojiMatches){
        const emojiId = match[0].replace("<:", "").split(":")[1].replace(">", "");

        messageContent = messageContent.replace(match[0], `<img class="emoji-small" src="https://cdn.discordapp.com/emojis/${emojiId.replace(">", "")}.webp?size=44&quality=lossless" alt="emoji">`)
        console.log(messageContent)
        // messageContent = messageContent.insert(match.index, `<img class="emoji-small" src="https://cdn.discordapp.com/emojis/${emojiId}.webp?size=44&quality=lossless" alt="emoji">`)

    }

    const messageCheck = messageContent.replaceAll(/<img class="emoji-small" src="https:\/\/cdn.discordapp.com\/emojis\/\d{18,20}.webp\?size=44&quality=lossless" alt="emoji">/gi, "")
    if(messageCheck.trim().length === 0){
        messageContent = messageContent.replaceAll("emoji-small", "emoji-big").replaceAll("?size=44", "?size=96")
    }

    messageContent = messageContent.replaceAll("\n", "<br>");

    // messageContent = messageContent.replaceAll(htmlRegexp, "");

    return messageContent
}

function fullMessage(message, id, formattedTimestamp) {
    fs.appendFile(`./tickets/${message.channel.name}-${id}.html`, `<div class="full-message"><img class="pfp" src="${message.author.displayAvatarURL()}" alt="${message.author.username}"><h2><span style="color: ${message.member.displayHexColor}" class="username">${message.member.nickname ? message.member.nickname : message.author.username}</span><span style="color: #A0A3A7" class="timestamp">${formattedTimestamp}</span></h2><p style="color: hsl(210,calc(var(--saturation-factor, 1)*2.9%),86.7%);" class="content">${cleanMessage(message)}</p></div>`, (e) => {
        if(e) throw e;
        if(message.attachments){
            message.attachments.forEach((attachment) => {
                fs.appendFile(`./tickets/${message.channel.name}-${id}.html`, `<div class="half-message"><img class="discordImage" src="${attachment.url}" alt="${attachment.name}" style="width: ${Math.round(attachment.width / 4)}px; height: ${Math.round(attachment.height / 4)}px"></div>`, (e) => {
                    if (e) throw e;
                })
            })
        }
    })
}

function linkedFullImage(message, id, formattedTimestamp){
    fs.appendFile(`./webserver/api/tickets/${message.channel.name}-${id}.html`, `<div class="full-message"><img class="pfp" src="${message.author.displayAvatarURL()}" alt="${message.author.username}"><h2><span style="color: ${message.member.displayHexColor}" class="username">${message.member.nickname ? message.member.nickname : message.author.username}</span><span style="color: #A0A3A7" class="timestamp">${formattedTimestamp}</span></h2><p style="color: hsl(210,calc(var(--saturation-factor, 1)*2.9%),86.7%);" class="content">${cleanMessage(message)}</p></div><div class="half-message"><img class="discordImage" src="${message.content}" alt="${message.content}"></div>`, (e) => {
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
        const formattedTimestamp = moment().format("MM/DD/YY");

        if(message.attachments){
            message.attachments.forEach((attachment) => {
                console.log(attachment.name)
            })
        }

        Guild.findOne({id: message.guild.id}, async (err, guild) => {
            if(err) return console.log(err);
            if(guild === null) {
                const newGuild = new Guild({
                    id: message.guild.id,
                    tickets: [],
                    settings: {
                        testSetting: false
                    }
                });
                return newGuild.save();
            }

            let ticketChannel;
            let index;

            guild.tickets.forEach((ticket) => {
                if(ticket.name === `${message.channel.name}-${id}`) {
                    ticketChannel = ticket;
                    index = guild.tickets.map(t => t.name).indexOf(ticket.name);
                }
            });

            if(ticketChannel === null) return;

            let participantIndex = -1;

            ticketChannel.participants.forEach((person) => {
                if(person.userID === message.author.id){
                   participantIndex = ticketChannel.participants.map(p => p.userID).indexOf(person.userID);
                }
            });

            if(participantIndex === -1){
                ticketChannel.participants.push({userID: message.author.id,  messages: 1 });
            } else {
                let messages = ticketChannel.participants[participantIndex].messages;
                messages++;
                ticketChannel.participants[participantIndex] = {userID: message.author.id, messages: messages };
            }



            if(err) {
                console.log(err);
            }

            if(ticketChannel.ticketObj.lastTalked === "") {
                ticketChannel.ticketObj.lastTalked = message.author.id
                guild.markModified("tickets");
                await guild.save();
            }
            if(ticketChannel.ticketObj.lastTalked === null) {
                ticketChannel.ticketObj.lastTalked = message.author.id;
                guild.markModified('tickets');
                guild.save();
                fullMessage(message, id, formattedTimestamp)
                return;
            }

            if(ticketChannel.ticketObj.lastTalked !== message.author.id) {
                ticketChannel.ticketObj.lastTalked = message.author.id;
                guild.markModified("tickets");
                await guild.save();
                fullMessage(message, id, formattedTimestamp)
            } else {

                const timeCurrently = moment().format("LT")

                fs.appendFile(`./tickets/${message.channel.name}-${id}.html`, `<div class="half-message"><span class="half-timestamp">${timeCurrently}</span><p style="color: hsl(210,calc(var(--saturation-factor, 1)*2.9%),86.7%);" class="content">${cleanMessage(message)}</p></div>`, (e) => {
                    if(e) throw e;
                    if(message.attachments.size > 0 ){
                        console.log("Attachment in half message")
                        message.attachments.forEach((attachment) => {
                            console.log(attachment)
                            if(attachment.contentType.startsWith("video")){
                                fs.appendFile(`./tickets/${message.channel.name}-${id}.html`, `<div class="discordVideo"><video controls width="${attachment.width / 2}"><source src="${attachment.url}"></video></div>`, (e) => {
                                    if(e) throw e;
                                })
                            }
                            if(attachment.contentType.startsWith("image")){
                                fs.appendFile(`./tickets/${message.channel.name}-${id}.html`, `<div class="half-message"><img class="discordImage" src="${attachment.url}" alt="${attachment.name}" style="width: ${Math.round(attachment.width / 4)}px; height: ${Math.round(attachment.height / 4)}px"></div>`, (e) => {
                                    if (e) throw e;
                                })
                            }
                        })
                    }
                })
            }
            guild.save();
        });
    }
}