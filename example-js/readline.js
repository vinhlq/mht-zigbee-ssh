const readline = require('readline');

function createInterface(){
    return readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });
}

module.exports = (question, callback) => {
  const rl = createInterface();
  
  return new Promise((resolve) => {
    rl.question(question + ': ', (answer) => {
      rl.close();
      return callback ? callback(answer) : resolve(answer);
    });
  })
  .catch((err) => {
    rl.close();
    return Promise.reject(err);
  });
}
