var express = require('express');
var router = express.Router();
var mysql = require('mysql');
var nodemailer = require("nodemailer");
var nodemailer = require("nodemailer");
var async = require("async");

//连接数据库配置
var connection = mysql.createConnection({
    host:'localhost',
    user:'root',
    password:'',
    database:'nodejs'
})
connection.connect();

//调用email接口配置
 var user = '995332120@qq.com'
   , pass = 'Srzh201314'
  ;
  
  var smtpTransport = nodemailer.createTransport({
      service: "QQ"
    , auth: {
        user: user,
        pass: pass
    }
  });


// var multer = require('multer');
 var multer = require('../lib/multerUtil');
/* GET home page. */
// router.get('/', function(req, res, next) {
//   res.render('index', { title: 'Express' });
// });
//  var upload = multer({
//        dest: "public/images/",
//        rename:function(fieldname,filename){
//         return filename;
//      }
//  })

module.exports = function(app){
    
    
   //中間件，檢測用戶是否登錄
   function checklogin(req,res,next){ 
      if(!req.session.user){
          req.flash("error","还没有登陆")
          return res.redirect('/login');
      }
         next();
    }
  
  //进入主页
   app.get('/',checklogin);
   app.get('/',function(req,res){
       console.log("=-----------");
     res.render('index',{
         user:req.session.user,
     })
   })
  
  
  
 
  
    // router.get('/',checklogin);
    // router.get('/', function (req,res,next) {     
    //     req.session.trip = "a";
      
    //     res.render('index', {user:req.session.user});  
    // });
    
    //转向登录页面
    app.get('/login', function (req, res) {     
         
        res.render('login',{
        error:req.flash('error').toString(),
        success:req.flash('success').toString()
        });  
    });
    
    
    
    //登录验证
    app.get('/logined', function (req, res) {
        console.log("are you coming")     
       var username = req.query.username;
       var password = req.query.password;
       console.log("用户名是"+username+"  密码是： "+password);
       var userGetSql = 'SELECT * FROM user WHERE userName = ?' ;
       var userGetSql_Params = username;
       connection.query(userGetSql,userGetSql_Params,function(err,result){
           if(err){
               console.log("[SELECT ERROR]-",err.message);
               return;
           }
          
           if(result == ""){
              req.flash("error","没有此用户")
                res.redirect('/login');
                return;
           }
           if(result[0].userPwd != password){
               req.flash("error","密码错误")
                res.redirect('/login');
                console.log(result);
                return;
           }
           
          req.session.user = username;
          res.redirect('/')
           
       })
       
      
    });
    
    
 //通过电子邮件的密码找回
 app.get('/findPassword',function(res,req,next){
 async.waterfall([
  function(cb){
    smtpTransport.sendMail({
    from    : 'Kris<' + user + '>'
  , to      : '<18818216454@163.com>'
  , subject : '找回密码'
  , html    : '<h4>你的密码是123456</h4> <br><h5>请妥善保管密码，以免再次丢失</h5> '
}, function(err, result) {
 cb(null,result)
});
  },
  function(result,cb){
    console.log(result)
    cb(null,1);
  }
],function(err,results){
 if(results.response = "250 Ok: queued as"){
   next();
   return;
 }else{
   console.log("发送失败")
 }
})
})


app.get('/findPassword',function(req,res){
  
    req.flash("success","发送成功")
    res.redirect('/login')
})
    
   
    
    
    //产品管理
    app.get('/product',checklogin);
    app.get('/product',function(req,res){
        res.render('product/product',{
            user:req.session.user,
        })   
   
})

    //路由到页面发布产品
    app.get('/postProduct',checklogin);
    app.get('/postProduct',function(req,res){
        res.render('product/postProduct',{
            user:req.session.user,
        })   
   
})

    //发布产品
    app.post('/postProduct',checklogin);
    var cpUpload = multer.fields([{ name: 'one' }, { name: 'two', maxCount: 8 },{ name: 'three' },{ name: 'four' }])
    app.post('/postProduct',cpUpload,function(req,res){
        let one = req.files.one[0].filename;
        let two = req.files.two[0].filename;
        let three = req.files.three[0].filename;
        let four = req.files.four[0].filename;
        let pictureName = one+'-'+two+'-'+three+'-'+four
        let productAddSql = 'INSERT INTO Tourism(typeId,tourismTitle,tourismSubtitle,price,tourismImg) VALUES(?,?,?,?,?) ';
        let productAddSql_Params = [req.body.typeId,req.body.tourismTitle,req.body.tourismSubtitle,req.body.price,pictureName];
        connection.query(productAddSql,productAddSql_Params,function(err,result){
            if(err){
                console.log('[INSERT ERROR]-',err.message);
                return;
            }
            console.log(result);
            
        })
        
        
        let arrayLink = req.body;
        let arrayProduct =  [].slice.call(arrayLink);
        console.log(req.body);
        console.log(arrayProduct);
        console.log(req.files);  
   
})
    
  
  //  app.post('/upload', multer.single('uploadPicture'), function(req,res){
  //         console.log(req.file.filename)
  //  })
  //   app.post('/upload', cpUpload, function(req,res){
  //         console.log(JSON.stringify(req.files))
  //  })
   
  
  
};
