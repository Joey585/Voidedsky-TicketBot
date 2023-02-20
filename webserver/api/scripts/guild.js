const params = new URL(document.location).searchParams;

fetch(`/guild?id=${params.get("id")}`)
    .then(data=>{return data.json()})
    .then(res=> {
        status("loading")
        document.title = res.guild.name
        fetch(`/guildData?id=${res.guild.id}`)
            .then(data => {
                return data.json()
            })
            .then(res => {
                console.log("Got small guild data");
                document.getElementById("members").innerText = `You have ${res.members} members`;
                document.getElementById("tickets").innerText = `You made ${res.tickets} tickets`;
                document.getElementById("messages").innerText = `There have been ${res.messages} messages in tickets`;
            })

        const intro = document.getElementById("intro")
        intro.innerText = `Welcome ${res.guild.name} to the panel!`

        const ticketFrame = document.getElementById("tickets-frame");
        for (let i = 0; i < res.guildDb.tickets.length; i++) {
            fetch(`/username?id=${res.guildDb.tickets[i].ticketObj.creatorID}`)
                .then(data => {
                    return data.json()
                })
                .then(user => {
                    const ticketDiv = document.createElement("div")
                    ticketDiv.classList.add("ticket");
                    const ticketLink = document.createElement("a");
                    ticketLink.href = `../../tickets/ticket-${user.username.toLowerCase()}-${res.guildDb.tickets[i].ticketObj.id}.html`;
                    ticketLink.target = `_blank`;
                    ticketLink.innerHTML = `ticket-${user.username.toLowerCase()}-${res.guildDb.tickets[i].ticketObj.id}`;
                    const createdBy = document.createElement("p");
                    createdBy.innerHTML = `Created by ${user.username}`;
                    const ticketDate = document.createElement("p");
                    ticketDate.innerHTML = `Date: ${moment.unix(res.guildDb.tickets[i].ticketObj.timeCreated).format("dddd, MMMM Do YYYY, h:mm:ss a")}`
                    const closed = document.createElement("p");
                    const participantsDiv = document.createElement("div");
                    participantsDiv.className = "hover-stats";
                    participantsDiv.innerText = "Hover over me to see message stats";
                    const participants = document.createElement("span");
                    participants.className = "stats";


                    res.guildDb.tickets[i].participants.forEach((person) => {
                        fetch(`/username?id=${person.userID}`)
                            .then(data => {
                                return data.json()
                            }).then((res) => {
                            participants.innerHTML += `${res.tag}: ${person.messages}<br>`
                        })

                    });


                    if(res.guildDb.tickets[i].ticketObj.closed) {
                        fetch(`/username?id=${tickets[i].ticketObj.closeUserId}`)
                            .then(data => {
                                return data.json()
                            })
                            .then(res => {
                                closed.innerHTML = `Closed by ${res.username} for <code>${res.guildDb.tickets[i].ticketObj.reason}</code>`
                            });
                    }


                    ticketDiv.appendChild(ticketLink);
                    ticketDiv.appendChild(createdBy);
                    ticketDiv.appendChild(ticketDate);
                    ticketDiv.appendChild(closed);
                    participantsDiv.appendChild(participants);
                    ticketDiv.appendChild(participantsDiv);
                    ticketFrame.appendChild(ticketDiv);

                    status("doneLoading");
                });
        }
    }).catch((e) => {
        return location.assign("/missing.html")
    })

document.getElementById("ticketLink").addEventListener("click", () => {
    status("tickets");
});

document.getElementById("homeLink").addEventListener("click", () => {
    status("home")
});

document.getElementById("backLink").addEventListener("click", () => {
   location.assign(`/home.html?accessToken=${localStorage.getItem("accessToken")}&tokenType=${localStorage.getItem("tokenType")}`)
});

function status(current) {
    if(current === "loading") {
        console.log("Loading...")
        document.getElementById("server-frame").style.display = "none";
        document.getElementById("lower-info").style.display = "none";
        document.getElementById("tickets-frame").style.display = "none";
        document.getElementById("permissions-frame").style.display = "none";
        document.getElementById("settings-frame").style.display = "none";
        document.getElementById("slice").style.display = "none";
        document.getElementById("loading").style.display = "block";
    } else if(current === "doneLoading") {
        console.log("Finished!")
        document.getElementById("server-frame").style.display = "block";
        document.getElementById("lower-info").style.display = "block";
        document.getElementById("tickets-frame").style.display = "none";
        document.getElementById("permissions-frame").style.display = "block";
        document.getElementById("settings-frame").style.display = "block";
        document.getElementById("slice").style.display = "block";
        document.getElementById("loading").style.display = "none";
    } else if(current === "tickets") {
        document.getElementById("lower-info").style.display = "none";
        document.getElementById("tickets-frame").style.display = "flex";
    } else if(current === "home") {
        document.getElementById("lower-info").style.display = "block";
        document.getElementById("tickets-frame").style.display = "none";
    }
}