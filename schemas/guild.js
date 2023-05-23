const {model, Schema} = require("mongoose");

const guildSchema = new Schema({
    id: String,
    tickets: [{
        name: String,
        participants: [{
            userID: String,
            messages: Number
        }],
        ticketObj: Object
    }],
    settings: {
        logChannel: String
    }
});

guildSchema.method({
    updateLastTalked: function (index, id){
        this.tickets[index].ticketObj.lastTalked = id;
    },
    addParticipant: function (index, id){
        this.tickets[index].ticketObj.participants.set()
    }
});

const Guild = model("Guild", guildSchema);

module.exports = {guildSchema, Guild}