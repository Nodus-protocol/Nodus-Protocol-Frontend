import {
  Contract,
  TransactionBuilder,
  BASE_FEE,
  rpc,
  xdr,
} from "@stellar/stellar-sdk"
import type { UnsignedTx } from "./api"

const RPC_URL =
  process.env.NEXT_PUBLIC_SOROBAN_RPC_URL ?? "https://soroban-testnet.stellar.org"

const NETWORK_PASSPHRASE =
  process.env.NEXT_PUBLIC_STELLAR_NETWORK === "mainnet"
    ? "Public Global Stellar Network ; September 2015"
    : "Test SDF Network ; September 2015"

// Lazily constructed: pages that use this are client components, but Next.js
// still evaluates this module during static generation at build time, before
// real env vars exist — constructing the RPC client eagerly crashes the build.
let serverInstance: rpc.Server | undefined

function getServer(): rpc.Server {
  if (!serverInstance) {
    serverInstance = new rpc.Server(RPC_URL, {
      allowHttp: RPC_URL.startsWith("http://"),
    })
  }
  return serverInstance
}

export type SignTx = (xdrBase64: string) => Promise<string>

export function signWithFreighter(xdrBase64: string): Promise<string> {
  if (!window.freighter) throw new Error("Freighter not detected")
  return window.freighter.signTransaction(xdrBase64, {
    networkPassphrase: NETWORK_PASSPHRASE,
  })
}

/**
 * Assemble, simulate, sign, submit, and poll a contract invocation prepared
 * by the backend (`pool.buildSwap` / `buildAddLiquidity` / `buildRemoveLiquidity`).
 *
 * `unsignedTx.args` is expected to be an array of base64-encoded ScVal XDR
 * strings — the backend is the source of truth for how each argument is
 * typed (u32 vs i128 vs Address, etc.), so it encodes them rather than the
 * client guessing types from raw JS values.
 */
export async function signAndSubmit(
  unsignedTx: UnsignedTx,
  sourceAccount: string,
  signTx: SignTx,
): Promise<string> {
  const server = getServer()
  const account = await server.getAccount(sourceAccount)
  const contract = new Contract(unsignedTx.contract_id)

  const rawArgs = Array.isArray(unsignedTx.args) ? unsignedTx.args : []
  const scArgs = rawArgs.map((arg) => xdr.ScVal.fromXDR(arg as string, "base64"))

  const tx = new TransactionBuilder(account, {
    fee: BASE_FEE,
    networkPassphrase: NETWORK_PASSPHRASE,
  })
    .addOperation(contract.call(unsignedTx.function, ...scArgs))
    .setTimeout(60)
    .build()

  const sim = await server.simulateTransaction(tx)
  if (rpc.Api.isSimulationError(sim)) {
    throw new Error(`Simulation failed: ${sim.error}`)
  }

  const assembled = rpc.assembleTransaction(tx, sim).build()
  const signedXdr = await signTx(assembled.toXDR())
  const signedTx = TransactionBuilder.fromXDR(signedXdr, NETWORK_PASSPHRASE)

  let sendResult = await server.sendTransaction(signedTx)

  // TRY_AGAIN_LATER means the node didn't accept this submission attempt at
  // all (nothing is in-flight yet) — retry the submission itself rather than
  // falling through to poll a hash that was never actually queued.
  for (let attempt = 0; sendResult.status === "TRY_AGAIN_LATER" && attempt < 3; attempt++) {
    await new Promise((r) => setTimeout(r, 1000))
    sendResult = await server.sendTransaction(signedTx)
  }

  if (sendResult.status === "ERROR") {
    throw new Error(`Submission failed: ${JSON.stringify(sendResult.errorResult)}`)
  }
  if (sendResult.status === "TRY_AGAIN_LATER") {
    throw new Error("Network is busy — please try the swap again in a moment")
  }

  const hash = sendResult.hash
  for (let i = 0; i < 30; i++) {
    await new Promise((r) => setTimeout(r, 1000))
    const status = await server.getTransaction(hash)
    if (status.status === rpc.Api.GetTransactionStatus.SUCCESS) return hash
    if (status.status === rpc.Api.GetTransactionStatus.FAILED) {
      throw new Error(`Transaction failed: ${hash}`)
    }
  }
  throw new Error(`Transaction timed out: ${hash}`)
}
