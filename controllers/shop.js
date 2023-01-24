 "use strict"

const fs = require('fs');
const path = require('path');
const request = require('request');
const braintree = require('braintree');

const checkoutNodeJssdk = require('@paypal/checkout-server-sdk');


let gateway = braintree.connect({
  accessToken: 'access_token$sandbox$dfz5j9gwwkv6ydvj$d5b0ac09dba48ecc26101b0b5c7af9e4'
});



const PDFDocument = require('pdfkit');

const express = require('express');
const  { Product } = require('../db/models/Product');
const { User }= require('../db/models/User');
const Order = require('../db/models/Order');
const { json } = require('body-parser');

exports.getShopIndex = async (req, res, next) => {

    let isAuthenticated = req.session.isLoggedIn;
    let isAuthorised = req.session.isAdmin;
    let cart = req.session.cart;

    //find all product and sorted by date
    const prods = await Product.find()
     .sort('-createdAt')

    res.render('shop/index', {
        prods,
        isAuthenticated, 
        isAuthorised,
        cart,
        alartMsg:req.flash('cartAlart')
    });
}

// get product base on ID 
exports.getProduct = async (req, res, next) => {
    try {
        let isAuthenticated = req.session.isLoggedIn;
        let isAuthorised = req.session.isAdmin;
        let cart = req.session.cart;

        const prodId = req.params.id
        //find prduct by Id
        const product = await Product.findById(prodId);

        console.log(prodId);
        res.render('shop/product-details', {
        product,
        isAuthenticated, 
        isAuthorised,
        cart
    });

    }
    catch(err) {
        console.log(err);
    }   
}

//get cart
exports.getCart = async (req, res, next) => {
    try {
      let cart = req.session.cart;

      let currentUser= req.session.user._id; // Store User session 
      const user = await User.findById(currentUser) // find user base on UserID 
      let totalPrice = 0;
      let totalItems = 0;
      req.user = user; // assign user to req.user
      
      req.user
      .populate('cart.items.productId')
      .execPopulate()
      .then(user => {
          console.log(req.user.cart.items + ' ... still geting')
        const products = req.user.cart.items;
            products.forEach(p => {
                totalPrice +=  p.quantity * p.productId.price;
                totalItems += p.quantity;               
            })
          
        res.render('shop/cart', {
          products: products,
          totalPrice,
          totalItems,
          cart
        });
      })
    }
    catch(err) {

      const error = new Error(err);
        error.httpStatusCode = 500;
        return next(error);
    }
}

// post / add to cart
exports.postCart = async (req, res, next) => {

    try {
        let totalItems = 0;
        let currentUser = req.session.user._id; // Store User session 
        const prodId = req.body.productId;

        const user = await User.findById(currentUser) // find user base on UserID 
        req.user = user; // assign user to req.user

        const product = await Product.findById(prodId); //find product by Id
       
        //calling addToCart mtd from User model
        const result = req.user.addToCart(product)  ;  //add product to cart
        
        //resolve result (promise object)
        let cast = await Promise.resolve(result);
        let cart = 0;

        let casts = cast.cart.items;
        console.log(cast + ' cast');

        // loop thru products in card
        casts.forEach( p => {
            cart +=p.quantity; //add prodcut qunatity to cart
        })
        req.session.cart = cart; //assign cart to cart session
        
        // display alart 
        req.flash("cartAlart", "You successful add 1 item to your Cart.");

        res.redirect('/shop');

    }
    catch(err) {
        console.log(err);
        const error = new Error(err);
        error.httpStatusCode = 500;
        return next(error);
    }
  
};

// remove item from cart
exports.postCartDeleteProduct = async (req, res, next) => {
   try {
      
    let currentUser = req.session.user._id; // Store User session 
    const prodId = req.body.productId;

    const user = await User.findById(currentUser);
    
    //calling removeFromCart mtd from User model
    const result = user.removeFromCart(prodId);

    //resolve result (promise object)
    var cast = await Promise.resolve(result);
    let cart = 0;
    let casts = cast.cart.items;
        casts.forEach( p => {
            cart +=p.quantity;
        
        })
    req.session.cart = cart;
    res.redirect('/cart');

   }
   catch(err) {
    console.log(err);
    const error = new Error(err);
    error.httpStatusCode = 500;
    return next(error);
   }
};

 // get chckout
exports.getCheckout = async (req, res, next) => {
    let currencies;
    let cart = req.session.cart;
    let currentUser = req.session.user._id; // Store User session 
    let user = await User.findById(currentUser) // find user base on UserID 
    req.user = user;
    
    req.user
      .populate('cart.items.productId')
      .execPopulate()
      .then(user => {
        const products = user.cart.items;
        let total = 0;
        products.forEach(p => {
          total += p.quantity * p.productId.price;
        });       
        
        res.render('shop/checkout', {
          cart,
          products: products,
          totalSum: total,
          currencies,
          successMsg: req.flash('success'),
          errors: req.flash('error'),

        });

     
        //console.log(url);
      })
      .catch(err => {
        const error = new Error(err);
        error.httpStatusCode = 500;
        return next(error);
      });
  };

// post checkout 
exports.doCheckout = async (req, res, next) => {
  try {
   let currencies;
    let cart = req.session.cart;
    let currentUser = req.session.user._id; // Store User session 
    let user = await User.findById(currentUser) // find user base on UserID 
    req.user = user;
    
    req.user
      .populate('cart.items.productId')
      .execPopulate()
      .then(user => {
        const products = user.cart.items;
        let total = 0;
        products.forEach(p => {
          total += p.quantity * p.productId.price;
        });
        
        //handle payment gateway
        let options = {
          'method': 'GET',
          'url': 'https://api.nowpayments.io/v1/currencies',
          'headers': {
            'x-api-key': '3P61C7P-RTG48D4-MMTT6XJ-CNS0WK9'
          }
        };
        request(options, function (error, response) {
          if (error) throw new Error(error);
          console.log(response.body);
         // currencies = response.body;
         if(!error) {
           currencies = response.body;
          res.render('shop/checkout', {
            //response,
            currencies,
            cart,
            totalSum: total,
            successMsg: req.flash('success'),
            errors: req.flash('error'),
            products: products
          })
        }
        });
        
    });
    
  }
  catch(err) {
    console.log(err);
  }
  
      
      //   // Use the payment method nonce here
      //   var nonceFromTheClient = req.body.paymentMethodNonce;
      //   // Create a new transaction for $10
      //   var newTransaction = gateway.transaction.sale({
      //     amount: total,
      //     paymentMethodNonce: nonceFromTheClient,
      //     options: {
      //       // This option requests the funds from the transaction
      //       // once it has been authorized successfully
      //       submitForSettlement: true
      //     }
      //   }, function (error, result) {
      //       if (result) {
      //         console.log('payment console ' + JSON.stringify(result));
              
      //         //resolve result (promise object)
      //         res.send(result);
      //       } else {
      //         res.status(500).send(error);
      //       }
      //   });
  
      //   //console.log(url);
      // })
      // .catch(err => {
      //   const error = new Error(err);
      //   error.httpStatusCode = 500;
      //   return next(error);
      // });
 
}

// testing codee
exports.getChk = async (req, res, next) => {

  try{
    let cart = req.session.cart;
    let result;
    const transactionId = req.params.id;
  
    gateway.transaction.find(transactionId).then((transaction) => {
      result = createResultObject(transaction);
      console.log('hey Bhoyee.. I reach herer');
     // res.redirect('/');
      res.render('shop/orders', {
        orders,
        transaction,
        result,
        cart
      });
  
    });
  }
  catch(err) {
    console.log(err)

  }
 
}

//testing getting status
exports.getStatus = async (req, res, next) => {
  console.log('I receieved the click');
  let options = {
    'method': 'GET',
    'url': 'https://api.nowpayments.io/v1/status',
    'headers': {
    }
  };
  request(options, function (error, response) {
    if (error) {
        console.log('networking error');
        error.httpStatusCode = 500;
        return next(error);}
    console.log('Crypto Payment Yeah 00000' + response.body);
  });

}

// testing api 
exports.doCryptoPay = async (req, res, next) => {

  try {
  console.log('Hey this is cryptoPay');
  let Currencies;
  let total, products;
  let cart = req.session.cart;
  let options = {
      'method': 'GET',
      'url': 'https://api.nowpayments.io/v1/currencies',
      'headers': {
        'x-api-key': '3P61C7P-RTG48D4-MMTT6XJ-CNS0WK9'
      }
    };
    request(options, function (error, response) {
      if (error) throw new Error(error);
      console.log(String(response.body) + ' typeof' + typeof(response.body) + ' testing ' + response);
      Currencies = JSON.parse(response.body);
      Currencies = Currencies.currencies;
      
     console.log('Hey currency I got you here' + " " + Currencies );

  res.render('shop/pin', {
    
    Currencies,
    cart,
    totalSum: total,
    successMsg: req.flash('success'),
    errors: req.flash('error'),
    products: products
  })



    });

    console.log('Hey currency I got you here' + " " + Currencies );
  }
  catch(err) {
    console.log(err);

  }
  
  // res.render('shop/checkout', {
    
  //   currencies,
  //   cart,
  //   totalSum: total,
  //   successMsg: req.flash('success'),
  //   errors: req.flash('error'),
  //   products: products
  // })

}

// testing api 
exports.CryptoPay = async (req, res, next) => {

  try {
  console.log('Hey this is cryptoPay');
  let Currencies;
  let total, products;
  let cart = req.session.cart;
  let options = {
      'method': 'GET',
      'url': 'https://api.nowpayments.io/v1/currencies',
      'headers': {
        'x-api-key': '3P61C7P-RTG48D4-MMTT6XJ-CNS0WK9'
      }
    };
    request(options, function (error, response) {
      if (error) throw new Error(error);
      console.log(String(response.body) + ' typeof' + typeof(response.body) + ' testing ' + response);
      Currencies = JSON.parse(response.body);
      Currencies = Currencies.currencies;
      
     console.log('Hey currency I got you here' + " " + Currencies );


    });

    console.log('Hey currency I got you here' + " " + Currencies );
  }
  catch(err) {
    console.log(err);

  }
}


//Post Order
exports.postOrder = async (req, res, next) => {
    let totalSum = 0;
    let cart = 0;
    let currentUser = req.session.user._id; // Store User session 
    let user = await User.findById(currentUser) // find user base on UserID 
    req.user = user;

    req.user
      .populate('cart.items.productId')
      .execPopulate()
      .then(user => {  
        user.cart.items.forEach(p => {
          totalSum += p.quantity * p.productId.price;
        });

        const products = user.cart.items.map(i => {
          return { quantity: i.quantity, product: { ...i.productId._doc } };
        });
        const order = new Order({
          user: {
            email: req.user.email,
            userId: req.user
          },
          products: products
        });
        return order.save();
      })
      .then(result => {
        
         req.session.cart = cart;
        return req.user.clearCart();
      })
      .then(() => {
       
        res.redirect('/orders');
      })
      .catch(err => {
        const error = new Error(err);
        error.httpStatusCode = 500;
        return next(error);
      });
  };

//get order
exports.getOrders = async (req, res, next) => {
   try{
        let cart = req.session.cart;
        const orders = await Order.find({ 'user.userId': req.user._id })
        res.render('shop/orders', {
            orders,
            cart
        });
   }
   catch(err) {
    console.log(err);
    const error = new Error(err);
    error.httpStatusCode = 500;
    return next(error);
   }
   
},

// get invoice
exports.getInvoice = async (req, res, next) => {
    try {

        const orderId = req.params.orderId;
        const order = await Order.findById(orderId)
        if (!order) {
            return next(new Error('No order found.'));
        }
        if (order.user.userId.toString() !== req.user._id.toString()) {
            return next(new Error('Unauthorized'));
        }
        const invoiceName = 'invoice-' + orderId + '.pdf';
        const invoicePath = path.join('data', 'invoices', invoiceName);

        const pdfDoc = new PDFDocument();
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader(
            'Content-Disposition',
            'inline; filename="' + invoiceName + '"'
        );
        pdfDoc.pipe(fs.createWriteStream(invoicePath));
        pdfDoc.pipe(res);

        pdfDoc.fontSize(26).text('Invoice', {
            underline: true
        });
        pdfDoc.text('-----------------------');
        
        let totalPrice = 0;
        order.products.forEach(prod => {
            totalPrice += prod.quantity * prod.product.price;
            pdfDoc
            .fontSize(14)
            .text(
                prod.product.title +
                ' - ' +
                prod.quantity +
                ' x ' +
                '$' +
                prod.product.price
            );
        });
        pdfDoc.text('---');
        pdfDoc.fontSize(20).text('Total Price: $' + totalPrice);

        pdfDoc.end();

    }
    catch(err) {
        console.log(err);
        const error = new Error(err);
        error.httpStatusCode = 500;
        return next(error);
    }
    
}