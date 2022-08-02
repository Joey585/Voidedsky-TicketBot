const {PermissionsBitField} = require("discord.js");
const mongoose = require('mongoose');
const {Schema, model} = require("mongoose");
const {ticketCategory} = require("./config.json")
const fs = require("fs");

const ticketChannelSchema = new Schema({
    id: Number,
    creatorID: String,
    type: String,
    timeCreated: Number,
    lastTalked: String,
    participants: {
        type: Map,
        of: Object
    }
})
const TicketChannel = model('TicketChannel', ticketChannelSchema);


function createTicket(interaction){

    const type = interaction.customId
    let rolePerm;

    if(type === "minecraft") rolePerm = interaction.guild.roles.cache.find(role => role.name === "Minecraft Support");
    if(type === "discord") rolePerm = interaction.guild.roles.cache.find(role => role.name === "Discord Support");

    interaction.guild.channels.create({
        name: `ticket-${interaction.member.user.username}`,
        reason: "Ticket created",
        permissionOverwrites: [
            {
                id: interaction.guild.id,
                deny: [PermissionsBitField.Flags.ViewChannel]
            },
            {
                id: rolePerm.id,
                allow: [PermissionsBitField.Flags.ViewChannel]
            },
            {
                id: interaction.user.id,
                allow: [PermissionsBitField.Flags.ViewChannel]
            }
        ],
        parent: ticketCategory ? ticketCategory : null

    }).then((channel) => {

        interaction.reply({ content: "Ticket created for the " + type + " category!", ephemeral: true})

        const id = Math.floor(Math.random() * 10000);


        channel.setTopic("ticket ID: " + id).then(() => {
            const newTicket = new TicketChannel({ id: id, creatorID: interaction.user.id.toString(), type: type, timeCreated: Math.round(Date.now() / 1000), lastTalked: null, participants: {}})
            newTicket.save().then(() => {
                console.log("Ticket saved into database.")
            }).catch((e) => {
                console.log(e)
            })

            fs.appendFile(`./webserver/tickets/${channel.name}-${id}.html`, `<!DOCTYPE html><html lang="en" xmlns="http://www.w3.org/1999/html"><head><meta charset="UTF-8"><title>Log: ${channel.name}</title><link rel="stylesheet" href="../main-discord.css"></head><body><div class="ticket-header"><svg id="ticket-symbol" width="24" height="24" viewBox="0 0 24 24"><path fill="currentColor" d="M14 8C14 7.44772 13.5523 7 13 7H9.76001L10.3657 3.58738C10.4201 3.28107 10.1845 3 9.87344 3H8.88907C8.64664 3 8.43914 3.17391 8.39677 3.41262L7.76001 7H4.18011C3.93722 7 3.72946 7.17456 3.68759 7.41381L3.51259 8.41381C3.45905 8.71977 3.69449 9 4.00511 9H7.41001L6.35001 15H2.77011C2.52722 15 2.31946 15.1746 2.27759 15.4138L2.10259 16.4138C2.04905 16.7198 2.28449 17 2.59511 17H6.00001L5.39427 20.4126C5.3399 20.7189 5.57547 21 5.88657 21H6.87094C7.11337 21 7.32088 20.8261 7.36325 20.5874L8.00001 17H14L13.3943 20.4126C13.3399 20.7189 13.5755 21 13.8866 21H14.8709C15.1134 21 15.3209 20.8261 15.3632 20.5874L16 17H19.5799C19.8228 17 20.0306 16.8254 20.0724 16.5862L20.2474 15.5862C20.301 15.2802 20.0655 15 19.7549 15H16.35L16.6758 13.1558C16.7823 12.5529 16.3186 12 15.7063 12C15.2286 12 14.8199 12.3429 14.7368 12.8133L14.3504 15H8.35045L9.41045 9H13C13.5523 9 14 8.55228 14 8Z"></path><path fill="currentColor" d="M21.025 5V4C21.025 2.88 20.05 2 19 2C17.95 2 17 2.88 17 4V5C16.4477 5 16 5.44772 16 6V9C16 9.55228 16.4477 10 17 10H19H21C21.5523 10 22 9.55228 22 9V5.975C22 5.43652 21.5635 5 21.025 5ZM20 5H18V4C18 3.42857 18.4667 3 19 3C19.5333 3 20 3.42857 20 4V5Z"></path></svg><h3 id="ticket-name">${channel.name}</h3><div class="divider"></div><span class="topic">ticket ID: ${id}</span></div><div class="content-divider"></div><div id="frame"><div id="message-frame">`, (e) => {

                if(e) throw e;

            })

        })

        if(type === "minecraft"){
            channel.send("Please provide your minecraft in game name, and explain your problem!").then(() => {
                return console.log("Channel created!")
            })
        }
        if(type === "discord"){
            channel.send("Please explain your discord problem!").then(() => {
                console.log("Channel created!")
            })
        }

    })

}

module.exports = { createTicket, TicketChannel };