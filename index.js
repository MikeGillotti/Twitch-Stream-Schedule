require('dotenv').config();
const { Console } = require('console');
const request = require('request');
const express = require('express');
const bodyParser = require('body-parser');
const multer=require('multer');
const { resolve } = require('path');
const app=express();
const upload=multer();

let streamSchedule = [];
var accessToken = '';

app.use("/views/css", express.static(__dirname + "/views/css"));

  app.use(express.static("views"))
  
  app.set("view engine", "ejs")

  app.set('views', './views');

  


app.use(bodyParser.json());

app.use(bodyParser.urlencoded({extended:true}));
app.use(upload.array());

const getToken = (url, callback) => {
    const options = {
        url: process.env.GET_TOKEN,
        json: true,
        body: {
            client_id: process.env.CLIENT_ID,
            client_secret: process.env.CLIENT_SECRET,
            grant_type: 'client_credentials'
        }
    };
    request.post(options, (err, res, body) => {
        callback(res);
    });
};
getToken(process.env.GET_TOKEN, (res) => {
    accessToken = res.body.access_token;
    return accessToken;
})


const getUser = async (x) => {
    let nameID;

    const userOptions = {
        url: x,
        method: 'GET',
        headers: {
            'Client-ID': process.env.CLIENT_ID,
            'Authorization': 'Bearer ' + accessToken
        }
    };
    return new Promise(function (resolve, reject) {
    
    request.get(userOptions,  async(err, res, body) =>  {
        const obj3 =   JSON.parse(body);
        for(x in obj3.data){

            nameID=  await obj3.data[x].id;
        }

          
           resolve(nameID);
          });

    })

};



const getFollow = async (x) => {
    let followerList = [];


    const followOptions = {
        url: 'https://api.twitch.tv/helix/users/follows?from_id='+x,
        method: 'GET',
        headers: {
            'Client-ID': process.env.CLIENT_ID,
            'Authorization': 'Bearer ' + accessToken
        }
    };

    return new Promise(function (resolve, reject) {

    request.get(followOptions, async (err, res, body) => {
        const obj = JSON.parse(body);
        for (let x in obj.data) {
            followerList[x] =  obj.data[x].to_id;
        }
        resolve(followerList);
    });

});


};


      streamSchedule=[];

const getSchedule = async (f) => {

    
    
    return new Promise(function (resolve, reject) {
    for (let x in f) {
        
    

 const scheduleOptions = {
        url: process.env.GET_SCHEDULE + "?broadcaster_id=" + f[x],
        method: 'GET',
        headers: {
            'Client-ID': process.env.CLIENT_ID,
            'Authorization': 'Bearer ' + accessToken
        }
    };


    request.get(scheduleOptions, async (err, res, body) => {
        const obj2 = await JSON.parse(body);
        if (obj2.error == null) {
           
            for (let y in obj2.data.segments) {
                const day= new Date(obj2.data.segments[y].start_time).getDate();
                const d = new Date(obj2.data.segments[y].start_time);
                streamSchedule.push([obj2.data.segments[y].start_time, obj2.data.broadcaster_name, day])
            }
        }
         resolve(streamSchedule.sort());
    });
}

});



    
};




app.get('/favicon.ico', (request,response)=>{
    return 'your faveicon'
   })



app.get('/',  (request, response) => {

    const name_id=request.query.name;

    nameTwitch=name_id;

    streamSchedule=[];

   
    followerList = [];
   
    
    const urlUser='https://api.twitch.tv/helix/users?login='+name_id;

     getUser(urlUser)
     .then((Resolved)=>{
        getFollow(Resolved)
        .then((Resolved)=>{
            getSchedule(Resolved)
            .then((Resolved)=>{
               
               setTimeout(()=>{
                response.render('index', 
                {
                    s: Resolved,
                    n: name_id
                     
                });

                }, 1000)
            })
        

        
        })})
            



})


app.listen(process.env.PORT || 3000);