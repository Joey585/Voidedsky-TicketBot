var socket = io();

socket.once("guildLoad", (guildInfo) => {

    document.title = guildInfo.name

    console.log(guildInfo)

    fetch(`http://localhost:3000/guildData?id=${guildInfo.id}`)
        .then(data => {return data.json()})
        .then(res => {
            document.getElementById("members").innerText = `You have ${res.members} members`;
            document.getElementById("tickets").innerText = `You made ${res.tickets} tickets`;
            document.getElementById("messages").innerText = `There have been ${res.messages} messages in tickets`;
        })

    document.getElementById("ticketLink").href = `/tickets?guildId=${guildInfo.id}`;

    const intro = document.getElementById("intro")
    intro.innerText = `Welcome ${guildInfo.name} to the panel!`

    const serverFrame = document.getElementById("server-frame")
})