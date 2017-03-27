/**
 * Created by 詹 on 2016/11/15.
 */
var server = require('socket.io')();
// var mongoose = require('mongoose');
// var dbs = mongoose.connection;
var clients = new Array();  //存储所有客户端的socket和name
var User = global.dbHandle.getModel('user');  //获取User集合对象
var Content = global.dbHandle.getModel('content');  //获取Content集合对象
var Group = global.dbHandle.getModel('group');  //获取Group集合对象


//检查时间小于10
function checkTime(i)
{
    if (i<10)
    {i="0" + i;}
    return i;
}
//设置时间
function  getTime(){
    var date = new Date();
    var days = ['星期天','星期一','星期二','星期三','星期四','星期五','星期六'];
    var time = days[date.getDay()] +' '+ checkTime(date.getHours()) +':'+ checkTime(date.getMinutes());
    return time;
}
//保存用户聊天数据
function storeContent(_name,url,_content,_type,_toUser,_time){
    //var Content = global.dbHandle.getModel('content');
    Content.create({
        name:_name,
        avatar:url,
        data:_content,
        dataType:_type,
        toUser:_toUser,
        time:_time
    },function(err,doc){
        if(err){
            console.log(err);
        }else{
            console.log("storeContent success");
        }
    });
}
//获取群组
function  getGroup(ssocket) {
    Group.find({},function (err,docs) {
        if(err){
            console.log(err);
        }else{
            console.log('group list --default:' + '\n' + docs);
            // ssocket.broadcast.emit('group-list',docs);
            ssocket.emit('group-list',docs);
        }
    });
}

//获取已上线用户
function getUsersUp(ssocket){
    User.find({status:"up"},function(err,docs){
        if(err){
            console.log(err);
        }else{
            console.log('users list --default:' + '\n' + docs);
            ssocket.broadcast.emit('user-list',docs);
            ssocket.emit('user-list',docs);
        }
    });
}

server.on('connection',function(socket){
    console.log('socket.id'+socket.id+':connecting');
    getGroup(socket);
    var client = {
        Socket:socket,
        name:""
    };
    socket.on("message",function(name){
        client.name = name;
        clients.push(client);
        console.log("client-name: "+client.name);
        socket.broadcast.emit("userIn","system@: 【"+client.name+"】-- a newer ! Let's welcome him ~");
    });
    socket.emit("system","system@:  Welcome ! Now chat with others");

    //监听广播用户发送的数据
    socket.on('say',function(touser,content,URL){
        console.log('Server: ' + client.name + 'say: ' + content);
        var time = getTime();
        //socket.emit('user-say',client.name,time,content);//用json传会不会更好
        socket.broadcast.emit('user-say',client.name,time,touser,content,URL);
        storeContent(client.name,URL,content,'text',touser,time);  //保存当前socket的聊天记录
    });
    socket.on('img-public',function (touser, srcImg, avatarURL) {
        var time = getTime();
        socket.broadcast.emit('user-img',client.name,time,touser,srcImg,avatarURL);
        storeContent(client.name,avatarURL,srcImg,'img',touser,time);
    })

    //监听用户私聊发送的数据
    socket.on('say-private',function(fromuser,touser,content,URL){
        var toSocket = '';
        var time = getTime();
        for(var n in clients){  //用户群大不适用
            if(clients[n].name === touser){
                toSocket = clients[n].Socket;
            }
        }
        console.log('toSocket: ' + toSocket.id);
        if(toSocket != ''){
            //socket.emit('say-private-done',touser,content);  //数据返回给fromuser
            toSocket.emit('sayToYou',fromuser,time,content,URL);  //数据发送给touser
            storeContent(fromuser,URL,content,'text',touser,time);
            // console.log(fromuser + " 给 " + touser + "发了私信： " + content);
        }
    });
    socket.on('img-private',function (fromuser, touser, srcImg, avatarURL) {
        var toSocket = '';
        var time = getTime();
        for(var n in clients){  //用户群大不适用
            if(clients[n].name === touser){
                toSocket = clients[n].Socket;
            }
        }
        console.log('toSocket: ' + toSocket.id);
        if(toSocket != ''){
            //socket.emit('say-private-done',touser,content);  //数据返回给fromuser
            toSocket.emit('imgToYou',fromuser,time,srcImg,avatarURL);  //数据发送给touser
            storeContent(fromuser,avatarURL,srcImg,'img',touser,time);
            // console.log(fromuser + " 给 " + touser + "发了私信： " + srcImg);
        }
    });
    //获取聊天记录
    socket.on('findCache',function (groupName) {
        Content.find({toUser:groupName},null,{limit: 20, sort:{_id:-1}},function (err, docs) {
            if(err){
                console.log(err);
            }else{
                socket.emit('megs-lists',groupName,docs);
            }
        });
    });
    //获取用户信息
    socket.on('getInfo',function (userName,id) {
        User.find({name:userName},function (err, doc) {
            if(err){
                console.log(err);
            }else{
                console.log("用户信息" + doc);
                socket.emit('userInfo',doc,id);
            }
        });
    });
    //创建群组
    socket.on('createGroup',function (name) {
        Group.findOne({name:name},function(err,doc){
           if(doc){
               socket.emit('echo',"群组已经存在");
           }else{
               Group.create({
                   name:name,
                   time:getTime()
               });
               socket.emit('echo','群组创建成功');
               socket.emit('groupUpdate',name);
               socket.broadcast.emit('groupUpdate',name);
           }
        });
    });
    //修改用户信息
    function modifyInfo(name,data){
        User.update({name:name},{$set:{avatar:data.avatar,sex:data.sex,age:data.age,career:data.career,city:data.city}},function(err,doc){
            if(err){
                console.log(err);
                socket.emit('modifyFail',err);
            }else{
                // for(var i in clients){
                //     if(clients[i].name === oldname){
                //         clients[i].name = uname;
                //     }
                }
                socket.broadcast.emit('urlUpdate',name,data.avatar)
                socket.emit('setInfoDone',"信息更改成功",data.avatar);  //向客户端返回信息更改成功
                // socket.broadcast.emit('setChangeInfo',oldname,uname,usex);
                console.log(socket.id + ' ' + 'Change successed');
                // global.username = uname; //？？？
                // getUsersUp(socket);  //应该向clients中的全socket更新
        });
    }

    //监听客户端发过来的更新请求
    socket.on('setInfo',function(name,data){
        // console.log(oldname + "  " + uname + "  " + usex);

        modifyInfo(name,data);
    });

    //监听客户端查找聊天记录 查询数据库聊天记录
    socket.on('getChatList',function(uname){
        //var Content = global.dbHandle.getModel('content');
        Content.find({name:uname}, function (err,docs) {
            if(err){
                console.log(err);
            }else{
                socket.emit('getChatListDone',docs);
                console.log(uname+"   正在查询聊天记录");
            }
        });
    });
    //客户端连接断开
    socket.on('disconnect',function(){
        var name = "";
        for(var i in clients){
            if(clients[i].Socket === socket){
                name = clients[i].name;
            }
        }
        statusSetDown(name,socket);
        console.log(name + "->disconnect");
    });

    //用户下线处理
    function statusSetDown(oName,ssocket){
        //var User = global.dbHandle.getModel('user');
        User.update({name:oName},{$set:{status:'down'}},function(err,doc){
            if(err){
                console.log(err);
            }else{
                console.log(oName + "  下线");
                getUsersUp(ssocket);
            }
        });
    }
});

exports.listen = function (chatServer) {
    return server.listen(chatServer);
};














