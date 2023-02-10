var socket = io();


socket.once("ticketLoad", (tickets) => {
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
                       participants.innerHTML += `${res.tag}: ${person.messages}`
                   })

               });


               if(tickets[i].ticketObj.closed){
                   fetch(`http://localhost:3000/username?id=${tickets[i].ticketObj.closeUserId}`)
                       .then(data=>{return data.json()})
                       .then(res => {closed.innerHTML = `Closed by ${res.username} for ${tickets[i].reason}`});
               }


               ticketDiv.appendChild(ticketLink);
               ticketDiv.appendChild(createdBy);
               ticketDiv.appendChild(ticketDate);
               ticketDiv.appendChild(closed);
               participantsDiv.appendChild(participants);
               ticketDiv.appendChild(participantsDiv);
               const ticketFrame = document.getElementById("ticket-frame");
               ticketFrame.appendChild(ticketDiv)
           });
   }
});