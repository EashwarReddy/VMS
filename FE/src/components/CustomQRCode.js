import React, { forwardRef } from 'react';
import QRCode from 'qrcode.react';

const CustomQRCode = forwardRef(({ id, value, logo }, ref) => {
  return (
    <div
      style={{
        position: 'relative',
        width: '200px',
        height: '200px',
        border: '2px solid #000',
        borderRadius: '5px',
        padding: '10px',
        display: 'none'
      }}
    >
      <QRCode id={id} value={value} size={180} ref={ref} />
      <img
        src={logo}
        alt="Logo"
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '80px',
          height: 'auto',
          borderRadius: '50%',
          zIndex: 1,
        }}
      />
    </div>
  );
});

export default CustomQRCode;
