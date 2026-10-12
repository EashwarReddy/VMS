import React from 'react';
import QrCode from '../components/QrCode';

const qrCodeSample = () => {
  const data = {
    bookingId: 'WLZ79MJ',
    movie: 'Salaar: Cease Fire - Part 1',
    dateTime: 'Tue, Dec 26, 03:00PM',
    cinema: 'Cinepolis: Sudha Cinemas, Hyderabad',
    audi: 'AUDI 4',
    seats: 'EXECUTIV - H10, H9',
  };

  const qrCodeStyle = {
    width: '200px',
    height: '200px',
  };

  return (
    <div>
      <QrCode data={data} style={qrCodeStyle} />
    </div>
  );
};

export default qrCodeSample;
