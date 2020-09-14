/* eslint-disable no-undef */
Package.describe({
  name: 'djabatav:mjml',
  version: '0.1.5',
  summary: 'MJML Email Template Engine For Meteor',
});

Npm.depends({
  mjml: '4.6.3',
  handlebars: '4.7.6',
});

Package.onUse(function(api) {
  api.versionsFrom('1.8.1');
  api.use('ecmascript');
  api.use(['email'], 'server');
  api.mainModule('mjml.js', 'server');
});
