import React, { useRef } from 'react';
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  HStack,
  Image,
  Input,
  Text,
  VStack,
  useToast
} from '@chakra-ui/react';
import SignaturePad from 'react-signature-pad-wrapper';

export default function SignatureField({ label = 'Signature', value, onChange }) {
  const sigPadRef = useRef(null);
  const toast = useToast();

  const handleClear = () => {
    sigPadRef.current.clear();
    onChange('');
  };

  const handleSaveDrawn = () => {
    if (sigPadRef.current.isEmpty()) {
      toast({ status: 'warning', title: 'Signature is empty', duration: 2000 });
      return;
    }
    // Get base64 PNG data
    const dataURL = sigPadRef.current.toDataURL('image/png');
    onChange(dataURL);
    toast({ status: 'success', title: 'Signature captured', duration: 1500 });
  };

  const handleUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => onChange(reader.result);
    reader.readAsDataURL(file);
  };

  return (
    <FormControl>
      <FormLabel>{label}</FormLabel>
      <VStack align="start" spacing={4} w="full">
        {/* Draw Option */}
        <Box border="1px solid #ccc" borderRadius="md" p={2}>
          <SignaturePad
            ref={sigPadRef}
            options={{
              minWidth: 1.5,
              maxWidth: 3,
              penColor: 'black',
              backgroundColor: 'white' // Ensures white background for printing
            }}
          />
          <HStack mt={2} spacing={3}>
            <Button size="sm" colorScheme="blue" onClick={handleSaveDrawn}>
              Save Drawn Signature
            </Button>
            <Button size="sm" onClick={handleClear}>
              Clear
            </Button>
          </HStack>
        </Box>

        <Text fontSize="sm" color="gray.500">or upload from file</Text>

        {/* Upload Option */}
        <Input type="file" accept="image/*" onChange={handleUpload} size="sm" />

        {/* Preview */}
        {value && (
          <Box mt={2}>
            <Text fontSize="sm">Signature Preview:</Text>
            <Image
              src={value}
              alt="Signature"
              maxW="200px"
              mt={2}
              border="1px solid #eee"
              borderRadius="md"
            />
          </Box>
        )}
      </VStack>
    </FormControl>
  );
}
