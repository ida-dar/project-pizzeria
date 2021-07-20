import {settings, select, classNames} from './settings.js'; // {} are used when we import more than one thing and it's NOT default
import Product from './components/Product.js'; // in Product.js we exported class Product as default, so it can be imported here without {}
import Cart from './components/Cart.js';
import Booking from './components/Booking.js';
import HomePage from './components/HomePage.js';

const app = {
  initPages: function(){
    const thisApp = this;

    thisApp.pages = document.querySelector(select.containerOf.pages).children; // all children of pages' container will be in thisApp.pages
    thisApp.navLinks = document.querySelectorAll(select.nav.links);

    const idFromHash = window.location.hash.replace('#/', '');

    let pageMatchingHash = thisApp.pages[0].id;

    for(let page of thisApp.pages){
      if(page.id === idFromHash){
        pageMatchingHash = page.id;
        break;
      }
    }

    thisApp.activatePage(pageMatchingHash);

    for(let link of thisApp.navLinks){
      link.addEventListener('click', function(event){
        event.preventDefault();

        const clickedElement = this;

        /* get page id from href attribute */
        const id = clickedElement.getAttribute('href').replace('#', ''); // in href attribute replace # into '' (empty string)
        /* run thisApp.activatePage with that id */
        thisApp.activatePage(id);

        /* change URL hash */
        window.location.hash = '#/' + id; // '/' is added so after '#', the string doesn't match any id. It's to prevent default browser behaviour, i.e. scrolling to section with id that matches id after # in url (e.g. #order)
      });
    }
  },

  activatePage: function(pageId){
    const thisApp = this;

    /* add class active to matching pages, remove from non-matching */
    for(let page of thisApp.pages){
      page.classList.toggle(classNames.pages.active, page.id === pageId); // second argument (page.id === pageId) controls if class active should be added or not
    }

    /* add class active to matching links, remove from non-matching */
    for(let link of thisApp.navLinks){
      link.classList.toggle(
        classNames.nav.active,
        link.getAttribute('href') === `#${pageId}`
      );
    }
  },

  initData: function(){
    const thisApp = this;

    thisApp.data = {};

    const url = settings.db.url + '/' + settings.db.products;

    fetch(url)
      .then(function(rawResponse){
        return rawResponse.json();
      })
      .then(function(parsedResponse){
        //*console.log('parsedResponse', parsedResponse);

        /* save parsedResponse as thisApp.data.products */
        thisApp.data.products = parsedResponse;
        /* execute initMenu method */
        thisApp.initMenu();
      });

    //*console.log('thisApp.data', JSON.stringify(thisApp.data));
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

  initBooking: function(){
    const thisApp = this;

    const bookingContainer = document.querySelector(select.containerOf.booking);

    thisApp.booking = new Booking(bookingContainer);

  },

  initHomePage:function(){
    const thisApp = this;

    const homeContainer = document.querySelector(select.containerOf.homePage);

    thisApp.homePage = new HomePage(homeContainer);
    thisApp.initPages();
  },

  init: function(){
    const thisApp = this;
    // console.log('*** App starting ***');
    // console.log('thisApp:', thisApp);
    // console.log('classNames:', classNames);
    // console.log('settings:', settings);
    // console.log('templates:', templates);

    thisApp.initPages();
    thisApp.initData();
    thisApp.initCart();
    thisApp.initBooking();
    thisApp.initHomePage();
  },
};

app.init();

export default app;