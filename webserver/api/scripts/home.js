var socket = io();

socket.once("auth", (data) => {
    const title = document.getElementById("start_title");
    title.innerHTML = `Servers for ${data.user.username}`
    document.title = `${data.user.username} Ticket Dashboard`

    localStorage.setItem("accessToken", data.access_token)

    const user = data.user;

    console.log(user)

    data.guilds.forEach((guild) => {
        createGuild(guild)
    })
})




function createGuild(guild){
    const guildFrame = document.getElementById("server-frame")

    const guildClick = document.createElement("a")
    guildClick.style.textDecoration = "none";
    guildClick.href = ``

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
    guildFrame.appendChild(guildElement)
}