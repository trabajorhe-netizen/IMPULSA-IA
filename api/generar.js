export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Método no permitido" });
  }

  try {
    const { promocion } = req.body;

    if (!promocion) {
      return res.status(400).json({
        error: "Escribe una promoción."
      });
    }

    const respuesta = await fetch(
      "https://api.openai.com/v1/responses",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`
        },
        body: JSON.stringify({
          model: "gpt-5.6-luna",
          input: `Eres el motor de marketing de IMPULSA IA.

Crea una campaña publicitaria profesional en español para:

${promocion}

Entrega exactamente estas 7 secciones, usando cada encabezado con ###:

### 1. Título de campaña
Crea un título breve, atractivo y memorable.

### 2. Texto publicitario
Escribe un texto persuasivo que explique claramente la promoción y sus beneficios.

### 3. Publicación para Instagram y Facebook
Crea una publicación atractiva y lista para publicar en redes sociales. Usa emojis de manera moderada.

### 4. Mensaje para WhatsApp
Escribe un mensaje breve, natural y persuasivo que el negocio pueda enviar directamente a sus clientes por WhatsApp.

### 5. Hashtags
Genera entre 5 y 8 hashtags relevantes para el negocio, producto, promoción y ubicación cuando corresponda.

### 6. Llamada a la acción
Escribe una llamada a la acción clara, breve y convincente.

### 7. Propuesta visual
Describe una imagen publicitaria profesional que acompañe la campaña: sujeto principal, composición, ambiente, iluminación, colores, texto sugerido dentro de la imagen y formato recomendado para redes sociales.

No inventes precios, fechas, ubicaciones, descuentos, condiciones ni características que el usuario no haya proporcionado.
Mantén toda la información proporcionada por el usuario.
Haz que cada sección sea útil, específica y lista para utilizar.`
        })
      }
    );

    const datos = await respuesta.json();

    if (!respuesta.ok) {
      console.error(datos);
      return res.status(500).json({
        error: "No fue posible generar la campaña."
      });
    }

    const texto =
  datos.output
    ?.flatMap(item => item.content || [])
    ?.find(content => content.type === "output_text")
    ?.text ||
  "No se recibió contenido.";

    const imagenRespuesta = await fetch(
  "https://api.openai.com/v1/images/generations",
  {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`
    },
    body: JSON.stringify({
      model: "gpt-image-2",
      prompt: `Crea una imagen publicitaria profesional para esta campaña de marketing:

${promocion}

Usa como dirección creativa la propuesta visual incluida en esta campaña:

${texto}

La imagen debe tener calidad publicitaria profesional, composición atractiva, iluminación cuidada y ser apropiada para redes sociales.`,
      size: "1024x1024"
    })
  }
);

const imagenDatos = await imagenRespuesta.json();

if (!imagenRespuesta.ok) {
  console.error("Error generando imagen:", imagenDatos);
  return res.status(500).json({
    error: "La campaña se creó, pero no fue posible generar la imagen."
  });
}

const imagenBase64 = imagenDatos.data?.[0]?.b64_json || null;

    return res.status(200).json({
  resultado: texto,
  imagen: imagenBase64
});

  } catch (error) {
    console.error(error);

    return res.status(500).json({
      error: "Error interno del servidor."
    });
  }
}
