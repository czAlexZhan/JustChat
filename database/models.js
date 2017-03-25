/**
 * To operate database javascript
 * Created by zhan on 16-10-31.
 */
module.exports = {
    user:{
        avatar:{type:String,required:true},
        name:{type:String,required:true},
        password:{type:String,required:true},
        sex:{type:String,default:"男"},
        career:{type:String,default:"学生"},
        age:{type:String,default:"18"},
        city:{type:String,default:"广州"},
        status:{type:String,default:"down"}
    },
    group:{
        name:{type:String,required:true},
        time:{type:String,require:true}
    },
    content:{
        name:{type:String,required:true},
        data:{type:String,require:true},
        dataType:{type:String,default:"public"},
        toUser:{type:String,default:"group"},
        time:{type:String,require:true}
    }
};