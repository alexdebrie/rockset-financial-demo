const rockset = require("@rockset/client");

let client = null;

const getRocksetClient = () => {
  if (client) return client;
  client = rockset.default(
    process.env.ROCKSET_API_KEY,
    "https://api.use1a1.rockset.com"
  );
  return client;
};

module.exports = {
  getRocksetClient,
};
