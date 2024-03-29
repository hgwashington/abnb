var express = require('express');
var router = express.Router();
const db = require('../db');
const bcrypt = require('bcryptjs');
const randToken = require('rand-token');

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

router.post('/signup',(req, res, next)=>{
  // someone wants to signup!! im so excited!!
  // First of all... Check to see if data is valid
  const { first,last,email,password } = req.body;
  if((!first) || (!last) || (!email) || (!password)){
    // STOP. Goodbye.
    res.json({
      msg: "invalidData"
    });
    return;
  }
  // if we get this far, the data is valid. See if the user is in the db
  const checkUserQuery = `SELECT * FROM users WHERE email = ?`
  db.query(checkUserQuery,[email],(err,results)=>{
    if(err){throw err}; //FULL STOP!!!!!
    if(results.length > 0){
      // this email has been used. Goodbye.
      res.json({
        msg: "userExists"
      });
    }else{
      // this email has not been used. lets add it
      const insertUserQuery = `INSERT INTO users
        (first, last, email, password, token)
        VALUES
        (?,?,?,?,?)`
        // turn the password into something evil for db storage
        const salt = bcrypt.genSaltSync(10);
        const hash = bcrypt.hashSync(password, salt);
        const token = randToken.uid(50); // this is the users valet ticket
        db.query(insertUserQuery,[first,last,email,hash,token],(err2)=>{
          if(err2){throw err2}
          // Hooray!
          res.json({
            msg: "userAdded",
            token,
            email,
            first
          })
        });
    }
  })
})

router.post('/login',(req, res)=>{
  const {email, password} = req.body;
  const getUserQuery = `select * from users where email = ?`
  db.query(getUserQuery, [email], (err, results)=>{
    if(err){throw err}
    if(results.length>0){
        const thisRow = results[0]
        const isValidPass = bcrypt.compareSync(password, thisRow.password)
        if (isValidPass){
          const token = randToken.uid(50)
          const updateUserTokenQuery = 'update users set token = ? where email = ?'
          db.query(updateUserTokenQuery,[token,email],(err)=>{
            if(err){throw errs}
          })
          res.json({
            msg:'loggedIn', 
            first: thisRow.first,
             email: thisRow.email,
             token
          })
        }else{
          res.json({
            msg:'badPass'
          })
        }
    }else{
        res.json({
          msg: 'noEmail'
        })
    }
  })
  console.log(req.body)

})

module.exports = router;