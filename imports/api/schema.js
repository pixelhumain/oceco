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


export const SchemasOcecoText = new SimpleSchema({
  textTitre: {
    type: String,
    optional: true,
  },
  textInfo: {
    type: String,
    optional: true,
  },
  textBouton: {
    type: String,
    optional: true,
  },
});


export const SchemasOcecoObj = new SimpleSchema({
  pole: {
    type: Boolean,
    defaultValue: false,
    autoValue() {
      if (this.isSet) {
        return this.value;
      }
      return true;
    },
    optional: true,
  },
  organizationAction: {
    type: Boolean,
    defaultValue: false,
    autoValue() {
      if (this.isSet) {
        return this.value;
      }
      return true;
    },
    optional: true,
  },
  projectAction: {
    type: Boolean,
    defaultValue: false,
    autoValue() {
      if (this.isSet) {
        return this.value;
      }
      return true;
    },
    optional: true,
  },
  eventAction: {
    type: Boolean,
    defaultValue: false,
    autoValue() {
      if (this.isSet) {
        return this.value;
      }
      return true;
    },
    optional: true,
  },
  commentsAction: {
    type: Boolean,
    defaultValue: false,
    autoValue() {
      if (this.isSet) {
        return this.value;
      }
      return true;
    },
    optional: true,
  },
  spendView: {
    type: Boolean,
    defaultValue: true,
    autoValue() {
      if (this.isSet) {
        return this.value;
      }
      return true;
    },
    optional: true,
  },
  memberAuto: {
    type: Boolean,
    defaultValue: false,
    autoValue() {
      if (this.isSet) {
        return this.value;
      }
      return true;
    },
    optional: true,
  },
  agenda: {
    type: Boolean,
    defaultValue: false,
    autoValue() {
      if (this.isSet) {
        return this.value;
      }
      return true;
    },
    optional: true,
  },
  costum: {
    type: Object,
    optional: true,
  },
  'costum.projects': {
    type: Object,
    optional: true,
  },
  'costum.projects.form': {
    type: Object,
    optional: true,
  },
  'costum.projects.form.geo': {
    type: Boolean,
    defaultValue: false,
    autoValue() {
      if (this.isSet) {
        return this.value;
      }
      return true;
    },
    optional: true,
  },
  'costum.events': {
    type: Object,
    optional: true,
  },
  'costum.events.form': {
    type: Object,
    optional: true,
  },
  'costum.events.form.geo': {
    type: Boolean,
    defaultValue: false,
    autoValue() {
      if (this.isSet) {
        return this.value;
      }
      return true;
    },
    optional: true,
  },
  account: {
    type: Object,
    optional: true,
  },
  'account.textVotreCreditTemps': {
    type: String,
    optional: true,
  },
  'account.textUnite': {
    type: String,
    optional: true,
  },
  home: {
    type: Object,
    optional: true,
  },
  'home.textTitre': {
    type: String,
    optional: true,
  },
  'home.textInfo': {
    type: String,
    optional: true,
  },
  wallet: {
    type: Object,
    optional: true,
  },
  'wallet.textTitre': {
    type: String,
    optional: true,
  },
  'wallet.textInfo': {
    type: String,
    optional: true,
  },
  'wallet.textBouton': {
    type: String,
    optional: true,
  },
  'wallet.coupDeMain': {
    type: Object,
    optional: true,
  },
  'wallet.coupDeMain.textTitre': {
    type: String,
    optional: true,
  },
  'wallet.coupDeMain.textInfo': {
    type: String,
    optional: true,
  },
  'wallet.coupDeMain.textBouton': {
    type: String,
    optional: true,
  },
  'wallet.enAttente': {
    type: Object,
    optional: true,
  },
  'wallet.enAttente.textTitre': {
    type: String,
    optional: true,
  },
  'wallet.enAttente.textInfo': {
    type: String,
    optional: true,
  },
  'wallet.enAttente.textBouton': {
    type: String,
    optional: true,
  },
  'wallet.valides': {
    type: Object,
    optional: true,
  },
  'wallet.valides.textTitre': {
    type: String,
    optional: true,
  },
  'wallet.valides.textInfo': {
    type: String,
    optional: true,
  },
  'wallet.valides.textBouton': {
    type: String,
    optional: true,
  },
});

export const SchemasOceco = new SimpleSchema({
  oceco: {
    type: SchemasOcecoObj,
  },
});

/* "oceco" : {
        "pole" : true,
        "organizationAction" : false,
        "projectAction" : false,
        "eventAction" : true,
        "commentsAction": false,
        "memberAuto" : false,
        "agenda" : true,
        "costum" : {
            "projects" : {
                "form" : {
                    "geo" : false
                }
            },
            "events" : {
                "form" : {
                    "geo" : false
                }
            }
        },
        account: {
          textVotreCreditTemps:'Votre crédit temps',
          textUnite : 'R'
        },
        home: {
          textTitre: 'Choix du pole',
          textInfo: 'Sur cette page vous devrez choisir parmis les differents poles de votre organisation afin de voir les évenements et les actions qui en font partie. Si vous voulez voir les évenement par date merci de vous rendre dans "agenda"'
        },
        wallet: {
          textBouton: 'Espace temps',
          textTitre: 'Espace temps',
          textInfo: 'Votre éspace temps vous permet de voire à la fois vos crédits temps gagné ou dépensés et vos actions futur et à venir',
          coupDeMain: {
            textBouton: 'Coup de main',
            textTitre: 'Coup de main',
            textInfo: 'C\'est la liste de toute vos actions à faire au quels vous êtes inscrit'
          },
          enAttente: {
            textBouton: 'En attente',
            textTitre: 'En attente',
            textInfo: 'C\'est la liste de toute vos actions finis qui doivent êtres validé par un administrateur'
          },
          valides: {
            textBouton: 'Validés',
            textTitre: 'Validés',
            textInfo: 'C\'est la liste de vos 100 dernières anciennes actions qui vous ont rapporté ou qui vous ont couté des crédits'
          }
        }
    } */

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
    optional: true,
  },
  streetAddress: {
    type: String,
    optional: true,
  },
  postalCode: {
    type: String,
    min: 3,
    max: 9,
    optional: true,
  },
  city: {
    type: String,
    autoform: {
      type: 'select',
    },
    optional: true,
  },
  cityName: {
    type: String,
    autoform: {
      type: 'hidden',
    },
    optional: true,
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
