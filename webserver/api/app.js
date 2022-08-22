const express = require("express");
const path = require('path');
const axios = require("axios")


const app = express()
const htmlPath = path.join(__dirname, "api")

app.use(express.static("."))

app.get("/callback", async (req, res) => {
    const accessCode = req.query.code

    console.log(accessCode)
    if(!accessCode) {
        return;
    }


    async function getTokenDiscord() {

        if(!accessCode) {
            return;
        }

        const params = new URLSearchParams()
        params.append('client_id', "1001010197009027182")
        params.append('client_secret', "oTvGKMA3Aa-V900Abpov_WLe9nIVAsIu")
        params.append('grant_type', 'authorization_code')
        params.append('code', accessCode)
        params.append('redirect_uri', "http://localhost:3000")
        params.append('scope', 'identify')

        let data = `client_id=1001010197009027182&client_secret=oTvGKMA3Aa-V900Abpov_WLe9nIVAsIu&grant_type=authorization_code&code=${accessCode}&redirect_uri=http://localhost:3000/callback&scope=identity`;
        let headers = {
            'Content-Type': 'application/x-www-form-urlencoded',
        }

        await axios.post('https://discord.com/api/oauth2/token', data, {
            headers: {
                headers
            }
        }).then((r) => {
            return r.data
        })
            .catch(e => console.log(e))
    }

    const accessTokenData = await getTokenDiscord();

    console.log(accessTokenData)

    // axios.get('https://discord.com/api/users/@me', {
    //     headers: {
    //         authorization: `${await getTokenDiscord().token_type} ${await getTokenDiscord().access_token}`,
    //     },
    // })
    //     .then(response => {
    //         const {username, discriminator} = response;
    //         console.log(response)
    //         res.redirect(`/home.html?id=${username}`)
    //
    //     })
    //     .catch(console.error);

});


app.listen(3000, () => {console.log("API on.")})