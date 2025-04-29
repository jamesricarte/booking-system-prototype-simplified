import React, { useEffect, useState } from "react";
import { useAuth } from "../../../../../context/AuthContext";

const API_URL = import.meta.env.VITE_API_URL;

const DeleteAccountModal = ({ isOpen, onClose, loading, user }) => {
  const { logout } = useAuth();

  const [activeModal, setActiveModal] = useState("deleteAccount");
  const [userConfirmed, setUserConfirmed] = useState(false);
  const [inputData, setInputData] = useState("");
  const [inputMessage, setInputMessage] = useState(null);
  const [verifyLoading, setVerifyLoading] = useState(false);
  const [understandDeletion, setunderstandDeletion] = useState(false);
  const [passwordInput, setPasswordInput] = useState("");
  const [passwordInputMessage, setPasswordInputMessage] = useState({
    available: false,
    message: "",
    success: null,
  });

  useEffect(() => {
    if (userConfirmed) {
      setActiveModal("confirm");
    }
  }, [userConfirmed]);

  if (!isOpen) return null;

  const verify = (e) => {
    e.preventDefault();
    setVerifyLoading(true);
    setTimeout(() => {
      if (inputData === "DELETE") {
        setVerifyLoading(false);
        setUserConfirmed(true);
      } else {
        setVerifyLoading(false);
        setInputMessage(
          "You must type DELETE exactly to confirm account deletion."
        );
      }
    }, 1500);
  };

  const deleteUser = async (e) => {
    e.preventDefault();

    setVerifyLoading(true);
    const startTime = Date.now();
    let message = {
      message: "",
      success: null,
    };

    try {
      const response = await fetch(`${API_URL}/api/deleteUser`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userId: user.id, passwordInput: passwordInput }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw errorData;
      }

      const result = await response.json();
      message = {
        message: result.message,
        success: result.success || false,
      };
    } catch (error) {
      const errorMessage =
        error.message === "Failed to fetch"
          ? "Unable to connect to the server. Check your internet connection"
          : error.message;
      message = {
        message: errorMessage,
        success: false,
      };
    } finally {
      const elapsedTime = Date.now() - startTime;
      const minimumTime = 1000;

      setTimeout(() => {
        if (message.success) {
          setActiveModal("loading-screen");
          setTimeout(() => {
            logout();
          }, 3000);
        } else {
          setVerifyLoading(false);
        }
        setPasswordInputMessage({
          available: true,
          message: message.message,
          success: message.success,
        });
      }, Math.max(0, minimumTime - elapsedTime));
    }
  };

  const renderActiveModal = () => {
    switch (activeModal) {
      case "deleteAccount":
        return (
          <>
            <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-60">
              <div className="bg-white rounded-md shadow-xl w-[30vw]">
                <div className="flex p-4">
                  <h1 className="">Delete Account</h1>
                </div>

                <hr />

                <div className="text-[#754C32] bg-[#FFB080] text-sm py-3 px-5">
                  <p>
                    Warning: This action is permanent. Please read carefully.
                  </p>
                </div>

                <form className="relative" onSubmit={verify}>
                  <div className="flex flex-col gap-5 py-5 text-sm px-11">
                    <h2 className="font-normal">
                      This action <b>CANNOT</b> be undone. This will remove your{" "}
                      <b>ACCOUNT</b> and all your information from our database
                      permanently.
                    </h2>

                    <div className="flex flex-col gap-2">
                      <p className="text-[#292929] text-sm">
                        Type DELETE to confirm account deletion.
                      </p>
                      {inputMessage && (
                        <p className="text-xs text-[#EF5350]">
                          You must type DELETE exactly to confirm account
                          deletion.
                        </p>
                      )}

                      <input
                        type="text"
                        value={inputData}
                        onChange={(e) => setInputData(e.target.value)}
                        className="p-3 rounded-md border-gray-500 bg-[#EFEFEF] text-[#595959] border-none outline-none w-full"
                      />
                    </div>

                    <div className="flex justify-end gap-3">
                      <button
                        type="button"
                        className="px-4 py-2 bg-[#D9D9D9] rounded cursor-pointer hover:bg-[#BFBFBF]"
                        onClick={() => {
                          onClose();
                          setInputData("");
                          setInputMessage(null);
                        }}
                        disabled={verifyLoading}
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-4 py-2 text-white bg-[#EF5350] rounded cursor-pointer hover:bg-[#E53935]"
                        disabled={verifyLoading}
                      >
                        Delete Account
                      </button>
                    </div>
                  </div>
                  {/* White background */}
                  <div
                    className={`absolute top-0 left-0 w-full h-full bg-white opacity-20 pointer-events-auto z-20 ${
                      verifyLoading ? "block" : "hidden"
                    }`}
                  ></div>
                </form>
              </div>
            </div>
          </>
        );
      case "confirm":
        return (
          <>
            <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-60">
              <div className="bg-white rounded-md shadow-xl w-[30vw]">
                <div className="flex p-4">
                  <h1 className="">Confirm Deletion</h1>
                </div>

                <hr />

                <div className="flex flex-col py-5 text-sm px-11">
                  <form
                    className="relative flex flex-col gap-5"
                    onSubmit={deleteUser}
                  >
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        className="cursor-pointer"
                        checked={understandDeletion}
                        onChange={(e) =>
                          setunderstandDeletion(e.target.checked)
                        }
                      />
                      <label className="text-sm text-[#595959]">
                        I understand that deleting my account is permanent and
                        cannot be undone.
                      </label>
                    </div>

                    <div>
                      <p className="text-[#292929] text-sm mb-2">
                        To confirm if it is you, please re-enter your pasword
                        for one last time.
                      </p>
                      {passwordInputMessage.available && (
                        <p className="text-xs text-[#EF5350] mb-2">
                          {passwordInputMessage.message}
                        </p>
                      )}

                      <input
                        type="password"
                        className="p-3 rounded-md border-gray-500 bg-[#EFEFEF] text-[#595959] border-none outline-none w-full"
                        value={passwordInput}
                        onChange={(e) => setPasswordInput(e.target.value)}
                      />
                    </div>

                    <div className="flex justify-end gap-3">
                      <button
                        type="button"
                        className="px-4 py-2 bg-[#D9D9D9] rounded cursor-pointer hover:bg-[#BFBFBF]"
                        onClick={() => {
                          onClose();
                          setActiveModal("deleteAccount");
                          setInputData("");
                          setInputMessage(null);
                        }}
                        disabled={loading}
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className={`px-4 py-2 text-white rounded cursor-pointer bg-[#EF5350] ${
                          understandDeletion ? "hover:bg-[#E53935]" : ""
                        }`}
                        disabled={loading || !understandDeletion}
                      >
                        Confirm
                      </button>
                    </div>

                    {/* White background */}
                    <div
                      className={`absolute top-0 left-0 w-full h-full bg-white opacity-20 pointer-events-auto z-20 ${
                        verifyLoading ? "block" : "hidden"
                      }`}
                    ></div>
                  </form>
                </div>
              </div>
            </div>
          </>
        );
      case "loading-screen":
        return (
          <>
            <div className="fixed inset-0 z-20 w-full h-full bg-white">
              {/* Loading spinner */}
              <div
                className={`absolute z-30 w-10 h-10 transform -translate-x-1/2 -translate-y-1/2 rounded-full border-6 rounded-1/2 border-t-transparent border-cyan-500 left-1/2 top-1/2 ${
                  verifyLoading ? "block animate-spin" : "hidden"
                }`}
              ></div>
            </div>
          </>
        );
      default:
        return null;
    }
  };
  return renderActiveModal();
};

export default DeleteAccountModal;
