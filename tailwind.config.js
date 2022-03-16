module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./content/blog/**/*.{md,mdx}",
    "./node_modules/xari-boggle/dist/*.{html,js}",
  ],
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
