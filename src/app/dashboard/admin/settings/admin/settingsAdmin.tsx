"use client";
import React, { useState } from "react";
import MembershipForm from "./membership/membership";
import ParamsPage from "./params/params";

function SettingsAdmin() {
  const [showMembershipForm, setShowMembershipForm] = useState(false);
  const [showParamsForm, setShowParamsForm] = useState(false);

  return (
    <div className="settings-container w-full max-w-6xl px-6 mx-auto">
      {/* Opción Membresías */}
      <div className="banner-option bg-blue-100 border border-blue-300 px-6 py-4 rounded-lg flex items-center gap-3 shadow-lg mb-5">
        <div className="flex-1">
          <h2 className="banner-title text-xl font-semibold text-gray-800">
            Membresías
          </h2>
          <p className="banner-description text-sm text-gray-600">
            Gestiona las membresías de los usuarios.
          </p>
        </div>
        <button
          onClick={() => setShowMembershipForm(!showMembershipForm)}
          className="banner-button bg-blue-700 text-white px-4 py-2 rounded hover:bg-blue-800 transition"
        >
          {showMembershipForm ? "Ocultar" : "Ver"}
        </button>
      </div>

      {showMembershipForm && (
        <div className="mb-8">
          <MembershipForm />
        </div>
      )}

      {/* Opción Parametrización */}
      <div className="banner-option bg-green-100 border border-green-300 px-6 py-4 rounded-lg flex items-center gap-3 shadow-lg mb-5">
        <div className="flex-1">
          <h2 className="banner-title text-xl font-semibold text-gray-800">
            Parametrización
          </h2>
          <p className="banner-description text-sm text-gray-600">
            Configura los parámetros del sistema.
          </p>
        </div>
        <button
          onClick={() => setShowParamsForm(!showParamsForm)}
          className="banner-button bg-green-700 text-white px-4 py-2 rounded hover:bg-green-800 transition"
        >
          {showParamsForm ? "Ocultar" : "Ver"}
        </button>
      </div>

      {showParamsForm && (
        <div className="mb-8">
          <ParamsPage />
        </div>
      )}
    </div>
  );
}

export default SettingsAdmin;
