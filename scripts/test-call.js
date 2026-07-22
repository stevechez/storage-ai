fetch(
"http://localhost:3000/api/events/call",
{
method:"POST",

headers:{
"Content-Type":"application/json"
},

body:JSON.stringify({

facilityId:
"11111111-1111-1111-1111-111111111111",

caller:
"+15551234567",

transcript:
"Customer wants a 10x10 unit",

outcome:
"interested"

})

}
)
.then(r=>r.json())
.then(console.log);
