// utils/mask.js
function maskGovtId(id) {
    if (!id) return '';
    return id.replace(/\d(?=\d{4})/g, 'X');
    // "676324657456132" → "XXXXXXXXXXX6132"
  }
  
  function maskPhone(phone) {
    if (!phone) return '';
    return phone.replace(/.(?=.{4})/g, 'X');
    // "9565698456" → "XXXXXX8456"
  }
  
  module.exports = { maskGovtId, maskPhone };
  