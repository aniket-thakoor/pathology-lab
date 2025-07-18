import React, { useState, useEffect } from 'react';
import {
  Box, Flex, Heading, VStack, Input, Textarea, Button,
  Select, Divider, Text, List, ListItem, IconButton, useToast,
  Stack
} from '@chakra-ui/react';
import { EditIcon, DeleteIcon } from '@chakra-ui/icons';

const TestMaster = () => {
  const toast = useToast();

  // Groups
  const [groups, setGroups] = useState(() => JSON.parse(localStorage.getItem('testGroups')) || []);
  const [groupName, setGroupName] = useState('');
  const [groupDesc, setGroupDesc] = useState('');
  const [selectedGroupId, setSelectedGroupId] = useState('');
  const [editingGroupId, setEditingGroupId] = useState('');

  // Subgroups
  const [subGroupName, setSubGroupName] = useState('');
  const [editingSubGroupId, setEditingSubGroupId] = useState('');
  const [selectedSubGroupId, setSelectedSubGroupId] = useState('');

  // Parameters
  const [paramName, setParamName] = useState('');
  const [paramUnit, setParamUnit] = useState('');
  const [paramNote, setParamNote] = useState('');
  const [ranges, setRanges] = useState([]);
  const [editingParamId, setEditingParamId] = useState('');

  useEffect(() => {
    localStorage.setItem('testGroups', JSON.stringify(groups));
  }, [groups]);

  // 👉 Group Functions
  const saveGroup = () => {
    if (!groupName.trim()) return;
    if (editingGroupId) {
      setGroups(prev =>
        prev.map(g => g.id === editingGroupId
          ? { ...g, name: groupName, desc: groupDesc }
          : g
        )
      );
      toast({ title: "Group updated!", status: "success" });
    } else {
      const newGroup = { id: Date.now().toString(), name: groupName, desc: groupDesc, subGroups: [] };
      setGroups(prev => [...prev, newGroup]);
      toast({ title: "Group created!", status: "success" });
    }
    setGroupName('');
    setGroupDesc('');
    setEditingGroupId('');
  };

  const deleteGroup = (id) => {
    if (window.confirm("Delete this test group permanently?")) {
      setGroups(prev => prev.filter(g => g.id !== id));
      setSelectedGroupId('');
      toast({ title: "Group deleted.", status: "info" });
    }
  };

  const editGroup = (group) => {
    setGroupName(group.name);
    setGroupDesc(group.desc);
    setEditingGroupId(group.id);
    setSelectedGroupId(group.id);
  };

  // 👉 Subgroup Functions
  const saveSubGroup = () => {
    if (!subGroupName || !selectedGroupId) return;

    setGroups(prev =>
      prev.map(g => {
        if (g.id === selectedGroupId) {
          const updatedSubGroups = editingSubGroupId
            ? g.subGroups.map(sg => sg.id === editingSubGroupId ? { ...sg, name: subGroupName } : sg)
            : [...g.subGroups, { id: Date.now().toString(), name: subGroupName, parameters: [] }];

          return { ...g, subGroups: updatedSubGroups };
        }
        return g;
      })
    );

    toast({ title: editingSubGroupId ? "Subgroup updated!" : "Subgroup created!", status: "success" });
    setSubGroupName('');
    setEditingSubGroupId('');
  };

  const editSubGroup = (sub) => {
    setSubGroupName(sub.name);
    setEditingSubGroupId(sub.id);
    setSelectedSubGroupId(sub.id);
  };

  const deleteSubGroup = (id) => {
    setGroups(prev =>
      prev.map(g => {
        if (g.id === selectedGroupId) {
          return { ...g, subGroups: g.subGroups.filter(sg => sg.id !== id) };
        }
        return g;
      })
    );
    toast({ title: "Subgroup deleted.", status: "info" });
    setSelectedSubGroupId('');
  };

  // 👉 Parameter Functions
  const saveParameter = () => {
    if (!paramName || !paramUnit || !selectedGroupId || !selectedSubGroupId || ranges.length === 0) {
      toast({ title: "Please complete all fields.", status: "warning" });
      return;
    }

    const cleanRanges = {};
    ranges.forEach(r => {
      if (r.type && r.min && r.max) {
        cleanRanges[r.type] = { min: parseFloat(r.min), max: parseFloat(r.max), note: r.note };
      }
    });

    setGroups(prev =>
      prev.map(g => {
        if (g.id === selectedGroupId) {
          const updatedSubGroups = g.subGroups.map(sg => {
            if (sg.id === selectedSubGroupId) {
              const newParam = {
                id: editingParamId || Date.now().toString(),
                name: paramName,
                unit: paramUnit,
                ranges: cleanRanges,
                note: paramNote
              };
              const filtered = sg.parameters.filter(p => p.id !== editingParamId);
              return { ...sg, parameters: editingParamId ? [...filtered, newParam] : [...sg.parameters, newParam] };
            }
            return sg;
          });
          return { ...g, subGroups: updatedSubGroups };
        }
        return g;
      })
    );

    toast({ title: editingParamId ? "Parameter updated!" : "Parameter added!", status: "success" });
    setParamName('');
    setParamUnit('');
    setRanges([]);
    setEditingParamId('');
    setParamNote('');
  };

  const editParameter = (param) => {
    setParamName(param.name);
    setParamUnit(param.unit);
    setEditingParamId(param.id);
    setRanges(Object.entries(param.ranges).map(([type, r]) => ({
      id: Date.now() + Math.random(), type, min: r.min, max: r.max, note: r.note
    })));
    setParamNote(param.note || '');
  };

  const deleteParameter = (id) => {
    setGroups(prev =>
      prev.map(g => {
        if (g.id === selectedGroupId) {
          const updatedSubGroups = g.subGroups.map(sg => {
            if (sg.id === selectedSubGroupId) {
              return { ...sg, parameters: sg.parameters.filter(p => p.id !== id) };
            }
            return sg;
          });
          return { ...g, subGroups: updatedSubGroups };
        }
        return g;
      })
    );
    toast({ title: "Parameter deleted.", status: "info" });
  };

  // 🔁 Range Helpers
  const addRangeRow = () => {
    setRanges(prev => [...prev, { id: Date.now(), type: '', min: '', max: '', note: '' }]);
  };

  const updateRange = (id, field, value) => {
    setRanges(prev => prev.map(r => r.id === id ? { ...r, [field]: value } : r));
  };

  const removeRange = (id) => {
    setRanges(prev => prev.filter(r => r.id !== id));
  };

  const selectedGroup = groups.find(g => g.id === selectedGroupId);
  const selectedSubGroup = selectedGroup?.subGroups.find(sg => sg.id === selectedSubGroupId);

  const handleExport = () => {
    const data = JSON.parse(localStorage.getItem('testGroups') || '[]');
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
    reader.onload = (event) => {
      try {
        const imported = JSON.parse(event.target.result);
        localStorage.setItem('testGroups', JSON.stringify(imported));
        setGroups(imported); // Optional: update state directly
        alert('✅ Test data imported successfully!');
      } catch (err) {
        alert('❌ Invalid JSON file.');
      }
    };
    reader.readAsText(file);
  };  

  return (
    <Flex minH="100vh">
      {/* Sidebar */}
      <Box w="360px" p="5" bg="gray.100" borderRight="1px solid #ddd">
        <Flex justify="space-between" gap="4" mb="6" wrap="wrap">
            <Button colorScheme="blue" onClick={handleExport}>
                📤 Export Tests
            </Button>

            <Input
                type="file"
                accept=".json"
                onChange={handleImport}
                display="none"
                id="import-json"
            />
            <Button as="label" htmlFor="import-json" colorScheme="green">
                📥 Import Tests
            </Button>
        </Flex>
        <Heading size="md" mb="4">🧪 Test Groups</Heading>
        <List spacing="3">
          {groups.map(group => (
            <ListItem key={group.id} p="2" borderRadius="md" bg={selectedGroupId === group.id ? "blue.100" : "white"}>
              <Flex justify="space-between" align="center">
                <Box cursor="pointer" onClick={() => setSelectedGroupId(group.id)}>
                  <Text fontWeight="bold">{group.name}</Text>
                  <Text fontSize="sm">{group.desc}</Text>
                </Box>
                <Stack direction="row">
                  <IconButton size="sm" icon={<EditIcon />} onClick={() => editGroup(group)} aria-label="Edit group" />
                  <IconButton size="sm" icon={<DeleteIcon />} onClick={() => deleteGroup(group.id)} aria-label="Delete group" />
                </Stack>
              </Flex>
            </ListItem>
          ))}
        </List>
        <Divider mt="6" />
        <VStack spacing="3" mt="4">
          <Input placeholder="Group Name" value={groupName} onChange={e => setGroupName(e.target.value)} />
          <Textarea placeholder="Description" value={groupDesc} onChange={e => setGroupDesc(e.target.value)} />
          <Button onClick={saveGroup}>
            {editingGroupId ? "💾 Update Group" : "➕ Create Group"}
          </Button>
        </VStack>
      </Box>

      {/* Main Panel */}
      <Box flex="1" p="6">
        <Heading size="lg" mb="6">Create & Manage Subgroups & Parameters</Heading>

        {/* Subgroup Form */}
        {selectedGroup && (
          <Box mb="8">
            <Heading size="md" mb="3">📂 Subgroups in "{selectedGroup.name}"</Heading>
            <List spacing="2">
              {selectedGroup.subGroups.map(sub => (
                <ListItem key={sub.id} p="2" border="1px solid #ddd" borderRadius="md" bg={selectedSubGroupId === sub.id ? "green.50" : "white"}>
                  <Flex justify="space-between" align="center">
                    <Box cursor="pointer" onClick={() => setSelectedSubGroupId(sub.id)}>
                      <Text fontWeight="bold">{sub.name}</Text>
                      <Text fontSize="sm" color="gray.600">{sub.parameters?.length || 0} parameters</Text>
                    </Box>
                    <Stack direction="row">
                      <IconButton icon={<EditIcon />} size="sm" onClick={() => editSubGroup(sub)} />
                      <IconButton icon={<DeleteIcon />} size="sm" onClick={() => deleteSubGroup(sub.id)} />
                    </Stack>
                  </Flex>
                </ListItem>
              ))}
            </List>

            {/* Create/Edit Subgroup */}
            <VStack spacing="3" mt="4" align="stretch">
              <Input placeholder="Subgroup Name" value={subGroupName} onChange={e => setSubGroupName(e.target.value)} />
              <Flex gap="3">
                <Button colorScheme="blue" onClick={saveSubGroup}>
                  {editingSubGroupId ? "💾 Update Subgroup" : "➕ Create Subgroup"}
                </Button>
                {editingSubGroupId && (
                  <Button variant="outline" onClick={() => { setSubGroupName(''); setEditingSubGroupId(''); }}>Cancel</Button>
                )}
              </Flex>
            </VStack>
          </Box>
        )}

        {/* Parameter Form */}
        {selectedSubGroup && (
          <>
            <Heading size="md" mb="3">🧾 Parameters in "{selectedSubGroup.name}"</Heading>
            <List spacing="4" mb="6">
              {selectedSubGroup.parameters.map(param => (
                <Box key={param.id} p="4" border="1px solid #ccc" borderRadius="md">
                  <Text fontWeight="bold">{param.name} ({param.unit})</Text>
                  <Text fontSize="sm" color="gray.600" mt="1">
                    {Object.entries(param.ranges).map(([type, r]) =>
                      `${type}: ${r.min}–${r.max}`
                    ).join(' | ')}
                  </Text>
                  {param.note && (
                    <Text fontSize="sm" color="gray.600" mt="1">
                        📝 {param.note}
                    </Text>
                  )}
                  <Flex gap="3" mt="2">
                    <Button size="sm" onClick={() => editParameter(param)}>✏️ Edit</Button>
                    <Button size="sm" colorScheme="red" onClick={() => deleteParameter(param.id)}>❌ Delete</Button>
                  </Flex>
                </Box>
              ))}
            </List>

            {/* Add/Edit Parameter Form */}
            <VStack spacing="3" align="stretch">
              <Input placeholder="Parameter Name" value={paramName} onChange={e => setParamName(e.target.value)} />
              <Input placeholder="Unit (e.g. mg/dL)" value={paramUnit} onChange={e => setParamUnit(e.target.value)} />
              <Textarea
                placeholder="Interpretation Note (optional)"
                value={paramNote}
                onChange={e => setParamNote(e.target.value)}
                size="sm"
              />

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
                    placeholder="Interpretation Note (optional)"
                    value={r.note}
                    onChange={e => updateRange(r.id, 'note', e.target.value)}
                    size="sm"
                  />
                  <Button size="sm" colorScheme="red" onClick={() => removeRange(r.id)}>❌</Button>
                </Flex>
              ))}
              <Button onClick={addRangeRow}>➕ Add Range</Button>
              <Flex gap="3">
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
