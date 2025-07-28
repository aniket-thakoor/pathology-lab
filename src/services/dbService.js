import { openDB } from 'idb';

export const getDB = async () => {
  return openDB('PathoReportDB', 1, {
    upgrade(db) {
      if (!db.objectStoreNames.contains('patients')) {
        db.createObjectStore('patients', { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains('testResults')) {
        db.createObjectStore('testResults', { keyPath: 'patientId' });
      }
      if (!db.objectStoreNames.contains('labInfo')) {
        db.createObjectStore('labInfo', { keyPath: 'id' });
      }
    }
  });
};

// Create or Replace Patient
export const putPatient = async (patient) => {
  const db = await getDB();
  await db.put('patients', patient);
};

// Update Patient by ID
export const updatePatient = async (id, updates) => {
  const db = await getDB();
  const existing = await db.get('patients', id);
  if (!existing) throw new Error('Patient not found');
  const merged = { ...existing, ...updates };
  await db.put('patients', merged);
};

export const updatePatientStatus = async (patientId, newStatus) => {
  const db = await getDB();
  const existing = await db.get('patients', patientId);

  if (!existing) throw new Error("Patient record not found");

  await db.put('patients', {
    ...existing,
    status: newStatus,
    updatedAt: new Date().toISOString()
  });
};

// Delete Patient by ID
export const deletePatient = async (id) => {
  const db = await getDB();
  await db.delete('patients', id);
  await db.delete('testResults', id); // Optional: Clean up linked results
};

// Get All Patients
export const getAllPatients = async () => {
  const db = await getDB();
  return await db.getAll('patients');
};

// Get One Patient
export const getPatientById = async (id) => {
  const db = await getDB();
  return await db.get('patients', id);
};

// Save or Replace Test Results
export const putTestResults = async (patientId, results) => {
  const db = await getDB();
  await db.put('testResults', { patientId, results });
};

// Update Test Results by Patient ID
export const updateTestResults = async (patientId, updates) => {
  const db = await getDB();
  const existing = await db.get('testResults', patientId);
  const merged = { ...existing?.results || {}, ...updates };
  await db.put('testResults', { patientId, results: merged });
};

// Get Test Results by Patient ID
export const getTestResults = async (patientId) => {
  const db = await getDB();
  const record = await db.get('testResults', patientId);
  return record?.results || {};
};

// Fetch subgroup list from a specific group
export const getSubgroupsByGroupId = async (groupId) => {
  const db = await getDB();
  const record = await db.get('labInfo', 'testGroups');
  const group = record?.data?.find(g => g.id === groupId);
  return group?.subGroups || [];
};

// Add a new subgroup to a group
export const addSubgroup = async (groupId, newSubgroup) => {
  const db = await getDB();
  const record = await db.get('labInfo', 'testGroups');
  const updated = record?.data?.map(g =>
    g.id === groupId
      ? { ...g, subGroups: [...g.subGroups, newSubgroup] }
      : g
  );
  await db.put('labInfo', { id: 'testGroups', data: updated });
};

// Update existing subgroup inside a group
export const updateSubgroup = async (groupId, subgroup) => {
  const db = await getDB();
  const record = await db.get('labInfo', 'testGroups');
  const updated = record?.data?.map(g =>
    g.id === groupId
      ? {
          ...g,
          subGroups: g.subGroups.map(sg =>
            sg.id === subgroup.id ? subgroup : sg
          )
        }
      : g
  );
  await db.put('labInfo', { id: 'testGroups', data: updated });
};

// Delete a subgroup from a group
export const deleteSubgroup = async (groupId, subgroupId) => {
  const db = await getDB();
  const record = await db.get('labInfo', 'testGroups');
  const updated = record?.data?.map(g =>
    g.id === groupId
      ? {
          ...g,
          subGroups: g.subGroups.filter(sg => sg.id !== subgroupId)
        }
      : g
  );
  await db.put('labInfo', { id: 'testGroups', data: updated });
};

// Add a parameter to a specific subgroup
export const addParameterToSubgroup = async (groupId, subGroupId, newParam) => {
  const db = await getDB();
  const record = await db.get('labInfo', 'testGroups');

  const updated = record?.data?.map(g =>
    g.id === groupId
      ? {
          ...g,
          subGroups: g.subGroups.map(sg =>
            sg.id === subGroupId
              ? { ...sg, parameters: [...(sg.parameters || []), newParam] }
              : sg
          )
        }
      : g
  );

  await db.put('labInfo', { id: 'testGroups', data: updated });
};

// Update an existing parameter in a subgroup
export const updateParameterInSubgroup = async (groupId, subGroupId, updatedParam) => {
  const db = await getDB();
  const record = await db.get('labInfo', 'testGroups');

  const updated = record?.data?.map(g =>
    g.id === groupId
      ? {
          ...g,
          subGroups: g.subGroups.map(sg =>
            sg.id === subGroupId
              ? {
                  ...sg,
                  parameters: sg.parameters.map(p =>
                    p.id === updatedParam.id ? updatedParam : p
                  )
                }
              : sg
          )
        }
      : g
  );

  await db.put('labInfo', { id: 'testGroups', data: updated });
};

// Delete a parameter by ID from a subgroup
export const deleteParameterFromSubgroup = async (groupId, subGroupId, paramId) => {
  const db = await getDB();
  const record = await db.get('labInfo', 'testGroups');

  const updated = record?.data?.map(g =>
    g.id === groupId
      ? {
          ...g,
          subGroups: g.subGroups.map(sg =>
            sg.id === subGroupId
              ? {
                  ...sg,
                  parameters: sg.parameters.filter(p => p.id !== paramId)
                }
              : sg
          )
        }
      : g
  );

  await db.put('labInfo', { id: 'testGroups', data: updated });
};

// Get parameters from a subgroup
export const getParametersFromSubgroup = async (groupId, subGroupId) => {
  const db = await getDB();
  const record = await db.get('labInfo', 'testGroups');
  const group = record?.data?.find(g => g.id === groupId);
  const subgroup = group?.subGroups?.find(sg => sg.id === subGroupId);
  return subgroup?.parameters || [];
};

export const getTestGroups = async () => {
  const db = await getDB();
  const record = await db.get('labInfo', 'testGroups');
  return record?.data || [];
};

export const putTestGroups = async (groupsArray) => {
  const db = await getDB();
  await db.put('labInfo', { id: 'testGroups', data: groupsArray });
};

export const getLabDetails = async () => {
  const db = await getDB();
  return db.get('labInfo', 'labDetails');
};

export const putLabDetails = async (details) => {
  const db = await getDB();
  await db.put('labInfo', { id: 'labDetails', ...details });
};
