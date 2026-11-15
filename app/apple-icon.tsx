import { ImageResponse } from 'next/og';

export const size = { width: 180, height: 180 };
export const contentType = 'image/png';

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div style={{
        width: '100%', height: '100%', display: 'flex',
        background: '#075553', borderRadius: 34, alignItems: 'center',
        justifyContent: 'center', position: 'relative'
      }}>
        <div style={{
          display: 'flex', width: 114, height: 114, border: '10px solid #faf9f1',
          borderRadius: 12, alignItems: 'center', justifyContent: 'center'
        }}>
          <div style={{
            display: 'flex', width: 68, height: 88, border: '5px solid #c4e9bd',
            backgroundColor: '#0c6661'
          }} />
        </div>
        <div style={{
          position: 'absolute', width: 42, height: 102, left: 22, top: 38,
          background: '#faf9f1', borderRadius: 8, transform: 'rotate(-12deg)'
        }} />
        <div style={{
          position: 'absolute', right: 33, bottom: 39, width: 75, height: 12,
          borderRadius: 30, background: '#c5ec78', transform: 'rotate(-17deg)'
        }} />
      </div>
    ),
    { ...size }
  );
}
