const AWS = require('aws-sdk');
const express =require('express');
const multer  = require('multer');
const multers3 = require('multer-s3');
const mysql=require('mysql');
const https = require('https');
const cors=require('cors');
const bodyParser = require('body-parser');
require('dotenv').config();

let app=new express();
app.use(cors());

const s3 = new AWS.S3({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region:'us-west-1'
});


const uploadS3 = multer({
    storage: multers3({
        s3: s3,
       // acl: 'public-read',
        bucket:process.env.AWS_BUCKET_NAME,
        metadata: (req, file, cb) => {
            cb(null, {fieldName: file.fieldname})
        },
        key: (req, file, cb) => {
            cb(null, req.auth.email+'-'+file.originalname)
        },
        limits:{
            fileSize: 10000000
        },

    })
});

let pool=mysql.createPool({
    host:'$hostname',
    user:"$username",
    password:"$password",
    port:3306,
    database: "$dbname"
});

const checkExists = async (req, res, next) => {
    let params={
        Bucket:process.env.AWS_BUCKET_NAME,
        Key:req.params['id'],
    };
    let str=req.params['id'];
    let cmpemail=str.split('-');
    if(cmpemail[0]==req.auth.email){
        console.log("valid user");
        try {
            await s3.headObject(params).promise()
            console.log("File Found in S3")
            next();
        }
        catch(err){
            console.log("File not Found ERROR : " + err.code)
            return res.sendStatus(404);
        }
    }
    else{
        console.log("invalid user");
        return res.sendStatus(401);
    }
}

const gAuth = (req, res, next) => {
    if (!req.headers.authorization) {
        return res.status(403).json({ error: 'Missing Authorization Header' });
    }

    https.get("https://www.googleapis.com/oauth2/v3/tokeninfo?id_token=" + req.headers.authorization, resp => {
        let data = '';

        resp.on('data', (chunk) => {
            data += chunk;
        });

        resp.on('end', () => {
            let d = JSON.parse(data);
            if (d["error_description"]) {
                return res.status(403).json({error: d["error_description"]})
            }
            req.auth = d
            next()
        });

    }).on("error", (err) => {
        return res.status(403).json({error: err})
    });
}


app.use(cors());
app.use(gAuth);
app.post('/upload', uploadS3.single('file'),function (req, res, next) {

    res.send('Successfully uploaded ' + req.file.key + ' files!')
    AWS.config.update({region: 'us-west-1'});

    let messageToSend = {
        filekey:req.file.key,
        filename:req.file.originalname,
        firstname: req.auth.given_name,
        lastname: req.auth.family_name,
        uploadtime:Date.now().toString(),
        updatetime:Date.now().toString(),
        description:req.body.description,
        email:req.auth.email,
        querytype:'insert',
    };
    let params = {
        Message: JSON.stringify(messageToSend),
        TopicArn: 'arn:aws:sns:us-west-1:578421149959:filemetadata',
        MessageStructure:'string',
    };

    var publishTextPromise = new AWS.SNS({apiVersion: '2010-03-31'}).publish(params).promise();

// Handle promise's fulfilled/rejected states
    publishTextPromise.then(
        function(data) {
            console.log(`Message ${params.Message} sent to the topic ${params.TopicArn}`);
            console.log("MessageID is " + data.MessageId);
        }).catch(
        function(err) {
            console.error(err, err.stack);
        });

});

app.use(cors());
app.use(gAuth);
app.delete('/upload/:id',async function(req,res){
    let params={
        Bucket:process.env.AWS_BUCKET_NAME,
        Key:req.params['id'],
    };
    let str=req.params['id'];
    let cmpemail=str.split('-');
    console.log(cmpemail[0]);
    if(cmpemail[0]===req.auth.email){
        console.log("valid user");
    }
    else{
        console.log("invalid user");
       res.status(401).json({"message": "invalid user"});
       return;
    }
    try {
        await s3.headObject(params).promise()
        console.log("File Found in S3")
        try {
            await s3.deleteObject(params).promise()
            console.log("file deleted From S3")
        }
        catch (err) {
            console.log("ERROR in file Deleting : " + JSON.stringify(err))
          return  res.status(400)
        }
    } catch (err) {
        console.log("File not Found ERROR : " + err.code)
      return  res.status(404).json({"error": "file not found"})
    }
    AWS.config.update({region: 'us-west-1'});

    let messageToSend = {
        filekey:req.params['id'],
        querytype:'delete',

    };
    let param = {
        Message: JSON.stringify(messageToSend),
        TopicArn: 'arn:aws:sns:us-west-1:578421149959:filemetadata',
        MessageStructure:'string',
    };

    var publishTextPromise = new AWS.SNS({apiVersion: '2010-03-31'}).publish(param).promise();


// Handle promise's fulfilled/rejected states
    publishTextPromise.then(
        function(data) {
            console.log(`Message ${param.Message} sent to the topic ${param.TopicArn}`);
            console.log("MessageID is " + data.MessageId);
        }).catch(
        function(err) {
            console.error(err, err.stack);
        });
   return res.status(200).json({"message": "successfully deleted"});
});



app.use(cors());
app.use(gAuth)
app.put('/upload/:id', checkExists, uploadS3.single('file'),function (req, res, next) {
    res.send('Successfully updated  files!');
    AWS.config.update({region: 'us-west-1'});

    let messageToSend = {
        filekey:req.params['id'],
        email:req.auth.email,
        querytype:'update',

    };
    let param = {
        Message: JSON.stringify(messageToSend),
        TopicArn: 'arn:aws:sns:us-west-1:578421149959:filemetadata',
        MessageStructure:'string',
    };

    var publishTextPromise = new AWS.SNS({apiVersion: '2010-03-31'}).publish(param).promise();


// Handle promise's fulfilled/rejected states
    publishTextPromise.then(
        function(data) {
            console.log(`Message ${param.Message} sent to the topic ${param.TopicArn}`);
            console.log("MessageID is " + data.MessageId);
        }).catch(
        function(err) {
            console.error(err, err.stack);
        });
    return res.status(200);
});

app.use(cors());
app.use(gAuth)
app.get('/upload', async function (req, res, next) {

    pool.getConnection(function (err, connection) {
        const sql = 'Select * from  filemeta where emailid=?';
        connection.query(sql, [req.auth.email], function (err, result) {
            connection.release();
            if (err) throw err;
            console.log("records retrieved");
            let resp=JSON.stringify(result);
            console.log(result);
            res.status(200).json(result);
        });
    });
});

app.use(cors());
app.use(gAuth)
app.get('/upload/:id',function (req, res, next) {
    const filename=req.auth.email+'-'+req.params['id'];
    const url = process.env.CLOUD_FRONT_URL+filename;
    const privateKey64=process.env.CLOUD_FRONT_PRIVATE_KEY;
    const keyPairId = process.env.CLOUD_FRONT_KEYPAIR_ID;

    let buf = Buffer.alloc(privateKey64.length)
    buf.fill(privateKey64, 'base64')
    let text = buf.toString('ascii');

    const signedUrl = new AWS.CloudFront.Signer(keyPairId, text).getSignedUrl({
        url: url,
        expires: Math.floor((new Date()).getTime() / 1000) + (60 * 60 * 1),
    });
    return res.redirect(signedUrl)
});

app.use(cors());
app.use(gAuth);
app.get('/admin/upload', async function (req, res, next) {
    if(process.env.ADMIN_EMAIL==req.auth.email){
        console.log("valid admin");
    }
    else{
        console.log("invalid admin");
        return res.status(401);
    }
    pool.getConnection(function (err, connection) {
        const sql = 'Select * from  filemeta';
        connection.query(sql, [req.auth.email], function (err, result) {
            connection.release();
            if (err) throw err;
            console.log("records retrieved");
            let resp=JSON.stringify(result);
            console.log(result);
            res.status(200).json(result);
        });
    });
});
app.use(cors());
app.use(gAuth);
app.delete('/admin/upload/:id',async function(req,res){
    let params={
        Bucket:process.env.AWS_BUCKET_NAME,
        Key:req.params['id'],
    };
    let str=req.params['id'];

    if(process.env.ADMIN_EMAIL==req.auth.email){
        console.log("valid admin");
    }
    else{
        console.log("invalid admin");
        return res.status(401);
    }
    try {
        await s3.headObject(params).promise()
        console.log("File Found in S3")
        try {
            await s3.deleteObject(params).promise()
            console.log("file deleted Successfully")
            pool.getConnection(function (err,connection){
                    const sql='Delete from filemeta where filekey=?';
                    connection.query(sql,[req.params['id']],function (err,result){
                        connection.release();
                        if (err) throw err;
                        console.log("record deleted");
                        return res.status(200);
                    });
                }
            );
            return res.status(200)
        }
        catch (err) {
            console.log("ERROR in file Deleting : " + JSON.stringify(err))
            return  res.status(400)
        }
    } catch (err) {
        console.log("File not Found ERROR : " + err.code)
        return  res.status(404)
    }
});


app.use(cors());
app.use(gAuth);
app.get('/user', async function (req, res, next) {
    pool.getConnection(function (err, connection) {
        const sql = 'Select * from  userdata where email=?';
        connection.query(sql, [req.auth.email], function (err, result) {
            connection.release();
            if (err) {
                return res.status(500).json({error: "unable to fetch account"});
            };

            if (result.length != 1) {
                return res.status(404).json({error: "user not registered"});
            }
            console.log("records retrieved");
            return res.status(200).json(result);
        });
    });
});

app.use(cors());
app.use(gAuth);
app.use(bodyParser.json());
app.post('/user', async function (req, res, next) {
    console.log(req.body);
    pool.getConnection(function (err, connection) {
        const sql = 'INSERT INTO userdata (firstname,lastname,email) VALUES (?,?,?)';

        connection.query(sql, [req.body.firstname, req.body.lastname, req.body.email], function (err, result) {
            connection.release();
            if (err) {
                return res.status(500).json({error: "unable to create account"});
            } else {
                return res.status(200).json({message: "account created successfully"})
            }
        });
    });
});


let server = app.listen(8080, function () {
    let host = server.address().address
    let port = server.address().port

    console.log("Example app listening at http://%s:%s", host, port);
});
