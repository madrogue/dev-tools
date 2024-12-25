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