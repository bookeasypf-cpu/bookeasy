"use client";

import toast from "react-hot-toast";

export function UpdateNotificationComponent() {
  return (
    <div className="bg-blue-600 text-white p-4 rounded-lg shadow-lg flex items-center justify-between gap-3 max-w-sm">
      <div>
        <p className="font-semibold text-sm">Nouvelle version disponible</p>
        <p className="text-xs text-blue-100">Cliquez pour mettre a jour</p>
      </div>
      <button
        onClick={() => {
          window.location.reload();
        }}
        className="bg-white text-blue-600 px-3 py-1.5 rounded font-semibold text-xs hover:bg-blue-50 transition-colors flex-shrink-0"
      >
        Recharger
      </button>
    </div>
  );
}

export function showUpdateNotification() {
  toast.custom(() => <UpdateNotificationComponent />, { duration: Infinity });
}
