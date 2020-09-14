Package.describe({
  name: 'notorii:autoform-datetimepicker',
  version: '1.0.6',
  // Brief, one-line summary of the package.
  summary: 'Cordova / Phonegap (and Pikaday for web), lightweight (no jQuery or Bootstrap) datetimepicker',
  // URL to the Git repository containing the source code for this package.
  git: 'https://github.com/notorii/meteor-autoform-datetimepicker',
  // By default, Meteor will default to using README.md for documentation.
  // To avoid submitting documentation, set this field to null.
  documentation: 'README.md'
});

Package.onUse(function(api) {
  api.versionsFrom('1.0.3.2');
  api.use('templating@1.0.0');
  api.use('blaze@2.0.0');
  api.use('aldeed:autoform@4.0.0 || 5.0.0 || 6.3.0');
  api.use('momentjs:moment@2.0.0');
  api.use('session@1.0.0');
  api.use('reactive-var@1.0.5');
  api.addFiles([
    'pikaday.js'
  ], 'client');
  api.addFiles([
    'notorii_autoform-datetimepicker.html',
    'notorii_autoform-datetimepicker.css',
    'notorii_autoform-datetimepicker.js'
  ], 'client');
});

Package.onTest(function(api) {
  api.use('tinytest');
  api.use('notorii:autoform-datetimepicker');
  api.addFiles('notorii_autoform-datetimepicker-tests.js');
});
