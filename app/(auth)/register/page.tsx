import React from 'react'
export default function RegisterPage() {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#0f172a', color: '#fff' }}>
      <div style={{ background: '#1e293b', padding: '2rem', borderRadius: '12px', width: '100%', maxWidth: '400px' }}>
        <h2 style={{ marginBottom: '1.5rem', textAlign: 'center' }}>Daftar Akun Baru</h2>
        <form style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <input type="text" placeholder="Nama Lengkap" style={{ padding: '0.75rem', borderRadius: '8px', border: '1px solid #475569', background: '#0f172a', color: '#fff' }} />
          <input type="email" placeholder="Email" style={{ padding: '0.75rem', borderRadius: '8px', border: '1px solid #475569', background: '#0f172a', color: '#fff' }} />
          <input type="password" placeholder="Password" style={{ padding: '0.75rem', borderRadius: '8px', border: '1px solid #475569', background: '#0f172a', color: '#fff' }} />
          <button type="button" style={{ padding: '0.75rem', borderRadius: '8px', background: '#10b981', color: '#fff', fontWeight: 600, border: 'none', cursor: 'pointer' }}>Daftar</button>
        </form>
      </div>
    </div>
  )
}