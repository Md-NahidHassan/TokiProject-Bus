@echo off
:: ============================================================
:: NSTU Bus Tracker - C++ Route Calculator Compiler Script
:: ============================================================
:: This script compiles the C++ route_calculator.cpp file
:: using g++ (MinGW) which comes with XAMPP's developer tools
:: or can be installed from https://winlibs.com/
::
:: Run this file ONCE to compile the C++ binary.
:: After that, PHP will call the .exe automatically.
:: ============================================================

echo.
echo =====================================================
echo   NSTU BUS TRACKER - C++ Route Calculator Compiler
echo =====================================================
echo.

:: Navigate to the cpp directory
cd /d "%~dp0"

:: Check if g++ is available
where g++ >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] g++ compiler not found in PATH!
    echo.
    echo Please install MinGW or add it to your PATH:
    echo   1. Download from: https://winlibs.com/
    echo   2. Extract to C:\mingw64\
    echo   3. Add C:\mingw64\bin to System PATH
    echo   4. Restart Command Prompt and run this script again
    echo.
    pause
    exit /b 1
)

echo [INFO] g++ found. Compiling route_calculator.cpp...
echo.

:: Compile C++ source to executable
g++ -O2 -std=c++17 -o route_calculator.exe route_calculator.cpp

if %ERRORLEVEL% EQU 0 (
    echo [SUCCESS] Compiled successfully: route_calculator.exe
    echo.
    echo [TEST] Running a quick test (Stop 0 to Stop 8)...
    echo.
    route_calculator.exe 0 8
    echo.
    echo =====================================================
    echo   Compilation Complete! The PHP API can now use it.
    echo   Test URL: http://localhost/NSTU-BUS-TRACKER/api/cpp/route_calculator.php?source=0^&destination=8
    echo =====================================================
) else (
    echo [ERROR] Compilation failed! Check the error above.
)

echo.
pause
