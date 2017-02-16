var express = require('express');
var router = express.Router();
//var User = global.dbHandle.getModel('user');
/* GET index page. */
router.get('/', function(req, res, next) {
  res.redirect('/login');
});
/*
    GET login page
 */
router.route("/login").get(function(req,res){
  res.render('login',{title:"User login"});
}).post(function(req,res){

    var User = global.dbHandle.getModel('user');
    var uname = req.body.uname;
    User.findOne({name:uname},function(err,doc){
        if(err){
            res.send(500);
            console.log(err);
        }else if(!doc){
            // req.session.error = '用户不存在';
            res.send(404,"用户不存在");
        }else{
            if(req.body.upwd != doc.password){
                // req.session.error = '密码错误';
                res.send(404,"密码错误");
            }else{
                req.session.user = doc;
                console.log(doc)
                if(doc.status == "up") {
                    res.send(404,"用户已登录");
                }else{
                    statusSetUp(uname);
                    res.send(200);
                }
            }
        }
    });
});

//登录上线处理
function statusSetUp(oName){
    var User = global.dbHandle.getModel('user');
    User.update({name:oName},{$set:{status:'up'}},function(err,doc){
        if(err){
            console.log(err);
        }else{
            console.log(oName + "  上线")
        }
    });
}
/*
    GET register page
 */
router.route("/register").get(function(req,res){
    res.render('register',{title:'User register'});
}).post(function(req,res){
    var User = global.dbHandle.getModel('user');
    var uname = req.body.uname;
    var upwd = req.body.upwd;
    User.findOne({name:uname},function(err,doc){
        if(err){
            res.send(500,"网络异常错误");
            // req.session.error = '网络异常错误';
            console.log(err);
        }else if(doc){
            // req.session.error = '用户名已存在';
            res.send(500,"用户名已存在");
        }else{
            User.create({
                name:uname,
                password:upwd
            },function(err,doc){
                if(err){
                    res.send(500);
                    console.log(err);
                }else{
                    req.session.error = '用户名创建成功';
                    res.send(200,"用户名创建成功");
                }
            });
        }
    });
});

/*
    GET home page
 */
router.get('/home',function(req,res){
    if(!req.session.user){
        req.session.error = '请先登陆';
        res.redirect('/login');
    }
    res.render('home',{title:'Home'});
});

/*
    GET logout page
 */
router.get('logout',function(res,req){
    req.session.user = null;
    req.session.erroe = null;
    res.redirect('/');
});
module.exports = router;
