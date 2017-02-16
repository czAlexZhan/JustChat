/**
 * Created by czalexzhan on 2017/1/22.
 */
$('#login').click(function(){
    window.location.href = 'login';
});

$('#register').click(function(){
    var username = $('#username').val();
    var password = $('#password').val();
    var rpassword = $("#rpassword").val();

    if(password !== rpassword){
        $('#password').css('border','1px solid red');
        $('#rpassword').css('border','1px solid red');
    }else if(password === rpassword){
        var data = {'uname':username,'upwd':password};
        $.ajax({
            url:'/register',
            type:'post',
            data:data,
            success:function(dataRes,status){
                if(status == 'success'){
                    alert(dataRes);
                    window.location.href = 'login';
                }
            },
            error:function(dataRes,err){
                alert(dataRes.responseText);
                window.location.href = 'register';
            }
        });
    }
});