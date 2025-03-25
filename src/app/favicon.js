import { ImageResponse } from 'next/og';

export const size = {
  width: 32,
  height: 32,
};

export const contentType = 'image/x-icon';

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
          background: '#ff5722',
          borderRadius: '50%',
          fontSize: 24,
          fontWeight: 'bold',
        }}
      >
        S
      </div>
    ),
    size
  );
} 