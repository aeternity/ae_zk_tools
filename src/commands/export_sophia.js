import ejs from 'ejs';
import path from 'path';
import url from 'url';
import fs from 'fs';
import chalk from 'chalk';

const __dirname = path.dirname(url.fileURLToPath(import.meta.url));

export async function exportSophiaVerifier(verificationKeyFile, verifierFile, options){
  if (!(options.zokrates || options.snarkjs)) {
    console.log(chalk.red(`ERROR: Unknown verifier key type, specify '-j' OR '-z'`));
    return
  }
  console.log(chalk.blue(`Exporting Sophia verifier for ${verificationKeyFile} into ${verifierFile}...\n`));

  if (!fs.existsSync(verificationKeyFile)){
    console.log(chalk.red.bold(`ERROR: Could not find the Verification Key in '${verificationKeyFile}`));
    return
  }

  const verificationKeyData = await fs.promises.readFile(verificationKeyFile, "utf8");
  var verificationKey;
  try {
    verificationKey = JSON.parse(verificationKeyData);
  } catch (e) {
    console.log(chalk.red.bold(`ERROR: Invalid JSON input: ${e.message}`));
    return
  }

  if (options.snarkjs) {
    // Uses different variable names in JSON - do a quick translation...
    verificationKey.alpha = verificationKey.vk_alpha_1;
    verificationKey.beta = verificationKey.vk_beta_2;
    verificationKey.gamma = verificationKey.vk_gamma_2;
    verificationKey.delta = verificationKey.vk_delta_2;
    verificationKey.gamma_abc = verificationKey.IC;
  }

  const template = await fs.promises.readFile(path.join(__dirname, '../../templates', 'sophia_verifier_groth16.aes.ejs'), 'utf8');
  const verifierCode = await ejs.render(template, verificationKey);

  fs.writeFileSync(verifierFile, verifierCode, "utf8");
  console.log(chalk.greenBright.bold(`Sophia verifier written to ${verifierFile}`));
}


function to_n(sn) {
  return BigInt(sn);
}

function sdk_n(n) {
  return `${to_n(n)}n`;
}

function cli_n(n) {
  return `0x${to_n(n).toString(16)}`;
}

export async function exportSophiaCalldata(proofFile, publicFile, options){
  if (!(options.zokrates || options.snarkjs)) {
    console.log(chalk.red(`ERROR: Unknown verifier key type, specify '-j' OR '-z'`));
    return
  }

  if (!fs.existsSync(proofFile)){
    console.log(chalk.red.bold(`ERROR: Could not find the Proof in '${proofFile}`));
    return
  }


  const proofData = await fs.promises.readFile(proofFile, "utf8");
  var proof;
  try {
    proof = JSON.parse(proofData);
  } catch (e) {
    console.log(chalk.red.bold(`ERROR: Invalid JSON input in ${proofFile}: ${e.message}`));
    return
  }

  if (publicFile) {
    if (!fs.existsSync(publicFile)){
      console.log(chalk.red.bold(`ERROR: Could not find the Public inputs in '${publicFile}`));
      return
    }

    const publicData = await fs.promises.readFile(publicFile, "utf8");
    try {
      proof.inputs = JSON.parse(publicData);
    } catch (e) {
      console.log(chalk.red.bold(`ERROR: Invalid JSON input in ${publicFile}: ${e.message}`));
      return
    }
  }

  if (options.snarkjs) {
    proof.proof = {};
    proof.proof.a = proof.pi_a;
    proof.proof.b = proof.pi_b;
    proof.proof.c = proof.pi_c;
  }

  var calldata;
  if (options.compiler) {
    var inputs = "";
    for (let i=0; i<proof.inputs.length; i++) {
        if (inputs != "") inputs = inputs + ",";
        inputs = inputs + cli_n(proof.inputs[i]);
    }

    calldata = `aesophia_cli --create_calldata --call "verify([${inputs}], ` +
        `{a = (${cli_n(proof.proof.a[0])}, ${cli_n(proof.proof.a[1])}),` +
        ` b = ((${cli_n(proof.proof.b[0][0])}, ${cli_n(proof.proof.b[0][1])}), (${cli_n(proof.proof.b[1][0])}, ${cli_n(proof.proof.b[1][1])})),` +
        ` c = (${cli_n(proof.proof.c[0])}, ${cli_n(proof.proof.c[1])})})" verifier.aes`;

  } else {
    proof.inputs = proof.inputs.map(sdk_n);
    proof.proof.a = proof.proof.a.map(sdk_n);
    proof.proof.b[0] = proof.proof.b[0].map(sdk_n);
    proof.proof.b[1] = proof.proof.b[1].map(sdk_n);
    proof.proof.c = proof.proof.c.map(sdk_n);

    const template = await fs.promises.readFile(path.join(__dirname, '../../templates', 'sophia_calldata_sdk.ejs'), 'utf8');
    calldata = await ejs.render(template, proof);
  }

  console.log(chalk.greenBright(`Calldata for ${proofFile} and ${publicFile}:`));
  console.log(calldata);
}