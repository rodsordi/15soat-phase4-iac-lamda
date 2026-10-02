/**
 * Lambda Serverless Webhook Handler for Mercado Pago callbacks
 */
exports.handler = async (event) => {
    console.log("Mercado Pago Webhook Event:", JSON.stringify(event));

    try {
        let body = {};
        if (event.body) {
            body = typeof event.body === "string" ? JSON.parse(event.body) : event.body;
        }

        const action = body.action || "payment.updated";
        const paymentData = body.data || {};

        console.info(`Processed Mercado Pago callback: action=${action}, dataId=${paymentData.id}`);

        return {
            statusCode: 200,
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                status: "received",
                action: action,
                receivedAt: new Date().toISOString()
            })
        };
    } catch (err) {
        console.error("Error processing webhook:", err);
        return {
            statusCode: 400,
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ error: err.message })
        };
    }
};
