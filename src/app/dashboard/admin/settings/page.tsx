"use client";

import React from "react";
import SettingsAdmin from "./admin/settingsAdmin";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function page() {
  return (
    <div>
      <ToastContainer position="top-center" theme="colored" />
      <SettingsAdmin></SettingsAdmin>
    </div>
  );
}

export default page;
