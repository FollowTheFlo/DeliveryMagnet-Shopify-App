// jest.config.js
module.exports = {
  setupFilesAfterEnv: ["./node_modules/jest-enzyme/lib/index.js"],
  testPathIgnorePatterns: ["<rootDir>/.next/", "<rootDir>/node_modules/"],
  moduleNameMapper: {
    "\\.(scss|sass|css)$": "identity-obj-proxy",
  },
};
