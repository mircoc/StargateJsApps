/* globals store, accountmanager */

var IAP = {

	id: '',
	alias: '',
	type: '',
	verbosity: '',
	paymethod: '',
    subscribeMethod: 'stargate',
    returnUrl: '',
    callbackSuccess: function(){log("[IAP] Undefined callbackSuccess")},
    callbackError: function(){log("[IAP] Undefined callbackError")},
	
	initialize: function () {
        if (!window.store) {
            err('Store not available');
            return;
        }
		
        // initialize with current url
        IAP.returnUrl = document.location.href;

        if (hybrid_conf.IAP.id) {
            IAP.id = hybrid_conf.IAP.id;
        }

        // 
        if (hybrid_conf.IAP.alias) {
            IAP.alias = hybrid_conf.IAP.alias;
        }

        //  --- type ---
        // store.FREE_SUBSCRIPTION = "free subscription";
        // store.PAID_SUBSCRIPTION = "paid subscription";
        // store.CONSUMABLE        = "consumable";
        // store.NON_CONSUMABLE    = "non consumable";
        if (hybrid_conf.IAP.type) {
            IAP.type = hybrid_conf.IAP.type;
        }

        // Available values: DEBUG, INFO, WARNING, ERROR, QUIET
        IAP.verbosity = 'DEBUG';

        IAP.paymethod = isRunningOnAndroid() ? 'gwallet' : 'itunes';


        log('IAP initialize id: '+IAP.id);
		
		if(isRunningOnAndroid()){
			IAP.getGoogleAccount();
		}
        window.store.verbosity = window.store[IAP.verbosity];
        // store.validator = ... TODO
        
        window.store.register({
            id:    IAP.id,
            alias: IAP.alias,
            type:  store[IAP.type]
        });
        
        window.store.when(IAP.alias).approved(function(p){IAP.onPurchaseApproved(p);});
        window.store.when(IAP.alias).verified(function(p){IAP.onPurchaseVerified(p);});
        window.store.when(IAP.alias).updated(function(p){IAP.onProductUpdate(p);});
		window.store.when(IAP.alias).owned(function(p){IAP.onProductOwned(p);});
		window.store.when(IAP.alias).cancelled(function(p){IAP.onCancelledProduct(p); });
		window.store.when(IAP.alias).error(function(errorPar){IAP.error(JSON.stringify(errorPar));});
        window.store.ready(function(){ IAP.onStoreReady();});
        window.store.when("order "+IAP.id).approved(function(order){IAP.onOrderApproved(order);});
    },

    getPassword: function (transactionId){
        return md5('iap.'+transactionId+'.playme').substr(0,8);
    },
	
	getGoogleAccount: function(){
		window.accountmanager.getAccounts(IAP.checkGoogleAccount, IAP.error, "com.google");	
	},
	
	checkGoogleAccount: function(result){
		
		if(result) {
			log('[IAP] accounts');
			log(result);
			
			for(var i in result){
				window.localStorage.setItem('googleAccount', result[i].email);
				return result[i].email;
			}
		}	
	},
 
    onProductUpdate: function(p){
        log('IAP> Product updated.');
        log(JSON.stringify(p));
        if (p.owned) {
            log('[IAP] Subscribed!');
        } else {
            log('[IAP] Not Subscribed');
        }
    },
    
    onPurchaseApproved: function(p){
        log('IAP> Purchase approved.');
        log(JSON.stringify(p));
        //p.verify(); TODO before finish		
        p.finish();
    },
    onPurchaseVerified: function(p){
        log("subscription verified");
        //p.finish(); TODO
    },
    onStoreReady: function(){
        log("\\o/ STORE READY \\o/");
        /*store.ask(IAP.alias)
        .then(function(data) {
              console.log('Price: ' + data.price);
              console.log('Description: ' + data.description);
              })
        .error(function(err) {
               // Invalid product / no connection.
               console.log('ERROR: ' + err.code);
               console.log('ERROR: ' + err.message);
               });*/
    },
    
    onProductOwned: function(p){
        log('[IAP] > Product Owned.');
        if (!p.transaction.id && isRunningOnIos()){
            log('[IAP] > no transaction id');
            return false;
        }
        window.localStorage.setItem('product', p);
		if(isRunningOnIos()){
			window.localStorage.setItem('transaction_id', p.transaction.id);
		}
        
        if (isRunningOnAndroid()){
            var purchase_token = p.transaction.purchaseToken + '|' + stargateConf.id + '|' + IAP.id;
            log('[IAP] Purchase Token: '+purchase_token);
            
            if(!window.localStorage.getItem('user_account')){
                IAP.createUser(p, purchase_token);
            }
            
        } else {
        
            storekit.loadReceipts(function (receipts) {
                log('[IAP] appStoreReceipt: ' + receipts.appStoreReceipt);
                                  
                if(!window.localStorage.getItem('user_account')){
                    IAP.createUser(p, receipts.appStoreReceipt);
                }
            });
        }
        
    },
    
    onCancelledProduct: function(p){
        setBusy(false);
        IAP.callbackError({'iap_cancelled': 1, 'return_url' : IAP.returnUrl});
        log('[IAP] > Purchase cancelled ##################################', p);
    },
    
    onOrderApproved: function(order){
       log("[IAP] ORDER APPROVED "+IAP.id);
       order.finish();
    },
	
	error: function(error) {
        setBusy(false);
        IAP.callbackError({'iap_error': 1, 'return_url' : IAP.returnUrl});

		err('[IAP] error: '+error);	
	},
	
	createUser: function(product, purchaseToken){
	
		window.localStorage.setItem('user_account', 
            isRunningOnAndroid() ? 
                (window.localStorage.getItem('googleAccount') ? 
                    window.localStorage.getItem('googleAccount')
                    : purchaseToken+'@google.com')
                : product.transaction.id+'@itunes.com');
		
        var url = IAP.subscribeMethod;		
		


		reqwest({
            method: "post",
            url: url,

            data: {
                'paymethod': IAP.paymethod,
                'user_account': window.localStorage.getItem('user_account'),
                'purchase_token': purchaseToken,
                'return_url': IAP.returnUrl,
                'inapp_pwd': IAP.getPassword(purchaseToken),
                'hybrid': 1
            },

            type: 'jsonp',

            success: function(user)
            {
                log('[IAP] createUser success ', user);
                user.device_id = device.uuid;
                if(window.localStorage.getItem('transaction_id')){
                    user.transaction_id = window.localStorage.getItem('transaction_id');
                }
                setBusy(false);
                IAP.callbackSuccess(user);
            },

            error: function(error)
            {
                err("[IAP] Call failed, please try again...", error);
                var stargateResponseError = {"iap_error" : "1", "return_url" : IAP.returnUrl};
                setBusy(false);
                IAP.callbackError(stargateResponseError);
            }
		});
	}
};



stargatePublic.inAppPurchaseSubscription = function(callbackSuccess, callbackError, subscriptionUrl, returnUrl) {

    setBusy(true);

    if (typeof returnUrl !==  'undefined'){
        IAP.returnUrl = returnUrl;
    }
    if (typeof subscriptionUrl !==  'undefined'){
        IAP.subscribeMethod = subscriptionUrl;
    }
    
    IAP.callbackSuccess = callbackSuccess;
    IAP.callbackError = callbackError;

    window.store.order(IAP.id);
    window.store.refresh();
    
};


stargatePublic.inAppRestore = function(callbackSuccess, callbackError, subscriptionUrl, returnUrl) {

    
};

/*
var Stargate = {
    

    

    inAppPurchaseSubscription: function(callbackSuccess, callbackError, subscriptionUrl, returnUrl){
        var msgId = Stargate.createMessageId(); 
        Stargate.messages[msgId] = new Message();
        Stargate.messages[msgId].msgId = msgId;
        Stargate.messages[msgId].exec = 'stargate.purchase.subscription';
        if (typeof subscriptionUrl !== 'undefined'){
            Stargate.messages[msgId].subscriptionUrl =  subscriptionUrl;
        }
        if (typeof returnUrl !== 'undefined'){
            Stargate.messages[msgId].returnUrl =  returnUrl;
        }
        Stargate.messages[msgId].callbackSuccess = callbackSuccess;
        Stargate.messages[msgId].callbackError = callbackError;
        Stargate.messages[msgId].send();
    },

    inAppRestore: function(callbackSuccess, callbackError, subscriptionUrl, returnUrl){
        var msgId = this.createMessageId(); 
        Stargate.messages[msgId] = new Message();
        Stargate.messages[msgId].msgId = msgId;
        Stargate.messages[msgId].exec = 'stargate.restore';
        if (typeof subscriptionUrl !== 'undefined'){
            Stargate.messages[msgId].subscriptionUrl =  subscriptionUrl;
        }
        if (typeof returnUrl !== 'undefined'){
            Stargate.messages[msgId].returnUrl =  returnUrl;
        }
        Stargate.messages[msgId].callbackSuccess = callbackSuccess;
        Stargate.messages[msgId].callbackError = callbackError;
        Stargate.messages[msgId].send();        
    },
    
}
*/



