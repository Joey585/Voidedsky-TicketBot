var socket = io();

socket.once("guildLoad", (guildInfo) => {

    document.title = guildInfo.name

    document.getElementById("ticketLink").href = `/tickets?guildId=${guildInfo.id}`;

    const serverIcon = document.createElement("img")
    serverIcon.src = `https://cdn.discordapp.com/icons/${guildInfo.id}/${guildInfo.icon}.png?size=64`
    serverIcon.alt = guildInfo.name

    const serverName = document.createElement("span")
    serverName.innerHTML = `${guildInfo.name}`
    serverName.className = "server-name"

    const serverFrame = document.getElementById("server-frame")
    serverFrame.appendChild(serverIcon)
    serverFrame.appendChild(serverName)
})