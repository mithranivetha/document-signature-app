import { useState, useEffect, useRef } from 'react'
import { useParams } from 'react-router-dom'
import { Document, Page, pdfjs } from 'react-pdf'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPen, faCheck, faXmark, faArrowLeft } from '@fortawesome/free-solid-svg-icons'
import axios from 'axios'
import 'react-pdf/dist/Page/AnnotationLayer.css'
import 'react-pdf/dist/Page/TextLayer.css'

pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`

const CURSIVE_FONTS = [
  { name: 'Dancing Script', url: 'https://fonts.googleapis.com/css2?family=Dancing+Script:wght@700&display=swap' },
  { name: 'Great Vibes', url: 'https://fonts.googleapis.com/css2?family=Great+Vibes&display=swap' },
  { name: 'Pacifico', url: 'https://fonts.googleapis.com/css2?family=Pacifico&display=swap' },
]

export default function SharedSign() {
  const { token } = useParams()
  const [doc, setDoc] = useState(null)
  const [numPages, setNumPages] = useState(null)
  const [signatures, setSignatures] = useState([])
  const [showModal, setShowModal] = useState(false)
  const [modalTab, setModalTab] = useState('draw')
  const [typedName, setTypedName] = useState('')
  const [selectedFont, setSelectedFont] = useState('Dancing Script')
  const [placing, setPlacing] = useState(false)
  const [pendingSig, setPendingSig] = useState(null)
  const [signed, setSigned] = useState(false)
  const containerRef = useRef(null)
  const sigCanvasRef = useRef(null)
  const isDrawing = useRef(false)

  useEffect(() => {
    fetchDoc()
    CURSIVE_FONTS.forEach(f => {
      const link = document.createElement('link')
      link.rel = 'stylesheet'
      link.href = f.url
      document.head.appendChild(link)
    })
  }, [])

  const fetchDoc = async () => {
    try {
      const res = await axios.get(`http://localhost:5001/api/share/${token}`)
      setDoc(res.data)
    } catch (err) { console.error(err) }
  }

  const startDraw = (e) => {
    isDrawing.current = true
    const ctx = sigCanvasRef.current.getContext('2d')
    ctx.beginPath()
    const rect = sigCanvasRef.current.getBoundingClientRect()
    ctx.moveTo(e.clientX - rect.left, e.clientY - rect.top)
  }

  const draw = (e) => {
    if (!isDrawing.current) return
    const ctx = sigCanvasRef.current.getContext('2d')
    ctx.lineWidth = 2
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'
    ctx.strokeStyle = '#1C1C1E'
    ctx.shadowBlur = 1
    ctx.shadowColor = '#1C1C1E'
    const rect = sigCanvasRef.current.getBoundingClientRect()
    ctx.lineTo(e.clientX - rect.left, e.clientY - rect.top)
    ctx.stroke()
    ctx.beginPath()
    ctx.moveTo(e.clientX - rect.left, e.clientY - rect.top)
  }

  const stopDraw = () => { isDrawing.current = false }

  const clearCanvas = () => {
    const ctx = sigCanvasRef.current.getContext('2d')
    ctx.clearRect(0, 0, sigCanvasRef.current.width, sigCanvasRef.current.height)
  }

  const handleConfirmSignature = () => {
    let sigImage = null
    try {
      if (modalTab === 'draw') {
        sigImage = sigCanvasRef.current.toDataURL('image/png')
      } else {
        if (!typedName.trim()) return alert('Please type your name first')
        const canvas = document.createElement('canvas')
        canvas.width = 400
        canvas.height = 100
        const ctx = canvas.getContext('2d')
        ctx.clearRect(0, 0, 400, 100)
        ctx.font = `48px ${selectedFont}`
        ctx.fillStyle = '#1C1C1E'
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        ctx.fillText(typedName, 200, 50)
        sigImage = canvas.toDataURL('image/png')
      }
      setPendingSig(sigImage)
      setShowModal(false)
      setPlacing(true)
    } catch (err) {
      alert('Something went wrong: ' + err.message)
    }
  }

  const handlePDFClick = async (e) => {
    if (!placing || !pendingSig) return
    const rect = containerRef.current.getBoundingClientRect()
    const x = ((e.clientX - rect.left) / rect.width) * 100
    const y = ((e.clientY - rect.top) / rect.height) * 100
    setSignatures([...signatures, { x, y, sigImage: pendingSig }])
    setPlacing(false)
    setPendingSig(null)
    setSigned(true)
  }

  if (!doc) return (
    <div style={{ minHeight: '100vh', background: '#F8F6F3', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Georgia, serif' }}>
      <p style={{ color: '#aaa' }}>Loading document...</p>
    </div>
  )

  return (
    <div style={{ minHeight: '100vh', background: '#F8F6F3', fontFamily: 'Georgia, serif' }}>
      <nav style={{ background: '#1C1C1E', padding: '0 48px', height: '64px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ width: '32px', height: '3px', background: '#F5A65B', borderRadius: '2px' }} />
          <span style={{ color: '#F8F6F3', fontSize: '1.1rem', fontWeight: '700', letterSpacing: '0.04em' }}>DocSign</span>
        </div>
        <span style={{ color: '#888', fontSize: '0.9rem' }}>Shared Document</span>
      </nav>

      <div style={{ maxWidth: '860px', margin: '0 auto', padding: '48px 24px' }}>
        <div style={{ marginBottom: '32px' }}>
          <div style={{ width: '36px', height: '3px', background: '#F5A65B', marginBottom: '16px', borderRadius: '2px' }} />
          <h2 style={{ fontSize: '1.4rem', fontWeight: '700', color: '#1C1C1E', marginBottom: '8px' }}>{doc.originalName}</h2>
          <p style={{ color: '#aaa', fontSize: '0.9rem' }}>
            {placing ? 'Click anywhere on the document to place your signature' : 'Review and sign the document below'}
          </p>
        </div>

        <div style={{ display: 'flex', gap: '12px', marginBottom: '24px', flexWrap: 'wrap' }}>
          {!signed ? (
            <button
              onClick={() => { setShowModal(true); setModalTab('draw') }}
              style={{ background: '#F5A65B', color: '#fff', border: 'none', borderRadius: '10px', padding: '10px 24px', fontSize: '0.9rem', fontWeight: '700', cursor: 'pointer', fontFamily: 'Georgia, serif', display: 'flex', alignItems: 'center', gap: '8px' }}
            >
              <FontAwesomeIcon icon={faPen} /> Sign Document
            </button>
          ) : (
            <span style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#4CAF7D', fontSize: '0.9rem', fontWeight: '600' }}>
              <FontAwesomeIcon icon={faCheck} /> Document Signed
            </span>
          )}
          {placing && (
            <button
              onClick={() => { setPlacing(false); setPendingSig(null) }}
              style={{ background: '#1C1C1E', color: '#aaa', border: '1.5px solid #444', borderRadius: '10px', padding: '10px 24px', fontSize: '0.9rem', cursor: 'pointer', fontFamily: 'Georgia, serif', display: 'flex', alignItems: 'center', gap: '8px' }}
            >
              <FontAwesomeIcon icon={faXmark} /> Cancel
            </button>
          )}
        </div>

        <div
          ref={containerRef}
          onClick={handlePDFClick}
          style={{
            position: 'relative', background: '#fff', borderRadius: '16px',
            boxShadow: '0 4px 24px rgba(0,0,0,0.08)', overflow: 'hidden',
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
          {signatures.map((sig, i) => (
            <div key={i} style={{ position: 'absolute', left: `${sig.x}%`, top: `${sig.y}%`, transform: 'translate(-50%, -50%)', pointerEvents: 'none' }}>
              <img src={sig.sigImage} style={{ height: '60px', filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.2))' }} />
            </div>
          ))}
        </div>
      </div>

      {showModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: '#fff', borderRadius: '20px', padding: '40px', width: '520px', boxShadow: '0 20px 60px rgba(0,0,0,0.3)' }}>
            <div style={{ width: '36px', height: '3px', background: '#F5A65B', marginBottom: '20px', borderRadius: '2px' }} />
            <h3 style={{ fontSize: '1.3rem', fontWeight: '700', color: '#1C1C1E', marginBottom: '24px' }}>Create Your Signature</h3>
            <div style={{ display: 'flex', marginBottom: '24px', border: '1.5px solid #F0EDE9', borderRadius: '10px', overflow: 'hidden' }}>
              {['draw', 'type'].map(tab => (
                <button key={tab} onClick={() => setModalTab(tab)}
                  style={{ flex: 1, padding: '10px', border: 'none', background: modalTab === tab ? '#1C1C1E' : '#fff', color: modalTab === tab ? '#F5A65B' : '#888', fontWeight: '700', cursor: 'pointer', fontFamily: 'Georgia, serif', fontSize: '0.9rem', textTransform: 'capitalize' }}>
                  {tab === 'draw' ? 'Draw' : 'Type'}
                </button>
              ))}
            </div>
            {modalTab === 'draw' ? (
              <div>
                <div style={{ border: '1.5px solid #F0EDE9', borderRadius: '12px', overflow: 'hidden', marginBottom: '16px' }}>
                  <canvas ref={sigCanvasRef} width={440} height={160}
                    onMouseDown={startDraw} onMouseMove={draw} onMouseUp={stopDraw} onMouseLeave={stopDraw}
                    style={{ display: 'block', background: '#F8F6F3', cursor: 'crosshair', width: '100%' }} />
                </div>
                <button onClick={clearCanvas} style={{ background: 'transparent', border: 'none', color: '#aaa', fontSize: '0.85rem', cursor: 'pointer', fontFamily: 'Georgia, serif' }}>Clear</button>
              </div>
            ) : (
              <div>
                <input type="text" placeholder="Type your full name" value={typedName} onChange={e => setTypedName(e.target.value)}
                  style={{ width: '100%', border: '1.5px solid #F0EDE9', borderRadius: '10px', padding: '12px 14px', fontSize: '0.95rem', marginBottom: '16px', boxSizing: 'border-box', fontFamily: 'Georgia, serif', outline: 'none' }} />
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {CURSIVE_FONTS.map(f => (
                    <div key={f.name} onClick={() => setSelectedFont(f.name)}
                      style={{ border: `1.5px solid ${selectedFont === f.name ? '#F5A65B' : '#F0EDE9'}`, borderRadius: '10px', padding: '12px 16px', cursor: 'pointer', background: selectedFont === f.name ? '#FEF3E8' : '#fff' }}>
                      <span style={{ fontFamily: f.name, fontSize: '1.8rem', color: '#1C1C1E' }}>{typedName || 'Your Name'}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
            <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
              <button onClick={() => setShowModal(false)}
                style={{ flex: 1, background: '#F8F6F3', color: '#888', border: 'none', borderRadius: '10px', padding: '12px', fontWeight: '700', cursor: 'pointer', fontFamily: 'Georgia, serif' }}>
                Cancel
              </button>
              <button onClick={handleConfirmSignature}
                style={{ flex: 2, background: '#F5A65B', color: '#fff', border: 'none', borderRadius: '10px', padding: '12px', fontWeight: '700', cursor: 'pointer', fontFamily: 'Georgia, serif', fontSize: '1rem' }}>
                Place Signature
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}