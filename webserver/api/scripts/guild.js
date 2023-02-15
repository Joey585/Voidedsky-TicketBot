var socket = io();

socket.once("guildLoad", (guildInfo) => {
    status("loading")
    document.title = guildInfo.name

    console.log(guildInfo)

    fetch(`http://localhost:3000/guildData?id=${guildInfo.id}`)
        .then(data => {return data.json()})
        .then(res => {
            document.getElementById("members").innerText = `You have ${res.members} members`;
            document.getElementById("tickets").innerText = `You made ${res.tickets} tickets`;
            document.getElementById("messages").innerText = `There have been ${res.messages} messages in tickets`;
        })

    window.onbeforeunload = function(e) {
        console.log("reloaded")
        location.assign(`/guild?id=${guildInfo.id}`)
    }

    const intro = document.getElementById("intro")
    intro.innerText = `Welcome ${guildInfo.name} to the panel!`
});

socket.once("ticketLoad", (tickets) => {
    const ticketFrame = document.getElementById("tickets-frame");

    for(let i=0; i < tickets.length; i++) {
        fetch(`http://localhost:3000/username?id=${tickets[i].ticketObj.creatorID}`)
            .then(data=>{return data.json()})
            .then(res=>{
                const ticketDiv = document.createElement("div")
                ticketDiv.classList.add("ticket");
                const ticketLink = document.createElement("a");
                ticketLink.href = `../../tickets/ticket-${res.username.toLowerCase()}-${tickets[i].ticketObj.id}.html`;
                ticketLink.target = `_blank`;
                ticketLink.innerHTML = `ticket-${res.username.toLowerCase()}-${tickets[i].ticketObj.id}`;
                const createdBy = document.createElement("p");
                createdBy.innerHTML = `Created by ${res.username}`;
                const ticketDate = document.createElement("p");
                ticketDate.innerHTML = `Date: ${moment.unix(tickets[i].ticketObj.timeCreated).format("dddd, MMMM Do YYYY, h:mm:ss a")}`
                const closed = document.createElement("p");
                const participantsDiv = document.createElement("div");
                participantsDiv.className = "hover-stats";
                participantsDiv.innerText = "Hover over me to see message stats";
                const participants = document.createElement("span");
                participants.className = "stats";


                tickets[i].participants.forEach((person) => {
                    fetch(`http://localhost:3000/username?id=${person.userID}`)
                        .then(data=>{return data.json()}).then((res) => {
                        participants.innerHTML += `${res.tag}: ${person.messages}<br>`
                    })

                });


                if(tickets[i].ticketObj.closed){
                    fetch(`http://localhost:3000/username?id=${tickets[i].ticketObj.closeUserId}`)
                        .then(data=>{return data.json()})
                        .then(res => {closed.innerHTML = `Closed by ${res.username} for <code>${tickets[i].ticketObj.reason}</code>`});
                }


                ticketDiv.appendChild(ticketLink);
                ticketDiv.appendChild(createdBy);
                ticketDiv.appendChild(ticketDate);
                ticketDiv.appendChild(closed);
                participantsDiv.appendChild(participants);
                ticketDiv.appendChild(participantsDiv);
                ticketFrame.appendChild(ticketDiv);
                status("doneLoading");
                // hide("home")
            });
    }
});

document.getElementById("ticketLink").addEventListener("click", () => {
    status("tickets");
});

document.getElementById("homeLink").addEventListener("click", () => {
    status("home")
});

function status(current){
    if(current === "loading"){
        console.log("Loading...")
        document.getElementById("server-frame").style.display = "none";
        document.getElementById("lower-info").style.display = "none";
        document.getElementById("tickets-frame").style.display = "none";
        document.getElementById("permissions-frame").style.display = "none";
        document.getElementById("settings-frame").style.display = "none";
        document.getElementById("slice").style.display = "none";
        document.getElementById("loading").style.display = "block";
    }
    else if(current === "doneLoading"){
        console.log("Finished!")
        document.getElementById("server-frame").style.display = "block";
        document.getElementById("lower-info").style.display = "block";
        document.getElementById("tickets-frame").style.display = "none";
        document.getElementById("permissions-frame").style.display = "block";
        document.getElementById("settings-frame").style.display = "block";
        document.getElementById("slice").style.display = "block";
        document.getElementById("loading").style.display = "none";
    }
    else if(current === "tickets"){
        document.getElementById("lower-info").style.display = "none";
        document.getElementById("tickets-frame").style.display = "flex";
    }
    else if(current === "home"){
        document.getElementById("lower-info").style.display = "block";
        document.getElementById("tickets-frame").style.display = "none";
    }
}