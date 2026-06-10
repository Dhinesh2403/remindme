@echo off
title Ionic Android Auto Builder
color 0A

echo ============================================
echo      IONIC ANDROID AUTO BUILD SCRIPT
echo ============================================
echo.

REM =====================================================
REM CHECK NODE
REM =====================================================

where node >nul 2>nul
IF %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Node.js is not installed
    pause
    exit /b
)

echo [OK] Node.js Found
node -v

REM =====================================================
REM CHECK JAVA
REM =====================================================

where java >nul 2>nul
IF %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Java JDK not installed
    pause
    exit /b
)

echo [OK] Java Found
java -version

REM =====================================================
REM CHECK IONIC
REM =====================================================

where ionic >nul 2>nul
IF %ERRORLEVEL% NEQ 0 (
    echo Installing Ionic CLI...
    npm install -g @ionic/cli
)

echo [OK] Ionic CLI Ready

REM =====================================================
REM INSTALL DEPENDENCIES
REM =====================================================

echo.
echo Installing npm packages...
call npm install

IF %ERRORLEVEL% NEQ 0 (
    echo [ERROR] npm install failed
    pause
    exit /b
)

REM =====================================================
REM FIX ANGULAR / IONIC TOOLKIT ISSUES
REM =====================================================

echo.
echo Fixing Angular and Ionic dependencies...

call npm install @angular-devkit/build-angular@latest --save-dev
call npm install @ionic/angular-toolkit@latest --save-dev

REM =====================================================
REM INSTALL CAPACITOR
REM =====================================================

echo.
echo Installing Capacitor...

call npm install @capacitor/core @capacitor/cli @capacitor/android

REM =====================================================
REM CHECK CAPACITOR CONFIG
REM =====================================================

IF NOT EXIST capacitor.config.ts (
    
    IF NOT EXIST capacitor.config.json (

        echo.
        echo Creating Capacitor config...

        echo import { CapacitorConfig } from '@capacitor/cli';> capacitor.config.ts
        echo.>> capacitor.config.ts
        echo const config: CapacitorConfig = {>> capacitor.config.ts
        echo   appId: 'com.remind.app',>> capacitor.config.ts
        echo   appName: 'RemindMe',>> capacitor.config.ts
        echo   webDir: 'www',>> capacitor.config.ts
        echo   bundledWebRuntime: false>> capacitor.config.ts
        echo };>> capacitor.config.ts
        echo.>> capacitor.config.ts
        echo export default config;>> capacitor.config.ts

    )
)

REM =====================================================
REM ADD ANDROID PLATFORM
REM =====================================================

IF NOT EXIST android (

    echo.
    echo Adding Android platform...

    call npx cap add android

)

REM =====================================================
REM BUILD IONIC PROJECT
REM =====================================================

echo.
echo Building Ionic project...

call ionic build

IF %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Ionic build failed
    pause
    exit /b
)

REM =====================================================
REM SYNC CAPACITOR
REM =====================================================

echo.
echo Syncing Android project...

call npx cap sync android

IF %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Capacitor sync failed
    pause
    exit /b
)

REM =====================================================
REM BUILD DEBUG APK
REM =====================================================

echo.
echo Building Debug APK...

cd android

IF EXIST gradlew.bat (
    
    call gradlew.bat assembleDebug

) ELSE (

    echo [ERROR] gradlew.bat not found
    pause
    exit /b
)

IF %ERRORLEVEL% NEQ 0 (
    echo [ERROR] APK build failed
    pause
    exit /b
)

cd ..

REM =====================================================
REM APK LOCATION
REM =====================================================

echo.
echo ============================================
echo BUILD SUCCESSFUL
echo ============================================
echo.

echo APK Location:
echo android\app\build\outputs\apk\debug\app-debug.apk

echo.
echo Opening APK folder...

start "" "android\app\build\outputs\apk\debug"

echo.
pause