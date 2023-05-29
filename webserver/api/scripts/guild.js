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
                        fetch(`/username?id=${res.guildDb.tickets[i].ticketObj.closeUserId}`)
                            .then(data => {
                                return data.json()
                            })
                            .then(closeUser => {
                                closed.innerHTML = `Closed by ${closeUser.username} for <code>${res.guildDb.tickets[i].ticketObj.reason}</code>`
                            });
                    }

                    // const discordSettingChannels = document.getElementsByClassName("discordChannel");
                    // let channels = ["test", "hello", "logs", "staff-chat"];
                    //
                    // // TODO: Use dropdowns dumbass
                    //
                    // for(let i= 0; i < discordSettingChannels.length; i++){
                    //     discordSettingChannels[i].addEventListener("click", () => {
                    //         const allChannels = document.createElement("div");
                    //         for (const channel of channels){
                    //             const channelChild = document.createElement("p");
                    //             channelChild.innerText = `#${channel}`;
                    //             channelChild.className = "discordChannel";
                    //             allChannels.appendChild(channelChild);
                    //         }
                    //     });
                    // }


                    ticketDiv.appendChild(ticketLink);
                    ticketDiv.appendChild(createdBy);
                    ticketDiv.appendChild(ticketDate);
                    ticketDiv.appendChild(closed);
                    participantsDiv.appendChild(participants);
                    ticketDiv.appendChild(participantsDiv);
                    ticketFrame.appendChild(ticketDiv);


                });
        }

        console.log("Attempting to load channels")
        fetch(`/guildChannels?id=${params.get("id")}`)
            .then(data => {return data.json()})
            .then((res) => {
                const channelList = res.filter(channel => channel.type === 0);
                console.log(channelList);
                for(let c = 0; c < channelList.length; c++){
                    const channelLink = document.createElement("a");
                    const dropdown = document.getElementById("logChannels");
                    console.log(channelList[c].name)
                    channelLink.innerText = `${channelList[c].name}`;
                    channelLink.className = 'channel';
                    channelLink.id = channelList[c].id;
                    channelLink.addEventListener("click", (event) => handleChannelClick(event));
                    dropdown.appendChild(channelLink);
                }
            });

        status("doneLoading");
    }).catch((e) => {
        // return location.assign("/missing.html");
    })

document.getElementById("ticketLink").addEventListener("click", () => {
    status("tickets");
});

document.getElementById("homeLink").addEventListener("click", () => {
    status("home")
});

document.getElementById("settingsLink").addEventListener("click", () => {
   status("settings");
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
        document.getElementById("settings-frame").style.display = "none";
        document.getElementById("slice").style.display = "block";
        document.getElementById("loading").style.display = "none";
    } else if(current === "tickets") {
        document.getElementById("settings-frame").style.display = "none";
        document.getElementById("lower-info").style.display = "none";
        document.getElementById("tickets-frame").style.display = "flex";
    } else if(current === "home") {
        document.getElementById("settings-frame").style.display = "none";
        document.getElementById("lower-info").style.display = "block";
        document.getElementById("tickets-frame").style.display = "none";
    } else if(current === "settings"){
        document.getElementById("settings-frame").style.display = "block";
        document.getElementById("lower-info").style.display = "none";
        document.getElementById("tickets-frame").style.display = "none";
    }
}

function showChannels(){
    document.getElementById("logChannels").classList.toggle("show");
}

function filterChannels(){
    let input, filter, ul, li, a, i;
    input = document.getElementById("logChannelInput");
    filter = input.value.toLowerCase();
    const div = document.getElementById("logChannels");
    a = div.getElementsByTagName("a");
    for (i = 0; i < a.length; i++){
        let txtValue = a[i].textContent || a[i].innerText;
        if(txtValue.toLowerCase().indexOf(filter) > -1){
            a[i].style.display = "";
        } else {
            a[i].style.display = "none";
        }
    }

}

async function handleChannelClick(event) {
    switch (event.target.parentNode.id) {
        case "logChannels":
            console.log("Channel clicked")
            const result = await fetch(`/logChannel?channelId=${event.target.id}&guildId=${params.get("id")}`, {method: "POST"});
            const jsonData = await result.json();
            console.log(jsonData);
            if(jsonData.status === 200) {
                event.target.className = "selected"
            }
    }
}