const layout = require('./layout.json');

module.exports = {
  plugins: {
    'postcss-preset-mantine': {},
    'postcss-simple-vars': {
      variables: {
        'mantine-breakpoint-xs': layout.breakpoints.min.xs,
        'mantine-breakpoint-sm': layout.breakpoints.min.sm,
        'mantine-breakpoint-md': layout.breakpoints.min.md,
        'mantine-breakpoint-lg': layout.breakpoints.min.lg,
        'mantine-breakpoint-xl': layout.breakpoints.min.xl
      }
    }
  }
};
