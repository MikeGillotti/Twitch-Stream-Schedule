require('dotenv').config();
const { Console } = require('console');
const request = require('request');
const express = require('express');
const app=express();



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

var accessToken = '';
const followerList = [];
getToken(process.env.GET_TOKEN, (res) => {
    accessToken = res.body.access_token;
    return accessToken;
})
const getFollow = () => {
    const followOptions = {
        url: process.env.GET_FOLLOWING,
        method: 'GET',
        headers: {
            'Client-ID': process.env.CLIENT_ID,
            'Authorization': 'Bearer ' + accessToken
        }
    };
    request.get(followOptions, (err, res, body) => {
        if (err) {
            return console.log(err);
        }
        const obj = JSON.parse(body);
        for (let x in obj.data) {
            followerList[x] = obj.data[x].to_id;
        }
        return followerList;
    });
};

const streamSchedule = [];
const getSchedule = (schedule) => {
    const scheduleOptions = {
        url: schedule,
        method: 'GET',
        headers: {
            'Client-ID': process.env.CLIENT_ID,
            'Authorization': 'Bearer ' + accessToken
        }
    };

    request.get(scheduleOptions, (err, res, body) => {
        if (err) {
        }
        const obj2 = JSON.parse(body);
        if (obj2.error == null) {
           
            for (let y in obj2.data.segments) {
                const d = new Date(obj2.data.segments[y].start_time);
                streamSchedule.push([obj2.data.segments[y].start_time, obj2.data.broadcaster_name]);
            }
        }
        return streamSchedule;
    });
};
setTimeout(() => {
    getFollow(() => {
    });
}, 500)
setTimeout(() => {
    for (let x in followerList) {
        getSchedule(process.env.GET_SCHEDULE + "?broadcaster_id=" + followerList[x], () => {
        })
    }
}, 1000)

setTimeout(() => {
    streamSchedule.sort();

    
}, 1500)


app.set("view engine", "ejs")


app.get('/',  (request, response) => {

    response.render('index', {s: streamSchedule})

});



app.listen(process.env.PORT || 3000);