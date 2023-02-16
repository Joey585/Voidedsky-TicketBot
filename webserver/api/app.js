const express = require("express");
const axios = require("axios")
const app = express()
const http = require('http');
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);
const bitFieldCalculator = require("discord-bitfield-calculator");
const {token} = require("../../config.json")
const {Guild} = require("../../schemas/guild");
const {client} = require("../../index");


app.use(express.static(__dirname));


app.get("/callback", async (req, res) => {
        const accessCode = req.query.code

        let accessGuilds = []

        if(!accessCode) {
            return;
        }


        const getAccessToken = new Promise((resolve, reject) => {

            if(!accessCode) {
                return;
            }

            let data = `client_id=1001010197009027182&client_secret=oTvGKMA3Aa-V900Abpov_WLe9nIVAsIu&grant_type=authorization_code&code=${accessCode}&redirect_uri=http://localhost:3000/callback&scope=identity`;
            let headers = {
                'Content-Type': 'application/x-www-form-urlencoded',
            }

            axios.post('https://discord.com/api/oauth2/token', data, {
                headers: {
                    headers
                }
            }).then((r) => {
                resolve(r.data)
            })
                .catch(() => {
                    reject("Unable to get access token!")
                })
        });



        getAccessToken.then((data) => {
            axios.get('https://discord.com/api/users/@me', {
                headers: {
                    authorization: `${data.token_type} ${data.access_token}`,
                },
            })
                .then(response => {
                    console.log("Successful authentication made.")
                    getGuilds(data.access_token).then((guildData) => {
                        guildData.forEach((guild) => {
                            const permissions = bitFieldCalculator.permissions(guild.permissions);
                            if(permissions.includes("BAN_MEMBERS")){
                                accessGuilds.push(guild)
                            }
                        })

                        res.redirect(`/home.html`)
                        io.on("connection", async (socket) => {
                            socket.emit("auth", {
                                user: response.data,
                                access_token: data.access_token,
                                guilds: accessGuilds
                            })
                        })
                    })


                })
                .catch(console.error);
        }).catch((e) => {
            console.log(e)
        })
})


app.get("/guild", (req, res) => {
    if(!req.query.id){
        res.send("Bad Request")
    }
    console.log("Request made with " + req.query.id);
    getGuildInfo(req.query.id).then((guild) => {
        console.log("Received Guild info from discord");
        Guild.findOne({id: guild.id}, (err, guildDb) => {
            console.log(`Received guild from database ${guildDb}`)
            if(err) throw err;
            res.redirect("/guilds/guild.html");
            io.on("connection", (socket) => {
                console.log("Socket connected.")
                socket.emit("guildLoad", guild);
                socket.emit("ticketLoad", guildDb.tickets);
                console.log("Emitted all socket events");
            })
        });
        console.log("Redirected")
    }).catch((e) => {

        console.log(e)
        if(e.response.status === 404){
            res.redirect("/missing.html")
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
    return res.json({username: user.username, id: req.query.id, statusCode: 200, tag: user.tag, avatarLink: user.avatarURL()});
});

app.get("/guildData", async (req, res) => {
    if(!req.query.id) return res.send("Bad Request");
    const data = await getGuildData(req.query.id);
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






server.listen(3000, () => {console.log("API on.")});
server.on("error", (err) => {
    console.log(err)
})