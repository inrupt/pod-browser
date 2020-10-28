/**
 * Copyright 2020 Inrupt Inc.
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal in
 * the Software without restriction, including without limitation the rights to use,
 * copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the
 * Software, and to permit persons to whom the Software is furnished to do so,
 * subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED,
 * INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A
 * PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
 * HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
 * OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
 * SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

module.exports = {
  root: true,

  env: {
    browser: true,
    es6: true,
  },

  // Airbnb base provides many style rules; it is then overridden by our current defaults
  // (jest, eslint, typescript)
  extends: [
    "airbnb-base",
    "eslint:recommended",
    "plugin:jest/recommended",
    "plugin:jest/style",
    "airbnb",
    "airbnb/hooks",
    "plugin:prettier/recommended",
  ],

  // Set up es6 and typescript linting, and add lint rules for jest
  plugins: [
    "@typescript-eslint",
    "jest",
    "license-header",
    "react",
    "prettier",
  ],

  // A few fixes for broken .eslint rules
  globals: {
    Atomics: "readonly",
    SharedArrayBuffer: "readonly",
  },

  parser: "babel-eslint",

  parserOptions: {
    ecmaFeatures: { jsx: true },
    ecmaVersion: 2018,
    sourceType: "module",
  },

  settings: {
    "import/resolver": {
      node: {
        extensions: [".js", ".ts", ".jsx", ".tsx"],
      },
    },
  },

  rules: {
    // Allow devDeps in test files
    "import/no-extraneous-dependencies": [
      0,
      {
        devDependencies: ["**/*.test.*"],
      },
    ],

    // import/no-unresolved is problematic because of the RDF/JS specification, which has type
    // definitions available in @types/rdf-js, but no actual corresponding rdf-js package.
    "import/no-unresolved": [
      2,
      {
        ignore: ["/rdf-js"],
      },
    ],

    // Remove airbnb's ForOfStatement recommendation; we don't use regenerator-runtime anywyas,
    // and we iterate over Sets in our libraries.
    "no-restricted-syntax": [
      2,
      {
        selector: "ForInStatement",
        message:
          "for..in loops iterate over the entire prototype chain, which is virtually never what you want. Use Object.{keys,values,entries}, and iterate over the resulting array.",
      },
      {
        selector: "LabeledStatement",
        message:
          "Labels are a form of GOTO; using them makes code confusing and hard to maintain and understand.",
      },
      {
        selector: "WithStatement",
        message:
          "`with` is disallowed in strict mode because it makes code impossible to predict and optimize.",
      },
    ],

    "react/jsx-filename-extension": [1, { extensions: [".tsx", ".jsx"] }],

    // Order the properties of react components nicely
    "react/static-property-placement": [2, "static public field"],

    // Allow Nextjs <Link> tags to contain a href attribute
    "jsx-a11y/anchor-is-valid": [
      "error",
      {
        components: ["Link"],
        specialLink: ["hrefLeft", "hrefRight"],
        aspects: ["invalidHref", "preferButton"],
      },
    ],

    // Make everything work with .tsx as well as .ts
    "import/extensions": [
      2,
      {
        js: "never",
        ts: "never",
        tsx: "never",
        jsx: "never",
      },
    ],

    "license-header/header": [1, "./resources/license-header.js"],
  },

  overrides: [
    {
      files: ["**/*.ts", "**/*.tsx"],
      extends: ["@inrupt/eslint-config-react"],
      rules: {
        "@typescript-eslint/ban-ts-comment": 0,
        "license-header/header": [1, "./resources/license-header.js"],
        "react/jsx-filename-extension": [1, { extensions: [".tsx", ".jsx"] }],
      },
      settings: {
        "import/resolver": {
          node: {
            extensions: [".js", ".ts", ".jsx", ".tsx"],
          },
        },
      },
    },
  ],
};
