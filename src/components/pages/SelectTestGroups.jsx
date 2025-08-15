import React, { useEffect, useState } from 'react';
import {
  Box, Heading, Checkbox, List, ListItem,
  Button, useToast
} from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
import { getTestGroups, putSelectedTests, getSelectedTests } from '@/services/dbService';

const SelectTestGroups = () => {
  const toast = useToast();
  const navigate = useNavigate();
  const [testGroups, setTestGroups] = useState([]);
  const [selected, setSelected] = useState([]);
  const preloadId = sessionStorage.getItem('editPatientId');

  useEffect(() => {
    if (!preloadId) return;

    Promise.all([
      getTestGroups(),
      getSelectedTests(preloadId)
    ]).then(([test, selected]) => {
      setTestGroups(test || []);
      setSelected(selected || []);
    });
  }, [preloadId]);

  const handleToggle = (id) => {
    setSelected(prev =>
      prev.includes(id) ? prev.filter(t => t !== id) : [...prev, id]
    );
  };

  const handleSave = async () => {
    if (!preloadId) {
      toast({ title: 'Patient context missing.', status: 'error' });
      return;
    }

    // await updatePatient(patientId, {
    //   selectedTests: selected,
    //   updatedAt: new Date().toISOString()
    // });

    await putSelectedTests(preloadId, selected);

    toast({ title: 'Test groups updated.', status: 'success' });
    navigate('/results');
  };

  return (
    <Box p="6" maxW="600px" mx="auto">
      <Heading mb="6">🧬 Select Test Groups</Heading>
      <List spacing="4" mb="6">
        {testGroups.map(test => (
          <ListItem key={test.id}>
            <Checkbox
              isChecked={selected.includes(test.id)}
              onChange={() => handleToggle(test.id)}
            >
              {test.name}
            </Checkbox>
          </ListItem>
        ))}
      </List>

      <Button colorScheme="blue" onClick={handleSave}>
        ✅ Save & Proceed to Results
      </Button>
    </Box>
  );
};

export default SelectTestGroups;
