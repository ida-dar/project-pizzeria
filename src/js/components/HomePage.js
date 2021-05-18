import {templates} from '../settings.js';

class HomePage{
  constructor(element){
    const thisHomePage = this;

    thisHomePage.render(element);
    thisHomePage.initWidgets();
  }
  render(element){
    const thisHomePage = this;

    /* generate HTML based on template */
    const generatedHTML = templates.homePage(thisHomePage);
    console.log(generatedHTML);

    thisHomePage.dom = {};

    thisHomePage.dom.wrapper = element;
    thisHomePage.dom.wrapper.innerHTML = generatedHTML;

  }
  initWidgets(){

  }
}

export default HomePage;