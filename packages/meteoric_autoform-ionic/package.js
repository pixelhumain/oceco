Package.describe({
  name: "meteoric:autoform-ionic",
  summary: "Ionic theme for Autoform",
  version: "0.1.6",
  git: "https://github.com/meteoric/autoform-ionic.git"
});

Package.onUse(function(api) {
  api.versionsFrom("1.8.0.2");
  api.use(["templating", "underscore"], "client");
  api.use("aldeed:autoform@6.3.0");
  api.addFiles([
    "ionic.html",
    "ionic.css",
    "ionic.js"
  ], "client");
});
