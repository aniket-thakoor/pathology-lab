import React, { useState, useEffect } from 'react';
import {
  Box, Flex, Heading, Input, Select, Button, VStack,
  Text, List, ListItem, useToast, FormControl, FormLabel, Checkbox
} from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
import {
  getAllPatients,
  getPatientById,
  putPatient,
  getTestGroups
} from '@/services/dbService';

const PatientEntry = () => {
  const navigate = useNavigate();
  const toast = useToast();

  const [patients, setPatients] = useState([]);
  const [tests, setTests] = useState([]);
  const [form, setForm] = useState({
    name: '',
    gender: 'Male',
    isNewBorn: false,
    age: '',
    mobile: '',
    email: '',
    referredBy: '',
    consultantDoctor: '',
    sampleDate: ''
  });

  const [editingId, setEditingId] = useState(null);
  const [matchOptions, setMatchOptions] = useState([]);

  useEffect(() => {
    const preloadId = sessionStorage.getItem('editPatientId');
    if (preloadId) {
      loadPatient(preloadId);
      setEditingId(preloadId);
    }
    fetchPatients();
    fetchTestGroups();
  }, []);

  const fetchPatients = async () => {
    const data = await getAllPatients();
    setPatients(data);
  };

  const fetchTestGroups = async () => {
    const data = await getTestGroups();
    setTests(data);
  };

  const loadPatient = async (id) => {
    const p = await getPatientById(id);
    if (p) setForm(p);
  };

  const handleChange = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const handleSelectMatch = (p) => {
    setForm({ ...p });
    sessionStorage.setItem('editPatientId', p.id);
    setEditingId(p.id);
    toast({ title: 'Patient loaded from history', status: 'info' });
    setMatchOptions([]);
  };

  const savePatient = async (status = 'pending', navigateNext = false) => {
    const patientId = editingId || form.id || Date.now().toString();
    const payload = {
      ...form,
      id: patientId,
      status,
      updatedAt: new Date().toISOString(),
      testResults: form.testResults || {}
    };

    await putPatient(payload);
    sessionStorage.setItem('editPatientId', patientId);
    toast({ title: 'Patient saved', status: 'success' });

    if (navigateNext) {
      navigate('/select-tests');
    } else {
      setForm({
        name: '',
        gender: '',
        isNewBorn: false,
        age: '',
        mobile: '',
        email: '',
        referredBy: '',
        consultantDoctor: '',
        sampleDate: ''
      });
      setEditingId(null);
      sessionStorage.removeItem('editPatientId');
      fetchPatients();
    }
  };

  const handleSubmit = () => {
    const { name, gender, age, mobile, referredBy } = form;
    if (!name || !gender || !age || !mobile || !referredBy) {
      toast({ title: 'Please fill all required fields.', status: 'warning' });
      return;
    }
    savePatient('active', true);
  };

  const handleSaveOnly = () => {
    if (!form.name || !form.mobile) {
      toast({ title: 'Enter at least name & mobile to save.', status: 'warning' });
      return;
    }
    savePatient('pending', false);
  };

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

  return (
    <Box p="6" maxW="800px" mx="auto">
      <Heading mb="6">👤 Patient Entry</Heading>

      <VStack spacing="5" align="stretch">
        <FormControl isRequired>
          <FormLabel>Name</FormLabel>
          <Input value={form.name} onChange={e => handleChange('name', e.target.value)} />
        </FormControl>

        <Flex gap="4" wrap="wrap">
          <FormControl isRequired>
            <FormLabel>Gender</FormLabel>
            <Select value={form.gender} onChange={e => handleChange('gender', e.target.value)} w="180px">
              <option value="Male">Male</option>
              <option value="Female">Female</option>
            </Select>
          </FormControl>

          <FormControl isRequired>
            <FormLabel>Age</FormLabel>
            <Input
              type="number"
              value={form.age}
              onChange={e => handleChange('age', e.target.value)}
              isDisabled={form.isNewBorn}
              w="140px"
            />
          </FormControl>

          <FormControl>
            <Checkbox
              isChecked={form.isNewBorn}
              onChange={e => {
                handleChange('isNewBorn', e.target.checked);
                if (e.target.checked) handleChange('age', '');
              }}
              isDisabled={!!form.age}
            >
              🍼 New Born
            </Checkbox>
          </FormControl>
        </Flex>

        <Flex gap="4" wrap="wrap">
          <Input type="tel" placeholder="Mobile Number" value={form.mobile} onChange={e => handleChange('mobile', e.target.value)} w="250px" />
          <Input type="email" placeholder="Email (optional)" value={form.email} onChange={e => handleChange('email', e.target.value)} w="250px" />
        </Flex>

        <Input placeholder="Referred By" value={form.referredBy} onChange={e => handleChange('referredBy', e.target.value)} />
        <Input placeholder="Consultant Doctor" value={form.consultantDoctor} onChange={e => handleChange('consultantDoctor', e.target.value)} />

        <FormControl>
          <FormLabel>Sample Date</FormLabel>
          <Input type="date" value={form.sampleDate} onChange={e => handleChange('sampleDate', e.target.value)} />
        </FormControl>

        {matchOptions.length > 0 && (
          <Box bg="gray.50" p="3" borderRadius="md">
            <Text fontWeight="bold" mb="2">🧠 Possible Matches</Text>
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

        {/* <Box mt="4">
          <Heading size="md" mb="2">🧾 Select Test Groups</Heading>
          <List spacing="3">
            {tests.map(test => (
              <ListItem key={test.id}>
                <Checkbox
                  isChecked={form.selectedTests.includes(test.id)}
                  onChange={() => handleCheckbox(test.id)}
                >
                  {test.name}
                </Checkbox>
              </ListItem>
            ))}
          </List>
        </Box> */}

        <Flex gap="4" mt="6">
          <Button colorScheme="blue" onClick={handleSubmit}>✅ Save & Continue</Button>
          <Button variant="outline" onClick={handleSaveOnly}>💾 Save & Close</Button>
        </Flex>
      </VStack>
    </Box>
  );
};

export default PatientEntry;
