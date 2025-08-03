import React, { useState, useEffect } from 'react';
import {
  Box, Heading, Input, Textarea, Button,
  FormControl, FormLabel, VStack, Text, Image
} from '@chakra-ui/react';
import { getLabDetails, putLabDetails } from '@/services/dbService';

const LabDetails = () => {
  const [details, setDetails] = useState({
    labName: '',
    subHeading: '',
    address: '',
    phone: '',
    email: '',
    specialistName: '',
    specialistQualification: '',
    doctorName: '',
    doctorQualification: '',
    regNo: '',
    estd: '',
    timings: '',
    signature: ''
  });

  useEffect(() => {
    getLabDetails().then((stored) => {
      if (stored) setDetails(stored);
    });
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setDetails(prev => ({ ...prev, [name]: value }));
  };

  const handleSignatureUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setDetails(prev => ({ ...prev, signature: reader.result }));
    };
    reader.readAsDataURL(file);
  };

  const handleSave = async () => {
    await putLabDetails(details);
    alert('✅ Lab details saved!');
  };

  const handleExport = () => {
    const dataStr = JSON.stringify(details, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
  
    const a = document.createElement('a');
    a.href = url;
    a.download = 'lab-details.json';
    a.click();
  
    URL.revokeObjectURL(url);
  };
  
  const handleImport = (e) => {
    const file = e.target.files[0];
    if (!file) return;
  
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = JSON.parse(reader.result);
        setDetails(prev => ({ ...prev, ...parsed }));
        alert('✅ Lab details imported!');
      } catch (err) {
        alert('❌ Failed to import. Please check JSON format.');
      }
    };
    reader.readAsText(file);
  };
  

  return (
    <Box p="6" maxW="800px" mx="auto">
      <Heading size="lg" mb="6">🏥 Enter Lab Details</Heading>
      <VStack spacing="5" align="stretch">
        {[
          ['Lab Name', 'labName'], ['Subheading', 'subHeading'],
          ['Phone', 'phone'], ['Email', 'email'],
          ['Specialist Name', 'specialistName'], ['Specialist Qualification', 'specialistQualification'],
          ['Doctor Name', 'doctorName'], ['Doctor Qualification', 'doctorQualification'],
          ['Year of Establishment.', 'estd'], ['Registration No.', 'regNo'], ['Consulting Timings', 'timings']
        ].map(([label, name]) => (
          <FormControl key={name} isRequired>
            <FormLabel>{label}</FormLabel>
            <Input name={name} value={details[name]} onChange={handleChange} />
          </FormControl>
        ))}

        <FormControl>
          <FormLabel>Address</FormLabel>
          <Textarea name="address" value={details.address} onChange={handleChange} />
        </FormControl>

        <FormControl>
          <FormLabel>Upload Signature</FormLabel>
          <Input type="file" accept="image/*" onChange={handleSignatureUpload} />
          {details.signature && (
            <Box mt="2">
              <Text fontSize="sm">Signature Preview:</Text>
              <Image src={details.signature} alt="Signature" maxW="200px" mt="2" />
            </Box>
          )}
        </FormControl>

        <Button colorScheme="blue" onClick={handleSave}>💾 Save Lab Details</Button>
        <Button colorScheme="green" onClick={handleExport}>📤 Export to JSON</Button>
      <FormControl>
        <FormLabel>📥 Import from JSON</FormLabel>
        <Input type="file" accept=".json" onChange={handleImport} />
      </FormControl>
      </VStack>
    </Box>
  );
};

export default LabDetails;
