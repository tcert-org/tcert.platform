"use client";

import React from "react";
import SettingsPartner from "./partner/settingsPartner";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function PartnerSettingsPage() {
  return (
    <div>
      <ToastContainer position="top-center" theme="colored" />
      <SettingsPartner />
    </div>
  );
}
