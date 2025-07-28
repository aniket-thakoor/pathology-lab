import { useState, useEffect } from 'react';
import {
  getAllPatients,
  deletePatient,
  updatePatient,
  putPatient
} from '@/services/dbService';

export const usePatientStorage = () => {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadPatients = async () => {
    try {
      setLoading(true);
      const data = await getAllPatients();
      const sorted = data.sort((a, b) =>
        new Date(b.updatedAt || b.sampleDate || b.createdAt) -
        new Date(a.updatedAt || a.sampleDate || a.createdAt)
      );
      setPatients(sorted);
    } catch (err) {
      console.error('Error loading patients:', err);
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPatients();
  }, []);

  const refresh = async () => {
    await loadPatients();
  };

  const removePatient = async (id) => {
    await deletePatient(id);
    await refresh();
  };

  const modifyPatient = async (id, updates) => {
    await updatePatient(id, updates);
    await refresh();
  };

  const addPatient = async (patient) => {
    await putPatient(patient);
    await refresh();
  };

  return {
    patients,
    loading,
    error,
    refresh,
    removePatient,
    modifyPatient,
    addPatient
  };
};
