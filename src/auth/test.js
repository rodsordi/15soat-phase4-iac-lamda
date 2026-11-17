const assert = require("assert");
const crypto = require("crypto");
const { handler, _internal } = require("./index.js");

async function runTests() {
  console.log("Starting Auth Lambda Comprehensive Security & Unit Tests...\n");

  // Test 1: GET /.well-known/jwks.json
  {
    console.log("Test 1: GET /.well-known/jwks.json");
    const response = await handler({
      rawPath: "/.well-known/jwks.json",
      requestContext: { http: { method: "GET" } }
    });
    assert.strictEqual(response.statusCode, 200);
    const body = JSON.parse(response.body);
    assert.ok(Array.isArray(body.keys));
    assert.strictEqual(body.keys[0].kty, "RSA");
    assert.strictEqual(body.keys[0].kid, "garage-auth-key-1");
    assert.strictEqual(body.keys[0].alg, "RS256");
  }

  // Test 2: POST /auth/login - Admin Success
  let validAdminJwt = "";
  {
    console.log("Test 2: POST /auth/login - Admin Success");
    const response = await handler({
      rawPath: "/auth/login",
      requestContext: { http: { method: "POST" } },
      body: JSON.stringify({ username: "admin_user", password: "AdminPassword123!" })
    });
    assert.strictEqual(response.statusCode, 200);
    const body = JSON.parse(response.body);
    assert.ok(body.access_token);
    assert.deepStrictEqual(body.roles, ["ADMIN"]);
    validAdminJwt = body.access_token;

    // Verify cryptographic signature against public key
    const [headerB64, payloadB64, sigB64] = body.access_token.split(".");
    const verifier = crypto.createVerify("RSA-SHA256");
    verifier.update(`${headerB64}.${payloadB64}`);
    assert.ok(verifier.verify(_internal.getPublicKeyPem(), sigB64, "base64url"));

    const payload = JSON.parse(Buffer.from(payloadB64, "base64url").toString("utf8"));
    assert.deepStrictEqual(payload.roles, ["ADMIN"]);
    assert.deepStrictEqual(payload.realm_access.roles, ["ADMIN"]);
    assert.strictEqual(payload.preferred_username, "admin_user");
  }

  // Test 3: POST /auth/login - Employee Success
  let validEmployeeJwt = "";
  {
    console.log("Test 3: POST /auth/login - Employee Success");
    const response = await handler({
      rawPath: "/auth/login",
      requestContext: { http: { method: "POST" } },
      body: JSON.stringify({ username: "86266070087", password: "StrongP@ss2026" })
    });
    assert.strictEqual(response.statusCode, 200);
    const body = JSON.parse(response.body);
    assert.deepStrictEqual(body.roles, ["EMPLOYEE"]);
    validEmployeeJwt = body.access_token;
  }

  // Test 4: POST /auth/login - Invalid Password (401 RFC 7807)
  {
    console.log("Test 4: POST /auth/login - Invalid Password");
    const response = await handler({
      rawPath: "/auth/login",
      requestContext: { http: { method: "POST" } },
      body: JSON.stringify({ username: "86266070087", password: "SenhaErrada123" })
    });
    assert.strictEqual(response.statusCode, 401);
    assert.strictEqual(response.headers["Content-Type"], "application/problem+json");
    const body = JSON.parse(response.body);
    assert.strictEqual(body.errorCode, "INVALID_CREDENTIALS");
    assert.strictEqual(body.title, "Invalid Credentials");
  }

  // Test 5: POST /users - Anonymous Request Denied (401 RFC 7807)
  {
    console.log("Test 5: POST /users - Anonymous Access Denied");
    const response = await handler({
      rawPath: "/users",
      requestContext: { http: { method: "POST" } },
      body: JSON.stringify({
        name: "Anonymous User",
        email: "anon@garage.com.br",
        document: "86266070087",
        role: "EMPLOYEE"
      })
    });
    assert.strictEqual(response.statusCode, 401);
    assert.strictEqual(response.headers["Content-Type"], "application/problem+json");
    const body = JSON.parse(response.body);
    assert.strictEqual(body.errorCode, "UNAUTHORIZED");
  }

  // Test 6: POST /users - Fake Signature JWT Denied (401)
  {
    console.log("Test 6: POST /users - Forged Token Denied");
    const forgedHeader = Buffer.from(JSON.stringify({ alg: "RS256", typ: "JWT" })).toString("base64url");
    const forgedPayload = Buffer.from(JSON.stringify({ roles: ["ADMIN"], exp: Math.floor(Date.now() / 1000) + 3600 })).toString("base64url");
    const fakeToken = `${forgedHeader}.${forgedPayload}.invalid_signature_bits`;

    const response = await handler({
      rawPath: "/users",
      requestContext: { http: { method: "POST" } },
      headers: { authorization: `Bearer ${fakeToken}` },
      body: JSON.stringify({
        name: "Attacker",
        email: "attacker@evil.com",
        document: "86266070087",
        role: "EMPLOYEE"
      })
    });
    assert.strictEqual(response.statusCode, 401);
  }

  // Test 7: POST /users - Privilege Escalation to ADMIN Denied (400)
  {
    console.log("Test 7: POST /users - Privilege Escalation to ADMIN Denied");
    const response = await handler({
      rawPath: "/users",
      requestContext: { http: { method: "POST" } },
      headers: { authorization: `Bearer ${validAdminJwt}` },
      body: JSON.stringify({
        name: "Escalated User",
        email: "escalated@garage.com.br",
        document: "86266070087",
        role: "ADMIN"
      })
    });
    assert.strictEqual(response.statusCode, 400);
    const body = JSON.parse(response.body);
    assert.strictEqual(body.errorCode, "INVALID_ROLE");
  }

  // Test 8: POST /users - Non-Admin Forbidden to Provision Employee (403)
  {
    console.log("Test 8: POST /users - Non-Admin Forbidden to Provision Employee");
    const response = await handler({
      rawPath: "/users",
      requestContext: { http: { method: "POST" } },
      headers: { authorization: `Bearer ${validEmployeeJwt}` },
      body: JSON.stringify({
        name: "Carlos Atendente",
        email: "carlos@garage.com.br",
        document: "86266070087",
        role: "EMPLOYEE"
      })
    });
    assert.strictEqual(response.statusCode, 403);
    const body = JSON.parse(response.body);
    assert.strictEqual(body.errorCode, "ACCESS_DENIED");
  }

  // Test 9: POST /users - Invalid Document (400)
  {
    console.log("Test 9: POST /users - Invalid Document");
    const response = await handler({
      rawPath: "/users",
      requestContext: { http: { method: "POST" } },
      headers: { authorization: `Bearer ${validAdminJwt}` },
      body: JSON.stringify({
        name: "Test User",
        email: "test@garage.com.br",
        document: "11111111111",
        role: "EMPLOYEE"
      })
    });
    assert.strictEqual(response.statusCode, 400);
    const body = JSON.parse(response.body);
    assert.strictEqual(body.errorCode, "INVALID_DOCUMENT");
  }

  // Test 10: POST /users - Compensating Saga Rollback (502)
  {
    console.log("Test 10: POST /users - Saga Rollback");
    const response = await handler({
      rawPath: "/users",
      requestContext: { http: { method: "POST" } },
      headers: { authorization: `Bearer ${validEmployeeJwt}` },
      body: JSON.stringify({
        name: "Rodrigo Falha",
        email: "falha@garage.com.br",
        document: "52998224725",
        role: "CUSTOMER"
      })
    });
    assert.strictEqual(response.statusCode, 502);
    const body = JSON.parse(response.body);
    assert.strictEqual(body.errorCode, "REGISTRATION_ROLLBACK");
  }

  // Test 11: POST /users - Admin Creates Employee Success (201)
  {
    console.log("Test 11: POST /users - Admin Creates Employee Success");
    const response = await handler({
      rawPath: "/users",
      requestContext: { http: { method: "POST" } },
      headers: { authorization: `Bearer ${validAdminJwt}` },
      body: JSON.stringify({
        name: "Carlos Atendente",
        email: "carlos@garage.com.br",
        document: "86266070087",
        role: "EMPLOYEE",
        password: "StrongP@ss2026"
      })
    });
    assert.strictEqual(response.statusCode, 201);
    const body = JSON.parse(response.body);
    assert.strictEqual(body.status, 201);
    assert.strictEqual(body.role, "EMPLOYEE");
    assert.strictEqual(body.document, "86266070087");
  }

  // Test 12: POST /users - Attendant Creates Customer Success (201)
  {
    console.log("Test 12: POST /users - Attendant Creates Customer Success");
    const response = await handler({
      rawPath: "/users",
      requestContext: { http: { method: "POST" } },
      headers: { authorization: `Bearer ${validEmployeeJwt}` },
      body: JSON.stringify({
        name: "Rodrigo Cliente",
        email: "rodrigo@fiap.com.br",
        document: "52998224725",
        role: "CUSTOMER",
        password: "CustomerPass123!"
      })
    });
    assert.strictEqual(response.statusCode, 201);
    const body = JSON.parse(response.body);
    assert.strictEqual(body.status, 201);
    assert.strictEqual(body.role, "CUSTOMER");
    assert.strictEqual(body.document, "52998224725");
  }

  console.log("\nAll 12 Auth Lambda tests passed successfully with 100% assertions!");
}

runTests().catch(err => {
  console.error("Test failed:", err);
  process.exit(1);
});
