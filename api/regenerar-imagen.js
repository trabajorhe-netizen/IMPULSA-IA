export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Método no permitido" });
  }

  try {
    const { promocion, propuestaVisual } = req.body || {};

 if (!promocion && !propuestaVisual) {
      return res.status(400).json({
        error: "No se recibió la información de la campaña."
      });
    }

    const prompt = `
Crea una nueva imagen publicitaria profesional para esta campaña de marketing:

CAMPAÑA:
${promocion}

DIRECCIÓN CREATIVA:
${propuestaVisual || "Crea una composición publicitaria atractiva y profesional."}

Genera una variante visual diferente a la anterior.

La imagen debe tener calidad publicitaria profesional,
composición atractiva, iluminación cuidada,
apariencia realista y ser apropiada para redes sociales.
`;

    const respuesta = await fetch(
      "https://api.openai.com/v1/images/generations",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`
        },
        body: JSON.stringify({
          model: "gpt-image-1",
          prompt,
          size: "1024x1024"
        })
      }
    );

    const datos = await respuesta.json();

    if (!respuesta.ok) {
      console.error("Error regenerando imagen:", datos);

      return res.status(500).json({
        error: "No fue posible regenerar la imagen."
      });
    }

    const imagenBase64 = datos.data?.[0]?.b64_json || null;

    if (!imagenBase64) {
      return res.status(500).json({
        error: "OpenAI no devolvió una imagen."
      });
    }

    return res.status(200).json({
      imagen: imagenBase64
    });

  } catch (error) {
    console.error(error);

    return res.status(500).json({
      error: "Error interno del servidor."
    });
  }
}
