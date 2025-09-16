function generateUniqueNumbers(min, max, count) {
  const uniqueNumbers = new Set();

  while (uniqueNumbers.size < count) {
    uniqueNumbers.add(Math.floor(Math.random() * (max - min + 1)) + min);
  }

  return Array.from(uniqueNumbers);
}

function generateCard() {
  const nColumn = generateUniqueNumbers(31, 45, 4);
  nColumn.splice(2, 0, null); // Insert null for the FREE space at the middle index

  return {
    B: generateUniqueNumbers(1, 15, 5),
    I: generateUniqueNumbers(16, 30, 5),
    N: nColumn,
    G: generateUniqueNumbers(46, 60, 5),
    O: generateUniqueNumbers(61, 75, 5),
  };
}

module.exports = { generateUniqueNumbers, generateCard };