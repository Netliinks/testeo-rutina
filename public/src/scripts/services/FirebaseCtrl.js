import { firebaseConfig, applicationServerKey } from "../firebaseConfig.js";
// @ts-ignore
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
// @ts-ignore
import { getMessaging, getToken, isSupported, onMessage } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging.js";
export class FirebaseCtrl {
    constructor() {
        // @ts-ignore
        this.token = undefined;
        // @ts-ignore
        this.onRecieveNotificationCb = undefined;
        // @ts-ignore
        this.onErrorCb = undefined;
        // @ts-ignore
        this.onGetTokenCb = undefined;
        this.messageListenerRegistered = false;
    }
    async initApp() {
        const savedToken = window.localStorage.getItem("libreriasjs-notification-token");
        if (savedToken) {
            // @ts-ignore
            this.enableWebNotifications();
        }
    }
    async enableWebNotifications() {
        const permission = await Notification.requestPermission();
        if(permission==="granted"){
            const supported = await isSupported();
            // @ts-ignore
            if (!supported && typeof this.onErrorCb === "function") {
                // @ts-ignore
                this.onErrorCb("This browser does not support the API's required to use the Firebase SDK");
                return;
            }
            if ("serviceWorker" in navigator) {
                // Use the application base path so this works both locally and when deployed under a subpath.
                const basePath = new URL('./', document.baseURI).pathname;
                const serviceWorkerRegistration = await navigator.serviceWorker.register(
                    `${basePath}firebase-messaging-sw.js`,
                    { scope: basePath },
                );
    
                await navigator.serviceWorker.ready;
    
                const serviceWorkerSuscription = await serviceWorkerRegistration.pushManager.subscribe({
                    userVisibleOnly: true,
                    applicationServerKey,
                }).catch((error) => {
                    console.error(`Service worker suscription failed: ${error}`);
                });
                serviceWorkerSuscription;
                const app = initializeApp(firebaseConfig);
                const messaging = getMessaging(app);
                this.registerMessageListener(messaging);
                try {
                    // @ts-ignore
                    this.token = await getToken(messaging, {
                        serviceWorkerRegistration: serviceWorkerRegistration,
                        vapidKey: applicationServerKey,
                    });
                }
                catch (err) {
                    console.log("An error occurred while retrieving token. ", err);
                    // @ts-ignore
                    if (typeof this.onErrorCb === "function") {
                        // @ts-ignore
                        this.onErrorCb(err.message);
                    }
                    return;
                }
                // @ts-ignore
                if (!this.token) {
                    const error = "No registration token available. Request permission to generate one.";
                    console.log(error);
                    // @ts-ignore
                    if (typeof this.onErrorCb === "function") {
                        // @ts-ignore
                        this.onErrorCb(error);
                    }
                    return;
                }
                // @ts-ignore
                //console.log(this.token);
                // @ts-ignore
                if (typeof this.onGetTokenCb === "function") {
                    // @ts-ignore
                    window.localStorage.setItem("libreriasjs-notification-token", this.token);
                    // @ts-ignore
                    this.onGetTokenCb(this.token);
                }
                navigator.serviceWorker.ready.then((serviceWorkerRegistration1) => {
                    const options = {
                        userVisibleOnly: true,
                        applicationServerKey: applicationServerKey,
                    };
                    serviceWorkerRegistration1.pushManager.subscribe(options).then(
                        (pushSubscription) => {
                        //console.log(pushSubscription.endpoint);
                        // The push subscription details needed by the application
                        // server are now available, and can be sent to it using,
                        // for example, the fetch() API.
                        },
                        (error) => {
                        // During development it often helps to log errors to the
                        // console. In a production environment it might make sense to
                        // also report information about errors back to the
                        // application server.
                        console.error(error);
                        },
                    );
                });
            }else{
                console.error("Service workers are not supported.");
            }
        }
    }
    registerMessageListener(messaging) {
        if (this.messageListenerRegistered) return;
        this.messageListenerRegistered = true;
        onMessage(messaging, (payload) => this.emitNotification(payload));
        navigator.serviceWorker.addEventListener("message", (event) => this.emitNotification(event.data));
    }
    emitNotification(payload) {
        if (typeof this.onRecieveNotificationCb === "function") this.onRecieveNotificationCb(payload);
    }
    onGetToken(cb) {
        if (typeof cb === "function") {
            // @ts-ignore
            this.onGetTokenCb = cb;
        }
    }
    onRecieveNotification(cb) {
        if (typeof cb === "function") {
            // @ts-ignore
            this.onRecieveNotificationCb = cb;
        }
    }
    onError(cb) {
        if (typeof cb === "function") {
            // @ts-ignore
            this.onErrorCb = (err) => {
                window.localStorage.removeItem("libreriasjs-notification-token");
                cb(err);
            };
        }
    }
}
