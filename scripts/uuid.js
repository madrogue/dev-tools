function generateUUID() {
  const uuid = crypto.randomUUID();
  return { uuid, uuidWithoutDashes: uuid.replace(/-/g, '') };
}

function generateToken() {
  const length = parseInt(document.getElementById('tokenLength').value) || 16;
  const useLower = document.getElementById('tokenLowercase').checked;
  const useUpper = document.getElementById('tokenUppercase').checked;
  const useNumbers = document.getElementById('tokenNumbers').checked;
  const useSymbols = document.getElementById('tokenSymbols').checked;

  let charset = '';
  if (useLower) charset += 'abcdefghijklmnopqrstuvwxyz';
  if (useUpper) charset += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  if (useNumbers) charset += '0123456789';
  if (useSymbols) charset += '!@#$%^&*()-_=+[]{}|;:,.<>?/~`';

  if (!charset) {
    document.getElementById('tokenOutput').value = '';
    alert('Please select at least one character set.');
    return;
  }

  const bytes = new Uint8Array(length);
  crypto.getRandomValues(bytes);
  let token = '';
  for (let i = 0; i < length; i++) {
    token += charset[bytes[i] % charset.length];
  }
  document.getElementById('tokenOutput').value = token;
}
