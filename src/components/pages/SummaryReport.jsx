import React, { useState, useRef, useEffect } from 'react';
import {
  Box, Heading, Text, VStack, Button, Flex,
  Switch, Divider
} from '@chakra-ui/react';
import {
  getPatientById, getSelectedTests, getTestResults,
  getTestGroups, getLabDetails
} from '@/services/dbService';
import PageHeader from '../common/PageHeader';
import { exportSummaryReport, getSummaryReportBlob } from '@/utils/pdfExport';

const SummaryReport = () => {

  const [patient, setPatient] = useState({});
  const [selectedTests, setSelectedTests] = useState([]);
  const [results, setResults] = useState({});
  const [groups, setGroups] = useState([]);
  const [labDetails, setLabDetails] = useState({});
  const [showRanges, setShowRanges] = useState(true);
  const [showNotes, setShowNotes] = useState(true);
  const preloadId = sessionStorage.getItem('editPatientId');

  useEffect(() => {
    if (!preloadId) return;

    Promise.all([
      getLabDetails(),
      getPatientById(preloadId),
      getSelectedTests(preloadId),
      getTestResults(preloadId),
      getTestGroups()
    ]).then(([lab, pat, test, res, grp]) => {
      setLabDetails(lab || {});
      setPatient(pat || {});
      setSelectedTests(test || []);
      setResults(res || {});
      setGroups(grp || []);
    });
  }, [preloadId]);

  const selectedGroups = groups.filter(g => selectedTests?.includes(g.id));
  const getRange = (ranges, gender) => ranges[gender] || ranges["Common"];
  const isAbnormal = (val, param) => {
    const range = getRange(param.ranges, patient.gender);
    return val < range?.min || val > range?.max;
  };

  return (
    <Box p="6" minH="100vh">
      <PageHeader title="🧬 Report Summary" fallbackHome="/" />
      <VStack align="start" spacing="4">
        <Text><strong>Name:</strong> {patient.name}</Text>
        <Text><strong>Age:</strong> {patient.age} • <strong>Gender:</strong> {patient.gender}</Text>
        {selectedGroups.map(g => (
          <Box key={g.id}>
            <Text fontWeight="bold" mt="2">{g.name}</Text>
            <ul>
              {g.subGroups?.flatMap(sub =>
                sub.parameters.map(param => (
                  <li key={param.id}>
                    {param.name}: {results[param.id] || '-'} {param.unit ? `(${param.unit})` : ''}
                  </li>
                ))
              )}
            </ul>
          </Box>
        ))}

        <Flex gap="4" mt="6">
          <Button colorScheme = "blue"
            onClick={() =>
              exportSummaryReport({ patient, labDetails, groups: selectedGroups, results, showRanges, showNotes })
            }
          >
            🖨️ Download Report PDF
          </Button>
          <Button colorScheme = "green"
            onClick={() => {
              getSummaryReportBlob({ patient, labDetails, groups: selectedGroups, results, showRanges, showNotes }, blob => {
                const file = new File([blob], `Summary_Report_${patient.name || 'Patient'}.pdf`, { type: 'application/pdf' });
                if (navigator.share && navigator.canShare?.({ files: [file] })) {
                  navigator.share({
                    title: `Patient Report - ${patient.name}`,
                    text: 'Please find the patient report attached.',
                    files: [file]
                  });
                } else {
                  alert('Sharing not supported on this device/browser.');
                }
              });
            }}
          >
            📤 Share
          </Button>
        </Flex>
      </VStack>

      <Box style={{ display: 'none' }} p="6" maxW="900px" mx="auto">
        <Flex align="center" justify="space-between" mb="4">
          <Heading mb="4">📄 Summary Report</Heading>
          <Box w="90px" />
        </Flex>
  
        {/* Controls */}
        <Flex justify="space-between" mb="6" align="center" wrap="wrap">
          <Box>
            <Text fontSize="xl" fontWeight="bold">🔬 {labDetails.labName}</Text>
            <Text fontSize="sm">{labDetails.address}</Text>
          </Box>
          {/* <Flex gap="4" align="center" mt={{ base: 4, md: 0 }}>
            <Switch isChecked={showRanges} onChange={e => setShowRanges(e.target.checked)} />
            <Text fontSize="sm">Show Ranges</Text>
            <Switch isChecked={showNotes} onChange={e => setShowNotes(e.target.checked)} />
            <Text fontSize="sm">Show Notes</Text>
          </Flex> */}
        </Flex>
      </Box>
    </Box>
  );
};

export default SummaryReport;
