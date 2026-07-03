import {
  stroopsToXlm,
  rawToUsdc,
  shortenAddress,
  bpsToPercent,
  compactNumber,
} from "../../lib/format"

describe("stroopsToXlm", () => {
  it("converts 10_000_000 stroops to 1 XLM", () => {
    expect(stroopsToXlm(10_000_000)).toBe("1.00")
  })

  it("converts 0 stroops to 0.00", () => {
    expect(stroopsToXlm(0)).toBe("0.00")
  })

  it("converts 5_000_000 stroops to 0.50", () => {
    expect(stroopsToXlm(5_000_000)).toBe("0.50")
  })

  it("accepts string input", () => {
    expect(stroopsToXlm("10000000")).toBe("1.00")
  })

  it("returns an unavailable marker for nullish input", () => {
    expect(stroopsToXlm(null)).toBe("\u2014")
    expect(stroopsToXlm(undefined)).toBe("\u2014")
  })

  it("returns — for non-numeric input", () => {
    expect(stroopsToXlm("abc")).toBe("—")
  })

  it("preserves up to 7 decimal places", () => {
    expect(stroopsToXlm(1)).toBe("0.0000001")
  })
})

describe("rawToUsdc", () => {
  it("converts 1_000_000 raw to 1.00 USDC", () => {
    expect(rawToUsdc(1_000_000)).toBe("1.00")
  })

  it("converts 0 to 0.00", () => {
    expect(rawToUsdc(0)).toBe("0.00")
  })

  it("accepts string input", () => {
    expect(rawToUsdc("1000000")).toBe("1.00")
  })

  it("returns an unavailable marker for nullish input", () => {
    expect(rawToUsdc(null)).toBe("\u2014")
    expect(rawToUsdc(undefined)).toBe("\u2014")
  })

  it("returns — for non-numeric input", () => {
    expect(rawToUsdc("nan")).toBe("—")
  })
})

describe("shortenAddress", () => {
  it("returns first 5 and last 4 chars with ellipsis", () => {
    const addr = "GABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789ABCDEFGHIJKLMNOPQRSTU"
    expect(shortenAddress(addr)).toBe("GABCD…RSTU")
  })

  it("returns the original string if too short", () => {
    expect(shortenAddress("GABC")).toBe("GABC")
  })

  it("handles empty string", () => {
    expect(shortenAddress("")).toBe("")
  })
})

describe("bpsToPercent", () => {
  it("converts 30 bps to 0.30%", () => {
    expect(bpsToPercent(30)).toBe("0.30%")
  })

  it("converts 100 bps to 1.00%", () => {
    expect(bpsToPercent(100)).toBe("1.00%")
  })

  it("converts 10000 bps to 100.00%", () => {
    expect(bpsToPercent(10_000)).toBe("100.00%")
  })

  it("converts 0 bps to 0.00%", () => {
    expect(bpsToPercent(0)).toBe("0.00%")
  })
})

describe("compactNumber", () => {
  it("formats millions with M suffix", () => {
    expect(compactNumber(1_200_000)).toBe("1.2M")
  })

  it("formats thousands with K suffix", () => {
    expect(compactNumber(5_400)).toBe("5.4K")
  })

  it("formats small numbers without suffix", () => {
    expect(compactNumber(42)).toBe("42")
  })
})
