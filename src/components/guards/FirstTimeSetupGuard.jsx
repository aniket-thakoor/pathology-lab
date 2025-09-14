import { useEffect, useState } from 'react';
import {
  Alert, AlertIcon, AlertTitle, AlertDescription, Box, Button, HStack, VStack, Badge, Progress, Text, Divider, Icon,
  Modal, ModalOverlay, ModalContent, ModalHeader, ModalBody, ModalFooter,useToast
} from '@chakra-ui/react';
import { CheckCircleIcon, InfoIcon } from '@chakra-ui/icons';
import { useNavigate } from 'react-router-dom';
import { getLabDetails, getTestGroups } from '@/services/dbService';
import { restoreFromFile} from '@/services/backup';

export default function FirstTimeSetupGuard({ children }) {
  const toast = useToast();
  const [labDone, setLabDone] = useState(false);
  const [testDone, setTestDone] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showRestorePrompt, setShowRestorePrompt] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    async function checkSetup() {
      const lab = await getLabDetails();
      const tests = await getTestGroups();
      setLabDone(!!lab);
      setTestDone(tests.length > 0);
      setLoading(false);

      // If not set up, schedule restore prompt
      if (!lab || tests.length === 0) {
        setTimeout(() => setShowRestorePrompt(true), 1500);
      }
    }
    checkSetup();
  }, []);

  const stepsCompleted = [labDone, testDone].filter(Boolean).length;
  const setupNeeded = stepsCompleted < 2;

  const handleRestore = async () => {
    setShowRestorePrompt(false);
    try {
      const [fileHandle] = await window.showOpenFilePicker({
        types: [{ description: 'Backup Files', accept: { 'application/json': ['.json', '.txt'] } }]
      });
      const file = await fileHandle.getFile();
      await restoreFromFile(file, 'merge'); // or 'replace'
      alert(`✅ Restore Completed. ${file.name} has been imported.`);
      window.location.href = '/pathology-lab/';
    } catch (err) {
      console.error(err);
      toast({
        title: 'Restore Failed',
        description: err.message || 'Error during restore.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  // Helper to render the setup screen
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

          {/* Progress */}
          <Progress
            value={(stepsCompleted / 2) * 100}
            size="sm"
            colorScheme="blue"
            borderRadius="md"
            w="80%"
            mb="4"
          />

          {/* Actions */}
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

  // Helper for restore modal
  function renderRestoreModal() {
    return (
      <Modal isOpen={showRestorePrompt} onClose={() => setShowRestorePrompt(false)} isCentered>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Restore backup?</ModalHeader>
          <ModalBody>
            <Text>
              We detected this is your first time here. Do you want to restore a backup from your drive?
            </Text>
          </ModalBody>
          <ModalFooter>
            <Button colorScheme="blue" mr={3} onClick={handleRestore}>
              Yes, Restore
            </Button>
            <Button variant="ghost" onClick={() => setShowRestorePrompt(false)}>
              No, Set Up Manually
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    );
  }

  if (loading) return null;

  if (setupNeeded) {
    return (
      <>
        {renderSetupUI()}
        {stepsCompleted <= 0 && renderRestoreModal()}
      </>
    );
  }

  return <>{children}</>;

}
