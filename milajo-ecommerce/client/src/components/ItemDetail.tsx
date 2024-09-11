import { useContext, useEffect, useState } from 'react';
import { Card, CardContent, Typography, Button, Snackbar, Alert, CircularProgress } from '@mui/material';
import AddShoppingCartIcon from '@mui/icons-material/AddShoppingCart';
import styles from '../styles/Detail.module.css';
import ImageMapper from './ImageMapper';
import { useSearchParams } from 'react-router-dom';
// Import Contexts
import { TrolleyContext, TrolleyDispatchContext } from "./TrolleyProvider";

// Product specifications
interface Product {
  id: number;
  title: string;
  desc: string;
  imageName: string;
  price: string;
  quantity: number;
}

function ItemDetail() {
  const [searchParams] = useSearchParams();
  const [product, setProduct] = useState<Product | null>(null);
  const id = searchParams.get('id');

  const trolleyItems = useContext(TrolleyContext);
  const setTrolleyItems = useContext(TrolleyDispatchContext);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState<string>("");

  useEffect(() => {
    if (id) {
   
      // Fetch product by id
      const fetchProduct = async () => {
        try {
          const response = await fetch(`/api/products/${id}`);
          if (response.ok) {
            const data: Product = await response.json();
            const formattedPrice = data.price ? `$${data.price}` : '';
            // Set the product with the formatted price
            setProduct({
              ...data,
              price: formattedPrice,
            });
           
          } else {
            console.error('Failed to fetch product:', response.statusText);
          }
        } catch (error) {
          console.error('Error fetching product:', error);
        }
      };
      fetchProduct();
    }
  }, [id]);

  // Function to add item to trolley
  const addToTrolley = (product: Product) => {
    if (setTrolleyItems) {
      setTrolleyItems(prevItems => {
        const existingItemIndex = prevItems.findIndex(item => item.id === product.id);
        if (existingItemIndex !== -1) {
          // Item already exists, update the quantity
          const updatedItems = [...prevItems];
          if (updatedItems[existingItemIndex].quantity === undefined) {
            updatedItems[existingItemIndex].quantity = 0;
          }
          updatedItems[existingItemIndex].quantity! += 1; // Use non-null assertion here

          setSnackbarMessage(`${product.title} is updated in trolley`);
          setSnackbarOpen(true);
          return updatedItems;
        } else {
          // Item doesn't exist, add it to the trolley
          const newItem = { ...product, quantity: 1 };
          setSnackbarMessage(`${product.title} is added to trolley`);
          setSnackbarOpen(true);
          return [...prevItems, newItem];
        }
      });
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbarOpen(false); // Close snackbar
  };


  if (!product) {
    return <CircularProgress  className={styles.loader}  />
  }

  const { title, desc, imageName, price } = product;

  return (
    <TrolleyContext.Provider value={trolleyItems}>
      <Card className={styles.card} key={product?.id}>
      <div className={styles.imageBox}>  <ImageMapper name={imageName} width="350" height="250" /></div>
    
        <CardContent className={styles.cardContent}>
          <Typography variant="h6" component="div" className={styles.itemTitle}>
            {title}
          </Typography>
          <Typography variant="body2" color="textSecondary" component="p" className={styles.itemDesc}>
            {desc}
          </Typography>
          <Typography variant="h6" component="div" className={styles.price}>
            {price}
          </Typography>
          <Button
            variant="contained"
            className={styles.addButton}
            onClick={() => product && addToTrolley(product)} // Ensure product is not null
            endIcon={<AddShoppingCartIcon />}
          >
            Add
          </Button>
        </CardContent>
      </Card>
      <Snackbar open={snackbarOpen} autoHideDuration={3000} onClose={handleCloseSnackbar} className={styles.snackbar}>
        <Alert variant="filled" onClose={handleCloseSnackbar} severity="success">
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </TrolleyContext.Provider>
  );
}

export default ItemDetail;
