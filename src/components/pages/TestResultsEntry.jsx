import React, { useState, useEffect } from 'react';
import {
  Box, Heading, Text, VStack, Button, Input,
  Modal, ModalOverlay, ModalContent, ModalHeader,
  ModalBody, ModalFooter, Checkbox, CheckboxGroup,
  Divider, Flex, useToast
} from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
import { ArrowBackIcon } from '@chakra-ui/icons';
import {
  getPatientById,
  getTestGroups,
  updatePatientStatus,
  putTestResults,
  getSelectedTests,
  putSelectedTests,
  getTestResults
} from '@/services/dbService';
import PageHeader from '../common/PageHeader';

const TestResultsEntry = () => {
  const navigate = useNavigate();
  const toast = useToast();

  const [patient, setPatient] = useState(null);
  const [groups, setGroups] = useState([]);
  const [results, setResults] = useState({});
  const [selectedTests, setSelectedTests] = useState([]);
  const [showTestModal, setShowTestModal] = useState(false);

  const preloadId = sessionStorage.getItem('editPatientId');

  useEffect(() => {
    if (!preloadId) return;

    Promise.all([
      getPatientById(preloadId),
      getSelectedTests(preloadId),
      getTestResults(preloadId),
      getTestGroups()
    ]).then(([pat, test, res, grp]) => {
      setPatient(pat || {});
      setSelectedTests(test || []);
      setResults(res || {});
      setGroups(grp || []);
    });
  }, [preloadId]);

  const selectedGroups = groups.filter(g => selectedTests.includes(g.id));

  const getRange = (param) => {
    if (patient?.isNewBorn && param.ranges?.NewBorn) return param.ranges.NewBorn;
    if (param.ranges?.[patient?.gender]) return param.ranges[patient.gender];
    return param.ranges?.Common || {};
  };

  const isAbnormal = (value, param) => {
    const range = getRange(param);
    return value < range.min || value > range.max;
  };

  const handleChangeResult = (paramId, value) => {
    const updated = { ...results, [paramId]: value };
    setResults(updated);
  };

  const updatePatientResults = async (status) => {
    await putTestResults(patient.id, results);
    await updatePatientStatus(patient.id, status);
    toast({ title: "Results saved", status: "success" });
  };

  const handleSaveAndExit = async () => {
    await updatePatientResults("pending");
    navigate('/');
  };

  const handleSaveAndContinue = async () => {
    await updatePatientResults("complete");
    navigate('/summary');
  };

  const handleSaveTests = async () => {
    await putSelectedTests(preloadId, selectedTests)
    //setPatient(prev => ({ ...prev, selectedTests }));
    setShowTestModal(false);
  };

  const isFloat = (val) => {
    const parsed = parseFloat(val);
    return !isNaN(parsed) && String(parsed) === val.trim();
  };

  return (
    <Box minH="100vh" p="6" pb="100px">
      
        <PageHeader title="🧪 Enter Test Results" fallbackHome="/" />
        {/* <Box w="90px" /> */}


      {patient && (
        <>
          {/* Patient Info */}
          <Box mb="6">
            <Flex wrap="wrap" gap="2" align="center">
              <Text><strong>Name:</strong> {patient.name}</Text>
              <Text><strong>Age:</strong> {patient.age ?? '—'}</Text>
              <Text><strong>Gender:</strong> {patient.gender}</Text>
              {/* <Text><strong>Mobile:</strong> {patient.mobile}</Text>
              <Text><strong>New Born:</strong> {patient.isNewBorn ? 'Yes' : 'No'}</Text>
              <Text><strong>Referred By:</strong> {patient.referredBy}</Text>
              <Text><strong>Consultant Doctor:</strong> {patient.consultantDoctor}</Text>
              <Text><strong>Sample Date:</strong> {patient.sampleDate?.split('T')[0]}</Text> */}
            </Flex>
          </Box>

          {/* Selected Tests */}
          <Box mb="6">
            <Heading size="md" mb="2">🧬 Selected Test Groups</Heading>
            <VStack align="start" spacing="2">
              {selectedGroups.map(g => (
                <Box key={g.id}>
                  <Text >{g.name}</Text>
                  {/* <Text fontSize="sm" color="gray.600">
                    {g.subGroups.map(sg => sg.name).join(', ')}
                  </Text> */}
                </Box>
              ))}
            </VStack>
            <Button mt="4" size="sm" colorScheme="blue" onClick={() => setShowTestModal(true)}>
              ✏️ Modify Selected Tests
            </Button>
          </Box>

          <Divider mb="6" />

          {/* Result Entry */}
          {selectedGroups.map(group => (
            <Box key={group.id} mb="10">
              <Heading size="md" mb="4">{group.name}</Heading>
              {group.subGroups.map(sub => (
                <Box key={sub.id} mb="6">
                  <Text fontWeight="bold" mb="2" textDecoration="underline">{sub.name}</Text>
                  <VStack spacing="3" align="stretch">
                    {sub.parameters.map(param => {
                      const val = parseFloat(results[param.id]);
                      const abnormal = isFloat(results[param.id]) ? isAbnormal(val, param) : false;
                      const range = getRange(param);

                      return (
                        <Box key={param.id}>
                          <Text fontWeight="semibold">{param.name}</Text>
                          <Input
                            value={results[param.id] || ''}
                            onChange={e => handleChangeResult(param.id, e.target.value)}
                            borderColor={abnormal ? "red.400" : "green.400"}
                            fontWeight="bold"
                          />
                          <Text fontSize="sm" color="gray.600">
                            Range: {range.min} – {range.max} {param.unit && `(${param.unit})`}
                          </Text>
                          {param.note && (
                            <Text fontSize="xs" color="gray.500">
                              📝 {param.note}
                            </Text>
                          )}
                        </Box>
                      );
                    })}
                  </VStack>
                </Box>
              ))}
            </Box>
          ))}

          {/* Modify Tests Modal */}
          <Modal isOpen={showTestModal} onClose={() => setShowTestModal(false)}>
            <ModalOverlay />
            <ModalContent>
              <ModalHeader>Modify Selected Test Groups</ModalHeader>
              <ModalBody>
                <CheckboxGroup value={selectedTests} onChange={setSelectedTests}>
                  <VStack align="start" spacing="3">
                    {groups.map(group => (
                      <Checkbox key={group.id} value={group.id}>{group.name}</Checkbox>
                    ))}
                  </VStack>
                </CheckboxGroup>
              </ModalBody>
              <ModalFooter>
                <Button mr="3" onClick={() => setShowTestModal(false)}>Cancel</Button>
                <Button colorScheme="green" onClick={handleSaveTests}>Save</Button>
              </ModalFooter>
            </ModalContent>
          </Modal>

          {/* Sticky Save Buttons */}
          <Flex
            position="fixed"
            bottom="0"
            left="0"
            gap="4"
            bg="white"
            p="4"
            justify="space-between"
            borderTop="1px solid"
            borderColor="gray.200"
            zIndex="10"
          >
            <Button variant="outline" onClick={handleSaveAndExit}>💾 Save & Close</Button>
            <Button colorScheme="blue" onClick={handleSaveAndContinue}>✅ Save & Continue</Button>
          </Flex>

        </>
      )}
    </Box>
  );
};

export default TestResultsEntry;
