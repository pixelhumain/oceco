import SimpleSchema from 'simpl-schema';
import { Tracker } from 'meteor/tracker';
// SimpleSchema.debug = true;

export const Countries_SELECT = ['FR', 'GP', 'MQ', 'YT', 'NC', 'RE', 'BE'];
export const Countries_SELECT_LABEL = [{ label: 'France', value: 'FR' }, { label: 'Guadeloupe', value: 'GP' }, { label: 'Guyanne Française', value: 'GF' }, { label: 'Martinique', value: 'MQ' }, { label: 'Mayotte', value: 'YT' }, { label: 'Nouvelle-Calédonie', value: 'NC' }, { label: 'Réunion', value: 'RE' }, { label: 'St Pierre et Miquelon', value: 'PM' }, { label: 'Belgique', value: 'BE' }];

export const roles_SELECT = ['admin', 'member', 'creator'];
export const roles_SELECT_LABEL = [{ label: 'Administrateur', value: 'admin' }, { label: 'Membre', value: 'member' }, { label: 'Juste un citoyen qui veut faire connaître cette organisation', value: 'creator' }];

export const avancements_SELECT = ['idea', 'concept', 'started', 'development', 'testing', 'mature'];
export const avancements_SELECT_LABEL = [{ label: 'idea', value: 'idea' }, { label: 'concept', value: 'concept' }, { label: 'started', value: 'started' }, { label: 'development', value: 'development' }, { label: 'testing', value: 'testing' }, { label: 'mature', value: 'mature' }];

export const preferencesSelect = ['public', 'private', 'hide'];

export const rolesPlusSelect = ['Organisateur', 'Partenaire', 'Financeur', 'Président', 'Sponsor', 'Directeur', 'Conférencier', 'Intervenant'];

export const statusProposals = ['amendable', 'tovote', 'resolved', 'disabled', 'closed', 'archived'];

export const SchemasRolesRest = new SimpleSchema({
  contextId: {
    type: String,
  },
  contextType: {
    type: String,
    allowedValues: ['events', 'projects', 'organizations'],
  },
  roles: {
    type: Array,
    optional: true,
  },
  'roles.$': {
    type: String,
    allowedValues: rolesPlusSelect,
  },
  childId: {
    type: String,
  },
  childType: {
    type: String,
    allowedValues: ['citoyens', 'organizations'],
  },
  connectType: {
    type: String,
    allowedValues: ['members', 'contributors', 'attendees'],
  },
});

export const SchemasShareRest = new SimpleSchema({
  parentId: {
    type: String,
  },
  parentType: {
    type: String,
  },
  comment: {
    type: String,
  },
});

export const blockBaseSchema = new SimpleSchema({
  typeElement: {
    type: String,
  },
  block: {
    type: String,
  },
});

export const preferences = new SimpleSchema({
  isOpenData: {
    type: Boolean,
    defaultValue: true,
    autoValue() {
      if (this.isSet) {
        // console.log(this.value);
        return this.value;
      }
      return true;
    },
    optional: true,
  },
  isOpenEdition: {
    type: Boolean,
    defaultValue: true,
    autoValue() {
      if (this.isSet) {
        // console.log(this.value);
        return this.value;
      }
      return true;
    },
    optional: true,
  },
});


export const baseSchema = new SimpleSchema({
  name: {
    type: String,
  },
  shortDescription: {
    type: String,
    max: 140,
    optional: true,
  },
  description: {
    type: String,
    optional: true,
  },
  url: {
    type: String,
    regEx: SimpleSchema.RegEx.Url,
    optional: true,
  },
  tags: {
    type: Array,
    optional: true,
  },
  'tags.$': {
    type: String,
  },
  preferences: {
    type: preferences,
    defaultValue: {},
    optional: true,
  },
});

export const geoSchema = new SimpleSchema({
  country: {
    type: String,
    min: 1,
  },
  streetAddress: {
    type: String,
    optional: true,
  },
  postalCode: {
    type: String,
    min: 3,
    max: 9,
  },
  city: {
    type: String,
    autoform: {
      type: 'select',
    },
  },
  cityName: {
    type: String,
    autoform: {
      type: 'hidden',
    },
  },
  regionName: {
    type: String,
    autoform: {
      type: 'hidden',
    },
    optional: true,
  },
  depName: {
    type: String,
    autoform: {
      type: 'hidden',
    },
    optional: true,
  },
  localityId: {
    type: String,
    autoform: {
      type: 'hidden',
    },
    optional: true,
  },
  geoPosLatitude: {
    type: Number,
    optional: true,
  },
  geoPosLongitude: {
    type: Number,
    optional: true,
  },
});

export const GeoCoordinates = new SimpleSchema({
  longitude: {
    type: Number,
  },
  latitude: {
    type: Number,
  },
});

export const GeoPosition = new SimpleSchema({
  type: {
    type: String,
    allowedValues: ['Point'],
    optional: true,
  },
  coordinates: {
    type: Array,
    optional: true,
  },
  'coordinates.$': {
    type: Number,
  },
});


export const PostalAddress = new SimpleSchema({
  addressLocality: {
    type: String,
  },
  streetAddress: {
    type: String,
    optional: true,
  },
  addressCountry: {
    type: String,
  },
  postalCode: {
    type: String,
    min: 5,
    max: 9,
  },
  codeInsee: {
    type: String,
    autoform: {
      type: 'select',
    },
  },
  depName: {
    type: String,
    optional: true,
  },
  regionName: {
    type: String,
    optional: true,
  },
});
