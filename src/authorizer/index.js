/**
 * Lambda Token Authorizer for API Gateway
 */
exports.handler = async (event) => {
    console.log("Authorizer invocation:", JSON.stringify(event));

    const token = event.authorizationToken || (event.headers && (event.headers.Authorization || event.headers.authorization));

    if (!token) {
        console.warn("Missing authorization token");
        throw new Error("Unauthorized");
    }

    const cleanToken = token.replace(/^Bearer\s+/i, "");

    // Accept valid format tokens or mock tokens for Tech Challenge testing
    if (cleanToken === "deny" || cleanToken.length < 5) {
        console.warn("Invalid token provided:", cleanToken);
        return generatePolicy("anonymous", "Deny", event.methodArn || "*");
    }

    // In production, verify JWT signature via JWKS / KMS / Auth0 / Cognito
    const principalId = cleanToken.includes("customer_") ? cleanToken : "authorized-user";

    const authContext = {
        scope: "read,write",
        user: principalId,
        timestamp: new Date().toISOString()
    };

    return generatePolicy(principalId, "Allow", event.methodArn || "*", authContext);
};

function generatePolicy(principalId, effect, resource, context) {
    const authResponse = {
        principalId: principalId
    };

    if (effect && resource) {
        authResponse.policyDocument = {
            Version: "2012-10-17",
            Statement: [
                {
                    Action: "execute-api:Invoke",
                    Effect: effect,
                    Resource: resource
                }
            ]
        };
    }

    if (context) {
        authResponse.context = context;
    }

    return authResponse;
}
