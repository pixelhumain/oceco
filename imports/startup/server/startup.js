import { Meteor } from 'meteor/meteor';
import { moment } from 'meteor/momentjs:moment';
import { Mongo } from 'meteor/mongo';
import i18n from 'meteor/universe:i18n';

i18n.setOptions({
  open: '__',
  close: '__',
  defaultLocale: 'en',
  sameLocaleOnServerConnection: true,
  // translationsHeaders: {'Cache-Control':'no-cache'},
});

Meteor.startup(function() {
/*
{
    "_id" : ObjectId("5b164edb40bb4e2851391f08"),
    "name" : "La Raffinerie",
    "tags" : [
        "ESS",
        "Recyclage",
        "culture",
        "Evenementiel",
        "Famille",
        "Association",
        "Tiers lieu",
        "Coworking",
        "Loisirs",
        "Fablab"
    ],+
    "shortDescription" : "Territoire collaboratif, écologique et solidaire / Economie Sociale et Solidaire",
    "preferences" : {
        "isOpenData" : "true",
        "isOpenEdition" : "true"
    },
    "modified" : ISODate("2019-08-31T06:22:36.000Z"),
    "updated" : NumberLong(1567232556),
    "creator" : "59cb7dc240bb4ecb25991b9f",
    "created" : NumberLong(1528189032),
    "slug" : "laRaffinerie",
    "badges" : [
        {
            "name" : "opendata",
            "date" : ISODate("2018-06-05T08:57:12.000Z")
        }
    ],
    "links" : {
        "contributors" : {
            "5b110eb240bb4e537efd1fcd" : {
                "type" : "organizations"
            },
            "59cb7dc240bb4ecb25991b9f" : {
                "type" : "citoyens",
                "isAdmin" : true
            },
            "59dda8d940bb4e18448afb8f" : {
                "type" : "citoyens",
                "isAdmin" : true
            },
            "565e6cb8dd0452f00f2e50bd" : {
                "type" : "citoyens",
                "isAdmin" : true
            },
            "5b20b63c40bb4ef955892d54" : {
                "type" : "organizations",
                "toBeValidated" : true
            },
            "5a13cf6b40bb4eb56490a9bc" : {
                "type" : "citoyens",
                "isAdmin" : true
            },
            "5afc1acb40bb4e773432b59b" : {
                "type" : "citoyens",
                "isAdmin" : true
            },
            "5beb29e740bb4ec707407ab0" : {
                "type" : "citoyens"
            },
            "5c624a5640bb4e5961d5ba89" : {
                "type" : "citoyens"
            },
            "5aaf801240bb4e6e50b9afc3" : {
                "type" : "citoyens"
            },
            "5be2618840bb4e5157ef6827" : {
                "type" : "citoyens",
                "isAdmin" : true
            },
            "5b11681240bb4ebf0cfd1fd2" : {
                "type" : "citoyens"
            }
        },
        "projects" : {
            "5b1f74e840bb4e1924892d54" : {
                "type" : "projects"
            },
            "5b87e6fa40bb4e9b3f835aa2" : {
                "type" : "projects"
            },
            "5bd2b49e40bb4e3407f7eac6" : {
                "type" : "projects"
            },
            "5c2e3d7940bb4e200487fdce" : {
                "type" : "projects"
            },
            "5be5d3f340bb4e3848ef67f3" : {
                "type" : "projects"
            },
            "5c5862af40bb4e301f69a81b" : {
                "type" : "projects"
            },
            "5b22130840bb4ea806892d54" : {
                "type" : "projects"
            },
            "5ce929d040bb4eed2325ef2d" : {
                "type" : "projects"
            },
            "5d6a121040bb4ed34abe0e61" : {
                "type" : "projects"
            }
        },
        "followers" : {
            "57e5256640bb4eff07c4c9d6" : {
                "type" : "citoyens"
            },
            "5b1ff6f140bb4e603d892d64" : {
                "type" : "citoyens"
            },
            "596dd45e40bb4e04307b23d9" : {
                "type" : "citoyens"
            },
            "5bed2bb940bb4e9156407aa0" : {
                "type" : "citoyens"
            },
            "5c011e5140bb4ee02c6ea81d" : {
                "type" : "citoyens"
            },
            "5c0e73d340bb4e5c3062fa64" : {
                "type" : "citoyens"
            },
            "5c0e95d740bb4e9b3562fa6d" : {
                "type" : "citoyens"
            },
            "55dc893ae41d752965848363" : {
                "type" : "citoyens"
            },
            "5c17d27240bb4e153e2ac363" : {
                "type" : "citoyens"
            },
            "5beb29e740bb4ec707407aa8" : {
                "type" : "citoyens"
            },
            "5c1f9c4f40bb4eb10aa5ad3c" : {
                "type" : "citoyens"
            },
            "5c23250240bb4e8f7ba5ad44" : {
                "type" : "citoyens"
            },
            "5bf3a80b40bb4e1b3e604ba1" : {
                "type" : "citoyens"
            },
            "5c4752ed40bb4e0c04123aef" : {
                "type" : "citoyens"
            },
            "578f504e40bb4ed97bffbdbd" : {
                "type" : "citoyens"
            },
            "5c4f5a8640bb4e0f08c7c53f" : {
                "type" : "citoyens"
            },
            "5bfb911140bb4e9c03604ba4" : {
                "type" : "citoyens"
            },
            "5cea35cf40bb4eaf4e46ba5c" : {
                "type" : "citoyens"
            }
        },
        "events" : {
            "5cb3702140bb4e975ccd7c96" : {
                "type" : "events"
            },
            "5ce9290540bb4ee62325ef26" : {
                "type" : "events"
            }
        }
    },
    "description" : "La Raffinerie c’est quoi ?\r\n \r\nLa Raffinerie est un projet de développement d’une friche éco-culturelle au coeur du quartier prioritaire de Savanna à Saint Paul de la Réunion, groupement d’espaces autonomes et interdépendants, ce projet se positionne comme un vrai levier de promotion du territoire et d’émergence d’activité à l’échelle locale et régionale.\r\n \r\nÉconomie circulaire, économie sociale et solidaire, culture, développement durable, transition écologique et biodiversité sont les mots d'ordre déclinés à travers des actions et des activités organisées autour de plusieurs espaces et thématiques. La Raffinerie offrira les informations, les formations, les activités et les outils pour pouvoir être acteur de l’amélioration de notre quotidien tout en répondant au mieux aux enjeux environnementaux d’aujourd’hui et de demain :\r\nAteliers collaboratifs sous formes de containers hébergeant les premières activités de La Raffinerie durant la réfection des bâtiments. Ces ateliers comprendront la micro-recyclerie, les premières machines du FabLab et les ateliers d’éditions. \r\nLes  ateliers mutualisés : des espaces recyclerie (vélo, D3E, papier), un fablab en éco-conception et de la vente de matériaux de récupération issus du démantèlement d'objets en fin de vie. Ces ateliers fonctionneront principalement avec des matériaux de récupération et respecteront les principes de l’économie circulaire.\r\nDes espaces artistiques avec une salle d'exposition, un “MUR” (espace d’exposition éphémère pour street-artiste),  un atelier d’édition, un atelier dédié à des résidences d'artistes et un plateau extérieur pour le cinéma en plein air, les arts vivants et la musique seront autant de moyens d’expression pour les artistes et créateurs locaux.\r\nDes espaces de ventes avec une librairie spécialisée et la boutique de la recyclerie seront les relais de tous les ateliers de productions.\r\nUn espace de restauration légère,  un café et une micro-brasserie seront autant de lieu de rencontres et d’échange et participeront à la viabilité économique du lieu.\r\nun plateau sportif : escalade, skate, jeux de boules - Ces espaces seront gérés par différentes associations et auront plusieurs façons de fonctionner soit sous forme libre, accompagnée ou lors de stage / formations.\r\nLe co-working dédié aux micro-entrepreneurs de l’économie circulaire, l’Economie Sociale et Solidaire (ESS), la culture et le développement durable. Le co-working aura un fonctionnement mixte entre des travailleurs permanents, travailleurs nomades et personnels administratifs de la Raffinerie. Un espace extérieur sera dédié à la détente, au repas et au repos.\r\nUne micro exploitation urbaine, un espace de production et de formation: Les objectifs de ces espaces sont multiples : la production de fruits et de légumes pour le restaurant, un lieu de formation (ACI: un Atelier Chantier d’Insertion et de particuliers), ainsi qu’un espace pédagogique et de médiation  pour les écoles. Ce jardin sera également praticable pour les personnes à mobilité réduite et réalisé sur les principe de la permaculture.\r\nDes espaces collaboratifs avec une épicerie en vrac, une amapéi et une amac (le panier culturel, association pour le maintien d’actions culturelles) - Ces espaces seront concentrés sur un même lieu à l'extérieur sous forme de bâtiments / container autonomes en énergie et avec un assainissement écologique. Le principe de partage sera de mise et un engagement de bénévolat de 3H par mois par adhérent sera mis en place.\r\nUn espace événementiel sera dédié à l'organisation de salons, manifestations, conférences ou expositions. La surface sera modulable grâce à des cloisons mobiles pour s'adapter au mieux aux demandes et tous les équipements nécessaires seront disponibles : éclairage, mobilier, vidéoprojecteur, …\r\ndes activités de quartier qui sont autant de lien entre le territoire et La Raffinerie, avec entre autre un laboratoire de transformation alimentaire / miellerie, des jardins partagés, une salle de formation en plein air, des logements pour l'éco-tourisme, ou un rucher pédagogique.",
    "geo" : {
        "@type" : "GeoCoordinates",
        "latitude" : "-20.988257580749575",
        "longitude" : "55.29915690422058"
    },
    "geoPosition" : {
        "type" : "Point",
        "coordinates" : [
            55.2991569042206,
            -20.9882575807496
        ]
    },
    "address" : {
        "@type" : "PostalAddress",
        "codeInsee" : "undefined",
        "addressCountry" : "RE",
        "postalCode" : "97460",
        "addressLocality" : "ST PAUL",
        "streetAddress" : "Rue Thirel",
        "localityId" : "54c0965cf6b95c141800a518",
        "level1" : "58be4af494ef47df1d0ddbcc",
        "level1Name" : "Réunion",
        "level3" : "58be4af494ef47df1d0ddbcc",
        "level3Name" : "Réunion",
        "level4" : "58be4af494ef47df1d0ddbcc",
        "level4Name" : "Réunion"
    },
    "collectionCount" : NumberLong(7),
    "hasRC" : true,
    "tools" : {
        "chat" : {
            "int" : [
                {
                    "name" : "laRaffinerie",
                    "url" : "/channel/laRaffinerie"
                }
            ]
        }
    },
    "properties" : {
        "chart" : {
            "open" : {
                "gouvernance" : {
                    "description" : "Un projet d'association et de coopérative est en cours",
                    "value" : "100"
                },
                "partage" : {
                    "description" : "Ce projet est basé sur le commun dans les domaine de l'environnement, du sport, de la culture et de l'ESS",
                    "value" : "100"
                },
                "solidaire" : {
                    "description" : "",
                    "value" : "100"
                },
                "local" : {
                    "description" : "impact positif sur le quartier, la commune et la Réunion",
                    "value" : "100"
                }
            }
        }
    },
    "contacts" : [
        {
            "name" : "Gaillot Julien",
            "email" : "contact@laraffinerie.re",
            "role" : "coordonateur du projet",
            "key" : "person",
            "collection" : "contact",
            "id" : "5b164edb40bb4e2851391f08",
            "telephone" : [
                "06 92 59 69 27"
            ]
        },
        {
            "name" : "La Raffinerie",
            "email" : "contact@laraffinerie.re",
            "key" : "person",
            "collection" : "contact"
        }
    ],
    "email" : "contact@laraffinerie.re",
    "url" : "http://laraffinerie.re/",
    "parent" : {
        "5b110eb240bb4e537efd1fcd" : {
            "type" : "organizations"
        }
    },
    "profilBannerUrl" : "/upload/communecter/projects/5b164edb40bb4e2851391f08/banner/resized/banner.png?t=1555479108",
    "profilRealBannerUrl" : "/upload/communecter/projects/5b164edb40bb4e2851391f08/banner/1555479108_P1540099.jpg",
    "profilImageUrl" : "/upload/communecter/projects/5b164edb40bb4e2851391f08/logo-raffinerie.jpg",
    "profilThumbImageUrl" : "/upload/communecter/projects/5b164edb40bb4e2851391f08/thumb/profil-resized.png?t=1555479046",
    "profilMarkerImageUrl" : "/upload/communecter/projects/5b164edb40bb4e2851391f08/thumb/profil-marker.png",
    "profilMediumImageUrl" : "/upload/communecter/projects/5b164edb40bb4e2851391f08/medium/logo-raffinerie.jpg",
    "costum" : {
        "slug" : "laRaffinerie"
    }
}
  */


});
