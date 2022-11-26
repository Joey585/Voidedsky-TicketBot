var socket = io();


socket.once("ticketLoad", (tickets) => {
    console.log(tickets)
   tickets.forEach((ticket) => {
       fetch(`http://localhost:3000/username?id=${ticket.creatorID}`)
           .then(data=>{return data.json()})
           .then(res=>{
               const ticketDiv = document.createElement("div")
               ticketDiv.classList.add("ticket");
               const ticketLink = document.createElement("a");
               ticketLink.href = `../../tickets/ticket-${res.username.toLowerCase()}-${ticket.id}.html`;
               ticketLink.target = `_blank`;
               ticketLink.innerHTML = `ticket-${res.username.toLowerCase()}-${ticket.id}`;
               const createdBy = document.createElement("p");
               createdBy.innerHTML = `Created by ${res.username}`;
               const ticketDate = document.createElement("p");
               ticketDate.innerHTML = `Date: ${moment.unix(ticket.timeCreated).format("dddd, MMMM Do YYYY, h:mm:ss a")}`
               const closed = document.createElement("p");

               fetch(`http://localhost:3000/username?id=${ticket.closeUserId}`)
                   .then(data=>{return data.json()})
                   .then(res => {closed.innerHTML = `Closed by ${res.username} for ${ticket.reason}`});

               ticketDiv.appendChild(ticketLink);
               ticketDiv.appendChild(createdBy);
               ticketDiv.appendChild(ticketDate);
               ticketDiv.appendChild(closed)
               const ticketFrame = document.getElementById("ticket-frame");
               ticketFrame.appendChild(ticketDiv)
           });
   });
});