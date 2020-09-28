# oceco

oceco fonctionne avec communecter et permet de publier des actions

# activer oceco sur une organisations
il faut une config minimum dans une entités "organizations" dans communecter pour activer oceco sur l'application

```json

```

## dev - commande pour lancer localement

* installer meteor 
* cloner le projet
* puis à la racine du projet

```shell
meteor npm install
```

### env

MONGO_URL - 
MONGO_OPLOG_URL - 

```shell
MONGO_URL='xxx' MONGO_OPLOG_URL='xxx UNIVERSE_I18N_LOCALES=all meteor run --settings settings.json --port 3000
```

## setting file

``` json
{
  "coenv": "prod",
  "environment": "production",
  "pushapiKey": "",
  "module": "co2",
  "endpoint": "",
  "mailgunpubkey": "",
  "rocketchat": {
    "host": "",
    "userId": "",
    "email": "",
    "password": "",
    "token": ""
  },
  "mailSetting": {
    "dev": {
      "to": "",
      "from": "",
      "protocol": "smtp",
      "username": "",
      "password": "",
      "host": "",
      "port": "2525"
    },
    "prod": {
      "from": "",
      "protocol": "smtps",
      "username": "",
      "password": "",
      "host": "",
      "port": "465"
    }
  },
  "ocecoApiToken": "",
  "public": {
    "native": {
      "appleItunesAppId": "",
      "appleTeamId": "",
      "appleBundleId": "",
      "googlePlayAppId": ""
    },
    "module": "co2",
    "mapbox": "",
    "googlekey": "",
    "endpoint": "",
    "urlimage": "",
    "remoteUrl": "",
    "assetPath": ""
  }
}
```