/* eslint-disable meteor/no-session */
/* global Template Router $ */
/* global IonNavigation IonScrollPositions */
Template.ionView.onRendered(function () {
  // Reset our transition preference
  IonNavigation.skipTransitions = false;

  // Reset our scroll position
  const routePath = Router.current().route.path(Router.current().params);
  if (IonScrollPositions[routePath]) {
    $('.overflow-scroll').not('.nav-view-leaving .overflow-scroll').scrollTop(IonScrollPositions[routePath]);
    delete IonScrollPositions[routePath];
  }
});

Template.ionView.helpers({
  classes () {
    const classes = ['view'];

    if (this.class) {
      classes.push(this.class);
    }

    return classes.join(' ');
  },
  title () {
    if (Template.instance().data && Template.instance().data.title) {
      return Template.instance().data.title;
    }
  },
});
