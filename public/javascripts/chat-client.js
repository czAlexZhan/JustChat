/**
 * Created by 詹 on 2016/11/15.
 */
var notify = require('notification');
var socket = io.connect();
var username = $('#nickname').text(); //用户名
var avatarURL = $('.info-header .avatar img').attr('src');

var audio = document.getElementById('audio');

//生成GUID
function generateUUID() {
    var d = new Date().getTime();
    var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        var r = (d + Math.random()*16)%16 | 0;
        d = Math.floor(d/16);
        return (c=='x' ? r : (r&0x3|0x8)).toString(16);
    });
    return uuid;
};
//图片编码base64
function transB6(input_file,get_data){
    /*input_file：文件按钮对象*/
    /*get_data: 转换成功后执行的方法*/
    if ( typeof(FileReader) === 'undefined' ){
        alert("抱歉，你的浏览器不支持 FileReader，不能将图片转换为Base64，请使用现代浏览器操作！");
    } else {
        try{
            /*图片转Base64 核心代码*/
            var file = input_file.files[0];
            // console.log(file.value)
            //这里我们判断下类型如果不是图片就返回 去掉就可以上传任意文件
            if(!/image\/\w+/.test(file.type)){
                alert("请确保文件为图像类型");
                return false;
            }
            var reader = new FileReader();
            reader.onload = function(){
                get_data(this.result,file.type);
            }
            reader.readAsDataURL(file);
        }catch (e){
            alert('图片转Base64出错啦！'+ e.toString())
        }
    }
}
//Ajax上传七牛云
function upload64(_this,picBase,type,sendType,upToken) {
    /*picUrl用来存储返回来的url*/
    var picUrl = '';
    //UpToken
    var UpToken = 'UpToken'+' '+upToken;
    /*把头部的data:image/png;base64,去掉。（注意：base64后面的逗号也去掉）*/

    picBase = picBase.substring(13+Number(type.length));
    /*通过base64编码字符流计算文件流大小函数*/

    // 自定义key
    var enCodedKey = Base64.encode('zhanxw'+generateUUID());

    function fileSize(str) {
        var fileSize;
        if(str.indexOf('=')>0) {
            var indexOf=str.indexOf('=');
            str=str.substring(0,indexOf);//把末尾的’=‘号去掉
        }
        fileSize=parseInt(str.length-(str.length/8)*2);
        return fileSize;
    }

    var url = "http://up-z2.qiniu.com/putb64/" + fileSize(picBase) + '/key/' + enCodedKey;
    var xhr = new XMLHttpRequest();
    xhr.onreadystatechange=function() {
        if (xhr.readyState==4){
            var keyText=xhr.responseText;

            /*返回的key是字符串，需要装换成json*/
            keyText = jQuery.parseJSON(keyText);
            /*keyText.key 是返回的图片文件名*/
            picUrl="http://ok2xurmdf.bkt.clouddn.com/"+keyText.key;
            sendImg(_this,sendType,picUrl);
        }
    }
    xhr.open("POST", url, true);
    xhr.setRequestHeader("Content-Type", "application/octet-stream");
    xhr.setRequestHeader("Authorization", UpToken);
    xhr.send(picBase);
}
//更新user_info
function updateInfo(doc,id){
    var avaImage = doc[0].avatar;
    var info = [doc[0].sex,doc[0].age,doc[0].career,doc[0].city];
    // console.log(info)
    var $info_list = $(id);
    $info_list.each(function (index) {
        $(id + ' > div:nth-child(100n+2) img').attr('src',avaImage);
        var $span_list = $(this).find('.info').children();
        $span_list.each(function (index) {
            $(this).text(info[index]);
        });
    });
}
//查看结果
function replace_em(str) {
    str = str.replace(/\</g, '&lt;');
    str = str.replace(/\>/g, '&gt;');
    str = str.replace(/\n/g, '<br/>');
    str = str.replace(/\[emoji_([0-9]*)\]/g, '<img src="arclist/$1.png" border="0" />');
    return str;
}
//检查时间小于10
function checkTime(i) {
    if (i < 10) {
        i = "0" + i;
    }
    return i;
}
//设置时间
function getTime() {
    var date = new Date();
    var days = ['星期天', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'];
    var time = days[date.getDay()] + ' ' + checkTime(date.getHours()) + ':' + checkTime(date.getMinutes());
    return time;
}
//请求用户信息
function getUserInfo(name,id) {
    socket.emit('getInfo',name,id);
}
//修改用户信息
function  modifyUserInfo(name,data) {
    socket.emit('setInfo',name,data);
}

//创建群聊请求
function createGroup(name) {
    socket.emit('createGroup',name);
}
//群聊发送处理
function sendMyMessage(e) {
    if (e.keyCode == 13) {
        var content = $(e.target).val();
        var touser = $(e.target).parent().siblings('.chat-panel-header').children('span').text();

        if (content == '') {
            alert('输入不能为空');
            return;
        }
        socket.emit('say', touser, content,avatarURL);
        $(e.target).val("");
        $(e.target).parent().siblings('.message-list').append(`
            <div class="message-list-item">
                <div class="native-message message-self">
                    <div class="avatar"><img src=${avatarURL}></div>
                    <div>
                        <div>
                            <span class="message-username">${username}</span>
                            <span class="time">${getTime()}</span>
                        </div>
                        <div class="text">${replace_em(content)}</div>
                    </div>
                </div>
            </div>
        `);
    }
}
function uploadPubImg(e) {
    var _this = e.target;
    //上传凭证
    $(function () {
        var p = '';
        $.ajax({
            url:'/uptoken',
            type:'GET',
            dataType:'text',
            success:function(data,status){
                var jsonData = eval("("+data+")");
                if(status == 'success'){
                    $.each(jsonData,function (index, value) {
                        p += value;
                    });
                    transB6(_this,function(data,type){
                        $(_this).parents('.input-box').siblings('.message-list').append(`
                            <div class="message-list-item">
                                <div class="native-message message-self">
                                <div class="avatar"><img src=${avatarURL}></div>
                                <div>
                                <div>
                                <span class="message-username">${username}</span>
                                <span class="time">${getTime()}</span>
                                </div>
                                <div class="image"><img style="max-height: 200px;" src=${data} class="actived"></div>
                                </div>
                                </div>
                            </div>
                        `);
                        // $(_this).parents('.input-box').siblings('.message-list').find('.image').children().css('opcity','0.45');
                        upload64(_this,data,type,0,p);
                    })
                }
            },
            error:function (dataRes, err) {
                alert(err);
            }
        });
    });
}
//私聊发送处理
function sendPrivateMessage(e) {
    if (e.keyCode == 13) {
        var content = $(e.target).val();
        var touser = $(e.target).parent().siblings('.chat-panel-header').children('span').text();
        if (content == '') {
            alert('输入不能为空');
            return;
        }
        // var touser = $('.chat-panel-private .chat-panel-header span').text();
        var fromuser = username;

        socket.emit('say-private', fromuser, touser, content,avatarURL);
        $(e.target).val("");
        $(e.target).parent().siblings('.message-list').append(`
            <div class="message-list-item">
            <div class="native-message message-self">
            <div class="avatar"><img src=${avatarURL}></div>
            <div>
            <div>
            <span class="message-username">${fromuser}</span>
            <span class="time">${getTime()}</span>
            </div>
            <div class="text">${replace_em(content)}</div>
            </div>
            </div>
            </div>
        `);
    }
}
function uploadPriImg(e) {
    var _this = e.target;
    //上传凭证
    $(function () {
        var p = '';
        $.ajax({
            url:'/uptoken',
            type:'GET',
            dataType:'text',
            success:function(data,status){
                var jsonData = eval("("+data+")");
                if(status == 'success'){
                    $.each(jsonData,function (index, value) {
                        p += value;
                    });
                    transB6(_this,function(data,type){
                        $(_this).parents('.input-box').siblings('.message-list').append(`
                            <div class="message-list-item">
                                <div class="native-message message-self">
                                <div class="avatar"><img src=${avatarURL}></div>
                                <div>
                                <div>
                                <span class="message-username">${username}</span>
                                <span class="time">${getTime()}</span>
                                </div>
                                <div class="image"><img style="max-height: 200px;" src=${data} class="actived"></div>
                                </div>
                                </div>
                            </div>
                        `);
                        // $(_this).parents('.input-box').siblings('.message-list').find('.image').children().css('opcity','0.45');
                        upload64(_this,data,type,1,p);
                    })
                }
            },
            error:function (dataRes, err) {
                alert(err);
            }
        });
    });
}
function sendImg(target,type,url) {

    var srcImg = url + "?imageView/2/w/200/h/200/q/50";
    var touser = $(target).parents('.input-box').siblings('.chat-panel-header').children('span').text();

    var fromuser = username;
    var $actived = $(target).parents('.input-box').siblings('.message-list').find('.actived').first();
    $actived.attr('src',srcImg);
    $actived.removeClass('actived');


    if(type === 1){
        socket.emit('img-private',fromuser,touser,srcImg,avatarURL);
    }else{
        socket.emit('img-public',touser,srcImg,avatarURL);
    }

}
// 正则验证URL
function checkUrl(str) {
    var strRegex = "^((https|http|ftp|rtsp|mms)?://)"
        + "?(([0-9a-z_!~*'().&=+$%-]+: )?[0-9a-z_!~*'().&=+$%-]+@)?" //ftp的user@
        + "(([0-9]{1,3}\.){3}[0-9]{1,3}" // IP形式的URL- 199.194.52.184
        + "|" // 允许IP和DOMAIN（域名）
        + "([0-9a-z_!~*'()-]+\.)*" // 域名- www.
        + "([0-9a-z][0-9a-z-]{0,61})?[0-9a-z]\." // 二级域名
        + "[a-z]{2,6})" // first level domain- .com or .museum
        + "(:[0-9]{1,4})?" // 端口- :80
        + "((/?)|" // a slash isn't required if there is no file name
        + "(/[0-9a-z_!~*'().;?:@&=+$,%#-]+)+/?)$";
    var re=new RegExp(strRegex);
    if(re.test(str)){
        return true;
    }else{
        return false;
    }
}


//监听连接，进入聊天
socket.on('connect', function () {
    socket.send(username);
});
//监听系统广播
socket.on('userIn', function (data) {
    var msg_list = $('.chat-panel .public-message-list');
    msg_list.append(
        '<div class="message-list-item">' +
        '<div class="native-message" style="align-self: center">' +
        '' + data + '</div>' +
        '</div>'
    );
});
//监听系统发给你的信息
socket.on('system', function (data) {
    var msg_list = $('.chat-panel .public-message-list');
    msg_list.append(
        '<div class="message-list-item">' +
        '<div class="native-message" style="align-self: center">' +
        '' + data + '</div>' +
        '</div>'
    );
});
//获取群组列表
socket.on('group-list',function (docs) {
    // console.log("group  " + docs);
    var group_name = "";
    var $user_list = $('.user-list');
    var $chat_panel = $('.chat-panel');
    $user_list.html('');
    $chat_panel.html("");
    $.each(docs,function (index, val) {
        group_name = val.name;
        $user_list.append(`
                        <div class="user-list-item group ${group_name}">
                            <div class="avatar"><img src="/images/dog.jpg"></div>
                            <div class="unread">0</div>
                            <div class="user-content">
                                <div>
                                    <p class="username">${group_name}</p>
                                    <p class="showTime">${getTime().split(" ")[1]}</p>
                                </div>
                                <div>
                                    <p class="showMessage">尚无消息推送</p>
                                </div>
                            </div>
                        </div>
            `);
        $('.chat-panel').append(`
                    <div class="chat-panel-public ${group_name}">
                        <div class="chat-panel-header">
                            <span>${group_name}</span>
                        </div>
                        <div class="public-message-list message-list">

                        </div>
                        <div class="input-box">
                            <input class="sayText" name="sayText" type="text" placeholder="输入回车" onkeydown="sendMyMessage(event)">
                            <div class="bqing" title="表情"></div>
                            <div class="tpian" title="图片">
                                <input type="file" class="image-input" accept="image/gif,image/jpeg,image/png" onchange="uploadPubImg(event)">
                            </div>
                        </div>
                    </div>
        `);
    });
})

//获取广播聊天
socket.on('user-say', function (name, time, touser, content,URL) {
    var unread = $('.user-list' + ' ' + '.' + touser + ' ' + '.unread').text();
    var count = Number(unread) + 1;
    $('.user-list' + ' ' + '.' + touser +' ' +'.unread').text(count);
    $('.user-list' + ' ' + '.' + touser + " " + '.showTime').text(time.split(" ")[1]);
    $('.user-list' + ' ' + '.' + touser + ' ' + '.showMessage').text("");
    $('.user-list' + ' ' + '.' + touser + ' ' + '.showMessage').append(replace_em(content));
    if ($('.notify').hasClass('on')) {
        notify(touser, content).effect('scale');
    } else {
        notify(touser, content).hide();
    }
    audio.play();

    $(".chat-panel" + " " + "." + touser + " " + ".public-message-list").append(
        `<div class="message-list-item"><div class="native-message"><div class="avatar"><img src=${URL}></div><div><div><span class="message-username">${name}</span><span class="time">${time}</span></div><div class="text">${replace_em(content)}</div></div></div></div>`
    );
});
socket.on('user-img',function (name,time,touser,srcImg,URL) {
    var unread = $('.user-list' + ' ' + '.' + touser + ' ' + '.unread').text();
    var count = Number(unread) + 1;
    $('.user-list' + ' ' + '.' + touser +' ' +'.unread').text(count);
    $('.user-list' + ' ' + '.' + touser + " " + '.showTime').text(time.split(" ")[1]);
    $('.user-list' + ' ' + '.' + touser + ' ' + '.showMessage').text("");
    $('.user-list' + ' ' + '.' + touser + ' ' + '.showMessage').append('[图片]');
    if ($('.notify').hasClass('on')) {
        notify(touser, '[图片]').effect('scale');
    } else {
        notify(touser, '[图片]').hide();
    }
    audio.play();

    $(".chat-panel" + " " + "." + touser + " " + ".public-message-list").append(
        `<div class="message-list-item"><div class="native-message"><div class="avatar"><img src=${URL}></div><div><div><span class="message-username">${name}</span><span class="time">${time}</span></div><div class="image"><img src=${srcImg}></div></div></div></div>`
    );
});
//获取私聊信息
socket.on('sayToYou', function (fromuser, time, content,URL) {
    if(!($('.user-list > div').hasClass(fromuser))){
        $('.user-list').prepend(`
        <div class="user-list-item person ${fromuser}">
            <div class="avatar"><img src=${URL}></div>
            <div class="unread">0</div>
            <div class="user-content">
                <div>
                    <p class="username">${fromuser}</p>
                    <p class="showTime">${getTime().split(" ")[1]}</p>
                </div>
                <div>
                    <p class="showMessage">尚无消息推送</p>
                </div>
            </div>
        </div>
    `);

        $('.chat-panel').append(`
               <div class="chat-panel-private ${fromuser}">
                        <div class="chat-panel-header">
                            <span>${fromuser}</span>
                        </div>
                        <div class="private-message-list message-list">

                        </div>
                        <div class="input-box">
                            <input class="sayText" name="sayText" type="text" placeholder="输入回车" onkeydown="sendPrivateMessage(event)">
                            <div class="bqing" title="表情"></div>
                            <div class="tpian" title="图片">
                                <input type="file" class="image-input" accept="image/gif,image/jpeg,image/png" onchange="uploadPriImg(event)">
                            </div>
                        </div>
                    </div>     
        `);
    }

    var unread = $(".user-list" + " " + "." + fromuser + " " + ".unread").text();
    var count = Number(unread) + 1;
    $(".user-list" + " " + "." + fromuser + " " + ".unread").text(count);
    $(".user-list" + " " + "." + fromuser + " " + ".showTime").text(time.split(" ")[1]);
    $(".user-list" + " " + "." + fromuser + " " + ".showMessage").text("");
    $(".user-list" + " " + "." + fromuser + " " + ".showMessage").append(replace_em(content));

    if ($('.notify').hasClass('on')) {
        notify(fromuser, content).effect('scale');
    } else {
        notify(fromuser, content).hide();
    }
    audio.play();
    $(".chat-panel" + " " + "." + fromuser + " " + ".private-message-list").append(
        `<div class="message-list-item"><div class="native-message"><div class="avatar"><img src=${URL}></div><div><div><span class="message-username">${fromuser}</span><span class="time">${time}</span></div><div class="text">${replace_em(content)}</div></div></div></div>`
    );
});
socket.on('imgToYou',function (fromuser, time, srcImg, URL) {
    if(!($('.user-list > div').hasClass(fromuser))){
        $('.user-list').prepend(`
        <div class="user-list-item person ${fromuser}">
            <div class="avatar"><img src=${URL}></div>
            <div class="unread">0</div>
            <div class="user-content">
                <div>
                    <p class="username">${fromuser}</p>
                    <p class="showTime">${getTime().split(" ")[1]}</p>
                </div>
                <div>
                    <p class="showMessage">尚无消息推送</p>
                </div>
            </div>
        </div>
    `);

        $('.chat-panel').append(`
               <div class="chat-panel-private ${fromuser}">
                        <div class="chat-panel-header">
                            <span>${fromuser}</span>
                        </div>
                        <div class="private-message-list message-list">

                        </div>
                        <div class="input-box">
                            <input class="sayText" name="sayText" type="text" placeholder="输入回车" onkeydown="sendPrivateMessage(event)">
                            <div class="bqing" title="表情"></div>
                            <div class="tpian" title="图片">
                                <input type="file" class="image-input" accept="image/gif,image/jpeg,image/png" onchange="uploadPriImg(event)">
                            </div>
                        </div>
                    </div>     
        `);
    }

    var unread = $(".user-list" + " " + "." + fromuser + " " + ".unread").text();
    var count = Number(unread) + 1;
    $(".user-list" + " " + "." + fromuser + " " + ".unread").text(count);
    $(".user-list" + " " + "." + fromuser + " " + ".showTime").text(time.split(" ")[1]);
    $(".user-list" + " " + "." + fromuser + " " + ".showMessage").text("");
    $(".user-list" + " " + "." + fromuser + " " + ".showMessage").append('[图片]');

    if ($('.notify').hasClass('on')) {
        notify(fromuser, '[图片]').effect('scale');
    } else {
        notify(fromuser, '[图片]').hide();
    }
    audio.play();
    $(".chat-panel" + " " + "." + fromuser + " " + ".private-message-list").append(
        `<div class="message-list-item"><div class="native-message"><div class="avatar"><img src=${URL}></div><div><div><span class="message-username">${fromuser}</span><span class="time">${time}</span></div><div class="image"><img src=${srcImg}></div></div></div></div>`
    );
})
//获取用户信息
socket.on('userInfo',function (doc,id) {
    updateInfo(doc,id);
});
//创建群组返回信息
socket.on('echo',function (data) {
    if('群组已经存在' == data){
        sweetAlert("ERROR",'群组已经存在',"error");
    }else{
        sweetAlert({
            title:"创建群组成功",
            type:"success",
        });
    }
});
//更新群组
socket.on("groupUpdate",function (name) {
    var $user_list = $('.user-list');
    $user_list.append(`
                        <div class="user-list-item group ${name}">
                            <div class="avatar"><img src="/images/dog.jpg"></div>
                            <div class="unread">0</div>
                            <div class="user-content">
                                <div>
                                    <p class="username">${name}</p>
                                    <p class="showTime">${getTime().split(" ")[1]}</p>
                                </div>
                                <div>
                                    <p class="showMessage">尚无消息推送</p>
                                </div>
                            </div>
                        </div>
            `);
    $('.chat-panel').append(`
                    <div class="chat-panel-public ${name}">
                        <div class="chat-panel-header">
                            <span>${name}</span>
                        </div>
                        <div class="public-message-list message-list">

                        </div>
                        <div class="input-box">
                            <input class="sayText" name="sayText" type="text" placeholder="输入回车" onkeydown="sendMyMessage(event)">
                            <div class="bqing" title="表情"></div>
                            <div class="tpian" title="图片">
                                <input type="file" class="image-input" accept="image/gif,image/jpeg,image/png" onchange="uploadPubImg(event)">
                            </div>
                        </div>
                    </div>
        `);
});
//信息更改成功
socket.on('setInfoDone',function (d,URL) {
    avatarURL = URL;
    $('.info-header .avatar img').attr('src',avatarURL);
    $('.chat-panel .message-list .message-list-item .message-self .avatar img').attr('src',avatarURL);
    sweetAlert({
        title:"成功更改资料",
        type:"success",
    });
});
//信息更改失败
socket.on('modifyFail',function (err) {
    sweetAlert("ERROR",err,"error");
});
//监听其他用户头像更新
socket.on('urlUpdate',function (who, url) {
    console.log('urlUpdate' + who + '  ' + url);
    $('.user-list' + ' ' + '.' + who + ' ' + '.avatar' + ' ' + 'img').attr('src', url);
    var $m_list = $('.chat-panel' + ' ' + '.' + who).filter('.chat-panel-private').find('.native-message');
    console.log($m_list);
    $m_list.each(function (index) {
       if(!($(this).hasClass('message-self'))){
           $(this).find('.avatar').children('img').attr('src',url);
       }
    });
});







