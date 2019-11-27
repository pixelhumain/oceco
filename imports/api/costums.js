import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';
import SimpleSchema from 'simpl-schema';
import { _ } from 'meteor/underscore';
import { moment } from 'meteor/momentjs:moment';
import { Router } from 'meteor/iron:router';
import { Tracker } from 'meteor/tracker';

// Costum
export const Costums = new Mongo.Collection('costum', { idGeneration: 'MONGO' });

/*
{
    "_id" : ObjectId("5ca1c938a0fab94a1a758ba1"),
    "slug" : "laRaffinerie",
    "welcomeTpl" : "costum.views.custom.laRaffinerie.home",
    "sourceKey" : true,
    "favicon" : "/ico/laRaffinerie/favicon.ico",
    "metaImg" : "/images/laRaffinerie/banner.jpg",
    "css" : {
        "font" : {
            "url" : "/font/laRaffinerie/cardenioModernBold.woff"
        },
        "loader" : {
            "background" : "white",
            "ring1" : {
                "color" : "#e94635",
                "height" : NumberLong(360),
                "width" : NumberLong(360),
                "left" : NumberLong(-15),
                "borderWidth" : NumberLong(4),
                "top" : NumberLong(-35)
            },
            "ring2" : {
                "color" : "#01809b",
                "height" : NumberLong(350),
                "width" : NumberLong(350),
                "left" : NumberLong(-10),
                "borderWidth" : NumberLong(5),
                "top" : NumberLong(-30)
            }
        },
        "progress" : {
            "value" : {
                "background" : "#5b2649"
            },
            "bar" : {
                "background" : "#fff"
            }
        },
        "menuTop" : {
            "background" : "white",
            "button" : {
                "paddingTop" : NumberLong(0),
                "fontSize" : NumberLong(30),
                "color" : "#5b2649"
            },
            "badge" : {
                "background" : "#5b2649",
                "border" : "1px solid white"
            },
            "connectBtn" : {
                "background" : "#5b2649",
                "color" : "white",
                "fontSize" : NumberLong(18),
                "borderRadius" : NumberLong(10),
                "padding" : "8px 15px"
            }
        },
        "button" : {
            "footer" : {
                "add" : {
                    "bottom" : NumberLong(25),
                    "background" : "transparent",
                    "color" : "white"
                },
                "toolbarAdds" : {
                    "bottom" : NumberLong(30)
                }
            }
        },
        "color" : {
            "purple" : "#5b2649"
        }
    },
    "htmlConstruct" : {
        "appRendering" : "horizontal",
        "header" : {
            "menuTop" : {
                "navLeft" : {
                    "logo" : {
                        "height" : NumberLong(70)
                    },
                    "searchBar" : true,
                    "useFilter" : {
                        "scopeFilter" : true,
                        "showFilter" : true
                    }
                },
                "navRight" : {
                    "connected" : {
                        "dropdownUser" : {
                            "languages" : true,
                            "statistics" : false,
                            "documentation" : false,
                            "donate" : false,
                            "admin" : true,
                            "settings" : false,
                            "logout" : true
                        },
                        "userProfil" : {
                            "img" : true
                        },
                        "networkFloop" : true,
                        "notifications" : true,
                        "dda" : false,
                        "chat" : true,
                        "home" : false,
                        "app" : false
                    },
                    "disconnected" : {
                        "languages" : true,
                        "login" : true
                    }
                }
            }
        },
        "menuBottom" : {
            "add" : false,
            "donate" : false
        },
        "adminPanel" : {
            "add" : true,
            "statistic" : true,
            "directory" : true,
            "reference" : true
        },
        "directoryViewMode" : "block",
        "directory" : {
            "header" : {
                "map" : false,
                "viewMode" : false,
                "add" : {
                    "proposals" : true
                }
            },
            "footer" : {
                "add" : {
                    "proposals" : true
                }
            }
        },
        "element" : {
            "initView" : "detail",
            "menuLeft" : {
                "detail" : true,
                "gallery" : true,
                "community" : true
            },
            "menuTop" : {
                "news" : true,
                "params" : {
                    "history" : true,
                    "slug" : true,
                    "delete" : true
                }
            }
        },
        "redirect" : {
            "logged" : "welcome",
            "unlogged" : "welcome"
        }
    },
    "app" : {
        "#home" : {
            "hash" : "#home",
            "icon" : "",
            "useHeader" : true,
            "useFilter" : true,
            "inMenu" : true,
            "open" : true,
            "subdomainName" : "Accueil",
            "placeholderMainSearch" : "Accueil"
        },
        "#apropos" : {
            "hash" : "#app.view",
            "icon" : "",
            "urlExtra" : "/page/apropos/url/costum.views.custom.views.laRaffinerie.apropos",
            "useHeader" : true,
            "useFilter" : false,
            "inMenu" : true,
            "open" : true,
            "subdomainName" : "A Propos",
            "placeholderMainSearch" : "A Propos"
        },
        "#plan" : {
            "hash" : "#app.view",
            "icon" : "",
            "urlExtra" : "/page/plan/url/costum.views.custom.views.laRaffinerie.plan",
            "useHeader" : true,
            "useFilter" : false,
            "inMenu" : true,
            "open" : true,
            "subdomainName" : "Plan d'accès",
            "placeholderMainSearch" : "Plan d'accès"
        },
        "#adherer" : {
            "hash" : "#app.view",
            "icon" : "",
            "urlExtern" : "http://bit.ly/Adhésion-Raffinerie-Costum",
            "target" : true,
            "useHeader" : true,
            "useFilter" : false,
            "inMenu" : true,
            "open" : true,
            "subdomainName" : "Adhérer",
            "placeholderMainSearch" : "Adhérer"
        }
    },
    "filters" : {
        "sourceKey" : true
    }
}
*/

Costums.helpers({
  isVisibleFields (field) {
    if (this.isMe()) {
      return true;
    }
    if (this.isPublicFields(field)) {
      return true;
    }
    if (this.isFollowersMe() && this.isPrivateFields(field)) {
      return true;
    }
    return false;
  },
});