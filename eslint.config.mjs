import reactHooks from 'eslint-plugin-react-hooks';
import typescriptEslint from 'typescript-eslint';

export default [
    {
        files: ['**/*.ts', '**/*.tsx']
    },
    {
        plugins: {
            '@typescript-eslint': typescriptEslint.plugin,
            'react-hooks': reactHooks
        },

        languageOptions: {
            parser: typescriptEslint.parser,
            ecmaVersion: 2022,
            sourceType: 'module'
        },

        rules: {
            '@typescript-eslint/naming-convention': [
                'warn',
                {
                    selector: 'import',
                    format: ['camelCase', 'PascalCase']
                }
            ],

            // React Hooks Rules - catch conditional hooks and other violations
            'react-hooks/rules-of-hooks': 'error', // Checks rules of Hooks
            'react-hooks/exhaustive-deps': 'warn', // Checks effect dependencies

            curly: 'off',
            eqeqeq: 'warn',
            'no-throw-literal': 'warn',
            semi: ['warn', 'never']
        }
    }
];
