// Helper: sanitize and block special characters
function cleanString(value) {
    if (typeof value !== "string") return value;
    return value
      .replace(/<[^>]*>?/gm, "") // strip HTML tags
      .replace(/[^a-zA-Z0-9 .,_-]/g, "") // allow only alphanumeric + space + . , _ -
      .trim();
  }
  
  module.exports = { cleanString };