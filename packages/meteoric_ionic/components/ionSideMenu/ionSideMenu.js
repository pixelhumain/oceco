/* global Template */
Template.ionSideMenu.helpers({
  classes () {
    const classes = ['snap-drawer'];

    if (this.side) {
      classes.push(`menu-${this.side}`);
      classes.push(`snap-drawer-${this.side}`);
    } else {
      classes.push('menu-left');
      classes.push('snap-drawer-left');
    }

    return classes.join(' ');
  },
});
