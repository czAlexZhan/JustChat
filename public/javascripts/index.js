/**
 * Created by 詹 on 2016/11/8.
 */
var $group = $('.nav-tab .group');
var $system = $('.nav-tab .system');
var $group_manage = $('.group-manage');
var $system_setting = $('.system-setting');
var $user_info = $('#user-info');
var $self_info = $('#self-info');

var current = 0;
//头像上传qiniu
var Qiniu1 = new QiniuJsSDK();
var option = {
    runtimes: 'html5,flash,html4',
    browse_button: 'image-input',
    max_file_size: '4mb',
    flash_swf_url: 'bower_components/plupload/js/Moxie.swf',
    // dragdrop: true,
    chunk_size: '2mb',
    multi_selection: !(mOxie.Env.OS.toLowerCase() === "ios"),
    uptoken_url: 'uptoken',
    domain: 'http://ok2xurmdf.bkt.clouddn.com/',
    get_new_uptoken: false,
    auto_start: true,
    log_level: 5,
    unique_names: true,
    init: {
        'BeforeUpload': function (up, file) {
            $('#update-info>:nth-child(2) >div').append(` <span class="upload-mask">等待...</span>`);
        },
        'UploadProgress': function (up, file) {
            $('#update-info .upload-mask').text(file.percent+'%');
        },
        'FileUploaded': function (up, file, info) {
            var domain = up.getOption('domain');
            var res = jQuery.parseJSON(info);
            var sourseLink = domain + '/' + res.key + '?imageMogr2/thumbnail/100x100!/blur/1x0/quality/100';
            $('#update-info>:nth-child(100n+2) img').attr('src',sourseLink);
            $('#update-info>:nth-child(100n+2) > div span').remove();
        },
        'Error': function (up, err, errTip) {
            alert(err);
        }

    }
}
var uploader = Qiniu1.uploader(option);


var $audio = document.getElementById('audio');



$(document).on('click',function(){
    $group_manage.hide();
    $system_setting.hide();
    $user_info.hide();
    $self_info.hide();
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
//阻止更新信息面板冒泡
// $('#update-info').on('click',false);
$('#user-info').on('click',false);
$('#self-info').on('click',false);


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
    $('.chat-panel' + ' ' + '.' + username).css({"display": "flex"
    ,"display": "-webkit-flex"});
    username = '';
    // $('.chat-panel-public .chat-panel-header span').text(username);
});
//点击用户添加面板
$('.user-panel .user-list').on('click','.person',function(e){
    var username = $(this).find('.username').text();
    $(this).find('.unread').text("0");
    $('.chat-panel > div').css('display','none');
    $('.chat-panel' + ' ' + '.' + username).css({"display": "flex"
        ,"display": "-webkit-flex"});
    // $('.chat-panel-private .chat-panel-header span').text(username);
    username = '';
});
//清除未读条数
$('.chat-panel').on('click','>div',function (e) {
   var className = $(this).children('.chat-panel-header').children('span').text();
   $('.user-panel' + ' ' + '.user-list' + ' ' + '.' + className).children('.unread').text('0');
});
//注销
$('.loginOut').on('click',function () {
    window.location.href = 'login';
});
//源码
$('.github').on('click',function () {
    window.open('https://github.com/czAlexZhan/JustChat');
    $system_setting.hide();
});
//用户信息
$('.chat-panel').on('click','.chat-panel-public .message-list .avatar',function (e) {
    e.stopPropagation();
    var $parent = $(this).parent();
    var name = $(this).siblings().find('.message-username').text();

    if($parent.hasClass('message-self')){
        var id = '#self-info';
        getUserInfo(name,id);
        $('.user-info').hide();
        $('#self-info>:nth-child(100n+3) span').text(name);
        $('#self-info').fadeToggle();
    }else{
        var id = '#user-info';
        getUserInfo(name,id);
        $('.user-info').hide();
        $('#user-info>:nth-child(100n+3) span').text(name);
        $('#user-info').fadeToggle();
    }

});
//点击按钮私聊
$('#user-info .chatPrivate').on('click',function (e) {
    $(this).parents('#user-info').hide();
    var name = $('#user-info>:nth-child(100n+3) span').text();
    var URL = $('#user-info > div:nth-child(100n+2) img').attr('src');
    if(!($('.user-list > div').hasClass(name))){
        $('.user-list').prepend(`
        <div class="user-list-item person ${name}">
            <div class="avatar"><img src=${URL}></div>
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
               <div class="chat-panel-private ${name}">
                        <div class="chat-panel-header">
                            <span>${name}</span>
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
        $('.chat-panel > div').css('display','none');
        $('.chat-panel' + ' ' + '.' + name).css({"display": "flex"
            ,"display": "-webkit-flex"});
    }else{
        $('.chat-panel > div').css('display','none');
        $('.chat-panel' + ' ' + '.' + name).css({"display": "flex"
            ,"display": "-webkit-flex"});
    }

});
//点击创建群组
$('.cBtn').on('click',function () {
    var name = $(this).siblings('input').val();
    createGroup(name);
    $(this).siblings('input').val('');
    $group_manage.hide();
});
//点击修改信息
$('#self-info .mInfo').on('click',function (e) {
    e.stopPropagation();
    $(this).parents('.user-info').hide();
    var $span = $('#self-info .info span');
    var $input = $('#update-info .info input');
    var imageSrc = $('#self-info > div:nth-child(100n+2) img').attr('src');
    $('#update-info > div:nth-child(100n+2) img').attr('src',imageSrc);
    $input.each(function (index) {
        $(this).attr('placeholder',$span[index].innerHTML);
    });
    $("#update-info").fadeToggle();
});
//点击更新用户信息
$('#image-input').click(function (e) {
    e.stopPropagation();
});
$('#update-info .info input').click(function (e) {
    e.stopPropagation();
});
$('#update-info .updateInfo').on('click',function (e) {
    var imageURL = $('#update-info>:nth-child(100n+2) img').attr('src');
    var $input = $('#update-info .info input');
    var name = $('#nickname').text();
    var info = new Array();

    $input.each(function (index) {
        info.push($(this).val());
    });

    var data = {
        'avatar':imageURL,
        'sex':info[0],
        'age':info[1],
        'career':info[2],
        'city':info[3]
    };
    // console.log(data);
    modifyUserInfo(name,data);
    $(this).parents('#update-info').hide();
});
//点击显示原图
$('.chat-panel').on('click','.image',function (e) {
    var num = $('.chat-panel .image').index(this);
    var user = $(this).parents('.message-list').siblings('.chat-panel-header').children('span').text();
    var url = $(this).children('img').attr('src');
    var pureUrl = url.split('?');
    $('.preview .showImg img').attr('src',pureUrl[0]);
    $('.preview .showImg img').attr('data-set',num);
    $('.preview .showImg img').attr('data-user',user);

    $('.preview').fadeToggle();
});
//关闭预览
$('.preview .showImg >:nth-child(100n+2)').on('click',function () {
    $('.preview .showImg img').attr('src','');
    $('.preview .showImg img').attr('data-set','');
    $('.preview .showImg img').attr('data-user','');
    $('.preview').fadeToggle();
});
//点击下一张
$('.preview .prenext span:nth-child(100n+2)').on('click',function (e) {
    e.stopPropagation();
    var user = $('.preview .showImg img').attr('data-user');
    var $image_list = $('.chat-panel'+' '+'.'+user+' '+'.image');
    var list =  Number($('.preview .showImg img').attr('data-set'));
    if(list == ($image_list.length-1)){
        alert('这是最后一张');
    }else{
        var $img = $image_list.get(list+1);
        var url = $($img).children('img').attr('src');
        if(checkUrl(url)){
            var pureUrl = url.split('?');
            $('.preview .showImg img').attr('src',pureUrl[0]);
            $('.preview .showImg img').attr('data-set',list+1);
        }else{
            $('.preview .showImg img').attr('src',url);
            $('.preview .showImg img').attr('data-set',list+1);
        }
    }
});
//点击上一张
$('.preview .prenext span:nth-child(100n+1)').on('click',function (e) {
    e.stopPropagation();
    var user = $('.preview .showImg img').attr('data-user');
    var $image_list = $('.chat-panel'+' '+'.'+user+' '+'.image');
    var list =  Number($('.preview .showImg img').attr('data-set'));
    console.log(list)
    if(list == 0){
        alert('前面没有了');
    }else{
        var $img = $image_list.get(list-1);
        var url = $($img).children('img').attr('src');
        if(checkUrl(url)){
            var pureUrl = url.split('?');
            $('.preview .showImg img').attr('src',pureUrl[0]);
            $('.preview .showImg img').attr('data-set',list-1);
        }else{
            $('.preview .showImg img').attr('src',url);
            $('.preview .showImg img').attr('data-set',list-1);
        }
    }
});


$('.preview .img-tools >:nth-child(100n+1)').on('click',function () {
    current = (current+90)%360;
    $('.preview .showImg img').css('transform','rotate('+'-'+current+'deg)');
});
$('.preview .img-tools >:nth-child(100n+2)').on('click',function () {
    current = (current+90)%360;
    $('.preview .showImg img').css('transform','rotate('+current+'deg)');
});