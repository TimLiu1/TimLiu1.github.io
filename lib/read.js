let async = require('async');
let debug = require('debug')('blog:web:read');
let db = require('./config.js').db;




/**
 * 获取文章分类列表
 * 
 * @param {Function} callback
 * 
 */
 exports.classList = function(callback){
     debug('获取文章分类列表');
     
     db.query('SELECT * FROM `class_list` ORDER BY `id` ASC',callback);
 }



/**
 * 检查分类是否存在
 * 
 * @param {Number} id
 * @param  {Function} callback
 */

exports.isClassExists = function(id,callback){
    debug('检查分类是否存在 %s', id);
      let classListGetSql = 'SELECT * FROM article_detail WHERE id = ? LIMIT 1';
      let classListGetSql_Params = id;
      db.query(classListGetSql,classListGetSql_Params,function(err,ret){
          if(err) return next(err);
          callback(null,Array.isArray(ret) && ret.length > 0) 
      })
    
}

/**
 * 获取指定分类信息
 * 
 * @param {Number} id
 * @param {Function} callback
 */

exports.class = function (id, callback){
    debug('指定分类信息 %s', id);
    
     let classListGetSql = 'SELECT * FROM class_list WHERE id = ? LIMIT 1';
     let classListGetSql_Params = item.id;
        db.query(classListGetSql,classListGetSql_Params,function(err,data){
            if(err) return callback(err.message);
            
            if(!data.length > 0){
                return callback(new Error('该分类不存在'));
            };
            callback(null,list[0])
        });
};


/**
 * 获取指定文章的详细信息
 * 
 * @param {String} id
 * @param {Function} callback
 * 
 */


exports.article = function(id,callback){
    debug('获取指定文章的详细信息：%s', id);
    
    let sql = 'SELECT * FROM `article_list` AS `A` LEFT JOIN `article_detail` AS `B` ON `A`.`id` = `B`.`id` WHERE `A`.`id`=?';
    db.query(sql,[id],function(err,list){
        if(err) return callback(err);
        console.log(list[0]);
        if(!(list.length >0)) return callback(new Error('该文章不存在'));
        callback(null,list[0]);
    })
}

/**
 * 获取指定分类下的文章列表
 * 
 * @param {Number} classId
 * @param {Number} offset
 * @param {Number} limit
 * @param {Function} callback
 */

exports.articleListByClassId = function(classId,offset,limit,callback){
    debug('获取指定分类下的文章列表： %s,%s,%s',classId,offset,limit);
    
    let articleGetSql = 'SELECT * FROM article_list WHERE class_id = ? ORDER BY created_time DESC LIMIT ?,?'
    let articleGetSql_Params = [classId,offset,limit]
  
    db.query(articleGetSql,articleGetSql_Params,callback);
};


/**
 * 获取指定标签下面的文章
 * 
 * @param {String} tag
 * @param {Number} offset
 * @param {Number} limit
 * @param {Function} callback
 * 
 */


exports.articleListByTag = function(tag,offset,limit,callback){
    debug('获取指定标签下的文章列表 %s, %s, %s',tag,offset,limit);
    
    
    let sql = 'SELECT * FROM `article_list` WHERE `id` IN(`SELECT `id` FROM `article_tag` WHERE `tag` = ?) ORDER BY'+ '`created_time` DESC LIMIT ?,?';
    db.query(sql,[tag,offset,limit],callback);
}

/**
 * 获取指定标签下的文章数量
 * 
 * @param {String} tag
 * @param {Function} callback
 */

exports.articleCountByTag = function(tag,callback){
    debug('获取指定标签下的数量：%s',tag);
    
    db.query('SELECT COUNT(*) AS `c` FROM `article_tag` WHERE `tag`=?',[tag],function(err,ret){
        if(err) return callbacke(err);
        
        callback(null,ret[0].c);
    });
};



/**
 *  获取订单概要
 * @param {Number} offset
 * @param {Number} limit
 */

exports.userOrder = function(offset,limit,callback){
    debug('获取订单清单');
    var userOrderGetSql = 'SELECT * FROM `userorder` o LEFT JOIN `USER` u ON o.`USERID` =  u.`USERID` LEFT JOIN `tourism` t ON o.`TOURISM` = t.`TOURISMID`'+ 
   'ORDER BY o.`CREATETIME` DESC LIMIT ?,?'
    var userOrderGetSql_Params = [offset,limit];
    
    db.query(userOrderGetSql,userOrderGetSql_Params,callback);
    
}

/**
 * 获取订单详情
 * @param {Number} orderId
 * 
 */


exports.userOrderDetail = function(orderId,callback){
      debug('获取订单详情');
    var userOrderDetailGetSql = 'SELECT * FROM `userorder` o LEFT JOIN `USER` u ON o.`USERID` =  u.`USERID` LEFT JOIN `tourism` t ON o.`TOURISM` = t.`TOURISMID`   WHERE o.`ORDERID` = ?';
    var userOrderDetailGetSql_Params = orderId;
    db.query(userOrderDetailGetSql,userOrderDetailGetSql_Params,callback);
  
}














