// Importing necessary tools from the react toolbox
import { Routes, Route, NavLink } from 'react-router-dom';
// Importing MUI components for the header UI
import { AppBar, Tooltip, Toolbar, Typography, Container, Badge } from '@mui/material';
import { StoreTwoTone, Logout, ShoppingCartCheckout } from '@mui/icons-material';

// Importing custom components (Catalog, Item, Trolley)

import Catalog from './components/Catalog';
import Trolley from './components/Trolley';
import MyOrders from './components/MyOrders';
import ItemDetail from './components/ItemDetail';

import Chat from "./components/Chat";

// Import CSS modules
import appStyles from "./App.module.css";
import Login from './components/Login';
import { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext, AuthDispatchContext } from "./components/AuthProvider";
import { TrolleyContext } from "./components/TrolleyProvider";
function App() {
  const navigate = useNavigate();
  const loggedInUser = useContext(AuthContext);
  const setLoggedInUser = useContext(AuthDispatchContext);
  const nameUser = localStorage.getItem("name");
  const trolleyItems = useContext(TrolleyContext);

  const handleLogout = async (e: React.FormEvent) => {
    e.preventDefault();
    try {

      const response = await fetch('/api/users/logout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        // Handle successful logout

        if (setLoggedInUser) {
          setLoggedInUser("");
        }
        // Redirect to login page
        navigate('/');
      } else {
        console.error('Failed to logout:');
      }
    } catch (error) {
      // Handle error
      console.error('Failed to logout:', error);
    }
  }
  return (


    <div>

      <AppBar position="static" sx={{ backgroundColor: "#2596be" }}>
        <Toolbar>
          <StoreTwoTone fontSize="large" sx={{ paddingRight: "10px" }} />
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            MilaJo
          </Typography>
          <Chat />

          {loggedInUser && <>
            <p className={appStyles.welcomeMsg}>Hey {nameUser}! Checkout our latest trends.</p>
            <div className={appStyles.trolleyIconContainer}>
              <Badge badgeContent={trolleyItems.reduce((total, item) => total + item.quantity, 0)}
                color="success" overlap="circular" onClick={() => navigate('/trolley')} >
                <ShoppingCartCheckout className={appStyles.trolleyIcon} />
              </Badge></div>
            <NavLink className={({ isActive }) =>
              `${appStyles.menuLink} ${isActive ? appStyles.activeLink : ""}`
            } to="/catalog" >
              Home
            </NavLink>
            <NavLink className={({ isActive }) =>
              `${appStyles.menuLink} ${isActive ? appStyles.activeLink : ""}`
            } to="/trolley">
              Trolley
            </NavLink>
            <NavLink className={({ isActive }) =>
              `${appStyles.menuLink} ${isActive ? appStyles.activeLink : ""}`
            } to="/myorders" >
              My Orders
            </NavLink> <div className={appStyles.btn} >
              <Tooltip title="Logout"><Logout className={appStyles.btnIcon} onClick={handleLogout} />
              </Tooltip></div></>
          }

        </Toolbar>
      </AppBar>
      <Container>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/catalog" element={<Catalog />} />
          <Route path="/item" element={<ItemDetail />} />
          <Route path="/trolley" element={<Trolley />} />
          <Route path="/myorders" element={<MyOrders />} />
        </Routes>
      </Container>
    </div>

  );
}

export default App;
