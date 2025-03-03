import React, { useState } from "react";
import '../styles/Interview.css';  // Import the external CSS

const MedicineForm = ({ patientId }) => {
  const [medicationDetails, setMedicationDetails] = useState({
    medicationId: "",
    name: "",
    dosage: "",
    frequency: "",
    startDate: "",
    endDate: "",
    instructions: "",
  });

  const [showModal, setShowModal] = useState(false); // State to control modal visibility

  const handleChange = (e) => {
    const { name, value } = e.target;
    setMedicationDetails({
      ...medicationDetails,
      [name]: value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Handle API call here if needed
    console.log("Medicine added for patient:", patientId);
    console.log(medicationDetails);
    setShowModal(true); // Show the modal after submitting the form
  };

  const handleCloseModal = () => {
    setShowModal(false); // Close the modal
  };

  return (
    <div className="medicine-form-container">
      <h3 className="header">Add Medicine for Patient ID: {patientId}</h3>
      <form onSubmit={handleSubmit} className="medicine-form">
        <label>
          Medication ID:
          <input
            type="text"
            name="medicationId"
            value={medicationDetails.medicationId}
            onChange={handleChange}
            className="input-field"
          />
        </label>
        <label>
          Name:
          <input
            type="text"
            name="name"
            value={medicationDetails.name}
            onChange={handleChange}
            className="input-field"
          />
        </label>
        <label>
          Dosage:
          <input
            type="text"
            name="dosage"
            value={medicationDetails.dosage}
            onChange={handleChange}
            className="input-field"
          />
        </label>
        <label>
          Frequency:
          <input
            type="text"
            name="frequency"
            value={medicationDetails.frequency}
            onChange={handleChange}
            className="input-field"
          />
        </label>
        <label>
          Start Date:
          <input
            type="date"
            name="startDate"
            value={medicationDetails.startDate}
            onChange={handleChange}
            className="input-field"
          />
        </label>
        <label>
          End Date:
          <input
            type="date"
            name="endDate"
            value={medicationDetails.endDate}
            onChange={handleChange}
            className="input-field"
          />
        </label>
        <label>
          Instructions:
          <textarea
            name="instructions"
            value={medicationDetails.instructions}
            onChange={handleChange}
            className="textarea-field"
          />
        </label>
        <button type="submit" className="submit-btn">Add Medicine</button>
      </form>

      {/* Modal */}
      {showModal && (
        <div className="modal">
          <div className="modal-content">
            <h4>Medicine Added Successfully!</h4>
            <p>Medicine details have been saved for Patient ID: {patientId}.</p>
            <button onClick={handleCloseModal} className="close-btn">Close</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default MedicineForm;
