// src/components/Notifications.jsx
import React from "react";
import { toast } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';

toast.configure();

export const notify = (message) => {
  toast.info(message, { position: toast.POSITION.TOP_RIGHT });
};
