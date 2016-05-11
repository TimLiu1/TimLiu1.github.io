var mysql = require('mysql');

// exports.db = mysql.createConnection({
//     host:'57315d2a2788d.sh.cdb.myqcloud.com',
//     port:6445,
//     passwod:'123abcABC',
//     database:' trip',
//     user:'root',
// });


exports.db = mysql.createConnection({
    host:'57315d2a2788d.sh.cdb.myqcloud.com',
    user:'root',
    password:'123abcABC',
    database:' trip',
    port:6445
})

exports.sinaBlog = {
    url:'http://blog.sina.com.cn/u/1776757314'  //博客首页地址
}