import { randomBytes, randomUUID } from 'crypto';

const configVars = {
  General: {
    port: 8080,
    baseDir: '/api\t# No trailing slash',
    apiSecret: randomSecret(),
  },
  Database: {
    dbHost: 'localhost',
    dbPort: '3306',
    dbUser: '',
    dbPasswd: '',
    dbName: '',
    dbUrl: ' # Optional, if set will ignore the above',
  },
};

function randomSecret() {
  const length = 64;
  return randomBytes(length).toString('base64url');
}

function toIni() {
  let str = '';
  Object.keys(configVars).forEach((catKey, i, cat) => {
    let currCat = configVars[catKey];
    str += `# ${catKey}\n`;

    Object.keys(configVars[catKey]).forEach((varKey, i, vars) => {
      str += `${varKey} = ${currCat[varKey]}\n`;
    });
    str += '\n';
  });
  return str;
}

console.log(toIni(configVars));
