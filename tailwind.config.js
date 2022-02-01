module.exports = {
  purge: ["./src/**/*.{js,jsx,ts,tsx,mdx}", "./content/blog/**/*.{mdx}"],
  theme: {},
  variants: {},
  plugins: [],
  theme: {
    fontFamily: {
      sans: ["ui-sans-serif", "system-ui"],
      serif: ["ui-serif", "Georgia"],
      mono: ["ui-monospace", "SFMono-Regular"],
      display: ['"Rosario"'],
      body: ['"Crimson Text"', "ui-serif"],
    },
    borderWidth: {
      DEFAULT: "1px",
      0: "0",
      2: "2px",
      4: "4px",
      8: "8px",
      30: "30px",
      50: "50px",
    },
  },
}
