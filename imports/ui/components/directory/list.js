import { Template } from 'meteor/templating';

import './item.js';
import './list.html';

Template.directoryList.onCreated(function () {
  // console.log(Template.currentData());
  this.autorun(() => {
    /* new SimpleSchema({
      isConnect: { type: String, optional: true },
      list: { type: Mongo.Cursor, optional: true },
      person: { type: Boolean, optional: true },
      notButton: { type: Boolean, optional: true },
      scope: { type: String },
      scopeId: { type: String, optional: true },
      scopeCible: { type: String, optional: true },
      isScopeAdmin: { type: Boolean, optional: true },
    }).validate(Template.currentData()); */
  });
});
