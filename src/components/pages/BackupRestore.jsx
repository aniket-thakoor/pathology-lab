import {
  Box,
  Heading,
  VStack,
  Button,
  useToast,
  FormControl,
  FormLabel,
  Input
} from '@chakra-ui/react';
import { backupNow, restoreFromFile, shareLatestNow } from '@/services/backup';
import PageHeader from '../common/PageHeader';
import { useRef } from 'react';

export default function BackupRestore() {
  const toast = useToast();
  const fileInputRef = useRef(null);

  const handleBackup = async () => {
    try {
      const { filename } = await backupNow();
      toast({
        title: 'Backup Created',
        description: `File: ${filename}`,
        status: 'success',
        duration: 3000,
        isClosable: true
      });
    } catch (err) {
      console.error(err);
      toast({
        title: 'Backup Failed',
        description: err.message || 'An error occurred while creating the backup.',
        status: 'error',
        duration: 3000,
        isClosable: true
      });
    }
  };

  const handleRestoreFile = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      await restoreFromFile(file, 'merge'); // or 'replace'
      toast({
        title: 'Restore Complete',
        description: `${file.name} has been imported.`,
        status: 'success',
        duration: 3000,
        isClosable: true
      });
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

  const handleShare = async () => {
    try {
      await shareLatestNow();
      toast({ title: 'Backup shared', status: 'success' });
    } catch (err) {
      toast({ title: 'Share failed', description: err.message, status: 'error' });
    }
  };

  return (
    <Box p={6} minH="100vh">
      <PageHeader title="Backup / Restore" fallbackHome="/" />
      <VStack spacing={4}>
        <Button colorScheme="blue" w="100%" size="lg" onClick={handleBackup}>
          💾 Backup
        </Button>

        <FormControl>
          <FormLabel htmlFor="restoreFile">🔄 Restore</FormLabel>
          <Input
            id="restoreFile"
            type="file"
            accept=".json,.txt"
            onChange={handleRestoreFile}
            ref={fileInputRef}
            variant="filled"
            size="lg"
          />
        </FormControl>

        <Button colorScheme="teal" w="100%" size="lg" onClick={handleShare}>
          📤 Share
        </Button>
      </VStack>
    </Box>
  );
}
