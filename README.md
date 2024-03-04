## ZK Tools

CLI tools for ZK-proofs in Aeternity (Groth16/BLS12-381), currently supports two commands (with input from both snarkjs/Circom and Zokrates):

### verifier

```
Usage: zk_tools verifier [options] <verication-key> [verifier-contract]

Export Sophia verifier code

Arguments:
  verication-key     JSON file containing verification key values
  verifier-contract  Output Sophia file for verifier contract code (default: "./verifier.aes")

Options:
  -z, --zokrates     the input verification key is for a Zokrates circuit
  -j, --snarkjs      the input verification key is for a Circom/snarkjs circuit
```

### calldata

```
Usage: zk_tools calldata [options] <proof> [public inputs]

Create Sophia/FATE calldata

Arguments:
  proof           JSON file containing the proof
  public inputs   JSON file containing the public inputs (if not already in proof file)

Options:
  -c, --compiler  format calldata for use with the (CLI) Sophia compiler
  -z, --zokrates  the proof is in Zokrates format
  -j, --snarkjs   the proof is in Circom/snarkjs format
```
