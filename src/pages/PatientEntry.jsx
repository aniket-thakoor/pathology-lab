import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const PatientEntry = () => {
  const navigate = useNavigate();
  const [tests, setTests] = useState([]);
  const [patients, setPatients] = useState(() => JSON.parse(localStorage.getItem('patients')) || []);
  const [form, setForm] = useState({
    name: '',
    gender: '',
    age: '',
    referredBy: '',
    mobile: '',
    email: '',
    selectedTests: []
  });
  const [matchOptions, setMatchOptions] = useState([]);

  // Load test groups from localStorage
  useEffect(() => {
    const savedTests = JSON.parse(localStorage.getItem('testGroups')) || [];
    setTests(savedTests);
  }, []);

  // Match on name or mobile
  useEffect(() => {
    if (form.name.length >= 3 || form.mobile.length >= 6) {
      const matches = patients.filter(p =>
        p.mobile.includes(form.mobile) || p.name.toLowerCase().includes(form.name.toLowerCase())
      );
      setMatchOptions(matches);
    } else {
      setMatchOptions([]);
    }
  }, [form.name, form.mobile]);

  const handleSelectMatch = (patient) => {
    setForm({ ...patient, selectedTests: [] }); // Don’t auto-select tests from history
    setMatchOptions([]);
  };

  const handleChange = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const handleCheckbox = (testId) => {
    setForm(prev => ({
      ...prev,
      selectedTests: prev.selectedTests.includes(testId)
        ? prev.selectedTests.filter(t => t !== testId)
        : [...prev.selectedTests, testId]
    }));
  };

  const handleSubmit = () => {
    if (!form.name || !form.gender || !form.age || !form.referredBy || !form.mobile || form.selectedTests.length === 0) {
      alert("Please fill all required fields and select at least one test.");
      return;
    }

    const newPatient = { ...form, id: Date.now().toString() };
    const updatedPatients = [...patients, newPatient];
    localStorage.setItem('patients', JSON.stringify(updatedPatients));
    localStorage.setItem('currentPatient', JSON.stringify(newPatient));
    navigate('/results');
  };

  return (
    <div className="section">
      <h2>👤 Enter Patient Details</h2>

      <input placeholder="Name" value={form.name} onChange={e => handleChange('name', e.target.value)} />
      <select value={form.gender} onChange={e => handleChange('gender', e.target.value)}>
        <option value="">Select Gender</option>
        <option>Male</option>
        <option>Female</option>
        <option>New Born</option>
      </select>
      <input type="number" placeholder="Age" value={form.age} onChange={e => handleChange('age', e.target.value)} />
      <input placeholder="Referred By" value={form.referredBy} onChange={e => handleChange('referredBy', e.target.value)} />
      <input type="tel" placeholder="Mobile Number" value={form.mobile} onChange={e => handleChange('mobile', e.target.value)} />
      <input type="email" placeholder="Email (optional)" value={form.email} onChange={e => handleChange('email', e.target.value)} />

      {matchOptions.length > 0 && (
        <div>
          <h4>👀 Matching Patients Found</h4>
          {matchOptions.map(p => (
            <button key={p.id} onClick={() => handleSelectMatch(p)}>
              {p.name} – {p.mobile} – {p.age} yrs
            </button>
          ))}
        </div>
      )}

      <h3>Select Tests to Perform:</h3>
      {tests.length === 0 ? <p>No test groups available.</p> : tests.map(test => (
        <label key={test.id}>
          <input
            type="checkbox"
            checked={form.selectedTests.includes(test.id)}
            onChange={() => handleCheckbox(test.id)}
          />
          {test.name}
        </label>
      ))}

      <br /><br />
      <button onClick={handleSubmit}>✅ Save & Continue</button>
    </div>
  );
};

export default PatientEntry;
