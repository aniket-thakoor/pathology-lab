import React, { useState, useEffect } from 'react';
import {
  Box, Flex, Heading, Input, Select, Button, VStack,
  Text, List, ListItem, useToast, FormControl, FormLabel, Divider
} from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';

const PatientEntry = () => {
  const navigate = useNavigate();
  const toast = useToast();

  const [patients, setPatients] = useState(() => JSON.parse(localStorage.getItem('patients')) || []);
  const [tests, setTests] = useState(() => JSON.parse(localStorage.getItem('testGroups')) || []);
  const [form, setForm] = useState(() => {
    const saved = JSON.parse(localStorage.getItem('currentPatient') || 'null');
    return saved || {
      name: '',
      gender: '',
      age: '',
      referredBy: '',
      sampleDate: '',
      sampleType: '',
      mobile: '',
      email: '',
      selectedTests: []
    };
  });
  

  const [matchOptions, setMatchOptions] = useState([]);
  const [savedDoctors, setSavedDoctors] = useState(() => [
    { name: "Dr. Shah", clinic: "MediCare Lab", phone: "9876543210" },
    { name: "Dr. Mehta", clinic: "Wellness Diagnostic", phone: "9123456789" }
  ]);

  // Load recent patients
  const recentPatients = patients.slice(-5).reverse();

  // Auto-match suggestions
  useEffect(() => {
    if (form.name.length >= 3 || form.mobile.length >= 6) {
      const matches = patients.filter(p =>
        p.mobile.includes(form.mobile) || p.name.toLowerCase().includes(form.name.toLowerCase())
      );
      setMatchOptions(matches);
    } else {
      setMatchOptions([]);
    }
  }, [form.name, form.mobile, patients]);

  const handleChange = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const handleSelectMatch = (patient) => {
    setForm({ ...patient });
    setMatchOptions([]);
    toast({ title: "Patient history loaded", status: "info" });
  };

  const handleCheckbox = (testId) => {
    setForm(prev => ({
      ...prev,
      selectedTests: prev.selectedTests.includes(testId)
        ? prev.selectedTests.filter(t => t !== testId)
        : [...prev.selectedTests, testId]
    }));
  };

  const savePatient = (status = "pending", navigateNext = false) => {
    const existingPatient = JSON.parse(localStorage.getItem('currentPatient') || 'null');
  
    const patientId = form.id || (existingPatient && existingPatient.id) || Date.now().toString();
  
    const updatedPatient = {
      ...form,
      id: patientId,
      status,
      updatedAt: new Date().toISOString(),
      testResults: form.testResults || (existingPatient && existingPatient.testResults) || {}
    };
  
    // Replace patient record if already exists
    const updatedPatients = patients.filter(p => p.id !== patientId);
    updatedPatients.push(updatedPatient);
  
    localStorage.setItem('patients', JSON.stringify(updatedPatients));
    localStorage.setItem('currentPatient', JSON.stringify(updatedPatient));
    localStorage.setItem('testResults', JSON.stringify(updatedPatient.testResults)); // ✅ hydrate for next screen
  
    setPatients(updatedPatients);
    toast({ title: "Patient saved", status: "success" });
  
    if (navigateNext) {
      navigate('/results');
    } else {
      setForm({
        name: '',
        gender: '',
        age: '',
        mobile: '',
        email: '',
        referredBy: '',
        sampleDate: '',
        sampleType: '',
        selectedTests: []
      });
      localStorage.removeItem('currentPatient');
    }
  };  

  const handleSubmit = () => {
    const { name, gender, age, mobile, referredBy, sampleType, selectedTests } = form;
    if (!name || !gender || !age || !mobile || !referredBy || !sampleType || selectedTests.length === 0) {
      toast({ title: "Please fill all required fields to continue.", status: "warning" });
      return;
    }

    savePatient("active", true);
  };

  const handleSaveOnly = () => {
    if (!form.name || !form.mobile) {
      toast({ title: "Please enter at least name and mobile to save.", status: "warning" });
      return;
    }

    savePatient("pending", false);
  };

  return (
    <Box p="6" maxW="800px" mx="auto">
      <Heading mb="6">👤 Patient Entry</Heading>

      <VStack spacing="4" align="stretch">
        <Input placeholder="Full Name" value={form.name} onChange={e => handleChange('name', e.target.value)} />
        <Flex gap="4" wrap="wrap">
          <Select placeholder="Gender" value={form.gender} onChange={e => handleChange('gender', e.target.value)} w="200px">
            <option>Male</option>
            <option>Female</option>
            <option>New Born</option>
          </Select>
          <Input type="number" placeholder="Age" value={form.age} onChange={e => handleChange('age', e.target.value)} w="200px" />
        </Flex>
        <Flex gap="4" wrap="wrap">
          <Input type="tel" placeholder="Mobile Number" value={form.mobile} onChange={e => handleChange('mobile', e.target.value)} w="250px" />
          <Input type="email" placeholder="Email (optional)" value={form.email} onChange={e => handleChange('email', e.target.value)} w="250px" />
        </Flex>

        <FormControl isRequired>
          <FormLabel>Sample Collected</FormLabel>
          <Input type="date" name="sampleDate" value={form.sampleDate || ''} onChange={e => handleChange('sampleDate', e.target.value)} />
        </FormControl>

        <Select placeholder="Sample Type" value={form.sampleType} onChange={e => handleChange('sampleType', e.target.value)}>
          <option>Blood</option>
          <option>Urine</option>
          <option>Stool</option>
          <option>Swab</option>
          <option>Other</option>
        </Select>

        <Input
          placeholder="Referred By"
          value={form.referredBy}
          onChange={e => handleChange('referredBy', e.target.value)}
          list="doctorSuggestions"
        />
        <datalist id="doctorSuggestions">
          {savedDoctors.map(doc => (
            <option key={doc.phone} value={`${doc.name} (${doc.clinic})`} />
          ))}
        </datalist>

        {matchOptions.length > 0 && (
          <Box bg="gray.50" p="3" borderRadius="md">
            <Text fontWeight="bold" mb="2">🧠 Matched Patients</Text>
            <List spacing="2">
              {matchOptions.map(p => (
                <ListItem key={p.id}>
                  <Button size="sm" onClick={() => handleSelectMatch(p)}>
                    {p.name} • {p.mobile} • {p.age} yrs
                  </Button>
                </ListItem>
              ))}
            </List>
          </Box>
        )}

        <Box mt="4">
          <Heading size="md" mb="3">✅ Select Test Groups</Heading>
          {tests.length === 0 ? (
            <Text>No test groups available.</Text>
          ) : (
            <List spacing="2">
              {tests.map(test => (
                <ListItem key={test.id}>
                  <label>
                    <input
                      type="checkbox"
                      checked={form.selectedTests.includes(test.id)}
                      onChange={() => handleCheckbox(test.id)}
                    />{' '}
                    {test.name}
                  </label>
                </ListItem>
              ))}
            </List>
          )}
        </Box>

        <Flex gap="4">
          <Button colorScheme="blue" onClick={handleSubmit}>✅ Save & Continue</Button>
          <Button variant="outline" onClick={handleSaveOnly}>💾 Save & Close</Button>
        </Flex>

        {recentPatients.length > 0 && (
          <Box mt="6" bg="gray.50" p="4" borderRadius="md">
            <Heading size="sm" mb="2">🕓 Recently Added Patients</Heading>
            <List spacing="2">
              {recentPatients.map(p => (
                <ListItem key={p.id}>
                  <Button size="sm" onClick={() => handleSelectMatch(p)}>
                    {p.name} • {p.age} • {p.mobile}
                  </Button>
                </ListItem>
              ))}
            </List>
          </Box>
        )}
      </VStack>
    </Box>
  );
};

export default PatientEntry;
