import React, { useState, useRef, useEffect } from 'react';
import {
  Box, Heading, Text, VStack, Button, Flex,
  Switch, Divider
} from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
import { useReactToPrint } from 'react-to-print';
import { ArrowBackIcon } from '@chakra-ui/icons';
import {
  getPatientById, getTestResults,
  getTestGroups, getLabDetails
} from '@/services/dbService';

const SummaryReport = () => {
  const navigate = useNavigate();
  const contentRef = useRef(null);
  const handlePrint = useReactToPrint({ contentRef });

  const [patient, setPatient] = useState({});
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
      getTestResults(preloadId),
      getTestGroups()
    ]).then(([lab, pat, res, grp]) => {
      setLabDetails(lab || {});
      setPatient(pat || {});
      setResults(res || {});
      setGroups(grp || []);
    });
  }, [preloadId]);

  const selectedGroups = groups.filter(g => patient.selectedTests?.includes(g.id));
  const getRange = (ranges, gender) => ranges[gender] || ranges["Common"];
  const isAbnormal = (val, param) => {
    const range = getRange(param.ranges, patient.gender);
    return val < range?.min || val > range?.max;
  };

  return (
    <Box p="6" maxW="900px" mx="auto">
      <Flex align="center" justify="space-between" mb="4">
        <Button
          leftIcon={<ArrowBackIcon />}
          onClick={() => navigate('/')}
          variant="ghost"
          size="sm"
        >
          Back to Home
        </Button>
        <Heading mb="4">📄 Summary Report</Heading>
        <Box w="90px" />
      </Flex>

      {/* Controls */}
      <Flex justify="space-between" mb="6" align="center" wrap="wrap">
        <Box>
          <Text fontSize="xl" fontWeight="bold">🔬 {labDetails.labName}</Text>
          <Text fontSize="sm">{labDetails.address}</Text>
        </Box>
        <Flex gap="4" align="center" mt={{ base: 4, md: 0 }}>
          <Switch isChecked={showRanges} onChange={e => setShowRanges(e.target.checked)} />
          <Text fontSize="sm">Show Ranges</Text>
          <Switch isChecked={showNotes} onChange={e => setShowNotes(e.target.checked)} />
          <Text fontSize="sm">Show Notes</Text>
        </Flex>
      </Flex>

      <Box className="report-header-ui" mb="6">
        <Divider mt="1" />
        <Flex justify="space-between" mt="2">
          <Box textAlign="left">
            <Text><strong>Name:</strong> {patient.name}</Text>
            <Text><strong>Age:</strong> {patient.age} • <strong>Gender:</strong> {patient.gender}</Text>
            <Text><strong>Mobile:</strong> {patient.mobile}</Text>
          </Box>
          <Box textAlign="right">
            <Text><strong>Referred By:</strong> {patient.referredBy}</Text>
            <Text><strong>Sample Collected On:</strong> {patient.sampleDate}</Text>
          </Box>
        </Flex>
        <Divider mt="1" />
      </Box>

      {/* Printable Section */}
      <Box id="printable-section" ref={contentRef} width="794px" minHeight="1123px" fontSize="xs" mx="auto"  bg="white">
        {selectedGroups.map((group, index) => (
          <Box key={group.id} style={{ pageBreakAfter: 'always' }}>
            {/* Repeatable Header */}
            <Box className="report-header-print" mb="6">
              <Box textAlign="center">
                <Heading fontSize="2xl" fontWeight="bold">{labDetails.labName}</Heading>
                <Text fontSize="sm">{labDetails.subHeading}</Text>
              </Box>
              <Divider mt="4" />
              <Flex justify="space-between" align="center">
                <Box textAlign="left">
                  <Text fontSize="sm">{labDetails.address}</Text>
                  <Text fontSize="sm">Phone: {labDetails.phone}</Text>
                  <Text fontSize="sm">Email: {labDetails.email}</Text>
                </Box>
                <Box textAlign="right">
                  <Text fontWeight="semibold" fontSize="sm">{labDetails.specialistName}</Text>
                  <Text fontSize="sm">{labDetails.specialistQualification}</Text>
                </Box>
              </Flex>
              <Divider mt="2" />
              <Flex justify="space-between" mt="2">
                <Box textAlign="left">
                  <Text><strong>Name:</strong> {patient.name}</Text>
                  <Text><strong>Age:</strong> {patient.age} • <strong>Gender:</strong> {patient.gender}</Text>
                  <Text><strong>Mobile:</strong> {patient.mobile}</Text>
                </Box>
                <Box textAlign="right">
                  <Text><strong>Referred By:</strong> {patient.referredBy}</Text>
                  <Text><strong>Sample Collected On:</strong> {patient.sampleDate}</Text>
                </Box>
              </Flex>
              <Divider mt="2" />
            </Box>

            {/* Results Table */}
            <Box textAlign="center">
              <Heading size="md" mb="4">{group.name}</Heading>
              <Box overflowX="auto">
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ backgroundColor: '#f0f0f0', textAlign: 'center' }}>
                      <th style={{ padding: '8px', borderBottom: '2px solid #ccc' }}>Test Description</th>
                      <th style={{ padding: '8px', borderBottom: '2px solid #ccc' }}>Observed Value</th>
                      <th style={{ padding: '8px', borderBottom: '2px solid #ccc' }}>Reference Range / Units</th>
                    </tr>
                  </thead>
                  <tbody>
                    {group.subGroups.map(sub => (
                      <>
                        <tr>
                          <td colSpan="1" style={{ fontWeight: 'bold', textDecoration: 'underline', backgroundColor: '#fff', padding: '8px', borderBottom: '1px solid #ccc' }}>{sub.name}</td>
                          <td colSpan="2" style={{ borderBottom: '1px solid #ccc' }}></td>
                        </tr>
                        {sub.parameters.map(param => {
                          const val = parseFloat(results[param.id]);
                          const range = Object.entries(param.ranges).map(([type, r]) => `${r.min}–${r.max}`).join(' | ');
                          const abnormal = isAbnormal(val, param);
                          const textColor = abnormal ? 'red' : 'green';

                          return (
                            <tr key={param.id}>
                              <td style={{ padding: '8px', borderBottom: '1px solid #ddd' }}>{param.name}</td>
                              <td style={{ padding: '8px', borderBottom: '1px solid #ddd', color: textColor, fontWeight: 'bold' }}>
                                {isNaN(val) ? '-' : val}
                              </td>
                              <td style={{ padding: '8px', borderBottom: '1px solid #ddd' }}>
                                {showRanges && `${range} `}
                                {param.unit && `(${param.unit})`}
                                {showNotes && param.note && (
                                  <div style={{ fontSize: '0.8em', color: '#666', marginTop: '4px' }}>💬 {param.note}</div>
                                )}
                              </td>
                            </tr>
                          );
                        })}
                      </>
                    ))}
                  </tbody>
                </table>
              </Box>

              {/* Signature */}
              <Box className="lab-signature">
              <Flex justify="flex-end" align="right" mt="6">
                {labDetails.signature && (
                  <img src={labDetails.signature} alt="Lab Signature" style={{ maxWidth: '105px', marginTop: '12px' }} />
                )}
              </Flex>
              <Text fontStyle="italic" textAlign="right" fontSize="sm">
                Digitally signed by {labDetails.labName}
              </Text>
              </Box>
            </Box>
          </Box>
        ))}
      </Box>

      {/* Print & Share */}
      <Box position="sticky" bottom="0" bg="white" p="4" borderTop="1px solid #e2e8f0" display="flex" justifyContent="space-around" flexWrap="wrap">
        <Button colorScheme="blue" onClick={handlePrint}>🖨️ Print / Save PDF</Button>
        <Button
          colorScheme="green"
          onClick={() => {
            const link = `https://wa.me/?text=${encodeURIComponent(`Patient Report for ${patient.name}`)}`;
            window.open(link, '_blank');
          }}
        >
          📤 Send via WhatsApp
        </Button>
      </Box>
    </Box>
  );
};

export default SummaryReport;
