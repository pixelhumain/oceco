/**
*/

//variables to store / access across all functions (not sure how to do so otherwise? would have to put these on the element data itself?). BUT must store as instances to keep these separate so multiple instances on the same page do not overwrite each other!
var VAL ={};
var OPTS ={};
var FEATURES ={
  inited: false
};

var afDatetimepicker ={
  formSessKeys: function(instid, params) {
    var sessKeyBase ='afDatetimepicker'+instid;
    var sessKeys ={
      dateOnly: sessKeyBase+'DateOnly',
      classes: sessKeyBase+'Classes'
    };
    return sessKeys;
  },

  setup: function(instid, elm, template, params) {
    var self =this;

    var sessKeys =self.formSessKeys(instid, {});
    //default - so it is defined
    Session.set(sessKeys.dateOnly, false);
    Session.set(sessKeys.classes, {input: 'autoform-datetimepicker-input'});

    VAL[instid] =elm.value;

    var optsDefault ={
      formatValue: 'YYYY-MM-DD HH:mm:ssZ',
      pikaday: {
        format: 'MMM D, YYYY h:mmA',
        reposition: false
      }
    };
    OPTS[instid] =EJSON.clone(template.data.atts.opts);
    if(OPTS[instid] ===undefined) {
      OPTS[instid] ={};
    }
    //@todo2 - use a 3rd party extend function (standalone / very lightweight - not full underscore or lodash)
    var xx;
    if(OPTS[instid].pikaday ===undefined) {
      OPTS[instid].pikaday ={};
    }
    for(xx in optsDefault.pikaday) {
      if(OPTS[instid].pikaday[xx] ===undefined) {
        OPTS[instid].pikaday[xx] =optsDefault.pikaday[xx];
      }
    }
    for(xx in optsDefault) {
      if(OPTS[instid][xx] ===undefined) {
        OPTS[instid][xx] =optsDefault[xx];
      }
    }

    var dateOnly =self.checkForDateOnly(OPTS[instid], {});
    var picker =false;
    if(!self.featureDetect({}).mobile) {
      OPTS[instid].pikaday.field =elm;
      OPTS[instid].pikaday.onSelect =function() {
        VAL[instid] =this.getMoment().format(OPTS[instid].pikaday.format);
      };

      // If readonly or disabled, create a hidden element to attach trigger to for preventing changing value
      if(template.data.atts.readonly !==undefined || template.data.atts.disabled !==undefined) {
        var input =document.createElement("input");
        input.type ="hidden";
        elm.parentNode.appendChild(input);
        OPTS[instid].pikaday.trigger =input;
      }

      picker = new Pikaday(OPTS[instid].pikaday);
      template.picker.set(picker);
    }
    else {
      Session.set(sessKeys.dateOnly, dateOnly);
    }

    if(VAL[instid]) {
      //convert from non-display value to display value
      VAL[instid] =moment(VAL[instid], OPTS[instid].formatValue).format(OPTS[instid].pikaday.format);

      self.setVal(instid, elm, picker, {});
    }

    //for datetime-local input type, we get an "invalid date" value if not formatted correctly on init and that blanks out our value so to work around this, we just use a "text" type input and then dynamically change it AFTER setting to the PROPERLY FORMATTED date/datetime in javascript.
    if(self.featureDetect({}).mobile) {
      if(dateOnly) {
        elm.attributes['type'].value ='date';
      }
      else {
        // elm.type ='datetime-local';
        elm.attributes['type'].value ='datetime-local';
      }
    }

    //for iOS, make sure inputs are not super small height when they have no value yet
    if(self.featureDetect({}).deviceType ==='ios') {
      var classes1 =Session.get(sessKeys.classes);
      classes1.input +=' ios';
      Session.set(sessKeys.classes, classes1);
    }
  },

  setVal: function(instid, elm, picker, params) {
    var self =this;
    if(self.featureDetect({}).mobile) {
      var dateObj =moment(VAL[instid], OPTS[instid].pikaday.format);
      var dateOnly =self.checkForDateOnly(OPTS[instid], {});
      var inputFormatString =self.getInputFormatNative(dateOnly, {});
      var inputFormat =dateObj.format(inputFormatString);
      elm.value =inputFormat;
    }
    else {
      picker.setMoment(moment(VAL[instid], OPTS[instid].pikaday.format));
    }
  },

  getInputFormatNative: function(dateOnly, params) {
    var inputFormatString;
    //if date only
    if(dateOnly) {
      inputFormatString ='YYYY-MM-DD';
    }
    //if date and time
    else {
      inputFormatString ='YYYY-MM-DDTHH:mm:ss';   //datetime-local now so no timezone (including it will not properly set the input (default) value)
    }
    return inputFormatString;
  },

  checkForDateOnly: function(opts, params) {
    var dateOnly =true;
    if(opts.formatValue.indexOf('h') >-1 || opts.formatValue.indexOf('H') >-1) {
      return false;
    }
    return dateOnly;
  },

  featureDetect: function(params) {
    if(!FEATURES.inited) {
      FEATURES.mobile =false;
      FEATURES.deviceType =false;
      //mobile - from http://stackoverflow.com/questions/11381673/detecting-a-mobile-browser
      if (navigator.userAgent.match(/Android/i) || navigator.userAgent.match(/webOS/i) || navigator.userAgent.match(/iPhone/i) || navigator.userAgent.match(/iPad/i) || navigator.userAgent.match(/iPod/i) || navigator.userAgent.match(/BlackBerry/i) || navigator.userAgent.match(/Windows Phone/i) || /Chrome/.test(navigator.userAgent) && /Google Inc/.test(navigator.vendor)
      ) {
        FEATURES.mobile =true;
        if(navigator.userAgent.match(/webOS/i) || navigator.userAgent.match(/iPhone/i) || navigator.userAgent.match(/iPad/i) || navigator.userAgent.match(/iPod/i)) {
          FEATURES.deviceType ='ios';
        }
      }

      FEATURES.inited =true;    //set for next time
    }
    return FEATURES;
  },

  /**
  NOTE: non '00' minute timezone offsets apparently do NOT work with moment.js dates... i.e. moment('2013-06-21 10:25:00 -07:30',  'YYYY-MM-DD HH:mm:ssZ') gives GMT-0700 NOT GMT-0730 as it should. So currently this function does NOT support tzToMinutes timezones that have minutes..
  
  moment.js apparently does not yet have a function / way to convert a date to a different timezone (other than 'local' and 'UTC'). As of 2013.06.21, see here:
  http://stackoverflow.com/questions/15347589/moment-js-format-date-in-a-specific-timezone (this says it can be done but it's not working for me - maybe it's only on non-stable branches of the code..)
  https://github.com/timrwood/moment/issues/482
  UPDATE: as of 2013.07.10 / moment v2.1 there IS timezone support but it's much bigger than this simple function here so sticking with this to avoid code bloat.
  
  @param {Object} dateMoment moment.js date object
  @param {Number} [tzFromMinutes] Timezone minutes offset from UTC to be converted FROM. If not supplied, the timezone offset will be pulled from the dateMoment object. I.e. 420 for -07:00 (Pacific Time)
  @param {Number} [tzToMinutes] Timzeone minutes offset from UTC to be converted TO. If not supplied, the timezone of the current user's computer / browser will be used (using moment().zone() with no arguments).
  @param {Object} [params]
    @param {String} [format] moment.js format string for what to output
  @return {Object}
    @param {Object} date moment.js date object in the tzToMinutes timzeone
    @param {String} [dateFormatted] Date in formatted specified by params.format (if supplied)
  */
  convertTimezone: function(dateMoment, tzFromMinutes, tzToMinutes, params) {
    var ret ={date: false, dateFormatted:false};
    if(tzFromMinutes ===undefined || (!tzFromMinutes && tzFromMinutes !==0)) {
      tzFromMinutes = dateMoment.utcOffset();
    }
    if(tzToMinutes ===undefined || (!tzToMinutes && tzToMinutes !==0)) {
      tzToMinutes = moment().utcOffset();   //get user timezone
    }

    var dateFormatted = dateMoment.format('YYYY-MM-DD HH:mm:ss');
    
    var dateUtc = moment(dateMoment).utcOffset(tzToMinutes, true);

    ret.date = dateUtc.format('YYYY-MM-DD HH:mm:ssZ');
    if (params.format !== undefined) {
      ret.dateFormatted = dateUtc.format(params.format);
    }

    //use moment function to convert (doesn't work..)
    // dateMoment =dateMoment.zone(tzOffsetMinutes);
    // dateFormatted =dateMoment.format('YYYY-MM-DD HH:mm:ssZ');
    
    /*var tzDiffMinutes =tzToMinutes -tzFromMinutes;
    if(tzDiffMinutes >-1) {
      dateMoment = dateMoment.subtract(tzDiffMinutes, 'minutes');
    }
    else {
      dateMoment = dateMoment.add(tzDiffMinutes, 'minutes');
    }*/
    
    //manually add timezone offset
    /*var dateFormatted =dateMoment.format('YYYY-MM-DD HH:mm:ss');    //temporary string that will be used to form the final moment date object AFTER timezone conversion is done (since doesn't seem to be a way to change the timezone on an existing moment date object.. - if there was, we wouldn't need this entire function at all!)
    var tzToMinutesAbsVal =tzToMinutes;
    if(tzToMinutesAbsVal <0) {
      tzToMinutesAbsVal =tzToMinutesAbsVal *-1;
    }
    var hrOffset =Math.floor(tzToMinutesAbsVal /60).toString();
    if(hrOffset.length ==1) {
      hrOffset ='0'+hrOffset;
    }
    var minutesOffset =(tzToMinutesAbsVal %60).toString();
    if(minutesOffset.length ==1) {
      minutesOffset ='0'+minutesOffset;
    }
    var plusMinus ='+';
    if(tzToMinutes >=0) {
      plusMinus ='-';
    }
    var tzOffsetString =plusMinus+hrOffset+':'+minutesOffset;
    dateFormatted+=''+tzOffsetString;
    
    ret.date =moment(dateFormatted, 'YYYY-MM-DD HH:mm:ssZ');
    if(params.format !==undefined) {
      ret.dateFormatted =ret.date.format(params.format);
    }*/
    
    return ret;
  }
};

AutoForm.addInputType("datetimepicker", {
  template: "afDatetimepicker",
  valueIn: function(val) {
    //will convert to display value later after set / extend opts and have formats
    // VAL =val;
    if (val){
      return val && moment(val).isValid() ? moment(val).format('YYYY-MM-DD HH:mm:ssZ') : '';
    }
  },
  valueOut: function() {
    var instid =this.attr('data-schema-key');
    var returnVal;
    //convert to non-display value
    if(OPTS[instid].formatValue !==undefined) {
      if(!moment(VAL[instid], OPTS[instid].pikaday.format).isValid()) {
        returnVal ='';
      }
      else {
        returnVal =moment(VAL[instid], OPTS[instid].pikaday.format).format(OPTS[instid].formatValue);
      }
    }
    else {
      returnVal =VAL[instid];
    }
    return returnVal; dtInfo.date
  }
});

Template.afDatetimepicker.created =function() {
  this.picker = new ReactiveVar(false);
};

Template.afDatetimepicker.rendered =function() {
  var elm =this.find('input');
  var key =this.data.atts['data-schema-key'];
  afDatetimepicker.setup(key, elm, this, {});

  //set / add classes
  var sessKeys =afDatetimepicker.formSessKeys(key, {});
  var classes1 =Session.get(sessKeys.classes);
  //jquery
  $(elm).addClass(classes1.input);
  //pure javascript
  // //only add if not already there
  // var classParts =classes1.input.split(' ');
  // var curClasses =elm.className;
  // var ii;
  // for(ii =0; ii<classParts.length; ii++) {
  //   if(curClasses.indexOf(classParts[ii]) <0) {
  //     curClasses +=' '+classParts[ii];
  //   }
  // }
  // elm.className =curClasses;
};

Template.afDatetimepicker.destroyed =function() {
  var picker =this.picker.get();
  if(picker && picker.destroy) {
    picker.destroy();
  }
};

Template.afDatetimepicker.helpers({
  //fix to avoid error for passed in object
  // - https://github.com/aldeed/meteor-autoform-bs-datepicker/issues/3
  // - https://github.com/aldeed/meteor-autoform-bs-datepicker/commit/3977aa69b61152cf8c0f731a11676b087d2ec9df
  atts: function() {
    var atts =EJSON.clone(this.atts);
    // atts.instid ='afDatetimepicker'+Math.random().toString(36).substring(7);
    if(atts.placeholder ===undefined) {
      atts.placeholder ='sélectionner une date et une heure';
    }
    delete atts.opts;
    return atts;
  },
  // native: function() {
  //   return afDatetimepicker.featureDetect({}).mobile;
  // },
  dateOnly: function() {
    var instid =Template.instance().data.atts['data-schema-key'];
    var sessKeys =afDatetimepicker.formSessKeys(instid, {});
    return Session.get(sessKeys.dateOnly);
  },
  classes: function() {
    var instid =Template.instance().data.atts['data-schema-key'];
    var sessKeys =afDatetimepicker.formSessKeys(instid, {});
    return Session.get(sessKeys.classes);
  }
});

Template.afDatetimepicker.events({
  'change .autoform-datetimepicker-input': function(evt, template) {
    var instid =template.data.atts['data-schema-key'];
    if(afDatetimepicker.featureDetect({}).mobile) {
      //convert from input value format to the format we want (use the display format for consistency with Pikaday, even though we will NOT actually change the display value the user sees)
      var date =evt.target.value;
      var dateOnly =afDatetimepicker.checkForDateOnly(OPTS[instid], {});
      var inputFormatString =afDatetimepicker.getInputFormatNative(dateOnly, {});
      //if date only
      if(dateOnly) {
        VAL[instid] =moment(date, inputFormatString).format(OPTS[instid].pikaday.format);
      }
      //if date and time
      else {
        var dateMoment;
        var tzFromMinutes =false;
        if(typeof(date) =='object') {   //assume javascript date object
          dateMoment =moment(date);
        }
        else if(typeof(date) =='string') {    //assume Android, which apparently gives YYYY-MM-DDTHH:mmZ format..
          dateMoment =moment(date, 'YYYY-MM-DD HH:mm');
          if(date.indexOf('Z') >-1) {
            tzFromMinutes =0;
          }
        }

        //convert to local timezone (so it matches what the user actually selected)
        var format1 ='YYYY-MM-DD HH:mm:ssZ';
        var dtInfo =afDatetimepicker.convertTimezone(dateMoment, tzFromMinutes, false, {'format':format1});
        // var formattedModelVal =moment(dtInfo.dateFormatted, format1).format(scope.opts.formatModel);

        //update input value with non UTC value
        var inputFormat = moment(dtInfo.date).format(inputFormatString);
        evt.target.value =inputFormat;

        VAL[instid] = moment(dtInfo.date).format(OPTS[instid].pikaday.format);
      }
    }
    //on desktop they could manually type / change the value rather than using the datepicker so handle this case. Or just disable the input to force using the picker?
    else {
      var date =evt.target.value;
      if (!moment(date, OPTS[instid].pikaday.format).isValid()) {
        VAL[instid] ='';
        evt.target.value ='';
      }
    }
  }
});