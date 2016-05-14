var mysql = require('mysql');

// exports.db = mysql.createConnection({
//     host:'57315d2a2788d.sh.cdb.myqcloud.com',
//     port:6445,
//     passwod:'123abcABC',
//     database:' trip',
//     user:'root',
// });

var db_config = {
    host:'57315d2a2788d.sh.cdb.myqcloud.com',
    user:'root',
    password:'123abcABC',
    database:' trip',
    port:6445
}

var db;

function handleDisconnect(){
    //当旧连接不能使用的时候，创建一个新的连接
    db = mysql.createConnection(db_config);
    
    db.connect(function(err){
        //当连接成功或则失败时，会调用此函数
        //如果err为非空，则说明连接失败，err是对应的出错信息
        if(err){
            console.error('连接到数据库出错：'+err);
            
            //为了避免死循环，需要过一段时间在尝试
            setTimeout(handleDisconnect,2000);
        }
    });
    db.on('error',function(err){
        //在使用过程中出错，会触发error时间
        console.log('出错： '+err);
        if(err.code === 'PROTOCOL_CONNECTION_LOST'){
            //如果丢失连接错误，则重新连接
            handleDisconnect();
        }else{
            throw err;
        }
    })
    
}
handleDisconnect();

exports.db = db;



// exports.db = mysql.createConnection({
//     host:'57315d2a2788d.sh.cdb.myqcloud.com',
//     user:'root',
//     password:'123abcABC',
//     database:' trip',
//     port:6445
// })

exports.sinaBlog = {
    url:'http://blog.sina.com.cn/u/1776757314'  //博客首页地址
}