
var readline = require('./readline');
var Client = require('ssh2').Client;

async function userInput() {
  var username = await readline("username");
  var password = await readline("password");
  var ssid = await readline("ssid");
  var passphrase = await readline("passphrase");

  return {
    username: username,
    password: password,
    ssid: ssid,
    passphrase: passphrase
  };
}

function sshExec(conn, command) {
  return new Promise((resolve, reject) => {
    console.log(`exec: ${command}`);
    conn.exec(command, function(err, stream) {
      if (err) reject(err);

      let result = {command: command};

      stream.on('close', function(code, signal) {
        console.log('Stream :: close :: code: ' + code + ', signal: ' + signal);
        result.code = code;
        result.signal = signal;
        resolve(result);
        // conn.end();
      }).on('data', function(data) {
        // resolve({stdout: data});
        result.stdout = data;
      }).stderr.on('data', function(data) {
        // resolve({stderr: data});
        result.stderr = data;
      });
    });
  })
}

userInput()
.then((result) => {

  var username = result.username;
  var password = result.password;
  var ssid = result.ssid;
  var passphrase = result.passphrase;

  console.log(`user: ${result.username}`);
  console.log(`password: ${result.password}`);
  console.log(`ssid: ${result.ssid}`);
  console.log(`passphrase: ${result.passphrase}`);

  var conn = new Client();

  conn.on('ready', function() {
    console.log('Client :: ready');

    var wpaConfigBase = 
    'ctrl_interface=DIR=/var/run/wpa_supplicant GROUP=netdev\n'+
    'update_config=1\n';

    // sshExec(conn, 'uptime')
    sshExec(conn, `echo "${wpaConfigBase}" | sudo tee /etc/wpa_supplicant/wpa_supplicant.conf`)
    .then((result) => {
      if(result.stdout) {
        console.log('STDOUT: ' + result.stdout);
      }
      else if(result.stderr) {
        console.log('STDERR: ' + result.stderr);
      }

      if(result.code == 0) {
        return sshExec(conn, `wpa_passphrase "${ssid}" "${passphrase}" | sudo tee -a /etc/wpa_supplicant/wpa_supplicant.conf`);
      }
      else {
        return Promise.reject(result);
      }
    })
    .then((result) => {
      if(result.stdout) {
        console.log('STDOUT: ' + result.stdout);
      }
      else if(result.stderr) {
        console.log('STDERR: ' + result.stderr);
      }

      if(result.code == 0) {
        return sshExec(conn, `sudo systemctl restart wpa_supplicant`);
      }
      else {
        return Promise.reject(result);
      }
    })
    .then((result) => {
      if(result.stdout) {
        console.log('STDOUT: ' + result.stdout);
      }
      else if(result.stderr) {
        console.log('STDERR: ' + result.stderr);
      }

      if(result.code == 0) {
        return sshExec(conn, `sudo systemctl restart dhcpcd`);
      }
      else {
        return Promise.reject(result);
      }
    })
    .then((result) => {
      if(result.stdout) {
        console.log('STDOUT: ' + result.stdout);
      }
      else if(result.stderr) {
        console.log('STDERR: ' + result.stderr);
      }

      return sshExec(conn, 'uptime');
    })
    .then((result) => {
      if(result.stdout) {
        console.log('STDOUT: ' + result.stdout);
      }
      else if(result.stderr) {
        console.log('STDERR: ' + result.stderr);
      }

      conn.end();
    })
    .catch((result) =>{
      console.log(`Command '${result.command} failed with result code: ${result.code}'`)
      if(result.stdout) {
        console.log('STDOUT: ' + result.stdout);
        return Promise.resolve()
      }
      else if(result.stderr) {
        console.log('STDERR: ' + result.stderr);
        return Promise.reject(result)
      }
    })
  }).connect({
    host: '10.42.0.64',
    port: 22,
    username: username,
    password: password
    // privateKey: require('fs').readFileSync('/here/is/my/key')
  });

})