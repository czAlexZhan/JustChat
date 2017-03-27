/**
 * Created by czalexzhan on 2017/1/21.
 */
// $(document).ready(function () {
//     if (Cookies.get("rmbUser") == "true") {
//         $("#ck_rmbUser").attr("checked", true);
//         $("#username").val(Cookies.get("username"));
//         $("#password").val(Cookies.get("password"));
//     }
// });

$('#register').click(function(){
    window.location.href = 'register';
});

$('#login').click(function(){
    var username = $('#username').val();
    var password = $('#password').val();
    var data = {'uname':username,'upwd':password};
    // if ($("#ck_rmbUser").attr("checked")) {
    //     Cookies.set("rmbUser", "true", { expires: 7 }); //存储一个带7天期限的cookie
    //     Cookies.set("username", username, { expires: 7 });
    //     Cookies.set("password", password, { expires: 7 });
    // } else {
    //     Cookies.set("rmbUser", "false", { expire: -1 });
    //     Cookies.set("username", "", { expires: -1 });
    //     Cookies.set("password", "", { expires: -1 });
    // }
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

