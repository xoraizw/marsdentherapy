@echo off
echo ================================================
echo   Tambre Chatbot CRM - Development Server
echo ================================================
echo.
echo Starting the development server...
echo The application will open at http://localhost:3000
echo.
echo IMPORTANT: Make sure you've set up Supabase first!
echo See START-HERE.md for instructions.
echo.
echo Press Ctrl+C to stop the server
echo ================================================
echo.

cd /d "%~dp0"
call npm run dev

