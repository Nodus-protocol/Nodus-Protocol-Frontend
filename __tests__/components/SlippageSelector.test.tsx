/**
 * @jest-environment jsdom
 */

import { fireEvent, render, screen } from "@testing-library/react"
import "@testing-library/jest-dom"
import { SlippageSelector } from "@/components/SlippageSelector"

describe("SlippageSelector", () => {
  it("rejects malformed custom slippage values without applying partial parses", () => {
    const onChange = jest.fn()
    render(<SlippageSelector value={0.5} onChange={onChange} />)

    const custom = screen.getByPlaceholderText("Custom")
    for (const value of ["1abc", "1,5", "0.5%", "1e2", "0", "51"]) {
      fireEvent.change(custom, { target: { value } })

      expect(onChange).not.toHaveBeenCalled()
      expect(custom).toHaveAttribute("aria-invalid", "true")
      expect(screen.getByText("Invalid custom slippage")).toBeInTheDocument()
    }
  })

  it("applies clean decimal custom slippage values", () => {
    const onChange = jest.fn()
    render(<SlippageSelector value={0.5} onChange={onChange} />)

    const custom = screen.getByPlaceholderText("Custom")
    fireEvent.change(custom, { target: { value: "1.5" } })
    fireEvent.change(custom, { target: { value: ".5" } })

    expect(onChange).toHaveBeenNthCalledWith(1, 1.5)
    expect(onChange).toHaveBeenNthCalledWith(2, 0.5)
    expect(custom).toHaveAttribute("aria-invalid", "false")
  })
})
