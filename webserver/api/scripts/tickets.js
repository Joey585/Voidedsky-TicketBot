var socket = io();

socket.once("ticketLoad", (tickets) => {
   console.log(tickets.size);
   for (let [key, value] of tickets){
       const ticketDiv = document.createElement("div")
       ticketDiv.classList.add("ticket");
       const ticketLink = document.createElement("a");
       ticketLink.href = `../../tickets/${key}.html`;
       ticketLink.target = `_blank`;
       ticketLink.innerHTML = value;
       const createdBy = document.createElement("p");

       fetch(`https://localhost:3000/username?id=${value.creatorID}`).then(r => console.log(r));


       ticketDiv.appendChild(ticketLink);
   }
});