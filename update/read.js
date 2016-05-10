let originRequest = require('request');
let cheerio = require('cheerio');
let debug = require('debug')('blog:update:read');

/**
 * 请求指定Url
 * 
 * @params{String} url
 * @params{Function} callback
 */

function request(url,callback){
    originRequest(url,callback);
}


/**
 * 获取文章分类列表
 * @params {String} url
 * @params {Function} callback
 *
 */

exports.classList = function(url,callback){
    debug('读取文章分类列表 %s',url);
    
    request(url,function(err,res){
        if(err){
            return callback(err);
        }
        
        //根据网页类容创建DOM操作对象
        var $ = cheerio.load(res.body.toString());
        
        //读取博文类别列表
        let classList  = [];
        $('.classList li a').each(function(){
         let $me = $(this);
         let item = {
           name:$me.text().trim(),
           url:$me.attr('href')
         };
       //从URL中取出分类的ID
       let s = item.url.match(/articlelist_\d+_(\d+)_\d\.html/);
       if(Array.isArray(s)){
         item.id = s[1];
         classList.push(item);
       }
       
       }); 
       callback(null,classList)   
    });
}

exports.articleList = function(url,callback){
    debug('读取博文列表 %s',url);
    
    request(url,function(err,res){
      if(err) return callback(err);
      
       if(err) return console.error(err);
    
    //根据网页内容创建DOM操作对象
    let $ = cheerio.load(res.body.toString());
    
    
    //读取博文列表
    let articleList = [];
    $('.articleList .articleCell').each(function(){
        let $me = $(this);
        let $title = $me.find('.atc_title a');
        let $time = $me.find('.atc_tm');
        
        let item = {
            title:$title.text().trim(),
            url:$title.attr('href'),
            time:$time.text().trim(),
        };
        
     
        //从URL中读取文章的ID
        let s = item.url.match(/blog_([a-zA-Z0-9]+)\.html/);
        if(Array.isArray(s)){
            item.id = s[1];
            articleList.push(item);
        }
    });
    // console.log(articleList);
   //检查是否有下一页
   let nextUrl = $('.SG_pgnext a').attr('href');
   if(nextUrl){
       //读取下一页
      exports.articleList(nextUrl,function(err,articleList2){
           if(err) return callback(err);
           //合并结果
          callback(null,articleList.concat(articleList2));  
      });   
       
   }else{
       callback(null,articleList)
   }
        
    });
}

/**
 * 获取博文页面内容
 * @param {String} url
 * @param {Function} callback
 * 
 */

exports.articleDetail = function(url,callback){
    debug('读取博文类容 %s',url);
    
    request(url,function(err,res){
        if(err) return callback(err);
    
    //根据网页内容创建DOM操作对象
    var $ = cheerio.load(res.body);
    
    //获取文章标签
    var tags = [];
    $('.blog_tag h3 a').each(function(){
        var tag = $(this).text().trim();
        if(tag){
            tags.push(tag);
        }
    });
     let images = ""
  $('#sina_keyword_ad_area2 img').each(function(){
     let $me = $(this);
  
     if(images!=""){
         images = images+"-"+ $me.attr('real_src')
     }else{
         images += $me.attr('src');
     }

   })


    //获取文章类容
    let content = $('.articalContent').html().trim();
    
    //输出结果
   callback(null,{tags:tags, content:content,images:images})
    })
}