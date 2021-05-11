/* eslint-disable no-unused-vars */
import {settings, select, classNames, templates} from '../settings.js';
import utils from '../utils.js';
import CartProduct from './CartProduct.js';

class Cart{
  constructor(element){
    const thisCart = this;

    thisCart.products = [];

    thisCart.getElements(element);
    thisCart.initActions();

    //console.log(`new Cart:`, thisCart);
  }
  getElements(element){
    const thisCart = this;

    thisCart.dom = {};

    thisCart.dom.wrapper = element;
    thisCart.dom.toggleTrigger = thisCart.dom.wrapper.querySelector(select.cart.toggleTrigger);
    thisCart.dom.productList = thisCart.dom.wrapper.querySelector(select.cart.productList);

    thisCart.dom.deliveryFee = thisCart.dom.wrapper.querySelector(select.cart.deliveryFee);
    thisCart.dom.subTotalPrice = thisCart.dom.wrapper.querySelector(select.cart.subtotalPrice);
    thisCart.dom.totalNumber = thisCart.dom.wrapper.querySelector(select.cart.totalNumber);
    thisCart.dom.totalPrice = thisCart.dom.wrapper.querySelectorAll(select.cart.totalPrice);

    thisCart.dom.form = thisCart.dom.wrapper.querySelector(select.cart.form);
    thisCart.dom.address = thisCart.dom.form.querySelector(select.cart.address);
    thisCart.dom.phone = thisCart.dom.form.querySelector(select.cart.phone);
  }
  initActions(){
    const thisCart = this;

    thisCart.dom.toggleTrigger.addEventListener('click', function(event){
      event.preventDefault();
      thisCart.dom.wrapper.classList.toggle(classNames.menuProduct.wrapperActive);
    });
    thisCart.dom.productList.addEventListener('updated', function(){
      thisCart.update();
    });
    thisCart.dom.productList.addEventListener('remove', function(event){
      thisCart.remove(event.detail.cartProduct);
    });
    thisCart.dom.form.addEventListener('submit', function(event){
      event.preventDefault();
      thisCart.sendOrder();
    });
  }
  add(menuProduct){
    const thisCart = this;

    //console.log(`adding product`, menuProduct);

    /* generate HTML based on template */
    const generatedHTML = templates.cartProduct(menuProduct);
    /* create element using utils.createElementFromHtml */
    const generatedDOM = utils.createDOMFromHTML(generatedHTML);
    /* add element to cart */
    thisCart.dom.productList.appendChild(generatedDOM);

    thisCart.products.push(new CartProduct(menuProduct, generatedDOM));
    //console.log(`thisCart.products`, thisCart.products);

    thisCart.update();
  }
  update(){
    const thisCart = this;

    thisCart.deliveryFee = settings.cart.defaultDeliveryFee;

    thisCart.totalNumber = 0;
    thisCart.subTotalPrice = 0;

    for(let cartProduct of thisCart.products){
      thisCart.totalNumber += cartProduct.amount;
      thisCart.subTotalPrice += cartProduct.price;
    }

    thisCart.totalPrice;

    if(thisCart.totalNumber === 0){
      thisCart.totalPrice = 0;
    } else {
      thisCart.totalPrice = thisCart.deliveryFee + thisCart.subTotalPrice;
    }
    
    thisCart.dom.deliveryFee.innerHTML = thisCart.deliveryFee;
    thisCart.dom.totalNumber.innerHTML = thisCart.totalNumber;
    thisCart.dom.subTotalPrice.innerHTML = thisCart.subTotalPrice;
    for(let singleDomTotalPrice of thisCart.dom.totalPrice){
      singleDomTotalPrice.innerHTML = thisCart.totalPrice;
    }

    // console.log(`deliveryFee`, deliveryFee);
    // console.log(`totalNumber`, totalNumber);
    // console.log(`subTotalPrice`, subTotalPrice);
    // console.log(`thisCart.totalPrice`, thisCart.totalPrice);
  }
  remove(cartProduct){
    const thisCart = this;

    /* remove HTML of the product */
    const cartProductHTML = cartProduct.dom.wrapper;
    cartProductHTML.remove();
    /* remove info about the product from thisCart.products array */
    const indexOfcartProduct = thisCart.products.indexOf(cartProduct);
    //console.log(indexOfcartProduct);
    const removeCartProduct = thisCart.products.splice(indexOfcartProduct, 1);
    //console.log(removeCartProduct);

    /* call method update to recalculate prices after product removal */
    thisCart.update();
  }
  sendOrder(){
    const thisCart = this;

    const url = settings.db.url + '/' + settings.db.orders;

    const payload = {
      address: thisCart.dom.address.value,
      phone: thisCart.dom.phone.value,
      totalPrice: thisCart.totalPrice,
      subTotalPrice: thisCart.subTotalPrice,
      totalNumber: thisCart.totalNumber,
      deliveryFee: thisCart.deliveryFee,
      products: [],
    };

    for(let prod of thisCart.products){
      payload.products.push(prod.getData());
    }
    //console.log(payload);

    const options = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    };

    fetch(url, options)
    // optional, we send the data so response of the server is irrelevant
      .then(function(response){
        return response.json();
      })
      .then(function(parsedResponse){
        //console.log('parsedResponse', parsedResponse);
      });

    // console.log(payload.address);
    // console.log(payload.phone);
    // console.log(payload.totalPrice);
    // console.log(payload.subTotalPrice);
    // console.log(payload.totalNumber);
    // console.log(payload.deliveryFee);


  }
}

export default Cart;