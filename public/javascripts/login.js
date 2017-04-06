/**
 * Created by czalexzhan on 2017/1/21.
 */

$('#register').click(function(){
    window.location.href = 'register';
});
$('.retrieve span').click(function () {
    $('.repwd').fadeToggle();
});
$('.repwd .bt>:nth-child(100n+1)').click(function () {
    $('.repwd').fadeToggle();
});
$('.repwd .bt>:nth-child(100n+2)').click(function () {
    var username = $('#username').val();
    var question = $('#qs').val();
    var data = {
        'username':username,
        'qs':question
    }
    console.log(data)
    if(username !== ''){
        if(question !== ''){
            $.ajax({
                url:'retrieve',
                type:'post',
                data:data,
                success:function (dataRes, status) {
                    if(status == 'success'){
                        alert('密码是->'+dataRes)
                        $('#password').val(dataRes);
                    }
                },
                error:function (dataRes, status) {
                    if(status == 'error'){
                        sweetAlert("ERROR",dataRes.responseText,"error");
                    }
                }
            });
        }else{
            sweetAlert("ERROR",'请先输入答案',"error");
        }
    }else{
        sweetAlert("ERROR",'请先输入用户名',"error");
    }

    $('.repwd').fadeToggle();
});
$('#login').click(function(){
    var username = $('#username').val();
    var password = $('#password').val();
    var data = {'uname':username,'upwd':password};
    $.ajax({
        url:'/login',
        type:'post',
        data:data,
        success:function(dataRes,status){
            if(status == 'success'){
                window.location.href = 'home';
            }
        },
        error:function(dataRes,status){
            if(status == 'error'){
                sweetAlert("ERROR",dataRes.responseText,"error");
                // window.location.href = 'login';
            }
        }
    });
});

