var express = require('express');
var router = express.Router();
var mysql = require('mysql');
var connection = require('../lib/config').db;
var nodemailer = require("nodemailer");
var nodemailer = require("nodemailer");
var async = require("async");
var moment = require('moment');
var read = require('../lib/read')
var debug = require('debug')('mydebug:index');

//连接数据库配置
// var connection = mysql.createConnection({
//     host:'57315d2a2788d.sh.cdb.myqcloud.com',
//     user:'root',
//     password:'123abcABC',
//     database:' trip',
//     port:6445
// })
// connection.connect();

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
        debug(req.method+' '+req.url)
        
        async.parallel([
            function(cb){
        read.articleListByClassId(0,0,3,function(err,list1){
           var list = [];
           list1.forEach(function(article){
               article.created_time = moment(article.created_time).format('YYYY-MM-DD hh:mm:ss');
               list.push(article);
           })
           cb(null,list) 
            
            });
            },
            function(cb){
               read.userOrder(0,3,function(err,orders1){
               if(err) console.log(new Error('查询订单出错'));
               var orders = [];
            orders1.forEach(function(order){
               order.CREATETIME = moment(order.CREATETIME).format('YYYY-MM-DD hh:mm:ss');
               orders.push(order);
            })
              cb(null,orders)
               }) 
            }
        ],function(err,results){
            if(err) console.log('进入主页出错',+err);
              res.render('index',{
                list:results[0],
                orders:results[1],
                user:req.session.user,
             })      
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
        debug(req.method+' '+req.url)  
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
           if(result[0].USERPWD != password){
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
        let pictureName = one+'-'+two+'-'+three+'-'+four;
        console.log(req.body);
        let productAddSql = 'INSERT INTO tourism(TYPEID,TOURISMTITLE,TOURISMSUBTITLE,PRICE,TOURISMIMG,TOURDAYS,FIT,RECOMMENDINTRO) VALUES(?,?,?,?,?,?,?,?)';
        let productAddSql_Params = [req.body.typeId,req.body.tourismTitle,req.body.tourismSubtitle,req.body.price,pictureName,req.body.tourDays,req.body.fit,req.body.recommendIntro];
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
      let productDelSql = 'DELETE FROM tourism WHERE  TOURISMID = ?';
      let productDelSql_Params = tourismId;
      console.log(tourismId);
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
        let productGetSql = 'SELECT * FROM tourism WHERE TOURISMID =?';
        let productGetSql_Params = tourismId;
        connection.query(productGetSql,productGetSql_Params,function(err,products){
             if(err){
            console.log('[GET PRODUCT]-',err.message);
            return;
                 }
           let images = ''
            if(products[0].TOURISMIMG){
             images = products[0].TOURISMIMG.split('-');
            }
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
      let productDelSql = 'DELETE FROM tourism WHERE TOURISMID = ?';
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
        let two =  req.body.image2;
        let three = req.body.image3;
        let four =  req.body.image4;
        let pictureName = one+'-'+two+'-'+three+'-'+four;
        console.log(req.body);
        let productAddSql = 'INSERT INTO tourism(TYPEID,TOURISMTITLE,TOURISMSUBTITLE,PRICE,TOURISMIMG,TOURDAYS,FIT,RECOMMENDINTRO) VALUES(?,?,?,?,?,?,?,?)';
        let productAddSql_Params = [req.body.typeId,req.body.tourismTitle,req.body.tourismSubtitle,req.body.price,pictureName,req.body.tourDays,req.body.fit,req.body.recommendIntro];
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
      let productGetSql = 'SELECT * FROM tourism WHERE TOURISMID = ?'
      let productGetSql_Params = tourismId;
      connection.query(productGetSql,productGetSql_Params,function(err,products){
         if(err){
              console.log('[GET PRODUCT]-',err.message);
              return;
           }
         let images = ''; 
         if(products[0].TOURISMIMG){
         images = products[0].TOURISMIMG.split('-');   
         }
      
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
  
    app.get('/userDelete',checklogin);
    app.get('/userDelete',function(req,res){
      var userId = req.query.userId;
      let userDelSql = 'DELETE FROM user WHERE userId = ?';
      let userDelSql_Params = userId;
    connection.query(userDelSql,userDelSql_Params,function(err,result){
        if(err){
            console.log('[DELETE USER]-',err.message);
            return;
        }
        req.flash('userMessage','删除成功');
        res.redirect('/user');
    })
    })
    
    
    
    
    
    
    
    
    /**
     * 订单管理模块
     * 
     */
    
    
    //订单管理主页
    app.get('/userOrder',checklogin);
    app.get('/userOrder',function(req,res){
        
        read.userOrder(0,20,function(err,orderCopy){
            var orders = [];
            orderCopy.forEach(function(order){
                order.CREATETIME = moment(order.CREATETIME).format('YYYY-MM-DD hh:mm:ss')
                orders.push(order);
            })
             res.render('userOrder/index',{
            user:req.session.user,
            orders:orders,
        })
        })
       
    })
    
    
    //查询具体订单详情
    app.get('/userOderDetail',checklogin); 
    app.get('/userOderDetail',function(req,res){
        
        read.userOrderDetail(req.query.orderId,function(err,userOrderDetail){
            console.log("--------------");
            console.log(userOrderDetail);
            if(err) console.log(new Error('查询订单详情错误'+err.message));   
            res.render('userOrder/userOrderDetail',{
            user:req.session.user,
            userOrderDetail:userOrderDetail[0],
        })
        })
       
    })
    
    
    

    
    /**
     * 以下用户为博客管理模块
     * 
     */
    
    
    
   //博客首页
    app.get('/blog',checklogin); 
    app.get('/blog',function(req,res){
        
        
        async.parallel([
          function(cb){
           read.articleListByClassId(0,0,3,function(err,list1){
             var list = [];
           list1.forEach(function(article){
             article.created_time = moment(article.created_time).format('YYYY-MM-DD hh:mm:ss');
             list.push(article);
           })
              cb(null,list)
           })
           },
           function(cb){
            read.classList(function(err,classList){
                 cb(null,classList)
            })
           }
        ],function(err,results){
        if(err) console.log(new Error('查询错误'))
        res.render('blog/index',{
        user:req.session.user,
        list:results[0],
        classList:results[1]
     })
        })
     
    })
    
    
    
    //获取博客文章列表
    app.get('/articleList',checklogin); 
    app.get('/articleList',function(req,res){
        //articleListByClassId 的第一个参数是文章分类的ID
        //第二个参数是返回结果的开始位置
        //第三个参数是返回结果的数量
        let id = req.query.id;
        read.articleListByClassId(id,0,20,function(err,list){
             res.render('blog/articleList',{
                list:list,
                user:req.session.user,
             })       
        })
    })
    
    
    //获取指定id文章
    app.get('/article',checklogin);   
    app.get('/article', function(req,res,next){
        //通过req.params.id来取得Url中的:id部分的参数
        read.article(req.query.id,function(err,article){
            if(err) return next(err);
           console.log(JSON.stringify(article))   
            //渲染模板
            res.render('blog/articleDetail',{
                user:req.session.user,
                article:article,
            })
        })
    })
  
  //获取博客分类列表
 
  
  
  //  app.post('/upload', multer.single('uploadPicture'), function(req,res){
  //         console.log(req.file.filename)
  //  })
  //   app.post('/upload', cpUpload, function(req,res){
  //         console.log(JSON.stringify(req.files))
  //  })
   
  
  
};
