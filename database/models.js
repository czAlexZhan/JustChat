/**
 * To operate database javascript
 * Created by zhan on 16-10-31.
 */
module.exports = {
    user:{
        avatar:{type:String,default:"http://ok2xurmdf.bkt.clouddn.com//o_1bbm42u9h17a03qkgdk1v9qlgoc.gif?imageMogr2/thumbnail/100x100!/blur/1x0/quality/100"},
        name:{type:String,required:true},
        password:{type:String,required:true},
        sex:{type:String,default:"男"},
        career:{type:String,default:"学生"},
        age:{type:String,default:"18"},
        city:{type:String,default:"广州"},
        retrieve:{type:String,default:"2017"},
        status:{type:String,default:"down"},
    },
    group:{
        name:{type:String,required:true},
        time:{type:String,require:true}
    },
    content:{
        name:{type:String,required:true},
        avatar:{type:String,required:true},
        data:{type:String,require:true},
        dataType:{type:String,default:"public"},
        toUser:{type:String,default:"group"},
        time:{type:String,require:true}
    }
};