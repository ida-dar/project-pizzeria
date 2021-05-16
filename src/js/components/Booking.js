import {select, templates, settings} from '../settings.js';
import utils from '../utils.js';
import AmountWidget from './AmountWidget.js';
import DatePicker from './DatePicker.js';
import HourPicker from './HourPicker.js';

class Booking{
  constructor(element){
    const thisBooking = this;

    thisBooking.render(element);
    thisBooking.initWidgets();
    thisBooking.getData();
  }
  render(element){
    const thisBooking = this;
    
    /* generate HTML based on template */
    const generatedHTML = templates.bookingWidget(thisBooking);

    thisBooking.dom = {};

    thisBooking.dom.wrapper = element;
    thisBooking.dom.wrapper.innerHTML = generatedHTML;
    thisBooking.dom.peopleAmount = thisBooking.dom.wrapper.querySelector(select.booking.peopleAmount);
    thisBooking.dom.hoursAmount = thisBooking.dom.wrapper.querySelector(select.booking.hoursAmount);
    thisBooking.dom.datePicker = thisBooking.dom.wrapper.querySelector(select.widgets.datePicker.wrapper);
    thisBooking.dom.hourPicker = thisBooking.dom.wrapper.querySelector(select.widgets.hourPicker.wrapper);

  }
  initWidgets(){
    const thisBooking = this;

    thisBooking.peopleAmountWidget = new AmountWidget(thisBooking.dom.peopleAmount);
    thisBooking.hoursAmountWidget = new AmountWidget(thisBooking.dom.hoursAmount);
    thisBooking.datePicker = new DatePicker(thisBooking.dom.datePicker);
    thisBooking.hourPicker = new HourPicker(thisBooking.dom.hourPicker);

    thisBooking.dom.peopleAmount.addEventListener('click', function(event){
      event.preventDefault();

    });

    thisBooking.dom.hoursAmount.addEventListener('click', function(event){
      event.preventDefault();
      
    });


  }
  getData(){
    const thisBooking = this;
    
    // eslint-disable-next-line no-unused-vars
    const startDateParam = settings.db.dateStartParamKey + '=' + utils.dateToStr(thisBooking.datePicker.minDate);
    const endDateParam = settings.db.dateEndParamKey + '=' + utils.dateToStr(thisBooking.datePicker.maxDate);

    const params = {
      bookings: [
        //startDateParam,
        endDateParam,
      ],
      eventsCurrent: [
        settings.db.notRepeatParam,
        //startDateParam,
        endDateParam,
      ],
      eventsRepeat: [
        settings.db.repeatParam,
        endDateParam,
      ],
    };

    console.log(params);

    const urls = {
      bookings: settings.db.url + '/' + settings.db.bookings + '?' + params.bookings.join('&'),
      eventsCurrent: settings.db.url + '/' + settings.db.events + '?' + params.eventsCurrent.join('&'),
      eventsRepeat: settings.db.url + '/' + settings.db.events + '?' + params.eventsRepeat.join('&'),
    };

    console.log(urls);

    Promise.all([ // works similar to method fetch. Promise.all() takes an array of promises as an input parameter and returns a new Promise object that will fulfil only if and when all promises in the array fulfil.
      fetch(urls.bookings),
      fetch(urls.eventsCurrent),
      fetch(urls.eventsRepeat),
    ])
      .then(function(allResponses){ // allResponses here is an array getting all responses from all 3 fetches in Promise.all
        const bookingsResponse = allResponses[0];
        const eventsCurrentResponse = allResponses[1];
        const eventsRepeatResponse = allResponses[2];
        return Promise.all([
          bookingsResponse.json(),
          eventsCurrentResponse.json(),
          eventsRepeatResponse.json(),
        ]);
      })
      .then(function([bookings, eventsCurrent, eventsRepeat]){ // gets converted objects
        console.log(`b`, bookings);
        console.log(`eC`, eventsCurrent);
        console.log(`eR`, eventsRepeat);
      });
  }
}

export default Booking;