import React, {useState} from 'react';
import { useNavigate } from "react-router-dom";
import { validateEmail, validatePassword } from '../../utils/inputValidations';

import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import CssBaseline from '@mui/material/CssBaseline';
import TextField from '@mui/material/TextField';
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';
import Link from '@mui/material/Link';
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import Copyright from '../common/Footer';
import AppAppBar from '../landing/components/AppAppBar';
import { CreateAccount } from '../../utils/userAuth';
import useAuth from '../../hooks/useAuth';
import { UserSignUpRequest } from '../../types/user';

// TODO remove, this demo shouldn't need to reset the theme.

const defaultTheme = createTheme();

export default function SignUpV2Page() {
  const { signup, loading, error } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [emailError, setEmailError] = useState("")
  const [passwordError, setPasswordError] = useState("")
  const [signupError, setSignupError] = useState("")
  const [signupMessage, setSignupMessage] = useState("")

  const emailChange = (event) => {
    event.preventDefault();
    const input = event.target.value;
    setEmail(input)
    setEmailError("");
    const validation = validateEmail(input)

    if (validation.isBlank) {
      return
    }
    setEmailError(validation.message);
  }

  const passwordChange = (event) => {
    event.preventDefault();
    const input = event.target.value;
    setPassword(input)
    setPasswordError("");
    const validation = validatePassword(input);
    if (validation.isBlank) {
      return
    }
    setPasswordError(validation.message);
  }

  const handleSubmit = (event) => {
    event.preventDefault();

    setSignupError("");
    setSignupMessage("");
    const data = new FormData(event.currentTarget);

    const userProfile = {
      email: data.get('email'),
      password: data.get('password'),
      firstName: data.get('firstName'),
      lastNameName: data.get('lastName')
    }

    
    console.log('User profile ' + JSON.stringify(userProfile));

    const signupRequest: UserSignUpRequest = {
        firstName: data.get('firstName') as string,
        lastName: data.get('lastName') as string,
        email: email,
        password: password
        // receiveEmails: boolean; TODO
    }

    signup(signupRequest, () => {
        navigate('/signin');
    });

  };



  return (
    <ThemeProvider theme={defaultTheme}>
      <AppAppBar />
      <Container component="main" maxWidth="xs">
        <CssBaseline />
        <Box
          sx={{
            marginTop: 8,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}
        >
          <Avatar sx={{ m: 1, bgcolor: 'secondary.main' }}>
            <LockOutlinedIcon />
          </Avatar>
          <Typography component="h1" variant="h5">
            Sign up
          </Typography>
          <Box component="form" noValidate onSubmit={handleSubmit} sx={{ mt: 3 }}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  autoComplete="given-name"
                  name="firstName"
                  required
                  fullWidth
                  id="firstName"
                  label="First Name"
                  autoFocus
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  required
                  fullWidth
                  id="lastName"
                  label="Last Name"
                  name="lastName"
                  autoComplete="family-name"
                />
              </Grid>
              <Grid item xs={12}>
                <TextField margin="normal" required fullWidth autoFocus autoComplete="email"
                  id="email" 
                  label="Email Address" 
                  name="email" 
                  value={email} 
                  onChange={emailChange}
                  error={emailError? true : false}
                  helperText={emailError ? "Invalid Email :" + emailError : ""}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField margin="normal" required fullWidth autoComplete="current-password"
                  id="password" 
                  label="Password" 
                  name="password" 
                  type="password" 
                  value={password} 
                  onChange={passwordChange}
                  error={passwordError? true : false}
                  helperText={passwordError ? "Invalid Password :" + passwordError : ""}
                />
              </Grid>
              <Grid item xs={12}>
                <FormControlLabel
                  control={<Checkbox value="allowExtraEmails" color="primary" />}
                  label="I want to receive inspiration, marketing promotions and updates via email."
                />
              </Grid>
            </Grid>
            <Button
              type="submit"
              disabled={loading}
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2 }}
            >
              Sign Up
            </Button>
            {error && <p>Sign up error! {error}</p>}
            {signupError && <p>Failed: {signupError}</p>}
            {signupMessage && <p>Successfully signed up {signupMessage}</p>}
            <Grid container justifyContent="flex-end">
              <Grid item>
                <Link href="/signin" variant="body2">
                  Already have an account? Sign in
                </Link>
              </Grid>
            </Grid>
          </Box>
        </Box>
        <Copyright sx={{ mt: 5 }} />
      </Container>
    </ThemeProvider>
  );
}