// /src/app/api/webhook/route.ts
import { NextResponse } from 'next/server'
import { google } from 'googleapis'
import OpenAI from 'openai'

// Configuración de OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

// Configuración de Google Sheets
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
const SPREADSHEET_ID = process.env.SHEET_ID

// Constante para el número de prueba (formateado sin símbolos)
const WHATSAPP_TEST_NUMBER = "15551564776";

async function processTextMessage(message: string) {
  try {
   
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [{
        role: "system",
        content: "Extrae la siguiente información del pedido: producto, cantidad, precio, cliente. Devuelve un JSON."
      }, {
        role: "user",
        content: message
      }]
    })

    const data = JSON.parse(completion.choices[0].message?.content || '{}')
    return data
  } catch (error) {
    console.error('Error procesando mensaje:', error)
    throw error
  }
}

// Función para guardar en Google Sheets
async function saveToSheet(data: any) {
  try {
    const range = 'Pedidos!A:E' // Ajusta según tu estructura de hoja
    const values = [
      [
        new Date().toISOString(),
        data.producto,
        data.cantidad,
        data.precio,
        data.cliente
      ]
    ]

    await sheets.spreadsheets.values.append({
      spreadsheetId: SPREADSHEET_ID,
      range: range,
      valueInputOption: 'USER_ENTERED',
      requestBody: { values },
    })
  } catch (error) {
    console.error('Error guardando en Sheet:', error)
    throw error
  }
}


async function querySheet(query: string) {
  try {
    // Usar GPT para entender la consulta
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [{
        role: "system",
        content: "Convierte la consulta en un rango de Google Sheets. Ejemplo: 'último pedido' => 'Pedidos!A2:E2'"
      }, {
        role: "user",
        content: query
      }]
    })

    const range = completion.choices[0].message?.content || 'Pedidos!A2:E2'
    
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: range,
    })

    return response.data.values
  } catch (error) {
    console.error('Error consultando Sheet:', error)
    throw error
  }
}

// Agregar esta nueva función para enviar mensajes
async function sendWhatsAppMessage(to: string, message: string) {
  try {
    const body = {
      messaging_product: 'whatsapp',
      to: WHATSAPP_TEST_NUMBER, // Usamos el número de prueba en lugar del número real
      type: 'text',
      text: {
        body: message
      }
    };

    console.log('Enviando mensaje con body:', JSON.stringify(body, null, 2));

    const response = await fetch(
      `https://graph.facebook.com/v21.0/${process.env.WHATSAPP_PHONE_NUMBER_ID}/messages`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.WHATSAPP_TOKEN}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Error enviando mensaje: ${response.statusText}\nDetalles: ${JSON.stringify(errorData, null, 2)}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error completo:', error);
    throw error;
  }
}

// Webhook principal
export async function POST(req: Request) {
  try {
    const body = await req.json()
    
    
    // Verificar si es un mensaje de WhatsApp
    if (body.entry?.[0]?.changes?.[0]?.value?.messages?.[0]) {
      const message = body.entry[0].changes[0].value.messages[0]
      const userPhoneNumber = body.entry[0].changes[0].value.messages[0].from
      
      console.log('Mensaje recibido:', {
        de: userPhoneNumber,
        tipo: message.type,
        contenido: message.type === 'text' ? message.text.body : 'no es texto'
      })
      
      // Si es un mensaje de texto, enviar una respuesta fija
      if (message.type === 'text') {
        await sendWhatsAppMessage(
          userPhoneNumber, 
          "He recibido tu mensaje. Este es un mensaje de prueba automático."
        )
        
        return NextResponse.json({ status: 'success' })
      }
    }
    
    return NextResponse.json({ status: 'unknown message type' })
  } catch (error) {
    console.error('Error en webhook:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// Manejo de consultas
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  
  // Obtener el token de verificación
  const mode = searchParams.get('hub.mode')
  const token = searchParams.get('hub.verify_token')
  const challenge = searchParams.get('hub.challenge')

  // Token que configuraste en Meta for Developers
  const VERIFY_TOKEN = process.env.WHATSAPP_VERIFY_TOKEN

  if (mode === 'subscribe' && token === VERIFY_TOKEN) {
    console.log('Webhook verificado!')
    return new Response(challenge, { status: 200 })
  }

  return new Response('Error de verificación', { status: 403 })
}