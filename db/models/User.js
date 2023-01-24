const config = require('config');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');

const Schema = mongoose.Schema;

const userSchema = new Schema({

    username: {
        type: String,
        required: true,
        minlength: 5,
        maxlength: 20
    },
    email: {
        type: String,
        required: true,
        unique: true,
        minlength: 5,
        maxlength: 50
    },
    password: {
        type: String,
        required: true,
        minlength: 5,
        maxlength: 100
    },
    resetToken: String,
    resetTokenExpiration: Date,
    role: {
        type: String,
        required: true,
        minlength: 4,
        maxlength: 5

    },
    cart: {
        items: [
          {
            productId: {
              type: Schema.Types.ObjectId,
              ref: 'Product',
              required: true
            },
            quantity: { type: Number, required: true }
          }
        ]
      }
}); 

// Generate authentication webtoken
userSchema.methods.generateAuthToken = function() {
  const token = jwt.sign({ _id: this._id, username: this.username, role: this.role }, config.get('jwtPrivateKey'), { expiresIn: '1h' });
  return token;  
};

// utility that add and update cart
userSchema.methods.addToCart = function(product) {
    const cartProductIndex = this.cart.items.findIndex(cp => {
      return cp.productId.toString() === product._id.toString();
    });
    let newQuantity = 1;
    const updatedCartItems = [...this.cart.items];
  
    if (cartProductIndex >= 0) {
      newQuantity = this.cart.items[cartProductIndex].quantity + 1;
      updatedCartItems[cartProductIndex].quantity = newQuantity;
    } else {
      updatedCartItems.push({
        productId: product._id,
        quantity: newQuantity
      });
    }
    const updatedCart = {
      items: updatedCartItems
    };
    this.cart = updatedCart;
    return this.save();
  };

  // utility that delete item in cart
  userSchema.methods.removeFromCart = function(productId) {
    const updatedCartItems = this.cart.items.filter(item => {
      return item.productId.toString() !== productId.toString();
    });
    this.cart.items = updatedCartItems;
    return this.save();
  };

  //clear cart
  userSchema.methods.clearCart = function() {
    this.cart = { items: [] };
    return this.save();
  }

const User = mongoose.model('User', userSchema);

module.exports.User = User;