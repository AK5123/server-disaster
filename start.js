const express = require("express");
const app = express();
const bodyparser = require("body-parser");
const multer = require('multer')
const fs = require('fs');
const http = require('http');
const socketIO = require('socket.io');
var server = http.createServer(app);
var io = socketIO(server);
const axios = require('axios');

let request_cords = [];

const {
  uploads
} = require('./models/uploads')
const env = require('./connctions');

const {
  BlobServiceClient
} = require('@azure/storage-blob');


const CONNECT_STR = "DefaultEndpointsProtocol=https;AccountName=storageaccountmohana311;AccountKey=7RybWw7OS1uxINneCt0uuiGDqv9+A7aYQKifTwF2oXvtufwUol/u3ClCqO0djsk16SJPd0zUJJqiRojl9dAqWw==;EndpointSuffix=core.windows.net"
const blobServiceClient = BlobServiceClient.fromConnectionString(CONNECT_STR);
const containerClient = blobServiceClient.getContainerClient("uploads");

io.on('connection', function (socket) {


  app.get("/getCords", function (req, res) {
    clusterHandler(socket);
    res.send("future-forward")
  });

});

function clusterHandler(socket) {
  console.log(request_cords,2);
  if(request_cords.length==1){
    return;
  }
  axios.post('https://hop-me-py.azurewebsites.net/sendData', {
    lat_long: request_cords,
    n_teams: "2"
  }).then((res) => {
    console.log(res.data);
    if (socket != undefined) {
      socket.emit("newCluster", res.data);
      return;
    }
    io.sockets.emit("newCluster", res.data);
  }).catch((x) => console.log(x));
}


app.use(bodyparser.urlencoded({
  extended: true
}));




app.use(bodyparser.json());

var mongoClient = require("mongodb").MongoClient;

mongoClient.connect("mongodb://mohan007:JvBukBtPUlOR50iYsdBGWPbrzZOMElblYPYUNtWytgHCEjO2C7HFaSThC5OiU1IVLyUB9S6cRxF3gPLQTOCPkg==@mohan007.documents.azure.com:10255/?ssl=true", function (err, db) {
  console.log(db);

  var form = "<!DOCTYPE HTML><html><body>" +
    "<form method='post' action='/upload' enctype='multipart/form-data'>" +
    "<input type='file' name='upload'/>" +
    "<input type='submit' /></form>" +
    "</body></html>";

  app.use('/static', express.static("./public"));


  app.get('/', function (req, res) {
    res.writeHead(200, {
      'Content-Type': 'text/html'
    });
    res.end(form);
  });



  var storage = multer.diskStorage({
    destination: './uploads',
    filename: (req, file, cb) => {
      cb(null, file.originalname);
    }
  });

  var upload = multer({
    storage: storage
  });


  app.post("/upload", upload.single('upload'),
    async function (req, res) {

      console.log(req.file.filename)
      const blockBlobClient = containerClient.getBlockBlobClient(req.file.filename);
      fs.readFile("uploads/" + req.file.filename, async (err, data) => {
        const uploadBlobResponse = await blockBlobClient.upload(data, data.length);
        let link = "https://storageaccountmohana311.blob.core.windows.net/uploads/" + req.file.filename;
        let msgid = req.file.filename.replace(/\..+/g, "") || "unidentified";
        let from = req.file.filename.slice(10).replace(/\..+/g, "") || "unknown";
        var time = +new Date();

        io.sockets.emit("newImage", {
          msgid,
          time,
          data: link,
          from,
          type: "image",
          _id: time
        });

        db.collection("uploads").insertOne({
          msgid,
          time,
          data: link,
          from,
          type: "image",
          _id: time
        })
        return res.status(200).end("Uploaded image !");
      });
    });


  app.post("/addMessage", function (req, res) {
    console.log(db);
    console.log(req.body);
    let data = req.body;
    let lat = req.body.lat;
    let long = req.body.long;
    let payload = [lat, long];
    for (content of request_cords) {
      if (content[0] == payload[0] && content[1] == payload[1]) {
        return;
      }
    }
    request_cords.push(payload);
    db.collection("cords").findAndModify({
      _id: "56789"
    }, [
      ['_id', 'asc']
    ], {
      "request_cords": request_cords
    });
    clusterHandler();
    let msgid = data.msgid.replace(/\..+/g, "") || "unidentified";
    let from = data.msgid.slice(10).replace(/\..+/g, "") || "unknown";
    let mydata = data.data;
    var time = +new Date();

    io.sockets.emit("newMessage", {
      msgid,
      time,
      data: mydata,
      from,
      type: "text",
      _id: time
    });

    db.collection("uploads").insertOne({
      msgid,
      time,
      data: mydata,
      from,
      type: "text",
      _id: time
    })
    console.log(req.body);
    res.status(200).send("Recorded information");
  });


  app.get("/getLog", function (req, res) {
    var cursor = db.collection('uploads').find()
    cursor.toArray().then((data) => {
      res.json(data);
    })
  });



  app.listen(process.env.PORT || 3000);
  //db.close();
});