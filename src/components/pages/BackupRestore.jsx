import { Box, Heading, VStack, Button, useToast } from '@chakra-ui/react';
import { backupNow, restoreFromFile, shareLatestNow } from '@/services/backup';
import PageHeader from '../common/PageHeader';

export default function BackupRestore() {
  const toast = useToast();

  const handleBackup = async () => {
    try {
      const { filename } = await backupNow();
      toast({
        title: 'Backup Created',
        description: `File: ${filename}`,
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (err) {
      console.error(err);
      toast({
        title: 'Backup Failed',
        description: err.message || 'An error occurred while creating the backup.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const handleRestore = async () => {
    try {
      const [fileHandle] = await window.showOpenFilePicker({
        types: [{ description: 'Backup Files', accept: { 'application/json': ['.json', '.txt'] } }]
      });
      const file = await fileHandle.getFile();
      await restoreFromFile(file, 'merge'); // or 'replace'
      toast({
        title: 'Restore Complete',
        description: `${file.name} has been imported.`,
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
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
        <Button colorScheme="green" w="100%" size="lg" onClick={handleRestore}>
          🔄 Restore
        </Button>
        <Button colorScheme="teal" w="100%" size="lg" onClick={handleShare}>
          📤 Share
        </Button>
      </VStack>
    </Box>
  );
}
