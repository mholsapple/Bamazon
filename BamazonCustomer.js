var mysql = require('mysql');
var inquirer = require('inquirer');

var connection = mysql.createConnection({
    host: "localhost",
    port: 3306,
    user: "root", //Your username
    password: "", //Your password
    database: "Bamazon"
})

connection.connect(function(err) {
    if (err) throw err;
    console.log("connected as id " + connection.threadId);
})

//sets the default value to 0

var sumTotal = 0;

//RUN A FUNCTION THAT WILL DISPLAY ALL THE ITEMS FOR SALE

var runFunction = function(previousBalance) {

    sumTotal = parseFloat(previousBalance);

    connection.query('SELECT * FROM products', function(err, res) {
        for (var i = 0; i < res.length; i++) {
            console.log("Item ID:" + res[i].ItemID + " \n" + "Product Name:" + res[i].ProductName + " \n" + "Department Name:" + res[i].DepartmentName + " \n" + "Price:"+ " $" + res[i].Price + " \n" + "Quantity Remaining:" + res[i].StockQuantity + " \n");
        }
        console.log("-----------------------------------");
        salesTransaction();
    })
}

//PROMPTS THE USER TO ENTER AN ID NUMBER THEY WOULD LIKE TO PURCHASE. WILL NEED TO CREATE A FUNCTION TO CHECK THE ID'S FROM THE PRODUCT LIST. ALSO, WILL ASK HOW MANY ITEMS THEY WOULD LIKE TO PURCHASE. WILL DEDUCT THE AMOUNT FROM THE TOTAL QUANTITY. ELSE, THEY WILL GET AN INSUFFICIENT QUANTITY ERROR
var salesTransaction = function() {

    inquirer.prompt([{
        name: "itemId",
        message: "What is the item id you would like to purchase?",
        validate: function(value) {
            if (isNaN(value) == false && parseInt(value) > 0 && parseInt(value) <= 10) {
                return true;
            } else {
                return false;
            }
        }
    }, {
        name: "quantity",
        message: "How many would you like to purchase?",
        validate: function(value) {
            if (isNaN(value) == false && parseInt(value) > 0) {
                return true;
            } else {
                return false;
            }
        }
    }]).then(function(answer) {

        //makes the connection to know where to select from and to find out how many items are in stock
        connection.query('SELECT * FROM products', function(err, res) {
            if (err) throw err;
            //This is going to check the quantity available and check it based on the user's input
            var currentQuantity = parseFloat(res[answer.itemId -1].StockQuantity);
            // console.log(currentQuantity);
            // console.log(typeof(currentQuantity));
            // console.log(answer.quantity)
            // console.log(typeof(answer.quantity));

            var quantityRequested = parseFloat(answer.quantity);

            //checking to see if the current quantity in stock has enough to fulfil the request the user inputted. If it does, run the function. Otherwise, tell them Insufficient Quantity.
            if (currentQuantity >= quantityRequested){
                //console.log("Enough in stock")

                currentQuantity = currentQuantity - quantityRequested;

                sumTotal = parseFloat(sumTotal + quantityRequested * res[answer.itemId -1].Price).toFixed(2);

                connection.query("UPDATE products SET ? WHERE ?", [{
                    StockQuantity: currentQuantity
                }, {
                    ItemID: answer.itemId
                }], function(err, res) {
                    console.log("Total cost of cart: $" + sumTotal + " \n") 

                    runFunction(sumTotal);
                })


            }else{
                console.log("Insufficent Quantity. The maximum quantity remaining is: " + currentQuantity + "\n");

                runFunction(sumTotal);
            }       
        })
    })
}



runFunction(0);
