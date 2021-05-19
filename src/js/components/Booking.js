import {select, templates, settings, classNames} from '../settings.js';
import utils from '../utils.js';
import AmountWidget from './AmountWidget.js';
import DatePicker from './DatePicker.js';
import HourPicker from './HourPicker.js';

class Booking{
  constructor(element){
    const thisBooking = this;

    thisBooking.selectedTable = {};
    thisBooking.starters = [];

    thisBooking.render(element);
    thisBooking.initWidgets();
    thisBooking.getData();
    thisBooking.initTables();
    thisBooking.startersData();
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
    thisBooking.dom.tables = thisBooking.dom.wrapper.querySelectorAll(select.booking.tables);
    thisBooking.dom.tablesWrapper = thisBooking.dom.wrapper.querySelector(select.containerOf.tables);

    thisBooking.dom.datePicker = thisBooking.dom.wrapper.querySelector(select.widgets.datePicker.wrapper);
    thisBooking.dom.hourPicker = thisBooking.dom.wrapper.querySelector(select.widgets.hourPicker.wrapper);

    thisBooking.dom.form = thisBooking.dom.wrapper.querySelector(select.booking.form);
    thisBooking.dom.phone = thisBooking.dom.form.querySelector(select.booking.phone);
    thisBooking.dom.address = thisBooking.dom.form.querySelector(select.booking.address);
    thisBooking.dom.starters = thisBooking.dom.form.querySelector(select.containerOf.starters);
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

    thisBooking.dom.wrapper.addEventListener('updated', function(){ // custom event from class BaseWidget
      thisBooking.updateDOM();
    });

    thisBooking.dom.form.addEventListener('submit', function(event){
      event.preventDefault();
      thisBooking.sendBooking();
    });

  }
  getData(){
    const thisBooking = this;
    
    // eslint-disable-next-line no-unused-vars
    const startDateParam = settings.db.dateStartParamKey + '=' + utils.dateToStr(thisBooking.datePicker.minDate);
    const endDateParam = settings.db.dateEndParamKey + '=' + utils.dateToStr(thisBooking.datePicker.maxDate);

    const params = {
      bookings: [
        startDateParam,
        endDateParam,
      ],
      eventsCurrent: [
        settings.db.notRepeatParam,
        startDateParam,
        endDateParam,
      ],
      eventsRepeat: [
        settings.db.repeatParam,
        endDateParam,
      ],
    };

    // console.log(params);

    const urls = {
      bookings: settings.db.url + '/' + settings.db.bookings + '?' + params.bookings.join('&'),
      eventsCurrent: settings.db.url + '/' + settings.db.events + '?' + params.eventsCurrent.join('&'),
      eventsRepeat: settings.db.url + '/' + settings.db.events + '?' + params.eventsRepeat.join('&'),
    };

    // console.log(urls);

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
        // console.log(`b`, bookings);
        // console.log(`eC`, eventsCurrent);
        // console.log(`eR`, eventsRepeat);
        thisBooking.parseData(bookings, eventsCurrent, eventsRepeat);
      });
  }

  parseData(bookings, eventsCurrent, eventsRepeat){
    const thisBooking = this;

    thisBooking.booked = {};
    //console.log(thisBooking.booked);

    for(let item of bookings){
      thisBooking.makeBooked(item.date, item.hour, item.duration, item.table);
    }

    for(let item of eventsCurrent){
      thisBooking.makeBooked(item.date, item.hour, item.duration, item.table);
    }

    const minDate = thisBooking.datePicker.minDate;
    const maxDate = thisBooking.datePicker.maxDate;

    for(let item of eventsRepeat){
      if(item.repeat === 'daily'){
        for(let loopDate = minDate; loopDate <= maxDate; loopDate = utils.addDays(loopDate, 1)){ // loopDate++ wouldn't work here, 'cause dates work differently than numbers, therefore utils.addDate is needed
          thisBooking.makeBooked(utils.dateToStr(loopDate), item.hour, item.duration, item.table);
        } 
      }
    }

    //console.log(`thisBooking.booked`, thisBooking.booked);
    thisBooking.updateDOM(); // this method should be executed right after we get data from API, so in method parseData
  }
  makeBooked(date, hour, duration, table){
    const thisBooking = this;

    if(typeof thisBooking.booked[date] == 'undefined'){ // is needed for pushing table to thisBooking.booked
      thisBooking.booked[date] = {};
    }

    const startHour = utils.hourToNumber(hour);

    for(let hourBlock = startHour; hourBlock < (startHour + duration); hourBlock += 0.5){ // 0.5 is put due to the fact that we set the shortest reseravtion to last 30min.
      //console.log('loop', hourBlock);

      if(typeof thisBooking.booked[date][hourBlock] == 'undefined'){ // is needed for pushing table to thisBooking.booked
        thisBooking.booked[date][hourBlock] = [];
      }
  
      thisBooking.booked[date][hourBlock].push(table); // in object thisBooking.booked we find object [date] given as first arg of method makeBooked. In [data] object we find a property key ([hour]) equaled to the second arg of the method. [hour] is an array
    }
  }
  updateDOM(){
    const thisBooking = this;

    thisBooking.date = thisBooking.datePicker.value;
    thisBooking.hour = utils.hourToNumber(thisBooking.hourPicker.value);

    let allAvailable = false; // will mean that this day at this time all tables are available

    if(
      typeof thisBooking.booked[thisBooking.date] === 'undefined' // there is no object created for this date
      ||
      typeof thisBooking.booked[thisBooking.date][thisBooking.hour] === 'undefined' // there is no array created for this date at this time
    ){
      allAvailable = true;
    }

    for(let table of thisBooking.dom.tables){
      let tableId = table.getAttribute(settings.booking.tableIdAttribute); // tableId is always a string but it can be converted into number using parseInt (below)
      if(!isNaN(tableId)){
        tableId = parseInt(tableId);
      }

      if(
        !allAvailable
        &&
        thisBooking.booked[thisBooking.date][thisBooking.hour].includes(tableId)
      ){
        table.classList.add(classNames.booking.tableBooked);
      } else {
        table.classList.remove(classNames.booking.tableBooked);
      }

      /* remove class selected to reset selected table after changing time, date, number of guests and number of hours */
      table.classList.remove(classNames.booking.selectedTable);
    }
  }
  initTables(){
    const thisBooking = this;

    thisBooking.dom.tablesWrapper.addEventListener('click', function(event){
      event.preventDefault();

      const clickedElement = event.target; // event will be used in eventListener in method initWidgets
      //console.log(clickedElement);

      if(clickedElement.hasAttribute(settings.booking.tableIdAttribute)){
        const bookedTable = clickedElement.classList.contains(classNames.booking.tableBooked);
        const selectedTable = clickedElement.classList.contains(classNames.booking.selectedTable);
        const selectedTableId = parseInt(clickedElement.getAttribute(settings.booking.tableIdAttribute));

        /* chcek if the table is not booked */
        if(!bookedTable){
          /* add its id to thisBooking.selectedTable.tableId*/
          thisBooking.selectedTable.tableId = selectedTableId;
          clickedElement.classList.add(classNames.booking.selectedTable);
          /* make loop to check if there are other selected tables */
          for(let table of thisBooking.dom.tables){
            if(table !== clickedElement){
              table.classList.remove(classNames.booking.selectedTable);
            }
          }

          /* if table is selected remove class after click*/
          if(selectedTable){
            clickedElement.classList.remove(classNames.booking.selectedTable);
          }

        } else if(bookedTable){
          alert('This table is unavailable, please select another one');
        }
      }

      //console.log(thisBooking.selectedTable);
    });
  }
  startersData(){
    const thisBooking = this;

    thisBooking.dom.starters.addEventListener('click', function(event){
      
      const clickedElement = event.target;
      //console.log(clickedElement);
      
      if(clickedElement.tagName === 'INPUT' && clickedElement.type === 'checkbox' && clickedElement.name === 'starter'){
        if(clickedElement.checked === true){
          thisBooking.starters.push(clickedElement.value);
        } else if(clickedElement.checked === false){
          thisBooking.starters.splice(thisBooking.starters.indexOf(clickedElement.value), 1);
        }
      }
    });

    //console.log(thisBooking.starters);
  }
  sendBooking(){
    const thisBooking = this;

    const url = settings.db.url + '/' + settings.db.bookings;
    //console.log(url);

    const payload = {
      date: thisBooking.datePicker.value,
      hour: thisBooking.hourPicker.value,
      table: thisBooking.selectedTable.tableId || null,
      duration: thisBooking.hoursAmountWidget.value,
      ppl: thisBooking.peopleAmountWidget.value,
      starters: thisBooking.starters,
      phone: thisBooking.dom.phone.value,
      address: thisBooking.dom.address.value,
    };

    //onsole.log(payload);
    
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
      // eslint-disable-next-line no-unused-vars
      .then(function(parsedResponse){
        //console.log('parsedResponse', parsedResponse);
        thisBooking.makeBooked(payload.date, payload.hour, payload.duration, payload.table);
      });
  }
}

export default Booking;