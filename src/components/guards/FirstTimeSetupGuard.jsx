import { useEffect, useState } from 'react';
import {
  Alert, AlertIcon, AlertTitle, AlertDescription, Box, Button, HStack, VStack, Badge, Progress, Text, Divider, Icon,
  FormControl, FormLabel, Input, useToast
} from '@chakra-ui/react';
import { CheckCircleIcon, InfoIcon } from '@chakra-ui/icons';
import { useNavigate } from 'react-router-dom';
import { getLabDetails, getTestGroups } from '@/services/dbService';
import { restoreFromFile } from '@/services/backup';

export default function FirstTimeSetupGuard({ children }) {
  const toast = useToast();
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

  const handleRestoreFile = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      await restoreFromFile(file, 'merge');
      toast({
        title: 'Restore Complete',
        description: `${file.name} has been imported.`,
        status: 'success',
        duration: 3000,
        isClosable: true
      });
      window.location.href = '/pathology-lab/';
    } catch (err) {
      console.error(err);
      toast({
        title: 'Restore Failed',
        description: err.message || 'Error during restore.',
        status: 'error',
        duration: 3000,
        isClosable: true
      });
    }
  };

  function renderSetupUI() {
    return (
      <Box p="6" maxW="900px" mx="auto">
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

          <Progress
            value={(stepsCompleted / 2) * 100}
            size="sm"
            colorScheme="blue"
            borderRadius="md"
            w="80%"
            mb="4"
          />

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
              {labDone && <Badge colorScheme="green">Completed</Badge>}
            </HStack>

            <HStack spacing={4} justify="center" w="100%">
              <Button
                onClick={() => navigate('/test-setup')}
                colorScheme={testDone ? 'green' : 'blue'}
                variant={testDone ? 'solid' : 'outline'}
                leftIcon={testDone ? <CheckCircleIcon /> : null}
                isDisabled={!labDone}
              >
                {testDone ? 'Test Setup ✓' : 'Configure Test Setup'}
              </Button>
              {testDone && <Badge colorScheme="green">Completed</Badge>}
            </HStack>

            {stepsCompleted <= 0 && (
              <>
                <Divider my={6} />
                <FormControl w="100%" maxW="400px">
                  <FormLabel htmlFor="restoreFile" fontWeight="bold" textAlign="left">
                    Or restore from backup:
                  </FormLabel>
                  <Input
                    id="restoreFile"
                    type="file"
                    accept=".json,.txt"
                    onChange={handleRestoreFile}
                    variant="filled"
                    size="md"
                  />
                </FormControl>
              </>
            )}
          </VStack>

          <Divider my={6} />
          <Text fontSize="sm" color="gray.600" maxW="md">
            Tip: Completing these steps ensures compliance-ready reports,
            consistent templates, and error-free patient onboarding.
          </Text>
        </Alert>
      </Box>
    );
  }

  if (loading) return null;

  if (setupNeeded) {
    return <>{renderSetupUI()}</>;
  }

  return <>{children}</>;
}
