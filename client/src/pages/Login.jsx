import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import axios from 'axios'

export default function Login() {
  const { login } = useAuth()
  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const res = await axios.post('http://localhost:5001/api/auth/login', form)
      login(res.data.user, res.data.token)
      window.location.href = '/dashboard'
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong')
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: '#F8F6F3', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Georgia, serif' }}>
      <div style={{ display: 'flex', width: '900px', minHeight: '500px', boxShadow: '0 20px 60px rgba(0,0,0,0.12)', borderRadius: '20px', overflow: 'hidden' }}>
        {/* Left Panel */}
        <div style={{ background: '#1C1C1E', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '60px 48px' }}>
          <div style={{ width: '48px', height: '4px', background: '#F5A65B', marginBottom: '32px', borderRadius: '2px' }} />
          <h1 style={{ color: '#F8F6F3', fontSize: '2.2rem', fontWeight: '700', lineHeight: 1.2, marginBottom: '16px' }}>
            Welcome<br />back.
          </h1>
          <p style={{ color: '#888', fontSize: '0.95rem', lineHeight: 1.7 }}>
            Your documents are waiting. Pick up right where you left off.
          </p>
        </div>

        {/* Right Panel */}
        <div style={{ background: '#fff', flex: 1, padding: '60px 48px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <h2 style={{ fontSize: '1.6rem', fontWeight: '700', color: '#1C1C1E', marginBottom: '8px' }}>Sign in</h2>
          <p style={{ color: '#888', fontSize: '0.9rem', marginBottom: '32px' }}>Enter your credentials to continue</p>

          {error && <p style={{ color: '#E57373', marginBottom: '16px', fontSize: '0.9rem' }}>{error}</p>}

          {['email', 'password'].map((field) => (
            <div key={field} style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '600', color: '#1C1C1E', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                {field}
              </label>
              <input
                type={field === 'password' ? 'password' : 'email'}
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
            style={{ width: '100%', background: '#F5A65B', color: '#fff', border: 'none', borderRadius: '10px', padding: '13px', fontSize: '1rem', fontWeight: '700', cursor: 'pointer', marginTop: '8px', fontFamily: 'Georgia, serif' }}
            onMouseOver={e => e.target.style.background = '#e8924a'}
            onMouseOut={e => e.target.style.background = '#F5A65B'}
          >
            Login
          </button>

          <p style={{ textAlign: 'center', marginTop: '20px', fontSize: '0.9rem', color: '#888' }}>
            Don't have an account?{' '}
            <a href="/register" style={{ color: '#F5A65B', textDecoration: 'none', fontWeight: '600' }}>Register</a>
          </p>
        </div>
      </div>
    </div>
  )
}