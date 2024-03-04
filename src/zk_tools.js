#! /usr/bin/env node

import { Command } from 'commander';
import { exportSophiaVerifier, exportSophiaCalldata } from './commands/commands.js';
const program = new Command();

program
  .command('verifier')
  .description('Export Sophia verifier code')
  .argument('<verication-key>', 'JSON file containing verification key values')
  .argument('[verifier-contract]', 'Output Sophia file for verifier contract code', './verifier.aes')
  .option('-z, --zokrates', 'the input verification key is for a Zokrates circuit')
  .option('-j, --snarkjs', 'the input verification key is for a Circom/snarkjs circuit')
  .action(exportSophiaVerifier);

program
  .command('calldata')
  .description('Create Sophia/FATE calldata')
  .argument('<proof>', 'JSON file containing the proof')
  .argument('[public inputs]', 'JSON file containing the public inputs (if not already in proof file)')
  .option('-c, --compiler', 'format calldata for use with the (CLI) Sophia compiler')
  .option('-z, --zokrates', 'the proof is in Zokrates format')
  .option('-j, --snarkjs', 'the proof is in Circom/snarkjs format')
  .action(exportSophiaCalldata)



program.parse();