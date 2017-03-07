/**
 * Created by 詹 on 2016/11/8.
 */
var $group = $('.nav-tab .group');
var $system = $('.nav-tab .system');
var $group_manage = $('.group-manage');
var $system_setting = $('.system-setting');
// var $mask = $('.mask');
var $audio = document.getElementById('audio');

// window.onunload = function () {
//     window.location.reload(window.location = "login");
// };
$(document).on('click',function(){
    $group_manage.hide();
    $system_setting.hide();
});
//监听创建群聊点击事件
$group.on('click',function(e){
    e.stopPropagation();
    // if($mask.hasClass('fadeOut')){
    //     $mask.removeClass('fadeOut');
    // }else{
    //     $mask.addClass('fadeOut');
    // }
    $group_manage.fadeToggle();
});
//监听系统设置点击事件
$system.on('click',function(e){
    e.stopPropagation();
    $system_setting.fadeToggle();
});
//阻止创建群聊面板冒泡
$('.group-manage').on('click',false);
//阻止系统设置面板冒泡
$('.system-setting').on('click',false);
//监听关闭点击事件
$('.glyphicon-remove').on('click',function(e){
    e.stopPropagation();
    $(this).parent().parent().parent().hide();
});
//系统设置面板点击事件
$('.system-setting .switch>div ').on('click',function(e){
    e.stopPropagation();
    var _this = $(this);
    if(_this.children().hasClass('on')){
        _this.children().removeClass('on');
        _this.children().addClass('off');
        if(_this.children().hasClass('sound')){
            $audio.muted = true;
        }
    }else{
        _this.children().removeClass('off');
        _this.children().addClass('on');
        if(_this.children().hasClass('sound')){
            $audio.muted = false;
        }
    }
});
//点击群组添加面板
$('.user-panel .user-list').on('click',' .group',function(e){
    var username = $(this).find('.username').text();
    $(this).find('.unread').text("0");
    $('.chat-panel > div').css('display','none');
    if(!($('.chat-panel > div').hasClass(username))){
        $('.chat-panel').append(`
                    <div class="chat-panel-public ${username}">
                        <div class="chat-panel-header">
                            <span>${username}</span>
                        </div>
                        <div class="public-message-list message-list">

                        </div>
                        <div class="input-box">
                            <input class="sayText" name="sayText" type="text" placeholder="输入回车" onkeydown="sendMyMessage(event)">
                            <div class="bqing" title="表情"></div>
                            <div class="tpian" title="图片">
                                <input type="file" class="image-input" accept="image/gif,image/jpeg,image/png">
                            </div>
                        </div>
                    </div>
        `);
    }
    $('.' + username).css({"display": "flex"
    ,"display": "-webkit-flex"});
    username = '';
    // $('.chat-panel-public .chat-panel-header span').text(username);
});
//点击用户添加面板
$('.user-panel .user-list').on('click','.person',function(e){
    var username = $(this).find('.username').text();
    $(this).find('.unread').text("0");
    $('.chat-panel > div').css('display','none');
    if(!($('.chat-panel > div').hasClass(username))){
        $('.chat-panel').append(`
               <div class="chat-panel-private ${username}">
                        <div class="chat-panel-header">
                            <span>${username}</span>
                        </div>
                        <div class="private-message-list message-list">

                        </div>
                        <div class="input-box">
                            <input class="sayText" name="sayText" type="text" placeholder="输入回车" onkeydown="sendPrivateMessage(event)">
                            <div class="bqing" title="表情"></div>
                            <div class="tpian" title="图片">
                                <input type="file" class="image-input" accept="image/gif,image/jpeg,image/png">
                            </div>
                        </div>
                    </div>     
        `);
    }
    $('.' + username).css({"display": "flex"
        ,"display": "-webkit-flex"});
    $('.chat-panel-private .chat-panel-header span').text(username);
    username = '';
});
$('.chat-panel').on('click','>div',function (e) {
    console.log('点击');
   var className = $(this).children('.chat-panel-header').children('span').text();
   console.log(className);
   $('.user-panel' + ' ' + '.user-list' + ' ' + '.' + className).children('.unread').text('0');
});










