const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;


function getDemoReply(message, tone, length, language) {
  return `This is an improved ${tone} reply in ${language}.

I understand your message and will respond in a clear and professional way.

Length: ${length}`;
}


export async function generateReply(
  message,
  tone,
  length,
  language
) {

  try {

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${API_KEY}`,
      {

        method:"POST",

        headers:{
          "Content-Type":"application/json",
        },


        body:JSON.stringify({

          contents:[

            {

              parts:[

                {

                  text:`
You are an expert writing assistant.

Task:
${message}

Settings:

Tone:
${tone}

Length:
${length}

Language:
${language}

Rules:
- Improve clarity
- Keep it natural
- No explanation
- Only final reply
`

                }

              ]

            }

          ]

        })

      }

    );


    const data = await response.json();


    if(!response.ok){

      return getDemoReply(
        message,
        tone,
        length,
        language
      );

    }


    return (
      data.candidates?.[0]?.content?.parts?.[0]?.text
      ||
      getDemoReply(
        message,
        tone,
        length,
        language
      )
    );


  }catch(error){

    return getDemoReply(
      message,
      tone,
      length,
      language
    );

  }

}