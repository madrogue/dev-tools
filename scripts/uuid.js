// function generateUUID() {
//   //const uuid = uuidv4();
//   const uuid = uuid.v4();

//   return {
//     uuid,
//     uuidWithoutDashes: uuid.replace(/-/g, ''),
//   };
// }

async function generateUUID() {
  try {
    const response = await fetch('https://www.uuidgenerator.net/api/version4');
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }

    const uuid = await response.text();

    return {
      uuid,
      uuidWithoutDashes: uuid.replace(/-/g, ''),
    };
  } catch (error) {
    console.error('Failed to fetch UUID:', error);
  }
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

  let token = '';
  for (let i = 0; i < length; i++) {
    const randIndex = Math.floor(Math.random() * charset.length);
    token += charset[randIndex];
  }
  document.getElementById('tokenOutput').value = token;
}