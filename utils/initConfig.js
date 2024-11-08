import { randomBytes } from "crypto";

const configVars = {
  General: {
    baseDir: '/api\t# No trailing slash',
    apiSecret: crypto.randomBytes(32),
  },
  Database: {
    dbHost: 'localhost',
    dbPort: '3306',
    dbUser: '',
    dbPasswd: '',
    dbName: '',
  },
};

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
