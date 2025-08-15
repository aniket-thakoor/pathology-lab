import { useEffect, useState } from 'react';
import {
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Box,
  Button,
  HStack,
  VStack,
  Badge,
  Progress,
  Text,
  Divider,
  Icon,
} from '@chakra-ui/react';
import { CheckCircleIcon, InfoIcon } from '@chakra-ui/icons';
import { useNavigate } from 'react-router-dom';
import { getLabDetails, getTestGroups } from '@/services/dbService';

export default function FirstTimeSetupGuard({ children }) {
  const [labDone, setLabDone] = useState(false);
  const [testDone, setTestDone] = useState(false);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    async function checkSetup() {
      const lab = await getLabDetails();
      const tests = await getTestGroups();
      setLabDone(!!lab);
      setTestDone(tests.length > 0);
      setLoading(false);
    }
    checkSetup();
  }, []);

  const stepsCompleted = [labDone, testDone].filter(Boolean).length;
  const setupNeeded = stepsCompleted < 2;

  if (loading) return null;

  if (setupNeeded) {
    return (
      <Box p="6" maxW="900px" mx="auto">
        {/* Welcome Section */}
        <Alert
          status="info"
          variant="subtle"
          flexDirection="column"
          alignItems="center"
          textAlign="center"
          borderRadius="lg"
          boxShadow="md"
          p="8"
        >
          <Icon as={InfoIcon} boxSize={8} color="blue.500" mb="4" />
          <AlertTitle fontSize="2xl" mb="2">
            Welcome to Pathological Laboratory App 🧪
          </AlertTitle>
          <AlertDescription maxW="lg" mb="4" fontSize="md">
            Before adding patient records, let’s complete the initial setup
            so everything is ready for smooth, error-proof operations.
          </AlertDescription>

          {/* Progress Indicator */}
          <Progress
            value={(stepsCompleted / 2) * 100}
            size="sm"
            colorScheme="blue"
            borderRadius="md"
            w="80%"
            mb="4"
          />

          {/* Action Buttons */}
          <VStack spacing={4} w="100%">
            <HStack spacing={4} justify="center" w="100%">
              <Button
                onClick={() => navigate('/lab-details')}
                colorScheme={labDone ? 'green' : 'blue'}
                variant={labDone ? 'solid' : 'outline'}
                leftIcon={labDone ? <CheckCircleIcon /> : null}
                w="40%"
              >
                {labDone ? 'Lab Info ✓' : 'Add Lab Info'}
              </Button>
              {labDone && (
                <Badge colorScheme="green" variant="subtle" alignSelf="center">
                  Completed
                </Badge>
              )}
            </HStack>

            <HStack spacing={4} justify="center" w="100%">
              <Button
                onClick={() => navigate('/test-setup')}
                colorScheme={testDone ? 'green' : 'blue'}
                variant={testDone ? 'solid' : 'outline'}
                leftIcon={testDone ? <CheckCircleIcon /> : null}
                w="40%"
                isDisabled={!labDone}
              >
                {testDone ? 'Test Setup ✓' : 'Configure Test Setup'}
              </Button>
              {testDone && (
                <Badge colorScheme="green" variant="subtle" alignSelf="center">
                  Completed
                </Badge>
              )}
            </HStack>
          </VStack>

          {/* Friendly Nudge */}
          <Divider my={6} />
          <Text fontSize="sm" color="gray.600" maxW="md">
            Tip: Completing these steps ensures compliance-ready reports,
            consistent templates, and error-free patient onboarding.
          </Text>
        </Alert>
      </Box>
    );
  }

  // All setup done → Show main app
  return <>{children}</>;
}
