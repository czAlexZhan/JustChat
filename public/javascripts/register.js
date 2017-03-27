/**
 * Created by czalexzhan on 2017/1/22.
 */

function myFocues(root,handle) {
    root.focus(handle);
}
function myBlur(root,handle) {
    root.blur(handle);
}
$('#login').click(function(){
    window.location.href = 'login';
});
//正则判断非法字符
myFocues($('#username'),function () {
    $('.un p').css('color','rgba(234, 234, 234, 0.63)');
});
myBlur($('#username'),function(){
    var pat=new RegExp("[^a-zA-Z0-9\_\u4e00-\u9fa5]","i");
    if(pat.test($('#username').val()) == true){
        $('.un p').css('color','red');
    }
});
myFocues($('#password'),function(){
    $('.pw p').css('color','rgba(234, 234, 234, 0.63)');
});
myBlur($('#password'),function () {
    var pat = /^(\w){6,20}$/;
    if(pat.test($('#password').val()) == false){
        $('.pw p').css('color','red');
    }
});
myFocues($('#rpassword'),function(){
    $('.rpw').find('p').remove();
});
myBlur($('#rpassword'),function () {
   if(!($('#rpassword').val() == $('#password').val())){
       $('.rpw').append(`<p style="color:red;font-size: 12px">密码不一致</p>`);
   } 
});
myFocues($('#age'),function () {
    $('.age').find('p').remove();
});
myBlur($('#age'),function () {
    var pat = /^[0-9]*[1-9][0-9]*$/;
    var age = $('#age').val();
    if(pat.test(age) == true){
        if(Number(age) >= 120){
            $('.age').append(`<p style="color:red;font-size: 12px">年龄有误</p>`);
        }
    }else{
        $('.age').append(`<p style="color:red;font-size: 12px">年龄有误</p>`);
    }
});
$('#register').click(function(){
    var imageURL = $('.touxiang .img img').attr('src');
    var username = $('#username').val();
    var password = $('#password').val();
    var rpassword = $("#rpassword").val();
    var career = $("#career").val();
    var age = $("#age").val();
    var city = $("#city").val();
    var sex = $(".option").val();

    var data = {
        'avatar':imageURL,
        'uname':username,
        'upwd':password,
        'career':career,
        'age':age,
        'city':city,
        'sex':sex
    };
    $.ajax({
        url:'/register',
        type:'post',
        data:data,
        success:function(dataRes,status){
            if(status == 'success'){
                sweetAlert({
                    title:"注册成功",
                    type:"success",
                },function () {
                    window.location.href = 'login';
                });
            }
        },
        error:function(dataRes,err){
            sweetAlert("ERROR",dataRes.responseText,"error");
            // window.location.href = 'register';
        }
    });
});
//七牛上传
$(function() {
    var uploader = Qiniu.uploader({
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
            'FilesAdded': function (up, files) {

            },
            'BeforeUpload': function (up, file) {

            },
            'UploadProgress': function (up, file) {
                console.log(file.percent + "  " + file.speed);
                // $('.touxiang .img').text(file.percent + '%');
                // var progress = new FileProgress(file, 'fsUploadProgress');
                // var chunk_size = plupload.parseSize(this.getOption('chunk_size'));
                // progress.setProgress(file.percent + "%", file.speed, chunk_size);
            },
            'UploadComplete': function () {

            },
            'FileUploaded': function (up, file, info) {
                var domain = up.getOption('domain');
                var res = jQuery.parseJSON(info);
                var sourseLink = domain + '/' + res.key + '?imageMogr2/thumbnail/100x100!/blur/1x0/quality/100';
                $('.touxiang .img img').attr('src',sourseLink);
            },
            'Error': function (up, err, errTip) {

            }

        }
    });

    // uploader.bind('FileUploaded', function () {
    //
    // });
});