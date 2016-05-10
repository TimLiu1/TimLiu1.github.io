var clild_process = require('child_process');

//spawn() 是直接运行的文件的，而在windows 系统下dir 命令是cmd.exe的内置命令
//并不实际存在名为dir.exe的可执行文件，所以这里需要判断一下

if(process.platform === 'win32'){
    var dir = child_process.spawn('cmd.exe',['/s','/c','/dir','c:\\'])
}else{
    var dir = child_process.spawn('dir',['/']);
}

//当子进程有输出时，自动输出到当前进程的标准输出流
 dir.stdout.pipe(process.stdout);
 dir.stderr.pipe(process.stderr);
 
 //当进程结束时触发close事件
 dir.on('close',function(code){
     console.log('进程结束，代码=%d',code);
 })
 
 /**
  * 使用child_process.exec()启动子进程
  */
  
  
  //选项
  var options = {
      //输出缓冲区的大小，默认是200KB，如果进程超过这个值，会抛出异常
      //并结束该进程
      maxBuffer:200*1024
  };
  
  var dir = ChildNode.exec('dir *',options,function(err,stdout,stderr){
      if(err) throw err;
      console.log('stdout: '+stdout);
      console.log('stderr: '+stderr);
  })
