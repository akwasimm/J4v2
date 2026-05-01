import React from 'react'

const ComingSoon = ({ pageName, description }) => {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '60vh',
      gap: '16px',
      color: '#6B7280'
    }}>
      <div style={{
        width: '64px',
        height: '64px',
        borderRadius: '50%',
        background: '#F3F4F6',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '28px'
      }}>
        🚧
      </div>
      <h2 style={{
        fontSize: '20px',
        fontWeight: '600',
        color: '#111827',
        margin: 0
      }}>
        {pageName || 'Coming Soon'}
      </h2>
      <p style={{
        fontSize: '14px',
        color: '#6B7280',
        margin: 0,
        textAlign: 'center',
        maxWidth: '300px'
      }}>
        {description || 'This page is being connected to the backend. Check back soon.'}
      </p>
      <div style={{
        padding: '6px 16px',
        background: '#F3F4F6',
        borderRadius: '20px',
        fontSize: '12px',
        color: '#9CA3AF'
      }}>
        Backend ready • Frontend integration pending
      </div>
    </div>
  )
}

export default ComingSoon
