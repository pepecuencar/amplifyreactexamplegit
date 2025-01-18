import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Link, Routes } from 'react-router-dom';
import { S3Client, ListObjectsV2Command } from '@aws-sdk/client-s3';
import 'bootstrap/dist/css/bootstrap.min.css';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080';
const REGION = process.env.REACT_APP_AWS_REGION || 'us-east-1';
const BUCKET_NAME = process.env.REACT_APP_S3_BUCKET_NAME;

// Página de productos
const Products = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch(`${API_URL}/api/products`);
        if (!response.ok) throw new Error('Error fetching products');
        const data = await response.json();
        setProducts(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  if (loading) return <div className="alert alert-info">Loading...</div>;
  if (error) return <div className="alert alert-danger">Error: {error}</div>;

  return (
    <div className="container mt-4">
      <h2>Products</h2>
      <table className="table table-bordered mt-3">
        <thead className="thead-dark">
          <tr>
            <th>ID</th>
            <th>Name</th>
            <th>Price</th>
            <th>Price with Tax</th>
          </tr>
        </thead>
        <tbody>
          {products.map((product) => (
            <tr key={product.id}>
              <td>{product.id}</td>
              <td>{product.name}</td>
              <td>${product.price}</td>
              <td>${product.priceWithTax}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

// Página de objetos S3
const S3Objects = () => {
  const [objects, setObjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchS3Objects = async () => {
      const s3Client = new S3Client({ region: REGION });
      try {
        const command = new ListObjectsV2Command({ Bucket: BUCKET_NAME });
        const response = await s3Client.send(command);
        setObjects(response.Contents || []);
      } catch (err) {
        console.error('Error fetching S3 objects:', err.message);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchS3Objects();
  }, []);

  if (loading) return <div className="alert alert-info">Loading...</div>;
  if (error) return <div className="alert alert-danger">Error: {error}</div>;

  return (
    <div className="container mt-4">
      <h2>S3 Objects</h2>
      <ul className="list-group mt-3">
        {objects.map((obj) => (
          <li key={obj.Key} className="list-group-item">
            {obj.Key} - {obj.Size} bytes
          </li>
        ))}
      </ul>
    </div>
  );
};

// Componente principal con navegación
const App = () => {
  return (
    <Router>
      <div style={{ fontFamily: 'Arial, sans-serif', padding: '20px' }}>
        <div className="navbar navbar-expand-lg navbar-dark bg-dark mb-4">
          <Link to="/" className="navbar-brand">
            My React App
          </Link>
          <div className="navbar-nav">
            <Link to="/products" className="nav-link">
              Products
            </Link>
            <Link to="/s3" className="nav-link">
              S3 Objects
            </Link>
          </div>
        </div>
        <div className="container">
          <Routes>
            <Route path="/products" element={<Products />} />
            <Route path="/s3" element={<S3Objects />} />
            <Route path="/" element={
              <div className="jumbotron">
                <h1 className="display-4">Welcome to My React App</h1>
                <p className="lead">Explore the products or view objects in your S3 bucket.</p>
                <hr className="my-4" />
                <p>Use the navigation bar to access different sections.</p>
              </div>
            } />
          </Routes>
        </div>
      </div>
    </Router>
  );
};

export default App;
