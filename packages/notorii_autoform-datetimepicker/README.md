# notorii:autoform-datetimepicker

An add-on Meteor package for aldeed:autoform. Provides a single custom input type, "datetimepicker", which renders an input that allows selecting datetime (or just date) across ALL platforms (mobile, desktop, wrapped inside a Cordova / Phonegap app). Specifically:
- Mobile (Android, iOS) (either Cordova wrapped apps or mobile web browser) just use the `datetime-local` (or `date`) input type, which will bring up the native date(time) input on mobile.
- Desktop web interfaces use Pikaday datetimepicker functionality.
  - https://github.com/owenmead/Pikaday (forked timepicker version of: https://github.com/dbushell/Pikaday)

Default datetime-local and date input types handle the majority of cases so this basically just does 3 things:

1. adds Pikaday functionality for desktop web
2. allows custom date/datetime formats (the transformation to make it "just work" with datetime-local formats will be handled for you)
3. provides ONE cross platform input type that will handle all cases


## Why?

- the default `datetime-local` and `date` input types do not have datepickers for desktop web
- other date(time)pickers such as [bs-datetimepicker](https://atmospherejs.com/aldeed/autoform-bs-datetimepicker) require other dependencies such as bootstrap or jQuery and do not work (as well) on mobile / when wrapped as a Cordova app, requiring custom code to switch out the datetime picker pending the platform - this package handles that all for you so you just set ONE input type and it works everywhere (across all platforms - web, Android, iOS).


## Demo

[Demo](http://lukemadera-packages.meteor.com/af-datetimepicker-basic)

[Source](https://github.com/lukemadera/meteor-packages/tree/master/autoform-datetimepicker/basic)


## Dependencies

- aldeed:autoform
- pikaday-time - [Pikaday Owenmead time picker fork](http://bower.io/search/?q=pikaday-time) (recommended to use `bower` with `mquandalle:bower` package to install, which will auto-include the necessary `pikaday.js` and `pikaday.css` files)
- momentjs:moment


## Installation

In a Meteor app directory:
```bash
meteor add notorii:autoform-datetimepicker
```
Add Pikaday javascript and css files, e.g.: add `"pikaday-time": "latest"` to your `bower.json` file.


## Usage

Specify "datetimepicker" for the `type` attribute of any input and set teh SimpleSchema to be an object:

```html
{{> afQuickField name="dueDate" type="datetimepicker" opts=optsDatetimepicker}}
```

In the schema, which will then work with a `quickForm` or `afQuickFields`:

```js
AFDatetimepickerSchema =new SimpleSchema({
  dueDate: {
    type: String,
    optional: true
  }
});
```

Specify options, including Pikaday options, with a template helper.

- @param {String} [formatValue ='YYYY-MM-DD HH:mm:ssZ'] The input and output value format (NOT what is displayed to the user by the Pikaday date time picker per se)

- @param {Object} [pikaday] The normal Pikaday date/time picker options, see: https://github.com/dbushell/Pikaday#configuration AND https://github.com/owenmead/Pikaday for time picker options, which are enabled by default

  - @param {String} [format ='YYYY-MM-DD h:mmA'] The Pikaday / input value format that is displayed. NOTE: the display value will only match what is set here for Pikaday (web desktop); mobile uses the native format for the date/time picker of that platform.

To disable the time picker and just have a date select, change the `formatValue` option (and `pikaday.format` generally as well) to specify the format you want (if no 'h' and no 'H' in the `formatValue`, it will assume date only) and then set the `pikaday.showTime` option to false.

```js
if(Meteor.isClient) {
  Template.autoformDatetimepickerBasic.helpers({
    optsDatetimepicker: function() {
      return {
        //WHAT IS STORED (i.e in the database)
        // formatValue: 'YYYY-MM-DD'
        pikaday: {
          //what is DISPLAYED (to the user)
          // format: 'MMM D, YYYY',
          // showTime: false,
        }
      }
    }
  });
}
```
