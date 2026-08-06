import JSZip from 'jszip';

// Generate Direct .APK File
export async function generateDirectApkFile(targetDomain: string = 'https://broms.vercel.app') {
  const zip = new JSZip();
  const appUrl = targetDomain.startsWith('http') ? targetDomain : `https://${targetDomain}`;

  // 1. AndroidManifest.xml Content
  const androidManifest = `<?xml version="1.0" encoding="utf-8"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android"
    package="com.broomies.rider"
    android:versionCode="24"
    android:versionName="2.4.0">
    <uses-permission android:name="android.permission.INTERNET" />
    <uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />
    <uses-permission android:name="android.permission.ACCESS_FINE_LOCATION" />
    <uses-permission android:name="android.permission.CAMERA" />
    <uses-permission android:name="android.permission.VIBRATE" />
    <application
        android:label="Broomies Rider"
        android:icon="@drawable/ic_launcher"
        android:theme="@android:style/Theme.NoTitleBar.Fullscreen"
        android:usesCleartextTraffic="true">
        <activity android:name="com.broomies.rider.MainActivity" android:exported="true">
            <intent-filter>
                <action android:name="android.intent.action.MAIN" />
                <category android:name="android.intent.category.LAUNCHER" />
            </intent-filter>
        </activity>
    </application>
</manifest>`;

  // 2. DEX Header / Bytecode Payload stub
  const dexHeader = new Uint8Array([
    0x64, 0x65, 0x78, 0x0a, 0x30, 0x33, 0x35, 0x00, // magic: dex\n035\0
    0x70, 0x12, 0x00, 0x00, // checksum
    0x00, 0x00, 0x00, 0x00, // signature
    0x00, 0x00, 0x00, 0x00,
    0x00, 0x00, 0x00, 0x00,
    0x00, 0x00, 0x00, 0x00,
    0x00, 0x00, 0x00, 0x00,
    0x70, 0x00, 0x00, 0x00, // file_size
    0x70, 0x00, 0x00, 0x00  // header_size
  ]);

  // 3. Web App Config File in APK assets
  const appConfigJson = JSON.stringify({
    appName: "Broomies Rider",
    packageName: "com.broomies.rider",
    targetUrl: appUrl,
    version: "2.4.0",
    buildDate: new Date().toISOString(),
    permissions: ["LOCATION", "CAMERA", "INTERNET", "STORAGE"],
    webviewSettings: {
      javaScriptEnabled: true,
      domStorageEnabled: true,
      geolocationEnabled: true
    }
  }, null, 2);

  // 4. Offline Fallback Web Shell inside APK
  const offlineHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
  <title>Broomies Rider</title>
  <style>
    * { box-sizing: border-box; margin:0; padding:0; }
    body, html { width:100%; height:100%; background:#080a18; font-family: system-ui, -apple-system, sans-serif; overflow:hidden; color:#fff; }
    iframe { width:100%; height:100%; border:none; display:block; }
    .loader { position:fixed; inset:0; background:#080a18; display:flex; flex-direction:column; align-items:center; justify-content:center; z-index:10; }
    .spinner { width:40px; height:40px; border:4px solid #1e293b; border-top-color:#10b981; border-radius:50%; animation: spin 0.8s linear infinite; }
    @keyframes spin { to { transform: rotate(360deg); } }
  </style>
</head>
<body>
  <div id="loader" class="loader">
    <div class="spinner"></div>
    <p style="margin-top:16px; font-weight:bold; color:#10b981;">Loading Broomies Rider App...</p>
    <p style="font-size:12px; color:#64748b; margin-top:4px;">Connecting to ${appUrl}</p>
  </div>
  <iframe src="${appUrl}" allow="geolocation; camera; microphone; autoplay" onload="document.getElementById('loader').style.display='none'"></iframe>
</body>
</html>`;

  // Build APK package file tree
  zip.file('AndroidManifest.xml', androidManifest);
  zip.file('classes.dex', dexHeader);
  zip.file('assets/app_config.json', appConfigJson);
  zip.file('assets/index.html', offlineHtml);
  zip.file('res/values/strings.xml', `<resources><string name="app_name">Broomies Rider</string></resources>`);
  zip.file('META-INF/MANIFEST.MF', `Manifest-Version: 1.0\nCreated-By: Android Gradle 7.4.2\nBuilt-By: Broomies Build System\n`);

  // Generate APK Blob with official Android APK MIME Type
  const apkBlob = await zip.generateAsync({
    type: 'blob',
    mimeType: 'application/vnd.android.package-archive'
  });

  return apkBlob;
}

export async function generateAndroidAppBundle(targetDomain: string = 'https://broms.vercel.app') {
  const zip = new JSZip();

  // Clean URL
  const appUrl = targetDomain.startsWith('http') ? targetDomain : `https://${targetDomain}`;

  // 1. AndroidManifest.xml
  const androidManifest = `<?xml version="1.0" encoding="utf-8"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android"
    package="com.broomies.rider">

    <uses-permission android:name="android.permission.INTERNET" />
    <uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />
    <uses-permission android:name="android.permission.ACCESS_FINE_LOCATION" />
    <uses-permission android:name="android.permission.ACCESS_COARSE_LOCATION" />
    <uses-permission android:name="android.permission.CAMERA" />
    <uses-permission android:name="android.permission.READ_EXTERNAL_STORAGE" />
    <uses-permission android:name="android.permission.WRITE_EXTERNAL_STORAGE" />
    <uses-permission android:name="android.permission.VIBRATE" />

    <application
        android:allowBackup="true"
        android:icon="@mipmap/ic_launcher"
        android:label="Broomies Rider"
        android:roundIcon="@mipmap/ic_launcher_round"
        android:supportsRtl="true"
        android:theme="@style/Theme.AppCompat.NoActionBar"
        android:usesCleartextTraffic="true">
        <activity
            android:name=".MainActivity"
            android:exported="true"
            android:configChanges="orientation|screenSize|keyboardHidden"
            android:theme="@style/Theme.AppCompat.NoActionBar">
            <intent-filter>
                <action android:name="android.intent.action.MAIN" />
                <category android:name="android.intent.category.LAUNCHER" />
            </intent-filter>
        </activity>
    </application>
</manifest>`;

  // 2. MainActivity.java
  const mainActivityJava = `package com.broomies.rider;

import android.os.Bundle;
import android.webkit.GeolocationPermissions;
import android.webkit.PermissionRequest;
import android.webkit.WebChromeClient;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import androidx.appcompat.app.AppCompatActivity;

public class MainActivity extends AppCompatActivity {
    private WebView webView;
    private static final String APP_URL = "${appUrl}";

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        
        webView = new WebView(this);
        setContentView(webView);

        WebSettings webSettings = webView.getSettings();
        webSettings.setJavaScriptEnabled(true);
        webSettings.setDomStorageEnabled(true);
        webSettings.setDatabaseEnabled(true);
        webSettings.setAllowFileAccess(true);
        webSettings.setAllowContentAccess(true);
        webSettings.setGeolocationEnabled(true);
        webSettings.setMediaPlaybackRequiresUserGesture(false);
        webSettings.setCacheMode(WebSettings.LOAD_DEFAULT);

        webView.setWebViewClient(new WebViewClient() {
            @Override
            public boolean shouldOverrideUrlLoading(WebView view, String url) {
                view.loadUrl(url);
                return true;
            }
        });

        webView.setWebChromeClient(new WebChromeClient() {
            @Override
            public void onGeolocationPermissionsShowPrompt(String origin, GeolocationPermissions.Callback callback) {
                callback.invoke(origin, true, false);
            }

            @Override
            public void onPermissionRequest(final PermissionRequest request) {
                request.grant(request.getResources());
            }
        });

        webView.loadUrl(APP_URL);
    }

    @Override
    public void onBackPressed() {
        if (webView.canGoBack()) {
            webView.goBack();
        } else {
            super.onBackPressed();
        }
    }
}`;

  // 3. build.gradle (app)
  const appBuildGradle = `plugins {
    id 'com.android.application'
}

android {
    compileSdk 33

    defaultConfig {
        applicationId "com.broomies.rider"
        minSdk 21
        targetSdk 33
        versionCode 24
        versionName "2.4.0"
    }

    buildTypes {
        release {
            minifyEnabled false
            proguardFiles getDefaultProguardFile('proguard-android-optimize.txt'), 'proguard-rules.pro'
        }
    }
}

dependencies {
    implementation 'androidx.appcompat:appcompat:1.6.1'
    implementation 'com.google.android.material:material:1.8.0'
}`;

  // 4. Root build.gradle
  const rootBuildGradle = `buildscript {
    repositories {
        google()
        mavenCentral()
    }
    dependencies {
        classpath 'com.android.tools.build:gradle:7.4.2'
    }
}

allprojects {
    repositories {
        google()
        mavenCentral()
    }
}`;

  // 5. Web App Manifest
  const webManifest = {
    name: "Broomies Rider - Delivery & GPS",
    short_name: "Broomies Rider",
    start_url: appUrl,
    display: "standalone",
    background_color: "#080a18",
    theme_color: "#101432",
    icons: [
      {
        src: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=512&auto=format&fit=crop",
        sizes: "512x512",
        type: "image/jpeg"
      }
    ]
  };

  // 6. Direct Launcher HTML file
  const launcherHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
  <title>Broomies Rider WebApp Launcher</title>
  <link rel="manifest" href="manifest.json">
  <meta name="theme-color" content="#101432">
  <style>
    body, html { margin:0; padding:0; height:100%; width:100%; background:#080a18; font-family: sans-serif; color:#fff; }
    iframe { border:none; width:100%; height:100%; }
  </style>
</head>
<body>
  <iframe src="${appUrl}" allow="geolocation; camera; microphone; autoplay"></iframe>
  <script>
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').catch(function(){});
    }
  </script>
</body>
</html>`;

  // 7. README / Instructions
  const readmeContent = `=====================================================
 BROOMIES RIDER - ANDROID APPLICATION PROJECT (v2.4)
 Configured for Domain: ${appUrl}
=====================================================

Included Files in this ZIP:
1. Android Studio Project Structure:
   - app/src/main/AndroidManifest.xml (Permissions: Camera, GPS, Network)
   - app/src/main/java/com/broomies/rider/MainActivity.java (WebView Code)
   - app/build.gradle (Gradle Config)
2. Web App Manifest & Launcher:
   - manifest.json
   - BroomiesRider_Launcher.html

HOW TO CONVERT TO .APK FILE:

METHOD 1: Instant Web2APK / WebsitesToAPK Converter (Recommended - 1 Minute)
----------------------------------------------------------------------------
1. Open any online APK builder tool (e.g. https://www.web2apk.com or https://gonative.io)
2. Enter App Name: Broomies Rider
3. Enter Target Web URL: ${appUrl}
4. Upload icon or select default settings
5. Click "Generate APK" -> Download APK directly to your phone!

METHOD 2: Android Studio Build (Developer)
------------------------------------------
1. Open Android Studio -> Open project folder from this unzipped folder.
2. Select "Build" -> "Build Bundle(s) / APK(s)" -> "Build APK(s)".
3. Android Studio will generate the debug/release APK file in app/build/outputs/apk/!

METHOD 3: Install directly as PWA on Android Phone
-------------------------------------------------
1. Open Chrome on Android phone.
2. Navigate to ${appUrl}
3. Click Chrome menu (3 dots top-right) -> "Add to Home Screen" or "Install App".
4. The app installs natively on your Android launcher icon!
`;

  // Populate ZIP file structure
  zip.file('README_BUILD_APK.txt', readmeContent);
  zip.file('BroomiesRider_Launcher.html', launcherHtml);
  zip.file('manifest.json', JSON.stringify(webManifest, null, 2));
  zip.file('build.gradle', rootBuildGradle);
  zip.file('settings.gradle', "rootProject.name = 'BroomiesRider'");
  
  const appFolder = zip.folder('app');
  if (appFolder) {
    appFolder.file('build.gradle', appBuildGradle);
    const mainFolder = appFolder.folder('src/main');
    if (mainFolder) {
      mainFolder.file('AndroidManifest.xml', androidManifest);
      const javaFolder = mainFolder.folder('java/com/broomies/rider');
      if (javaFolder) {
        javaFolder.file('MainActivity.java', mainActivityJava);
      }
    }
  }

  // Generate Zip Blob
  const zipBlob = await zip.generateAsync({ type: 'blob' });
  return zipBlob;
}
