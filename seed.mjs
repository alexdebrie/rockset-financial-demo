import { faker } from "@faker-js/faker";
import axios from "axios";
const ENDPOINT = process.env.ENDPOINT;
const NUM_TRANSACTIONS = 100;

const CATEGORIES = [
  "Advertising",
  "Education and Training",
  "Equipment",
  "Meals and Entertainment",
  "Office Expenses",
  "Software",
  "Subscriptions",
  "Travel",
];

const ORGANIZATIONS = ["Rockset", "Acme Corp.", "Vandelay Industries"];

const generateFakeTransaction = () => {
  return {
    amount: faker.datatype.float({ max: 1000 }),
    merchantName: faker.company.companyName(),
    category: CATEGORIES[Math.floor(CATEGORIES.length * Math.random())],
    transactionTime: faker.date.recent(120),
  };
};

const promises = [];
for (let i = 0; i < NUM_TRANSACTIONS; i++) {
  const organization =
    ORGANIZATIONS[Math.floor(ORGANIZATIONS.length * Math.random())];
  const transaction = generateFakeTransaction();
  const req = axios.post(ENDPOINT, transaction, {
    headers: { Authorization: `Bearer ${organization}` },
  });
  promises.push(req);
}

await Promise.all(promises);
