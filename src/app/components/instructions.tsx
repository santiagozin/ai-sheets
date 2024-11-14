import React from 'react'

export default function Instructions() {
  return (
    <div>
        <h3 className="text-2xl font-bold">¿Cómo funciona?</h3>
        <ul>
        <li><span className="font-bold">1. </span>Envías un mensaje o audio por Whatsapp / Telegram con la información que deseas registrar.</li>
        <li><span className="font-bold">2. </span>El sistema procesa la información y con IA estructura la información y la adapta a tu hoja de calculo.</li>
        <li><span className="font-bold">3. </span>Se guarda la información en tu Google Sheets</li>
        </ul>
    </div>
  )
}
