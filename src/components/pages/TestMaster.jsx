import React, { useState, useEffect } from 'react';
import {
  Box, Flex, Heading, VStack, Input, Textarea, Button, Select,
  Divider, Text, List, ListItem, IconButton, useToast, Stack, Checkbox,
  AlertDialog, AlertDialogBody, AlertDialogFooter, AlertDialogHeader,
  AlertDialogContent, AlertDialogOverlay, useDisclosure
} from '@chakra-ui/react';
import { EditIcon, DeleteIcon } from '@chakra-ui/icons';
import {
  getTestGroups, putTestGroups, addSubgroup, updateSubgroup,
  deleteSubgroup, addParameterToSubgroup,
  updateParameterInSubgroup, deleteParameterFromSubgroup
} from '@/services/dbService';
import PageHeader from '../common/PageHeader';

const TestMaster = () => {
  const toast = useToast();
  const [groups, setGroups] = useState([]);
  const [selectedGroupId, setSelectedGroupId] = useState('');
  const [selectedSubGroupId, setSelectedSubGroupId] = useState('');
  const [groupName, setGroupName] = useState('');
  const [groupDesc, setGroupDesc] = useState('');
  const [groupHasRanges, setGroupHasRanges] = useState(true);
  const [editingGroupId, setEditingGroupId] = useState('');
  const [subGroupName, setSubGroupName] = useState('');
  const [editingSubGroupId, setEditingSubGroupId] = useState('');
  const [paramName, setParamName] = useState('');
  const [paramUnit, setParamUnit] = useState('');
  const [paramNote, setParamNote] = useState('');
  const [ranges, setRanges] = useState([]);
  const [editingParamId, setEditingParamId] = useState('');
  const { isOpen, onOpen, onClose } = useDisclosure();
  const cancelRef = React.useRef();
  const [checkedFirstVisit, setCheckedFirstVisit] = useState(false);
  const selectedGroup = groups.find(g => g.id === selectedGroupId);
  const selectedSubGroup = selectedGroup?.subGroups?.find(sg => sg.id === selectedSubGroupId);

  const syncGroups = async () => {
    const updated = await getTestGroups();
    setGroups(updated);
  };

  useEffect(() => {
    getTestGroups().then(setGroups);
    async function checkFirstVisit() {
      const tests = await getTestGroups();
      if (tests.length === 0) {
        onOpen(); // prompt to load defaults
      }
      setCheckedFirstVisit(true);
    }
    checkFirstVisit();
  }, [onOpen]);

  const handleLoadDefaults = async () => {
    try {
      const res = await fetch('/data/default-tests.json');
      const defaultTests = await res.json();
      await putTestGroups(defaultTests);
      setGroups(defaultTests);
      onClose();
    } catch (err) {
      console.error('Failed to load defaults:', err);
    }
  };

  const resetAll = () => {
    setSelectedGroupId('');
    setSelectedSubGroupId('');
    setGroupName('');
    setGroupDesc('');
    setGroupHasRanges(true);
    setSubGroupName('');
    setParamName('');
    setParamUnit('');
    setParamNote('');
    setRanges([]);
    setEditingGroupId('');
    setEditingSubGroupId('');
    setEditingParamId('');
  };

  const saveGroup = async () => {
    if (!groupName.trim()) return;
    const group = {
      id: editingGroupId || Date.now().toString(),
      name: groupName,
      desc: groupDesc,
      hasRanges: groupHasRanges
    };
    !editingGroupId && (group.subGroups = []);
    const updated = editingGroupId
      ? groups.map(g => g.id === editingGroupId ? {...g, ...group} : g)
      : [...groups, group];
    await putTestGroups(updated);
    setGroups(updated);
    setGroupName('');
    setGroupDesc('');
    setGroupHasRanges(true);
    setEditingGroupId('');
    setSelectedGroupId(group.id);
    toast({ title: editingGroupId ? 'Group updated' : 'Group created', status: 'success' });
  };

  const saveSubGroup = async () => {
    if (!subGroupName || !selectedGroupId) return;
    const subgroup = {
      id: editingSubGroupId || Date.now().toString(),
      name: subGroupName
    };
    if (editingSubGroupId) {
      await updateSubgroup(selectedGroupId, subgroup);
    } else {
      subgroup.parameters = [];
      await addSubgroup(selectedGroupId, subgroup);
    }
    setSubGroupName('');
    setEditingSubGroupId('');
    await syncGroups();
    setSelectedSubGroupId(subgroup.id);
    toast({ title: editingSubGroupId ? 'Subgroup updated' : 'Subgroup created', status: 'success' });
  };

  const saveParameter = async () => {
    if (!paramName) {
      toast({ title: 'Fill all required fields', status: 'warning' });
      return;
    }
    const cleanRanges = {};
    ranges.forEach(r => {
      if (r.type && r.min && r.max) {
        cleanRanges[r.type] = {
          min: parseFloat(r.min),
          max: parseFloat(r.max),
          note: r.note || ''
        };
      }
    });
    const param = {
      id: editingParamId || Date.now().toString(),
      name: paramName,
      unit: paramUnit,
      ranges: cleanRanges,
      note: paramNote
    };
    if (editingParamId) {
      await updateParameterInSubgroup(selectedGroupId, selectedSubGroupId, param);
    } else {
      await addParameterToSubgroup(selectedGroupId, selectedSubGroupId, param);
    }
    setParamName('');
    setParamUnit('');
    setParamNote('');
    setRanges([]);
    setEditingParamId('');
    await syncGroups();
    toast({ title: editingParamId ? 'Parameter updated' : 'Parameter saved', status: 'success' });
  };

  const editGroup = g => {
    setGroupName(g.name);
    setGroupDesc(g.desc);
    setGroupHasRanges(g.hasRanges);
    setEditingGroupId(g.id);
    setSelectedGroupId(g.id);
  };

  const editSubGroup = sub => {
    setSubGroupName(sub.name);
    setEditingSubGroupId(sub.id);
    setSelectedSubGroupId(sub.id);
  };

  const editParameter = p => {
    setParamName(p.name);
    setParamUnit(p.unit);
    setParamNote(p.note);
    setEditingParamId(p.id);
    setRanges(Object.entries(p.ranges).map(([type, r]) => ({
      id: Date.now() + Math.random(),
      type,
      min: r.min,
      max: r.max,
      note: r.note || ''
    })));
  };

  const deleteGroup = async id => {
    if (!window.confirm('Delete this test group?')) return;
    const updated = groups.filter(g => g.id !== id);
    await putTestGroups(updated);
    setGroups(updated);
    setSelectedGroupId('');
    toast({ title: 'Group deleted', status: 'info' });
  };

  const handleDeleteSubGroup = async id => {
    await deleteSubgroup(selectedGroupId, id);
    setSelectedSubGroupId('');
    await syncGroups();
    toast({ title: 'Subgroup deleted', status: 'info' });
  };

  const handleDeleteParameter = async id => {
    await deleteParameterFromSubgroup(selectedGroupId, selectedSubGroupId, id);
    await syncGroups();
    toast({ title: 'Parameter deleted', status: 'info' });
  };

  const handleExport = async () => {
    const data = await getTestGroups();
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'testGroups.json';
    a.click();
    URL.revokeObjectURL(url);
  };
  
  const handleImport = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const imported = JSON.parse(event.target.result);
        await putTestGroups(imported);
        setGroups(imported);
        toast({ title: '✅ Import successful', status: 'success' });
      } catch (err) {
        toast({ title: '❌ Invalid JSON format', status: 'error' });
      }
    };
    reader.readAsText(file);
  };

  const addRangeRow = () =>
    setRanges(r => [...r, { id: Date.now(), type: 'Common', min: '', max: '', note: '' }]);

  const updateRange = (id, field, value) =>
    setRanges(r => r.map(row => row.id === id ? { ...row, [field]: value } : row));

  const removeRange = id =>
    setRanges(r => r.filter(row => row.id !== id));

  return (
    
    <>
      <Flex direction={{ base: "column", md: "row" }} wrap="wrap" p={4} gap={6}>
        {/* Sidebar: Groups */}
        <Box w={{ base: "100%", md: "320px" }} bg="gray.100" p={4} borderRadius="md">
          <PageHeader title="🧪 Test Groups" fallbackHome="/" />
          <Flex justify="space-between" gap="1" mb="6">
            <Button colorScheme="blue" onClick={handleExport}>📤 Export</Button>
            <Button colorScheme="teal" onClick={handleLoadDefaults}>📥 Defaults</Button>
            <Input type="file" id="import-json" display="none" accept=".json" onChange={handleImport} />
            <Button as="label" htmlFor="import-json" colorScheme="green">📥 Import</Button>
          </Flex>
          <List spacing={2}>
            {groups.map(g => (
              <ListItem key={g.id} p={2} bg={selectedGroupId === g.id ? "blue.100" : "white"} borderRadius="md">
                <Flex justify="space-between" align="center">
                  <Box onClick={() => setSelectedGroupId(g.id)} cursor="pointer">
                    <Text fontWeight="bold">{g.name}</Text>
                  </Box>
                  <Stack direction="row">
                    <IconButton size="sm" icon={<EditIcon />} onClick={() => editGroup(g)} />
                    <IconButton size="sm" icon={<DeleteIcon />} onClick={() => deleteGroup(g.id)} />
                  </Stack>
                </Flex>
              </ListItem>
            ))}
          </List>

          <VStack spacing={3} mt={4}>
            <Input placeholder="Group Name" value={groupName} onChange={e => setGroupName(e.target.value)} />
            <Textarea placeholder="Description" value={groupDesc} onChange={e => setGroupDesc(e.target.value)} />
            <Checkbox 
              isChecked={groupHasRanges}
              onChange={e => setGroupHasRanges(e.target.checked)}
            >
              Has Reference Range / Units?
            </Checkbox>
            <Button onClick={saveGroup}>
              {editingGroupId ? '💾 Update Group' : '➕ Create Group'}
            </Button>
            <Button size="sm" onClick={resetAll}>➕ Add Another</Button>
          </VStack>
        </Box>

        {/* Main Panel */}
        <Box flex="1" minW="300px">
          {selectedGroup && (
            <>
              <Heading size="md" mb={4}>📂 Subgroups in "{selectedGroup.name}"</Heading>
              <Button size="sm" mb={2} onClick={() => setSelectedGroupId('')}>⬅️ Back to Groups</Button>
              <List spacing={3}>
                {selectedGroup.subGroups.map(sub => (
                  <ListItem key={sub.id} p={3} bg={selectedSubGroupId === sub.id ? "green.50" : "white"} borderRadius="md"
                    border="1px" borderColor="gray.300">
                    <Flex justify="space-between" align="center">
                      <Box cursor="pointer" onClick={() => setSelectedSubGroupId(sub.id)}>
                        <Text fontWeight="bold">{sub.name}</Text>
                        <Text fontSize="sm" color="gray.500">{sub.parameters?.length || 0} parameters</Text>
                      </Box>
                      <Stack direction="row">
                        <IconButton size="sm" icon={<EditIcon />} onClick={() => editSubGroup(sub)} />
                        <IconButton size="sm" icon={<DeleteIcon />} onClick={() => handleDeleteSubGroup(sub.id)} />
                      </Stack>
                    </Flex>
                  </ListItem>
                ))}
              </List>

              <VStack spacing={3} mt={4}>
                <Input placeholder="Subgroup Name" value={subGroupName} onChange={e => setSubGroupName(e.target.value)} />
                <Button onClick={saveSubGroup}>
                  {editingSubGroupId ? '💾 Update Subgroup' : '➕ Add Subgroup'}
                </Button>
                <Button size="sm" onClick={() => setSelectedSubGroupId('')}>➕ Add Another Subgroup</Button>
              </VStack>

              <Divider my={6} />

              {selectedSubGroup && (
                <>
                  <Heading size="md" mb={4}>📊 Parameters in "{selectedSubGroup.name}"</Heading>
                  <List spacing={3}>
                    {selectedSubGroup.parameters.map(p => (
                      <ListItem key={p.id} p={3} bg="gray.50" borderRadius="md" border="1px" borderColor="gray.300">
                        <Flex justify="space-between" align="center">
                          <Box>
                            <Text fontWeight="bold">{p.name} ({p.unit})</Text>
                            <Text fontSize="sm" color="gray.500">{Object.keys(p.ranges).length} range(s)</Text>
                          </Box>
                          <Stack direction="row">
                            <IconButton size="sm" icon={<EditIcon />} onClick={() => editParameter(p)} />
                            <IconButton size="sm" icon={<DeleteIcon />} onClick={() => handleDeleteParameter(p.id)} />
                          </Stack>
                        </Flex>
                      </ListItem>
                    ))}
                  </List>

                  <VStack spacing={3} mt={4}>
                    <Input placeholder="Parameter Name" value={paramName} onChange={e => setParamName(e.target.value)} />
                    <Input placeholder="Unit (e.g. mg/dL)" value={paramUnit} onChange={e => setParamUnit(e.target.value)} />
                    <Textarea placeholder="Notes" value={paramNote} onChange={e => setParamNote(e.target.value)} />
                    <Button isDisabled={!groupHasRanges} onClick={addRangeRow}>➕ Add Range</Button>

                    {ranges.map(r => (
                      <Stack key={r.id} direction={{ base: "column", md: "row" }} spacing={3}>
                        <Select value={r.type} onChange={e => updateRange(r.id, 'type', e.target.value)}>
                          <option value="Male">Male</option>
                          <option value="Female">Female</option>
                          <option value="Common">Common</option>
                        </Select>
                        <Input placeholder="Min" type="number" value={r.min} onChange={e => updateRange(r.id, 'min', e.target.value)} />
                        <Input placeholder="Max" type="number" value={r.max} onChange={e => updateRange(r.id, 'max', e.target.value)} />
                        <Input placeholder="Note" value={r.note} onChange={e => updateRange(r.id, 'note', e.target.value)} />
                        <IconButton icon={<DeleteIcon />} onClick={() => removeRange(r.id)} />
                      </Stack>
                    ))}

                    <Button onClick={saveParameter}>
                      {editingParamId ? '💾 Update Parameter' : '💾 Save Parameter'}
                    </Button>
                    <Button size="sm" onClick={() => {
                      setEditingParamId('');
                      setParamName('');
                      setParamUnit('');
                      setParamNote('');
                      setRanges([]);
                    }}>
                      ➕ Add Another Parameter
                    </Button>
                  </VStack>
                </>
              )}
            </>
          )}
        </Box>
      </Flex>

      <AlertDialog isOpen={isOpen} leastDestructiveRef={cancelRef} onClose={onClose}>
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader fontSize="lg" fontWeight="bold">
              Load Default Test Setup?
            </AlertDialogHeader>

            <AlertDialogBody>
              No tests found. Would you like to load the default setup to get started?
            </AlertDialogBody>

            <AlertDialogFooter>
              <Button colorScheme="blue" onClick={handleLoadDefaults}>
                Yes, Load Defaults
              </Button>
              <Button ref={cancelRef} onClick={onClose} ml={3}>
                No, I'll add my own tests
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </>
  );
};

export default TestMaster;
