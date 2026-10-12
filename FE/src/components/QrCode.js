import React from 'react';
import QRCode from 'qrcode';

const QrCode = ({ data }) => {
  const [qrCode, setQrCode] = React.useState('');

  React.useEffect(() => {
    QRCode.toDataURL(data, (err, url) => {
      if (err) return console.error(err);
      setQrCode(url);
    });
  }, [data]);

  return (
    <div>
      <img src={qrCode} alt="QR Code" />
      {/* Other details you want to display */}
      <p>Booking ID: {data.bookingId}</p>
      <p>Movie: {data.movie}</p>
      <p>Date and Time: {data.dateTime}</p>
      <p>Cinema: {data.cinema}</p>
      <p>Audi: {data.audi}</p>
      <p>Seats: {data.seats}</p>
    </div>
  );
};

export default QrCode;
