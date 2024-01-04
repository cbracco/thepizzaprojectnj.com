module.exports = ({ env }) => ({
    plugins: {
        'postcss-preset-env': {},
        'postcss-import': {},
        autoprefixer: {},
        ...(env === 'production' && { cssnano: {} }),
    },
});
// module.exports = {
//     plugins: [
//         require('postcss-import'),
//         require('autoprefixer'),
//     ],
// };
