var async = require('async');
var db = require('../config').db;
var debug = require('debug')('blog:update:save');

/**
 * 保存文章分类
 * 
 * @params {Object} list
 * @params {Function} callbck
 */

exports.classList = function(list,callback){
    debug('保存文章分类列表到数据库中 %d',list.length);
    
    async.eachSeries(list,function(item,next){
        let classListGetSql = 'SELECT * FROM class_list WHERE id = ? LIMIT 1';
        let classListGetSql_Params = item.id;
        db.query(classListGetSql,classListGetSql_Params,function(err,data){
            if(err) return next(err.message);
            
            if(Array.isArray(data) && data.length>=1){
                //分类已经存在，跟新一下
             let classListUpdateSql = 'UPDATE class_list SET name = ?,url = ? WHERE id = ?';
             let classListUpdateSql_Params = [item.name,item.url,item.id];
             db.query(classListUpdateSql,classListUpdateSql_Params,next);
            }else{
                // 分类不存在，添加
                let classListInsertSql = 'INSERT INTO class_list(id,name,url) values(?,?,?)';
                let classListInsertSql_Params = [item.id,item.name,item.url];
                db.query(classListInsertSql,classListInsertSql_Params,next);
            }
        })
    },callback)
}

/**
 * 保存文章列表
 * 
 * @params {Number} class_id
 * @params {Array} list
 * @params {Function} callback
 */



exports.articleList = function(class_id,list,callback){
    debug('保存文章列表到数据库中：%d,%d',class_id,list.length);
     
    async.eachSeries(list,function(item,next){
      //查询文章是否存在
      let articleListGetSql = 'SELECT * FROM article_list WHERE id = ? AND class_id = ? LIMIT 1';
      let articleListGetSql_Params = [item.id,class_id];
      db.query(articleListGetSql,articleListGetSql_Params,function(err,data){
          if(err) return next(err); 
           if(Array.isArray(data) && data.length>=1){
                //分类已经存在，更新一下
             let  articleListUpdateSql = 'UPDATE article_list SET title = ?, url = ?,class_id = ?, created_time= ? WHERE id = ? AND class_id = ?';
             let articleListUpdateSql_Params = [item.title,item.url,class_id,item.time,item.id,class_id];
             db.query(articleListUpdateSql,articleListUpdateSql_Params,next);
            }else{
                // 分类不存在，添加
             
                let articleListInsertSql = 'INSERT INTO article_list(id,title,url,created_time,class_id) values(?,?,?,?,?)';
                let articleListInsertSql_Params = [item.id,item.title,item.url,item.time,class_id];
                db.query(articleListInsertSql,articleListInsertSql_Params,next);
            }
      })
    },callback)
}

/**
 * 保存文章分类的文章数量
 * @params {Number} class_id
 * @params {Number} count
 * @params {Function} callback
 * 
 */

exports.articleCount = function(class_id,count,callback){
    debug('保存文章分类的文章数量 %d, %d',class_id,count);
    let articleCountUpdateSql = 'UPDATE class_list SET count = ? WHERE id = ?';
    let articleCountUpdateSql_Params = [count,class_id];
    db.query(articleCountUpdateSql,articleCountUpdateSql_Params,callback);
};

/**
 * 保存文章标签
 * 
 * @params {String} id
 * @params {Array} tags
 * @params {Function} callback
 */


exports.articleTags = function(id,tags,callback){
    debug('保存文章标签 %s,%s',id,tags);
    
    //删除旧的标签信息
    let articleTagDeleteSql = 'DELETE FROM article_tag WHERE id = ?';
    let articleTagDeleteSql_Params = id;
    db.query(articleTagDeleteSql,articleTagDeleteSql_Params,function(err){
        if(err) return callback(err);
        
        if(tags.length>=1){
        //添加新的标签信息
        //生成SQL代码
       
        var values = tags.map(function(tag){
            return '('+db.escape(id)+','+db.escape(tag)+')';
        }).join(',');
        
        console.log("value=>"+values)
        let articleTagInsertSql = 'INSERT INTO article_tag(id,tag) values(?,?)';
        let articleTagInsertSql_Params = [id,tags];
        db.query('INSERT INTO `article_tag`(`id`,`tag`) VALUES'+values,callback);
        }else{
            callback(null);
        }
    }); 
};

/**
 * 保存文章内容
 * 
 * @param {String} id
 * @param {Array} tags
 * @param {String} content
 * @param {Function} callback
 */

exports.articleDetail = function(id,tags,content,images,callback){
    debug('保存文章内容 %s',id);
    
    
      //查询文章是否存在
      let articleGetSql = 'SELECT * FROM article_detail WHERE id = ?';
      let articleGetSql_Params = id;
      db.query(articleGetSql,articleGetSql_Params,function(err,data){
          if(err) return next(err);
            
            tags = tags.join('');
           if(Array.isArray(data) && data.length>=1){
                //分类已经存在，跟新一下
             let articleUpdateSql = 'UPDATE article_detail SET tags = ?,content = ?,images = ? WHERE id = ?';
             let articleUpdateSql_Params =[tags,content,id,images];
             db.query(articleUpdateSql,articleUpdateSql_Params,callback);
            }else{
                // 分类不存在，添加
                let articleInsertSql = 'INSERT INTO article_detail(id,content,tags,images) values(?,?,?,?)';
                let articleInsertSql_Params = [id,content,tags,images];
                db.query(articleInsertSql,articleInsertSql_Params,callback);
            }
      });    
};

/**
 * 检查文章是否存在
 * 
 * @param {String} id
 * @param {Function} callback
 */

exports.isAericleExists = function(id,callback){
       //查询文章是否存在
      let articleGetSql = 'SELECT * FROM article_detail WHERE id = ?';
      let articleGetSql_Params = id;
      db.query(articleGetSql,articleGetSql_Params,function(err,data){
          if(err) return next(err);
          callback(null,Array.isArray(data) && data.length >= 1);
      })
}
















