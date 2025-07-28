import React, { useState, useEffect } from 'react';
import {
  Box, Flex, Heading, VStack, Input, Textarea, Button,
  Select, Divider, Text, List, ListItem, IconButton, useToast, Stack
} from '@chakra-ui/react';
import { EditIcon, DeleteIcon } from '@chakra-ui/icons';

import {
  getTestGroups,
  putTestGroups,
  addSubgroup,
  updateSubgroup,
  deleteSubgroup,
  addParameterToSubgroup,
  updateParameterInSubgroup,
  deleteParameterFromSubgroup
} from '@/services/dbService';

const TestMaster = () => {
  const toast = useToast();

  // Groups
  const [groups, setGroups] = useState([]);
  const [selectedGroupId, setSelectedGroupId] = useState('');
  const [selectedSubGroupId, setSelectedSubGroupId] = useState('');

  const [groupName, setGroupName] = useState('');
  const [groupDesc, setGroupDesc] = useState('');
  const [editingGroupId, setEditingGroupId] = useState('');

  // Subgroups
  const [subGroupName, setSubGroupName] = useState('');
  const [editingSubGroupId, setEditingSubGroupId] = useState('');

  // Parameters
  const [paramName, setParamName] = useState('');
  const [paramUnit, setParamUnit] = useState('');
  const [paramNote, setParamNote] = useState('');
  const [ranges, setRanges] = useState([]);
  const [editingParamId, setEditingParamId] = useState('');

  useEffect(() => {
    getTestGroups().then(setGroups);
  }, []);

  const selectedGroup = groups.find(g => g.id === selectedGroupId);
  const selectedSubGroup = selectedGroup?.subGroups?.find(sg => sg.id === selectedSubGroupId);

  const syncGroups = async () => {
    const updated = await getTestGroups();
    setGroups(updated);
  };

  // Group Logic
  const saveGroup = async () => {
    if (!groupName.trim()) return;
    const group = { id: editingGroupId || Date.now().toString(), name: groupName, desc: groupDesc, subGroups: [] };
    const updated = editingGroupId
      ? groups.map(g => g.id === editingGroupId ? group : g)
      : [...groups, group];

    await putTestGroups(updated);
    setGroups(updated);
    setGroupName('');
    setGroupDesc('');
    setEditingGroupId('');
    toast({ title: editingGroupId ? 'Group updated' : 'Group created', status: 'success' });
  };

  const editGroup = (g) => {
    setGroupName(g.name);
    setGroupDesc(g.desc);
    setEditingGroupId(g.id);
    setSelectedGroupId(g.id);
  };

  const deleteGroup = async (id) => {
    if (!window.confirm('Delete this test group?')) return;
    const updated = groups.filter(g => g.id !== id);
    await putTestGroups(updated);
    setGroups(updated);
    setSelectedGroupId('');
    toast({ title: 'Group deleted', status: 'info' });
  };

  // Subgroup Logic
  const saveSubGroup = async () => {
    if (!subGroupName || !selectedGroupId) return;
    const subgroup = { id: editingSubGroupId || Date.now().toString(), name: subGroupName, parameters: [] };

    if (editingSubGroupId) {
      await updateSubgroup(selectedGroupId, subgroup);
    } else {
      await addSubgroup(selectedGroupId, subgroup);
    }
    setSubGroupName('');
    setEditingSubGroupId('');
    await syncGroups();
    toast({ title: editingSubGroupId ? 'Subgroup updated' : 'Subgroup created', status: 'success' });
  };

  const editSubGroup = (sub) => {
    setSubGroupName(sub.name);
    setEditingSubGroupId(sub.id);
    setSelectedSubGroupId(sub.id);
  };

  const handleDeleteSubGroup = async (id) => {
    await deleteSubgroup(selectedGroupId, id);
    setSelectedSubGroupId('');
    await syncGroups();
    toast({ title: 'Subgroup deleted', status: 'info' });
  };

  // Parameter Logic
  const saveParameter = async () => {
    if (!paramName || !paramUnit || ranges.length === 0) {
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

  const editParameter = (p) => {
    setParamName(p.name);
    setParamUnit(p.unit);
    setParamNote(p.note);
    setEditingParamId(p.id);
    setRanges(Object.entries(p.ranges).map(([type, range]) => ({
      id: Date.now() + Math.random(),
      type,
      min: range.min,
      max: range.max,
      note: range.note || ''
    })));
  };

  const handleDeleteParameter = async (id) => {
    await deleteParameterFromSubgroup(selectedGroupId, selectedSubGroupId, id);
    await syncGroups();
    toast({ title: 'Parameter deleted', status: 'info' });
  };

  // Range Helpers
  const addRangeRow = () => setRanges(r => [...r, { id: Date.now(), type: '', min: '', max: '', note: '' }]);
  const updateRange = (id, field, val) => setRanges(r => r.map(row => row.id === id ? { ...row, [field]: val } : row));
  const removeRange = (id) => setRanges(r => r.filter(row => row.id !== id));

  const handleExport = async () => {
    const data = await getTestGroups();
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'testGroups.json';
    link.click();
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
        toast({ title: 'Import successful', status: 'success' });
      } catch {
        toast({ title: 'Invalid JSON file', status: 'error' });
      }
    };
    reader.readAsText(file);
  };

  return (
    <Flex minH="100vh">
      {/* Sidebar */}
      <Box w="360px" p="5" bg="gray.100" borderRight="1px solid #ddd">
        <Flex justify="space-between" gap="4" mb="6">
          <Button colorScheme="blue" onClick={handleExport}>📤 Export</Button>
          <Input type="file" id="import-json" display="none" accept=".json" onChange={handleImport} />
          <Button as="label" htmlFor="import-json" colorScheme="green">📥 Import</Button>
        </Flex>

        <Heading size="md" mb="4">🧪 Test Groups</Heading>
        <List spacing="3">
          {groups.map(g => (
            <ListItem key={g.id} p="2" bg={selectedGroupId === g.id ? 'blue.100' : 'white'} borderRadius="md">
              <Flex justify="space-between" align="center">
                <Box onClick={() => setSelectedGroupId(g.id)} cursor="pointer">
                  <Text fontWeight="bold">{g.name}</Text>
                  <Text fontSize="sm">{g.desc}</Text>
                </Box>
                <Stack direction="row">
                  <IconButton size="sm" icon={<EditIcon />} onClick={() => editGroup(g)} />
                  <IconButton size="sm" icon={<DeleteIcon />} onClick={() => deleteGroup(g.id)} />
                </Stack>
              </Flex>
            </ListItem>
          ))}
        </List>

        <VStack spacing="3" mt="4">
          <Input
            placeholder="Group Name"
            value={groupName}
            onChange={e => setGroupName(e.target.value)}
          />
          <Textarea
            placeholder="Description"
            value={groupDesc}
            onChange={e => setGroupDesc(e.target.value)}
          />
          <Button onClick={saveGroup}>
            {editingGroupId ? "💾 Update Group" : "➕ Create Group"}
          </Button>
        </VStack>
      </Box>

      {/* Main Panel */}
      <Box flex="1" p="6">
        <Heading size="lg" mb="6">Create & Manage Subgroups & Parameters</Heading>

        {/* Subgroups */}
        {selectedGroup && (
          <>
            <Heading size="md" mb="3">📂 Subgroups in "{selectedGroup.name}"</Heading>
            <List spacing="2" mb="4">
              {selectedGroup.subGroups.map(sub => (
                <ListItem key={sub.id} p="2" borderRadius="md" border="1px solid #ccc" bg={selectedSubGroupId === sub.id ? "green.50" : "white"}>
                  <Flex justify="space-between" align="center">
                    <Box cursor="pointer" onClick={() => setSelectedSubGroupId(sub.id)}>
                      <Text fontWeight="bold">{sub.name}</Text>
                      <Text fontSize="sm" color="gray.600">
                        {sub.parameters?.length || 0} parameters
                      </Text>
                    </Box>
                    <Stack direction="row">
                      <IconButton icon={<EditIcon />} size="sm" onClick={() => editSubGroup(sub)} />
                      <IconButton icon={<DeleteIcon />} size="sm" onClick={() => handleDeleteSubGroup(sub.id)} />
                    </Stack>
                  </Flex>
                </ListItem>
              ))}
            </List>

            {/* Subgroup Form */}
            <VStack spacing="3" align="stretch">
              <Input
                placeholder="Subgroup Name"
                value={subGroupName}
                onChange={e => setSubGroupName(e.target.value)}
              />
              <Flex gap="3">
                <Button colorScheme="blue" onClick={saveSubGroup}>
                  {editingSubGroupId ? "💾 Update Subgroup" : "➕ Create Subgroup"}
                </Button>
                {editingSubGroupId && (
                  <Button variant="outline" onClick={() => {
                    setSubGroupName('');
                    setEditingSubGroupId('');
                  }}>Cancel</Button>
                )}
              </Flex>
            </VStack>
          </>
        )}

        {/* Parameters */}
        {selectedSubGroup && (
          <>
            <Heading size="md" mt="8" mb="3">🧾 Parameters in "{selectedSubGroup.name}"</Heading>
            <List spacing="4" mb="6">
              {selectedSubGroup.parameters.map(p => (
                <Box key={p.id} p="4" border="1px solid #ccc" borderRadius="md">
                  <Text fontWeight="bold">{p.name} ({p.unit})</Text>
                  <Text fontSize="sm" color="gray.600" mt="1">
                    {Object.entries(p.ranges).map(([type, r]) =>
                      `${type}: ${r.min}–${r.max}`
                    ).join(' | ')}
                  </Text>
                  {p.note && (
                    <Text fontSize="sm" color="gray.600" mt="1">📝 {p.note}</Text>
                  )}
                  <Flex gap="3" mt="2">
                    <Button size="sm" onClick={() => editParameter(p)}>✏️ Edit</Button>
                    <Button size="sm" colorScheme="red" onClick={() => handleDeleteParameter(p.id)}>❌ Delete</Button>
                  </Flex>
                </Box>
              ))}
            </List>

            {/* Parameter Form */}
            <VStack spacing="3" align="stretch">
              <Input placeholder="Parameter Name" value={paramName} onChange={e => setParamName(e.target.value)} />
              <Input placeholder="Unit (e.g. mg/dL)" value={paramUnit} onChange={e => setParamUnit(e.target.value)} />
              <Textarea placeholder="Interpretation Note (optional)" value={paramNote} onChange={e => setParamNote(e.target.value)} size="sm" />

              <Heading size="sm">Normal Ranges</Heading>
              {ranges.map(r => (
                <Flex key={r.id} gap="3" wrap="wrap" align="center">
                  <Select value={r.type} onChange={e => updateRange(r.id, 'type', e.target.value)} w="140px">
                    <option value="">Type</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="NewBorn">New Born</option>
                    <option value="Common">Common</option>
                  </Select>
                  <Input type="number" placeholder="Min" value={r.min} onChange={e => updateRange(r.id, 'min', e.target.value)} w="120px" />
                  <Input type="number" placeholder="Max" value={r.max} onChange={e => updateRange(r.id, 'max', e.target.value)} w="120px" />
                  <Textarea
                    placeholder="Note (optional)"
                    value={r.note}
                    onChange={e => updateRange(r.id, 'note', e.target.value)}
                    size="sm"
                    w="240px"
                  />
                  <Button size="sm" colorScheme="red" onClick={() => removeRange(r.id)}>❌</Button>
                </Flex>
              ))}
              <Button onClick={addRangeRow}>➕ Add Range</Button>

              <Flex gap="3" mt="3">
                <Button colorScheme="green" onClick={saveParameter}>
                  {editingParamId ? "💾 Update Parameter" : "✅ Save Parameter"}
                </Button>
                {editingParamId && (
                  <Button variant="outline" onClick={() => {
                    setParamName('');
                    setParamUnit('');
                    setRanges([]);
                    setEditingParamId('');
                    setParamNote('');
                  }}>Cancel</Button>
                )}
              </Flex>
            </VStack>
          </>
        )}
      </Box>
    </Flex>
  );
};

export default TestMaster;
