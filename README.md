[![Travis](http://img.shields.io/travis/D-Mobilelab/StargateJsApps.svg?branch=master&style=flat)](https://travis-ci.org/D-Mobilelab/StargateJsApps)

[![Coverage Status](https://coveralls.io/repos/D-Mobilelab/StargateJsApps/badge.svg?branch=master&service=github)](https://coveralls.io/github/D-Mobilelab/StargateJsApps?branch=master)



# StargateJsApps

[![Join the chat at https://gitter.im/D-Mobilelab/StargateJsApps](https://badges.gitter.im/D-Mobilelab/StargateJsApps.svg)](https://gitter.im/D-Mobilelab/StargateJsApps?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)

StargateJS hybridization library for HTML5 apps

# Introduction

StargateJsApps is an hybridization library for hosted apps built around ManifoldJS approach to hybrid application.

Hosted apps are hybrid application that have their files served remotely by a web server and that are described by a manifest (W3C specification)

[ManifoldJS](https://github.com/D-Mobilelab/OfflineHostedWebApp) is Cordova plugin developed by Microsoft that inject all Cordova dependency after the page is loaded, decoupling the native platform implementation with the web app.

StargateJsApps take advantage of the manifest to store it's configuration, like features to enable or remote api information.

[Technical Documentation Game Module](http://d-mobilelab.github.io/StargateJsApps/gh-pages/0.4.5/module-src_modules_Game.html)

# Installation

### manual
use stargate.js or stargate.min.js in dist/ folder

### bower

Install stargate bower package and save to dependencies (not dev dependencies):


    $ bower install -S stargatejs-apps


# API Reference

### Method types
#### S
**Static**
You can call static methods independently from initialization of Stargate

#### O
**Require opened stargate**
You can call this type of methods only after Stargate is initialized and open: when Stargate is inside hybrid app and it had already fulfilled the initialization promise.

#### B
**Before initialize**
You should call this type of methods before initialization of Stargate: they usually set some callback or status needed inside initialization.

#### P
**Return promise**
This type of methods return a promise that is fulfilled when operation is succeeded.

#### C
**Use callbacks**
This type of methods use also or only callbacks for returning success or failure.




## Stargate.isHybrid()
    
[[**Static**](#s)] get hybrid container status: true when we're running inside the hybrid app

> Internally it check if there is an url query parameter called "hybrid" with value 1, or if there is a cookie or a localStorage with the same name and value. 


Return boolean

## Stargate.getVersion()

[[**Static**](#s)] return current Stargate version

## Stargate.isInitialized() 
[[**Static**](#s)] get initialization status: true when initialization is already called

Return boolean

## Stargate.isOpen()
    
[[**Static**](#s)] get initialization status: true when initialization is done

Return boolean

## Stargate.setAnalyticsCallback(callBackFunction)

[[**Before initialize**](#b)] Set the callback to call when an analytic event need to be sent.

Please call this before [Stargate.initialize](#stargateinitializeconfigurations-callback), so it can track events logged on initialize too, like MFP.

## Stargate.setConversionDataCallback(callBackFunction)

[[**Before initialize**](#b)] Set the callback to call when converion data from AppsFlyer are received.
You may need to save the data you receive, becouse you'll only got that data the first time the app is run after installation.

Please call this before [Stargate.initialize](#stargateinitializeconfigurations-callback), so it can call you during initialize too.

## Stargate.initialize(configurations, callback)
    
[[**Use callbacks**](#c),[**Return promise**](#p)] Initialization of Stargate, you have to pass a configuration object and a callback that will be called when initialization has been finished.

Return a promise fulfilled when initialization has been finished.

If initialize has already been called then it will log a warning and will just execute the callback and return a promise that will be immediately fulfilled.

If initialize is called when we are outside hybrid environment (see [Stargate.isHybrid](#stargateishybrid)) then it will just execute the callback and return a promise that will be immediately fulfilled.

The callback is called with a boolean result indicating if we are inside hybrid environment or not (see [Stargate.isHybrid](#stargateishybrid)). Also the promise is fullfilled with the same boolean result.

### Configurations parameter

It's a javascript object with configurations.

Option|Type|Description|Default
--- | --- | --- | ---
*modules* | Array of string | List of modules to initialize | `["mfp","iapbase","appsflyer","game"]`
*modules_conf* | Object | Configuration of submodule| `{}`

#### modules configuration list

Value|Description
--- | --- 
*iap* | InApp purchase module
*iaplight* | InApp purchase module based on [AlexDisler/cordova-plugin-inapppurchase](https://github.com/AlexDisler/cordova-plugin-inapppurchase)
*mfp* | Mobile Fingerprint purchase module
*appsflyer* | AppsFlyer module
*game* | Offline game module

#### modules_conf configuration object

Option|Description|Default
--- | --- | ---
*iap* | InApp purchase configuration object | `undefined`
*iaplight* | InApp purchase iaplight configuration object | `undefined`
*mfp* | Mobile Fingerprint configuration object | `undefined`
*appsflyer* | AppsFlyer configuration object | `undefined`

#### modules_conf mfp configuration configuration object

Option|Description|Default|Example
--- | --- | --- | ---
*country* | Country to use for mfp | `undefined` | "`it`"

There are two more variable needed for Mobile FingerPrint to work and these variable are retrieved from the manifest.json inside the app:

Value|Description
--- | --- 
*namespace* | namespace
*label* | label

#### modules_conf AppsFlyer configuration configuration object

Option|Description|Default|Example
--- | --- | --- | ---
*autologin* | (boolean) enable autologin with pony value | `undefined` | `"true"`
*fieldPony* | field where to look for the pony value | `"af_sub1"` | `"af_sub2"`
*fieldReturnUrl* | field where to look for the return url value | `undefined` | `"af_sub5"`

The AppsFlyer module permit to autologin an user coming from the Webapp, when you pass from the Webapp to AppsFlyer the token of the user in the field which value is in fieldPony.

It also permit to go to a specific url (for example the url of the content where the user choosed to install the app) after it's logged in. This is done with the fieldReturnUrl value passed to the autologin url (api.mfpSetUriTemplate value in manifest.json).       

There are two more variable needed for AppsFlyer to work and these variable are retrieved from the manifest.json inside the app:

Value|Description
--- | --- 
*appstore_appid* | iOS App id
*appsflyer_devkey* | devkey got from appsflyer

#### modules_conf iap configuration configuration object

Option|Description|Example
--- | --- | ---
*id* | Product id as registred on store | `"stargate.test.spec.subscription"`
*alias* | Product alias | `"Stargate Test Subscription"`
*type* | Type of product; it can be: FREE_SUBSCRIPTION, PAID_SUBSCRIPTION, CONSUMABLE, NON_CONSUMABLE | `"PAID_SUBSCRIPTION"`

#### modules_conf iap light configuration configuration object

Option|Description|Example
--- | --- | ---
*productsIdAndroid* | Array of Product id as registered on Google Store | `["stargate.test.spec.subscription1","stargate.test.spec.subscription2"]`
*productsIdIos* | Array of Product id as registered on Apple Store | `["stargate.test.spec.ios.subscription1","stargate.test.specios..subscription2"]`



### Example Usage
```javascript

var configurations = {
    modules: ["mfp", "appsflyer", "iaplight", "game"],
    modules_conf: {
        "iaplight": {
            "productsIdAndroid": ["com.mycompany.myapp.weekly.v1","com.mycompany.myapp.montly.v1"],
            "productsIdIos": ["com.mycompany.myapp.weekly.v1","com.mycompany.myapp.montly.v1"]
        },
        "mfp": {
            "country": "us"
        }
    }
};

var callback = function(result) {
    console.log("Stargate initialized with result: "+result);
};

// you can use the callback ...
Stargate.initialize(configurations, callback);

// ... or the promise interface
Stargate.initialize(configurations, function(){})
    .then(function(result) {
        console.log("Stargate initialized with result: "+result);
    })
    .fail(
    function(error) {
        console.error("Stargate initialization error: ", error);
    });

```


## Stargate.openUrl(url)

[[**Require opened stargate**](#o)] Open external url with InApp Browser


## Stargate.checkConnection([callbackSuccess=function(){}], [callbackError=function(){}])
### Example Usage
```javascript
var info = Stargate.checkConnection();
Stargate.checkConnection(function(info){ console.log(info.networkState, info.type); });
// info is equal to: {'networkState': "wifi|3g|4g|none", type:"online|offline"}
```
[[**Require opened stargate**](#o),[**Use callbacks**](#c)] The connection info object is updated to the last connection status change 
the networkState is retrieved from navigator.connection.type of cordova-plugin-network-information plugin

## Stargate.getDeviceID(callbackSuccess, callbackError)
    
[[**Require opened stargate**](#o),[**Use callbacks**](#c)] Call callbackSuccess with an object with the device id like this:
{'deviceID': deviceID}
deviceID got from uuid of device plugin

## Stargate.setStatusbarVisibility(visibility, callbackSuccess, callbackError)

[[**Require opened stargate**](#o),[**Use callbacks**](#c)] Show/hide device status bar

Parameter boolean visibility

## Stargate.facebookLogin(scope, callbackSuccess, callbackError)

[[**Require opened stargate**](#o),[**Use callbacks**](#c)] Facebook connect

Parameter string scope: scope list separeted with comma

## Stargate.socialShare(options)

[[**Require opened stargate**](#o),[**Return promise**](#p)] Share an url on a social network

### Parameters

#### options object

Options key|Description|Example
--- | --- | ---
*type* | String: social network to use (chooser, facebook, twitter, whatsapp) | chooser
*url* | String: url to share | "http://www.google.com/?utm_source=stargate"

### Returns

Promise fullfilled when sharing is done

## Stargate.socialShareAvailable(options)

[[**Require opened stargate**](#o),[**Return promise**](#p)] Return a list of social networks application installed on user device

### Parameters

#### options object

Options key|Description|Example
--- | --- | ---
*socials* | Object with socials to check if available (facebook, twitter, whatsapp) | {"facebook": true, "twitter": true, "instagram": false }
*url* | String: url to share | "http://www.google.com/?utm_source=stargate"

### Returns

Promise fullfilled with an object with social networks availablility from the ones requested with parameter "option.socials"
For example:
```javascript
    {
        "facebook": true,
        "twitter": true,
        "instagram": false
    }
```

## Stargate.iaplight.getProductInfo(productId)

[[**Require opened stargate**](#o),[**Return promise**](#p)] Return an object with In App Product information got from store on module initialization

### Parameters

#### productId

iap product id by which information will be returned

### Returns

Promise fullfilled with an object with iap product information:

- productId - SKU / product bundle id (such as 'com.yourapp.prod1')
- title - short localized title
- description - long localized description
- price - localized price

For example:
```javascript
    {
        "productId": "com.mycompany.myproduct.weekly.v1",
        "title": "Abbonamento Premium MioProdotto",
        "description": "Abonamento premium al MioProdotto",
        "price": "€0,99"
    }
```


## Stargate.iaplight.subscribe(productId)

[[**Require opened stargate**](#o),[**Return promise**](#p)] Request subscription of In App Product on store

### Parameters

#### productId

iap product id to subscribe to

### Returns

Promise fullfilled with an object with the following keys:

- transactionId - The transaction/order id
- productId - productId purchased
- purchaseDate - purchase ISO date string format
- purchaseTime - purchase Timestamp

For example:
```javascript
    {
        "productId": "com.mycompany.myproduct.weekly.v1",
        "purchaseDate": "2017-04-18T09:19:41.000Z",
        "purchaseTime": "1492507181",
        "transactionId": "123412341234"
    }
```


## Stargate.iaplight.subscribeReceipt(productId)

[[**Require opened stargate**](#o),[**Return promise**](#p)] Request subscription of In App Product on store

### Parameters

#### productId

iap product id to subscribe to

### Returns

If successful, the promise resolves to an object with the following attributes that you will need for the receipt validation:

- transactionId - The transaction/order id
- receipt - On iOS it will be the base64 string of the receipt, on Android it will be a string of a json with all the transaction details required for validation such as {"orderId":"...","packageName:"...","productId":"...","purchaseTime":"...", "purchaseState":"...","purchaseToken":"..."}
- signature - On Android it can be used to consume a purchase. On iOS it will be an empty string.
- productType - On Android it can be used to consume a purchase. On iOS it will be an empty string.

Receipt validation: - To validate your receipt, you will need the receipt and signature on Android and the receipt and transactionId on iOS.

For example:
```javascript

var ResultAndroid = {
    "signature":"base64encodedstring",
    "productId":"product.id",
    "transactionId":"fvjpwjfoviwjeovijwepvin",
    "type":"subs",
    "productType":"subs",
    "receipt":"{\"packageName\":\"com.mycompany.myproduct\", \"productId\":\"product.id\", \"purchaseTime\":1510670063, \"purchaseState\":0, \"purchaseToken\":\"4rbQnUwZHb_wwZ\", \"autoRenewing\":true }"
};

var ResultIos = {
    "transactionId": "1000000221696692",
    "receipt": "base64encodedstring"
};

```


## Stargate.iaplight.restore()

[[**Require opened stargate**](#o),[**Return promise**](#p)] Request restore of In App Products already purchased on store

### Returns

If successful, the promise resolves to:

- *false* if no valid subscription restored
- *{id: {...}}* map of productId with valid subscription restored

For example:
```javascript
    false
```

## Stargate.iaplight.getActiveSubscriptionsInfo()

[[**Require opened stargate**](#o),[**Return promise**](#p)] Request list of In App Products with an active subscription

### Returns

If successful, the promise resolves to:

- *{id: {...}}* map of productId with active subscription

For example on Android:
```javascript
    {
        "com.mycompany.myproduct.weekly.v1": {
            "packageName": "com.mycompany.myproduct","productId": "com.mycompany.myproduct.weekly.v1",
            "purchaseTime": 1491209382421,
            "purchaseState": 0,
            "purchaseToken": "nknmjmadpdhibpnaeibbxxxx",
            "autoRenewing": true
        }
    }

```


## Stargate.iaplight.isSubscribed(productId)

[[**Require opened stargate**](#o),[**Return promise**](#p)] Return a promise returning a boolean that represent the subscription validity status. On iOS it execute the local decode of iOS receipt. On Android it perform a restore, than it check if there is the product requested and if it's valid.

### Parameters

#### productId

iap product id subscribed to

### Returns

Promise fullfilled with a Boolean that is the validity of the subscription of the requested productId

Usage example:
```javascript
    Stargate.iaplight.isSubscribed("com.mycompany.myproduct")
    .then(function(subsciptionStatus){
        console.log("Stargate.iaplight.isSubscribed",subsciptionStatus);
        if ( subsciptionStatus ) {
            console.log("SuscriptionOK")
        } else {
            console.warn("SubscriptionKO, request to pay!")
        }
    }).catch(function(err){
                console.error( "Stargate.iaplight.isSubscribedERROR", err);
    })
```

## Stargate.iaplight Errors Code

android error codes:
```java
  public static final int INVALID_ARGUMENTS = -1;
  public static final int UNABLE_TO_INITIALIZE = -2;
  public static final int BILLING_NOT_INITIALIZED = -3;
  public static final int UNKNOWN_ERROR = -4;
  public static final int USER_CANCELLED = -5;
  public static final int BAD_RESPONSE_FROM_SERVER = -6;
  public static final int VERIFICATION_FAILED = -7;
  public static final int ITEM_UNAVAILABLE = -8;
  public static final int ITEM_ALREADY_OWNED = -9;
  public static final int ITEM_NOT_OWNED = -10;
  public static final int CONSUME_FAILED = -11;
```

iOS error codes:
```objectivec
    NSInteger const RMStoreErrorCodeDownloadCanceled = 300;
    NSInteger const RMStoreErrorCodeUnknownProductIdentifier = 100;
    NSInteger const RMStoreErrorCodeUnableToCompleteVerification = 200;
```

common error codes:
```javascript
  101: 'invalid argument - productIds must be an array of strings',
  102: 'invalid argument - productId must be a string',
  103: 'invalid argument - product type must be a string',
  104: 'invalid argument - receipt must be a string of a json',
  105: 'invalid argument - signature must be a string',
```

Errors arrive as objects like this:
```javascript
    {
        errorCode: xxx,
        code: xxx,
    }
```


## Stargate.push.setScheduledNotify(parameters)

[[**Require opened stargate**](#o),[**Return promise**](#p)] Request an auto push (local notification) on a specific date

### Parameters

#### options object

Options key|Description|Example
--- | --- | ---
*title* | [required] String title of notification | Stargate
*text* | [required] String text of notification | Check out this cool library for hybrid apps!
*date* | [required] Date when the notification will show up | new Date(new Date() + 5*1000)
*deeplink* | [required] String url of a specific webapp page | "http://www.stargate.com/#!/route/to/mypushedcontent"

### Returns

Promise fullfilled with boolean result status


## Stargate.facebookShare(url, callbackSuccess, callbackError)

@deprecated since 0.5.0

[[**Require opened stargate**](#o),[**Use callbacks**](#c)] Facebook sharing

Parameter string url: shared url

## Stargate.inAppPurchaseSubscription(callbackSuccess, callbackError, subscriptionUrl, returnUrl)

[[**Require opened stargate**](#o),[**Use callbacks**](#c)] IAP subscription
    
    

## Stargate.inAppRestore(callbackSuccess, callbackError, subscriptionUrl, returnUrl)

[[**Require opened stargate**](#o),[**Use callbacks**](#c)] IAP restore

## Stargate.inAppProductInfo(productId, callbackSuccess, callbackError)

[[**Require opened stargate**](#o),[**Use callbacks**](#c)] IAP product information

Call callbacks with information about a product got from store

productId - product id about to query for information on store

callbackSuccess - a function that will be called when information are ready

callbackError - a function that will be called in case of error


```javascript
// example of object sent to success callback
{
    "id": "stargate.test.spec.product1",
    "alias": "Test Spec Product 1",
    "title": "Test Spec Product 1",
    "description": "Test Spec Product 1",
    "currency": "EUR",
    "price": "0,99 €",
    "type": "paid subscription",
    "canPurchase": true,
    "downloaded": false,
    "downloading": false,
    "loaded": true,
    "owned": false,
    "state": "valid",
    "transaction": null,
    "valid": true
}
```


## Stargate.getAppInformation()

[[**Require opened stargate**](#o)] return {object} with this information:

Value|Description
--- | --- 
*cordova* | Cordova version
*manufacturer* | device manufacter
*model* | device model
*platform* | platform (Android, iOs, etc)
*deviceId* | device UUID
*version* | platform version
*packageVersion* | package version
*packageName* | package name ie: com.stargatejs.test
*packageBuild* | package build number
*stargate* | stargate version
*stargateModules* | modules initialized
*stargateError* | initialization error

## Stargate.getAvailableFeatures()

[[**Require opened stargate**](#o)] return {array} with list of features available in native, defined in manifest.json inside the package

# Internal design

## stargate configuration
Inside manifest there is an object that holds all configuration options of Stargate. This configuration is loaded with ManifoldJS hostedwebapp plugin.

## initialization and device ready
1. Stargate.initialize() save user configuration sent as parameter and attach to the cordova deviceready event the internal function onDeviceReady()
2. onDeviceReady() request all needed data from plugin and internal async modules; wait for all request to complete, save the data received and call onPluginReady()
3. onPluginReady() is the main internal initialization function where all syncronous processing is performed

## gulp tasks

* build (default task)
* lint
* test
* karma (--browsers=[PhantomJS]|Chrome)
* watch

## release process

1. github PR your feature branch to develop
2. github PR develop to master
3. git checkout master
4. git pull
5. npm version (minor|patch)
6. git push
7. git push --tags

==to automate==

## travis-ci

Travis build the project on every push and check for lint and test errors. It also send the test coverage to coveralls.io

## cordova plugin
All public api of Stargate requires some cordova plugins to be available in the app.
This is a list of the plugin used by the various function of Stargate:

Functionality|Cordova plugin required
--- | --- 
*initialize* | [ManifoldJS D-Mobilelab fork](https://github.com/D-Mobilelab/OfflineHostedWebApp)
*initialize* | [cordova-plugin-app-version](https://www.npmjs.com/package/cordova-plugin-appversion)
*initialize* | [cordova-plugin-device](https://www.npmjs.com/package/cordova-plugin-device)
*initialize* | [cordova-plugin-splashscreen](https://www.npmjs.com/package/cordova-plugin-splashscreen)
*update offline files* | [cordova-plugin-code-push](https://www.npmjs.com/package/cordova-plugin-code-push)
*iaplight* | [AlexDisler/cordova-plugin-inapppurchase](https://github.com/AlexDisler/cordova-plugin-inapppurchase)
*iap* | [j3k0/cordova-plugin-purchase](https://github.com/j3k0/cordova-plugin-purchase)
*socialShare* | [EddyVerbruggen/SocialSharing-PhoneGap-Plugin](https://github.com/EddyVerbruggen/SocialSharing-PhoneGap-Plugin.git)
*appsflyer* | [cordova-plugin-appsflyer](https://github.com/AppsFlyerSDK/cordova-plugin-appsflyer-sdk)
*push* | [katzer/cordova-plugin-local-notifications](https://github.com/katzer/cordova-plugin-local-notifications)

## offline and app launch
We have an html page on www folder of cordova project that check if there is network connectivity and if so go to the webapp, where HostedWebApp will inject the cordova.js.
If there isn't connectivity it goes to an offline version of the site, that can be only a message or can be a full app.

# Contribute

* git clone
* npm install
* bower install
* gulp build
