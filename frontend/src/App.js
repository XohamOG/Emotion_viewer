import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import LandingPage from "./components/LandingPage";
import InterviewerLayout from "./components/InterviewerLayout";
import IntervieweeLayout from "./components/IntervieweeLayout";
import Home from "./pages/Home";
import ResumeReader from "./pages/ResumeReader";
import Reports from "./pages/Reports";
import Support from "./pages/Support";
import Tracker from "./pages/Tracker";
import TrackerCandidates from "./pages/TrackerCandidates";

function App() {
  return (
    <Router>
      <Routes>
        {/* Landing Page */}
        <Route path="/" element={<LandingPage />} />

        {/* Interviwer Layout with Nested Routes */}
        <Route path="/interviewer" element={<InterviewerLayout />}>
          <Route index element={<Home />} />
          <Route path="home" element={<Home />} />
          <Route path="resume" element={<ResumeReader />} />
          <Route path="reports" element={<Reports />} />
          <Route path="support" element={<Support />} />
          <Route path="interview" element={<Tracker />} />
          <Route path="candidates" element={<TrackerCandidates />} />

        </Route>

        {/* Doctor Layout with its own pages (modify as needed) */}
        <Route path="/interviewee" element={<IntervieweeLayout />}>
        <Route path="resume" element={<ResumeReader />} />
          <Route path="reports" element={<Reports />} />
          <Route path="support" element={<Support />} />
          <Route path="interview" element={<Tracker />} />
          <Route path="candidates" element={<TrackerCandidates />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
