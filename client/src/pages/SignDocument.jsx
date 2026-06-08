import { useState, useEffect, useRef } from 'react'
import { useParams } from 'react-router-dom'
import { Document, Page, pdfjs } from 'react-pdf'
import { useAuth } from '../context/AuthContext'
import axios from 'axios'
import 'react-pdf/dist/Page/AnnotationLayer.css'
import 'react-pdf/dist/Page/TextLayer.css'

pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`

export default function SignDocument() {
  const { id } = useParams()
  const { token } = useAuth()
  const [doc, setDoc] = useState(null)
  const [numPages, setNumPages] = useState(null)
  const [signatures, setSignatures] = useState([])
  const [placing, setPlacing] = useState(false)
  const containerRef = useRef(null)

  useEffect(() => {
    fetchDoc()
    fetchSignatures()
  }, [])

  const fetchDoc = async () => {
    try {
      const res = await axios.get(`http://localhost:5001/api/docs/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      setDoc(res.data)
    } catch (err) { console.error(err) }
  }

  const fetchSignatures = async () => {
    try {
      const res = await axios.get(`http://localhost:5001/api/signatures/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      setSignatures(res.data)
    } catch (err) { console.error(err) }
  }

  const handlePDFClick = async (e) => {
    if (!placing) return
    const rect = containerRef.current.getBoundingClientRect()
    const x = ((e.clientX - rect.left) / rect.width) * 100
    const y = ((e.clientY - rect.top) / rect.height) * 100
    try {
      const res = await axios.post('http://localhost:5001/api/signatures', {
        documentId: id, x, y, page: 1
      }, { headers: { Authorization: `Bearer ${token}` } })
      setSignatures([...signatures, res.data])
      setPlacing(false)
    } catch (err) { console.error(err) }
  }

  if (!doc) return (
    <div style={{ minHeight: '100vh', background: '#F8F6F3', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Georgia, serif' }}>
      <p style={{ color: '#aaa' }}>Loading document...</p>
    </div>
  )

  return (
    <div style={{ minHeight: '100vh', background: '#F8F6F3', fontFamily: 'Georgia, serif' }}>
      {/* Navbar */}
      <nav style={{ background: '#1C1C1E', padding: '0 48px', height: '64px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ width: '32px', height: '3px', background: '#F5A65B', borderRadius: '2px' }} />
          <span style={{ color: '#F8F6F3', fontSize: '1.1rem', fontWeight: '700', letterSpacing: '0.04em' }}>DocSign</span>
        </div>
        <a href="/dashboard" style={{ color: '#aaa', fontSize: '0.9rem', textDecoration: 'none' }}>← Back to Dashboard</a>
      </nav>

      <div style={{ maxWidth: '860px', margin: '0 auto', padding: '48px 24px' }}>
        {/* Header */}
        <div style={{ marginBottom: '32px' }}>
          <div style={{ width: '36px', height: '3px', background: '#F5A65B', marginBottom: '16px', borderRadius: '2px' }} />
          <h2 style={{ fontSize: '1.4rem', fontWeight: '700', color: '#1C1C1E', marginBottom: '8px' }}>{doc.originalName}</h2>
          <p style={{ color: '#aaa', fontSize: '0.9rem' }}>Click "Place Signature" then click anywhere on the document to sign</p>
        </div>

        {/* Toolbar */}
        <div style={{ display: 'flex', gap: '12px', marginBottom: '24px' }}>
          <button
            onClick={() => setPlacing(!placing)}
            style={{
              background: placing ? '#1C1C1E' : '#F5A65B',
              color: '#fff', border: 'none', borderRadius: '10px',
              padding: '10px 24px', fontSize: '0.9rem', fontWeight: '700',
              cursor: 'pointer', fontFamily: 'Georgia, serif'
            }}
          >
            {placing ? '✕ Cancel' : '✍️ Place Signature'}
          </button>
          {signatures.length > 0 && (
            <span style={{ display: 'flex', alignItems: 'center', color: '#4CAF7D', fontSize: '0.9rem', fontWeight: '600' }}>
              ✓ {signatures.length} signature{signatures.length > 1 ? 's' : ''} placed
            </span>
          )}
        </div>

        {/* PDF Viewer */}
        <div
          ref={containerRef}
          onClick={handlePDFClick}
          style={{
            position: 'relative',
            background: '#fff',
            borderRadius: '16px',
            boxShadow: '0 4px 24px rgba(0,0,0,0.08)',
            overflow: 'hidden',
            cursor: placing ? 'crosshair' : 'default',
            border: placing ? '2px dashed #F5A65B' : '2px solid transparent'
          }}
        >
          <Document
            file={`http://localhost:5001/uploads/${doc.filename}`}
            onLoadSuccess={({ numPages }) => setNumPages(numPages)}
          >
            {Array.from(new Array(numPages), (_, i) => (
              <Page key={i + 1} pageNumber={i + 1} width={812} />
            ))}
          </Document>

          {/* Signature markers */}
          {signatures.map((sig, i) => (
            <div
              key={i}
              style={{
                position: 'absolute',
                left: `${sig.x}%`,
                top: `${sig.y}%`,
                transform: 'translate(-50%, -50%)',
                background: '#F5A65B',
                color: '#fff',
                padding: '4px 12px',
                borderRadius: '6px',
                fontSize: '0.8rem',
                fontWeight: '700',
                pointerEvents: 'none',
                boxShadow: '0 2px 8px rgba(245,166,91,0.4)'
              }}
            >
              ✍️ Signed
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}