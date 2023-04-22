var express=require("express");
var bodyParser=require("body-parser");
var mongoose=require("mongoose");

const app=express()




app.use(bodyParser.json({}));
app.use(express.static('public'));
app.use(bodyParser.urlencoded({
    extended:true
}))



/*Connent with database*/
//
mongoose.connect('mongodb+srv://Rajan:Rajan@cluster0.0g62fft.mongodb.net/register',{
    useNewUrlParser:true,
    useUnifiedTopology:true,
});

var db=mongoose.connection;

// Display the connecton
db.on('error',()=>{
    console.log("Error to connecto to databse");

});
db.once('open',()=>{console.log("Connecte to the database ")})


// call the post method for the register form 


app.post("/register",(req,res)=>{
    
    // access the element using the post method for the new usere 
    var name=req.body.name;
    var email=req.body.email;
    var phno=req.body.phno;
    var password=req.body.password;

    //Schem to store the data into the object of data 
    var data={
        "name":name,
        "phno":phno,
        "email":email,
        "password":password
    }
// inserte the data inside the collection user 

    db.collection('users').insertOne(data,(err,collection)=>{
        if(err){
            throw err;
        }
        console.log("Record inserted successfully ");

    });
    // go to the next page after insert data into database successfully 

    return res.redirect('/login.html');
})

// login get method 
app.get("/login",(req,res)=>{
    res.render("login");
})


// login post method 

app.post("/login",async(req,res)=>{
    try{
        const email=req.body.email;
        const password=req.body.password;
         // check the user into the database 
            
       /*
         const usermail=await db.collection('users').findOne({email:email});
            const userpassword=await db.collection('users').findOne({password:password});
            
            console.log(usermail)
            console.log(userpassword)
           
            if(usermail.password===userpassword.password){
                res.status(201).render("/signup");
            }
            else{
                
                res.send("not Register user")
            }*/

const user = await db.collection('users').findOne({ email: email, password: password });
console.log(user);
if (user) {
  res.status(201).render("/register");
} else {
  res.send("not a registered user");
}


        //console.log(usermail);
        //console.log(email+ " is "+password);

    }catch{
        res.status(400).send("Invalid User eroro  ");

    }



    
})






app.get("/",(req,res)=>{

    res.set({
        "ALLow-access-allow-Origin":"*"
    })
    return res.redirect('register.html')
}).listen(3000)
console.log("Listern on port  3000");