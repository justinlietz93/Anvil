# Anvil Platform Build Issues Report

## Executive Summary

This document outlines critical build issues encountered with the Anvil Platform application, focusing on native module compatibility problems and path resolution issues that prevent the application from starting properly. The analysis reveals configuration conflicts between the project structure and build toolchain that need to be resolved.

## Issues Identified

### 1. Native Module Compatibility Issues

#### 1.1 C++ Standard Conflicts

The `isolated-vm` native module requires C++20 support but is encountering compatibility issues with Electron 35.1.5. The error logs show:

```
C:\Users\jliet\.electron-gyp\35.1.5\include\node\v8config.h(13,1): error C1189: #error: "C++20 or later required."
```

Despite specifying `GYP_DEFINES="std=c++20"` as an environment variable, the build process is overriding this with C++17:

```
cl : command line warning D9025: overriding '/std:c++20' with '/std:c++17'
```

#### 1.2 Missing V8 API Functions

The build logs indicate unresolved external symbols related to V8 API functions:

```
external_copy.obj : error LNK2001: unresolved external symbol "__declspec(dllimport) public: class std::shared_ptr<class v8::BackingStore> __cdecl v8::ArrayBuffer::GetBackingStore(void)"
```

This suggests incompatibilities between the compiled native module and the V8 version used by Electron 35.1.5.

### 2. Path Resolution and Directory Structure Issues

#### 2.1 Nested Directory Structure

The project appears to have a confusing nested directory structure:

```
C:\Users\jliet\Downloads\Anvil_AppBuilder\Anvil\Anvil\
```

This is causing path resolution problems with webpack and module loading.

#### 2.2 Main Entry Point Not Found

The error message indicates:

```
Cannot find module 'C:\Users\jliet\Downloads\Anvil_AppBuilder\Anvil\Anvil\.webpack\main'.
Please verify that the package.json has a valid "main" entry
```

Even though the package.json correctly specifies:

```json
"main": ".webpack/main"
```

This discrepancy is caused by the build process not generating the webpack output in the expected location.

## Technical Analysis

### Webpack Configuration Analysis

The webpack configuration files (`webpack.main.config.js` and `webpack.renderer.config.js`) appear to be correctly set up:

```javascript
// webpack.main.config.js
module.exports = {
  entry: './src/main.js',
  module: {
    rules: require('./webpack.rules'),
  },
  resolve: {
    extensions: ['.js', '.ts', '.jsx', '.tsx', '.css', '.json'],
  },
};
```

```javascript
// webpack.renderer.config.js
module.exports = {
  module: {
    rules: [
      ...rules,
      {
        test: /\.css$/,
        use: [{ loader: 'style-loader' }, { loader: 'css-loader' }],
      },
    ],
  },
  plugins: [
    new ForkTsCheckerWebpackPlugin(),
  ],
  resolve: {
    extensions: ['.js', '.ts', '.jsx', '.tsx', '.css'],
    alias: {
      '@components': path.resolve(__dirname, 'src/components/'),
      '@services': path.resolve(__dirname, 'src/services/'),
      '@contexts': path.resolve(__dirname, 'src/contexts/'),
      '@nodes': path.resolve(__dirname, 'src/nodes/'),
      '@config': path.resolve(__dirname, 'src/config/'),
    },
  },
};
```

### Dependency Conflicts

The application depends on native modules that are incompatible with the latest Electron version (35.1.5):

1. `isolated-vm` (v5.0.4) - Requires C++20 but has linking issues with the V8 API
2. `vm2` (v3.9.19) - Listed as deprecated with critical security issues

## Attempted Solutions

### 1. Modifying Build Configurations

We attempted to fix the C++20 standard issue by:

1. Creating a custom `.npmrc` file with the correct MSVC settings:
   ```
   msvs_version=2022
   msvs_language=C++20
   ```

2. Overriding the `binding.gyp` file for `isolated-vm` to force C++20:
   ```json
   {
     "targets": [
       {
         "target_name": "isolated_vm",
         "cflags_cc!": ["-std=c++17", "-fno-rtti"],
         "cflags_cc": ["-std=c++20", "-frtti"],
         "msvs_settings": {
           "VCCLCompilerTool": {
             "AdditionalOptions": ["-std:c++20", "/GR"]
           }
         }
       }
     ]
   }
   ```

### 2. Path Resolution Scripts

We created scripts to address the path resolution issues:

1. `fix_and_run.ps1` - Attempts to navigate to the correct directory and clean build artifacts
2. `run-correct-path.ps1` - Verifies the webpack configuration and runs the application from the correct path

### 3. Dependency Modifications

We modified dependencies in `package.json`:

1. Removed `isolated-vm` and `vm2` to eliminate the native module build issues
2. Retained other dependencies to maintain the application functionality

## Recommendations

1. **Directory Structure Cleanup**:
   - Reorganize the nested directory structure to have a clean, single-level project directory
   - Ensure all paths in configuration files are pointing to the correct locations

2. **Native Module Replacement**:
   - Implement a pure JavaScript/TypeScript solution instead of using `isolated-vm` or `vm2`
   - Alternatively, use a WebAssembly-based solution that doesn't require native module building

3. **Build Process Improvement**:
   - Create a standardized build script that ensures consistent directory structure
   - Add validation steps to confirm all required files are generated correctly before attempting to run the application

4. **Electron Version Consideration**:
   - Consider using an earlier version of Electron that is compatible with the required native modules
   - If Electron 35.1.5 is required, refactor the code to avoid using problematic dependencies

## Conclusion

The Anvil Platform build issues stem from a combination of dependency incompatibilities and path resolution problems. Resolving these issues requires a systematic approach to reconfigure the build process, reorganize the directory structure, and potentially refactor the codebase to eliminate problematic dependencies.

Further investigation is recommended to determine the best path forward based on the specific requirements of the Anvil Platform.
