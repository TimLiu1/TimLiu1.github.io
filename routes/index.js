var express = require('express');
var router = express.Router();
var mysql = require('mysql');
var nodemailer = require("nodemailer");
var nodemailer = require("nodemailer");
var async = require("async");
var moment = require('moment');

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
  
  
  //转向系统选择页面
   app.get('/sysChoice',checklogin);
   app.get('/sysChoice',function(req,res){
       res.render('sysChoice',{
          role:req.session.role
       })
   })
    
    //转向登录页面
    app.get('/login', function (req, res) {     
         
        res.render('login',{
        error:req.flash('error').toString(),
        success:req.flash('success').toString(),
      
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
          req.session.role = result[0].role;
          req.session.user = username;
          res.redirect('/sysChoice')
           
       })     
    });
    
    
    //用户登出
    app.get('/logout',function(req,res){
        req.flash("success","登出成功")
        req.session.user = "";
        res.redirect('/login');
    })
    
    
    //通过电子邮件的密码找回第一步，验证数据库是否有此邮箱
    app.post('/findPassword',function(req,res,next){
       let email = req.body.email;
       let emailGetSql = 'SELECT * FROM user WHERE userEmail = ?';
       let emailGetSql_Params = email;
       connection.query(emailGetSql,emailGetSql_Params,function(err,userEmails){
           if(err){
               console.error('[GET uerEmail]-',err.message);
           }
           if(userEmails=""){
               req.flash("error","此邮箱没有注册")
               res.redirect('/login');
               return;
           }
          next();
       })
    })
    
    //通过电子邮件的密码找回
    app.post('/findPassword',function(req,res,next){
       let email = req.body.email;
       let emailGetSql = 'SELECT * FROM user WHERE userEmail = ?';
       let emailGetSql_Params = email;
       connection.query(emailGetSql,emailGetSql_Params,function(err,users){
           if(err){
               console.error('[GET uerEmail]-',err.message);
           }
          console.log('---'+JSON.stringify(users))  
           if(users == ""){
               req.flash("error","此邮箱没有注册")
               res.redirect('/login');
               return;
           }
       console.log(users)  
       async.waterfall([
        function(cb){
            smtpTransport.sendMail({
            from    : 'Kris<' + user + '>'
        , to      : '<'+email+'>'
        , subject : '找回密码'
        , html    : '<h4>你的密码是<h3>'+users[0].userPwd+'</h3><br><h5>请妥善保管密码，以免再次丢失<br><small>此邮件由趣鹿系统自动发送请勿回复<small></h5> '
        }, function(err, result) {
        cb(null,result)
        });
        },
        function(result,cb){
            // console.log(result)
            cb(null,1);
        }
        ],function(err,results){
        if(results.response = "250 Ok: queued as"){
        next();
        return;
        }else{
        req.flash("error","发送失败")
        res.redirect('/login')
        }
        })
       })
        
        
   })


      app.post('/findPassword',function(req,res){ 
          req.flash("success","发送成功")
          res.redirect('/login')
      })
        
    
        /*
        * 以下部分为产品管理模块 
        */
        
        //查询产品并转向产品管理页面
      app.get('/product',checklogin);
      app.get('/product',function(req,res){
          let productGetSql = 'SELECT * FROM tourism'
          connection.query(productGetSql,function(err,results){
              if(err){
                  console.log('[GET PRODUCT]-',err.message);
                  return;
              }
          var productMessage = req.flash('productMessage').toString();
          res.render('product/product',{
              user:req.session.user,
              results:results,
              productMessage:productMessage,
          })   
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
            req.flash('productMessage','发布成功');
            res.redirect('/product');  
        })
})
    
    
    //删除产品
    app.get('/delete',checklogin);
    app.get('/delete',function(req,res){
      var tourismId = req.query.tourismId;
      let productDelSql = 'DELETE FROM tourism WHERE tourismId = ?';
      let productDelSql_Params = tourismId;
    connection.query(productDelSql,productDelSql_Params,function(err,result){
        if(err){
            console.log('[DELETE PRODUCT]-',err.message);
            return;
        }
        req.flash('productMessage','删除成功');
        res.redirect('/product');
    })
    })
    
    //定向到更新产品页面
    app.get('/update',checklogin);
    app.get('/update',function(req,res){
        let tourismId = req.query.tourismId;
        let productGetSql = 'SELECT * FROM tourism WHERE tourismId =?';
        let productGetSql_Params = tourismId;
        connection.query(productGetSql,productGetSql_Params,function(err,products){
             if(err){
            console.log('[GET PRODUCT]-',err.message);
            return;
                 }
            console.log(products)
            let images = products[0].tourismImg.split('-');
            console.log(images);
            res.render('product/update',{
            user:req.session.user,
            product:products[0],
            images:images
           })
        })
          
       });
    
    
    
  //更新产品
  app.post('/update',checklogin);
  app.post('/update',function(req,res,next){
      var tourismId = req.body.tourismId;
      console.log(req.body);
      let productDelSql = 'DELETE FROM tourism WHERE tourismId = ?';
      let productDelSql_Params = tourismId;
    connection.query(productDelSql,productDelSql_Params,function(err,result){
        if(err){
            console.log('[DELETE PRODUCT]-',err.message);
            return;
        }
         next();
    })
  })
  
  
  //更新产品
  
   app.post('/update',function(req,res){
        let one = req.body.image1;
        let two = req.body.image2;
        let three = req.body.image3;
        let four = req.body.image4;
        let pictureName = one+'-'+two+'-'+three+'-'+four
        let productAddSql = 'INSERT INTO Tourism(typeId,tourismTitle,tourismSubtitle,price,tourismImg) VALUES(?,?,?,?,?) ';
        let productAddSql_Params = [req.body.typeId,req.body.tourismTitle,req.body.tourismSubtitle,req.body.price,pictureName];
        connection.query(productAddSql,productAddSql_Params,function(err,result){
            if(err){
                console.log('[INSERT ERROR]-',err.message);
                return;
            }
            req.flash('productMessage','更新成功');
            res.redirect('/product');  
        })
 
  })
  
  
  //产品详情
  app.get('/productDetail',checklogin);
  app.get('/productDetail',function(req,res){
      let tourismId = req.query.tourismId;
      let productGetSql = 'SELECT * FROM tourism WHERE tourismId = ?'
      let productGetSql_Params = tourismId;
      connection.query(productGetSql,productGetSql_Params,function(err,products){
         if(err){
              console.log('[GET PRODUCT]-',err.message);
              return;
           } 
         let images = products[0].tourismImg.split('-');
         console.log(images);
         res.render('product/productDetail',{
         user:req.session.user,
         product:products[0],
         images:images
           })
      })
      
  })
  
  
  /**
   * 以下部分为用户管理模块
   * 
   */
  
  //转向用户管理页面 
   app.get('/user',checklogin);
   app.get('/user',function(req,res){
      let userGetSql = 'SELECT * FROM user'
      connection.query(userGetSql,function(err,results){
         if(err){
           console.log('[GET USER]-',err.message);
            return;
          }
          let users = [];
          if(results!=""){
             results.forEach(function(user){
             user.registerTime = moment(user.registerTime).format("YYYY-MM-DD hh:mm:ss");
             users.push(user);
          })
          }
      var userMessage = req.flash('userMessage').toString();
      res.render('user/index',{
          user:req.session.user,
          users:users,
          userMessage:userMessage
        })   
      })   
  })
  
  
  
  
  
  //  app.post('/upload', multer.single('uploadPicture'), function(req,res){
  //         console.log(req.file.filename)
  //  })
  //   app.post('/upload', cpUpload, function(req,res){
  //         console.log(JSON.stringify(req.files))
  //  })
   
  
  
};
