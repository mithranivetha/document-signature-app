import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import axios from 'axios'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faShare, faCopy } from '@fortawesome/free-solid-svg-icons'

export default function Dashboard() {
  const { user, token, logout } = useAuth()
  const [docs, setDocs] = useState([])
  const [file, setFile] = useState(null)
  const [uploading, setUploading] = useState(false)

  useEffect(() => { fetchDocs() }, [])

  const fetchDocs = async () => {
    try {
      const res = await axios.get('http://localhost:5001/api/docs', {
        headers: { Authorization: `Bearer ${token}` }
      })
      setDocs(res.data)
    } catch (err) { console.error(err) }
  }

  const handleUpload = async () => {
    if (!file) return alert('Please select a PDF file first')
    const formData = new FormData()
    formData.append('pdf', file)
    setUploading(true)
    try {
      await axios.post('http://localhost:5001/api/docs/upload', formData, {
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' }
      })
      setFile(null)
      fetchDocs()
    } catch { alert('Upload failed') }
    setUploading(false)
  }

  if (!user) { window.location.href = '/login'; return null }

  const statusStyle = (status) => {
    if (status === 'signed') return { background: '#E8F5EE', color: '#4CAF7D' }
    if (status === 'rejected') return { background: '#FDECEA', color: '#E57373' }
    return { background: '#FEF3E8', color: '#F5A65B' }
  }

  const handleShare = async (docId) => {
  try {
    const res = await axios.post(`http://localhost:5001/api/share/${docId}`, {}, {
      headers: { Authorization: `Bearer ${token}` }
    })
    await navigator.clipboard.writeText(res.data.shareUrl)
    alert('Share link copied to clipboard!')
  } catch (err) {
    alert('Failed to generate share link')
  }
}

  return (
    <div style={{ minHeight: '100vh', background: '#F8F6F3', fontFamily: 'Georgia, serif' }}>
      <nav style={{ background: '#1C1C1E', padding: '0 48px', height: '64px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ width: '32px', height: '3px', background: '#F5A65B', borderRadius: '2px' }} />
          <span style={{ color: '#F8F6F3', fontSize: '1.1rem', fontWeight: '700', letterSpacing: '0.04em' }}>DocSign</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
          <span style={{ color: '#888', fontSize: '0.9rem' }}>Hello, {user.name}</span>
          <button
            onClick={logout}
            style={{ background: 'transparent', border: '1.5px solid #444', color: '#aaa', borderRadius: '8px', padding: '6px 16px', fontSize: '0.85rem', cursor: 'pointer', fontFamily: 'Georgia, serif' }}
            onMouseOver={e => { e.target.style.borderColor = '#F5A65B'; e.target.style.color = '#F5A65B' }}
            onMouseOut={e => { e.target.style.borderColor = '#444'; e.target.style.color = '#aaa' }}
          >
            Logout
          </button>
        </div>
      </nav>

      <div style={{ maxWidth: '860px', margin: '0 auto', padding: '48px 24px' }}>
        <div style={{ background: '#fff', borderRadius: '16px', padding: '36px', marginBottom: '32px', boxShadow: '0 4px 24px rgba(0,0,0,0.06)' }}>
          <div style={{ width: '36px', height: '3px', background: '#F5A65B', marginBottom: '20px', borderRadius: '2px' }} />
          <h2 style={{ fontSize: '1.2rem', fontWeight: '700', color: '#1C1C1E', marginBottom: '20px' }}>Upload a Document</h2>
          <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
            <input
              type="file"
              accept=".pdf"
              onChange={(e) => setFile(e.target.files[0])}
              style={{ flex: 1, border: '1.5px dashed #E8E4DF', borderRadius: '10px', padding: '12px 14px', fontSize: '0.9rem', background: '#F8F6F3', fontFamily: 'Georgia, serif' }}
            />
            <button
              onClick={handleUpload}
              disabled={uploading}
              style={{ background: uploading ? '#ccc' : '#F5A65B', color: '#fff', border: 'none', borderRadius: '10px', padding: '13px 28px', fontSize: '0.95rem', fontWeight: '700', cursor: uploading ? 'not-allowed' : 'pointer', fontFamily: 'Georgia, serif', whiteSpace: 'nowrap' }}
            >
              {uploading ? 'Uploading...' : 'Upload PDF'}
            </button>
          </div>
        </div>

        <div style={{ background: '#fff', borderRadius: '16px', padding: '36px', boxShadow: '0 4px 24px rgba(0,0,0,0.06)' }}>
          <div style={{ width: '36px', height: '3px', background: '#F5A65B', marginBottom: '20px', borderRadius: '2px' }} />
          <h2 style={{ fontSize: '1.2rem', fontWeight: '700', color: '#1C1C1E', marginBottom: '24px' }}>Your Documents</h2>
          {docs.length === 0 ? (
            <p style={{ color: '#aaa', fontSize: '0.95rem' }}>No documents uploaded yet.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {docs.map(doc => (
                <div key={doc._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: '1.5px solid #F0EDE9', borderRadius: '12px', padding: '16px 20px' }}>
                  <div>
                    <p style={{ fontWeight: '600', color: '#1C1C1E', marginBottom: '4px' }}>{doc.originalName}</p>
                    <p style={{ fontSize: '0.8rem', color: '#aaa' }}>{new Date(doc.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <span style={{ ...statusStyle(doc.status), padding: '5px 14px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: '700', textTransform: 'capitalize' }}>
                      {doc.status}
                    </span>
                    
                      <a href={`/sign/${doc._id}`}
                      style={{ background: '#1C1C1E', color: '#F5A65B', border: '1.5px solid #F5A65B', borderRadius: '8px', padding: '5px 14px', fontSize: '0.8rem', fontWeight: '700', textDecoration: 'none' }}
                    >
                      View & Sign
                    </a>
                    <button
                        onClick={() => handleShare(doc._id)}
                        style={{ background: 'transparent', color: '#888', border: '1.5px solid #E8E4DF', borderRadius: '8px', padding: '5px 14px', fontSize: '0.8rem', fontWeight: '700', cursor: 'pointer', fontFamily: 'Georgia, serif', display: 'flex', alignItems: 'center', gap: '6px' }}
                        >
                        <FontAwesomeIcon icon={faShare} /> Share
                        </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}