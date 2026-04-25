import typescriptEslint from 'typescript-eslint';

export default [
    {
        files: ['**/*.ts', '**/*.tsx']
    },
    {
        plugins: {
            '@typescript-eslint': typescriptEslint.plugin
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

            curly: 'off',
            eqeqeq: 'warn',
            'no-throw-literal': 'warn',
            semi: ['warn', 'never']
        }
    }
];
