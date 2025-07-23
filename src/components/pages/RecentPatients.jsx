import React, { useState, useEffect } from 'react';
import {
  Box, Heading, Input, VStack, Text, Button, List, ListItem,
  Divider, Badge, Flex
} from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';

const RecentPatients = () => {
  const navigate = useNavigate();
  const [patients, setPatients] = useState([]);
  const [search, setSearch] = useState('');
  const [filtered, setFiltered] = useState([]);

  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem('patients') || '[]');
    const sorted = stored.sort((a, b) =>
      new Date(b.updatedAt || b.sampleDate || b.createdAt) -
      new Date(a.updatedAt || a.sampleDate || a.createdAt)
    );
    setPatients(sorted);
    setFiltered(sorted);
  }, []);

  useEffect(() => {
    const term = search.toLowerCase();
    const matches = patients.filter(p =>
      p.name.toLowerCase().includes(term) ||
      p.mobile.includes(term) ||
      (p.sampleDate && p.sampleDate.includes(term))
    );
    setFiltered(matches);
  }, [search, patients]);

  const resumeTestEntry = (patient) => {
    localStorage.setItem('currentPatient', JSON.stringify(patient));
    localStorage.setItem('testResults', JSON.stringify(patient.testResults || {}));
    navigate('/results');
  };

  const editPatientProfile = (patient) => {
    localStorage.setItem('currentPatient', JSON.stringify(patient));
    navigate('/patient');
  };

  const viewSummaryReport = (patient) => {
    localStorage.setItem('currentPatient', JSON.stringify(patient));
    localStorage.setItem('testResults', JSON.stringify(patient.testResults || {}));
    navigate('/summary');
  };

  return (
    <Box p="6" maxW="800px" mx="auto">
      <Heading mb="4">🕓 Recent Patients</Heading>

      <Input
        placeholder="🔍 Search by name, mobile or sample date"
        value={search}
        onChange={e => setSearch(e.target.value)}
        mb="4"
      />

      <List spacing="3">
        {filtered.length === 0 ? (
          <Text>No matching patients found.</Text>
        ) : (
          filtered.map(p => (
            <ListItem key={p.id}>
              <Box p="4" borderWidth="1px" borderRadius="md" bg="gray.50">
                <Flex justify="space-between" align="center" mb="2">
                  <Box>
                    <Text fontWeight="bold">{p.name} • {p.age} yrs</Text>
                    <Text fontSize="sm">{p.mobile} • {p.sampleDate || 'No date'}</Text>
                  </Box>
                  <Badge colorScheme={p.status === 'complete' ? 'green' : 'orange'}>
                    {p.status === 'complete' ? 'Complete' : 'Pending'}
                  </Badge>
                </Flex>
                <Divider mb="2" />
                <Flex gap="3" wrap="wrap">
                  <Button size="sm" colorScheme="blue" onClick={() => resumeTestEntry(p)}>
                    🧪 Edit Test Results
                  </Button>
                  <Button size="sm" colorScheme="teal" onClick={() => editPatientProfile(p)}>
                    ✏️ Edit Patient Info
                  </Button>
                  {p.status === 'complete' && (
                    <Button size="sm" colorScheme="gray" onClick={() => viewSummaryReport(p)}>
                      📄 View Summary Report
                    </Button>
                  )}
                </Flex>
              </Box>
            </ListItem>
          ))
        )}
      </List>
    </Box>
  );
};

export default RecentPatients;
