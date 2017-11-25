import resolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';
import buble from 'rollup-plugin-buble';
import uglify from 'rollup-plugin-uglify';

export default [
  {
    input: 'src/main.jsx',
    output: {
      file: 'lib/index.umd.js',
      format: 'umd',
    },
    name: 'rrxjs',
    plugins: [
      resolve({ browser: true }),
      commonjs(),
      buble({
        objectAssign: 'Object.assign',
      }),
    ],
    external: ['react'],
    globals: {
      react: 'React',
    },
  },
  {
    input: 'src/main.jsx',
    output: {
      file: 'lib/index.umd.min.js',
      format: 'umd',
    },
    name: 'rrxjs',
    plugins: [
      resolve({ browser: true }),
      commonjs(),
      uglify(),
      buble({
        objectAssign: 'Object.assign',
      }),
    ],
    external: ['react'],
    globals: {
      react: 'React',
    },
  },
  {
    input: 'src/main.jsx',
    output: [
      { file: 'lib/index.cjs.js', format: 'cjs' },
      { file: 'lib/index.esm.js', format: 'es' },
    ],
    plugins: [
      buble({
        objectAssign: 'Object.assign',
      }),
    ],
  },
];
