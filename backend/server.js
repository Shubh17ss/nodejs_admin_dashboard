const express=require('express');
const cors=require('cors');
const pool=require('./database/config');
const jwt=require('jsonwebtoken');
const SECRET_KEY='sdfjhasduhtva$3sdf1adf';


const app=express();

app.use(express.json());
app.use(cors());



const generateAccessToken=(userObject)=>{
    return jwt.sign(userObject,SECRET_KEY,{expiresIn:'1h'});
}

function verifyToken(req,res,next){
    console.warn("Middleware running");
    let passed_token=req.headers['authorization'];
    if(passed_token){
        passed_token=passed_token.split(' ');
        token=passed_token[1];
        jwt.verify(token,SECRET_KEY,(err,valid)=>{
            if(err){
                res.status(401).send({result:"Token not valid"});
            }
            else{
                next();
            }
        })
    }
    else{
        res.status(403).send({result:"Authorization token missing"});
    }

}




app.get('/',(req,res)=>{
    res.send("App running successfully");
    
})

app.post('/register',(req,res)=>{
    const {name,email,password}=req.body;
    const userObject={name:password};
     pool.query("INSERT INTO USERS(name, email, password) VALUES($1, $2, $3)",[name,email,password],(error,results)=>{
        if(error){
            res.status(401).send("Internal server error");
        }
        else{
            const accessToken=generateAccessToken(userObject);
            res.send([{token:accessToken},[{name:name,email:email}]]);
        }
        
    })
})

app.post('/login',(req,res)=>{
    
  const {email,password}=req.body;
  const userObject={name:password};
   pool.query("SELECT id,name,email from USERS where email=$1 AND password=$2",[email,password],(error,results)=>{
        if(error){
            res.status(401).send("Internal server error");
        }
        else if(results.rows.length==0){
            res.send([{token:"null"}]);
        }
        else
        {
            const accessToken=generateAccessToken(userObject);
            res.send([{token:accessToken},results.rows]);
        }
    })
});

app.post('/addProduct',(req,res)=>{
    const {name, price, category, userid, company}=req.body;
    pool.query("INSERT INTO Products(name,price,category,userid,company) VALUES($1,$2,$3,$4,$5)",[name,price,category,userid,company],(error,results)=>{
        if(error){
            res.status(401).send("Internal Server Error");
        }
        else
        {
            res.status(200).send(req.body);
        }
    })
})

app.get('/products',(req,res)=>{
    pool.query("SELECT * FROM PRODUCTS",(error,results)=>{
        if(error){
            res.status(401).send("Internal Server Error");
        }
        else{
            if(results.rows.length==0){
                res.send({results:"No Products found"});
            }
            else{
                res.status(200).json(results.rows);
            }
        }
    })
})

app.delete('/product/:id',(req,res)=>{
    const id=req.params.id;

    pool.query('DELETE FROM PRODUCTS WHERE product_id=$1',[id],(error,results)=>{
        if(error){
            res.status(401).send("Internal Server Error");
        }
        else{
            res.status(200).send({results:"Product deleted"});
        }
    })
})

app.get('/getProduct/:id',(req,res)=>{
    const product_id=req.params.id;
    pool.query("SELECT * FROM PRODUCTS WHERE product_id=$1",[product_id],(error,results)=>{
        if(error){
            res.send("Internal Server error");
        }
        else{
            res.status(200).json(results.rows);
        }
    })
})

app.put('/updateProduct/:id',(req,res)=>{
    const product_id=req.params.id;
    const {name,price,category,company}=req.body;
    pool.query('UPDATE PRODUCTS SET name=$1, price=$2, category=$3, company=$4 WHERE product_id=$5',[name,price,category,company,product_id],(error,results)=>{
            if(error){
                res.send("Internal Server Error");
            }
            else{
                res.status(200).send(req.body);
            }
    })
})

app.get('/search/:key',(req,res)=>{
    const key=req.params.key;
    pool.query('SELECT * from products where LOWER(name) ~ LOWER($1) OR LOWER(category) ~ LOWER($1)',[key],(error,results)=>{
        if(error){
            res.status(401).send("Internal Server Error");
        }
        else{
            res.status(200).json(results.rows);
        }
    });

})









app.listen(5000,()=>{
    console.log("Running on port 3000");
});