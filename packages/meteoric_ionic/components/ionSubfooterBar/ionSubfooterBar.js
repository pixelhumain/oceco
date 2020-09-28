/* eslint-disable meteor/no-session */
/* global Template Session */
Template.ionSubfooterBar.onRendered(function () {
  Session.set('hasSubfooter', true);
});

Template.ionSubfooterBar.onDestroyed(function () {
  Session.set('hasSubfooter', false);
});

Template.ionSubfooterBar.helpers({
  classes () {
    const classes = ['bar', 'bar-subfooter'];

    if (this.class) {
      classes.push(this.class);
    } else {
      classes.push('bar-stable');
    }

    return classes.join(' ');
  },
});
