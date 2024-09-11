import { useContext, useState } from 'react';
import { Card, CardContent, Typography, Button, Snackbar, Alert, Link } from '@mui/material';
import AddShoppingCartIcon from '@mui/icons-material/AddShoppingCart';
import styles from '../styles/Item.module.css';
import ImageMapper from './ImageMapper';
import { useNavigate } from 'react-router-dom';
//Import Contexts
import { TrolleyContext, TrolleyDispatchContext } from "./TrolleyProvider";

//product specifications
interface Product {
  id: number;
  title: string;
  desc: string;
  imageName: string;
  price: string;
}

function Item(props: Product) {
  const { id, title, desc, imageName, price } = props;
  const navigate = useNavigate()
  const trolleyItems = useContext(TrolleyContext);
  const setTrolleyItems = useContext(TrolleyDispatchContext);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState<string>("");

  // Function to add item to trolley
  const addToTrolley = (product: Product) => {
    if (setTrolleyItems) {
      setTrolleyItems(prevItems => {
        const existingItemIndex = prevItems.findIndex(item => item.id === product.id);
        if (existingItemIndex !== -1) {
          // Item already exists, update the count
          const updatedItems = [...prevItems];
          updatedItems[existingItemIndex].quantity += 1;
          setSnackbarMessage(`${title} is updated in trolley`);
          setSnackbarOpen(true);
          return updatedItems;
        } else {
          // Item doesn't exist, add it to the trolley
          const newItem = { ...product, quantity: 1 };
          setSnackbarMessage(`${title} is added to trolley`);
          setSnackbarOpen(true);
          return [...prevItems, newItem];
        }
      });
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbarOpen(false); // Close snackbar
  };
  const handleItemRedirection = () => {
   navigate(`/item?id=${id}`);
  };

  return (
    <TrolleyContext.Provider value={trolleyItems}>
      <Card className={styles.card} key={id}>

        <ImageMapper name={imageName} width="350" height="250" />
        <CardContent>
        <Typography variant="h6" component="div">
              {title}
            </Typography>
          <Typography variant="body2" color="textSecondary" component="p" className={styles.itemDesc} >
            {desc}
          </Typography>
          <Typography variant="h6" component="div" className={styles.price}>
            {price}
          </Typography>
          <Link className={styles.linkItem} onClick={handleItemRedirection}>
            See product
          </Link>
          {/* <Button variant="contained"  sx={{backgroundColor:"#2596be"}}
           onClick={() => addToTrolley(props)} endIcon={<AddShoppingCartIcon />}>
            Add
          </Button> */}

        </CardContent>
      </Card>
      <Snackbar open={snackbarOpen} autoHideDuration={3000} onClose={handleCloseSnackbar}>
        <Alert variant="filled" onClose={handleCloseSnackbar} severity="success">
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </TrolleyContext.Provider>
  );
}

export default Item;
