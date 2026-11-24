function serialize(doc) {
  const o = doc.toObject ? doc.toObject() : { ...doc };
  o.id = String(o._id);
  delete o._id;
  delete o.__v;
  return o;
}

function round2(n) {
  return Math.round(n * 100) / 100;
}

function fail(res, status, code, message) {
  return res.status(status).json({ error: message, code });
}

module.exports = { serialize, round2, fail };
