// export async function POST(req) {
//     try {
//         // const { prompt } = await req.json();
//         const prompt = "hello world";

//         const response = await fetch(
//             "https://api.cloudflare.com/client/v4/accounts/6be8bb8c9a7803c841e08c30d1e8a9dd/ai/run/@cf/meta/llama-3.1-8b-instruct",
//             {
//                 method: "POST",
//                 headers: {
//                     "Authorization": `Bearer ${yxeigAPSSdn4ppsKZ2OxplNqF8rXqEijj8bcZ0gL}`,
//                     "Content-Type": "application/json",
//                 },
//                 body: JSON.stringify({ prompt }),
//             }
//         );

//         const data = await response.json();
//         return Response.json(JSON.stringify(data), { status: response.ok ? 200 : response.status });
//     } catch (error) {
//         return Response.json({ error: "Internal Server Error", details: error.message }, { status: 500 });
//     }
// }

export async function POST(req) {
    try {
        const prompt = "hello world";

        const response = await fetch(
            "https://api.cloudflare.com/client/v4/accounts/6be8bb8c9a7803c841e08c30d1e8a9dd/ai/run/@cf/meta/llama-3.1-8b-instruct",
            {
                method: "POST",
                headers: {
                    "Authorization": `Bearer yxeigAPSSdn4ppsKZ2OxplNqF8rXqEijj8bcZ0gL`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ prompt }),
            }
        );

        const data = await response.json(); // Convert response to JSON
        console.log("Cloudflare API Response:", data); // Log for debugging

        // ✅ Fix: Return a JSON response so the frontend can parse it
        return new Response(JSON.stringify(data), {
            status: response.ok ? 200 : response.status,
            headers: { "Content-Type": "application/json" },
        });
    } catch (error) {
        console.error("Error in API Route:", error);
        return new Response(
            JSON.stringify({ error: "Internal Server Error", details: error.message }),
            { status: 500, headers: { "Content-Type": "application/json" } }
        );
    }
}



/**
 * sampel usage in mainpage
 */

// async function fetchAIResponse(prompt) {
//     const res = await fetch("/api/cloudflare", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ prompt }),
//     });

//     const data = await res.json();
//     return data;
// }
