// src/app/test/page.tsx
'use client'
import { useState } from 'react'

export default function TestPage() {
  const [resultado, setResultado] = useState<string>('')
  const [loading, setLoading] = useState(false)

  // Probar lectura
  const testGet = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/test')
      const data = await response.json()
      setResultado(JSON.stringify(data, null, 2))
    } catch (error) {
      setResultado('Error: ' + error.message)
    }
    setLoading(false)
  }

  // Probar escritura
  const testPost = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/test', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          producto: 'Producto Test',
          cantidad: 1,
          precio: 100,
          cliente: 'Cliente Test'
        }),
      })
      const data = await response.json()
      setResultado(JSON.stringify(data, null, 2))
    } catch (error) {
      setResultado('Error: ' + error.message)
    }
    setLoading(false)
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Página de Pruebas</h1>
      
      <div className="space-x-4 mb-4">
        <button 
          onClick={testGet}
          className="px-4 py-2 bg-blue-500 text-white rounded"
          disabled={loading}
        >
          Probar Lectura
        </button>
        
        <button 
          onClick={testPost}
          className="px-4 py-2 bg-green-500 text-white rounded"
          disabled={loading}
        >
          Probar Escritura
        </button>
      </div>

      {loading && <p>Cargando...</p>}
      
      <pre className="bg-gray-100 p-4 rounded mt-4">
        {resultado || 'Los resultados aparecerán aquí'}
      </pre>
    </div>
  )
}