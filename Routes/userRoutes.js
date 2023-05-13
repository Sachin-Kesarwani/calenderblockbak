


let {Router}=require("express")
const { SignupModel } = require("../Model/user.model")
let userRoute=Router()
const path = require('path');

var bcrypt = require('bcryptjs');
const multer = require("multer");
const bodyParser = require("body-parser");
var jwt = require('jsonwebtoken');
let fs=require("fs")
const imagemodel = require("../Model/profile.image");
const taskmiddleware = require("../Middleware/task.middle");
userRoute.get("/",(req,res)=>{
    res.status(200).send({"msg":"Sinup and Login Basic Route"})
})

userRoute.post("/signup",async(req,res)=>{
    let data=req.body
    try {
        let storeddata=await SignupModel.find({email:data.email})
        if(storeddata.length==0){
            bcrypt.hash(data.password, 8,async function(err, hash) {
                data.password=hash
                let postdata=new SignupModel(data)
                await postdata.save()
                let storeddata=await SignupModel.findOne({email:data.email})
                delete data.password
                console.log(storeddata)
                let token = jwt.sign({ userid: storeddata._id}, process.env.secretkey);
                 res.status(200).send({"msg":"Successfully Signup",data:data,token:token})
            });
        }else{
            res.status(400).send({"msg":"User Exist , Please Login "})
        }
    } catch (error) {
        res.status(200).send({"er":"Something went wrong in Signup"})
    }
})


userRoute.post("/login",async(req,res)=>{
    let data=req.body
   
    try {
    
        let storeddata=await SignupModel.find({email:data.email})
        if(storeddata.length>0){
          
            bcrypt.compare(data.password,storeddata[0].password, function(err, result) {
               
                if(result){
                    let data=storeddata[0]
        
                  
                     let token = jwt.sign({ userid: data._id}, process.env.secretkey);
                     res.status(200).send({"msg":"Successfully Login",data:{email:data.email,name:data.name},token,token})
                }else{
                    res.status(400).send({"msg":"password is wrong"})
                }
            });

        
        }else{
            res.status(400).send({"msg":"You have not Signup till now"})
        }
    } catch (error) {
        res.status(400).send({"msg":"Something went wrong in login"})
    }


})

///////////////////////////////

userRoute.use(bodyParser.urlencoded(
    { extended:true }
))
const uploadDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}
var storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, './uploads')
    },
    filename: function (req, file, cb) {
    //   cb(null, file.originalname + '-' + Date.now()+".jpg")
    cb(null, Date.now()+ '-' +file.originalname )
    }
  })
 
  var upload = multer({ storage: storage })
  userRoute.post("/uploadphoto",upload.single('avatar'),taskmiddleware,async(req,res)=>{

//   let tes=fs.readFileSync(req.file.path)
  //console.log(req.file.buffer.toString('base64'))
    
    try {
        let path=req.file.filename
        let userID=req.body.userid
        let data={
            
            userID:userID,
            image:{
                data:fs.readFileSync(`./uploads/${path}`),
                ContentType:"image/jpg",
                
            }
        }
         let alreadypresent=await imagemodel.find({userID:data.userID})
    //   console.log(data,alreadypresent)
         if(alreadypresent.length>0){
           console.log("if")
        
      await imagemodel.findByIdAndUpdate({_id:alreadypresent[0]._id},{image:data.image})
        console.log("after update")
         }else{
          
            let savingdata=new imagemodel(data)
            await savingdata.save()
         }
        
       
      
        let imagedata=await imagemodel.findOne({userID:userID})
      
        // fs.unlinkSync(data.image)
        res.status(200).send({"msg":"Uploaded",data:imagedata})
    } catch (error) {
        res.status(400).send({"msg":"Something went wrong"})
    }
   
  //res.send("hello")
})







userRoute.get("/details",(req,res)=>{
    let token=req.headers.authorization
    console.log(token)
    jwt.verify(token, process.env.secretkey, function(err, decoded) {
        console.log(decoded) 
        res.send(decoded)
      });
   
})
module.exports=userRoute