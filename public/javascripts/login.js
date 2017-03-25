/**
 * Created by czalexzhan on 2017/1/21.
 */
$('#register').click(function(){
    window.location.href = 'register';
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

