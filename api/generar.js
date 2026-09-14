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

Entrega:
1. Título de campaña
2. Texto publicitario
3. Publicación para redes sociales
4. Cinco hashtags
5. Llamada a la acción

Hazla persuasiva, clara y lista para publicar.`
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

    return res.status(200).json({
      resultado: texto
    });

  } catch (error) {
    console.error(error);

    return res.status(500).json({
      error: "Error interno del servidor."
    });
  }
}
