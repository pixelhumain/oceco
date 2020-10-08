/* eslint-disable no-undef */
Package.describe({
  name: 'communecter:account',
  version: '0.0.5',
  // Brief, one-line summary of the package.
  summary: '',
  // URL to the Git repository containing the source code for this package.
  git: '',
  // By default, Meteor will default to using README.md for documentation.
  // To avoid submitting documentation, set this field to null.
  documentation: 'README.md',
});

Package.onUse(function(api) {
  api.versionsFrom('1.8');
  api.use([
    'ecmascript',
    'ejson',
    'underscore',
    'accounts-base',
    'http',
  ]);

  api.imply('accounts-base', ['client', 'server']);

  api.mainModule('server/config.js', 'server');
  api.mainModule('client/config.js', 'client');
});
