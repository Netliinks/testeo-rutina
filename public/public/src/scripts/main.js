import { SignIn } from "./login.js";
/*navigator.serviceWorker.register("firebase-messaging-sw.js");
// Use serviceWorker.ready to ensure that you can subscribe for push
navigator.serviceWorker.ready.then((serviceWorkerRegistration) => {
    const options = {
      userVisibleOnly: true,
      applicationServerKey: "BNXhjUBQ7KdX2RWjC8jWka1tktvKCHfUcCONPFWVyNo5DxS3STCe87ayao-mEKLhcbBQ_yU_h7ONYonzK6Qk-rk",
    };
    serviceWorkerRegistration.pushManager.subscribe(options).then(
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
  });*/
new SignIn().checkSignIn();
