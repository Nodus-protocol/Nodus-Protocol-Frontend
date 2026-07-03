/**
 * @jest-environment jsdom
 */

import { render, screen } from "@testing-library/react"
import "@testing-library/jest-dom"
import { LPPosition } from "@/components/LPPosition"

describe("LPPosition", () => {
  it("renders unavailable placeholders when redeemed amounts are null or missing", () => {
    render(
      <LPPosition
        data={{
          address: "GABC",
          lp_balance: "100",
          amount_0_redeemed: null,
          token_0: "XLM",
          token_1: "USDC",
          pool_share_bps: 25,
        }}
      />,
    )

    expect(screen.getAllByText("\u2014")).toHaveLength(2)
    expect(screen.queryByText("undefined")).not.toBeInTheDocument()
    expect(screen.queryByText("NaN")).not.toBeInTheDocument()
  })

  it("falls back to stable token names when token symbols are missing", () => {
    render(
      <LPPosition
        data={{
          address: "GABC",
          lp_balance: "100",
          amount_0_redeemed: "10000000",
          amount_1_redeemed: "1000000",
          pool_share_bps: 25,
        }}
      />,
    )

    expect(screen.getByText("TOKEN_0")).toBeInTheDocument()
    expect(screen.getByText("TOKEN_1")).toBeInTheDocument()
  })
})
