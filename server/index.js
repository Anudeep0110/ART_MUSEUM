const express = require('express');
const bodyparser = require('body-parser');
const cors = require('cors');
const mysql = require('mysql');
const path = require('path');
const multer = require('multer');
const moment = require('moment/moment');
const fs = require('fs');
const bf = require('buffer')
const mail = require('nodemailer')

const app = express();

app.use('./Assets/',express.static('./appgallery/src/Components/Assets/'))
app.use(cors())
app.use(bodyparser.json());
const con = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password:'Aytas@111_rawse@111',
    database:'Art'
})
con.connect((err) => {
    if (err) throw err;
    console.log("MySQL connection established");
})

var storage = multer.diskStorage({
    destination: (req,file,callBack) => {
        callBack(null, './appgallery/src/Components/Assets')
    },
    filename: (req,file,callBack) => {
        callBack(null, 'insert'+path.extname(file.originalname))
    }
})

var upload = multer({
    storage: storage
})

    var images
app.post('/image',upload.single("file"),(req,res) => {
            if(!req.file){
                console.log("File not found")
            }else{
                images=fs.readFileSync(req.file.path);
                console.log()
                con.query("Select username from login",(err,results) => {
                    console.log(results)
                    var name = results[0].username
                con.query("Insert into InsertedImage set ?",{username:name,img:images,img_name:nameofimage},(err,result) => {
                    if(err) throw err
                    console.log(result)
                    res.send(result)
                })
            })
                
            }
})



app.post('/delete',(req, res) => {
    let img = req.body.img
    let art = req.body.art
    con.query("Select img from InsertedImage where img_name = ? and username = (select username from Artist where Art_Name = ? and Image_Name = ? )",[art,img,img]
    ,(err,result) => {
        var b64 = result[0].img
        fs.writeFileSync('./appgallery/src/Components/Uploads/image.jpg',b64)
        res.send({res:"SUCCESS"})
        })
        con.query("Delete from InsertedImage where img_name = ? and username = (select username from Artist where Art_Name = ? and Img_Name = ?)",[art,img,img],(err, result) => {
        if(err) throw err
        console.log(result)
    })
    con.query("Delete from Artist where Image_Name = ?",[img],(err, result) => {
        if(err) throw err
        console.log(result)
    })
})
var nameofimage
app.post('/imgdetails',(req,res) => {
    var name
        let iname = req.body.imgName
        let aname = req.body.aname
        nameofimage = req.body.imgName
        let date = req.body.date
        let note = req.body.note
        con.query("Select username from login",(err,results) => {
            console.log(results)
            name = results[0].username
        con.query("Insert INTO Artist Set ?",{Art_Name:aname,Image_Name:iname,Added_date:date,snote:note,username:name},(err, result) => {
            if(err) throw err
            res.send({msg:"SUCCESS"})
        })})
})


app.post('/imgsearch',(req, res) => {
    global.image =''
    var sart = req.body.sart
    var simage = req.body.simage
    console.log(sart,simage)
    con.query("Select img from InsertedImage where img_name = ? and username = (select username from Artist where Art_Name = ? and Image_Name = ? )",[simage,sart,simage]
    ,(err,result) => {
        var b64 = result[0].img
        fs.writeFileSync('./appgallery/src/Components/Uploads/image.jpg',b64)
        res.send({res:"SUCCESS"})
        })
})

app.post('/signup', (req, res) => {
        let uname = req.body.uname;
        let pwd = req.body.pwd;
        let cfpwd = req.body.cfpwd
        let q = "Insert INTO SignUp (uname,pwd,cfpwd) VALUES (?,?,?)";
        con.query(q,[uname,pwd,cfpwd],(err, result) => {
            if (err) throw err;
            res.send(JSON.stringify({"status": 200, "error": null, "response": result}));
    })
})
var match
app.post('/login', (req, res) => {
    let uname = req.body.uname
    match = req.body.uname
    let sql = "SELECT * FROM SignUp WHERE uname = ?";
    con.query(sql, [uname], (err, result) => {
        if (err){
            res.send({err:err})
        }
        if(result.length>0){
            res.send(JSON.stringify(result))
        }else{
            res.send({msg:"Reenter Password"})
        }
    })
    con.query("Update login set username = ?",[uname],(err,result) => {
        console.log(result)
    })
})

var count
app.post('/collect',(req,res) => {
    con.query("Select count(img) as count from InsertedImage",(err,resc) => {
            count=resc[0].count
            // console.log(count)
    con.query("select img from InsertedImage limit ? ",[count],(err,results,feilds) => {
        for(var i = 0;i<count;i++){
            fs.writeFileSync(`./appgallery/src/Components/Uploads/img${i}.jpg`,results[i].img)
        }
    })
    con.query("Select Art_Name, Image_Name from artist order by Art_Name desc limit ?",[count],(err,result,feilds) => {
        console.log(result)
        res.json(result)
    })
}) 
})

app.post('/fb',(req,res) => {
    let mail = req.body.mail
    let fb = req.body.fb
    con.query("Insert into feedback set ? ",{email:mail,feedback:fb},(err,result) => {
            console.log(result)
            res.send({msg:"SUCCESS"})
    })
})

app.post('/names',(req,res) => {
    con.query("Select Image_Name, Art_Name from artist limit ?",[count],(err,result) => {
        console.log(result)
    })
})
app.post('/mailsent',(req,res) => {
    var mailsent = req.body.mail
    con.query("Insert into registermails set ?",{email:mailsent},(err,result) => {
        console.log(result)
    })
    var transporter = mail.createTransport({
        service: 'hotmail',
          auth: {
            user: 'subhaleka@outlook.com',
            pass: 'Dell@4569',
          }
    });
      
      var mailOptions = {
        from: 'subhaleka@outlook.com',
        to: mailsent,
        subject: 'Thank you Note !',
        text: "Thank you for subscribing to our Community! Any Updates or newslatter will be reach to you fast...We assure that we don't harm your privacy."
      };
      
      transporter.sendMail(mailOptions, function(error, info){
        if (error) {
          console.log(error);
        } else {
          console.log('Email sent: ' + info.response);
        }
      });
})

app.post('/homesearch',(req,res) => {
    let s=req.body.s
    if(s!==''){
    con.query("Select img,img_name from insertedimage where img_name = ?",[s],(err, result) => {
        console.log(result);
        if(err){
            res.send({msg:"error"})
        }
        else {
        fs.writeFileSync('./appgallery/src/Components/Uploads/homesearch.jpg',result[0].img)
        res.send({msg:result[0].img_name})
        }
    })
}
})

app.listen(4000,() => {
    console.log("Listening on http://localhost : 4000")
})


