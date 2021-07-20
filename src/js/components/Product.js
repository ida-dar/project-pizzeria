import {select, classNames, templates} from '../settings.js';
import utils from '../utils.js';
import AmountWidget from './AmountWidget.js';

class Product{
  constructor(id, data){
    const thisProduct = this;
    //console.log(`thisProduct:`, thisProduct);

    thisProduct.id = id;
    thisProduct.data = data;

    thisProduct.renderInMenu();
    thisProduct.getElements();
    thisProduct.initAccordion();
    thisProduct.initOrderForm();
    thisProduct.initAmountWidget();
    thisProduct.processOrder();
    thisProduct.prepareCartProductsParam();

    //console.log(`new Product:`, thisProduct);
  }
  renderInMenu(){
    const thisProduct = this;
    //console.log(`thisProductInMenu:`, thisProduct);
    /* generate HTML based on template */
    const generatedHTML = templates.menuProduct(thisProduct.data);
    //console.log(`generatedHTML:`, generatedHTML);
    /* create element using utils.createElementFromHtml */
    thisProduct.element = utils.createDOMFromHTML(generatedHTML);
    /* find menu container */
    const menuContainer = document.querySelector(select.containerOf.menu);
    //console.log(`menuContainer:`, menuContainer);
    /* add element to menu */
    menuContainer.appendChild(thisProduct.element);
  }
  getElements(){
    const thisProduct = this;

    thisProduct.dom = {};

    thisProduct.dom.accordionTrigger = thisProduct.element.querySelector(select.menuProduct.clickable);
    thisProduct.dom.form = thisProduct.element.querySelector(select.menuProduct.form);
    //console.log(`thisProductform:`, thisProduct.dom.form);
    thisProduct.dom.formInputs = thisProduct.dom.form.querySelectorAll(select.all.formInputs);
    //console.log(`thisProductformInputs:`, thisProduct.dom.formInputs);
    thisProduct.dom.cartButton = thisProduct.element.querySelector(select.menuProduct.cartButton);
    //console.log(`thisProductcartButton:`, thisProduct.dom.cartButton);
    thisProduct.dom.priceElem = thisProduct.element.querySelector(select.menuProduct.priceElem);
    //console.log(`thisProductpriceElem:`, thisProduct.dom.priceElem);
    thisProduct.dom.imageWrapper = thisProduct.element.querySelector(select.menuProduct.imageWrapper);
    //console.log(`thisProductimageWrapper:`, thisProduct.dom.imageWrapper);
    thisProduct.amountWidgetElem = thisProduct.element.querySelector(select.menuProduct.amountWidget);
    //console.log(`thisProductamountWidgetElem:`, thisProduct.amountWidgetElem);
  }
  initAccordion(){
    const thisProduct = this;
    //console.log(`thisProductAccordion:`, thisProduct);
    /* find the clickable trigger (the element that should react to clicking) */
    //const clickableTrigger = thisProduct.element.querySelector(select.menuProduct.clickable); // redundant due to thisProduct.accordionTrigger

    /* START: add event listener to clickable trigger on event click */
    //clickableTrigger.addEventListener('click', function(event) {    //modified due to thisProduct.accordionTrigger
    thisProduct.dom.accordionTrigger.addEventListener('click', function(event){
      /* prevent default action for event */
      event.preventDefault();
      /* find active product (product that has active class) */
      const activeProduct = document.querySelector(select.all.menuProductsActive);
      /* if there is active product and it's not thisProduct.element, remove class active from it */
      if(activeProduct && activeProduct !== thisProduct.element){
        activeProduct.classList.remove(classNames.menuProduct.wrapperActive);
      } 
      /* toggle active class on thisProduct.element */
      thisProduct.element.classList.toggle(classNames.menuProduct.wrapperActive);
    });
  }
  initOrderForm(){
    const thisProduct = this;
    //console.log(`thisProductOrderForm:`, thisProduct);

    thisProduct.dom.form.addEventListener('submit', function(event){
      event.preventDefault();
      thisProduct.processOrder();
    });
    for(let input of thisProduct.dom.formInputs){
      input.addEventListener('change', function(){
        thisProduct.processOrder();
      });
    }
    thisProduct.dom.cartButton.addEventListener('click', function(event){
      event.preventDefault();
      thisProduct.processOrder();
      thisProduct.addToCart();
    });
  }
  processOrder(){
    const thisProduct = this;
    //console.log(`thisProductProcessOrder:`, thisProduct);
    
    /* convert form to object structure e.g. { sauce: ['tomato'], toppings: ['olives', 'redPeppers']} */
    const formData = utils.serializeFormToObject(thisProduct.dom.form);
    //console.log(`formData:`, formData);

    /* set price to default price */
    let price = thisProduct.data.price;
    
    /* for every category (param)... */
    for(let paramId in thisProduct.data.params){
      /* determine param value e.g. paramId = 'toppings', param = { label: 'Toppings', type: 'checkboxes'... } */
      const param = thisProduct.data.params[paramId];
      //console.log(`paramId:`, paramId, `param:`, param);

      /* for every option in this category */
      for(let optionId in param.options){
        /* determine option value e.g. optionId = 'olives', option = { label: 'Olives', price: 2, default: true } */
        const option = param.options[optionId];
        //console.log(`optionId:`, optionId, `option:`, option);
        /* find image with class .paramId-optionId */
        const optionImage = thisProduct.dom.imageWrapper.querySelector(`.${paramId}-${optionId}`);
        //console.log(`optionImage`, optionImage);
        /* check if formData includes optionId from paramId */
        const optionSelected = formData[paramId] && formData[paramId].includes(optionId);
        if(optionSelected){
          //console.log(`checkedOption:`, optionId);
          /* check if the option is default */
          if(!option.default){
            price += option.price;
          }
        } else{
          if(option.default){
            price -= option.price;
          }
        }
        if(optionImage){
          if(optionSelected){
            optionImage.classList.add(classNames.menuProduct.imageVisible);
          } else {
            optionImage.classList.remove(classNames.menuProduct.imageVisible);
          }
        }
      }
    }
    thisProduct.priceSingle = price;
    /* multiply price by amount */
    price *= thisProduct.amountWidget.value;
    /* update calculated price in HTML */
    thisProduct.dom.priceElem.innerHTML = price;
  }
  initAmountWidget(){
    const thisProduct = this;

    thisProduct.amountWidget = new AmountWidget(thisProduct.amountWidgetElem);

    thisProduct.amountWidgetElem.addEventListener('updated', function(){
      thisProduct.processOrder();
    });
  }
  addToCart(){
    const thisProduct = this;

    // app.cart.add(thisProduct.prepareCartProduct());

    const event = new CustomEvent('add-to-cart', {
      bubbles: true,
      detail: {
        product: thisProduct.prepareCartProduct(),
      },
    });

    thisProduct.element.dispatchEvent(event);
  }
  prepareCartProduct(){
    const thisProduct = this;

    const productSummary = {};

    productSummary.id = thisProduct.id;
    productSummary.name = thisProduct.data.name;
    productSummary.amount = thisProduct.amountWidget.value;
    productSummary.priceSingle = thisProduct.priceSingle;
    productSummary.price = thisProduct.priceSingle * thisProduct.amountWidget.value;
    productSummary.params = thisProduct.prepareCartProductsParam();

    return productSummary;
  }
  prepareCartProductsParam(){
    const thisProduct = this;

    /* convert form to object structure e.g. { sauce: ['tomato'], toppings: ['olives', 'redPeppers']} */
    const formData = utils.serializeFormToObject(thisProduct.dom.form);
    //console.log(`formData:`, formData);

    const params = {};

    /* for every category (param)... */
    for(let paramId in thisProduct.data.params){
      /* determine param value e.g. paramId = 'toppings', param = { label: 'Toppings', type: 'checkboxes'... } */
      const param = thisProduct.data.params[paramId];
      //console.log(`paramId:`, paramId, `param:`, param);

      params[paramId] = {
        label: param.label,
        options: {}
      };

      /* for every option in this category */
      for(let optionId in param.options){
        /* determine option value e.g. optionId = 'olives', option = { label: 'Olives', price: 2, default: true } */
        const option = param.options[optionId];
        //console.log(`optionId:`, optionId, `option:`, option);
        /* check if formData includes optionId from paramId */
        const optionSelected = formData[paramId] && formData[paramId].includes(optionId);
        if(optionSelected){
          //console.log(`checkedOption:`, optionId);
          params[paramId].options[optionId] = option.label;
        }
      }
    }

    return params;
  }
}

export default Product;