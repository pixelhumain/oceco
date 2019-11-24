import { Template } from 'meteor/templating';
import { IonLoading } from 'meteor/meteoric:ionic';

import './loading.html';

Template.loading.onRendered(function () {
  IonLoading.show();
});

Template.loading.onDestroyed(function () {
  // console.log('onDestroyed');
  IonLoading.hide();
});
