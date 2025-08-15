import React, { useState, useRef, useEffect } from 'react';
import {
  Box, Heading, Text, VStack, Button, Flex,
  Switch, Divider
} from '@chakra-ui/react';
import { useReactToPrint } from 'react-to-print';
import {
  getPatientById, getSelectedTests, getTestResults,
  getTestGroups, getLabDetails
} from '@/services/dbService';
import PageHeader from '../common/PageHeader';

const SummaryReport = () => {
  const contentRef = useRef(null);
  const handlePrint = useReactToPrint({ contentRef });

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
      window.document.title = pat.name; // TODO: Find a better way to set the document title
    });
  }, [preloadId]);

  const selectedGroups = groups.filter(g => selectedTests?.includes(g.id));
  const getRange = (ranges, gender) => ranges[gender] || ranges["Common"];
  const isAbnormal = (val, param) => {
    const range = getRange(param.ranges, patient.gender);
    return val < range?.min || val > range?.max;
  };

  return (
    <Box p="4">
      <PageHeader title="🧬 Select Test Groups" fallbackHome="/" />
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
          <Button colorScheme="blue" onClick={handlePrint}>
            🖨️ Print / Save PDF
          </Button>
          <Button
            colorScheme="green"
            onClick={() => {
              const link = `https://wa.me/?text=${encodeURIComponent(`Patient Report for ${patient.name}`)}`;
              window.open(link, '_blank');
            }}
          >
            📤 Send to WhatsApp
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
        <Box id="printable-section" fontFamily="'Garamond', serif" ref={contentRef} width="794px" minHeight="1123px" fontSize="xs" mx="auto"  bg="white">
          {selectedGroups.map((group, index) => (
            <Box key={group.id} style={{ pageBreakAfter: 'always', position: 'relative', minHeight: '1105px' }}>
              {/* Repeatable Header */}
              <Box className="report-header-print" mb="2" mt="4">
                <Box textAlign="center">
                  <Heading fontSize="2xl" fontWeight="bold">{labDetails.labName}</Heading>
                  <Text fontSize="sm">{labDetails.subHeading}</Text>
                </Box>
                <Flex justify="space-between" align="center">
                  <Box textAlign="left" p="1">
                    <Text>{labDetails.address}</Text>
                    <Text>Phone: {labDetails.phone}</Text>
                    {labDetails.email && (
                      <Text>Email: {labDetails.email}</Text>
                    )} 
                  </Box>
                  <Box textAlign="right" p="1">
                    <Text fontWeight="semibold">{labDetails.specialistName}</Text>
                    <Text>{labDetails.specialistQualification}</Text>
                  </Box>
                </Flex>
                <Box border="1px solid #444" borderRadius="md" p="1" mt="1" mb="1">
                  <Flex justify="space-between" >
                    <Box textAlign="left">
                      <Text><strong>Patient's Name:</strong> {patient.name}</Text>
                      <Text><strong>Age:</strong> {patient.age} • <strong>Gender:</strong> {patient.gender}</Text>
                      {patient.mobile && (
                        <Text><strong>Mobile:</strong> {patient.mobile}</Text>
                      )}
                    </Box>
                    <Box textAlign="right">
                      <Text><strong>Referred By:</strong> {patient.referredBy}</Text>
                      <Text><strong>Sample Collected On:</strong> {patient.sampleDate}</Text>
                    </Box>
                  </Flex>
                </Box>
              </Box>
  
              {/* Results Table */}
              <Box textAlign="center">
                <Heading size="md" mt="4" mb="2">{group.name}</Heading>
                <Box overflowX="auto">
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr style={{ textDecoration: 'underline', borderBottom: '2px solid #ccc'}}>
                        <th style={{ padding: '4px'}}>TEST DESCRIPTION</th>
                        <th style={{ padding: '4px'}}>OBSERVED VALUE</th>
                        {group.hasRanges && (
                          <th style={{ padding: '4px'}}>REFERENCE RANGE</th>
                        )}
                      </tr>
                    </thead>
                    <tbody>
                      {group.subGroups.map(sub => (
                        <>
                          <tr>
                            <td colSpan="1" style={{ fontWeight: 'bold', textDecoration: 'underline',
                              backgroundColor: '#fff', padding: '4px', borderBottom: '1px solid #ccc' }}>
                              {sub.name}
                            </td>
                            <td colSpan="2" style={{ borderBottom: '1px solid #ccc' }}></td>
                          </tr>
                          {sub.parameters.map(param => {
                            const isFloat = (val) => {
                              const parsed = parseFloat(val);
                              return !isNaN(parsed) && String(parsed) === val.trim();
                            };
                            const valFloat = isFloat(results[param.id]);
                            const val = valFloat ? parseFloat(results[param.id]) : results[param.id];
                            const range = Object.entries(param.ranges).map(([type, r]) => `${r.min}–${r.max}`).join(' | ');
                            const abnormal = valFloat ? isAbnormal(val, param) : false;
                            const textColor = abnormal ? 'red' : 'green';
                            const fontWeight = abnormal ? 'bold' : '';
  
                            return (
                              <tr key={param.id}>
                                <td style={{ padding: '4px', borderBottom: '1px solid #ddd' }}>{param.name}</td>
                                <td style={{ padding: '4px', borderBottom: '1px solid #ddd', color: textColor, fontWeight: fontWeight }}>
                                  {val ? val : '-'}
                                </td>
                                {group.hasRanges && (
                                  <td style={{ padding: '4px', borderBottom: '1px solid #ddd' }}>
                                    {showRanges && `${range} `}
                                    {param.unit && `(${param.unit})`}
                                    {showNotes && param.note && (
                                      <div style={{ fontSize: '0.8em', color: '#666', marginTop: '4px' }}>💬 {param.note}</div>
                                    )}
                                  </td>
                                )}
                              </tr>
                            );
                          })}
                        </>
                      ))}
                    </tbody>
                  </table>
                  {group.desc && (
                    <Box mt="8" px="4">
                      <Heading size="sm" mb="2" textAlign="left">Interpretation & Remark:</Heading>
                      <Text fontSize="sm" color="gray.700" whiteSpace="pre-line" textAlign="left">
                        {group.desc}
                      </Text>
                    </Box>
                  )}
                </Box>
                <Box mt="8" px="4">
                  <Heading size="sm" mb="2" >-- End Of Report --</Heading>
                </Box>
                {/* Signature */}
                <Box
                  position="absolute"
                  bottom="20px"
                  left="0"
                  right="0"
                  px="40px"
                >
                  <Flex justify="space-between" align="flex-start" gap="6">
                    {/* Technologist Signature Section */}
                    <Box textAlign="left">
                      <Text fontSize="sm" mt="2">Please Corelate Clinically.</Text>
                      <Box minHeight="70px" width="160px" />
                      <Text fontWeight="semibold" fontSize="sm" mb="2">
                        Technologist
                      </Text>
                      
                    </Box>

                    {/* Digital Lab Signature Section */}
                    <Box flex="none" textAlign="right" minWidth="150px">
                      {labDetails.signature && (
                        <img
                          src={labDetails.signature}
                          alt="Lab Signature"
                          style={{
                            maxWidth: '105px',
                            marginBottom: '4px',
                            display: 'block',
                            marginLeft: 'auto' // 👈 Pushes the image all the way to the right
                          }}
                        />
                      )}
                      <Text fontWeight="semibold" fontSize="sm" style={{ marginLeft: 'auto' }}>
                        {labDetails.doctorName}
                      </Text>
                      <Text fontSize="sm" style={{ marginLeft: 'auto' }}>
                        {labDetails.doctorQualification}
                      </Text>
                    </Box>
                  </Flex>
                </Box>
              </Box>
            </Box>
          ))}
        </Box>
      </Box>
    </Box>
  );
};

export default SummaryReport;
