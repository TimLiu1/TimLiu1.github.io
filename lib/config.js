var mysql = require('mysql');

exports.db = mysql.createConnection({
    host:'localhost',
    port:3306,
    passwod:'',
    database:'sina_blog',
    user:'root',
});

exports.sinaBlog = {
    url:'http://blog.sina.com.cn/u/1776757314'  //博客首页地址
}