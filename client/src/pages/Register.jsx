import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import axios from 'axios'

export default function Register() {
  const { login } = useAuth()
  const [form, setForm] = useState({ name: '', email: '', password: '' })
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const res = await axios.post('http://localhost:5001/api/auth/register', form)
      login(res.data.user, res.data.token)
      window.location.href = '/dashboard'
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong')
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: '#F8F6F3', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Georgia, serif' }}>
      <div style={{ display: 'flex', width: '900px', minHeight: '540px', boxShadow: '0 20px 60px rgba(0,0,0,0.12)', borderRadius: '20px', overflow: 'hidden' }}>
        {/* Left Panel */}
        <div style={{ background: '#1C1C1E', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '60px 48px' }}>
          <div style={{ width: '48px', height: '4px', background: '#F5A65B', marginBottom: '32px', borderRadius: '2px' }} />
          <h1 style={{ color: '#F8F6F3', fontSize: '2.2rem', fontWeight: '700', lineHeight: 1.2, marginBottom: '16px' }}>
            Sign documents<br />with confidence.
          </h1>
          <p style={{ color: '#888', fontSize: '0.95rem', lineHeight: 1.7 }}>
            Secure, traceable, and legally sound — built for professionals who value their time.
          </p>
        </div>

        {/* Right Panel */}
        <div style={{ background: '#fff', flex: 1, padding: '60px 48px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <h2 style={{ fontSize: '1.6rem', fontWeight: '700', color: '#1C1C1E', marginBottom: '8px' }}>Create account</h2>
          <p style={{ color: '#888', fontSize: '0.9rem', marginBottom: '32px' }}>Start managing your documents today</p>

          {error && <p style={{ color: '#E57373', marginBottom: '16px', fontSize: '0.9rem' }}>{error}</p>}

          {['name', 'email', 'password'].map((field) => (
            <div key={field} style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '600', color: '#1C1C1E', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                {field}
              </label>
              <input
                type={field === 'password' ? 'password' : field === 'email' ? 'email' : 'text'}
                value={form[field]}
                onChange={(e) => setForm({ ...form, [field]: e.target.value })}
                style={{ width: '100%', border: '1.5px solid #E8E4DF', borderRadius: '10px', padding: '12px 14px', fontSize: '0.95rem', outline: 'none', background: '#F8F6F3', boxSizing: 'border-box', fontFamily: 'Georgia, serif' }}
                onFocus={e => e.target.style.borderColor = '#F5A65B'}
                onBlur={e => e.target.style.borderColor = '#E8E4DF'}
              />
            </div>
          ))}

          <button
            onClick={handleSubmit}
            style={{ width: '100%', background: '#F5A65B', color: '#fff', border: 'none', borderRadius: '10px', padding: '13px', fontSize: '1rem', fontWeight: '700', cursor: 'pointer', marginTop: '8px', fontFamily: 'Georgia, serif', letterSpacing: '0.02em' }}
            onMouseOver={e => e.target.style.background = '#e8924a'}
            onMouseOut={e => e.target.style.background = '#F5A65B'}
          >
            Create Account
          </button>

          <p style={{ textAlign: 'center', marginTop: '20px', fontSize: '0.9rem', color: '#888' }}>
            Already have an account?{' '}
            <a href="/login" style={{ color: '#F5A65B', textDecoration: 'none', fontWeight: '600' }}>Login</a>
          </p>
        </div>
      </div>
    </div>
  )
}