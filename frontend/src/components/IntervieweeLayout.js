import React, { useState } from "react";
import Sidebar from "./Sidebar";
import Header from "./Header";
import QRCodeScanner from "./QRCodeScanner"; // Import the QR code scanner
import MedicineForm from "./Interview"; // Import the form to add medicines
import { Link, Route, Routes } from "react-router-dom";
import Home from "../pages/Home";
import Reports from "../pages/Reports";
import Support from "../pages/Support"; // Add other pages as needed

const DoctorLayout = () => {
  const [scannedPatientId, setScannedPatientId] = useState(null);
  const [isScannerVisible, setIsScannerVisible] = useState(false); // Initially hide scanner

  // Handle QR Code Scan
  const handleScan = (id) => {
    setScannedPatientId(id);
    setIsScannerVisible(false); // Hide the scanner after successful scan
  };

  // Toggle scanner visibility when clicking on 'Medicines'
  const handleMedicinesClick = () => {
    setIsScannerVisible(true);
  };

  return (
    <div className="layout">
      <Sidebar />
      <div className="main-content">
        <Header />
        <div className="page-content">
          {/* Show the route for different pages */}
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/reports" element={<Reports />} />
            <Route path="/support" element={<Support />} />
          </Routes>

          {/* Show QR Code Scanner when 'Medicines' is clicked */}
          <Link to="#" onClick={handleMedicinesClick}>
            <button className="btn">Medicines</button>
          </Link>

          {isScannerVisible ? (
            <QRCodeScanner onScan={handleScan} />
          ) : (
            <div>
              {/* Default Layout when scanner is not visible */}
              <h2>Welcome to the Doctor Dashboard</h2>
              <p>Use the navigation to access reports, support, and add medicines.</p>
            </div>
          )}

          {/* Once scanned, show the medicine form */}
          {scannedPatientId && <MedicineForm patientId={scannedPatientId} />}
        </div>
      </div>
    </div>
  );
};

export default DoctorLayout;
