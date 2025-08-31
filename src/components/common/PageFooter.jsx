import React from 'react';
import { Flex, Button } from '@chakra-ui/react';

export default function PageFooter({
  onSaveClose,
  onSaveContinue,
  saveCloseLabel = '💾 Save & Close',
  saveContinueLabel = '✅ Save & Continue',
}) {
  return (
    <Flex
      position="fixed"
      bottom="0"
      left="0"
      right="0"
      p="4"
      bg="white"
      borderTop="1px solid"
      borderColor="gray.200"
      zIndex="100"
      //justify="space-between"
      wrap="nowrap"
      //minH="56px"
      gap="4"
    >
      {onSaveClose && <Button variant="outline" onClick={onSaveClose}>
        {saveCloseLabel}
      </Button>}
      {onSaveContinue && <Button colorScheme="blue" onClick={onSaveContinue}>
        {saveContinueLabel}
      </Button>}
    </Flex>
  );
}
