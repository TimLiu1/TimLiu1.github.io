var App = require('alidayu-node');
var app = new App('App Key', 'App Secret');
 
app.smsSend({
    sms_free_sign_name: '注册验证', //短信签名，参考这里 http://www.alidayu.com/admin/service/sign
    sms_param: JSON.stringify({"code": "123456", "product": "测试网站"}),//短信变量，对应短信模板里面的变量
    rec_num: '18818216454', //接收短信的手机号
    sms_template_code: 'SMS_640004' //短信模板，参考这里 http://www.alidayu.com/admin/service/tpl
});