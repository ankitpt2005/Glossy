/**
 * Browser Notification API Service for Project Glossy
 */

export const requestNotificationPermission = async () => {
  if (!("Notification" in window)) {
    console.warn("This browser does not support desktop notifications.");
    return false;
  }

  if (Notification.permission === "granted") {
    return true;
  }

  if (Notification.permission !== "denied") {
    const permission = await Notification.requestPermission();
    return permission === "granted";
  }

  return false;
};

export const getNotificationPermissionState = () => {
  if (!("Notification" in window)) return "unsupported";
  return Notification.permission;
};

export const sendBrowserNotification = (title, options = {}) => {
  if (!("Notification" in window) || Notification.permission !== "granted") {
    return;
  }

  try {
    const notification = new Notification(title, {
      icon: "/favicon.svg",
      badge: "/favicon.svg",
      ...options,
    });

    notification.onclick = () => {
      window.focus();
      notification.close();
    };
  } catch (err) {
    console.error("Failed to trigger browser notification:", err);
  }
};

export const notifyImportantEmail = (sender, subject, reason) => {
  sendBrowserNotification("⚠️ Glossy: Urgent Mail Flagged for Review", {
    body: `From: ${sender}\nSubject: ${subject}\n\n${reason}`,
    tag: "important-email",
    requireInteraction: true,
  });
};

export const notifySessionEnded = (stats) => {
  sendBrowserNotification("✅ Glossy: Busy Session Completed", {
    body: `Session Report Ready!\nTriaged: ${stats.total_triaged || 0} | Auto-Sent: ${stats.auto_sent || 0} | Drafted: ${stats.drafted || 0}`,
    tag: "session-ended",
  });
};
