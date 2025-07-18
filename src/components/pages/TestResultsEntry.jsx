import React, { useState, useEffect } from 'react';
import {
  Box, Heading, Text, VStack, Button, Input,
  Modal, ModalOverlay, ModalContent, ModalHeader,
  ModalBody, ModalFooter, Checkbox, CheckboxGroup,
  Divider
} from '@chakra-ui/react';

import { useNavigate } from 'react-router-dom';

const TestResultsEntry = () => {
  const navigate = useNavigate();
  const [patient, setPatient] = useState(() => JSON.parse(localStorage.getItem('currentPatient') || '{}'));
  const [groups, setGroups] = useState(() => JSON.parse(localStorage.getItem('testGroups') || '[]'));
  const [results, setResults] = useState(() => JSON.parse(localStorage.getItem('testResults') || '{}'));
  const [showTestModal, setShowTestModal] = useState(false);
  const [selectedTests, setSelectedTests] = useState(patient.selectedTests || []);

  const selectedGroups = groups.filter(group => selectedTests.includes(group.id));

  const getRange = (param) => param.ranges[patient.gender] || param.ranges.Common || {};
  const isAbnormal = (value, param) => {
    const range = getRange(param);
    return value < range.min || value > range.max;
  };

  const handleSaveTests = () => {
    const updatedPatient = { ...patient, selectedTests };
    localStorage.setItem('currentPatient', JSON.stringify(updatedPatient));
    setPatient(updatedPatient);
    setShowTestModal(false);
  };

  const handleChangeResult = (paramId, value) => {
    const updated = { ...results, [paramId]: value };
    setResults(updated);
    localStorage.setItem('testResults', JSON.stringify(updated));
  };

  const handleSaveAndContinue = () => {
    localStorage.setItem('testResults', JSON.stringify(results));
    navigate('/summary');
  };

  return (
    <Box p="6" maxW="900px" mx="auto">
      <Heading mb="4">🧬 Enter Test Results</Heading>

      {/* Patient Details */}
      <Box mb="6">
        <Text><strong>Name:</strong> {patient.name}</Text>
        <Text><strong>Age:</strong> {patient.age}</Text>
        <Text><strong>Gender:</strong> {patient.gender}</Text>
        <Text><strong>Mobile:</strong> {patient.mobile}</Text>
        <Text><strong>Sample Type:</strong> {patient.sampleType}</Text>
        <Text><strong>Referred By:</strong> {patient.referredBy}</Text>
      </Box>

      {/* Selected Tests */}
      <Box mb="6">
        <Heading size="md" mb="2">🧾 Selected Tests</Heading>
        <VStack align="start" spacing="2">
          {selectedGroups.map(group => (
            <Box key={group.id}>
              <Text fontWeight="bold">{group.name}</Text>
              <Text fontSize="sm" color="gray.600">
                {group.subGroups.map(sub => sub.name).join(', ')}
              </Text>
            </Box>
          ))}
        </VStack>
        <Button mt="4" size="sm" colorScheme="blue" onClick={() => setShowTestModal(true)}>
          ✏️ Modify Selected Tests
        </Button>
      </Box>

      <Divider mb="6" />

      {/* Test Results Entry */}
      {selectedGroups.map(group => (
        <Box key={group.id} mb="10">
          <Heading size="md" mb="4">{group.name}</Heading>
          {group.subGroups.map(sub => (
            <Box key={sub.name} mb="6">
              <Text fontWeight="bold" textDecoration="underline" mb="2">{sub.name}</Text>
              <VStack spacing="3" align="stretch">
                {sub.parameters.map(param => {
                  const val = parseFloat(results[param.id]);
                  const abnormal = isAbnormal(val, param);
                  const range = getRange(param);

                  return (
                    <Box key={param.id}>
                      <Text fontWeight="semibold">{param.name}</Text>
                      <Input
                        type="number"
                        value={results[param.id] || ''}
                        onChange={e => handleChangeResult(param.id, e.target.value)}
                        borderColor={abnormal ? 'red.400' : 'green.400'}
                        fontWeight="bold"
                      />
                      <Text fontSize="sm" color="gray.600">
                        Range: {range.min} – {range.max} {param.unit && `(${param.unit})`}
                      </Text>
                      {param.note && (
                        <Text fontSize="xs" color="gray.500">💬 {param.note}</Text>
                      )}
                    </Box>
                  );
                })}
              </VStack>
            </Box>
          ))}
        </Box>
      ))}

      {/* Test Selection Modal */}
      <Modal isOpen={showTestModal} onClose={() => setShowTestModal(false)}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Select / Deselect Tests</ModalHeader>
          <ModalBody>
            <CheckboxGroup value={selectedTests} onChange={setSelectedTests}>
              <VStack align="start" spacing="3">
                {groups.map(group => (
                  <Checkbox key={group.id} value={group.id}>
                    {group.name}
                  </Checkbox>
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
      {/* ✅ Save Button */}
      <Box textAlign="right" mt="6">
        <Button colorScheme="blue" onClick={handleSaveAndContinue}>
          ✅ Save & Continue
        </Button>
      </Box>
    </Box>
  );
};

export default TestResultsEntry;
