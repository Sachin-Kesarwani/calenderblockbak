

let mongoose=require("mongoose")


let imageSchema=mongoose.Schema({
    userID:String,
    image:{
       data:Buffer,
        ContentType:String
    }
})

let imagemodel=mongoose.model("Image",imageSchema)
module.exports=imagemodel