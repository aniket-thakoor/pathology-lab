import React, { useEffect, useState } from 'react';
import {
  Box, Heading, Checkbox, List, ListItem, Button, useToast, Flex
} from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
import { getTestGroups, putSelectedTests, getSelectedTests } from '@/services/dbService';
import PageHeader from '../common/PageHeader';

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

    await putSelectedTests(preloadId, selected);

    toast({ title: 'Test groups updated.', status: 'success' });
    navigate('/results');
  };

  const handleSaveOnly = async () => {
    if (!preloadId) {
      toast({ title: 'Patient context missing.', status: 'error' });
      return;
    }

    await putSelectedTests(preloadId, selected);

    toast({ title: 'Test groups updated.', status: 'success' });
    navigate('/');
  };

  return (
    <Box p="6" maxW="600px" mx="auto">
      <PageHeader title="🧬 Select Test Groups" fallbackHome="/" />
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
      {/* Sticky Save Buttons */}
      <Flex
        position="fixed"
        bottom="0"
        left="0"
        width="100%"
        bg="white"
        p="4"
        justify="space-between"
        borderTop="1px solid"
        borderColor="gray.200"
        zIndex="10"
      >
        <Button variant="outline" onClick={handleSaveOnly} size="lg">💾 Save & Close</Button>
        <Button colorScheme="blue" onClick={handleSave} size="lg">✅ Save & Continue</Button>
      </Flex>
    </Box>
  );
};

export default SelectTestGroups;
