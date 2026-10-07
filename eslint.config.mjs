import { dirname } from 'path';
import { fileURLToPath } from 'url';
import { FlatCompat } from '@eslint/eslintrc';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname
});

const eslintConfig = [
  ...compat.extends('next/core-web-vitals', 'next/typescript'),
  {
    rules: {
      // Disable the no-explicit-any rule
      '@typescript-eslint/no-explicit-any': 'off',

      // Optionally, you can also set other rules as warnings instead of errors
      '@typescript-eslint/no-unused-vars': [
        'warn',
        {
          argsIgnorePattern: '^_'
        }
      ],
      'react/no-unescaped-entities': 'warn'
    }
  }
];

export default eslintConfig;
