/**
 * 1. after successfull login : generate a jwt token 
 * npm i jsonwebtoken, cookie-parser
 * jwt.sign(payload, secret, {expiresIn:'1d'})
 * 
 * 
 * 2.send token(generated in the server side ) to the client site
 * 
 * localstorage-->easier
 * 
 * httpOnly cookies ---> better
 * 
 * 3. for sensitive or secure or private or proteted apis: send token to the serccer site
 * 
 * on the server side->
 * app.use(cors({
     origin:['http://localhost:5174'],
     credentials:true
 }))
 * 
 
 in the client side

 use axios get, post, delete, patch for secure apis and must use : withCredentials

add this-->
 {withCredentials:true}

 exmple:
    axios.post('http://localhost:3000/jwt', user, {withCredentials:true})
 * 
 * 4.validate the token in the server site
 * if validate -> provide data
 * if not valid-> logout
 * 
 * 
 * 5.check right user accessing his own data based on permission
 * */ 



   //////////////////// // 

   