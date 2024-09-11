import { useState, useEffect, useContext } from 'react';
import { Card, CardContent, Typography, List, ListItem, ListItemText, Divider, ListItemIcon, Collapse } from '@mui/material';
import { ExpandMore, ExpandLess, PlaylistAddCheck } from '@mui/icons-material';
import styles from '../styles/MyOrders.module.css';
import { AuthContext } from "./AuthProvider";
interface Order {
  orderId: string;
  status: string;
  count: number;
  items: string[];
  address: string;
}

const MyOrders = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [expanded, setExpanded] = useState<string[]>([]);
  const loggedInUser = useContext(AuthContext);
  useEffect(() => {
    // Fetch orders specific to the user with id 'globalUser'
    const fetchOrders = async () => {
      try {
        const response = await fetch(`/api/orders/user/${loggedInUser}`);
        if (response.ok) {
          const data = await response.json();
          setOrders(data);

        } else {
          console.error('Failed to fetch orders:', response.statusText);
        }
      } catch (error) {
        console.error('Error fetching orders:', error);
      }
    };

    fetchOrders();
  }, []);

  const handleExpand = (orderId: string) => {
    setExpanded(expanded.includes(orderId) ? expanded.filter(id => id !== orderId) : [...expanded, orderId]);
  };

  return (
    <div className={styles.container}>
      <Typography variant="h4" className={styles.title}>
        My Orders
      </Typography>
      {orders.length > 0 ? (
        <List className={styles.list}>
          {orders.map((order) => (
            <Card key={order.orderId} className={styles.card}>
              <ListItem onClick={() => handleExpand(order.orderId)}>
                <ListItemIcon >
                  <PlaylistAddCheck className={styles.orderIcon} />
                </ListItemIcon>
                <ListItemText className={styles.header} primary={`Order ID: ${order.orderId}`} />
                {expanded.includes(order.orderId) ? <ExpandLess /> : <ExpandMore />}
              </ListItem>
              <Collapse in={expanded.includes(order.orderId)} timeout="auto" unmountOnExit>
                <CardContent>
                  <Typography color="textSecondary" gutterBottom className={styles.status}>
                    Status: {order.status}
                  </Typography>
                  <Divider />
                  <Typography variant="body1" component="p" className={styles.items}>
                    Items ({order.count}):
                  </Typography>
                  <List>
                    {order.items.map((item, index) => (
                      <ListItem key={index}>
                        <ListItemText primary={item} />
                      </ListItem>
                    ))}
                  </List>
                  <Divider />
                  <Typography variant="body2" component="p" className={styles.address}>
                    The order will be shipped to: {order.address}
                  </Typography>
                </CardContent>
              </Collapse>
            </Card>
          ))}
        </List>
      ) : (
        <Typography variant="body1" className={styles.emptyMessage}>
          No orders found.
        </Typography>
      )}
    </div>
  );
};

export default MyOrders;
