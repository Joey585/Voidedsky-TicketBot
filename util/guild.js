const {Schema} = require("mongoose")
const mongoose = require('mongoose');
const {ticketChannelSchema} = require("../buttonPress")

const guildSchema = new Schema({
    id: String,
    tickets: [ticketChannelSchema],
    settings: {
        testSetting: Boolean
    }
})

const Guild = mongoose.model("Guild", guildSchema);

async function guildInDB(guildID){
    Guild.findOne({id: guildID}, (err, guild) => {
        if(guild){ return true; }
    })
}


module.exports = { guildInDB, Guild, guildSchema }

