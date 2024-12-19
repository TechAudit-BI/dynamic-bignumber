const config = {
  presets: [
    [
      '@babel/preset-env',
      {
        useBuiltIns: false,
        targets: '> 0.25%, not dead',
      },
    ],
    '@babel/preset-react',
    '@babel/preset-typescript',
  ],
  plugins: [
    '@emotion/babel-plugin',
    '@babel/plugin-syntax-numeric-separator',
  ],
};

module.exports = config;
