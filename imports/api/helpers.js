/* eslint-disable no-useless-escape */
/* eslint-disable no-underscore-dangle */
/* eslint-disable no-shadow */
/* eslint-disable array-callback-return */
/* eslint-disable consistent-return */
import { Meteor } from 'meteor/meteor';
import { _ } from 'meteor/underscore';
import { Mongo } from 'meteor/mongo';
import i18n from 'meteor/universe:i18n';
import { Citoyens } from './citoyens';

const diacriticsApplyMap = {
  default: [
    { base: 'A', letters: /[\u0041\u24B6\uFF21\u00C0\u00C1\u00C2\u1EA6\u1EA4\u1EAA\u1EA8\u00C3\u0100\u0102\u1EB0\u1EAE\u1EB4\u1EB2\u0226\u01E0\u00C4\u01DE\u1EA2\u00C5\u01FA\u01CD\u0200\u0202\u1EA0\u1EAC\u1EB6\u1E00\u0104\u023A\u2C6F]/g },
    { base: 'AA', letters: /[\uA732]/g },
    { base: 'AE', letters: /[\u00C6\u01FC\u01E2]/g },
    { base: 'AO', letters: /[\uA734]/g },
    { base: 'AU', letters: /[\uA736]/g },
    { base: 'AV', letters: /[\uA738\uA73A]/g },
    { base: 'AY', letters: /[\uA73C]/g },
    { base: 'B', letters: /[\u0042\u24B7\uFF22\u1E02\u1E04\u1E06\u0243\u0182\u0181]/g },
    { base: 'C', letters: /[\u0043\u24B8\uFF23\u0106\u0108\u010A\u010C\u00C7\u1E08\u0187\u023B\uA73E]/g },
    { base: 'D', letters: /[\u0044\u24B9\uFF24\u1E0A\u010E\u1E0C\u1E10\u1E12\u1E0E\u0110\u018B\u018A\u0189\uA779]/g },
    { base: 'DZ', letters: /[\u01F1\u01C4]/g },
    { base: 'Dz', letters: /[\u01F2\u01C5]/g },
    { base: 'E', letters: /[\u0045\u24BA\uFF25\u00C8\u00C9\u00CA\u1EC0\u1EBE\u1EC4\u1EC2\u1EBC\u0112\u1E14\u1E16\u0114\u0116\u00CB\u1EBA\u011A\u0204\u0206\u1EB8\u1EC6\u0228\u1E1C\u0118\u1E18\u1E1A\u0190\u018E]/g },
    { base: 'F', letters: /[\u0046\u24BB\uFF26\u1E1E\u0191\uA77B]/g },
    { base: 'G', letters: /[\u0047\u24BC\uFF27\u01F4\u011C\u1E20\u011E\u0120\u01E6\u0122\u01E4\u0193\uA7A0\uA77D\uA77E]/g },
    { base: 'H', letters: /[\u0048\u24BD\uFF28\u0124\u1E22\u1E26\u021E\u1E24\u1E28\u1E2A\u0126\u2C67\u2C75\uA78D]/g },
    { base: 'I', letters: /[\u0049\u24BE\uFF29\u00CC\u00CD\u00CE\u0128\u012A\u012C\u0130\u00CF\u1E2E\u1EC8\u01CF\u0208\u020A\u1ECA\u012E\u1E2C\u0197]/g },
    { base: 'J', letters: /[\u004A\u24BF\uFF2A\u0134\u0248]/g },
    { base: 'K', letters: /[\u004B\u24C0\uFF2B\u1E30\u01E8\u1E32\u0136\u1E34\u0198\u2C69\uA740\uA742\uA744\uA7A2]/g },
    { base: 'L', letters: /[\u004C\u24C1\uFF2C\u013F\u0139\u013D\u1E36\u1E38\u013B\u1E3C\u1E3A\u0141\u023D\u2C62\u2C60\uA748\uA746\uA780]/g },
    { base: 'LJ', letters: /[\u01C7]/g },
    { base: 'Lj', letters: /[\u01C8]/g },
    { base: 'M', letters: /[\u004D\u24C2\uFF2D\u1E3E\u1E40\u1E42\u2C6E\u019C]/g },
    { base: 'N', letters: /[\u004E\u24C3\uFF2E\u01F8\u0143\u00D1\u1E44\u0147\u1E46\u0145\u1E4A\u1E48\u0220\u019D\uA790\uA7A4]/g },
    { base: 'NJ', letters: /[\u01CA]/g },
    { base: 'Nj', letters: /[\u01CB]/g },
    { base: 'O', letters: /[\u004F\u24C4\uFF2F\u00D2\u00D3\u00D4\u1ED2\u1ED0\u1ED6\u1ED4\u00D5\u1E4C\u022C\u1E4E\u014C\u1E50\u1E52\u014E\u022E\u0230\u00D6\u022A\u1ECE\u0150\u01D1\u020C\u020E\u01A0\u1EDC\u1EDA\u1EE0\u1EDE\u1EE2\u1ECC\u1ED8\u01EA\u01EC\u00D8\u01FE\u0186\u019F\uA74A\uA74C]/g },
    { base: 'OI', letters: /[\u01A2]/g },
    { base: 'OO', letters: /[\uA74E]/g },
    { base: 'OU', letters: /[\u0222]/g },
    { base: 'P', letters: /[\u0050\u24C5\uFF30\u1E54\u1E56\u01A4\u2C63\uA750\uA752\uA754]/g },
    { base: 'Q', letters: /[\u0051\u24C6\uFF31\uA756\uA758\u024A]/g },
    { base: 'R', letters: /[\u0052\u24C7\uFF32\u0154\u1E58\u0158\u0210\u0212\u1E5A\u1E5C\u0156\u1E5E\u024C\u2C64\uA75A\uA7A6\uA782]/g },
    { base: 'S', letters: /[\u0053\u24C8\uFF33\u1E9E\u015A\u1E64\u015C\u1E60\u0160\u1E66\u1E62\u1E68\u0218\u015E\u2C7E\uA7A8\uA784]/g },
    { base: 'T', letters: /[\u0054\u24C9\uFF34\u1E6A\u0164\u1E6C\u021A\u0162\u1E70\u1E6E\u0166\u01AC\u01AE\u023E\uA786]/g },
    { base: 'TZ', letters: /[\uA728]/g },
    { base: 'U', letters: /[\u0055\u24CA\uFF35\u00D9\u00DA\u00DB\u0168\u1E78\u016A\u1E7A\u016C\u00DC\u01DB\u01D7\u01D5\u01D9\u1EE6\u016E\u0170\u01D3\u0214\u0216\u01AF\u1EEA\u1EE8\u1EEE\u1EEC\u1EF0\u1EE4\u1E72\u0172\u1E76\u1E74\u0244]/g },
    { base: 'V', letters: /[\u0056\u24CB\uFF36\u1E7C\u1E7E\u01B2\uA75E\u0245]/g },
    { base: 'VY', letters: /[\uA760]/g },
    { base: 'W', letters: /[\u0057\u24CC\uFF37\u1E80\u1E82\u0174\u1E86\u1E84\u1E88\u2C72]/g },
    { base: 'X', letters: /[\u0058\u24CD\uFF38\u1E8A\u1E8C]/g },
    { base: 'Y', letters: /[\u0059\u24CE\uFF39\u1EF2\u00DD\u0176\u1EF8\u0232\u1E8E\u0178\u1EF6\u1EF4\u01B3\u024E\u1EFE]/g },
    { base: 'Z', letters: /[\u005A\u24CF\uFF3A\u0179\u1E90\u017B\u017D\u1E92\u1E94\u01B5\u0224\u2C7F\u2C6B\uA762]/g },
    { base: 'a', letters: /[\u0061\u24D0\uFF41\u1E9A\u00E0\u00E1\u00E2\u1EA7\u1EA5\u1EAB\u1EA9\u00E3\u0101\u0103\u1EB1\u1EAF\u1EB5\u1EB3\u0227\u01E1\u00E4\u01DF\u1EA3\u00E5\u01FB\u01CE\u0201\u0203\u1EA1\u1EAD\u1EB7\u1E01\u0105\u2C65\u0250]/g },
    { base: 'aa', letters: /[\uA733]/g },
    { base: 'ae', letters: /[\u00E6\u01FD\u01E3]/g },
    { base: 'ao', letters: /[\uA735]/g },
    { base: 'au', letters: /[\uA737]/g },
    { base: 'av', letters: /[\uA739\uA73B]/g },
    { base: 'ay', letters: /[\uA73D]/g },
    { base: 'b', letters: /[\u0062\u24D1\uFF42\u1E03\u1E05\u1E07\u0180\u0183\u0253]/g },
    { base: 'c', letters: /[\u0063\u24D2\uFF43\u0107\u0109\u010B\u010D\u00E7\u1E09\u0188\u023C\uA73F\u2184]/g },
    { base: 'd', letters: /[\u0064\u24D3\uFF44\u1E0B\u010F\u1E0D\u1E11\u1E13\u1E0F\u0111\u018C\u0256\u0257\uA77A]/g },
    { base: 'dz', letters: /[\u01F3\u01C6]/g },
    { base: 'e', letters: /[\u0065\u24D4\uFF45\u00E8\u00E9\u00EA\u1EC1\u1EBF\u1EC5\u1EC3\u1EBD\u0113\u1E15\u1E17\u0115\u0117\u00EB\u1EBB\u011B\u0205\u0207\u1EB9\u1EC7\u0229\u1E1D\u0119\u1E19\u1E1B\u0247\u025B\u01DD]/g },
    { base: 'f', letters: /[\u0066\u24D5\uFF46\u1E1F\u0192\uA77C]/g },
    { base: 'g', letters: /[\u0067\u24D6\uFF47\u01F5\u011D\u1E21\u011F\u0121\u01E7\u0123\u01E5\u0260\uA7A1\u1D79\uA77F]/g },
    { base: 'h', letters: /[\u0068\u24D7\uFF48\u0125\u1E23\u1E27\u021F\u1E25\u1E29\u1E2B\u1E96\u0127\u2C68\u2C76\u0265]/g },
    { base: 'hv', letters: /[\u0195]/g },
    { base: 'i', letters: /[\u0069\u24D8\uFF49\u00EC\u00ED\u00EE\u0129\u012B\u012D\u00EF\u1E2F\u1EC9\u01D0\u0209\u020B\u1ECB\u012F\u1E2D\u0268\u0131]/g },
    { base: 'j', letters: /[\u006A\u24D9\uFF4A\u0135\u01F0\u0249]/g },
    { base: 'k', letters: /[\u006B\u24DA\uFF4B\u1E31\u01E9\u1E33\u0137\u1E35\u0199\u2C6A\uA741\uA743\uA745\uA7A3]/g },
    { base: 'l', letters: /[\u006C\u24DB\uFF4C\u0140\u013A\u013E\u1E37\u1E39\u013C\u1E3D\u1E3B\u017F\u0142\u019A\u026B\u2C61\uA749\uA781\uA747]/g },
    { base: 'lj', letters: /[\u01C9]/g },
    { base: 'm', letters: /[\u006D\u24DC\uFF4D\u1E3F\u1E41\u1E43\u0271\u026F]/g },
    { base: 'n', letters: /[\u006E\u24DD\uFF4E\u01F9\u0144\u00F1\u1E45\u0148\u1E47\u0146\u1E4B\u1E49\u019E\u0272\u0149\uA791\uA7A5]/g },
    { base: 'nj', letters: /[\u01CC]/g },
    { base: 'o', letters: /[\u006F\u24DE\uFF4F\u00F2\u00F3\u00F4\u1ED3\u1ED1\u1ED7\u1ED5\u00F5\u1E4D\u022D\u1E4F\u014D\u1E51\u1E53\u014F\u022F\u0231\u00F6\u022B\u1ECF\u0151\u01D2\u020D\u020F\u01A1\u1EDD\u1EDB\u1EE1\u1EDF\u1EE3\u1ECD\u1ED9\u01EB\u01ED\u00F8\u01FF\u0254\uA74B\uA74D\u0275]/g },
    { base: 'oi', letters: /[\u01A3]/g },
    { base: 'ou', letters: /[\u0223]/g },
    { base: 'oo', letters: /[\uA74F]/g },
    { base: 'p', letters: /[\u0070\u24DF\uFF50\u1E55\u1E57\u01A5\u1D7D\uA751\uA753\uA755]/g },
    { base: 'q', letters: /[\u0071\u24E0\uFF51\u024B\uA757\uA759]/g },
    { base: 'r', letters: /[\u0072\u24E1\uFF52\u0155\u1E59\u0159\u0211\u0213\u1E5B\u1E5D\u0157\u1E5F\u024D\u027D\uA75B\uA7A7\uA783]/g },
    { base: 's', letters: /[\u0073\u24E2\uFF53\u00DF\u015B\u1E65\u015D\u1E61\u0161\u1E67\u1E63\u1E69\u0219\u015F\u023F\uA7A9\uA785\u1E9B]/g },
    { base: 't', letters: /[\u0074\u24E3\uFF54\u1E6B\u1E97\u0165\u1E6D\u021B\u0163\u1E71\u1E6F\u0167\u01AD\u0288\u2C66\uA787]/g },
    { base: 'tz', letters: /[\uA729]/g },
    { base: 'u', letters: /[\u0075\u24E4\uFF55\u00F9\u00FA\u00FB\u0169\u1E79\u016B\u1E7B\u016D\u00FC\u01DC\u01D8\u01D6\u01DA\u1EE7\u016F\u0171\u01D4\u0215\u0217\u01B0\u1EEB\u1EE9\u1EEF\u1EED\u1EF1\u1EE5\u1E73\u0173\u1E77\u1E75\u0289]/g },
    { base: 'v', letters: /[\u0076\u24E5\uFF56\u1E7D\u1E7F\u028B\uA75F\u028C]/g },
    { base: 'vy', letters: /[\uA761]/g },
    { base: 'w', letters: /[\u0077\u24E6\uFF57\u1E81\u1E83\u0175\u1E87\u1E85\u1E98\u1E89\u2C73]/g },
    { base: 'x', letters: /[\u0078\u24E7\uFF58\u1E8B\u1E8D]/g },
    { base: 'y', letters: /[\u0079\u24E8\uFF59\u1EF3\u00FD\u0177\u1EF9\u0233\u1E8F\u00FF\u1EF7\u1E99\u1EF5\u01B4\u024F\u1EFF]/g },
    { base: 'z', letters: /[\u007A\u24E9\uFF5A\u017A\u1E91\u017C\u017E\u1E93\u1E95\u01B6\u0225\u0240\u2C6C\uA763]/g },
  ],
};

diacriticsApplyMap.regex = [];
for (let i = 0; i < diacriticsApplyMap.default.length; i++) {
  const item = diacriticsApplyMap.default[i];
  const base = `(?:${item.base}|${item.letters.source})`;
  diacriticsApplyMap.regex.push({
    base: `$1${base}`,
    letters: new RegExp(`([^\\[\\\\])${base}|^${base}`, 'g'),
  });
}

export const applyDiacritics = (str, which) => {
  const whichSelect = which || 'default';
  const changes = diacriticsApplyMap[whichSelect];
  const lettres = str.split('');
  let newStr = '';
  for (let f = 0; f < lettres.length; f++) {
    if (lettres[f] === ' ') {
      newStr += lettres[f];
    } else {
      for (let i = 0; i < diacriticsApplyMap.default.length; i++) {
        const strReplace = lettres[f].replace(changes[i].letters, changes[i].base);
        if (strReplace !== lettres[f]) {
          newStr += strReplace;
        }
      }
    }
  }
  return newStr;
};

export const capitalize = string => string.charAt(0).toUpperCase() + string.slice(1);

export const nameToCollection = (name) => {
  if (Meteor.isClient) {
    // Client
    return window[capitalize(name)];
  }
  // Server
  return global[capitalize(name)];
};

export const encodeString = str => encodeURIComponent(str).replace(/\*/g, '%2A');

export const compareValues = (key, order = 'asc') => function innerSort(a, b) {
  if (!Object.prototype.hasOwnProperty.call(a, key) || !Object.prototype.hasOwnProperty.call(b, key)) {
    // property doesn't exist on either object
    return 0;
  }

  const varA = (typeof a[key] === 'string')
    ? a[key].toUpperCase() : a[key];
  const varB = (typeof b[key] === 'string')
    ? b[key].toUpperCase() : b[key];

  let comparison = 0;
  if (varA > varB) {
    comparison = 1;
  } else if (varA < varB) {
    comparison = -1;
  }
  return (
    (order === 'desc') ? (comparison * -1) : comparison
  );
};

export const arrayAllLink = (links) => {
  const arrayIdsRetour = _.union(_.flatten(_.map(links, array => _.map(array, (a, k) => k))));
  return arrayIdsRetour;
};

export const searchQuery = (query, search) => {
  if (search) {
    if (search && search.charAt(0) === '#' && search.length > 1) {
      const searchApplyDiacritics = applyDiacritics(search.substr(1).replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'regex');
      query.tags = { $regex: searchApplyDiacritics, $options: 'i' };
    } else if (search && search.charAt(0) === '?') {
      // filtrer avec ? sur les actions
      // pas de contributors : ?nc
      // avec contributors : ?c
      switch (search.substr(1)) {
        // avec contributors
        case 'c':
          query['links.contributors'] = { $exists: true };
          break;
        // pas de contributors
        case 'nc':
          query['links.contributors'] = { $exists: false };
          break;
        case 'me':
          query[`links.contributors.${Meteor.userId()}`] = { $exists: true };
          break;
        default:
          // console.log(`Sorry, we are out of ${search.substr(1)}.`);
      }
    } else if (search && search.charAt(0) === '@' && search.length > 1) {
      const username = search.substr(1);
      const userOne = Citoyens.findOne({ username });
      if (userOne) {
        query[`links.contributors.${userOne._id._str}`] = { $exists: true };
      }
    } else if (search && search.charAt(0) === ':' && search.length > 1) {
    // search projet donc pas de recherche dans actions
      const searchApplyDiacritics = applyDiacritics(search.substr(1).replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'regex');
      query.name = { $regex: `.*${searchApplyDiacritics}.*`, $options: 'i' };
    } else if (search && search.length > 1) {
      const searchApplyDiacritics = applyDiacritics(search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'regex');
      query.name = { $regex: `.*${searchApplyDiacritics}.*`, $options: 'i' };
    }
  }
  return query;
};

export const searchQuerySort = (type, sort) => {
  if (sort && sort[type] && sort[type].length > 0) {
    const arrayChecked = [...sort[type]].filter(item => item.checked === true).sort(compareValues('order'));
    if (arrayChecked && arrayChecked.length > 0) {
      // je suis dans le bonne ordre
      // il y a les champs
      const arraySort = arrayChecked.map((item) => {
        // const order = item.fieldDesc ? -1 : 1;
        const order = item.fieldDesc ? 'desc' : 'asc';
        // si field et le même que dans la requete
        if (item.existField) {
          return [item.field, order];
          // return { [item.field]: order };
        }
        if (item.field === 'withContributor') {
          //
        }
      });
      return arraySort;
    }
  }
  return false;
};

export const searchQuerySortActived = (sort) => {
  const arrayActived = Object.keys(sort)
    .filter(k => [...sort[k]].filter(item => item.checked === true).length > 0);
  return arrayActived.length > 0;
};

export const selectorgaQuery = (query, selectorga) => {
  if (selectorga) {
    query.type = selectorga;
  }
  return query;
};

export const arrayLinkProper = (array) => {
  const arrayIds = Object.keys(array)
    .filter(k => array[k].isInviting !== true && !(array[k].type === 'citoyens' && array[k].toBeValidated === true))
    .map(k => new Mongo.ObjectID(k));
  /* const arrayIds = _.filter(_.map(array, (arrayLink, key) => {
    if (arrayLink.isInviting === true) {
      return undefined;
    }
    if (arrayLink.type === 'citoyens' && arrayLink.toBeValidated === true) {
      return undefined;
    }
    return new Mongo.ObjectID(key);
  }), arrayfilter => arrayfilter !== undefined); */
  return arrayIds;
};

export const arrayLinkProperNoObject = (array) => {
  const arrayIds = Object.keys(array)
    .filter(k => array[k].isInviting !== true && !(array[k].type === 'citoyens' && array[k].toBeValidated === true))
    .map(k => k);
  /* const arrayIds = _.filter(_.map(array, (arrayLink, key) => {
    if (arrayLink.isInviting === true) {
      return undefined;
    }
    if (arrayLink.type === 'citoyens' && arrayLink.toBeValidated === true) {
      return undefined;
    }
    return key;
  }), arrayfilter => arrayfilter !== undefined); */
  return arrayIds;
};

export const arrayLinkProperInter = (arraya, arrayb) => {
  const arrayaIds = arrayLinkProperNoObject(arraya);
  const arraybIds = arrayLinkProperNoObject(arrayb);
  const a = new Set(arrayaIds);
  const b = new Set(arraybIds);
  const arrayIdsSet = new Set(
    [...a].filter(x => b.has(x)));
  const arrayIds = [...arrayIdsSet].map(_id => new Mongo.ObjectID(_id));
  return arrayIds;
};

export const queryLinkInter = (arraya, arrayb, search, selectorga) => {
  // const arrayIds = _.map(array, (arrayLink, key) => new Mongo.ObjectID(key));
  const arrayIds = arrayLinkProperInter(arraya, arrayb);
  let query = {};
  query._id = { $in: arrayIds };
  if (Meteor.isClient) {
    if (search) {
      query = searchQuery(query, search);
    }
    if (selectorga) {
      query = selectorgaQuery(query, selectorga);
    }
  }
  return query;
};

export const queryLink = (array, search, selectorga) => {
  // const arrayIds = _.map(array, (arrayLink, key) => new Mongo.ObjectID(key));
  const arrayIds = arrayLinkProper(array);
  let query = {};
  query._id = { $in: arrayIds };
  if (Meteor.isClient) {
    if (search) {
      query = searchQuery(query, search);
    }
    if (selectorga) {
      query = selectorgaQuery(query, selectorga);
    }
  }
  return query;
};

export const arrayLinkIsAdmin = (array, arrayOrga) => {
  const arrayIds = Object.keys(array)
    .filter(k => arrayOrga && arrayOrga[k] && array[k].isAdmin && !array[k].toBeValidated && !array[k].isAdminPending && !array[k].isInviting)
    .map(k => new Mongo.ObjectID(k));
  return arrayIds;
};

export const queryLinkIsAdmin = (array, arrayOrga, search) => {
  const arrayIds = arrayLinkIsAdmin(array, arrayOrga);
  let query = {};
  query._id = { $in: arrayIds };
  if (Meteor.isClient) {
    if (search) {
      query = searchQuery(query, search);
    }
  }
  return query;
};

export const arrayLinkToBeValidated = (array) => {
  const arrayIds = Object.keys(array)
    .filter(k => array[k].toBeValidated === true || array[k].isAdminPending === true)
    .map(k => new Mongo.ObjectID(k));
  /* const arrayIds = _.filter(_.map(array, (arrayLink, key) => {
    if (arrayLink.toBeValidated === true) {
      return new Mongo.ObjectID(key);
    }
    return undefined;
  }), arrayfilter => arrayfilter !== undefined); */
  return arrayIds;
};

export const queryLinkToBeValidated = (array) => {
  const arrayIds = arrayLinkToBeValidated(array);
  const query = {};
  query._id = { $in: arrayIds };
  return query;
};

export const arrayLinkToModerate = (array) => {
  const arrayIds = Object.keys(array)
    .filter(k => array[k] === 'toModerate')
    .map(k => new Mongo.ObjectID(k));
  return arrayIds;
};

export const arrayLinkValidated = (array) => {
  const arrayIds = Object.keys(array)
    .filter(k => array[k] === 'validated')
    .map(k => new Mongo.ObjectID(k));
  return arrayIds;
};

export const arrayLinkIsInviting = (array) => {
  const arrayIds = Object.keys(array)
    .filter(k => array[k].isInviting === true)
    .map(k => new Mongo.ObjectID(k));
  /* const arrayIds = _.filter(_.map(array, (arrayLink, key) => {
    if (arrayLink.isInviting === true) {
      return new Mongo.ObjectID(key);
    }
    return undefined;
  }), arrayfilter => arrayfilter !== undefined); */
  return arrayIds;
};

export const queryLinkIsInviting = (array, search) => {
  const arrayIds = arrayLinkIsInviting(array);
  let query = {};
  query._id = { $in: arrayIds };
  if (Meteor.isClient) {
    if (search) {
      query = searchQuery(query, search);
    }
  }
  return query;
};

export const arrayLinkAttendees = (array, type) => {
  const arrayIds = Object.keys(array)
    .filter(k => array[k].isInviting !== true && array[k].type === type)
    .map(k => new Mongo.ObjectID(k));
  /* const arrayIds = _.filter(_.map(array, (arrayLink, key) => {
    if (arrayLink.isInviting === true) {
      return undefined;
    }
    if (arrayLink.type === type) {
      return new Mongo.ObjectID(key);
    }
    return undefined;
  }), arrayfilter => arrayfilter !== undefined); */
  return arrayIds;
};

export const arrayLinkParent = (array, type) => {
  const arrayIds = Object.keys(array)
    .filter(k => array[k].type === type)
    .map(k => new Mongo.ObjectID(k));
  return arrayIds;
};

export const arrayLinkParentNoObject = (array, type) => {
  const arrayIds = Object.keys(array)
    .filter(k => array[k].type === type)
    .map(k => k);
  return arrayIds;
};

export const arrayParent = (array, arrayType) => {
  const arrayIds = Object.keys(array)
    .filter(k => _.contains(arrayType, array[k].type))
    .map(k => new Mongo.ObjectID(k));
  return arrayIds;
};

export const queryOrPrivatescopeIds = (query, scope, scopeIds, userId) => {
  const queryOrPrivate = {};
  queryOrPrivate._id = { $in: scopeIds };
  queryOrPrivate['preferences.private'] = true;
  queryOrPrivate[`links.${scope}.${userId}`] = {
    $exists: true,
  };
  queryOrPrivate[`links.${scope}.${userId}.toBeValidated`] = {
    $exists: false,
  };
  query.$or.push(queryOrPrivate);

  const queryOrPrivateInvite = {};
  queryOrPrivateInvite._id = { $in: scopeIds };
  queryOrPrivateInvite['preferences.private'] = true;
  queryOrPrivateInvite[`links.${scope}.${userId}`] = {
    $exists: true,
  };
  queryOrPrivateInvite[`links.${scope}.${userId}.isInviting`] = {
    $exists: true,
  };
  query.$or.push(queryOrPrivateInvite);
  return query;
};

export const arrayChildrenParent = (scope, parentAuthorise, scopeParent = null, fields = {
  name: 1,
  links: 1,
  profilThumbImageUrl: 1,
  preferences: 1,
}) => {
  const childrenParent = [];

  // console.log(scope);

  if (scope === 'events') {
    // sous events
    const parentEventPush = {
      find(scopeD) {
        // console.log(scopeD);
        if (scopeD.parent) {
          const arrayIdsParent = arrayLinkParent(scopeD.parent, 'events');
          // console.log(arrayIdsParent);
          const collectionType = nameToCollection('events');

          let query = {};
          query.$or = [];
          query.$or.push({
            _id: {
              $in: arrayIdsParent,
            },
            'preferences.private': false,
          });
          query = queryOrPrivatescopeIds(query, 'attendees', arrayIdsParent, Meteor.userId());

          return collectionType.find(query, {
            fields,
          });
        }
      },
    };
    childrenParent.push(parentEventPush);
  }

  parentAuthorise.forEach((parent) => {
    if (scope === 'events') {
      const parentPush = {
        find(scopeD) {
          // console.log(scopeD);
          if (scopeD.organizer) {
            // console.log(parent);
            const arrayIdsParent = arrayLinkParent(scopeD.organizer, parent);
            // console.log(arrayIdsParent);
            const collectionType = nameToCollection(parent);
            let query = {};
            if (_.contains(['events', 'projects', 'organizations'], parent)) {
              query.$or = [];
              query.$or.push({
                _id: {
                  $in: arrayIdsParent,
                },
                'preferences.private': false,
              });

              if (parent === 'projects') {
                query = queryOrPrivatescopeIds(query, 'contributors', arrayIdsParent, Meteor.userId());
              } else if (parent === 'organizations') {
                query = queryOrPrivatescopeIds(query, 'members', arrayIdsParent, Meteor.userId());
              } else if (parent === 'events') {
                query = queryOrPrivatescopeIds(query, 'attendees', arrayIdsParent, Meteor.userId());
              }
            } else {
              query._id = {
                _id: {
                  $in: arrayIdsParent,
                },
              };
            }
            // console.log(query);
            return collectionType.find(query, {
              fields,
            });
          }
        },
      };

      childrenParent.push(parentPush);
    } else {
      const parentPush = {
        find(scopeD) {
          // console.log(scopeD);
          if (scopeParent) {
            if (_.contains(scopeParent, scope)) {
              if (scopeD.parent) {
                const arrayIdsParent = arrayLinkParent(scopeD.parent, parent);
                // console.log(arrayIdsParent);
                const collectionType = nameToCollection(parent);
                let query = {};
                if (_.contains(['events', 'projects', 'organizations'], parent)) {
                  query.$or = [];
                  query.$or.push({
                    _id: {
                      $in: arrayIdsParent,
                    },
                    'preferences.private': false,
                  });

                  if (parent === 'projects') {
                    query = queryOrPrivatescopeIds(query, 'contributors', arrayIdsParent, Meteor.userId());
                  } else if (parent === 'organizations') {
                    query = queryOrPrivatescopeIds(query, 'members', arrayIdsParent, Meteor.userId());
                  } else if (parent === 'events') {
                    query = queryOrPrivatescopeIds(query, 'attendees', arrayIdsParent, Meteor.userId());
                  }
                } else {
                  query._id = {
                    _id: {
                      $in: arrayIdsParent,
                    },
                  };
                }
                return collectionType.find(query, {
                  fields,
                });
              }
              if (scopeD.parentType && scopeD.parentId && _.contains(parentAuthorise, scopeD.parentType)) {
                const collectionType = nameToCollection(scopeD.parentType);
                return collectionType.find({
                  _id: new Mongo.ObjectID(scopeD.parentId),
                }, {
                  fields,
                });
              }
            }
          } else {
            if (scopeD.parent) {
              const arrayIdsParent = arrayLinkParent(scopeD.parent, parent);
              // console.log(arrayIdsParent);
              const collectionType = nameToCollection(parent);
              let query = {};
              if (_.contains(['events', 'projects', 'organizations'], parent)) {
                query.$or = [];
                query.$or.push({
                  _id: {
                    $in: arrayIdsParent,
                  },
                  'preferences.private': false,
                });

                if (parent === 'projects') {
                  query = queryOrPrivatescopeIds(query, 'contributors', arrayIdsParent, Meteor.userId());
                } else if (parent === 'organizations') {
                  query = queryOrPrivatescopeIds(query, 'members', arrayIdsParent, Meteor.userId());
                } else if (parent === 'events') {
                  query = queryOrPrivatescopeIds(query, 'attendees', arrayIdsParent, Meteor.userId());
                }
              } else {
                query._id = {
                  _id: {
                    $in: arrayIdsParent,
                  },
                };
              }
              return collectionType.find(query, {
                fields,
              });
            }
            if (scopeD.parentType && scopeD.parentId && _.contains(parentAuthorise, scopeD.parentType)) {
              const collectionType = nameToCollection(scopeD.parentType);
              return collectionType.find({
                _id: new Mongo.ObjectID(scopeD.parentId),
              }, {
                fields,
              });
            }
          }
        },
      };
      childrenParent.push(parentPush);
    }
  });
  return childrenParent;
};

export const isAdminArray = (organizerArray, citoyen) => {
  let isAdmin = false;
  if (organizerArray) {
    organizerArray.forEach((parent) => {
      // parent.type
      parent.values.forEach((value) => {
        // value._id
        if (parent.type === 'events' && citoyen.links && citoyen.links.events && citoyen.links.events[value._id._str] && citoyen.links.events[value._id._str].isAdmin) {
          isAdmin = true;
        } else if (parent.type === 'projects' && citoyen.links && citoyen.links.projects && citoyen.links.projects[value._id._str] && citoyen.links.projects[value._id._str].isAdmin) {
          isAdmin = true;
        } else if (parent.type === 'organizations' && citoyen.links && citoyen.links.memberOf && citoyen.links.memberOf[value._id._str] && citoyen.links.memberOf[value._id._str].isAdmin) {
          isAdmin = true;
        }
      });
    });
  }
  return isAdmin;
};

export const arrayOrganizerParent = (arrayParent, parentAuthorise, fields = {
  name: 1,
  links: 1,
  preferences: 1,
}) => {
  const childrenParent = [];
  parentAuthorise.forEach((parent) => {
    const arrayIds = arrayLinkParent(arrayParent, parent);
    const collectionType = nameToCollection(parent);
    const arrayType = collectionType.find({
      _id: {
        $in: arrayIds,
      },
    }, {
      fields,
    }).fetch();
    if (arrayType && arrayType.length > 0) {
      childrenParent.push({
        type: parent,
        values: arrayType,
      });
    }
  });
  return childrenParent;
};

export const queryOrPrivateScopeLinks = (scope, scopeId) => {
  const query = {};
  query.$or = [];
  const queryOrDefault = {};
  queryOrDefault['preferences.private'] = false;
  queryOrDefault[`links.${scope}.${scopeId}`] = { $exists: true };
  // queryOrDefault[`links.contributors.${this._id._str}.toBeValidated`] = { $exists: false };
  // queryOrDefault[`links.contributors.${this._id._str}.isInviting`] = { $exists: false };
  query.$or.push(queryOrDefault);
  const queryOrDefaultVide = {};
  queryOrDefaultVide['preferences.private'] = { $exists: false };
  queryOrDefaultVide[`links.${scope}.${scopeId}`] = { $exists: true };
  // queryOrDefaultVide[`links.contributors.${this._id._str}.toBeValidated`] = { $exists: false };
  // queryOrDefaultVide[`links.contributors.${this._id._str}.isInviting`] = { $exists: false };
  query.$or.push(queryOrDefaultVide);
  // private userId validate
  const queryOrPrivate = {};
  queryOrPrivate['preferences.private'] = true;
  queryOrPrivate[`links.${scope}.${scopeId}`] = { $exists: true };
  queryOrPrivate[`links.${scope}.${scopeId}.toBeValidated`] = { $exists: false };
  queryOrPrivate[`links.${scope}.${scopeId}.isInviting`] = { $exists: false };
  queryOrPrivate[`links.${scope}.${Meteor.userId()}`] = { $exists: true };
  queryOrPrivate[`links.${scope}.${Meteor.userId()}.toBeValidated`] = { $exists: false };
  query.$or.push(queryOrPrivate);
  // private userId IsInviting
  const queryOrPrivateIsInviting = {};
  queryOrPrivateIsInviting['preferences.private'] = true;
  queryOrPrivateIsInviting[`links.${scope}.${scopeId}`] = { $exists: true };
  queryOrPrivateIsInviting[`links.${scope}.${scopeId}.toBeValidated`] = { $exists: false };
  queryOrPrivateIsInviting[`links.${scope}.${scopeId}.isInviting`] = { $exists: false };
  queryOrPrivateIsInviting[`links.${scope}.${Meteor.userId()}`] = { $exists: true };
  queryOrPrivateIsInviting[`links.${scope}.${Meteor.userId()}.isInviting`] = { $exists: true };
  query.$or.push(queryOrPrivateIsInviting);
  if (scope === 'members') {
    const queryAnd = {};
    queryAnd.$and = [];
    const queryOceco = {};
    queryOceco.oceco = { $exists: true };
    queryAnd.$and.push(queryOceco);
    queryAnd.$and.push(query);
    return queryAnd;
  }
  return query;
};

export const queryOrPrivateScopeLinksIds = (queryStart, scope) => {
  const query = {};
  query.$or = [];
  const queryOrDefault = { ...queryStart };
  queryOrDefault['preferences.private'] = false;
  query.$or.push(queryOrDefault);
  const queryOrDefaultVide = { ...queryStart };
  queryOrDefaultVide['preferences.private'] = { $exists: false };
  query.$or.push(queryOrDefaultVide);
  // private userId validate
  const queryOrPrivate = { ...queryStart };
  queryOrPrivate['preferences.private'] = true;
  queryOrPrivate[`links.${scope}.${Meteor.userId()}`] = { $exists: true };
  queryOrPrivate[`links.${scope}.${Meteor.userId()}.toBeValidated`] = { $exists: false };
  query.$or.push(queryOrPrivate);
  // private userId IsInviting
  const queryOrPrivateIsInviting = { ...queryStart };
  queryOrPrivateIsInviting['preferences.private'] = true;
  queryOrPrivateIsInviting[`links.${scope}.${Meteor.userId()}`] = { $exists: true };
  queryOrPrivateIsInviting[`links.${scope}.${Meteor.userId()}.isInviting`] = { $exists: true };
  query.$or.push(queryOrPrivateIsInviting);
  // console.log(JSON.stringify(query));
  return query;
};

export const queryOrPrivateScope = (query, scope, scopeId, userId) => {
  const queryOrPrivate = {};
  queryOrPrivate._id = new Mongo.ObjectID(scopeId);
  queryOrPrivate['preferences.private'] = true;
  queryOrPrivate[`links.${scope}.${userId}`] = {
    $exists: true,
  };
  queryOrPrivate[`links.${scope}.${userId}.toBeValidated`] = {
    $exists: false,
  };
  query.$or.push(queryOrPrivate);

  const queryOrPrivateInvite = {};
  queryOrPrivateInvite._id = new Mongo.ObjectID(scopeId);
  queryOrPrivateInvite['preferences.private'] = true;
  queryOrPrivateInvite[`links.${scope}.${userId}`] = {
    $exists: true,
  };
  queryOrPrivateInvite[`links.${scope}.${userId}.isInviting`] = {
    $exists: true,
  };
  query.$or.push(queryOrPrivateInvite);
  return query;
};


export const queryLinkAttendees = (array, search, type) => {
  const arrayIds = arrayLinkAttendees(array, type);
  let query = {};
  query._id = { $in: arrayIds };
  if (Meteor.isClient) {
    if (search) {
      query = searchQuery(query, search);
    }
    /* if (selectorga) {
      query = selectorgaQuery(query, selectorga);
    } */
  }
  return query;
};

export const arrayLinkType = (array, type) => {
  const arrayIds = Object.keys(array)
    .filter(k => array[k].isInviting !== true && !(array[k].type === 'citoyens' && array[k].toBeValidated === true) && array[k].type === type)
    .map(k => new Mongo.ObjectID(k));
  /* const arrayIds = _.filter(_.map(array, (arrayLink, key) => {
    if (arrayLink.isInviting === true) {
      return undefined;
    }
    if (arrayLink.type === 'citoyens' && arrayLink.toBeValidated === true) {
      return undefined;
    }
    if (arrayLink.type === type) {
      return new Mongo.ObjectID(key);
    }
    return undefined;
  }), arrayfilter => arrayfilter !== undefined); */
  return arrayIds;
};

export const queryLinkType = (array, search, type, selectorga) => {
  const arrayIds = arrayLinkType(array, type);
  let query = {};
  query._id = { $in: arrayIds };
  if (Meteor.isClient) {
    if (search) {
      query = searchQuery(query, search);
    }
    if (selectorga) {
      query = selectorgaQuery(query, selectorga);
    }
  }
  return query;
};

export const queryOptions = { sort: { name: 1 },
  fields: {
    _id: 1,
    name: 1,
    links: 1,
    parent: 1,
    organizer: 1,
    preferences: 1,
    parentId: 1,
    parentType: 1,
    organizerId: 1,
    organizerType: 1,
    tags: 1,
    type: 1,
    profilThumbImageUrl: 1,
  } };


if (Meteor.isClient) {
  import position from './client/position.js';

  export const queryGeoFilter = (query) => {
    const radius = position.getRadius();
    const latlngObj = position.getLatlngObject();
    if (radius && latlngObj) {
      const nearObj = position.getNear();
      query.geoPosition = nearObj.geoPosition;
    } else {
      const city = position.getCity();
      if (city && city.geoShape && city.geoShape.coordinates) {
        query['address.codeInsee'] = city.insee;
      }
    }
    return query;
  };

  export const userLanguage = () => {
  // If the user is logged in, retrieve their saved language
    if (Meteor.user()) {
      return Meteor.user().profile.language;
    }
    return undefined;
  };

  export const languageBrowser = () => {
    const localeFromBrowser = window.navigator.userLanguage || window.navigator.language;
    let locale = 'en';

    if (localeFromBrowser.match(/en/)) locale = 'en';
    if (localeFromBrowser.match(/fr/)) locale = 'fr';

    return locale;
  };
}

export const notifyDisplay = (notify, lang = null, html = false, chat = false) => {
  if (notify) {
    let label = notify.displayName;
    const arrayReplace = {};
    if (lang) {
      arrayReplace._locale = lang;
    }
    if (notify.displayName && notify.labelArray) {
      label = label.replace(new RegExp(/[\{\}]+/, 'g'), '');
      label = label.replace(new RegExp(' ', 'g'), '_');
      Object.keys(notify.labelArray).forEach((k) => {
        if (k === '{where}') {
          if (Array.isArray(notify.labelArray[k])) {
            const whereString = [];
            notify.labelArray[k].forEach((value) => {
              const labelWhere = value.replace(new RegExp(' ', 'g'), '_');
              const labelWhereIndex = `activitystream.notification.${labelWhere}`;
              let labelWhereI18n = lang ? i18n.__(labelWhereIndex, { _locale: lang }) : i18n.__(labelWhereIndex);
              // correction
              labelWhereI18n = labelWhereI18n.replace(new RegExp('&amp;', 'g'), '&');
              if (labelWhereI18n !== labelWhereIndex) {
                whereString.push(labelWhereI18n);
              } else {
                whereString.push(value);
              }
            });
            arrayReplace.where = whereString.join(' ');
          } else {
            arrayReplace.where = '';
          }
        } else if (k === '{author}') {
          if (Array.isArray(notify.labelArray[k])) {
            arrayReplace.author = notify.labelArray[k].join(',');
          } else {
            arrayReplace.author = '';
          }
        } else if (k === '{mentions}') {
          if (Array.isArray(notify.labelArray[k])) {
            const mentionsString = [];
            notify.labelArray[k] = chat && notify.labelArray['{mentionsusername}'] ? notify.labelArray['{mentionsusername}'] : notify.labelArray[k];
            notify.labelArray[k].forEach((value) => {
              const labelMentions = value.replace(new RegExp(' ', 'g'), '_');
              const labelMentionsIndex = `activitystream.notification.${labelMentions}`;
              let labelMentionsI18n = lang ? i18n.__(labelMentionsIndex, { _locale: lang }) : i18n.__(labelMentionsIndex);
              // correction
              labelMentionsI18n = labelMentionsI18n.replace(new RegExp('&amp;', 'g'), '&');
              if (labelMentionsI18n !== labelMentionsIndex) {
                mentionsString.push(labelMentionsI18n);
              } else {
                mentionsString.push(value);
              }
            });
            arrayReplace.mentions = mentionsString.join(' ');
            // arrayReplace.mentions = notify.labelArray[k].join(',');
          } else {
            arrayReplace.mentions = '';
          }
        } else if (k === '{what}') {
          if (Array.isArray(notify.labelArray[k])) {
            arrayReplace.what = notify.labelArray[k].join(',');
            // &quot;
            arrayReplace.what.replace(new RegExp('&quot;', 'g'), '');
          } else {
            arrayReplace.what = '';
          }
        } else if (k === '{who}') {
          if (Array.isArray(notify.labelArray[k])) {
            let whoNumber;
            const whoString = [];
            notify.labelArray[k] = chat && notify.labelArray['{whousername}'] ? notify.labelArray['{whousername}'] : notify.labelArray[k];
            notify.labelArray[k].forEach((value) => {
              if (Number.isInteger(value)) {
                whoNumber = lang ? i18n.__('activitystream.notification.whoNumber', { count: value, _locale: lang }) : i18n.__('activitystream.notification.whoNumber', { count: value });
              } else {
                whoString.push(value);
              }
            });
            if (whoString.length > 1 && whoNumber) {
              arrayReplace.who = `${whoString.join(',')}, ${whoNumber}`;
            } else if (whoString.length === 1 && !whoNumber) {
              arrayReplace.who = `${whoString.join(',')}`;
            } else if (whoString.length === 2 && !whoNumber) {
              arrayReplace.who = whoString.join(` ${i18n.__('activitystream.notification.and')} `);
            }
          } else {
            arrayReplace.who = '';
          }
        } else if (k === '{comment}') {
          if (Array.isArray(notify.labelArray[k])) {
            arrayReplace.comment = notify.labelArray[k].join(',');
          } else {
            arrayReplace.comment = '';
          }
        }
      });
      if (Meteor.isClient && html) {
        Object.keys(arrayReplace).forEach(function (item) {
          arrayReplace[item] = `<strong>${arrayReplace[item]}</strong>`;
        });
      } else if (chat) {
        Object.keys(arrayReplace).forEach(function (item) {
          if (item === 'who' || item === 'author' || item === 'mentions') {
            arrayReplace[item] = `@${arrayReplace[item]}`;
          } else if (item === 'comment') {
            arrayReplace[item] = `\n _${arrayReplace[item]}_ \n`;
          } else if (item !== '_locale') {
            arrayReplace[item] = `*${arrayReplace[item]}*`;
          }
        });

        if (notify.displayNameChat) {
          label = notify.displayNameChat;
          label = label.replace(new RegExp(/[\{\}]+/, 'g'), '');
          label = label.replace(new RegExp(' ', 'g'), '_');
        }
      }
      // {author} invited {who} to join {where}
      return lang ? i18n.__(`activitystream.notification.${label}`, arrayReplace) : i18n.__(`activitystream.notification.${label}`, arrayReplace);
    }
    return label;
  }
  return undefined;
};

export const matchTags = (doc, tags) => {
  // const regex = /(?:^|\s)(?:#)([a-zA-Z\d]+)/gm;
  // const regex = /(?:^|\s)(?:#)([^\s!@#$%^&*()=+./,\[{\]};:'"?><]+)/gm;
  const regex = /(?:#)([^\s!@#$%^&*()=+./,\[{\]};:'"?><]+)/gm;

  const matches = [];
  let match;
  if (doc.shortDescription) {
    while ((match = regex.exec(doc.shortDescription))) {
      matches.push(match[1]);
    }
  }
  if (doc.description) {
    while ((match = regex.exec(doc.description))) {
      matches.push(match[1]);
    }
  }
  if (doc.tagsText) {
    while ((match = regex.exec(doc.tagsText))) {
      matches.push(match[1]);
    }
  }

  if (tags) {
    // const arrayTags = _.reject(tags, value => matches[value] === null, matches);
    const arrayTags = tags.filter(value => matches[value] !== null);
    if (doc.tags) {
      const a = new Set([...doc.tags, ...arrayTags, ...matches]);
      doc.tags = [...a];
      // doc.tags = _.uniq(_.union(doc.tags, arrayTags, matches));
    } else {
      const a = new Set([...arrayTags, ...matches]);
      doc.tags = [...a];
      // doc.tags = _.uniq(_.union(arrayTags, matches));
    }
  } else if (matches.length > 0) {
    if (doc.tags) {
      const a = new Set([...doc.tags, ...matches]);
      doc.tags = [...a];
      // doc.tags = _.uniq(_.union(doc.tags, matches));
    } else {
      const a = new Set(matches);
      doc.tags = [...a];
      // doc.tags = _.uniq(matches);
    }
  }
  return doc;
};
