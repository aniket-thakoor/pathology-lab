import React, { useState, useEffect } from 'react';
import {
  Box, Heading, Text, Grid, GridItem, Button, Flex
} from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
import { getLabDetails, getAllPatients } from '@/services/dbService';
import FirstTimeSetupGuard from '../guards/FirstTimeSetupGuard';

const Home = () => {
  const navigate = useNavigate();
  const [labDetails, setLabDetails] = useState({});
  const [patients, setPatients] = useState({});

  useEffect(() => {
      Promise.all([
        getLabDetails(),
        getAllPatients()
      ]).then(([lab, pat]) => {
        setLabDetails(lab || {});
        setPatients(pat || {});
      });
    }, []);

  const quickStats = {
    patientsToday: 12,
    pendingResults: patients.filter ? patients.filter(p => p.status === 'pending').length : 0,
    totalTests: 38,
    totalPatients: patients.length
  };

  return (
    <FirstTimeSetupGuard>
      <Box minH="100vh" display="flex" flexDirection="column" p="6">
        {/* Header Branding */}
        <Box mb="6" textAlign="center">
          <Heading size="lg" color="blue.700">🔬 {labDetails.labName}</Heading>
          <Text fontSize="md" color="gray.600">Serving precision and care since {labDetails.estd}</Text>
        </Box>

        {/* Quick Navigation Buttons */}
        <Grid templateColumns={{ base: "1fr", md: "repeat(2, 1fr)" }} gap="6" mb="10">
          <GridItem>
            <Button size="lg" colorScheme="blue" w="100%" onClick={() => {
              sessionStorage.removeItem('editPatientId');
              navigate('/patient')
            }}>
              🧍 New Patient Entry
            </Button>
          </GridItem>
          <GridItem>
            <Button size="lg" colorScheme="purple" w="100%" onClick={() => navigate('/patients')}>
              🕓 Resume Past Entries
            </Button>
          </GridItem>
          {/* <GridItem>
            <Button size="lg" colorScheme="green" w="100%" onClick={() => navigate('/results')}>
              🧪 Enter Test Results
            </Button>
          </GridItem>
          <GridItem>
            <Button size="lg" colorScheme="purple" w="100%" onClick={() => navigate('/summary')}>
              📄 View Summary Report
            </Button>
          </GridItem> */}
          <GridItem>
            <Button size="lg" colorScheme="orange" w="100%" onClick={() => navigate('/test-setup')}>
              ⚙️ Manage Test Setup
            </Button>
          </GridItem>
          <GridItem>
            <Button size="lg" colorScheme="teal" w="100%" onClick={() => navigate('/lab-details')}>
              📝 Edit Lab Info
            </Button>
          </GridItem>
          <GridItem>
            <Button size="lg" colorScheme="green" w="100%" onClick={() => navigate('/backup-restore')}>
              💾 Backup / Restore
            </Button>
          </GridItem>
        </Grid>

        {/* Dashboard Stats */}
        <Heading size="md" mb="4">📊 Today’s Lab Overview</Heading>
        <Flex gap="6" wrap="wrap">
          <Box p="4" bg="blue.50" borderRadius="md" flex="1">
            <Text fontSize="xl" fontWeight="bold">{quickStats.patientsToday}</Text>
            <Text>Patients Registered Today</Text>
          </Box>
          <Box p="4" bg="orange.50" borderRadius="md" flex="1">
            <Text fontSize="xl" fontWeight="bold">{quickStats.pendingResults}</Text>
            <Text>Pending Test Entries</Text>
          </Box>
          <Box p="4" bg="purple.50" borderRadius="md" flex="1">
            <Text fontSize="xl" fontWeight="bold">{quickStats.totalTests}</Text>
            <Text>Total Tests Conducted</Text>
          </Box>
          <Box p="4" bg="gray.50" borderRadius="md" flex="1">
            <Text fontSize="xl" fontWeight="bold">{quickStats.totalPatients}</Text>
            <Text>Total Patients Recorded</Text>
          </Box>
        </Flex>

        {/* Footer */}
        <Box mt="auto" textAlign="center" color="gray.500" fontSize="sm">
          Made with ❤️ for {labDetails.labName} • {new Date().toLocaleDateString()}
        </Box>
      </Box>
    </FirstTimeSetupGuard>
    
  );
};

export default Home;
