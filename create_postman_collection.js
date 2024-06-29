const axios = require('axios');

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
        path: url.split('/')
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

// Main function to create the collection and add requests
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
      'Delete Order': ['DELETE', '/api/orders/:id', {}]
    };

    for (const [name, [method, url, body]] of Object.entries(endpoints)) {
      await addRequestToCollection(collectionId, name, method, url, body);
    }

    console.log('All endpoints added successfully!');

    // Here you can add the code to install and use Postman CLI if needed.
  } catch (error) {
    console.error('Error:', error.response ? error.response.data : error.message);
  }
}

// Run the main function
main();
