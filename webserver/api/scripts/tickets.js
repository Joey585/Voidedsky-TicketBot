var socket = io();


socket.once("ticketLoad", (tickets) => {
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
               ticketDiv.appendChild(ticketLink);
               const ticketFrame = document.getElementById("ticket-frame");
               ticketFrame.appendChild(ticketDiv)
           });
   });
});