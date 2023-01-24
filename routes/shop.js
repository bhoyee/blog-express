const express = require('express');
const router = express.Router();
const shopController = require('../controllers/shop');

// function makeid(length) {
//     var result           = '';
//     var characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
//     var charactersLength = characters.length;
//     for ( var i = 0; i < length; i++ ) {
//        result += characters.charAt(Math.floor(Math.random() * charactersLength));
//     }
//     return result;
//  }
 
 //console.log(makeid(5));

const isAuth = require('../middleware/isUser-auth');

router.get('/shop', shopController.getShopIndex);

router.get('/products/:id', shopController.getProduct);

router.get('/cart', isAuth, shopController.getCart);

router.post('/cart', isAuth, shopController.postCart );

router.post('/cart-delete-item', isAuth, shopController.postCartDeleteProduct);

router.get('/checkout', isAuth, shopController.getCheckout);

router.post('/checkout', isAuth, shopController.doCheckout);

//testing
router.get('/checkouts/:id', isAuth, shopController.getChk);
// router.get('/getStatus', isAuth, shopController.getStatus);
router.post('/cryptoPay', isAuth, shopController.doCryptoPay);
// router.get('/DcryptoPay', isAuth, shopController.CryptoPay);


router.post('/create-order', isAuth, shopController.postOrder);

router.get('/orders', isAuth, shopController.getOrders);

router.get('/orders/:orderId', isAuth, shopController.getInvoice);


module.exports = router;