const mysql=require('mysql');
let pool=mysql.createPool({
    host:'project1db.ce5npftgvxpf.us-west-1.rds.amazonaws.com',
    user:"blessydb",
    password:"blessydb",
    port:3306,
    database: "project1"
});

exports.handler=function(event,context,callback){
    context.callbackWaitsForEmptyEventLoop=false;
    let json=JSON.parse(event.Records[0].Sns.Message);
    if(json.querytype==='insert') {
        pool.getConnection(function (err, connection) {
            const sql = 'INSERT INTO filemeta (filekey,filename,firstname,lastname,emailid,uploadtime,updatetime,description) VALUES (?,?,?,?,?,?,?,?)';
            connection.query(sql, [json.filekey, json.filename, json.firstname, json.lastname, json.email, json.uploadtime, json.updatetime, json.description], function (err, result) {
                connection.release();
                if (err) {
                    callback(err)
                } else {
                    console.log("1 record inserted");
                    callback(null)
                }
            });
        });
    }
    else if(json.querytype==='delete'){
        pool.getConnection(function (err,connection){
            const sql='Delete from filemeta where filekey=?';
            connection.query(sql,[json.filekey],function (err,result) {
                    connection.release();
                    if (err) throw err;
                    console.log("record deleted");
                callback(null)

        });
    });
    }
    else if(json.querytype==='update'){
        pool.getConnection(function (err, connection) {
            const sql = 'Update filemeta set updatetime=? where filekey=? and emailid=?';
            connection.query(sql, [Date.now().toString(), json.filekey,json.email], function (err, result) {
                connection.release();
                if (err) throw err;
                console.log("record updated");
                callback(null);
            });
        });
    }
    };