#!/bin/bash

# Script para iniciar el servidor de desarrollo
echo "🚀 Iniciando servidor de desarrollo para VotingForm..."

# Verificar si npm está instalado
if ! command -v npm &> /dev/null; then
    echo "❌ npm no está instalado. Por favor instala Node.js y npm primero."
    exit 1
fi

# Verificar si live-server está instalado
if ! npm list live-server &> /dev/null; then
    echo "📦 Instalando dependencias..."
    npm install
fi

# Iniciar el servidor
echo "🌐 Abriendo el formulario en http://localhost:8080"
echo "📝 Presiona Ctrl+C para detener el servidor"
npm start
