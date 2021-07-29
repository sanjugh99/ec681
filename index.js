let express = require('express');
const bodyParser = require('body-parser');
const session = require('express-session')
let mysql = require('mysql');

var mycrypto=require('crypto');
var key="password";
var algo='aes256';

let app = express();
app.set('view engine','hbs');
app.use(express.json());

let db = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "",
    database: "cv",
});
db.connect(function(err) {
    if (err) {
      console.error('error connecting: ' + err.stack);
      return;
    }
    console.log('connected as id ' + db.threadId);
});





app.use(session({
    secret: 'Your_Secret_Key',
    resave: true,
    saveUninitialized: true
}))

var sess;

app.get('/',(req,res) => {
    res.render("index");
});
app.get('/blog',(req,res) => {
    res.render("blog");
});


app.get('/sign_up',(req,res)=>{
    res.render("signup");
});
app.get('/login',(req,res)=>{
    res.render("login");
});

app.get('/resource',(req,res)=>{
    res.render("resource");
});

app.get('/about',(req,res)=>{
    res.render("about");
});
app.get('/overview',(req,res)=>{
    res.render("overview");
});
app.get('/faq',(req,res)=>{
    res.render("faq");
});

app.get('/logout',(req,res) => {
    req.session.destroy((err) => {
        if(err) {
            return console.log(err);
        }
        res.render('index');
    });

});








app.use(bodyParser.urlencoded({ extended: true })); 

app.post("/signupenc",(req,res)=>{
    let {uname,email, npass, cpass,profile}  = req.body;



    if(npass.length<8){
        res.send({message:'Password is too small'});
        res.end();
    }
    else{
        if(npass ==cpass){
        
            var myCipher= mycrypto.createCipher(algo,key);
            var encpass=myCipher.update(npass,'utf8','hex')
            +myCipher.final('hex');
        
            db.query('INSERT INTO users (name,email, password) VALUES (?,?,?)',
            [uname,email, encpass],
            (err,result)=>{
                if(err){
                    res.status(422).send({err:err})
                }else{
                    console.log("SignupSucessful");
                    
                    res.render("login");
                    // res.status(201).send({message:'Your data inserted succesfully'})
                }
            });
        }
        else{
            res.send({message:'both password not matched'})
        }
    }
    
});

app.post("/loginenc",(req,res)=>{
    let {email, npass}  = req.body;
    // console.log(npass);
    var myCipher= mycrypto.createCipher(algo,key);
    var encpass=myCipher.update(npass,'utf8','hex')
    +myCipher.final('hex')

    console.log(encpass);

    db.query('SELECT * FROM users WHERE email=?',
        [email],
        (err,result)=>{
            if(err){
                res.send({ err: err })
            }
            if(result.length>0 && result[0].password == encpass){
                console.log(result[0].password);
                console.log(email);
                console.log("Login Successfull");
                sess = req.session;
                sess.email = email;
                res.render('afterlogin',{users:sess.email});
            }
            else {
                res.status(404).send({ message: 'Invalid Credential' });
                console.log("given pass ", npass);
            }
        }

    )
})






app.listen(4500);






















// https://codeforgeek.com/manage-session-using-node-js-express-4/
// https://www.geeksforgeeks.org/session-management-using-express-session-module-in-node-js/
// https://github.com/saurabhnative/loginformsBackend