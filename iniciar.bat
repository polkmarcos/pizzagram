@echo off
title Pizagram - Delivery no Estilo Instagram
color 0A

echo ==========================================================
echo       PIZAGRAM - INICIADOR AUTOMATICO DO SISTEMA
echo ==========================================================
echo.

:: Verificar se o Node.js esta instalado
where node >nul 2>nul
if %errorlevel% neq 0 (
    color 0C
    echo [ERRO] O Node.js nao foi localizado no seu computador.
    echo.
    echo Para rodar o sistema localmente, voce precisa instalar o Node.js.
    echo 1. Baixe o instalador neste link: https://nodejs.org/
    echo 2. Instale usando as opcoes padrao.
    echo 3. Apos instalar, feche esta janela e de dois cliques no arquivo "iniciar.bat" novamente.
    echo.
    pause
    exit
)

echo [1/3] Node.js detectado com sucesso.
echo.
echo [2/3] Instalando dependencias do sistema (aguarde)...
call npm install

echo.
echo [3/3] Iniciando o servidor do Pizagram...
echo.
echo ==========================================================
echo   Seu sistema esta iniciando!
echo   Acesse no navegador: http://localhost:3000
echo   Abra o painel admin e conecte seu WhatsApp nas config.
echo ==========================================================
echo.

:: Abrir o navegador automaticamente
start http://localhost:3000

:: Rodar o servidor
npm run dev

pause
