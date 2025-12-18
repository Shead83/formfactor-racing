const crypto = require("crypto");

function verifyToken(token) {
  if (!token) return null;

  const parts = token.split(".");
  if (parts.length !== 3) return null;

  const [headerB64, payloadB64, signatureB64] = parts;
  const unsigned = `${headerB64}.${payloadB64}`;

  const expectedSig = crypto
    .createHmac("sha256", process.env.TOKEN_SECRET)
    .update(unsigned)
    .digest("base64url");

  const sigBuf = Buffer.from(signatureB64);
  const expectedBuf = Buffer.from(expectedSig);

  if (sigBuf.length !== expectedBuf.length || !crypto.timingSafeEqual(sigBuf, expectedBuf)) {
    return null;
  }

  const payloadJson = Buffer.from(payloadB64, "base64url").toString("utf8");
  const payload = JSON.parse(payloadJson);

  const now = Math.floor(Date.now() / 1000);
  if (payload.exp && payload.exp < now) return null;

  return payload;
}

exports.handler = async (event) => {
  try {
    const params = event.queryStringParameters || {};
    const token = params.token;

    const payload = verifyToken(token);
    if (!payload) {
      return {
        statusCode: 401,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ok: false }),
      };
    }

    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ok: true, payload }),
    };
  } catch (err) {
    console.error(err);
    return {
      statusCode: 500,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ok: false }),
    };
  }
};
