/* global Template */
Template.ionSlide.helpers({
  classes () {
    const classes = ['ion-slide'];

    if (this.class) {
      classes.push(this.class);
    }

    return classes.join(' ');
  },
});
