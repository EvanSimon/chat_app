const functions = require("firebase-functions");
const admin = require("firebase-admin");

admin.initializeApp();

const sendPushNotification = (snapshot) => {
  return admin.messaging().sendToTopic("chat", {
    // Sending a notification message.
    notification: {
      title: snapshot.data()["username"],
      body: snapshot.data()["text"],
      clickAction: "FLUTTER_NOTIFICATION_CLICK",
    },
  });
};
exports.myFunction = functions.firestore
    .document("chat/{messageId}")
    .onCreate(async (snapshot, context) => {
      const userId = context.params.userId;
      const notificationData = context.after.val();
      // Check if the user has pressed the notification
      if (notificationData && notificationData.pressed) {
        console.log("User has pressed the notification. No need to resend.");
        return null;
      }
      // Wait for 3 minutes (180,000 milliseconds) before resending
      await new Promise((resolve) => setTimeout(resolve, 180000));
      // (replace 'userTokenPath' with your data structure)
      const userTokenPath = `/chat/${userId}/fcmToken`;
      const userSnapshot =
      await admin.database().ref(userTokenPath).once("value");
      const userToken = userSnapshot.val();
      if (userToken) {
        // Resend the push notification
        await sendPushNotification(userToken,
            "Reminder: Your notification message.");
        console.log("Push notification resent.");
      } else {
        console.error("User has no FCM token.");
      }
      return admin.messaging().sendToTopic("chat", {
      // Sending a notification message.
        notification: {
          title: snapshot.data()["username"],
          body: snapshot.data()["text"],
          clickAction: "FLUTTER_NOTIFICATION_CLICK",
        },
      });
    });
