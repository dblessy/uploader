const AWS = require('aws-sdk');
const fs = require('fs');
const express =require('express');
require('dotenv').config();
const upload = require("../common");

let app=new express();

const s3 = new AWS.S3({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
});

function uploadFile(file) {
    const fileStream = fs.createReadStream(file.path);
    const uploadParams = {
        Bucket: process.env.AWS_BUCKET_NAME,
        Body: fileStream,
        Key: file.filename,
    };
    return s3.upload(uploadParams).promise(); // this will upload file to S3
}

app.post('/upload', upload.single("file"), async (req, res) => {
    console.log(req.file);
    // uploading to AWS S3
    const result = await uploadFile(req.file);
    console.log("S3 response", result);
    res.send({
        status: "success",
        message: "File uploaded successfully",
        data: req.file,
    });

});

let server = app.listen(8081, function () {
    let host = server.address().address
    let port = server.address().port

    console.log("Example app listening at http://%s:%s", host, port)
})