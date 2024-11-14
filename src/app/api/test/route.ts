// src/app/api/test/route.ts
import { NextResponse } from 'next/server'
import { google } from 'googleapis'

const auth = new google.auth.GoogleAuth({
  credentials: {
    client_email: process.env.GOOGLE_CLIENT_EMAIL,
    private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  },
  scopes: [
    'https://www.googleapis.com/auth/spreadsheets',
    'https://www.googleapis.com/auth/drive.file',
  ],
})

const sheets = google.sheets({ version: 'v4', auth })

export async function GET() {
  try {
    // Intentar leer datos de Google Sheets
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: process.env.SHEET_ID,
      range: 'A1:E1', // Ajusta según tu hoja
    })

    return NextResponse.json({ 
      message: 'Conexión exitosa',
      data: response.data.values 
    })
  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json({ 
      error: 'Error en la conexión',
      details: error.message 
    }, { status: 500 })
  }
}

// Ruta de prueba para escribir en la hoja
export async function POST(req: Request) {
  try {
    const body = await req.json()
    
    // Escribir datos de prueba
    await sheets.spreadsheets.values.append({
      spreadsheetId: process.env.SHEET_ID,
      range: 'A:E',
      valueInputOption: 'USER_ENTERED',
      requestBody: {
        values: [[
          new Date().toISOString(),
          body.producto || 'Producto de prueba',
          body.cantidad || 1,
          body.precio || 100,
          body.cliente || 'Cliente de prueba'
        ]]
      },
    })

    return NextResponse.json({ 
      message: 'Datos guardados correctamente' 
    })
  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json({ 
      error: 'Error guardando datos',
      details: error.message 
    }, { status: 500 })
  }
}