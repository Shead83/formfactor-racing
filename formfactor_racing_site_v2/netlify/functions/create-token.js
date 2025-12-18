const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const crypto = require("crypto");

function signToken(payload) {
  const header = Buffer.from(JSON.stringify({ alg: "HS256", typ: "FFR" }), "utf8").toString("base64url");
  const body = Buffer.from(JSON.stringify(payload), "utf8").toString("base64url");
  const unsigned = `${header}.${body}`;

  const signature = crypto
    .createHmac("sha256", process.env.TOKEN_SECRET)
    .update(unsigned)
    .digest("base64url");

  return `${unsigned}.${signature}`;
}

exports.handler = async (event) => {
  try {
    const params = event.queryStringParameters || {};
    const sessionId = params.session_id;

    if (!sessionId) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "Missing session_id" }),
      };
    }

    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (session.payment_status !== "paid") {
      return {
        statusCode: 402,
        body: JSON.stringify({ error: "Session is not paid" }),
      };
    }

    const now = Math.floor(Date.now() / 1000);
    const daysValid = 3; // link valid for 3 days

    const payload = {
      sub: session.customer || session.customer_email || session.id,
      plan: "WEEKLY_METRO_TIPS",
      iat: now,
      exp: now + daysValid * 24 * 60 * 60,
    };

    const token = signToken(payload);

    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        token,
        expiresAt: payload.exp,
      }),
    };
  } catch (err) {
    console.error(err);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Internal error" }),
    };
  }
};
