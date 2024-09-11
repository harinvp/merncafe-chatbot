//Import MUI component/s
import { Grid } from '@mui/material';

//Import Item component
import Item from './Item';

// Import CSS modules
import styles from "../styles/Catalog.module.css";

import { useNavigate } from 'react-router-dom';
import { useEffect, useState, useContext } from 'react';
import { TrolleyContext } from "./TrolleyProvider";

interface Product {
  _id: number;
  id:number;         
  title: string;      
  desc: string;  
  imageName: string;   
  price: number;        
  category?: string;   
  stock?: number;      
  
}



function Catalog() {

  const navigate = useNavigate();
  const trolleyItems = useContext(TrolleyContext);
  console.log(trolleyItems)
  const [products, setProducts] = useState<Product[]>([]);
  useEffect(() => {
    // Fetch orders specific to the user with id 'globalUser'
    const fetchProducts = async () => {
      try {
        const response = await fetch(`/api/products/all`);
        if (response.ok) {
          const data = await response.json();
          setProducts(data);
          localStorage.setItem("products", JSON.stringify(data));

        } else {
          console.error('Failed to fetch products:', response.statusText);
        }
      } catch (error) {
        console.error('Error fetching products:', error);
      }
    };
    const localproducts = localStorage.getItem("products");
    localproducts? setProducts(JSON.parse(localproducts)):fetchProducts();
  }, []);
  return (
    <>
   
      <Grid container className={styles.catalogContainer} spacing={2} rowGap={2}>
        {products.map((product) => (
          <Grid item key={product.id} xs={6} sm={3} md={4}>
            <Item
              id={product.id}
              title={product.title}
              desc={product.desc}
              imageName={product.imageName}
              price={`$${product.price.toString()}`}
            />
          </Grid>
        ))}
      </Grid>
     
    </>
  );
}

export default Catalog;
