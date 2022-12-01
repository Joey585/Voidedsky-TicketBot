const {model, Schema} = require("mongoose");

const guildSchema = new Schema({
    id: String,
    tickets: [{
        name: String,
        participants: {
          type: Map,
          of: Object
        },
        ticketObj: Object
    }],
    settings: {
        testSetting: Boolean
    }
});

guildSchema.method({
    updateLastTalked: function (index, id){
        this.tickets[index].ticketObj.lastTalked = id;
    }
});

const Guild = model("Guild", guildSchema);

module.exports = {guildSchema, Guild}