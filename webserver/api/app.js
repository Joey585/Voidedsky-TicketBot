const express = require("express");
const axios = require("axios")
const app = express()
const http = require('http');
const server = http.createServer(app);
const bitFieldCalculator = require("discord-bitfield-calculator");
const {token, callback} = require("../../config.json")
const {Guild} = require("../../schemas/guild");
const {client} = require("../../index");

app.use(express.static(__dirname));

app.get("/callback", async (req, res) => {
    const accessCode = req.query.code
    if(!accessCode) {
        return;
    }
    getAccessToken(accessCode).then((data) => {
        return res.redirect(`/home.html?accessToken=${data.access_token}&tokenType=${data.token_type}`);
    })
});

app.get("/allGuilds", (req, res) => {
    let accessGuilds = [];
    axios.get('https://discord.com/api/users/@me', {
        headers: {
            authorization: `${req.query.tokenType} ${req.query.accessToken}`,
        },
    }).then(response => {
        getGuilds(req.query.accessToken).then((guildData) => {
            guildData.forEach((guild) => {
                const permissions = bitFieldCalculator.permissions(guild.permissions);
                if(permissions.includes("BAN_MEMBERS")) {
                    accessGuilds.push(guild)
                }
            })
            return res.json({
                user: response.data,
                access_token: response.access_token,
                guilds: accessGuilds,
                accessToken: response.access_token
            })
        })
    }).catch((e) => {
        return res.sendStatus(401);
    })
});

app.get("/guild", (req, res) => {
    if(!req.query.id) {
        res.send("Bad Request")
    }
    getGuildInfo(req.query.id).then((guild) => {
        console.log("Received Guild info from discord");
        Guild.findOne({id: guild.id}, (err, guildDb) => {
            if(err) throw err;
                return res.json({
                    guildDb: guildDb,
                    guild: guild
                })
            })
    }).catch((e) => {
        console.log(e.response.data.message)
        if(e.response.data.message === "Unknown Guild") {
            return res.sendStatus(401);
        }
    })
});

// app.get("/tickets", (req, res) => {
//     if(!req.query.guildId){
//         return res.send("Bad Request");
//     }
//     Guild.findOne({id: req.query.guildId}, (err, guild) => {
//         res.redirect(`/guild?id=${req.query.guildId}`)
//         io.on("connection", (socket) => {
//             socket.emit("ticketLoad", guild.tickets);
//         });
//     });
// });

app.get("/username", async (req, res) => {
    if(!req.query.id) return res.send("Bad Request");
    const user = await client.users.fetch(req.query.id);
    return res.json({
        username: user.username,
        id: req.query.id,
        statusCode: 200,
        tag: user.tag,
        avatarLink: user.avatarURL()
    });
});

app.get("/guildData", async (req, res) => {
    if(!req.query.id) return res.send("Bad Request");
    const data = await getGuildData(req.query.id);
    return res.json(data);
});

app.get("/guildChannels", async (req, res) => {
   if(!req.query.id) return res.send("Bad Request");
   const data = await getGuildChannels(req.query.id);
   return res.json(data);
});

const getGuilds = (accessToken) => new Promise((resolve, reject) => {
    axios.get("https://discord.com/api/users/@me/guilds", {
        headers: {
            authorization: `Bearer ${accessToken}`
        }
    }).then((res) => {
        resolve(res.data)
    }).catch((reject))
})

const getGuildInfo = (guildID) => new Promise((resolve, reject) => {
    axios.get(`https://discord.com/api/guilds/${guildID}`, {
        headers: {
            authorization: `Bot ${token}`
        }
    }).then((res) => {
        resolve(res.data)
    }).catch((reject))
});

const getGuildChannels = (guildID) => new Promise((resolve, reject) => {
   axios.get(`https://discord.com/api/guilds/${guildID}/channels`, {
       headers: {
           authorization: `Bot ${token}`
       }
   }).then((res) => {
       resolve(res.data)
   }).catch((reject))
});

const getGuildData = (guildID) => new Promise((resolve, reject) => {
    Guild.findOne({id: guildID}, async (err, guild) => {
        if(err) reject(err);

        const tickets = guild.tickets.length;
        let messages = 0;

        guild.tickets.forEach((ticket) => {
            ticket.participants.forEach((person) => {
                messages += person.messages
            });
        });

        const guildDiscord = await client.guilds.fetch(guildID);

        resolve({tickets: tickets, members: guildDiscord.memberCount, messages: messages});
    })
});

const getAccessToken = (accessCode) => new Promise((resolve, reject) => {
    let data = `client_id=1001010197009027182&client_secret=oTvGKMA3Aa-V900Abpov_WLe9nIVAsIu&grant_type=authorization_code&code=${accessCode}&redirect_uri=${callback}&scope=identity`;
    let headers = {
        'Content-Type': 'application/x-www-form-urlencoded',
    }

    axios.post('https://discord.com/api/oauth2/token', data, {
        headers: { headers }
    }).then((r) => {
        console.log(r.data)
        resolve(r.data)
    }).catch(() => {
        reject("Unable to get access token!")
    })
});




server.listen(50000, () => {console.log("API on.")});
server.on("error", (err) => {
    console.log(err)
})
