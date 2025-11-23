@echo off
echo Starting Discord Clone Development Servers...
echo.

:: Start backend server
echo Starting Backend Server...
start "Backend Server" cmd /k "cd backend && npm run dev"

:: Wait a moment for backend to start
timeout /t 3 /nobreak > nul

:: Start frontend server
echo Starting Frontend Server...
start "Frontend Server" cmd /k "cd frontend && npm start"

echo.
echo Both servers are starting...
echo Backend: http://localhost:5000
echo Frontend: http://localhost:3000
echo.
pause