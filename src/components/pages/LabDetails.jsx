import React, { useState, useEffect } from 'react';
import {
  Box, Heading, Input, Textarea, Button,
  FormControl, FormLabel, VStack, Text, Image
} from '@chakra-ui/react';

const LabDetails = () => {
  const [details, setDetails] = useState({
    labName: '',
    subHeading: '',
    address: '',
    phone: '',
    email: '',
    specialistName: '',
    qualification: '',
    regNo: '',
    timings: '',
    signature: ''
  });

  // Load existing details if present
  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem('labDetails') || '{}');
    if (stored && Object.keys(stored).length > 0) setDetails(stored);
  }, []);

  const handleChange = (e) => {
    setDetails({ ...details, [e.target.name]: e.target.value });
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

  const handleSave = () => {
    localStorage.setItem('labDetails', JSON.stringify(details));
    alert('✅ Lab details saved successfully!');
  };

  return (
    <Box p="6" maxW="800px" mx="auto">
      <Heading mb="6">🏥 Enter Pathology Lab Details</Heading>
      <VStack spacing="4" align="stretch">
        <FormControl isRequired>
          <FormLabel>Lab Name</FormLabel>
          <Input name="labName" value={details.labName} onChange={handleChange} />
        </FormControl>

        <FormControl>
          <FormLabel>Subheading</FormLabel>
          <Input name="subHeading" value={details.subHeading} onChange={handleChange} />
        </FormControl>

        <FormControl>
          <FormLabel>Address</FormLabel>
          <Textarea name="address" value={details.address} onChange={handleChange} />
        </FormControl>

        <FormControl>
          <FormLabel>Phone</FormLabel>
          <Input name="phone" value={details.phone} onChange={handleChange} />
        </FormControl>

        <FormControl>
          <FormLabel>Email</FormLabel>
          <Input name="email" value={details.email} onChange={handleChange} />
        </FormControl>

        <FormControl>
          <FormLabel>Specialist Name</FormLabel>
          <Input name="specialistName" value={details.specialistName} onChange={handleChange} />
        </FormControl>

        <FormControl>
          <FormLabel>Qualification</FormLabel>
          <Input name="qualification" value={details.qualification} onChange={handleChange} />
        </FormControl>

        <FormControl>
          <FormLabel>Registration No.</FormLabel>
          <Input name="regNo" value={details.regNo} onChange={handleChange} />
        </FormControl>

        <FormControl>
          <FormLabel>Consulting Timings</FormLabel>
          <Input name="timings" value={details.timings} onChange={handleChange} />
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
      </VStack>
    </Box>
  );
};

export default LabDetails;
