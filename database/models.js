/**
 * To operate database javascript
 * Created by zhan on 16-10-31.
 */
module.exports = {
    user:{
        name:{type:String,required:true},
        password:{type:String,required:true},
        sex:{type:String,default:"boy"},
        status:{type:String,default:"down"}
    },
    content:{
        name:{type:String,required:true},
        data:{type:String,require:true},
        dataType:{type:String,default:"public"},
        toUser:{type:String,default:"group"},
        time:{type:String,require:true}
    }
};