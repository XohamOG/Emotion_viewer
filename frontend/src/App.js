import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import LandingPage from "./components/LandingPage";
import InterviewerLayout from "./components/InterviewerLayout";
import IntervieweeLayout from "./components/IntervieweeLayout";
import InterviewSessionLayout from "./components/InterviewSessionLayout";
import IntervieweesList from "./pages/IntervieweesList";
import InterviewSession from "./pages/InterviewSession";
import ResumeReader from "./pages/ResumeReader";
import IntervieweeResume from "./pages/IntervieweeResume";
import Tracker from "./pages/Tracker";
import Reports from "./pages/Reports";
import Home from "./pages/Home";

function App() {
  return (
    <Router>
      <Routes>
        {/* Landing Page */}
        <Route path="/" element={<LandingPage />} />

        {/* Interviewer Layout */}
        <Route path="/interviewer" element={<InterviewerLayout />}>
          <Route path="home" element={<Home />} />
          <Route path="interview" element={<IntervieweesList />} />
          <Route path="/interviewer/interview/:id" element={<InterviewSession />} />
          <Route path="/interviewer/interview/:id/reports" element={<Reports />} />

          {/* <Route path="interviewees/:id" element={<InterviewSession />} /> */}
        </Route>

      {/* Interview Session Layout */}
      {/* Interview Session - Uses New Layout */}
      <Route path="/interviewer/interview/:id" element={<InterviewSessionLayout />}>
          <Route index element={<InterviewSession />} /> 
        </Route>

        {/* Interviewee Routes */}
        <Route path="/interviewee" element={<IntervieweeLayout />}>
          <Route path="resume" element={<IntervieweeResume />} />
          <Route path="interview" element={<Tracker />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;