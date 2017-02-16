/**
 * Created by 詹 on 2016/11/8.
 */
var $group = $('.nav-tab .group');
var $system = $('.nav-tab .system');
var $group_manage = $('.group-manage');
var $system_setting = $('.system-setting');
var $mask = $('.mask');
var $audio = document.getElementById('audio');

$(document).on('click',function(){
    $group_manage.hide();
    $system_setting.hide();
});
$group.on('click',function(e){
    e.stopPropagation();
    if($mask.hasClass('fadeOut')){
        $mask.removeClass('fadeOut');
    }else{
        $mask.addClass('fadeOut');
    }
    $group_manage.fadeToggle();
});
$system.on('click',function(e){
    e.stopPropagation();
    $system_setting.fadeToggle();
});
$('.group-manage').on('click',false);
$('.system-setting').on('click',false);
$('.glyphicon-remove').on('click',function(e){
    e.stopPropagation();
    $(this).parent().parent().parent().hide();
})
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
})
$('.user-panel .user-list').on('click',' .group',function(e){
    $('.chat-panel .chat-panel-private').css('visibility','hidden');
});
$('.user-panel .user-list').on('click','.person',function(e){
   
    $('.chat-panel .chat-panel-private').css('visibility','visible');
    var username = $('.person .user-content > :first-child p').first().text();
    $('.chat-panel-private .chat-panel-header span').text(username);
});











