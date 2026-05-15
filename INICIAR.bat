@echo off
chcp 65001 >nul
echo.
echo ========================================================
echo   PLATAFORMA MARKETING INDIO - Supermercados Indio
echo ========================================================
echo.

REM ── PRIMEIRA VEZ? Rodar setup ────────────────────────────
if not exist "backend\node_modules" (
  echo [SETUP] Instalando dependencias do backend...
  cd /d %~dp0backend && npm install
  cd /d %~dp0
)
if not exist "frontend\node_modules" (
  echo [SETUP] Instalando dependencias do frontend...
  cd /d %~dp0frontend && npm install
  cd /d %~dp0
)

REM ── BANCO DE DADOS ────────────────────────────────────────
echo [1/4] Iniciando banco de dados...
docker compose up -d 2>nul && (
  echo   OK: PostgreSQL + Redis iniciados via Docker
  timeout /t 3 /nobreak > nul
) || echo   AVISO: Docker nao encontrado - use banco externo ou Supabase

REM ── MIGRATE + SEED (apenas se DB estiver disponivel) ─────
echo [2/4] Aplicando migrations e seed inicial...
cd /d %~dp0backend
npx prisma db push --skip-generate 2>nul && (
  npx ts-node prisma/seed.ts 2>nul || echo   Seed ja aplicado ou banco indisponivel
) || echo   Pulando migrate - banco indisponivel
cd /d %~dp0

REM ── BACKEND ───────────────────────────────────────────────
echo [3/4] Iniciando backend API (porta 3001)...
start "Indio Backend API" cmd /k "cd /d %~dp0backend && npx ts-node src/server.ts"
timeout /t 2 /nobreak > nul

REM ── FRONTEND ──────────────────────────────────────────────
echo [4/4] Iniciando frontend Next.js (porta 3000)...
start "Indio Frontend" cmd /k "cd /d %~dp0frontend && npm run dev"

echo.
echo ========================================================
echo   SISTEMA INICIADO!
echo.
echo   Acesso: http://localhost:3000
echo   API:    http://localhost:3001/health
echo.
echo   Credenciais iniciais:
echo   Admin:     wagner@supermercadoindio.com.br / indio@2026
echo   Marketing: marketing@supermercadoindio.com.br / marketing@2026
echo ========================================================
echo.
pause
