import React, { useState, useContext } from 'react';
import { TextField, Button, Typography, Link, Snackbar, Alert } from '@mui/material';
import styles from '../styles/Login.module.css';
import { AuthDispatchContext } from './AuthProvider';
import { useNavigate } from 'react-router-dom';

interface User {
  username: string;
  password: string;
  name: string;
  email: string;
  address: string;
}

const Login = () => {
  const setLoggedInUser = useContext(AuthDispatchContext);
  const [isSignUp, setIsSignUp] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [snackMessage, setSnackMessage] = useState('');
  const [severity, setSeverity] = useState<"success" | "error" | "info" | "warning" | undefined>("success");
  const navigate = useNavigate();

  const handleCloseSnackbar = () => {
    setOpenSnackbar(false);
    if (severity === "success" && isSignUp) {
      setIsSignUp(!isSignUp);
    }
  }
  const setErrorSnack = (errorMessage: string) => {
    setSnackMessage(errorMessage);
    setSeverity("error");
    setOpenSnackbar(true);
  }
  const validateFields = () => {

    if ((!isSignUp && (!username || !password)) || (isSignUp && (!username || !password || !name || !email || !address))) {
      setSnackMessage("You must fill in all fields");
      setSeverity("error");
      setOpenSnackbar(true);
      return false;
    }
    // Check for valid email if isSignUp is true
    // Regex to validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (isSignUp && !emailRegex.test(email)) {
      setSnackMessage("You must enter a valid email address");
      setSeverity("error");
      setOpenSnackbar(true);
      return false;
    }
    return true;
  };

  const signUp = () => {
    const newUser: User = {
      username,
      password,
      name,
      email,
      address,
    };

    // Make a fetch call to the signup endpoint
    fetch('/api/users/signup', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(newUser),
    })
      .then(response => {
        if (response.ok) {
          return response.json();
        } else {
          setErrorSnack("Failed to sign up. Try again");
        }
      })
      .then(data => {
        if (data.success) {
          setUsername('');
          setPassword('');
          setSnackMessage(data.success);
          setSeverity("success");
          setOpenSnackbar(true);
        }
        else {
          if (data.error) {
            setErrorSnack(data.error);
          }
          else {
            setErrorSnack("Failed to sign up. Try again");
          }

        }
      })
      .catch(error => {
        setErrorSnack("Failed to sign up. Try again");
      });


  }

  const login = async () => {
    try {
      const response = await fetch('/api/users/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });
      if (response.status === 401) {
        setErrorSnack("Incorrect username or password");
        return;
      }
      const data = await response.json();
      console.log(data);
      localStorage.setItem("name", data.name);
      if (response.ok) {
        // Login successful
        if (setLoggedInUser) {
          setLoggedInUser(data.username);
        }
        navigate("/catalog");
      } else {
        setErrorSnack("Login failed");
      }
    } catch (error) {
      setErrorSnack("Login failed");
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateFields()) {
      return;
    }
    isSignUp ? signUp() : login()
  };

  const toggleSignUp = () => {
    setIsSignUp(!isSignUp);
  };

  return (
    <div className={styles.formContainer}>
      <Typography variant="h4" gutterBottom>
        {isSignUp ? 'Sign Up' : 'Login'}
      </Typography>
      <form >
        {isSignUp && (
          <>
            <TextField
              className={styles.inputField}
              label="Name"
              variant="outlined"
              fullWidth
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
            <TextField
              className={styles.inputField}
              label="Email"
              variant="outlined"
              fullWidth
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <TextField
              className={styles.inputField}
              label="Address"
              variant="outlined"
              fullWidth
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              required
            />
          </>
        )}
        <TextField
          className={styles.inputField}
          label="Username"
          variant="outlined"
          fullWidth
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
        />
        <TextField
          className={styles.inputField}
          label="Password"
          type="password"
          variant="outlined"
          fullWidth
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <Button type="submit" variant="contained" color="primary" className={styles.btn} onClick={handleSubmit} fullWidth>
          {isSignUp ? 'Sign Up' : 'Login'}
        </Button>
      </form>
      <Typography variant="body1" className={styles.inputField}>
        {isSignUp ? 'Already have an account? ' : "Not signed up yet? "}
        <Link component="button" variant="body1" onClick={toggleSignUp}>
          {isSignUp ? 'Login now' : 'Sign up now'}
        </Link>
      </Typography>
      <Snackbar open={openSnackbar} autoHideDuration={3000} onClose={handleCloseSnackbar}>
        <Alert onClose={handleCloseSnackbar} severity={severity} variant="filled" >
          {snackMessage}
        </Alert>
      </Snackbar>
    </div>

  );
};

export default Login;
