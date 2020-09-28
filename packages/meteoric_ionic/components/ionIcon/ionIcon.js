/* global Template */
Template.ionIcon.helpers({
  classes () {
    const classes = ['icon'];
    classes.push(`ion-${this.icon}`);

    if (this.class) {
      classes.push(this.class);
    }

    return classes.join(' ');
  },
});
