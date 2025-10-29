import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../lib/auth';
import { useAppTheme, hexToRgba } from '../../lib/themeUtils';

const SessionDropdown: React.FC = () => {
  const { user, signout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (!user) return null;

  const { primary, contrast } = useAppTheme();
  const rootTextVar =
    typeof window !== 'undefined'
      ? getComputedStyle(document.documentElement).getPropertyValue('--text').trim() || '#000'
      : '#000';

  return (
    <div className="session-dropdown" ref={dropdownRef} style={{ position: 'relative', display: 'inline-block' }}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          background: 'transparent',
          border: 'none',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          fontSize: '14px',
          fontWeight: 600,
          color: primary,
        }}
      >
        {user.email} ▼
      </button>
      {isOpen && (
        <ul
            style={{
              position: 'absolute',
              top: '100%',
              right: 0,
              background: hexToRgba(primary, 0.04),
              border: `1px solid ${hexToRgba(primary, 0.12)}`,
              borderRadius: '6px',
              boxShadow: `0 6px 18px ${hexToRgba(rootTextVar, 0.12)}`,
              listStyle: 'none',
              margin: 0,
              padding: '6px 0',
              minWidth: '160px',
              zIndex: 1000,
            }}
        >
          <li>
            <button
              onClick={() => { setIsOpen(false); /* navigate to profile */ }}
                style={{
                width: '100%',
                textAlign: 'left',
                padding: '8px 16px',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                fontSize: '14px',
                  color: 'var(--text)',
              }}
            >
              Profile
            </button>
          </li>
          <li>
            <button
              onClick={() => { setIsOpen(false); signout(); }}
              style={{
                width: '100%',
                textAlign: 'left',
                padding: '8px 16px',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                fontSize: '14px',
                color: primary,
                fontWeight: 700,
              }}
            >
              Logout
            </button>
          </li>
        </ul>
      )}
    </div>
  );
};

export default SessionDropdown;