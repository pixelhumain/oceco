/* eslint-disable no-undef */
App.info({
  id: 'org.communecter.oceco',
  name: 'oceco',
  description: 'oceco mobile',
  author: 'thomas',
  email: 'thomas.craipeau@gmail.com',
  version: '0.0.18',
  buildNumber: '138',
});

App.setPreference('android-targetSdkVersion', '29');
App.setPreference('android-minSdkVersion', '21');

// fix App Error connection to the server was unsuccessful.
// https://forum.ionicframework.com/t/app-error-and-cordova-deviceready-not-fired/50996/5
App.setPreference('LoadUrlTimeoutValue', '1000000', 'android');
App.setPreference('WebAppStartupTimeout', '1000000', 'android');
App.setPreference('WebAppStartupTimeout', 120000);

App.configurePlugin('phonegap-plugin-push', {
  SENDER_ID: 653253366584,
});

/* App.configurePlugin('cordova-plugin-customurlscheme', {
  URL_SCHEME: 'oceco',
}); */

/* App.configurePlugin('net.yoik.cordova.plugins.intentfilter', {
  URL_SCHEME: 'https',
  HOST_NAME: 'oce.co.tools',
}); */

// App.setPreference('onesignalappid', 'fa3e6afd-79f4-4217-a8b6-fb5921546a51');
// App.setPreference('universallink', 'https://oce.co.tools');

App.icons({
  android_mdpi: 'private/ressource/android/mipmap-mdpi/ic_launcher.png',
  android_hdpi: 'private/ressource/android/mipmap-hdpi/ic_launcher.png',
  android_xhdpi: 'private/ressource/android/mipmap-xhdpi/ic_launcher.png',
  android_xxhdpi: 'private/ressource/android/mipmap-xxhdpi/ic_launcher.png',
  android_xxxhdpi: 'private/ressource/android/mipmap-xxxhdpi/ic_launcher.png',
  app_store: 'private/ressource/appstore.png',
  ios_spotlight_3x: 'private/ressource/ios/AppIcon.appiconset/120.png',
  ios_notification_2x: 'private/ressource/ios/AppIcon.appiconset/40.png',
  ios_notification_3x: 'private/ressource/ios/AppIcon.appiconset/60.png',
  ipad_app_legacy: 'private/ressource/ios/AppIcon.appiconset/72.png',
  ipad_app_legacy_2x: 'private/ressource/ios/AppIcon.appiconset/144.png',
  ipad_spotlight_legacy: 'private/ressource/ios/AppIcon.appiconset/50.png',
  ipad_spotlight_legacy_2x: 'private/ressource/ios/AppIcon.appiconset/100.png',
  ios_notification: 'private/ressource/ios/AppIcon.appiconset/20.png',
  iphone_legacy: 'private/ressource/ios/AppIcon.appiconset/57.png',
  iphone_legacy_2x: 'private/ressource/ios/AppIcon.appiconset/114.png',
  iphone_2x: 'private/ressource/ios/AppIcon.appiconset/120.png',
  iphone_3x: 'private/ressource/ios/AppIcon.appiconset/180.png',
  ipad: 'private/ressource/ios/AppIcon.appiconset/76.png',
  ipad_2x: 'private/ressource/ios/AppIcon.appiconset/152.png',
  ipad_pro: 'private/ressource/ios/AppIcon.appiconset/167.png',
  ios_settings: 'private/ressource/ios/AppIcon.appiconset/29.png',
  ios_settings_2x: 'private/ressource/ios/AppIcon.appiconset/58.png',
  ios_settings_3x: 'private/ressource/ios/AppIcon.appiconset/87.png',
  ios_spotlight: 'private/ressource/ios/AppIcon.appiconset/40.png',
  ios_spotlight_2x: 'private/ressource/ios/AppIcon.appiconset/80.png',
});

App.launchScreens({
  android_mdpi_portrait: 'private/ressource/android/mipmap-mdpi/background.9.png',
  android_hdpi_portrait: 'private/ressource/android/mipmap-hdpi/background.9.png',
  android_xhdpi_portrait: 'private/ressource/android/mipmap-xhdpi/background.9.png',
  android_xxhdpi_portrait: 'private/ressource/android/mipmap-xxhdpi/background.9.png',
  android_xxxhdpi_portrait: 'private/ressource/android/mipmap-xxxhdpi/background.9.png',
  iphone_2x: 'private/ressource/ios/splash/Default@2x.png',
  iphone5: 'private/ressource/ios/splash/Default-568h@2x.png',
  iphone6: 'private/ressource/ios/splash/Default-667h@2x.png',
  iphone6p_portrait: 'private/ressource/ios/splash/Default-Portrait-736h@3x.png',
  iphone6p_landscape: 'private/ressource/ios/splash/Default-Landscape-736h@3x.png',
  ipad_portrait: 'private/ressource/ios/splash/Default-Portrait.png',
  ipad_portrait_2x: 'private/ressource/ios/splash/Default-Portrait@2x.png',
  ipad_landscape: 'private/ressource/ios/splash/Default-Landscape.png',
  iphoneX_portrait: 'private/ressource/ios/splash/Default-Portrait-1125h.png',
  ipad_landscape_2x: 'private/ressource/ios/splash/Default-Landscape@2x.png',
});

/* App.appendToConfig(`<platform name="android">
  <resource-file src="google-services.json" target="google-services.json" />
</platform>`); */

App.addResourceFile('google-services.json', 'app/google-services.json', 'android');
App.addResourceFile('GoogleService-Info.plist', 'GoogleService-Info.plist', 'ios');

App.setPreference('StatusBarOverlaysWebView', 'false');
App.setPreference('StatusBarBackgroundColor', '#324553');
App.setPreference('Orientation', 'portrait');

App.appendToConfig(`<platform name="ios">
    <config-file platform="ios" target="*-Info.plist" parent="NSPhotoLibraryUsageDescription">
      <string>Communecter requires your camera for taking pictures</string>
    </config-file>
    <config-file platform="ios" target="*-Info.plist" parent="NSCameraUsageDescription">
      <string>Communecter requires your camera for taking pictures</string>
    </config-file>
    <config-file platform="ios" target="*-Info.plist" parent="NSLocationUsageDescription">
      <string>Your current location is used to show services that are nearby</string>      
    </config-file>
    <config-file platform="ios" target="*-Info.plist" parent="NSLocationAlwaysUsageDescription">
      <string>Your current location is used to show services that are nearby</string>
    </config-file>
    <config-file platform="ios" target="*-Info.plist" parent="NSLocationWhenInUseUsageDescription">
      <string>Your current location is used to show services that are nearby</string>
    </config-file>
    <config-file target="*.entitlements" parent="aps-environment">
          <string>production</string>
        </config-file>
  </platform>
    <platform name="android">
    <preference name="android-targetSdkVersion" value="29" />
    <preference name="android-minSdkVersion" value="21" />
  </platform>
  <universal-links>
    <host name="oce.co.tools" scheme="https" />
  </universal-links>
  <edit-config file="app/src/main/AndroidManifest.xml" mode="merge" target="/manifest/application" xmlns:android="http://schemas.android.com/apk/res/android">
    <application android:usesCleartextTraffic="true"></application>
  </edit-config>`);

/* App.appendToConfig(`
  <platform name="ios">
    <splash src="${iosSplashScreensFolder}/Default@2x~universal~anyany.png" />
  </platform>
  <platform name="android">
    <preference name="android-targetSdkVersion" value="29" />
    <preference name="android-minSdkVersion" value="20" />
  </platform>
  <universal-links>
    <host name="https" scheme="oce.co.tools" />
  </universal-links>
  <edit-config file="app/src/main/AndroidManifest.xml" mode="merge" target="/manifest/application" xmlns:android="http://schemas.android.com/apk/res/android">
    <application android:usesCleartextTraffic="true"></application>
  </edit-config>
`); */


App.accessRule('*');
App.accessRule('http://*', { type: 'network' });
App.accessRule('https://*', { type: 'network' });
App.accessRule('http://*', { type: 'navigation' });
App.accessRule('https://*', { type: 'navigation' });
App.accessRule('http://qa.communecter.org/*', { type: 'navigation' });
App.accessRule('https://qa.communecter.org/*', { type: 'navigation' });
App.accessRule('http://qa.communecter.org/*', { type: 'network' });
App.accessRule('https://qa.communecter.org/*', { type: 'network' });
App.accessRule('http://www.communecter.org/*', { type: 'navigation' });
App.accessRule('https://www.communecter.org/*', { type: 'navigation' });
App.accessRule('https://oce.co.tools/*');
// App.accessRule('http://localhost*');
App.accessRule('*.openstreetmap.org/*', { type: 'navigation' });
App.accessRule('*.tile.thunderforest.com/*', { type: 'navigation' });
App.accessRule('http://a.tiles.mapbox.com/*', { type: 'navigation' });
App.accessRule('https://api.tiles.mapbox.com/*', { type: 'navigation' });
App.accessRule('http://*.tiles.mapbox.com/*', { type: 'network' });
App.accessRule('https://*.tiles.mapbox.com/*', { type: 'network' });
App.accessRule('http://*.tiles.mapbox.com/*', { type: 'navigation' });
App.accessRule('https://*.tiles.mapbox.com/*', { type: 'navigation' });
App.accessRule('https://api.mapbox.com/*', { type: 'navigation' });
App.accessRule('https://placeholdit.imgix.net/*', { type: 'navigation' });
App.accessRule('https://mapbox.com/*', { type: 'navigation' });
App.accessRule('https://www.mapbox.com/*', { type: 'navigation' });
App.accessRule('https://api.mapbox.com/*', { type: 'navigation' });

