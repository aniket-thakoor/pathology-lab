import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ChakraProvider } from '@chakra-ui/react';

import Home from './components/pages/Home';
import PatientEntry from './components/pages/PatientEntry';
import TestResultsEntry from './components/pages/TestResultsEntry';
import TestMaster from './components/pages/TestMaster';
import SummaryReport from './components/pages/SummaryReport';
import LabDetails from './components/pages/LabDetails';

function App() {
  return (
    <ChakraProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/patient" element={<PatientEntry />} />
          <Route path="/results" element={<TestResultsEntry />} />
          <Route path="/test-setup" element={<TestMaster />} />
          <Route path="/summary" element={<SummaryReport />} />
          <Route path="/lab-details" element={<LabDetails />} />
        </Routes>
      </Router>
    </ChakraProvider>
  );
}

export default App;
