import {settings, select, classNames, templates} from './settings.js'; // {} are used when we import more than one thing and it's NOT default
import Product from './components/Product.js'; // in Product.js we exported class Product as default, so it can be imported here without {}
import Cart from './components/Cart.js';

const app = {
  initData: function(){
    const thisApp = this;

    thisApp.data = {};

    const url = settings.db.url + '/' + settings.db.products;

    fetch(url)
      .then(function(rawResponse){
        return rawResponse.json();
      })
      .then(function(parsedResponse){
        console.log('parsedResponse', parsedResponse);

        /* save parsedResponse as thisApp.data.products */
        thisApp.data.products = parsedResponse;
        /* execute initMenu method */
        thisApp.initMenu();
      });

    console.log('thisApp.data', JSON.stringify(thisApp.data));
  },

  initMenu: function(){
    const thisApp = this;

    //console.log('thisApp.data:', thisApp.data);

    for(let productData in thisApp.data.products){
      new Product(thisApp.data.products[productData].id, thisApp.data.products[productData]);
      //console.log('productData:', productData, thisApp.data.products[productData]);
    }
  },

  initCart: function(){
    const thisApp = this;

    const cartElem = document.querySelector(select.containerOf.cart);
    thisApp.cart = new Cart(cartElem);

    thisApp.productList = document.querySelector(select.containerOf.menu);

    thisApp.productList.addEventListener('add-to-cart', function(event){ // custom event made in method addToCart in Product.js
      app.cart.add(event.detail.product); // custom event has object detail which contains property product (thisProduct.prepareCartProduct())
    });
  },
  
  init: function(){
    const thisApp = this;
    console.log('*** App starting ***');
    console.log('thisApp:', thisApp);
    console.log('classNames:', classNames);
    console.log('settings:', settings);
    console.log('templates:', templates);

    thisApp.initData();
    thisApp.initCart();
  },
};

app.init();
