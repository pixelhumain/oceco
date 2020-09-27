/* global Template */
Template.ionListButton.helpers({
  classes() {
    const classes = [];

    const action = this.action || 'delete';
    const side = this.side || 'left';
    classes.push(`item-${action}`);
    classes.push(`item-${side}-edit`);

    classes.push('enable-pointer-events');

    return classes.join(' ');
  },
});
