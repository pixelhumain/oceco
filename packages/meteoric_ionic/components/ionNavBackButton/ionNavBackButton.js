/* eslint-disable no-underscore-dangle */
/* global Template Router $ */
/* global IonScrollPositions Platform */

// eslint-disable-next-line no-global-assign
IonScrollPositions = {};

Router.onStop(function () {
  IonScrollPositions[this.route.path(this.params)] = $('.overflow-scroll').scrollTop();
});

Template.ionNavBackButton.events({
  click(event, instance) {
    $('[data-nav-container]').addClass('nav-view-direction-back');
    $('[data-navbar-container]').addClass('nav-bar-direction-back');

    // get most up-to-date url, if it exists
    const backUrl = instance.getBackUrl();
    if (backUrl) {
      Router.go(backUrl);
    } else {
      window.history.back();
    }
  },
});

Template.ionNavBackButton.onCreated(function () {
  this.data = this.data || {};
});

Template.ionNavBackButton.onRendered(function () {
  const self = this;
  this.getBackUrl = function () {
    let backUrl = null;

    self.data = self.data || {};

    if (self.data.href) {
      backUrl = self.data.href;
    }

    if (self.data.path) {
      const backRoute = Router.routes[self.data.path];
      if (!backRoute) {
        // eslint-disable-next-line no-console
        console.warn('back to nonexistent route: ', self.data.path);
        return;
      }
      backUrl = backRoute.path(Template.parentData(1));
    }
    return backUrl;
  };
});

Template.ionNavBackButton.helpers({
  classes () {
    const classes = ['buttons button button-clear back-button pull-left'];

    if (this.class) {
      classes.push(this.class);
    }

    return classes.join(' ');
  },

  icon () {
    if (this.icon) {
      return this.icon;
    }

    if (Platform.isAndroid()) {
      return 'android-arrow-back';
    }

    return 'ios-arrow-back';
  },

  text () {
    if (this.text) {
      return this.text;
    } else if (this.text !== false) {
      return 'Back';
    }
  },
});
