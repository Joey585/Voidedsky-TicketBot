const express = require("express");
const path = require('path');
const axios = require("axios")
const app = express()
const http = require('http');
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);

const htmlPath = path.join(__dirname, "api")

app.use(express.static("."))

    app.get("/callback", async (req, res) => {
        const accessCode = req.query.code

        console.log(accessCode)
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
                        res.redirect(`/home.html?id=${response.data.id}`)
                        io.on("connection", async (socket) => {
                            socket.emit("auth", {
                                user: response.data,
                                access_token: data.access_token,
                                guilds: guildData
                            })
                        })
                    })


                })
                .catch(console.error);
        }).catch((e) => {
            console.log(e)
        })
})

const getGuilds = (accessToken) => new Promise((resolve, reject) => {
    axios.get("https://discord.com/api/users/@me/guilds", {
        headers: {
            authorization: `Bearer ${accessToken}`
        }
    }).then((res) => {
        resolve(res.data)
    }).catch((reject))
})





server.listen(3000, () => {console.log("API on.")})