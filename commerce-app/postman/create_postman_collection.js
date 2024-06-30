const axios = require('axios');
const { exec } = require('child_process');

// Replace these variables with your actual values
const API_KEY = 'YOUR_POSTMAN_API_KEY';
const WORKSPACE_ID = 'aenzbi';
const COLLECTION_NAME = 'Commerce API';
const BASE_URL = 'https://api.getpostman.com';
const API_LINT_ID = 'YOUR_API_LINT_ID'; // Replace with your actual API ID for linting

// Function to create a collection
async function createCollection(collectionName) {
  const collectionPayload = {
    collection: {
      info: {
        name: collectionName,
        schema: 'https://schema.getpostman.com/json/collection/v2.1.0/collection.json'
      }
    }
  };

  const response = await axios.post(`${BASE_URL}/collections`, collectionPayload, {
    headers: {
      'X-Api-Key': API_KEY,
      'Content-Type': 'application/json'
    }
  });

  return response.data.collection.id;
}

// Function to add requests to the collection
async function addRequestToCollection(collectionId, requestName, method, url, body, headers = []) {
  const requestPayload = {
    request: {
      method: method,
      header: headers,
      body: { mode: 'raw', raw: JSON.stringify(body) },
      url: {
        raw: url,
        protocol: 'http',
        host: ['localhost'],
        path: url.split('/').filter(Boolean)
      }
    },
    name: requestName
  };

  await axios.post(`${BASE_URL}/collections/${collectionId}`, { collection: { item: [requestPayload] } }, {
    headers: {
      'X-Api-Key': API_KEY,
      'Content-Type': 'application/json'
    }
  });
}

// Function to install Postman CLI
function installPostmanCLI() {
  return new Promise((resolve, reject) => {
    exec('curl -o- "https://dl-cli.pstmn.io/install/linux64.sh" | sh', (error, stdout, stderr) => {
      if (error) {
        reject(`Error installing Postman CLI: ${error.message}`);
        return;
      }
      if (stderr) {
        console.error(`stderr: ${stderr}`);
        return;
      }
      resolve(stdout);
    });
  });
}

// Function to login to Postman CLI
function postmanLogin(apiKey) {
  return new Promise((resolve, reject) => {
    exec(`postman login --with-api-key ${apiKey}`, (error, stdout, stderr) => {
      if (error) {
        reject(`Error logging in to Postman CLI: ${error.message}`);
        return;
      }
      if (stderr) {
        console.error(`stderr: ${stderr}`);
        return;
      }
      resolve(stdout);
    });
  });
}

// Function to run the collection using Postman CLI
function runCollection(collectionId) {
  return new Promise((resolve, reject) => {
    exec(`postman collection run ${collectionId}`, (error, stdout, stderr) => {
      if (error) {
        reject(`Error running collection: ${error.message}`);
        return;
      }
      if (stderr) {
        console.error(`stderr: ${stderr}`);
        return;
      }
      resolve(stdout);
    });
  });
}

// Function to lint the API using Postman CLI
function lintAPI(apiLintId) {
  return new Promise((resolve, reject) => {
    exec(`postman api lint ${apiLintId}`, (error, stdout, stderr) => {
      if (error) {
        reject(`Error linting API: ${error.message}`);
        return;
      }
      if (stderr) {
        console.error(`stderr: ${stderr}`);
        return;
      }
      resolve(stdout);
    });
  });
}

// Main function to create the collection, add requests, and run the collection
async function main() {
  try {
    const collectionId = await createCollection(COLLECTION_NAME);
    console.log(`Collection created successfully with ID: ${collectionId}`);

    const endpoints = {
      'Register User': ['POST', '/api/auth/register', { username: 'example', password: 'password123' }],
      'Login User': ['POST', '/api/auth/login', { username: 'example', password: 'password123' }],
      'Logout User': ['POST', '/api/auth/logout', {}],
      'Get All Products': ['GET', '/api/products', {}],
      'Get Product by ID': ['GET', '/api/products/:id', {}],
      'Create Product': ['POST', '/api/products', { name: 'New Product', price: 100.0 }],
      'Update Product': ['PUT', '/api/products/:id', { name: 'Updated Product', price: 150.0 }],
      'Delete Product': ['DELETE', '/api/products/:id', {}],
      'Get All Orders': ['GET', '/api/orders', {}],
      'Get Order by ID': ['GET', '/api/orders/:id', {}],
      'Create Order': ['POST', '/api/orders', { product_id: 1, quantity: 2 }],
      'Update Order': ['PUT', '/api/orders/:id', { status: 'shipped' }],
      'Delete Order': ['DELETE', '/api/orders/:id', {}],
      // Retail POS endpoints
      'Retail POS - Start Transaction': ['POST', '/api/retail/pos/start', { transaction_id: 'tx123' }],
      'Retail POS - Add Item': ['POST', '/api/retail/pos/add-item', { transaction_id: 'tx123', product_id: 1, quantity: 2 }],
      'Retail POS - Complete Transaction': ['POST', '/api/retail/pos/complete', { transaction_id: 'tx123', payment_method: 'card' }],
      // Restaurant POS endpoints
      'Restaurant POS - Create Order': ['POST', '/api/restaurant/pos/create-order', { table_id: 1, items: [{ product_id: 1, quantity: 2 }] }],
      'Restaurant POS - Update Order': ['PUT', '/api/restaurant/pos/update-order/:order_id', { items: [{ product_id: 1, quantity: 3 }] }],
      'Restaurant POS - Close Order': ['POST', '/api/restaurant/pos/close-order', { order_id: 'order123', payment_method: 'cash' }]
    };

    for (const [name, [method, url, body]] of Object.entries(endpoints)) {
      await addRequestToCollection(collectionId, name, method, url, body);
    }

    console.log('All endpoints added successfully!');

    // Install Postman CLI
    await installPostmanCLI();
    console.log('Postman CLI installed successfully!');

    // Login to Postman CLI
    await postmanLogin(API_KEY);
    console.log('Logged in to Postman CLI successfully!');

    // Run the created collection
    const runResult = await runCollection(collectionId);
    console.log('Collection run result:', runResult);

    // Perform API linting
    const lintResult = await lintAPI(API_LINT_ID);
    console.log('API lint result:', lintResult);

  } catch (error) {
    console.error('Error:', error);
  }
}

// Run the main function
main();
