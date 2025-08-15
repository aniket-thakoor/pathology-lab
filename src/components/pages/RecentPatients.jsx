import React, { useState } from 'react';
import {
  Box, Heading, Input, Text, Button, List, ListItem,
  Divider, Badge, Flex
} from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
import { usePatientStorage } from '@/hooks/usePatientStorage';

const RecentPatients = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const {
    patients,
    loading,
    error,
    refresh,
    removePatient,
    modifyPatient
  } = usePatientStorage();

  const resumeTestEntry = (patient) => {
    sessionStorage.setItem('editPatientId', patient.id);
    navigate('/results');
  };
  
  const editPatientProfile = (patient) => {
    sessionStorage.setItem('editPatientId', patient.id);
    navigate('/patient');
  };
  
  const viewSummaryReport = (patient) => {
    sessionStorage.setItem('editPatientId', patient.id);
    navigate('/summary');
  };  

  const filtered = patients.filter(p => {
    const term = search.toLowerCase();
    return (
      p.name?.toLowerCase().includes(term) ||
      p.mobile?.includes(term) ||
      (p.sampleDate && p.sampleDate.includes(term))
    );
  });

  return (
    <Box p="6" maxW="800px" mx="auto">
      <Heading mb="4">🕓 Recent Patients</Heading>

      <Input
        placeholder="🔍 Search by name, mobile or sample date"
        value={search}
        onChange={e => setSearch(e.target.value)}
        mb="4"
      />

      {loading ? (
        <Text>Loading patients...</Text>
      ) : error ? (
        <Text color="red.500">Error loading patients.</Text>
      ) : filtered.length === 0 ? (
        <Text>No matching patients found.</Text>
      ) : (
        <List spacing="3">
          {filtered.map(p => (
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
                  <Button size="sm" colorScheme="teal" onClick={() => editPatientProfile(p)}>
                    ✏️ Edit Patient Info
                  </Button>
                  <Button size="sm" colorScheme="blue" onClick={() => resumeTestEntry(p)}>
                    🧪 Edit Test Results
                  </Button>
                  {p.status === 'complete' && (
                    <Button size="sm" colorScheme="gray" onClick={() => viewSummaryReport(p)}>
                      📄 View Summary Report
                    </Button>
                  )}
                </Flex>
              </Box>
            </ListItem>
          ))}
        </List>
      )}
    </Box>
  );
};

export default RecentPatients;
