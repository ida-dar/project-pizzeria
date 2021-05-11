import {settings, select} from '../settings.js'; 

class AmountWidget{
  constructor(element){
    const thisWidget = this;

    thisWidget.getElements(element);
    thisWidget.setValue(thisWidget.input.value || settings.amountWidget.defaultValue);
    thisWidget.initActions();

    //console.log(`AmountWidget:`, thisWidget);
    //console.log(`constructor arguments`, element);
  }
  getElements(element){
    const thisWidget = this;

    thisWidget.element = element;
    thisWidget.input = thisWidget.element.querySelector(select.widgets.amount.input);
    thisWidget.linkDecrease = thisWidget.element.querySelector(select.widgets.amount.linkDecrease);
    thisWidget.linkIncrease = thisWidget.element.querySelector(select.widgets.amount.linkIncrease);
  }
  setValue(value){
    const thisWidget = this;

    const newValue = parseInt(value);

    /* add validation */
    if(thisWidget.value !== newValue && !isNaN(newValue) && newValue >= settings.amountWidget.defaultMin && newValue <= settings.amountWidget.defaultMax){
      thisWidget.value = newValue;
    }
    
    thisWidget.input.value = thisWidget.value;
    thisWidget.announce();
  }
  initActions(){
    const thisWidget = this;

    thisWidget.input.addEventListener('change', function(){
      thisWidget.setValue(thisWidget.input.value);
    });
    thisWidget.linkDecrease.addEventListener('click', function(event){
      event.preventDefault();
      thisWidget.setValue(thisWidget.value - 1);
    });
    thisWidget.linkIncrease.addEventListener('click', function(event){
      event.preventDefault();
      thisWidget.setValue(thisWidget.value + 1);
    });
  }
  announce(){
    const thisWidget = this;

    //const event = new Event('updated');  // had to be modified to update total price after changing products number in cart
    const event = new CustomEvent('updated', {
      bubbles: true  // makes event bubble up through DOM (work on the item, its parent ... up to <body>, document, window). We made customed event so bubbling needs to be turned on.
    });
    thisWidget.element.dispatchEvent(event);
  }
}

export default AmountWidget;