import React, { useState, useEffect } from 'react';
import {
  Box, Heading, Input, Textarea, Button,
  FormControl, FormLabel, VStack
} from '@chakra-ui/react';
import { getLabDetails, putLabDetails } from '@/services/dbService';
import SignatureField from '../common/SignatureField';
import PageHeader from '../common/PageHeader';
import PageFooter from '../common/PageFooter';
import { useNavigate } from 'react-router-dom';

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
  const navigate = useNavigate();

  useEffect(() => {
    getLabDetails().then((stored) => {
      if (stored) setDetails(stored);
    });
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setDetails(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    // Validate that all fields except email are filled
    const emptyFields = Object.entries(details)
      .filter(([key, value]) => key !== 'email' && !String(value).trim())
      .map(([key]) => key);

    if (emptyFields.length > 0) {
      alert(`❌ Please fill all required fields: ${emptyFields.join(', ')}`);
      return;
    }

    await putLabDetails(details);
    alert('✅ Lab details saved!');
    navigate('/');
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
    <Box p="6" maxW="800px" mx="auto" pb="24">
      <PageHeader title="🏥 Enter Lab Details" fallbackHome="/" />
      <VStack spacing="5" align="stretch">
        {[
          ['Lab Name', 'labName'], ['Sub Heading', 'subHeading'],
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

        <FormControl isRequired>
          <FormLabel>Address</FormLabel>
          <Textarea name="address" value={details.address} onChange={handleChange} />
        </FormControl>

        <FormControl isRequired>
          <SignatureField
            label="Authorized Signature"
            value={details.signature}
            onChange={(sig) => setDetails(prev => ({ ...prev, signature: sig }))}
          />
        </FormControl>

        <Button colorScheme="green" onClick={handleExport}>📤 Export to JSON</Button>

        <FormControl>
          <FormLabel>📥 Import from JSON</FormLabel>
          <Input type="file" accept=".json" onChange={handleImport} />
        </FormControl>

      </VStack>
      <PageFooter
        onSaveContinue={handleSave}
        saveContinueLabel = "💾 Save Lab Details & Close"
      />
    </Box>
  );
};

export default LabDetails;
