/**
 * Created by 詹 on 2016/11/15.
 */
var notify = require('notification');
var socket = io.connect();
var touser = false;
var username = $('#nickname').text(); //用户名
var audio = document.getElementById('audio');
var count = 0;  //群聊未读

//回车发送
function keySend(event){
    if(event.keyCode == 13){
        if(touser){
            sendPrivateMessage();
            touser = false;
        }else{
            sendMyMessage();
        }
    }
}
//查看结果
function replace_em(str){
    str = str.replace(/\</g,'&lt;');
    str = str.replace(/\>/g,'&gt;');
    str = str.replace(/\n/g,'<br/>');
    str = str.replace(/\[em_([0-9]*)\]/g,'<img src="arclist/$1.gif" border="0" />');
    return str;
}
//设置时间
function  getTime(){
    var date = new Date();
    var days = ['星期天','星期一','星期二','星期三','星期四','星期五','星期六'];
    var time = days[date.getDay()] +' '+ (date.getHours()) +':'+ (date.getMinutes());
    return time;
}
//群聊发送处理
function sendMyMessage(){
    var $g_msgIn = $('#sayText');
    var content = $g_msgIn.val();
    if(content == ''){
        alert('输入不能为空');
        return;
    }
    socket.emit('say',content);
    $g_msgIn.val('');
    $('.chat-panel .public-message-list').append(
        '<div class="message-list-item">'+
        '<div class="native-message message-self">'+
        '<div class="avatar"><img src="/images/dog.jpg"></div>'+
        '<div>'+
        '<div>'+
        '<span class="message-username">'+username+'</span>'+
        '<span class="time">'+getTime()+'</span>'+
        '</div>'+
        '<div class="text">'+replace_em(content)+'</div>'+
        '</div>'+
        '</div>'+
        '</div>'
    );
}
//私聊发送处理
function sendPrivateMessage(){
    var $pri_msgIn = $('#private-msgIn');
    var content = $pri_msgIn.val();
    if(content == ''){
        alert('输入不能为空');
        return;
    }
    var touser = $('.chat-panel-private .chat-panel-header span').text();
    var fromuser = $('#nickname').text();

    socket.emit('say-private',fromuser,touser,content);
    $pri_msgIn.val('');
    $('.chat-panel-private .private-message-list').append(
        '<div class="message-list-item">'+
        '<div class="native-message message-self">'+
        '<div class="avatar"><img src="/images/dog.jpg"></div>'+
        '<div>'+
        '<div>'+
        '<span class="message-username">'+fromuser+'</span>'+
        '<span class="time">'+getTime()+'</span>'+
        '</div>'+
        '<div class="text">'+replace_em(content)+'</div>'+
        '</div>'+
        '</div>'+
        '</div>'
    );
}
//监听连接，进入聊天
socket.on('connect',function(){
    socket.send(username);
});
//监听系统广播
socket.on('userIn',function(data){
    var msg_list = $('.chat-panel .message-list');
    msg_list.append(
        '<div class="message-list-item">' +
            '<div class="native-message" style="align-self: center">' +
            ''+data+'</div>' +
        '</div>'
    );
});
//监听系统发给你的信息
socket.on('system',function(data){
    var msg_list = $('.chat-panel .message-list');
    msg_list.append(
        '<div class="message-list-item">' +
        '<div class="native-message" style="align-self: center">' +
        ''+data+'</div>' +
        '</div>'
    );
});
//获取在线用户列表
socket.on('user-list',function(docs){
    var user = '';
    var $user_list = $('.user-list');
    var group_item = `
         <div class="user-list-item group">
                            <div class="avatar"><img src="/images/dog.jpg"></div>
                            <div class="unread">0</div>
                            <div class="user-content">
                                <div>
                                    <p>JustChat</p>
                                    <p>14:11</p>
                                </div>
                                <div>
                                    <p>此功能尚未开发</p>
                                </div>
                            </div>
                        </div>
    `;
    $user_list.html('');
    $user_list.append(group_item);
    for(var i=0;i<docs.length;i++){
        user = docs[i].name;
        var person_item = `
            <div class="user-list-item person">
                            <div class="avatar"><img src="/images/dog.jpg"></div>
                            <div class="unread">0</div>
                            <div class="user-content">
                                <div>
                                    <p>${user}</p>
                                    <p>14:11</p>
                                </div>
                                <div>
                                    <p>此功能尚未开发</p>
                                </div>
                            </div>
                        </div>
        `; 
         if(user != username) {
            $user_list.append(person_item);
        }
        
    }


});
//获取广播聊天
socket.on('user-say',function(name,time,content){
    ++count;
    if($('.notify').hasClass('on')){
        notify('justchat',content).effect('scale');
    }else{
        notify('justchat',content).hide();
    }
    audio.play();
    $('.user-list .group .unread').text(count);
    $('.chat-panel .public-message-list').append(
        '<div class="message-list-item">'+
        '<div class="native-message">'+
        '<div class="avatar"><img src="/images/dog.jpg"></div>'+
        '<div>'+
        '<div>'+
        '<span class="message-username">'+name+'</span>'+
        '<span class="time">'+time+'</span>'+
        '</div>'+
        '<div class="text">'+replace_em(content)+'</div>'+
        '</div>'+
        '</div>'+
        '</div>'
    );
});
//获取私聊信息
socket.on('sayToYou',function(fromuser,time,content){
    touser = true;
    if($('.notify').hasClass('on')){
        notify(fromuser,content).effect('scale');
    }else{
        notify(fromuser,content).hide();
    }
    audio.play();
    $('.chat-panel-private .private-message-list').append(
        '<div class="message-list-item">'+
        '<div class="native-message">'+
        '<div class="avatar"><img src="/images/dog.jpg"></div>'+
        '<div>'+
        '<div>'+
        '<span class="message-username">'+fromuser+'</span>'+
        '<span class="time">'+time+'</span>'+
        '</div>'+
        '<div class="text">'+replace_em(content)+'</div>'+
        '</div>'+
        '</div>'+
        '</div>'
    );
});












