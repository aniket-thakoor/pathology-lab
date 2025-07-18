import React from 'react';
import {
  Box, Heading, Text, Grid, GridItem, Button, VStack, Flex
} from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';

const Home = () => {
  const navigate = useNavigate();

  const labDetails = JSON.parse(localStorage.getItem('labDetails') || '{}');

  const quickStats = {
    patientsToday: 12,
    pendingResults: 4,
    totalTests: 38
  };

  return (
    <Box p="6">
      {/* Header Branding */}
      <Box mb="6" textAlign="center">
        <Heading size="lg" color="blue.700">🔬 {labDetails.labName}</Heading>
        <Text fontSize="md" color="gray.600">Serving precision and care since 1993</Text>
      </Box>

      {/* Quick Navigation Buttons */}
      <Grid templateColumns={{ base: "1fr", md: "repeat(2, 1fr)" }} gap="6" mb="10">
        <GridItem>
          <Button size="lg" colorScheme="blue" w="100%" onClick={() => navigate('/patient')}>
            🧍 New Patient Entry
          </Button>
        </GridItem>
        <GridItem>
          <Button size="lg" colorScheme="green" w="100%" onClick={() => navigate('/results')}>
            🧪 Enter Test Results
          </Button>
        </GridItem>
        <GridItem>
          <Button size="lg" colorScheme="purple" w="100%" onClick={() => navigate('/summary')}>
            📄 View Summary Report
          </Button>
        </GridItem>
        <GridItem>
          <Button size="lg" colorScheme="orange" w="100%" onClick={() => navigate('test-setup')}>
            ⚙️ Manage Test Setup
          </Button>
        </GridItem>
        <GridItem>
          <Button size="lg" colorScheme="teal" w="100%" onClick={() => navigate('lab-details')}>
            📝 Edit Lab Info
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
        <Box p="4" bg="green.50" borderRadius="md" flex="1">
          <Text fontSize="xl" fontWeight="bold">{quickStats.pendingResults}</Text>
          <Text>Pending Test Results</Text>
        </Box>
        <Box p="4" bg="purple.50" borderRadius="md" flex="1">
          <Text fontSize="xl" fontWeight="bold">{quickStats.totalTests}</Text>
          <Text>Total Tests Conducted</Text>
        </Box>
      </Flex>

      {/* Footer */}
      <Box mt="10" textAlign="center" color="gray.500" fontSize="sm">
        Made with ❤️ for {labDetails.labName} • {new Date().toLocaleDateString()}
      </Box>
    </Box>
  );
};

export default Home;
