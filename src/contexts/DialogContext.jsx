import { useState } from "react";
import { DialogContext } from "./DialogContext";

export const DialogProvider = ({ children }) => {
  const [dialog, setDialog] = useState(null);

  const showDialog = ({ type, message }) =>
    new Promise((resolve) => {
      setDialog({
        type,
        message,
        onConfirm: () => {
          setDialog(null);
          resolve(true);
        },
        onCancel: () => {
          setDialog(null);
          resolve(false);
        },
      });
    });

  return (
    <DialogContext.Provider value={{ showDialog }}>
      {children}

      {dialog && (
        <div className="dialog-overlay">
          <div className="dialog-box">
            <p>{dialog.message}</p>
            <div className="text-end mt-3">
              {dialog.type === "alert" && (
                <button className="btn btn-primary" onClick={dialog.onConfirm}>
                  OK
                </button>
              )}

              {dialog.type === "confirm" && (
                <>
                  <button
                    className="btn btn-danger me-2"
                    onClick={dialog.onCancel}
                  >
                    No
                  </button>
                  <button
                    className="btn btn-success"
                    onClick={dialog.onConfirm}
                  >
                    Yes
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </DialogContext.Provider>
  );
};
