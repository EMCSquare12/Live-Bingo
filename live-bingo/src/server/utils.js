function generateUniqueNumbers(min, max, count) {
  const uniqueNumbers = new Set();

  while (uniqueNumbers.size < count) {
    uniqueNumbers.add(Math.floor(Math.random() * (max - min + 1)) + min);
  }

  return Array.from(uniqueNumbers);
}

function generateCard() {
  return {
    B: generateUniqueNumbers(1, 15, 5),
    I: generateUniqueNumbers(16, 30, 5),
    N: generateUniqueNumbers(31, 45, 5),
    G: generateUniqueNumbers(46, 60, 5),
    O: generateUniqueNumbers(61, 75, 5),
  };
}

module.exports = { generateUniqueNumbers, generateCard };