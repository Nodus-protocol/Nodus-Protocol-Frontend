import {
  toBaseUnits,
  fromBaseUnits,
  computeRate,
  applySlippage,
  MathError,
  roundTripDisplay,
} from "../../lib/math"

describe("toBaseUnits", () => {
  it("converts whole display amounts", () => {
    expect(toBaseUnits("1", 7)).toBe("10000000")
    expect(toBaseUnits("0", 6)).toBe("0")
  })

  it("converts fractional display amounts", () => {
    expect(toBaseUnits("1.5", 7)).toBe("15000000")
    expect(toBaseUnits("0.5", 6)).toBe("500000")
    expect(toBaseUnits("1.0000001", 7)).toBe("10000001")
  })

  it("truncates excess precision without rounding", () => {
    expect(toBaseUnits("1.123456789", 7)).toBe("11234567")
    expect(toBaseUnits("0.00000019", 7)).toBe("1")
  })

  it("handles leading zeros and empty fraction", () => {
    expect(toBaseUnits("01.5", 7)).toBe("15000000")
    expect(toBaseUnits("1.", 7)).toBe("10000000")
    expect(toBaseUnits(".5", 7)).toBe("5000000")
  })

  it("rejects invalid input", () => {
    expect(() => toBaseUnits("", 7)).toThrow(MathError)
    expect(() => toBaseUnits(".", 7)).toThrow(MathError)
    expect(() => toBaseUnits("1..5", 7)).toThrow(MathError)
    expect(() => toBaseUnits("abc", 7)).toThrow(MathError)
    expect(() => toBaseUnits("1e5", 7)).toThrow(MathError)
    expect(() => toBaseUnits("-1", 7)).toThrow(MathError)
    expect(() => toBaseUnits("1 0", 7)).toThrow(MathError)
  })

  it("handles very large amounts exactly", () => {
    // beyond Number.MAX_SAFE_INTEGER (9007199254740991 ~ 9e15)
    expect(toBaseUnits("999999999999.9999999", 7)).toBe("9999999999999999999")
  })
})

describe("fromBaseUnits", () => {
  it("formats base units as display strings", () => {
    expect(fromBaseUnits("15000000", 7)).toBe("1.5000000")
    expect(fromBaseUnits("10000000", 7, 2)).toBe("1.00")
  })

  it("pads fraction with zeros", () => {
    expect(fromBaseUnits("1", 7, 7)).toBe("0.0000001")
    expect(fromBaseUnits("0", 6, 6)).toBe("0.000000")
  })

  it("handles very large values", () => {
    expect(fromBaseUnits("9999999999999999999", 7, 2)).toBe("999999999999.99")
  })
})

describe("round-trip property", () => {
  it("round-trips every valid display amount", () => {
    const samples = [
      "0", "0.5", "1", "1.5", "10", "0.0000001", "999999999999.9999999",
      "12345.6789012", "0.1234567", "1000000.0000001",
    ]
    for (const s of samples) {
      expect(roundTripDisplay(s, 7)).toBe(true)
    }
  })

  it("round-trips with locale separators stripped first", () => {
    // "1,000.5" → "1000.5" — parsers should accept locale separators
    const clean = "1000.5"
    expect(roundTripDisplay(clean, 7)).toBe(true)
  })
})

describe("computeRate", () => {
  it("computes rate as output divided by input", () => {
    // 5 USDC (5000000 raw) → 1 XLM (10000000 stroops) = 5 USDC/XLM
    expect(computeRate("5000000", "10000000", 6, 7)).toBe("5.0000000")
  })

  it("computes rates greater than 1", () => {
    // 10 USDC (10000000 raw) → 1 XLM (10000000 stroops) = 10 USDC/XLM
    expect(computeRate("10000000", "10000000", 6, 7)).toBe("10.0000000")
  })

  it("handles the reversed direction", () => {
    // 1 XLM (10000000 stroops) → 5 USDC (5000000 raw) = 0.2 XLM/USDC
    expect(computeRate("10000000", "5000000", 7, 6)).toBe("0.2000000")
  })

  it("keeps precision for extreme ratios", () => {
    // 1 raw (0.000001 USDC) → 1 XLM (10000000 stroops) = 0.000001 USDC/XLM
    const rate = computeRate("1", "10000000", 6, 7)
    expect(rate.startsWith("0.")).toBe(true)
    expect(rate).toBe("0.0000010")
  })

  it("throws on zero input", () => {
    expect(() => computeRate("100", "0", 6, 7)).toThrow(MathError)
  })

  it("returns 0 when output is 0", () => {
    expect(computeRate("0", "100", 6, 7)).toBe("0")
  })
})

describe("applySlippage", () => {
  it("applies bps deduction", () => {
    // 50 bps = 0.5%
    expect(applySlippage("1000000", 50)).toBe("995000")
    expect(applySlippage("1000000", 100)).toBe("990000")
  })

  it("returns the same amount for zero slippage", () => {
    expect(applySlippage("1000000", 0)).toBe("1000000")
  })

  it("rounds down (safety direction)", () => {
    // 1 bps of 999 = 0.0999 → floor(BigInt) = 0 → deduction 0
    expect(applySlippage("999", 1)).toBe("999")
    // full slippage
    expect(applySlippage("10000", 10000)).toBe("0")
  })

  it("rejects out-of-range slippage", () => {
    expect(() => applySlippage("100", -1)).toThrow(MathError)
    expect(() => applySlippage("100", 10001)).toThrow(MathError)
  })
})