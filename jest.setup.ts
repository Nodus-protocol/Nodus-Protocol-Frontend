import "@testing-library/jest-dom"

// React 19 exposes `act` only when isReactActEnvironment is true; the CJS
// production bundle hides it otherwise. Force the test environment flag.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
;(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true

// `jest.requireActual` guard for @testing-library/react act-compat
// eslint-disable-next-line @typescript-eslint/no-explicit-any
;(process as any).env.NODE_ENV = "test"