module.exports = ({ env }) => ({
    plugins: {
        'postcss-import': {},
        'postcss-preset-env': {},
        ...(env === 'production' && { cssnano: {} }),
    },
});
