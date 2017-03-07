/**
 * Created by 詹 on 2016/11/15.
 */
var notify = require('notification');
var socket = io.connect();
var username = $('#nickname').text(); //用户名
var audio = document.getElementById('audio');

//回车发送
// function keySend(event){
//     if(event.keyCode == 13){
//         if(touser){
//             sendPrivateMessage();
//             touser = false;
//         }else{
//             sendMyMessage();
//         }
//     }
// }
//查看结果
function replace_em(str){
    str = str.replace(/\</g,'&lt;');
    str = str.replace(/\>/g,'&gt;');
    str = str.replace(/\n/g,'<br/>');
    str = str.replace(/\[emoji_([0-9]*)\]/g,'<img src="arclist/$1.png" border="0" />');
    return str;
}
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
//群聊发送处理
function sendMyMessage(e){
    if(e.keyCode == 13){
        var content = $(e.target).val();
        var touser = $(e.target).parent().siblings('.chat-panel-header').children('span').text();
        // var touser = $('.chat-panel-private .chat-panel-header span').text();
        if(content == ''){
            alert('输入不能为空');
            return;
        }
        socket.emit('say',touser,content);
        $(e.target).val("");
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
}
//私聊发送处理
function sendPrivateMessage(e){
    if(e.keyCode == 13) {
        var content = $(e.target).val();
        var touser = $(e.target).parent().siblings('.chat-panel-header').children('span').text();
        if(content == ''){
            alert('输入不能为空');
            return;
        }
        // var touser = $('.chat-panel-private .chat-panel-header span').text();
        var fromuser = username;

        socket.emit('say-private',fromuser,touser,content);
        $(e.target).val("");
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
}
//监听连接，进入聊天
socket.on('connect',function(){
    socket.send(username);
});
//监听系统广播
socket.on('userIn',function(data){
    var msg_list = $('.chat-panel .public-message-list');
    msg_list.append(
        '<div class="message-list-item">' +
            '<div class="native-message" style="align-self: center">' +
            ''+data+'</div>' +
        '</div>'
    );
});
//监听系统发给你的信息
socket.on('system',function(data){
    var msg_list = $('.chat-panel .public-message-list');
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
                        <div class="user-list-item group JustChat">
                            <div class="avatar"><img src="/images/dog.jpg"></div>
                            <div class="unread">0</div>
                            <div class="user-content"> 
                                <div>
                                    <p class="username">JustChat</p>
                                    <p class="showTime">${getTime().split(" ")[1]}</p>
                                </div>
                                <div>
                                    <p class="showMessage">尚无消息推送</p>
                                </div>
                            </div>
                        </div>
    `;
    $user_list.html('');
    $user_list.append(group_item);
    for(var i=0;i<docs.length;i++){
        user = docs[i].name;
        var person_item = `
            <div class="user-list-item person ${user}">
                            <div class="avatar"><img src="/images/dog.jpg"></div>
                            <div class="unread">0</div>
                            <div class="user-content">
                                <div>
                                    <p class="username">${user}</p>
                                    <p class="showTime">${getTime().split(" ")[1]}</p>
                                </div>
                                <div>
                                    <p class="showMessage">尚无消息推送</p>
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
socket.on('user-say',function(name,time,touser,content){
    var unread = $('.user-list .JustChat .unread').text();
    var count = Number(unread) + 1;
    $('.user-list .JustChat .unread').text(count);
    $('.user-list .JustChat .showTime').text(time.split(" ")[1]);
    $('.user-list .JustChat .showMessage').text("");
    $('.user-list .JustChat .showMessage').append(replace_em(content));
    if($('.notify').hasClass('on')){
        notify(touser,content).effect('scale');
    }else{
        notify(touser,content).hide();
    }
    audio.play();

    $(".chat-panel"+" " + "." + touser + " " + ".public-message-list").append(
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
    var unread = $(".user-list" + " " + "." + fromuser + " " + ".unread").text();
    var count = Number(unread) + 1;
    $(".user-list" + " " + "." + fromuser + " " + ".unread").text(count);
    $(".user-list" + " " + "." + fromuser + " " + ".showTime").text(time.split(" ")[1]);
    $(".user-list" + " " + "." + fromuser + " " + ".showMessage").text("");
    $(".user-list" + " " + "." + fromuser + " " + ".showMessage").append(replace_em(content));

    if($('.notify').hasClass('on')){
        notify(fromuser,content).effect('scale');
    }else{
        notify(fromuser,content).hide();
    }
    audio.play();
    $(".chat-panel"+" " + "." + fromuser + " " + ".private-message-list").append(
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












