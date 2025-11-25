'use client';

import { useEffect, useState } from 'react';

interface BlobProps {
  className: string;
  style?: React.CSSProperties;
}

function Blob({ className, style }: BlobProps) {
  return <div className={`blob ${className}`} style={style} />;
}

export default function FloatingBlobs() {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Don't render on server to avoid hydration mismatch
  if (!isClient) {
    return null;
  }

  return (
    <div className="blob-bg">
      {/* Primary blob - top left */}
      <Blob 
        className="blob-1"
        style={{
          width: '600px',
          height: '600px',
          background: '#FFE4D6',
          top: '-10%',
          left: '-10%',
        }}
      />
      
      {/* Secondary blob - bottom right */}
      <Blob 
        className="blob-2"
        style={{
          width: '500px',
          height: '500px',
          background: '#E0F2E9',
          bottom: '-10%',
          right: '-10%',
          animationDelay: '-5s',
        }}
      />
      
      {/* Tertiary blob - center */}
      <Blob 
        className="blob-3"
        style={{
          width: '300px',
          height: '300px',
          background: '#FFF4D6',
          top: '40%',
          left: '40%',
          opacity: 0.5,
          animationDelay: '-10s',
        }}
      />
    </div>
  );
}