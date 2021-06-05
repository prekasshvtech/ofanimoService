const sqlite3 = require('sqlite3');
const express = require("express");
var app = express();
var cors = require('cors');
app.use(cors());
const bodyParser = require("body-parser");
app.use(bodyParser.json());
var qs = require('querystring');
var fs = require('fs');
var https = require('https');
var privateKey  = fs.readFileSync('key.pem', 'utf8');
var certificate = fs.readFileSync('cert.pem', 'utf8');
// var httpsServer = https.createServer(credentials, app);

// parse requests of content-type - application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: true }));

const HTTP_PORT = 3000

https.createServer({
    key: privateKey,
    cert: certificate
}, app).listen(HTTP_PORT);

// app.listen(HTTP_PORT, () => {
//     console.log("Server is listening on port " + HTTP_PORT);
// });
// httpsServer.listen(3000);

const db = new sqlite3.Database('./prelaunch.db', (err) => {
    if (err) {
        console.error("Erro opening database " + err.message);
    } else {
        db.run('CREATE TABLE customer( \
            id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,\
            firstName NVARCHAR(20)  NOT NULL,\
            lastName NVARCHAR(20)  NOT NULL,\
            email NVARCHAR(20),\
            mobile NVARCHAR(100),\
            message NVARCHAR(100)\
        )', (err) => {
            if (err) {
                console.log("Table Customer already exists.");
            }
            // let insert = 'INSERT INTO customer (firstName, lastName, email, mobile, message) VALUES (?,?,?,?,?)';
        });

        db.run('CREATE TABLE user_master (userid INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL, Username NVARCHAR(75) NOT NULL, userProductMap INTEGER NULL )', (err) => {
            if (err) {
                console.log("Table User Master already exists.");
            }
            // let insert = 'INSERT INTO user_master (Username, Region, Password) VALUES (?,?,?)';
        });

        

        db.run('CREATE TABLE sub_product_master ( SubProductID INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL, ProductIDs INTEGER NOT NULL, SubProductName NVARCHAR(75) NOT NULL)', (err) => {
                if (err) {
                    console.log("Table Sub Product Master already exists.");
                }
                // let insert = 'INSERT INTO sub_product_master (ProductId, SubProductName) VALUES (?,?)';
            });
        // db.run('CREATE TABLE sub_product_master ( \
        //     SubProductID INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL, \
        //     ProductId INTEGER NULL, \
        //     SubProductName NVARCHAR(45) NULL, \
        //   )', (err) => {
        //       console.log(err)
        //     if (err) {
        //         console.log("Table Sub Product Master already exists.");
        //     }
        //     let insert = 'INSERT INTO sub_product_master (ProductId, SubProductName) VALUES (?,?)';
        // });

        db.run('CREATE TABLE rating ( \
            RatingID INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL, \
            UserID INTEGER NULL, \
            ProductID INTEGER NULL, \
            ProductVariant NVARCHAR(45) NULL, \
            Rating INTEGER NULL \
          )', (err) => {
            if (err) {
                console.log("Table Rating already exists.");
            }
            // let insert = 'INSERT INTO rating (UserID, ProductID, ProductVariant, Rating) VALUES (?,?,?,?)';
        });
        db.run(`CREATE TABLE product_master (ProductID INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL, ProductName NVARCHAR(45) NOT NULL, Description NVARCHAR(45) NOT NULL)`, (err) => {
            if(err){
                console.log("TABLE EXIST")
            }
        });
        
        
    }
});

app.get("/customers", (req, res, next) => {
  db.all("SELECT * FROM customer", [], (err, rows) => {
      if (err) {
        res.status(400).json({"error":err.message});
        return;
      }
      res.status(200).json(rows);
    });
});

app.get("/product", (req, res, next) => {
    db.all("SELECT * FROM product_master", [], (err, rows) => {
        if (err) {
          res.status(400).json({"error":err.message});
          return;
        }
        res.status(200).json(rows);
      });
  });

  app.get("/getEmail", (req, res, next) => {
      console.log(req.query.email)
      db.all("SELECT * FROM user_master WHERE Username = '"+req.query.email+"'", [], (err, rows) => {
          if(err) {

          }
          res.status(200).json(rows);
      })
  })
  app.get("/subProduct",  (req, res, next) => {
      
    db.all("SELECT * FROM sub_product_master WHERE ProductIDs = '"+req.query.id+"'", [], (err, rows) => {
        if (err) {
          res.status(400).json({"error":err.message});
          return;
        }
        res.status(200).json(rows);
      });
  });

app.post("/customers", (req, res, next) => {
  var reqBody = req.body;
  db.run(`INSERT INTO customer (firstName, lastName, email, mobile, message) VALUES (?,?,?,?,?)`,
      [reqBody.firstName, reqBody.lastName, reqBody.email, reqBody.mobile, reqBody.message],
      function (err, result) {
          if (err) {
              res.status(400).json({ "error": err.message })
              return;
          }
          res.status(201).json({
              "employee_id": this.lastID
          })
      });
});

app.get("/usermaster", (req, res, next) => {
    let query = "SELECT * FROM user_master";
    if(req.query.user != "" && req.query.user != undefined){
        query = "SELECT * FROM user_master WHERE Username = '"+req.query.user+"'";
    }
    db.all(query, [], (err, rows) => {
        if (err) {
          res.status(400).json({"error":err.message});
          return;
        }
        res.status(200).json(rows);
      });
  });

app.post("/usermaster", (req, res, next) => {
    var reqBody = req.body;
    db.run(`INSERT INTO user_master (Username, userProductMap) VALUES (?,?)`,
        [reqBody.Username, 1],
        function (err, result) {
            if (err) {
                res.status(400).json({ "error": err.message })
                return;
            }
            res.status(201).json({
                "employee_id": this.lastID
            })
        });
  });

  app.get("/ratings", (req, res, next) => {
    let query = "SELECT * FROM rating";
    if(req.query.user != "" && req.query.user != undefined && req.query.product != "" && req.query.product != undefined){
        
        query = "SELECT * FROM rating WHERE UserID="+parseInt(req.query.user) +" AND ProductID="+parseInt(req.query.product) ;
        console.log(query)
    }
    else if(req.query.user != "" && req.query.user != undefined){
        query = "SELECT * FROM rating WHERE UserID="+req.query.user;
        console.log(query)
    }
    db.all(query, [], (err, rows) => {
        if (err) {
          res.status(400).json({"error":err.message});
          return;
        }
        res.status(200).json(rows);
      });
  })

  app.post("/ratings", (req, res, next) => {
    var reqBody = req.body;
    console.log(reqBody)
    for(var i=0; i < reqBody.length; i++){
        db.run(`INSERT INTO rating (UserID, ProductID, ProductVariant, Rating) VALUES (?,?,?,?)`,
        [reqBody[i].UserID, reqBody[i].ProductID, reqBody[i].ProductVariant, reqBody[i].Rating]
        ), (err, result) => {
            if (err) {
                res.status(400).json({ "error": err.message })
                return;
            }
        };
    }
            employee_id =  this.lastID;
            res.status(201).json({
                "employee_id": this.lastID
            })
  });


app.post("/product", (req, res, next) => {
    // console.log(req.params)
    var reqBody = req.body;
    var employee_id = 0;
    ProductName = req.body.ProductName;
    Description = req.body.Description;
    subproduct1 = req.body.type1;
    subproduct2 = req.body.type2;
    subproduct3 = req.body.type3;

    var prms = new Promise((resolve, rej) => {
        db.run(`INSERT INTO product_master (ProductName,Description) VALUES (?,?)`,
        [reqBody.ProductName, reqBody.Description],
        function (err, result) {
            if (err) {
                res.status(400).json({ "error": err.message })
                return;
            }
            employee_id =  this.lastID;
            res.status(201).json({
                "employee_id": this.lastID
                
            })
            resolve('success');
            console.log("DOne")
        });
        
    }).then((res) => {
        db.run(`INSERT INTO sub_product_master (ProductIDs,SubProductName) VALUES (?,?)`, [employee_id, subproduct1],
    function (err, result) {
        console.log(err);
        console.log(result)
        if(err) {

        }
    });
    db.run(`INSERT INTO sub_product_master (ProductIDs,SubProductName) VALUES (?,?)`, [employee_id , subproduct2], 
    function (err, result) {
        console.log(err);
        console.log(result)
        if(err) {

        }
    });
    db.run(`INSERT INTO sub_product_master (ProductIDs,SubProductName) VALUES (?,?)`, [employee_id , subproduct3] ,
    function (err, result) {
        console.log(err);
        console.log(result)
        if(err) {

        }
    });
    })
})



  app.post("/userproductmap", (req, res, next) => {
    // console.log(req.params)
    var reqBody = req.body;
    // console.log(req.body)
    db.run(`INSERT INTO user_master (firstName, lastName, email, mobile, message) VALUES (?,?,?,?,?)`,
        [reqBody.firstName, reqBody.lastName, reqBody.email, reqBody.mobile, reqBody.message],
        function (err, result) {
            if (err) {
                res.status(400).json({ "error": err.message })
                return;
            }
            res.status(201).json({
                "employee_id": this.lastID
            })
        });
  });


  app.post("/rating", (req, res, next) => {
    // console.log(req.params)
    var reqBody = req.body;
    // console.log(req.body)
    db.run(`INSERT INTO rating (UserID, ProductID, ProductVariant, Rating) VALUES (?,?,?,?)`,
        [reqBody.UserID, reqBody.ProductID, reqBody.ProductVariant, reqBody.Rating],
        function (err, result) {
            if (err) {
                res.status(400).json({ "error": err.message })
                return;
            }
            res.status(201).json({
                "employee_id": this.lastID
            })
        });
  });

  app.put("/ratings", (req, res, next) => {
      var reqBody = req.body;
      var query = req.body;
      for(var i=0; i < reqBody.length; i++){
        db.all('UPDATE rating SET Rating ='+reqBody[i].Rating+' WHERE UserID='+reqBody[i].UserID +' AND ProductVariant="'+req.body[i].ProductVariant+'"',
        (err, rows) => {
            if (err) {
              res.status(400).json({"error":err.message});
              return;
            }
            // res.status(200).json(rows);
          })
      }
      
  })

  app.put("/usermaster", (req, res, next) => {
    var reqBody = req.body;
    var query = req.query;
    console.log("UserMaster")
    console.log('UPDATE user_master SET userProductMap ='+parseInt(query.productid)+' WHERE UserID='+parseInt(query.userid))
    db.all('UPDATE user_master SET userProductMap ='+parseInt(query.productid)+' WHERE UserID='+parseInt(query.userid),[], (err, rows) => {
        if (err) {
          res.status(400).json({"error":err.message});
          return;
        }
        res.status(200).json(rows);
      });
})