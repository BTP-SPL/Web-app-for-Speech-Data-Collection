const fs = require('fs');
const readline = require('readline');
const { google } = require('googleapis');

var express = require("express");
var router = express.Router();
const User = require("../models/Users");

const KEYFILEPATH = 'routes/service-account.json';
const SCOPES = ['https://www.googleapis.com/auth/drive'];

const auth = new google.auth.GoogleAuth({
    keyFile: KEYFILEPATH,
    scopes: SCOPES,
});

async function createAndUploadFileText(auth, filename, text){
    const driveService = google.drive({version: 'v3', auth});
    
    let fileMetadata = {
        'name': filename,
        'parents': ['1bgoC4AXjozQmDmU_v8KRFzvTFBUhKUGE']
    };
    let media = {
        mimeType: 'text/plain',
        body: text
    };
    
    
    let response = await driveService.files.create( {
        resource: fileMetadata,
        media: media,
        fields: 'webViewLink'
    });
    console.log(response.data.webViewLink);
    
    // handle the response
    
    switch (response.status) {
        case 200:
            return response.data.webViewLink;
        default:
            console.log('Something went wrong');
            break;
    
     }
}

async function createAndUploadFileAudio(auth, filename, file){
    const driveService = google.drive({version: 'v3', auth});
    
    let fileMetadata = {
        'name': filename,
        'parents': ['1xsyndzEDlISiGHpjyUmWxvPkGwaVoJfE']
    };
    let media = {
        mimeType: 'audio/wav',
        body: file
    };
    
    
    let response = await driveService.files.create( {
        resource: fileMetadata,
        media: media,
        fields: 'webViewLink'
    });
    console.log(response.data.webViewLink)
    
    // handle the response
    
    switch (response.status) {
        case 200:
            return response.data.webViewLink;
        default:
            console.log('Something went wrong');
            break;
    
     }
}

async  function UploadData(audio_url,text_url,text,filename){
    User.findOneAndUpdate({text: text}, {audio_url: audio_url, text_url: text_url}, { upsert: true }, (err, doc) => {
        if (err) {
            console.log("nahi hua update!");
        }
    });
}
    

// // post request to add new user
// router.post("/add", (req, res) => {
router.post("/add", async (req, res) => {
    let fr_name=req.body.filename+req.body.index;
    let text_url=await createAndUploadFileText(auth, fr_name, req.body.text);
    console.log(text_url);
    let audio_url=await createAndUploadFileAudio(auth, fr_name, req.body.file);
    console.log(audio_url);
    console.log(req.body.text);
    await UploadData(audio_url,text_url,req.body.text,req.body.filename);

    res.json("Success");
});

// });

// post request to add new user
router.post("/addText", (req, res) => {
    // console.log(req.body);
    let text=req.body.chunks;
    let filename=req.body.filename;
    // consolelog length of chunks
    console.log(text.length);
    
    const newUser = new User({
        text: text,
        filename: filename,
        index: req.body.index,
        text_url: "",
        audio_url: ""
    });
    // push data to user collection
    newUser.save()

    .then(user => {
        // console.log(user);
        console.log("User added successfully");
        res.json(user);
    })
    .catch(err => console.log(err));
    
});

// get a random text entry from database where video_url is empty and send text to frontend
router.get("/getText", (req, res) => {
    User.find({audio_url: ""})
        .then(user => {
            // select a random entry from the database
            let randomIndex = Math.floor(Math.random() * user.length);
            // console.log(user[randomIndex]);
            const newRecord = {
                text: user[randomIndex].text,
                index: user[randomIndex].index,
                filename: user[randomIndex].filename
            }
            res.json(newRecord);
        })
        .catch(err => console.log(err));
});
module.exports = router;

