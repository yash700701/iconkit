import { GoogleGenAI, Modality } from "@google/genai";


export async function POST(request) {
    try {
        const { prompt } = await request.json();

        const ai = new GoogleGenAI({apiKey: process.env.GEMINI_API_KEY});
        const response = await ai.models.generateContent({
        model: "gemini-2.0-flash-preview-image-generation",
        contents: prompt,
        config: {
            responseModalities: [Modality.TEXT, Modality.IMAGE],
        },
        });
        for (const part of response.candidates[0].content.parts) {
        // Based on the part type, either show the text or save the image
        if (part.text) {
            console.log(part.text);
        } else if (part.inlineData) {
            const base64Image = part.inlineData.data;
            return Response.json({ imageBase64: base64Image });
        }
        }
    } catch (error) {
        console.error(error);
        return Response.json({ error: "Something went wrong." }, { status: 500 });  
    } 
    
}