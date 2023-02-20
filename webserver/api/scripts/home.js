const params = new URL(document.location).searchParams;
const accessToken = params.get("accessToken");
const tokenType = params.get("tokenType");
localStorage.setItem("accessToken", accessToken);
localStorage.setItem("tokenType", tokenType);


fetch(`/allGuilds?accessToken=${accessToken}&tokenType=${tokenType}`)
    .then(data=>{return data.json()})
    .then(res=>{
        document.getElementById("loading").style.display = "none";
        const title = document.getElementById("start_title");
        title.innerHTML = `Servers for ${res.user.username}`
        document.title = `${res.user.username} Ticket Dashboard`
        res.guilds.forEach((guild) => {
            createGuild(guild)
        })
    }).catch(() => {
        return location.assign("/");
    })

function createGuild(guild){
    const guildFrame = document.getElementById("server-frame")

    const guildClick = document.createElement("a")
    guildClick.style.textDecoration = "none";
    guildClick.href = `/guilds/guild.html?id=${guild.id}`
    guildClick.style.textDecoration = "none"
    guildClick.style.color = "black"

    const guildElement = document.createElement("div")
    guildElement.classList.add("server-container");
    guildElement.style.display = "flex";
    guildElement.style.width = "200px";


    const guildImage = document.createElement("img")
    guildImage.classList.add("sever-icon")
    guildImage.alt = `${guild.name}`
    guildImage.style.width = "60px"
    guildImage.style.height = "60px"
    guildImage.style.borderRadius = "50%"
    guildImage.style.padding = "10px"

    if(guild.icon){
        guildImage.src = `https://cdn.discordapp.com/icons/${guild.id}/${guild.icon}.png?size=4096`
    } else {
        guildImage.src = "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSytEr7dCuoi6HW9G5_RJ8Dya_ccQyHm8VWed35lFgKRzvzlp0f&s"
    }

    const guildName = document.createElement("span")
    guildName.innerText = `${guild.name}`
    guildName.classList.add("server-name")
    guildName.style.marginTop = "30px"
    guildName.style.fontWeight = "bold"

    guildElement.appendChild(guildImage)
    guildElement.appendChild(guildName)
    guildClick.appendChild(guildElement)
    guildFrame.appendChild(guildClick)
}