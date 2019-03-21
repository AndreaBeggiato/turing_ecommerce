import React, { useState } from 'react';
import firebase from 'firebase';

const RegisterUserPassword = () => {
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState(null);
  const handleRegisterUserPassword = async () => {
    try {
      await firebase.auth().createUserWithEmailAndPassword(form.email, form.password);
      setError(null);
      setForm({ email: '', password: '' });
    }
    catch (e) {
      setError(e);
    }
  };

  return (
    <div style={{ marginBottom: 20 }}>
      <label>Username: </label>
      <input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} type="text" />
      <label>Password: </label>
      <input value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} type="password" />
      <button
        disabled={form.email === '' || form.password === ''}
        onClick={handleRegisterUserPassword}
      >
        RegisterUserPassword
      </button>
      {error && <code>{JSON.stringify(error)}</code>}
    </div>
  );
};

export default RegisterUserPassword;
